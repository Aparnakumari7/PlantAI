import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new Database(dbPath);

console.log('Connected to the SQLite database.');

// Create Users Table
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Add is_admin column if missing (safe migration)
try {
  db.exec(`ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0`);
} catch (e) {
  // Column already exists, ignore
}

// Create Predictions Table
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

export default db;
