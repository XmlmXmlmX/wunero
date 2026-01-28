import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { Database as PostgresDatabase } from './db-postgres';

// Check if Postgres connection is configured
const usePostgres = !!process.env.POSTGRES_URL;

let dbInstance: Database.Database | PostgresDatabase;
let initPromise: Promise<void> | null = null;

async function initializeDatabase() {
  if (usePostgres) {
    // Use Vercel Postgres
    const { createPostgresAdapter } = await import('./db-postgres');
    dbInstance = await createPostgresAdapter();
    console.log('✓ Using Vercel Postgres');
  } else {
    // Use SQLite
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    const DB_DIR = isServerless ? '/tmp' : (process.env.DB_PATH || './data');
    const DB_FILE = path.join(DB_DIR, 'wunero.db');

    // Ensure database directory exists
    if (!isServerless && !fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    dbInstance = new Database(DB_FILE);
    dbInstance.pragma('foreign_keys = ON');

    // Initialize schema
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        avatar_url TEXT,
        name TEXT,
        preferred_currency TEXT DEFAULT 'EUR',
        email_verified INTEGER DEFAULT 0,
        email_verified_at INTEGER,
        verification_token TEXT,
        verification_token_expires INTEGER
      );

      CREATE TABLE IF NOT EXISTS wishlists (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        user_id TEXT NOT NULL DEFAULT 'anonymous',
        is_private INTEGER DEFAULT 0
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
        quantity INTEGER DEFAULT 1,
        importance TEXT DEFAULT 'would-love',
        currency TEXT DEFAULT 'EUR',
        purchased_quantity INTEGER DEFAULT 0,
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

    // Create indexes
    dbInstance.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
      CREATE INDEX IF NOT EXISTS idx_wish_items_wishlist_id ON wish_items(wishlist_id);
      CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
      CREATE INDEX IF NOT EXISTS idx_followed_wishlists_user_id ON followed_wishlists(user_id);
      CREATE INDEX IF NOT EXISTS idx_followed_wishlists_wishlist_id ON followed_wishlists(wishlist_id);
    `);

    console.log('✓ Using SQLite at', DB_FILE);
  }
}

// Lazy initialization
async function getDb() {
  if (!initPromise) {
    initPromise = initializeDatabase();
  }
  await initPromise;
  return dbInstance;
}

// Export a proxy that handles async initialization transparently
export default new Proxy({} as Database.Database, {
  get(target, prop) {
    return function (...args: unknown[]) {
      return getDb().then((db) => {
        const method = (db as Record<string, unknown>)[prop];
        if (typeof method === 'function') {
          const result = (method as (...arg: unknown[]) => unknown).apply(db, args);
          // Handle async Postgres methods
          return result;
        }
        return method;
      });
    };
  },
}) as Database.Database;
