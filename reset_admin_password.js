import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'backend/database.sqlite');

async function resetAdminPassword(newPassword) {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      return;
    }
    
    console.log('Connected to SQLite database');
    
    // Hash the new password
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password:', err.message);
        db.close();
        return;
      }
      
      // Update the admin password
      db.run(
        `UPDATE users SET password = ? WHERE username = 'admin'`,
        [hashedPassword],
        function(err) {
          if (err) {
            console.error('Error updating password:', err.message);
          } else if (this.changes === 0) {
            console.log('No admin account found to update.');
          } else {
            console.log(`✅ Admin password reset successfully!`);
            console.log(`New password: ${newPassword}`);
            console.log(`Hashed password stored: ${hashedPassword.substring(0, 20)}...`);
          }
          
          db.close();
        }
      );
    });
  });
}

// Reset to "admin123" as new password
resetAdminPassword('admin123');