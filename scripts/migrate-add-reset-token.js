/**
 * Migration: Add reset_token fields to users table
 * Run with: node scripts/migrate-add-reset-token.js
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || './data';
const dbFile = path.join(dbPath, 'wunero.db');

console.log(`Migrating database: ${dbFile}`);

const db = new Database(dbFile);

try {
  // Check if columns already exist
  const tableInfo = db.pragma('table_info(users)');
  const hasResetToken = tableInfo.some(col => col.name === 'reset_token');
  
  if (hasResetToken) {
    console.log('✓ Columns already exist, no migration needed');
    process.exit(0);
  }

  // Add new columns
  db.exec(`
    ALTER TABLE users ADD COLUMN reset_token TEXT;
    ALTER TABLE users ADD COLUMN reset_token_expires INTEGER;
  `);

  console.log('✓ Successfully added reset_token columns to users table');
  console.log('  - reset_token TEXT');
  console.log('  - reset_token_expires INTEGER');
} catch (error) {
  console.error('✗ Migration failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
