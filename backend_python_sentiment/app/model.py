from transformers import pipeline

print("Initializing hugging face model distillbert")

_classifier=pipeline("sentiment-analysis")
print("model loaded successfully")

def get_sentiment_prediction(text:str):
    prediction=_classifier(text)[0]
    return {
        "label":prediction["label"].lower(),
        "score":round(prediction["score"],4)
    }

#analyze_sentiment_text = get_sentiment_prediction