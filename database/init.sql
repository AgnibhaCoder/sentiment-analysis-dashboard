-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. API Keys Table (for Gateway Rate Limiting & Auth)
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) DEFAULT 'Default Key',
    rate_limit_per_min INT DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Inference Request Logs Table
CREATE TABLE IF NOT EXISTS inference_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    model_name VARCHAR(50) NOT NULL,          -- 'sentiment' or 'toxicity'
    prompt_length INT NOT NULL,
    latency_ms INT NOT NULL,
    cached BOOLEAN DEFAULT FALSE,
    status_code INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast user activity queries
CREATE INDEX idx_logs_user_id ON inference_logs(user_id);
CREATE INDEX idx_logs_created_at ON inference_logs(created_at);