const { pool } = require('../config/db');

const getStores = async (req, res) => {
  try {
    const { search } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const offset = (page - 1) * limit;
    const userId = req.user?.id;

    let where = [];
    let params = [];
    if (search) {
      where.push('(s.name LIKE ? OR s.address LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM stores s ${whereClause}`, params);
    let queryParams = [...params];

const [stores] = await pool.query(
  `SELECT s.id, s.name, s.email, s.address,
   ROUND(AVG(r.rating), 1) AS avg_rating,
   COUNT(r.id) AS rating_count
   ${userId ? `,
   (
     SELECT rating
     FROM ratings ur
     WHERE ur.store_id = s.id
     AND ur.user_id = ?
     LIMIT 1
   ) AS user_rating` : ''}
   FROM stores s
   LEFT JOIN ratings r ON s.id = r.store_id
   ${whereClause}
   GROUP BY s.id
   ORDER BY s.name ASC
   LIMIT ? OFFSET ?`,
   userId
     ? [...queryParams, userId, limit, offset]
     : [...queryParams, limit, offset]
);
    res.json({ success: true, data: stores, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const submitRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const storeId = req.params.id;
    const userId = req.user.id;

    const [stores] = await pool.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (!stores.length) return res.status(404).json({ success: false, message: 'Store not found' });

    const [existing] = await pool.query('SELECT id FROM ratings WHERE user_id = ? AND store_id = ?', [userId, storeId]);
    if (existing.length) {
      await pool.query('UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?', [rating, userId, storeId]);
      return res.json({ success: true, message: 'Rating updated successfully' });
    }

    await pool.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [userId, storeId, rating]);
    res.status(201).json({ success: true, message: 'Rating submitted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getStores, submitRating };
