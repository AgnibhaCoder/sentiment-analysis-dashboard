import pytest
import httpx

GATEWAY_URL = "http://localhost:5000/api/v1"
SENTIMENT_URL = "http://localhost:8000"
TOXICITY_URL = "http://localhost:8001"

@pytest.mark.asyncio
async def test_sentiment_microservice_direct():
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{SENTIMENT_URL}/analyze", json={"text": "Great service!"})
        assert res.status_code == 200
        data = res.json()
        assert "sentiment" in data
        assert "confidence" in data

@pytest.mark.asyncio
async def test_toxicity_microservice_direct():
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{TOXICITY_URL}/analyze", json={"text": "You are awesome"})
        assert res.status_code == 200
        data = res.json()
        assert "is_toxic" in data

@pytest.mark.asyncio
async def test_gateway_multi_model_routing():
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{GATEWAY_URL}/analyze-all", json={"text": "I love this product!"})
        assert res.status_code == 200
        data = res.json()
        assert "sentiment" in data
        assert "toxicity" in data