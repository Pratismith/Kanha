# Krishna Chatbot — Master Guide (English, Web, Voice-Cloned)

**Purpose:** Build a web-based, English-only, Krishna-inspired emotional-support chatbot (text + voice) with voice cloning (ElevenLabs), RAG-backed Bhagavad Gita grounding, and strong safety/ethical controls.

---

## 1. High-level summary

This project delivers a compassionate conversational agent modeled after Krishna's tone and wisdom to support users experiencing sadness or depressive feelings. It will be built as a web app (React frontend) + FastAPI backend, use OpenAI (or compatible LLM) for responses, FAISS/Pinecone for verse retrieval (RAG), and ElevenLabs for voice-cloning TTS. Safety, crisis escalation, and clear disclaimers are baked in from day one.

---

## 2. Goals & success criteria

- Accept user text/voice input and respond in text + Krishna-like voice.
- Maintain calm, non-medical, spiritually-grounded guidance citing Bhagavad Gita where appropriate.
- Detect crisis language and escalate to human help/resources reliably.
- Respect privacy: encrypted transport, minimal retention, opt-in voice cloning consent.
- MVP performance: <300ms backend latency for simple responses (not counting TTS generation), accurate crisis detection on test set.

---

## 3. Milestones (phased)

**Phase 0 — Planning & Safety**
- Scope, disclaimers, privacy policy, consent forms for voice use.
- Create crisis escalation playbook.

**Phase 1 — Text-only MVP (2 weeks)**
- FastAPI backend + simple React UI.
- Emotion detection (Hugging Face model) + static Krishna replies JSON.
- Crisis detection + resource responses.

**Phase 2 — Static Voice Playback (1 week)**
- Short pre-recorded WAV phrases (greetings/empathy). Play on frontend.

**Phase 3 — RAG + LLM (2–3 weeks)**
- Build verses DB, embeddings, FAISS/Pinecone index, LLM prompt template for Krishna persona.

**Phase 4 — Voice Cloning (ElevenLabs) (1–2 weeks)**
- Register voice, clamp content policy checks, generate TTS from LLM output.

**Phase 5 — Dialogue Management & Personalization (2 weeks)**
- Conversation state, user preferences, caching costs.

**Phase 6 — Testing & Deployment (2 weeks)**
- User testing, security review, deploy to Vercel + Render/GCloud.

---

## 4. Architecture (components)

- **Frontend:** React (Next.js optional) — chat UI, recorder, audio player, client-side safety hints.
- **Backend:** FastAPI (Python) — API endpoints, message orchestration, crisis detection, RAG retrieval, TTS orchestrator.
- **LLM:** OpenAI GPT-4 (or equivalent). Use system prompts to enforce the Krishna voice and safety.
- **Embeddings & Index:** OpenAI embeddings or HF embeddings -> FAISS or Pinecone for scalable retrieval.
- **TTS / Voice Cloning:** ElevenLabs — keep static fallbacks.
- **Storage:** PostgreSQL for user metadata, S3 for audio assets; ephemeral session storage for conversation history.
- **Monitoring:** Sentry / CloudWatch, usage billing alerts.

---

## 5. Safety & legal (non-negotiable)

1. **Crisis detection & escalation**
   - Keywords + ML classifier. If crisis positive: immediately return crisis response and show local helplines + an option to call. Do not use scripture as sole response in crisis.
2. **Disclaimers**
   - Bot identifies itself as AI inspired by Krishna, not a human spiritual guru or clinician.
3. **Voice consent**
   - Explicit signed consent stored before using someone’s voice for cloning. Allow users to opt-out at any time.
4. **Data privacy**
   - TLS in transit, AES-256 at rest. Minimal retention: delete raw audio after TTS model training or move to protected storage.
5. **Moderation**
   - Filter user inputs for hate/violence/sexual content; prevent the model from giving medical/legal/clinical instructions.
6. **Ethical review**
   - Run a small advisory board (2–3 people familiar with mental health + religious sensitivity) to review prompts and responses.

---

## 6. Detailed Implementation Steps

### 6.1 Setup & tools

- Repo structure (suggested):
  ```
  /frontend  # React
  /backend   # FastAPI
  /data      # verses, pre-recorded audio
  /scripts   # indexing, training
  README.md
  ```

- Environment: Python 3.10+, Node 18+, Docker for local env.

### 6.2 Backend (FastAPI) — key endpoints

- `POST /api/chat` — body: `{ userId, message, mode: 'text'|'voice' }` → returns `{ text, audio_url (optional), isCrisis, suggestedResources }`
- `POST /api/voice/clone` — register voice sample (consent required).
- `POST /api/feedback` — store user rating; useful for RLHF later.

#### Example detection + reply flow (pseudo):

1. receive message
2. run crisis_check(message) → if crisis => return crisis response + log
3. run emotion_detector(message) -> emotion label
4. run RAG retrieval with message -> top_k verses
5. build LLM prompt (system + retrieved verses + user message + safety instructions)
6. call LLM -> response_text
7. (optional) call ElevenLabs TTS -> audio
8. return text + audio_url


### 6.3 Emotion detection (MVP)

Use Hugging Face pipeline:
```python
from transformers import pipeline
emotion = pipeline('text-classification', model='j-hartmann/emotion-english-distilroberta-base')

def detect_emotion(text):
    res = emotion(text)[0]
    return res['label'], res['score']
```

Tune thresholds for sadness to trigger sympathy flows.

### 6.4 RAG: Bhagavad Gita index

- Collect verses JSON (text + chapter + verse + translations).
- Create embeddings (OpenAI or local models).
- Index with FAISS / Pinecone.
- At runtime, retrieve top 3-5 verses relevant to user message.

