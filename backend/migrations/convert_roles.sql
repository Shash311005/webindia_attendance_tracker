-- Migration: convert legacy users.role (varchar) to roles table with role_id FK
-- This script is idempotent and safe to run multiple times.

BEGIN;

-- 1) create roles table if missing
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2) seed standard roles if not present
INSERT INTO roles (name, description)
SELECT v.name, v.description
FROM (VALUES
  ('user','Default user role'),
  ('manager','Manager role'),
  ('admin','Administrator role')
) AS v(name,description)
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = v.name);

-- 3) add role_id column to users if missing
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role_id INTEGER;

-- 4) import any free-form role names from users.role into roles table
INSERT INTO roles (name, description)
SELECT DISTINCT u.role, 'Imported role'
FROM users u
WHERE u.role IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM roles r WHERE r.name = u.role);

-- 5) populate users.role_id by matching users.role -> roles.name
UPDATE users u
SET role_id = r.id
FROM roles r
WHERE u.role IS NOT NULL
  AND r.name = u.role
  AND (u.role_id IS NULL OR u.role_id <> r.id);

-- 6) ensure every user has a role_id (default to 'user')
UPDATE users
SET role_id = (SELECT id FROM roles WHERE name = 'user' LIMIT 1)
WHERE role_id IS NULL;

COMMIT;

-- OPTIONAL: after you verify role_id is populated correctly, you can DROP the legacy column.
-- The line below is intentionally commented out; run manually once verified.
-- ALTER TABLE users DROP COLUMN IF EXISTS role;
