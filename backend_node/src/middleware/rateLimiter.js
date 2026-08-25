const { redisClient } = require('../services/cacheService');

/**
 * Sliding Window Rate Limiter powered by Redis
 */
const rateLimiter = async (req, res, next) => {
    const identifier = req.user?.id || req.ip;
    const key = `ratelimit:${identifier}`;
    const limit = req.user?.rateLimit || 30; // Max requests per minute
    const windowInSeconds = 60;

    try {
        const currentRequests = await redisClient.incr(key);

        if (currentRequests === 1) {
            await redisClient.expire(key, windowInSeconds);
        }

        if (currentRequests > limit) {
            return res.status(429).json({
                error: 'Too Many Requests',
                message: `Rate limit exceeded. Maximum ${limit} requests per minute.`
            });
        }

        next();
    } catch (err) {
        console.error('Rate Limiter Error:', err);
        next(); // Fail open on Redis errors to prevent breaking the application
    }
};

module.exports = rateLimiter;