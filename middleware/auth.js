const jwt = require('jsonwebtoken');
require('dotenv').config();
const pool = require('../db');



const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.execute('SELECT id, username, email, role FROM users WHERE id = ?', [payload.id]);
    if (rows.length === 0) 
        return res.status(401).json({ 
            error: 'User not found' });

    req.user = rows[0]; 
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { verifyToken };
