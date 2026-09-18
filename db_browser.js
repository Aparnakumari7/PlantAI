import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'backend/database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  
  console.log('✅ Database opened successfully!');
  console.log(`📁 Database: ${dbPath}`);
  console.log('='.repeat(60));
  
  // Show tables
  db.all(`SELECT name FROM sqlite_master WHERE type='table'`, [], (err, tables) => {
    if (err) {
      console.error('Error getting tables:', err.message);
      db.close();
      return;
    }
    
    console.log('\n📋 TABLES:');
    tables.forEach(table => {
      console.log(`  • ${table.name}`);
    });
    
    // Show users table
    console.log('\n👥 USERS TABLE:');
    db.all(`SELECT * FROM users`, [], (err, rows) => {
      if (err) {
        console.error('Error getting users:', err.message);
      } else {
        console.log(`Total users: ${rows.length}`);
        rows.forEach(user => {
          console.log(`  ID ${user.id}: ${user.username} (${user.email}) - Admin: ${user.is_admin === 1 ? 'Yes' : 'No'}`);
        });
      }
      
      // Show predictions table
      console.log('\n🌱 PREDICTIONS TABLE:');
      db.all(`SELECT COUNT(*) as count FROM predictions`, [], (err, row) => {
        if (err) {
          console.error('Error getting predictions count:', err.message);
        } else {
          console.log(`Total predictions: ${row[0].count}`);
          
          // Show recent predictions
          db.all(`SELECT * FROM predictions ORDER BY timestamp DESC LIMIT 5`, [], (err, rows) => {
            if (err) {
              console.error('Error getting recent predictions:', err.message);
            } else {
              rows.forEach(prediction => {
                console.log(`  ID ${prediction.id}: ${prediction.plant_name || 'Unknown'} - ${prediction.is_healthy ? 'Healthy' : 'Diseased'} (${prediction.disease_name || 'No disease'})`);
              });
            }
            
            console.log('\n📊 COMMANDS YOU CAN RUN:');
            console.log('  .tables                         - Show all tables');
            console.log('  SELECT * FROM users;           - Show all users');
            console.log('  SELECT * FROM predictions;    - Show all predictions');
            console.log('  .schema users                  - Show users table structure');
            console.log('  .schema predictions            - Show predictions table structure');
            console.log('  .quit                          - Exit');
            
            db.close();
            console.log('\n🔗 To use SQLite CLI, download from: https://www.sqlite.org/download.html');
          });
        }
      });
    });
  });
});