from fastapi import FastAPI, Body
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from app.emotion import detect_emotion
from app.gita_response import krishna_response   # ✅ use gita_response instead
import json
import random
import os

# --- Store recent emotions per user (memory for Phase 2) ---
USER_MEMORY = {}  # Maps userId -> list of last 3 emotions

app = FastAPI(title="Krishna Chatbot - Backend")

# --- Allow frontend access ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Crisis detection keywords ---
CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end my life', 'want to die']

# --- Request model ---
class ChatRequest(BaseModel):
    userId: str
    message: str


# --- Load Krishna-style fallback replies (if model fails) ---
REPLIES_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "krishna_replies.json")

# Defensive check — prevent FileNotFoundError
if os.path.exists(REPLIES_PATH):
    with open(REPLIES_PATH, "r", encoding="utf-8") as f:
        REPLIES = json.load(f)
else:
    REPLIES = {
        "default": [
            "I am here for you, my friend. Speak freely.",
            "Your words reach me, and I listen with love.",
        ]
    }


# --- Crisis check function ---
def crisis_check(text: str) -> bool:
    text = text.lower()
    return any(k in text for k in CRISIS_KEYWORDS)


# --- Chat endpoint ---
@app.post("/api/chat")
async def chat(payload: dict):
    text = payload.get("message", "")
    user_id = payload.get("userId", "")

    # 1️⃣ Emotion detection (already present in your emotion.py)
    from app.emotion import detect_emotion
    emotion, confidence = detect_emotion(text)

    # 2️⃣ Crisis detection (if you implemented one)
    isCrisis = "suicide" in text.lower() or "kill myself" in text.lower()

    # 3️⃣ Generate Krishna-style response
    reply = krishna_response(text, emotion)

    # 4️⃣ Return structured response to frontend
    return {
        "text": reply,
        "emotion": emotion,
        "confidence": confidence,
        "isCrisis": isCrisis
    }


    # Step 1 — Crisis detection
    if crisis_check(text):
        return {
            "text": (
                "I'm deeply concerned about your pain, dear one. "
                "Please reach out for immediate help:\n"
                "- 📞 988 (US)\n"
                "- ☎️ AASRA: +91-22-27546669 (India)\n"
                "You are not alone; compassion surrounds you. 🌼"
            ),
            "isCrisis": True,
            "emotion": "crisis"
        }

    # Step 2 — Emotion detection
    emotion, confidence = detect_emotion(text)
    print(f"Detected emotion: {emotion} (confidence: {confidence:.2f})")

    # Step 2b — Update user emotion memory
    user_id = req.userId
    USER_MEMORY.setdefault(user_id, []).append(emotion)
    if len(USER_MEMORY[user_id]) > 3:
        USER_MEMORY[user_id].pop(0)

    print(f"User {user_id} recent emotions: {USER_MEMORY[user_id]}")

    # Step 3 — Generate Krishna-style intelligent response
    try:
        reply = krishna_response(text, emotion)
    except Exception as e:
        print("Error generating Krishna response:", e)
        available = REPLIES.get(emotion, REPLIES["default"])
        reply = random.choice(available)

    # Step 4 — Emotional memory adjustment
    recent = USER_MEMORY.get(user_id, [])
    if recent.count("sadness") >= 2 and emotion == "sadness":
        reply += " 🌼 I notice your heart has been heavy lately. Remember, even the darkest night ends with dawn."

    # ✅ Always return the structured response
    return {
        "text": reply,
        "emotion": emotion,
        "confidence": confidence,
        "isCrisis": False
    }
