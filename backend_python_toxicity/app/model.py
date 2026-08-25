from transformers import pipeline

# Pre-load toxicity classification pipeline from Hugging Face
classifier = pipeline(
    "text-classification",
    model="unitary/unbiased-toxic-roberta",
    top_k=None # Return all label probabilities
)

def get_toxicity_prediction(text: str):
    results = classifier(text)[0]
    
    # Extract highest probability toxic label or highest scoring attribute
    top_prediction = max(results, key=lambda x: x["score"])
    
    # Determine overall boolean toxicity flag based on threshold
    is_toxic = any(res["score"] > 0.5 for res in results if res["label"].lower() != "non-toxic")

    return {
        "is_toxic": is_toxic,
        "label": top_prediction["label"].lower(),
        "score": round(top_prediction["score"], 4),
        "details": {res["label"]: round(res["score"], 4) for res in results}
    }