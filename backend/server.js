import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

const corsOptions = {
  origin: process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : function(origin, callback) { callback(null, true); },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime(), environment: process.env.NODE_ENV || 'development' });
});

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

const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) return res.status(403).json({ error: 'Admin access required' });
  next();
};

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'All fields are required.' });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let result;
    try {
      result = db.prepare('INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, 0)').run(username, email, hashedPassword);
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) return res.status(400).json({ error: 'Username or email already exists.' });
      return res.status(500).json({ error: 'Registration failed.' });
    }
    const token = jwt.sign({ id: result.lastInsertRowid, username, is_admin: 0 }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: result.lastInsertRowid, username, email, is_admin: 0 } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!row) return res.status(400).json({ error: 'Invalid username or password' });
    const isMatch = await bcrypt.compare(password, row.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid username or password' });
    const token = jwt.sign({ id: row.id, username: row.username, is_admin: row.is_admin }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: row.id, username: row.username, email: row.email, is_admin: row.is_admin } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  try {
    const row = db.prepare('SELECT id, username, email, is_admin FROM users WHERE id = ?').get(req.user.id);
    if (!row) return res.status(401).json({ error: 'Session expired' });
    res.json({ user: row });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = db.prepare('SELECT COUNT(*) as total_users FROM users').get();
    const preds = db.prepare('SELECT COUNT(*) as total_predictions, SUM(CASE WHEN is_healthy = 1 THEN 1 ELSE 0 END) as healthy, SUM(CASE WHEN is_healthy = 0 THEN 1 ELSE 0 END) as diseased FROM predictions').get();
    res.json({ total_users: users.total_users || 0, total_predictions: preds.total_predictions || 0, healthy_plants: preds.healthy || 0, diseased_plants: preds.diseased || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/admin/predictions', authenticateToken, requireAdmin, (req, res) => {
  try {
    const rows = db.prepare('SELECT p.*, u.username, u.email FROM predictions p JOIN users u ON p.user_id = u.id ORDER BY p.timestamp DESC LIMIT 50').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch global history' });
  }
});

app.delete('/api/admin/predictions/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM predictions WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

app.get('/api/user/profile', authenticateToken, (req, res) => {
  try {
    const row = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!row) return res.status(500).json({ error: 'User not found' });
    const predictions = db.prepare('SELECT is_healthy FROM predictions WHERE user_id = ?').all(req.user.id);
    const healthyCount = predictions.filter(p => p.is_healthy).length;
    const diseasedCount = predictions.filter(p => !p.is_healthy).length;
    res.json({ user: row, stats: { total_predictions: predictions.length, healthy_plants: healthyCount, diseased_plants: diseasedCount } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/history', authenticateToken, (req, res) => {
  const { plant_name, is_healthy, plant_confidence, disease_name, treatment, image_path } = req.body;
  try {
    const result = db.prepare('INSERT INTO predictions (user_id, plant_name, is_healthy, plant_confidence, disease_name, treatment, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)').run(req.user.id, plant_name, is_healthy, plant_confidence, disease_name, treatment, image_path);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save prediction' });
  }
});

app.get('/api/history', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM predictions WHERE user_id = ? ORDER BY timestamp DESC').all(req.user.id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.delete('/api/history/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM predictions WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Record not found or unauthorized' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
