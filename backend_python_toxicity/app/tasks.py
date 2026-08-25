from app.celery_app import celery_app
from app.model import get_toxicity_prediction  # <-- Toxicity prediction function

@celery_app.task(bind=True)
def process_batch_toxicity(self, text_list: list):
    results = []
    total = len(text_list)

    for index, text in enumerate(text_list):
        res = get_toxicity_prediction(text)
        results.append(res)

        progress = int(((index + 1) / total) * 100)
        self.update_state(state="PROCESSING", meta={"progress": progress, "current": index + 1, "total": total})

    return {
        "status": "COMPLETED",
        "total_processed": total,
        "results": results
    }