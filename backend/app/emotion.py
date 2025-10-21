# backend/app/emotion.py
# This uses a DistilRoBERTa model fine-tuned for 7 emotion classes:anger, disgust, fear, joy, neutral, sadness, surprise
from transformers import pipeline

# Load model once on startup
emotion_model = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    return_all_scores=False
)

def detect_emotion(text: str):
    """
    Detects emotion from user input text.
    Returns tuple: (label, confidence)
    """
    if not text.strip():
        return "neutral", 0.0
    try:
        result = emotion_model(text)[0]
        return result["label"], float(result["score"])
    except Exception as e:
        print("Emotion detection error:", e)
        return "error", 0.0
