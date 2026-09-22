import pg from 'pg';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const usingSQLite = !process.env.DATABASE_URL;

let db;

if (isProduction || process.env.DATABASE_URL) {
  // Use PostgreSQL in production or if DATABASE_URL is set
  const { Pool } = pg;
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false
  });

  db = {
    prepare: (sql) => {
      return {
        run: async (...params) => {
          try {
            const result = await pool.query(sql, params);
            return { changes: result.rowCount, lastInsertRowid: result.rows[0]?.id };
          } catch (err) {
            throw err;
          }
        },
        get: async (...params) => {
          try {
            const result = await pool.query(sql, params);
            return result.rows[0];
          } catch (err) {
            throw err;
          }
        },
        all: async (...params) => {
          try {
            const result = await pool.query(sql, params);
            return result.rows;
          } catch (err) {
            throw err;
          }
        }
      };
    },
    exec: async (sql) => {
      try {
        await pool.query(sql);
      } catch (err) {
        throw err;
      }
    }
  };

  console.log('Using PostgreSQL database (Render)');
} else {
  // Use SQLite locally
  const dbPath = path.resolve(__dirname, 'database.sqlite');
  const sqlite = new Database(dbPath);

  db = {
    prepare: (sql) => sqlite.prepare(sql),
    exec: (sql) => sqlite.exec(sql)
  };

  console.log('Using SQLite database (Local development)');
}

// Initialize database schema
async function initializeDb() {
  try {
    if (typeof db.exec === 'function' && !isProduction) {
      // SQLite - use synchronous exec
      db.exec(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      try {
        db.exec(`ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0`);
      } catch (e) {
        // Column already exists
      }

      db.exec(`CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        plant_name TEXT,
        is_healthy BOOLEAN,
        plant_confidence REAL,
        disease_name TEXT,
        treatment TEXT,
        image_path TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);
    } else if (isProduction || process.env.DATABASE_URL) {
      // PostgreSQL
      await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          is_admin BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.exec(`
        CREATE TABLE IF NOT EXISTS predictions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          plant_name TEXT,
          is_healthy BOOLEAN,
          plant_confidence REAL,
          disease_name TEXT,
          treatment TEXT,
          image_path TEXT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);
    }
    console.log('✓ Database schema initialized');
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
}

await initializeDb();
export default db;
