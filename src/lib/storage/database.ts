/**
 * Common database interface
 * Both SQLite and Postgres adapters implement this interface
 * to provide a unified API for the application
 */

export interface PreparedStatement<T = Record<string, unknown>> {
  get: (...params: unknown[]) => Promise<T | undefined>;
  all: (...params: unknown[]) => Promise<T[]>;
  run: (...params: unknown[]) => Promise<{ lastInsertRowid: number | bigint; changes: number }>;
}

export interface Database {
  prepare: <T = Record<string, unknown>>(query: string) => PreparedStatement<T>;
  exec: (sqlString: string) => Promise<void>;
}

// Generate database schema based on engine (SQLite uses INTEGER, PostgreSQL needs BIGINT for timestamps)
export function getDatabaseSchema(engine: 'sqlite' | 'postgres'): string {
  const timestampType = engine === 'postgres' ? 'BIGINT' : 'INTEGER';
  
  return `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at ${timestampType} NOT NULL,
    avatar_url TEXT,
    name TEXT,
    preferred_currency TEXT DEFAULT 'EUR',
    email_verified INTEGER DEFAULT 0,
    email_verified_at ${timestampType},
    verification_token TEXT,
    verification_token_expires ${timestampType},
    reset_token TEXT,
    reset_token_expires ${timestampType}
  );

  CREATE TABLE IF NOT EXISTS wishlists (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_at ${timestampType} NOT NULL,
    updated_at ${timestampType} NOT NULL,
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
    created_at ${timestampType} NOT NULL,
    updated_at ${timestampType} NOT NULL,
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
    created_at ${timestampType} NOT NULL,
    FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
    UNIQUE(user_id, wishlist_id)
  );

  CREATE TABLE IF NOT EXISTS list_members (
    id TEXT PRIMARY KEY,
    wishlist_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at ${timestampType} NOT NULL,
    FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(wishlist_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS pending_invitations (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    wishlist_id TEXT NOT NULL,
    invitation_code TEXT NOT NULL UNIQUE,
    created_at ${timestampType} NOT NULL,
    expires_at ${timestampType} NOT NULL,
    FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
    UNIQUE(email, wishlist_id)
  );
`;
}

// Shared database schema (deprecated - use getDatabaseSchema instead)
export const DATABASE_SCHEMA = getDatabaseSchema('sqlite');

export const DATABASE_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
  CREATE INDEX IF NOT EXISTS idx_wish_items_wishlist_id ON wish_items(wishlist_id);
  CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
  CREATE INDEX IF NOT EXISTS idx_followed_wishlists_user_id ON followed_wishlists(user_id);
  CREATE INDEX IF NOT EXISTS idx_followed_wishlists_wishlist_id ON followed_wishlists(wishlist_id);
  CREATE INDEX IF NOT EXISTS idx_list_members_wishlist_id ON list_members(wishlist_id);
  CREATE INDEX IF NOT EXISTS idx_list_members_user_id ON list_members(user_id);
  CREATE INDEX IF NOT EXISTS idx_pending_invitations_email ON pending_invitations(email);
  CREATE INDEX IF NOT EXISTS idx_pending_invitations_wishlist_id ON pending_invitations(wishlist_id);
  CREATE INDEX IF NOT EXISTS idx_pending_invitations_code ON pending_invitations(invitation_code);
`;
