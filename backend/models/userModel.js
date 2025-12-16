const { query } = require('../db');

// cache whether legacy `users.role` column exists to avoid repeated info_schema checks
let hasRoleColumn = null;
async function ensureRoleColumn() {
  if (hasRoleColumn !== null) return hasRoleColumn;
  const res = await query("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') as exists");
  hasRoleColumn = res.rows[0]?.exists === true;
  return hasRoleColumn;
}

async function createUser(employee_id, name, email, password_hash, role_id = null) {
  const sql = `INSERT INTO users (employee_id, name, email, password_hash, role_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, employee_id, name, email, role_id`;
  const res = await query(sql, [employee_id, name, email, password_hash, role_id]);
  return res.rows[0];
}

async function findByEmail(email) {
  const hasRole = await ensureRoleColumn();
  let sql;
  if (hasRole) {
    sql = `
      SELECT u.*, COALESCE(r.name, u.role) as role_name, COALESCE(r.id, u.role_id) as role_id
      FROM users u
      LEFT JOIN roles r ON (u.role_id IS NOT NULL AND u.role_id = r.id) OR (u.role IS NOT NULL AND u.role = r.name)
      WHERE u.email = $1
      LIMIT 1`;
  } else {
    sql = `
      SELECT u.*, r.name as role_name, r.id as role_id
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1
      LIMIT 1`;
  }
  const res = await query(sql, [email]);
  return res.rows[0];
}

async function findByEmployeeId(employee_id) {
  const hasRole = await ensureRoleColumn();
  let sql;
  if (hasRole) {
    sql = `
      SELECT u.*, COALESCE(r.name, u.role) as role_name, COALESCE(r.id, u.role_id) as role_id
      FROM users u
      LEFT JOIN roles r ON (u.role_id IS NOT NULL AND u.role_id = r.id) OR (u.role IS NOT NULL AND u.role = r.name)
      WHERE u.employee_id = $1
      LIMIT 1`;
  } else {
    sql = `
      SELECT u.*, r.name as role_name, r.id as role_id
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.employee_id = $1
      LIMIT 1`;
  }
  const res = await query(sql, [employee_id]);
  return res.rows[0];
}

module.exports = { createUser, findByEmail, findByEmployeeId };
