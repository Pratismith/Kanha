from transformers import pipeline
import random
import re
import warnings
warnings.filterwarnings("ignore", message="Setting `pad_token_id`")

# ✅ Lightweight and faster model
chat_model = pipeline(
    "text-generation",
    model="microsoft/DialoGPT-small",
    truncation=True,
    max_new_tokens=80,
    temperature=0.7,
    do_sample=True,
    pad_token_id=50256
)

# --- Bhagavad Gita quotes ---
GITA_QUOTES = {
    "sadness": [
        "Do not grieve, for the wise lament neither for the living nor the dead. (Gita 2.11)",
        "Even sorrow transforms the heart towards strength. 🌿"
    ],
    "joy": [
        "Your joy is divine when it flows from within. 🌸",
        "True joy arises from self-realization, not from results. (Gita 5.22)"
    ],
    "anger": [
        "From anger comes delusion, and from delusion loss of memory. (Gita 2.63)",
        "Peace is born when anger subsides. 🌼"
    ],
    "fear": [
        "Fear fades where faith grows. (Gita 4.10)",
        "Be fearless, for I am with you always. (Gita 9.22)"
    ],
    "default": [
        "Perform your duty without attachment to results. (Gita 2.47)",
        "I am here, my friend. Speak your heart freely. 🕉️"
    ]
}

def krishna_response(user_input: str, emotion: str = "default") -> str:
    """
    Generate a Krishna-like compassionate response infused with Bhagavad Gita wisdom.
    """
    try:
        # Shorter, clearer prompt
        prompt = (
            f"You are Lord Krishna, offering wisdom to a friend who says: '{user_input}' "
            f"Krishna Says...."
        )

        # Generate reply
        raw = chat_model(prompt)[0]["generated_text"]

        # --- 🧹 Clean the output ---
        # Remove the echoed user input and instruction
        response = re.sub(rf".*{re.escape(user_input)}['\"].*?:", "", raw, flags=re.IGNORECASE)
        response = re.sub(rf".*{re.escape(user_input)}['\"]", "", response, flags=re.IGNORECASE)
        response = re.sub(r"\s+", " ", response).strip()

        # Cut off excessive text
        if len(response.split()) > 40:
            response = " ".join(response.split()[:40]) + "..."

        # Pick a Gita quote for emotional depth
        quote = random.choice(GITA_QUOTES.get(emotion, GITA_QUOTES["default"]))
        final = f"{response}\n\n{quote}"

        return final.strip()

    except Exception as e:
        print("Error generating Krishna response:", e)
        return random.choice(GITA_QUOTES["default"])
