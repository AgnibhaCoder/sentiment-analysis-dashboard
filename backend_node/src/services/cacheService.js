const redis = require('redis');
const crypto = require('crypto');

// Initialize Redis Client
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Connected to Redis Cache'));

(async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
})();

/**
 * Generates an MD5 hash key for prompt caching
 */
const generateCacheKey = (model, text) => {
    const hash = crypto.createHash('md5').update(text.trim().toLowerCase()).digest('hex');
    return `cache:${model}:${hash}`;
};

/**
 * Get cached inference response
 */
const getCachedInference = async (model, text) => {
    try {
        const key = generateCacheKey(model, text);
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error('Redis Get Error:', err);
        return null; // Fallback to live inference on cache failure
    }
};

/**
 * Save inference result to Redis with TTL (e.g., 1 hour = 3600s)
 */
const setCachedInference = async (model, text, responseData, ttlSeconds = 3600) => {
    try {
        const key = generateCacheKey(model, text);
        await redisClient.setEx(key, ttlSeconds, JSON.stringify(responseData));
    } catch (err) {
        console.error('Redis Set Error:', err);
    }
};

module.exports = {
    redisClient,
    getCachedInference,
    setCachedInference
};