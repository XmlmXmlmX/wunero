/**
 * Postgres Database Adapter
 * Uses @vercel/postgres for Vercel deployments
 */

import { sql } from '@vercel/postgres';
import type { Database, PreparedStatement } from './database';
import { getDatabaseSchema, DATABASE_INDEXES } from './database';

// Helper to convert SQLite-style ? placeholders to PostgreSQL $1, $2, etc.
function convertPlaceholders(query: string): string {
  let index = 0;
  return query.replace(/\?/g, () => `$${++index}`);
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
  // Initialize schema with BIGINT for timestamps - run statements individually
  const schema = getDatabaseSchema('postgres');
  await execMultiple(schema);
  await execMultiple(DATABASE_INDEXES);

  console.log('✓ Using Vercel Postgres');

  return {
    prepare<T = Record<string, unknown>>(query: string): PreparedStatement<T> {
      const pgQuery = convertPlaceholders(query);
      return {
        get: async (...params: unknown[]) => {
          console.log('PG GET:', pgQuery, 'params:', params);
          const result = await sql.query(pgQuery, params);
          console.log('PG GET result rows:', result.rows.length);
          return (result.rows[0] as T) || undefined;
        },
        all: async (...params: unknown[]) => {
          console.log('PG ALL:', pgQuery, 'params:', params);
          const result = await sql.query(pgQuery, params);
          console.log('PG ALL result rows:', result.rows.length);
          return result.rows as T[];
        },
        run: async (...params: unknown[]) => {
          console.log('PG RUN:', pgQuery, 'params:', params);
          const result = await sql.query(pgQuery, params);
          console.log('PG RUN rowCount:', result.rowCount);
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
