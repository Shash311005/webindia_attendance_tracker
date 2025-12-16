const { createLogger, format, transports } = require('winston');
const Transport = require('winston-transport');
const { query } = require('./db');
const path = require('path');
const fs = require('fs');

// ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// Remove legacy error.log if it exists (we now persist errors to DB)
try {
  const legacyError = path.join(logsDir, 'error.log');
  if (fs.existsSync(legacyError)) {
    fs.unlinkSync(legacyError);
    console.info('Removed legacy logs/error.log (now persisted to DB)');
  }
} catch (err) {
  console.error('Failed to remove legacy error.log', err);
}

// Also remove combined.log if present (we're not using file logs anymore)
try {
  const combined = path.join(logsDir, 'combined.log');
  if (fs.existsSync(combined)) {
    fs.unlinkSync(combined);
    console.info('Removed legacy logs/combined.log (now persisted to DB)');
  }
} catch (err) {
  console.error('Failed to remove legacy combined.log', err);
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'engineer-tracker' },
  defaultMeta: { service: 'engineer-tracker' },
  // No file-based transports by default. Errors are persisted to DB; development logs go to console.
  transports: []
});

// Custom Winston transport that writes log entries to Postgres `logs` table
class DBTransport extends Transport {
  constructor(opts) {
    super(opts);
    this.level = opts.level || 'info';
  }

  log(info, callback) {
    setImmediate(() => this.emit('logged', info));

    // Prepare values for insertion
    try {
      const level = info.level;
      const message = info.message || '';
      // keep all additional meta (timestamp, stack, etc.) into meta JSONB
      const meta = Object.assign({}, info);
      // remove redundant fields
      delete meta.level;
      delete meta.message;

      // insert asynchronously, but do not block logging
      (async () => {
        try {
          await query(
            'INSERT INTO logs (level, message, meta) VALUES ($1, $2, $3)',
            [level, message, meta]
          );
        } catch (err) {
          // if DB insert fails, at least write to console so it isn't silent
          console.error('Failed to write log to DB', err);
        }
      })();
    } catch (err) {
      console.error('DBTransport error', err);
    }

    callback();
  }
}

// Attach DB transport (best-effort). Default to persisting `error` level to DB to avoid noisy inserts.
try {
  logger.add(new DBTransport({ level: process.env.DB_LOG_LEVEL || 'error' }));
} catch (err) {
  console.error('Failed to attach DB transport to logger', err);
}

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({ format: format.simple() }));
}

module.exports = logger;
