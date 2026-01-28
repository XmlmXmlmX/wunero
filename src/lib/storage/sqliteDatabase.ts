/**
 * SQLite Database Adapter
 * Uses better-sqlite3 for local development and serverless deployments
 */

import SQLiteDatabase from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { Database, PreparedStatement } from './database';
import { DATABASE_SCHEMA, DATABASE_INDEXES } from './database';

export async function createSqliteAdapter(): Promise<Database> {
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  const DB_DIR = isServerless ? '/tmp' : (process.env.DB_PATH || './data');
  const DB_FILE = path.join(DB_DIR, 'wunero.db');

  // Ensure database directory exists
  if (!isServerless && !fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const sqlite = new SQLiteDatabase(DB_FILE);
  sqlite.pragma('foreign_keys = ON');

  // Initialize schema
  sqlite.exec(DATABASE_SCHEMA);
  sqlite.exec(DATABASE_INDEXES);

  console.log('✓ Using SQLite at', DB_FILE);

  // Wrap SQLite statements to provide async interface
  return {
    prepare<T = Record<string, unknown>>(query: string): PreparedStatement<T> {
      const stmt = sqlite.prepare(query);

      return {
        get: async (...params: unknown[]) => {
          return stmt.get(...params) as T | undefined;
        },
        all: async (...params: unknown[]) => {
          return stmt.all(...params) as T[];
        },
        run: async (...params: unknown[]) => {
          const result = stmt.run(...params);
          return {
            lastInsertRowid: result.lastInsertRowid,
            changes: result.changes,
          };
        },
      };
    },
    async exec(sqlString: string) {
      sqlite.exec(sqlString);
    },
  };
}
