# backend/app/emotion.py
# This uses a DistilRoBERTa model fine-tuned for 7 emotion classes: anger, disgust, fear, joy, neutral, sadness, surprise
from transformers import pipeline

# Load model once on startup
emotion_model = pipeline(
    "text-classification",
    model="bhadresh-savani/bert-base-uncased-emotion",
    top_k=None
)

def detect_emotion(text: str):
    """
    Detects emotion from user input text.
    Returns tuple: (label, confidence)
    """
    if not text.strip():
        return "neutral", 0.0
    try:
        results = emotion_model(text)
        # results is now a list of lists when top_k=None
        scores = results[0]
        best = max(scores, key=lambda x: x['score'])
        return best["label"].lower(), float(best["score"])
    except Exception as e:
        print("Emotion detection error:", e)
        return "error", 0.0
