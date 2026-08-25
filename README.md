Markdown
# Real-Time Sentiment & Toxicity Analysis Engine

An event-driven microservices platform for real-time NLP analysis. It processes text streams over WebSockets (Socket.IO), offloads heavy model inference to background Celery workers via Redis queues, and serves live predictions through a decoupled architecture.

---

##  Architecture Overview

[ Frontend (Browser) ]
│ ⚡ WebSocket (Socket.IO)
▼
[ API Gateway (Node.js) ] ── (Port 5000)
│ 📥 Enqueue Task
▼
[ Redis Queue ]
│ 🔄 Pull Task
▼
[ Celery Workers ] ── HTTP POST ──► [ ML Inference APIs (FastAPI) ]
│                               ├── Sentiment (DistilBERT) - Port 8000
│                               └── Toxicity (HuggingFace) - Port 8001
▼
[ PostgreSQL DB ] (Historical Logs & Audit Storage)


---

## 🛠️ Tech Stack

* **Frontend:** HTML5, Modern JavaScript, Socket.IO Client
* **API Gateway:** Node.js, Express, Socket.IO
* **Message Broker:** Redis
* **Async Task Queue:** Celery
* **ML Engines:** FastAPI, PyTorch, Hugging Face Transformers (DistilBERT)
* **Database:** PostgreSQL
* **Containerization:** Docker, Docker Compose

---

## 🚀 Quick Start

### 1. Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 2. Run the Application

Clone the repository and start all microservices using Docker Compose:

```bash
docker compose -f docker_compose.yml up -d --build
3. Open the Dashboard
Web UI: Open public/index.html in your browser (or serve via VS Code Live Server).

API Gateway: http://localhost:5000

Sentiment API Docs (Swagger): http://localhost:8000/docs

Toxicity API Docs (Swagger): http://localhost:8001/docs

⚡ Scaling Worker Capacity

Scale inference workers independently under heavy request traffic without modifying backend code:

Bash
docker compose up -d --scale ml_sentiment_api=3

🧪 Testing Endpoints Directly

Run inference on the Sentiment API via PowerShell/curl:
$body = @{ text = "This setup is awesome!" } | ConvertTo-Json
Invoke-RestMethod -Uri "[http://127.0.0.1:8000/analyze](http://127.0.0.1:8000/analyze)" -Method Post -ContentType "application/json" -Body $body