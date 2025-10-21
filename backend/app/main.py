from fastapi import FastAPI, Body
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from app.emotion import detect_emotion

app = FastAPI(title="Krishna Chatbot - Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end my life', 'want to die']

class ChatRequest(BaseModel):
    userId: str
    message: str

def crisis_check(text: str) -> bool:
    text = text.lower()
    return any(k in text for k in CRISIS_KEYWORDS)

@app.post("/api/chat")
def chat(req: ChatRequest = Body(...)):
    text = req.message or ""

    # Step 1 — Crisis detection
    if crisis_check(text):
        return {
            "text": (
                "I'm very concerned about what you're feeling. "
                "Please reach out for immediate help:\n"
                "- 📞 988 (US)\n"
                "- ☎️ AASRA: +91-22-27546669 (India)\n"
                "You are not alone; help is available right now."
            ),
            "isCrisis": True,
            "emotion": "crisis"
        }

    # Step 2 — Emotion detection
    emotion, confidence = detect_emotion(text)
    print(f"Detected emotion: {emotion} (confidence: {confidence:.2f})")

    # Step 3 — Respond based on emotion
    if emotion == "sadness":
        reply = (
            "I sense sadness in your words. Remember, even in the darkest moments, "
            "the light of your true self never fades. Take a slow breath. 🌼"
        )
    elif emotion == "joy":
        reply = (
            "Your joy is beautiful. Cherish it, for joy shared with others grows manifold."
        )
    elif emotion == "anger":
        reply = (
            "Anger clouds clarity. Pause for a moment and breathe deeply — wisdom will return."
        )
    elif emotion == "fear":
        reply = (
            "Do not fear what lies ahead. You are guided and protected by purpose and strength within."
        )
    else:
        reply = (
            "I'm listening, my friend. Speak freely — I am here to walk beside you."
        )

    return {
        "text": reply,
        "emotion": emotion,
        "confidence": confidence,
        "isCrisis": False
    }
