const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PORT } = require('./config/env');

// Existing Routes
const sentimentRoutes = require('./routes/sentimentRoutes');

// New Gateway API Routes (Phase 3)
const apiRoutes = require('./routes/apiRoutes');

// Services
const { analyzeSentiment } = require('./services/pythonService');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Global Middleware
app.use(cors());
app.use(express.json());

// 1. Existing legacy route mount
app.use('/api', sentimentRoutes);

// 2. New Versioned API Gateway Mount (Auth, Rate Limiting, Multi-Model Routing)
app.use('/api/v1', apiRoutes);

// Real-Time Socket.io Connection
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('analyze_text', async (data) => {
        const { text } = data;
        if (!text) return;

        try {
            // Uses the new caching + audit-logging sentiment service pipeline
            const analysisRes = await analyzeSentiment(text, null);
            socket.emit('sentiment_result', analysisRes);
        } catch (error) {
            socket.emit('sentiment_error', { error: 'Could not process message' });
        }
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 API Gateway & WebSocket Server running on port: ${PORT}`);
});