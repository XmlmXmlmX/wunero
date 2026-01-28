/**
 * Database Module
 * 
 * Provides a unified database interface that automatically selects between
 * SQLite (local development) and Postgres (Vercel production).
 * 
 * The choice is determined by the presence of POSTGRES_URL environment variable:
 * - POSTGRES_URL set → Use Postgres adapter
 * - POSTGRES_URL not set → Use SQLite adapter
 * 
 * Both adapters implement the same Database interface, so application code
 * doesn't need to know which database is being used.
 */

import type { Database } from './database';
import { createSqliteAdapter } from './sqliteDatabase';
import { createPostgresAdapter } from './postgresDatabase';

// Determine which database adapter to use
const usePostgres = !!process.env.POSTGRES_URL;

let dbInstance: Database | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Initialize the database adapter based on environment
 */
async function initializeDatabase(): Promise<void> {
  if (usePostgres) {
    dbInstance = await createPostgresAdapter();
  } else {
    dbInstance = await createSqliteAdapter();
  }
}

/**
 * Get the initialized database instance
 * Uses lazy initialization to defer database connection setup
 */
async function getDb(): Promise<Database> {
  if (!initPromise) {
    initPromise = initializeDatabase();
  }
  await initPromise;
  
  if (!dbInstance) {
    throw new Error('Database failed to initialize');
  }
  
  return dbInstance;
}

/**
 * Database proxy that provides lazy initialization
 * 
 * All database calls are automatically wrapped to:
 * 1. Wait for database initialization
 * 2. Forward the call to the appropriate adapter
 * 3. Return the result
 */
class DatabaseProxy implements Database {
  prepare<T = Record<string, unknown>>(query: string) {
    return {
      get: async (...params: unknown[]) => {
        const db = await getDb();
        return db.prepare<T>(query).get(...params);
      },
      all: async (...params: unknown[]) => {
        const db = await getDb();
        return db.prepare<T>(query).all(...params);
      },
      run: async (...params: unknown[]) => {
        const db = await getDb();
        return db.prepare<T>(query).run(...params);
      },
    };
  }

  async exec(sqlString: string): Promise<void> {
    const db = await getDb();
    return db.exec(sqlString);
  }
}

// Export singleton instance
const db = new DatabaseProxy();
export default db;
