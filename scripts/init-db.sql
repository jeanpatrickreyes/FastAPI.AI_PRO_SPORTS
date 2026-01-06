-- AI PRO SPORTS - Database Initialization
-- Phase 1: PostgreSQL Setup Script
-- Run automatically when Docker container starts

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for full-text search (future use)
-- CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Set timezone
SET timezone = 'UTC';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE aiprosports TO aiprosports;

-- Create schemas if needed
-- CREATE SCHEMA IF NOT EXISTS analytics;

-- Performance settings notice
DO $$
BEGIN
    RAISE NOTICE 'AI PRO SPORTS database initialized successfully';
    RAISE NOTICE 'PostgreSQL version: %', version();
END $$;
