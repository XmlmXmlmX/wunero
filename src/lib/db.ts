import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = process.env.DB_PATH || './data';
const DB_FILE = path.join(DB_DIR, 'wunero.db');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_FILE);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS wishlists (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wish_items (
    id TEXT PRIMARY KEY,
    wishlist_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    image_url TEXT,
    price TEXT,
    priority INTEGER DEFAULT 0,
    purchased INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_wish_items_wishlist_id ON wish_items(wishlist_id);
  CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
`);

// Migrate existing wishlists to add user_id if not present
const checkColumn = db.prepare("PRAGMA table_info(wishlists)").all() as Array<{ name: string }>;
if (!checkColumn.find(col => col.name === "user_id")) {
  db.exec(`ALTER TABLE wishlists ADD COLUMN user_id TEXT NOT NULL DEFAULT 'anonymous';`);
}

export default db;
