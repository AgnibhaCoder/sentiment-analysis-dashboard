const express = require('express');
const router = express.Router();
const { authenticateRequest } = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const { analyzeSentiment, analyzeToxicity, analyzeAll } = require('../services/pythonService');

// Apply auth and rate limiting to all /api endpoints
router.use(authenticateRequest);
router.use(rateLimiter);

// 1. Sentiment Endpoint -> Port 8000
router.post('/sentiment', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Text field is required' });
        const result = await analyzeSentiment(text, req.user?.id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Sentiment microservice failed', details: err.message });
    }
});

// 2. Toxicity Endpoint -> Port 8001
router.post('/toxicity', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Text field is required' });
        const result = await analyzeToxicity(text, req.user?.id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Toxicity microservice failed', details: err.message });
    }
});

// 3. Multi-Model Unified Endpoint -> Runs both in parallel
router.post('/analyze-all', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Text field is required' });
        const result = await analyzeAll(text, req.user?.id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Multi-model analysis failed', details: err.message });
    }
});

module.exports = router;