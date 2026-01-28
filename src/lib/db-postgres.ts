import { sql } from '@vercel/postgres';

export interface PreparedStatement<T = Record<string, unknown>> {
  get: (params?: unknown[] | Record<string, unknown>) => Promise<T | undefined>;
  all: (params?: unknown[] | Record<string, unknown>) => Promise<T[]>;
  run: (params?: unknown[] | Record<string, unknown>) => Promise<{ lastInsertRowid: number | bigint; changes: number }>;
}

export interface Database {
  prepare: <T = Record<string, unknown>>(query: string) => PreparedStatement<T>;
  exec: (sqlString: string) => Promise<void>;
}

// Helper to split and execute multiple SQL statements
async function execMultiple(sqlString: string): Promise<void> {
  // Split by semicolon but keep them intact, handle multi-line statements
  const statements = sqlString
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  for (const statement of statements) {
    try {
      await sql.query(statement);
    } catch (error) {
      console.error('SQL Error:', statement, error);
      throw error;
    }
  }
}

// Postgres adapter that mimics better-sqlite3 API
export async function createPostgresAdapter(): Promise<Database> {
  // Initialize schema - run statements individually
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS wishlists (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL
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
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS followed_wishlists (
      user_id TEXT NOT NULL,
      wishlist_id TEXT NOT NULL,
      followed_at BIGINT NOT NULL,
      PRIMARY KEY (user_id, wishlist_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_wish_items_wishlist_id ON wish_items(wishlist_id);
    CREATE INDEX IF NOT EXISTS idx_followed_wishlists_user_id ON followed_wishlists(user_id);
    CREATE INDEX IF NOT EXISTS idx_followed_wishlists_wishlist_id ON followed_wishlists(wishlist_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `;

  await execMultiple(createTablesSQL);

  return {
    prepare: <T = Record<string, unknown>>(query: string): PreparedStatement<T> => {
      // Convert SQLite placeholders (?) to Postgres ($1, $2, etc.)
      let paramCount = 0;
      const pgQuery = query.replace(/\?/g, () => `$${++paramCount}`);

      return {
        get: async (params?: unknown[] | Record<string, unknown>): Promise<T | undefined> => {
          const values = Array.isArray(params) ? params : params ? [params] : [];
          const result = await sql.query(pgQuery, values);
          return result.rows[0] as T | undefined;
        },
        all: async (params?: unknown[] | Record<string, unknown>): Promise<T[]> => {
          const values = Array.isArray(params) ? params : params ? [params] : [];
          const result = await sql.query(pgQuery, values);
          return result.rows as T[];
        },
        run: async (params?: unknown[] | Record<string, unknown>): Promise<{ lastInsertRowid: number | bigint; changes: number }> => {
          const values = Array.isArray(params) ? params : params ? [params] : [];
          const result = await sql.query(pgQuery, values);
          return {
            lastInsertRowid: 0,
            changes: result.rowCount || 0,
          };
        },
      };
    },
    exec: execMultiple,
  };
}
