const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

/**
 * Validates JWT Token OR x-api-key header
 */
const authenticateRequest = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'];

    if (apiKey) {
        try {
            const result = await pool.query(
                'SELECT * FROM api_keys WHERE key_hash = $1 AND is_active = true',
                [apiKey]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid or inactive API key' });
            }

            req.user = { id: result.rows[0].user_id, rateLimit: result.rows[0].rate_limit_per_min };
            return next();
        } catch (err) {
            console.error('API Key Auth Error:', err);
            return res.status(500).json({ error: 'Internal Auth Error' });
        }
    }

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            return next();
        } catch (err) {
            return res.status(401).json({ error: 'Invalid or expired JWT token' });
        }
    }

    // Unauthenticated access fallback for WebSocket / demo interface
    req.user = { id: null, rateLimit: 30 };
    next();
};

module.exports = { authenticateRequest, JWT_SECRET };