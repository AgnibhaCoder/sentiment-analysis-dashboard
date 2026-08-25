from app.celery_app import celery_app
from app.model import get_sentiment_prediction  # Your existing inference function

@celery_app.task(bind=True)
def process_batch_sentiment(self, text_list: list):
    """
    Processes bulk text items asynchronously in the background.
    """
    results = []
    total = len(text_list)

    for index, text in enumerate(text_list):
        # Run inference on each text
        res = get_sentiment_prediction(text)
        results.append(res)

        # Update progress metadata
        progress = int(((index + 1) / total) * 100)
        self.update_state(state="PROCESSING", meta={"progress": progress, "current": index + 1, "total": total})

    return {
        "status": "COMPLETED",
        "total_processed": total,
        "results": results
    }