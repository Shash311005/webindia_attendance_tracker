const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const { pool } = require('./db');

async function run() {
  const file = path.join(__dirname, 'migrations', 'convert_roles.sql');
  if (!fs.existsSync(file)) {
    console.error('Migration file not found:', file);
    process.exit(1);
  }

  const sql = fs.readFileSync(file, 'utf8');

  const client = await pool.connect();
  try {
    console.log('Running migration:', file);
    await client.query('BEGIN');
    await client.query(sql);

    // optional drop flag: run with --drop to drop legacy column after verification
    const args = process.argv.slice(2);
    if (args.includes('--drop')) {
      console.log('Dropping legacy users.role column (as requested via --drop)');
      await client.query("ALTER TABLE users DROP COLUMN IF EXISTS role;");
    }

    await client.query('COMMIT');
    console.log('Migration applied successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
