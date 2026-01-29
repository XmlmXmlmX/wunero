-- Migration: Add reset_token fields to users table (PostgreSQL)
-- Run this in your Postgres database console or using a migration tool

-- Add reset_token columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'reset_token'
  ) THEN
    ALTER TABLE users ADD COLUMN reset_token TEXT;
    ALTER TABLE users ADD COLUMN reset_token_expires BIGINT;
    
    RAISE NOTICE 'Successfully added reset_token columns';
  ELSE
    RAISE NOTICE 'Columns already exist, no migration needed';
  END IF;
END $$;
