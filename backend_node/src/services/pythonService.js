const axios = require('axios');
const pool = require('../config/db');
const { getCachedInference, setCachedInference } = require('./cacheService');

const SENTIMENT_URL = process.env.SENTIMENT_SERVICE_URL || 'http://localhost:8000/analyze';
const TOXICITY_URL = process.env.TOXICITY_SERVICE_URL || 'http://localhost:8001/analyze';

/**
 * Log request metrics to PostgreSQL audit log
 */
const logInference = async (userId, modelName, promptLength, latencyMs, cached, statusCode) => {
    try {
        await pool.query(
            `INSERT INTO inference_logs (user_id, model_name, prompt_length, latency_ms, cached, status_code)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, modelName, promptLength, latencyMs, cached, statusCode]
        );
    } catch (err) {
        console.error('Audit Log Error:', err);
    }
};

/**
 * Generic caller with Caching + Metric Logging
 */
const callInferenceService = async (serviceUrl, modelName, text, userId) => {
    const startTime = Date.now();

    // 1. Check Redis Cache
    const cachedResult = await getCachedInference(modelName, text);
    if (cachedResult) {
        const latency = Date.now() - startTime;
        await logInference(userId, modelName, text.length, latency, true, 200);
        return { ...cachedResult, cached: true, latency_ms: latency };
    }

    // 2. Call Python Microservice
    try {
        const response = await axios.post(serviceUrl, { text }, { timeout: 5000 });
        const latency = Date.now() - startTime;

        // 3. Save to Redis Cache (1 Hour TTL)
        await setCachedInference(modelName, text, response.data, 3600);

        // 4. Log Metrics
        await logInference(userId, modelName, text.length, latency, false, 200);

        return { ...response.data, cached: false, latency_ms: latency };
    } catch (err) {
        const latency = Date.now() - startTime;
        const statusCode = err.response?.status || 500;
        await logInference(userId, modelName, text.length, latency, false, statusCode);
        throw err;
    }
};

/**
 * Routing Handlers
 */
const analyzeSentiment = (text, userId) => callInferenceService(SENTIMENT_URL, 'sentiment', text, userId);
const analyzeToxicity = (text, userId) => callInferenceService(TOXICITY_URL, 'toxicity', text, userId);

/**
 * Parallel Multi-Model Pipeline (Fires both requests concurrently)
 */
const analyzeAll = async (text, userId) => {
    const [sentiment, toxicity] = await Promise.allSettled([
        analyzeSentiment(text, userId),
        analyzeToxicity(text, userId)
    ]);

    return {
        text,
        sentiment: sentiment.status === 'fulfilled' ? sentiment.value : { error: 'Service Unavailable' },
        toxicity: toxicity.status === 'fulfilled' ? toxicity.value : { error: 'Service Unavailable' }
    };
};

module.exports = {
    analyzeSentiment,
    analyzeToxicity,
    analyzeAll
};