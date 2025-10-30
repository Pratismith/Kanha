# 🕉️ Talk to Kanha — Your Safe Space

**Talk to Kanha** is an AI-driven **emotional support and guidance chatbot** inspired by the teachings of *Lord Krishna* from the **Bhagavad Gita**.
It blends **emotion-aware conversation**, **AI-based response generation**, and **spiritual comfort** to create a warm, reflective, and human-like chat experience.

---

## 🌼 Project Overview

The core idea behind *Talk to Kanha* is to build a **safe digital space** where users can openly express emotions such as sadness, anger, fear, or confusion — and receive **empathetic, spiritually inspired guidance** in return.
The chatbot listens like a friend, responds like Krishna, and reflects timeless wisdom in short, poetic messages.

---

## ✨ Key Features

### 🧠 1. Emotion Detection (AI-Powered)

* Integrated a **DistilRoBERTa emotion classification model** fine-tuned on multi-emotion datasets.
* Detects emotions such as *joy, sadness, anger, fear, surprise, and neutral* in real time.
* Automatically adjusts the tone, wisdom quote, and music mood based on the detected emotion.

---

### 💬 2. Krishna-Inspired Conversational AI

* Uses a **fine-tuned conversational transformer** to generate short, poetic, and wise responses based on the Bhagavad Gita.
* Combines **contextual understanding** and **Bhagavad Gita quotes** to deliver human-like replies that feel spiritually uplifting.
* Ensures every message carries calmness, empathy, and insight — as if you were speaking to a divine friend.

---

### 🎧 3. Emotion-Synced Background Music

* Integrated **realistic bansuri (flute) and ambient soundscapes** for a meditative experience.
* The background audio **adapts dynamically** to the user’s emotional state — calm when sad, joyful when happy.
* Smooth fade-in/out transitions ensure an immersive and peaceful chat flow.

---

### 🎤 4. Voice Interaction Support

* Added **speech-to-text recognition** using browser APIs for hands-free conversations.
* Includes **text-to-speech playback** so Krishna’s responses are spoken aloud in a calm, natural voice.
* Perfect for users seeking a soothing, human-like interaction experience.

---

### 🪷 5. Intuitive and Minimal UI (React + TypeScript)

* Built a **responsive, modern chat interface** using React and TypeScript.
* Features a clean, gradient-based layout with animated emotion bubbles and timestamped messages.
* Auto-scroll, smooth transitions, and dynamic emojis bring life and warmth to the experience.
* Integrated **flute music control**, **emotion-based color themes**, and **speech buttons** seamlessly.

---

### ⚙️ 6. FastAPI Backend (Python)

* Developed a **modular backend** with FastAPI for high performance and clarity.
* Separate modules for:

  * Emotion detection (`emotion.py`)
  * Krishna-inspired response generation (`gita_response.py`)
  * API endpoints (`main.py`)
* Implemented structured error handling, tokenized response generation, and GPU fallback for efficiency.

---

### ☁️ 7. Modular Architecture

* Clear folder separation for **frontend**, **backend**, and **middleware** components.
* Scalable design for integrating future AI models, database support, and personalized recommendations.

---

## 🚀 Technology Stack

| Component               | Technology                                           |
| ----------------------- | ---------------------------------------------------- |
| **Frontend**            | React + TypeScript + Axios                           |
| **Backend**             | FastAPI (Python)                                     |
| **AI Models**           | Transformers (HuggingFace)                           |
| **Emotion Analysis**    | `bhadresh-savani/bert-base-uncased-emotion`          |
| **Response Generation** | DialoGPT + Gita Wisdom Layer                         |
| **Voice Interface**     | Web Speech API (SpeechRecognition & SpeechSynthesis) |
| **Styling**             | CSS + Gradient UI + Custom animations                |
| **Music**               | Realistic flute ambience with adaptive mood control  |

---

## 🛠️ Development Journey

**Phase 1:**

* Created the initial Krishna chatbot with text input/output and Gita-based static responses.

**Phase 2 (Current Version):**

* Integrated real-time **emotion detection**, **AI-generated contextual replies**, and **background music synchronization**.
* Added **speech features**, **clean UI**, and **responsive design**.

**Phase 3 (In Progress):**

* Currently working on **training a fine-tuned conversational model** capable of generating **more authentic Krishna-based responses**,
  reflecting deeper mythological context and personalized guidance.

---

## 🌸 Vision

To create a **spiritually intelligent AI companion** that not only converses but also **heals, guides, and uplifts** —
merging modern AI with timeless Indian philosophy.

---

## 🪔 Phase 2 is Live

I am currently working on **Phase 3**, where the focus is on building **more accurate Krishna-like response generation** using fine-tuned AI models and contextual memory.


