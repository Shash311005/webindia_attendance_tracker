const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../logger');
const { createUser, findByEmail, findByEmployeeId } = require('../models/userModel');
const { listRoles } = require('../models/roleModel');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *               - name
 *               - email
 *               - password
 *             properties:
 *               employee_id:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registered
 *       400:
 *         description: Missing fields
 *       409:
 *         description: Email or employee ID already exists
 */
router.post('/register', async (req, res) => {
  try {
    const { employee_id, name, email, password, role } = req.body;
    if (!employee_id || !name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const existingEmp = await findByEmployeeId(employee_id);
    if (existingEmp) return res.status(409).json({ error: 'Employee ID already exists' });
    const existingEmail = await findByEmail(email);
    if (existingEmail) return res.status(409).json({ error: 'Email already exists' });

    // determine role_id (default to 'user')
    const roleName = role || 'user';
    const { getRoleByName } = require('../models/roleModel');
    const roleRow = await getRoleByName(roleName);
    if (!roleRow) return res.status(400).json({ error: 'Invalid role' });

    const hash = await bcrypt.hash(password, 10);
    const created = await createUser(employee_id, name, email, hash, roleRow.id);
    logger.info('User registered', { userId: created.id, employee_id, email, role: roleName });
    res.json({ message: 'Registered', userId: created.id });
  } catch (err) {
    logger.error('Register error: %o', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login and receive JWT
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const user = await findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const roleName = user.role_name || 'user';
    const token = jwt.sign({ id: user.id, employee_id: user.employee_id, role: roleName }, JWT_SECRET, { expiresIn: '8h' });
    logger.info('User logged in', { userId: user.id, email });
    res.json({ token, user: { id: user.id, name: user.name, employee_id: user.employee_id, email: user.email, role: roleName } });
  } catch (err) {
    logger.error('Login error: %o', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @openapi
 * /api/auth/roles:
 *   get:
 *     summary: Get list of available roles
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Array of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 */
router.get('/roles', async (req, res) => {
  try {
    const roles = await listRoles();
    res.json(roles);
  } catch (err) {
    logger.error('Get roles error: %o', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


