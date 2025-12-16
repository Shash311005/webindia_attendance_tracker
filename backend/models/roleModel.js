const { query } = require('../db');

async function getRoleByName(name) {
  const res = await query('SELECT * FROM roles WHERE name = $1 LIMIT 1', [name]);
  return res.rows[0];
}

async function createRole(name, description) {
  const res = await query('INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING *', [name, description]);
  return res.rows[0];
}

async function listRoles() {
  const res = await query('SELECT * FROM roles ORDER BY name');
  return res.rows;
}

module.exports = { getRoleByName, createRole, listRoles };
