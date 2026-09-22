import pg from 'pg';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read SQLite database
const sqlitePath = path.resolve(__dirname, 'database.sqlite');
const sqliteDb = new Database(sqlitePath);

// Connect to PostgreSQL
const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERROR: DATABASE_URL environment variable not set');
  process.exit(1);
}

const client = new Client({ connectionString });

async function migrate() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    await client.query(`
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
    console.log('✓ Predictions table created');

    // Migrate data from SQLite
    const users = sqliteDb.prepare('SELECT * FROM users').all();
    console.log(`\nMigrating ${users.length} users...`);
    
    for (const user of users) {
      await client.query(
        'INSERT INTO users (id, username, email, password, is_admin, created_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
        [user.id, user.username, user.email, user.password, user.is_admin, user.created_at]
      );
    }
    console.log('✓ Users migrated');

    const predictions = sqliteDb.prepare('SELECT * FROM predictions').all();
    console.log(`Migrating ${predictions.length} predictions...`);
    
    for (const pred of predictions) {
      await client.query(
        'INSERT INTO predictions (id, user_id, plant_name, is_healthy, plant_confidence, disease_name, treatment, image_path, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING',
        [pred.id, pred.user_id, pred.plant_name, pred.is_healthy, pred.plant_confidence, pred.disease_name, pred.treatment, pred.image_path, pred.timestamp]
      );
    }
    console.log('✓ Predictions migrated');

    console.log('\n✅ Migration completed successfully!');
    sqliteDb.close();
    await client.end();
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
