const { pool } = require('../config/db');

const getMyStore = async (req, res) => {
  try {
    const [stores] = await pool.query(
      `SELECT s.id, s.name, s.email, s.address, s.created_at,
       ROUND(AVG(r.rating), 1) AS avg_rating,
       COUNT(r.id) AS total_ratings
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.owner_id = ?
       GROUP BY s.id`,
      [req.user.id]
    );
    if (!stores.length) return res.status(404).json({ success: false, message: 'No store found for your account' });
    res.json({ success: true, data: stores[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getStoreRatings = async (req, res) => {
  try {
    const [stores] = await pool.query('SELECT id FROM stores WHERE owner_id = ?', [req.user.id]);
    if (!stores.length) return res.status(404).json({ success: false, message: 'No store found' });

    const storeId = stores[0].id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM ratings WHERE store_id = ?', [storeId]);
    const [ratings] = await pool.query(
      `SELECT r.id, r.rating, r.created_at, r.updated_at,
       u.id AS user_id, u.name AS user_name, u.email AS user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.updated_at DESC
       LIMIT ? OFFSET ?`,
      [storeId, limit, offset]
    );

    res.json({ success: true, data: ratings, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getMyStore, getStoreRatings };
