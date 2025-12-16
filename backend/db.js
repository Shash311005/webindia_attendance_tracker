const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
	host: process.env.PGHOST || 'localhost',
	port: parseInt(process.env.PGPORT || '5432', 10),
	user: process.env.PGUSER || 'postgres',
	password: process.env.PGPASSWORD || '',
	database: process.env.PGDATABASE || 'engineer_tracker'
});

pool.on('error', (err) => {
	// console.error used here to avoid circular import with logger
	console.error('Unexpected Postgres client error', err);
});

async function query(text, params) {
	const start = Date.now();
	const res = await pool.query(text, params);
	const duration = Date.now() - start;
	// intentionally do not log query details to console to keep terminal clean
	// if you need query telemetry, enable it through a dedicated monitoring integration
	return res;
}

module.exports = { pool, query };
