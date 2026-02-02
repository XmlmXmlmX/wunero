/**
 * Postgres Database Adapter
 * Uses @neondatabase/serverless for Postgres deployments
 */

import { neon } from '@neondatabase/serverless';
import type { Database, PreparedStatement } from './database';
import { getDatabaseSchema, DATABASE_INDEXES } from './database';

// Helper to convert SQLite-style ? placeholders to PostgreSQL $1, $2, etc.
function convertPlaceholders(query: string): string {
  let index = 0;
  return query.replace(/\?/g, () => `$${++index}`);
}

// Helper to split and execute multiple SQL statements
async function execMultiple(sql: ReturnType<typeof neon<false, false>>, sqlString: string): Promise<void> {
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
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL environment variable is required for Postgres adapter');
  }

  const sql = neon(process.env.POSTGRES_URL);

  // Initialize schema with BIGINT for timestamps - run statements individually
  const schema = getDatabaseSchema('postgres');
  await execMultiple(sql, schema);
  await execMultiple(sql, DATABASE_INDEXES);

  console.log('✓ Using Neon Postgres');

  return {
    prepare<T = Record<string, unknown>>(query: string): PreparedStatement<T> {
      const pgQuery = convertPlaceholders(query);
      return {
        get: async (...params: unknown[]) => {
          const result = await sql.query(pgQuery, params);
          return (result[0] as T) || undefined;
        },
        all: async (...params: unknown[]) => {
          const result = await sql.query(pgQuery, params);
          return result as T[];
        },
        run: async (...params: unknown[]) => {
          const result = await sql.query(pgQuery, params);
          return {
            lastInsertRowid: 0,
            changes: result.length,
          };
        },
      };
    },
    async exec(sqlString: string) {
      await execMultiple(sql, sqlString);
    },
  };
}
