/**
 * Init Postgres schema script
 * Run: node init_db.js (make sure .env is set or env vars provided)
 */
const { pool } = require('./db');

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // roles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // users table (references roles.id)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(64) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // seed default roles if not present
    await client.query("INSERT INTO roles (name, description) SELECT 'user', 'Default user role' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name='user')");
    await client.query("INSERT INTO roles (name, description) SELECT 'manager', 'Manager role' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name='manager')");
    await client.query("INSERT INTO roles (name, description) SELECT 'admin', 'Administrator role' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name='admin')");

    // logs table for storing application logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        level VARCHAR(50) NOT NULL,
        message TEXT,
        meta JSONB,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // itin table: flexible itinerary / item table for future features
    await client.query(`
      CREATE TABLE IF NOT EXISTS itin (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        details JSONB,
        start_at TIMESTAMPTZ,
        end_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    await client.query('COMMIT');
    console.log('Postgres schema initialized (roles + users)');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to initialize schema', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
