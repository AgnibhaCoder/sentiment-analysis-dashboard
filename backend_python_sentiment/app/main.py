from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from celery.result import AsyncResult

from app.utils import clean_text
from app.model import get_sentiment_prediction
from app.tasks import process_batch_sentiment

app = FastAPI(title="Sentiment Analysis Microservice")

class TextRequest(BaseModel):
    text: str

class BatchTextRequest(BaseModel):
    texts: List[str]

# 1. Single Text Endpoint (Real-time)
@app.post("/analyze")
async def analyze_sentiment(request: TextRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text field cannot be empty")

    processed_text = clean_text(request.text)
    prediction = get_sentiment_prediction(processed_text)

    return {
        "text": request.text,
        "sentiment": prediction["label"],
        "confidence": prediction["score"]
    }

# 2. Batch Processing Trigger (Asynchronous)
@app.post("/analyze-batch")
async def trigger_batch_sentiment(request: BatchTextRequest):
    if not request.texts:
        raise HTTPException(status_code=400, detail="Text array cannot be empty")
        
    task = process_batch_sentiment.delay(request.texts)
    return {
        "job_id": task.id,
        "message": f"Batch sentiment job dispatched for {len(request.texts)} items."
    }

# 3. Batch Status Polling Endpoint
@app.get("/batch-status/{job_id}")
async def get_batch_status(job_id: str):
    task_result = AsyncResult(job_id)
    
    if task_result.state == "PROCESSING":
        return {
            "job_id": job_id, 
            "status": "PROCESSING", 
            "progress": task_result.info.get("progress", 0) if isinstance(task_result.info, dict) else 0
        }
    elif task_result.state == "SUCCESS":
        return {
            "job_id": job_id, 
            "status": "COMPLETED", 
            "result": task_result.result
        }
    else:
        return {
            "job_id": job_id, 
            "status": task_result.state
        }