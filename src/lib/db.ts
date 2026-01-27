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
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wishlists (
    id TEXT PRIMARY KEY,
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

  CREATE TABLE IF NOT EXISTS followed_wishlists (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    wishlist_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
    UNIQUE(user_id, wishlist_id)
  );
`);

// Migrate existing wishlists to add user_id if not present
const checkColumn = db.prepare("PRAGMA table_info(wishlists)").all() as Array<{ name: string }>;
if (!checkColumn.find(col => col.name === "user_id")) {
  db.exec(`
    ALTER TABLE wishlists ADD COLUMN user_id TEXT NOT NULL DEFAULT 'anonymous';
  `);
}

// Migrate users table to add avatar fields
const checkUserColumns = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
if (!checkUserColumns.find(col => col.name === "avatar_url")) {
  db.exec(`
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
    ALTER TABLE users ADD COLUMN name TEXT;
  `);
}

// Migrate wishlists table to add is_private flag
const checkWishlistColumns = db.prepare("PRAGMA table_info(wishlists)").all() as Array<{ name: string }>;
if (!checkWishlistColumns.find(col => col.name === "is_private")) {
  db.exec(`
    ALTER TABLE wishlists ADD COLUMN is_private INTEGER DEFAULT 0;
  `);
}

// Migrate wish_items table to add quantity and importance fields
const checkItemColumns = db.prepare("PRAGMA table_info(wish_items)").all() as Array<{ name: string }>;
if (!checkItemColumns.find(col => col.name === "quantity")) {
  db.exec(`
    ALTER TABLE wish_items ADD COLUMN quantity INTEGER DEFAULT 1;
  `);
}
if (!checkItemColumns.find(col => col.name === "importance")) {
  db.exec(`
    ALTER TABLE wish_items ADD COLUMN importance TEXT DEFAULT 'would-love';
  `);
}
if (!checkItemColumns.find(col => col.name === "currency")) {
  db.exec(`
    ALTER TABLE wish_items ADD COLUMN currency TEXT DEFAULT 'EUR';
  `);
}

// Migrate users table to add preferred_currency
if (!checkUserColumns.find(col => col.name === "preferred_currency")) {
  db.exec(`
    ALTER TABLE users ADD COLUMN preferred_currency TEXT DEFAULT 'EUR';
  `);
}

// Migrate wish_items table to add purchased_quantity
if (!checkItemColumns.find(col => col.name === "purchased_quantity")) {
  db.exec(`
    ALTER TABLE wish_items ADD COLUMN purchased_quantity INTEGER DEFAULT 0;
  `);
}

// Migrate users table to add email verification fields
if (!checkUserColumns.find(col => col.name === "email_verified")) {
  db.exec(`
    ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;
    ALTER TABLE users ADD COLUMN email_verified_at INTEGER;
    ALTER TABLE users ADD COLUMN verification_token TEXT;
    ALTER TABLE users ADD COLUMN verification_token_expires INTEGER;
  `);
}

// Create indexes after migration
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
  CREATE INDEX IF NOT EXISTS idx_wish_items_wishlist_id ON wish_items(wishlist_id);
  CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
  CREATE INDEX IF NOT EXISTS idx_followed_wishlists_user_id ON followed_wishlists(user_id);
  CREATE INDEX IF NOT EXISTS idx_followed_wishlists_wishlist_id ON followed_wishlists(wishlist_id);
`);

export default db;