Prompt template example:
```
SYSTEM: You are Krishna: wise, compassionate, concise. Use the provided verses to ground answers.
If user is in crisis, do NOT only quote scripture; provide crisis resources.

CONTEXT: [insert top verses]
USER: {user_message}
ASSISTANT: (Answer in gentle, encouraging tone. Cite one verse optionally.)
```

### 6.5 ElevenLabs voice cloning

**Steps:**
1. Create an ElevenLabs account and get API key.
2. Record/collect 5–10 minutes of clean voice in WAV (16kHz+ recommended). Ensure consent form signed.
3. Use ElevenLabs API to create a custom voice model (follow vendor API instructions).
4. For each LLM reply, call ElevenLabs TTS API to synthesize audio. Use caching for repeated replies.

**Example JS** (from your guide):
```javascript
const ElevenLabs = require('elevenlabs-node');
const voice = new ElevenLabs({ apiKey: process.env.ELEVENLABS_API_KEY });

async function generateVoiceResponse(text, voiceId){
  const audio = await voice.textToSpeech({ text, voice_settings: { stability: 0.5, similarity_boost: 0.8 }, voiceId });
  return audio; // binary buffer
}
```

**Cost-control & fallback:**
- Cache LLM outputs + TTS results for common responses.
- Keep short static audio for fastest empathetic replies.

---

## 7. Prompts & Guardrails (practical)

**System prompt (starter):**
```
You are Lord Krishna: wise, calm, and compassionate. Speak in concise, gentle English. Reference Bhagavad Gita verses when relevant. Do NOT provide medical or legal advice. If user expresses suicidal intent or severe harm, immediately provide crisis resources and encourage contacting professionals. Always identify yourself as an AI inspired by Krishna.
```

**Prompt snippets**
- `If sadness detected, start with a validating empathy line, then a gentle verse-based insight, finally a small actionable grounding step (breathe for 60s, 5-count grounding).`

**Safety injection**: always attach a checklist step for the LLM to include crisis-check logic and disclaimers.

---

## 8. Frontend (React) — UX considerations

- Clean, calming UI: soft blues/greens, minimal motion.
- Message bubbles: user vs Krishna (with small verse citation tag).
- Controls: record, stop, play; volume and speed controls for TTS.
- Quick-help footer: show helplines and a "Get urgent help" button that dials local emergency numbers.
- Accessibility: screen reader labels, large fonts, high contrast mode.

---

## 9. Testing checklist

- Unit test crisis detection (positive/negative cases).
- Integration test RAG → LLM responses contain verse citations when relevant.
- Voice test: audio sync, clarity, mispronunciations.
- Security: penetration basics, env var leakage checks.
- User testing: 10–20 people with mental health awareness training to gather feedback.

---

## 10. Suggested timeline (condensed)

Week 0: Planning, voice consent & recording, safety docs.
Week 1–2: Text-only MVP (FastAPI + React + emotion detection + crisis checks).
Week 3: Static voice playback + UI polish.
Week 4–5: RAG + LLM integration.
Week 6: Voice cloning via ElevenLabs + caching.
Week 7: Testing, legal review, deploy MVP.

---

## 11. Cost & hosting recommendations

- LLM: OpenAI GPT-4 or similar. Monitor token usage; use caching.
- TTS: ElevenLabs (scale plan recommended for production).
- Hosting: Vercel (frontend), Render/Cloud Run (backend), Pinecone/FAISS for index.
- Storage: S3 for audio assets, PostgreSQL for metadata.

Estimated monthly (small production): $400–800 depending on traffic and TTS volume.

---

## 12. Deliverables (what I'll produce / you can copy into repo)

- `README.md` with setup steps.
- `backend/` starter code for FastAPI endpoints (chat, voice, feedback).
- `frontend/` React chat UI with recorder + playback.
- `data/verses.json` and indexing script.
- `ops/` deploy scripts, env var guidance.

---

## 13. Useful example snippets (fast copy)

**FastAPI chat endpoint (simplified)**
```python
from fastapi import FastAPI, Body
app = FastAPI()

@app.post('/api/chat')
def chat(body: dict = Body(...)):
    userId = body.get('userId')
    message = body.get('message')
    # 1. crisis check
    # 2. emotion detect
    # 3. retrieve verses
    # 4. call LLM
    # 5. optionally call TTS
    return { 'text': 'Sample Krishna reply' }
```

**Crisis check (simple)**
```python
CRISIS_KEYWORDS = ['suicide','kill myself','end my life','want to die']

def crisis_check(text):
    lowered = text.lower()
    if any(k in lowered for k in CRISIS_KEYWORDS):
        return True
    return False
```

---

## 14. Next immediate steps for you (practical)

1. Create a GitHub repo and add this guide as `Krishna_Chatbot_Master_Guide.md`.
2. Prepare privacy/disclaimer text and a short consent form for voice cloning.
3. Make a 5–10 minute calm voice recording (clean quiet room, WAV, 16–48kHz) and store it securely.
4. Start Phase 1: spin up FastAPI + React skeleton and plug emotion detector.

---

## 15. Appendix: Helpful links

- OpenAI docs — platform/openai
- ElevenLabs docs — elevenlabs.io/docs
- Bhagavad Gita API — https://bhagavadgita.theaum.org/
- Hugging Face `j-hartmann/emotion-english-distilroberta-base`


---

*Prepared: Krishna_Chatbot_Master_Guide.md — English, Web, ElevenLabs voice cloning included.*

*If you want, I can now:*
- generate the FastAPI + React starter repository files, or
- produce the exact `README.md` and `backend` skeleton code next, or
- draft the voice consent form text for you to use.

Which of these would you like me to produce now?

