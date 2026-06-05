const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const buildPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const buildSort = (query, allowed, defaultCol) => {
  const col = allowed.includes(query.sortBy) ? query.sortBy : defaultCol;
  const dir = query.sortDir === 'desc' ? 'DESC' : 'ASC';
  return `ORDER BY ${col} ${dir}`;
};

// Dashboard
const getDashboard = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users WHERE role != "admin"');
    const [[{ totalStores }]] = await pool.query('SELECT COUNT(*) AS totalStores FROM stores');
    const [[{ totalRatings }]] = await pool.query('SELECT COUNT(*) AS totalRatings FROM ratings');
    res.json({ success: true, data: { totalUsers, totalStores, totalRatings } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Users
const getUsers = async (req, res) => {
  try {
    const { page, limit, offset } = buildPagination(req.query);
    const { search, role } = req.query;
    const sortOrder = buildSort(req.query, ['name', 'email', 'address', 'role', 'created_at'], 'name');

    let where = [];
    let params = [];

    if (search) {
      where.push('(u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (role) {
      where.push('u.role = ?');
      params.push(role);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM users u ${whereClause}`, params);
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at FROM users u ${whereClause} ${sortOrder} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({ success: true, data: users, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
       (SELECT AVG(r.rating) FROM ratings r JOIN stores s ON r.store_id = s.id WHERE s.owner_id = u.id) AS avg_store_rating
       FROM users u WHERE u.id = ?`,
      [req.params.id]
    );
    if (!users.length) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: users[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashed, address || null, role]
    );
    res.status(201).json({ success: true, message: 'User created', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, address, role } = req.body;
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.params.id]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Email already in use' });

    await pool.query('UPDATE users SET name=?, email=?, address=?, role=? WHERE id=?',
      [name, email, address || null, role, req.params.id]);
    res.json({ success: true, message: 'User updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Stores
const getStores = async (req, res) => {
  try {
    const { page, limit, offset } = buildPagination(req.query);
    const { search } = req.query;
    const sortOrder = buildSort(req.query, ['s.name', 'email', 's.address', 'avg_rating'], 's.name');

    let where = [];
    let params = [];
    if (search) {
      where.push('(s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM stores s ${whereClause}`, params);
    const [stores] = await pool.query(
      `SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
       u.name AS owner_name,
       ROUND(AVG(r.rating), 1) AS avg_rating,
       COUNT(r.id) AS rating_count
       FROM stores s
       LEFT JOIN users u ON s.owner_id = u.id
       LEFT JOIN ratings r ON s.id = r.store_id
       ${whereClause}
       GROUP BY s.id ${sortOrder} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({ success: true, data: stores, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;
    const [existing] = await pool.query('SELECT id FROM stores WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Store email already exists' });

    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id || null]
    );
    if (owner_id) {
      await pool.query('UPDATE users SET role = "owner" WHERE id = ? AND role = "user"', [owner_id]);
    }
    res.status(201).json({ success: true, message: 'Store created', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;
    const [existing] = await pool.query('SELECT id FROM stores WHERE email = ? AND id != ?', [email, req.params.id]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Store email already in use' });

    await pool.query('UPDATE stores SET name=?, email=?, address=?, owner_id=? WHERE id=?',
      [name, email, address, owner_id || null, req.params.id]);
    res.json({ success: true, message: 'Store updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteStore = async (req, res) => {
  try {
    await pool.query('DELETE FROM stores WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Store deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getOwners = async (req, res) => {
  try {
    const [owners] = await pool.query('SELECT id, name, email FROM users WHERE role = "owner" OR role = "user" ORDER BY name');
    res.json({ success: true, data: owners });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getDashboard, getUsers, getUserById, createUser, updateUser, deleteUser, getStores, createStore, updateStore, deleteStore, getOwners };
