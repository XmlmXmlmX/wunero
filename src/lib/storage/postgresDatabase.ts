/**
 * Postgres Database Adapter
 * Uses @vercel/postgres for Vercel deployments
 */

import { sql } from '@vercel/postgres';
import type { Database, PreparedStatement } from './database';
import { DATABASE_SCHEMA, DATABASE_INDEXES } from './database';

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
  await execMultiple(DATABASE_SCHEMA);
  await execMultiple(DATABASE_INDEXES);

  console.log('✓ Using Vercel Postgres');

  return {
    prepare<T = Record<string, unknown>>(query: string): PreparedStatement<T> {
      return {
        get: async (...params: unknown[]) => {
          const result = await sql.query(query, params);
          return (result.rows[0] as T) || undefined;
        },
        all: async (...params: unknown[]) => {
          const result = await sql.query(query, params);
          return result.rows as T[];
        },
        run: async (...params: unknown[]) => {
          const result = await sql.query(query, params);
          return {
            lastInsertRowid: 0,
            changes: result.rowCount ?? 0,
          };
        },
      };
    },
    async exec(sqlString: string) {
      await execMultiple(sqlString);
    },
  };
}
