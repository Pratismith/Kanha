# backend/app/krishna_guide.py
from transformers import pipeline
import random

# Load a conversational model (BlenderBot is good for calm, understanding tone)
krishna_generator = pipeline("text2text-generation", model="facebook/blenderbot-400M-distill")

# Some Bhagavad Gita-inspired wisdom snippets
GITA_QUOTES = [
    "The soul is neither born, nor does it ever die. 🌼",
    "You have the right to perform your duty, but not to the fruits thereof.",
    "Calmness in action is true yoga, my friend.",
    "When meditation is mastered, the mind is unwavering like a lamp in a windless place.",
    "Let go of what you cannot control, and peace will follow."
]

def generate_krishna_reply(user_message: str, emotion: str) -> str:
    """
    Generate a Krishna-style response using a conversational model
    and optionally enrich with Gita wisdom.
    """
    try:
        # Generate thoughtful response
        prompt = f"As Lord Krishna, respond as a wise, compassionate friend to someone feeling {emotion}. Message: {user_message}"
        response = krishna_generator(prompt, max_length=120, num_return_sequences=1)[0]['generated_text']

        # Occasionally add a quote
        if random.random() < 0.4:
            response += f" 🌿\n\nGita says: \"{random.choice(GITA_QUOTES)}\""

        return response.strip()
    except Exception as e:
        print("Error generating Krishna reply:", e)
        return "My friend, stay calm. Even in confusion, love and clarity will guide you. 🌸"
