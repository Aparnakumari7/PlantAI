import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'super-secret-key'; // in real app, use environment variables

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Helper middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

/* ─── Auth Endpoints ─── */
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = username.toLowerCase() === 'admin' ? 1 : 0;
    const query = `INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)`;
    
    db.run(query, [username, email, hashedPassword, isAdmin], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username or email already exists.' });
        }
        return res.status(500).json({ error: 'Registration failed.' });
      }
      
      // Auto-login after registration
      const token = jwt.sign({ id: this.lastID, username, is_admin: isAdmin }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: this.lastID, username, email, is_admin: isAdmin } });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, row) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (!row) return res.status(400).json({ error: 'Invalid username or password' });

    const isMatch = await bcrypt.compare(password, row.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid username or password' });

    const token = jwt.sign({ id: row.id, username: row.username, is_admin: row.is_admin }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: row.id, username: row.username, email: row.email, is_admin: row.is_admin } });
  });
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  db.get(`SELECT id, username, email, is_admin FROM users WHERE id = ?`, [req.user.id], (err, row) => {
    if (err || !row) return res.status(401).json({ error: 'Session expired' });
    res.json({ user: row });
  });
});

/* ─── Admin Endpoints ─── */
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) return res.status(403).json({ error: 'Admin access required' });
  next();
};

app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  const stats = {};
  db.get(`SELECT COUNT(*) as total_users FROM users`, [], (err, row) => {
    stats.total_users = row?.total_users || 0;
    db.get(`SELECT COUNT(*) as total_predictions, SUM(CASE WHEN is_healthy = 1 THEN 1 ELSE 0 END) as healthy, SUM(CASE WHEN is_healthy = 0 THEN 1 ELSE 0 END) as diseased FROM predictions`, [], (err, pRow) => {
      stats.total_predictions = pRow?.total_predictions || 0;
      stats.healthy_plants = pRow?.healthy || 0;
      stats.diseased_plants = pRow?.diseased || 0;
      res.json(stats);
    });
  });
});

app.get('/api/admin/predictions', authenticateToken, requireAdmin, (req, res) => {
  const query = `
    SELECT p.*, u.username, u.email 
    FROM predictions p 
    JOIN users u ON p.user_id = u.id 
    ORDER BY p.timestamp DESC LIMIT 50
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch global history' });
    res.json(rows);
  });
});

app.get('/api/user/profile', authenticateToken, (req, res) => {
  db.get(`SELECT id, username, email, created_at FROM users WHERE id = ?`, [req.user.id], (err, row) => {
    if (err || !row) return res.status(500).json({ error: 'User not found' });
    
    // Get stats
    db.all(`SELECT is_healthy FROM predictions WHERE user_id = ?`, [req.user.id], (err, predictions) => {
      let healthyCount = 0;
      let diseasedCount = 0;
      
      if (predictions) {
        predictions.forEach(p => {
          if (p.is_healthy) healthyCount++;
          else diseasedCount++;
        });
      }
      
      res.json({
        user: row,
        stats: {
          total_predictions: (predictions && predictions.length) || 0,
          healthy_plants: healthyCount,
          diseased_plants: diseasedCount
        }
      });
    });
  });
});

/* ─── History Endpoints ─── */
app.post('/api/history', authenticateToken, (req, res) => {
  const { plant_name, is_healthy, plant_confidence, disease_name, treatment, image_path } = req.body;
  
  const query = `
    INSERT INTO predictions (user_id, plant_name, is_healthy, plant_confidence, disease_name, treatment, image_path)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [req.user.id, plant_name, is_healthy, plant_confidence, disease_name, treatment, image_path], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to save prediction' });
    res.json({ success: true, id: this.lastID });
  });
});

app.get('/api/history', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM predictions WHERE user_id = ? ORDER BY timestamp DESC`, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch history' });
    res.json(rows);
  });
});

app.delete('/api/history/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM predictions WHERE id = ? AND user_id = ?`, [id, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to delete record' });
    if (this.changes === 0) return res.status(404).json({ error: 'Record not found or unauthorized' });
    res.json({ success: true });
  });
});

app.delete('/api/admin/predictions/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM predictions WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to delete record' });
    if (this.changes === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
