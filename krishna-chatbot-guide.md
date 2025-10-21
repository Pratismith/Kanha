# Krishna Voice Chatbot Development Guide
*Depression Support Through Spiritual Guidance*

## Project Overview
A voice-enabled chatbot that provides spiritual guidance based on Krishna's teachings from the Bhagavad Gita to support individuals dealing with depression.

## Architecture Components

### 1. Backend API (Node.js/Express or Python/FastAPI)
- Handles conversation logic
- Integrates with AI models
- Manages Bhagavad Gita knowledge base
- Coordinates voice processing

### 2. AI Language Model
- **Option A**: Fine-tuned model (bajrangCoder/BhagavadGita on Hugging Face)
- **Option B**: GPT-4 with custom Krishna prompting
- Generates responses aligned with Krishna's wisdom

### 3. Voice Components
- **Speech-to-Text**: User voice input processing
- **Text-to-Speech**: Krishna-like voice responses using voice cloning
- **Voice Cloning**: ElevenLabs or Google Cloud TTS

### 4. Frontend Interface (React/Next.js)
- Chat interface with voice interaction
- Audio controls and recording capabilities
- Responsive design for mobile and desktop

## Step-by-Step Implementation

### Step 1: Knowledge Base Setup

#### Bhagavad Gita APIs (Free)
- **Primary API**: https://bhagavadgita.theaum.org/
- **Alternative**: https://github.com/vedicscriptures/bhagavad-gita-api
- Access to 18 chapters, 700 verses, 21+ translations

#### API Integration Example
```javascript
fetch('https://bhagavadgita.theaum.org/text/translations/2/47')
  .then(response => response.json())
  .then(data => {
    console.log('Verse:', data.data[0].translation);
  });
```

### Step 2: AI Model Implementation

#### Option A: Fine-Tuned Model
```python
from transformers import pipeline

messages = [
    {"role": "system", "content": "You are Lord Krishna and you answer in context to bhagavad gita"},
    {"role": "user", "content": "How can I overcome depression and find purpose?"}
]

chatbot = pipeline("text-generation", model="bajrangCoder/BhagavadGita")
response = chatbot(messages)
```

#### Option B: GPT-4 Custom Prompting
```javascript
const systemPrompt = `You are Lord Krishna, speaking to someone who is suffering from depression and seeking guidance. 
Your responses should be compassionate, drawing from the teachings of the Bhagavad Gita. 
Focus on concepts like dharma (duty), karma yoga (selfless action), detachment from outcomes, 
and finding one's true self beyond temporary suffering. 
Speak with wisdom, empathy, and divine love. Keep responses concise yet profound.`;

const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage }
  ]
});
```

### Step 3: Voice Cloning & TTS Setup

#### ElevenLabs Implementation
```javascript
const ElevenLabs = require('elevenlabs-node');

const voice = new ElevenLabs({
    apiKey: process.env.ELEVENLABS_API_KEY,
    voiceId: "your_cloned_voice_id"
});

async function generateVoiceResponse(text) {
    const audio = await voice.textToSpeech({
        text: text,
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8
        }
    });
    return audio;
}
```

#### Pricing
- **Starter Plan**: $5/month (100,000 characters)
- **Scale Plan**: $99/month (2M characters)

### Step 4: Speech Recognition

#### Web Speech API
```javascript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false;
recognition.lang = 'en-US'; // or 'hi-IN' for Hindi

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    sendMessageToBackend(transcript);
};

recognition.start();
```

#### React Native (for mobile)
```javascript
import Voice from '@react-native-community/voice';

Voice.onSpeechResults = (e) => {
    const userInput = e.value[0];
    processUserMessage(userInput);
};

await Voice.start('en-US');
```

### Step 5: Backend API Development

#### Express.js Server Example
```javascript
const express = require('express');
const { OpenAI } = require('openai');
const app = express();

app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Store conversation history per user
const conversations = {};

app.post('/api/chat', async (req, res) => {
    const { userId, message } = req.body;
    
    // Initialize or retrieve conversation history
    if (!conversations[userId]) {
        conversations[userId] = [{
            role: "system",
            content: `You are Lord Krishna speaking to someone suffering from depression...`
        }];
    }
    
    // Add user message
    conversations[userId].push({
        role: "user",
        content: message
    });
    
    // Get AI response
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: conversations[userId]
    });
    
    const krishnaResponse = response.choices[0].message.content;
    conversations[userId].push(response.choices[0].message);
    
    // Generate voice audio
    const audioBuffer = await generateVoiceResponse(krishnaResponse);
    
    res.json({
        text: krishnaResponse,
        audio: audioBuffer.toString('base64')
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### Step 6: React Frontend Implementation

```javascript
import React, { useState } from 'react';

function KrishnaChatbot() {
    const [messages, setMessages] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const startRecording = () => {
        const recognition = new webkitSpeechRecognition();
        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            await sendMessage(transcript);
        };
        recognition.start();
        setIsRecording(true);
    };

    const sendMessage = async (text) => {
        setMessages(prev => [...prev, { role: 'user', content: text }]);
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userId: 'user123', 
                message: text 
            })
        });
        
        const data = await response.json();
        setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: data.text 
        }]);
        
        // Play audio response
        playAudio(data.audio);
    };

    const playAudio = (base64Audio) => {
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audio.play();
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
    };

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                        {msg.content}
                    </div>
                ))}
            </div>
            <button onClick={startRecording}>
                {isRecording ? 'Listening...' : 'Speak to Krishna'}
            </button>
        </div>
    );
}
```

### Step 7: Deployment Options

#### Frontend (Vercel - Recommended)
```bash
npm install -g vercel
vercel login
vercel
```
- Add environment variables in Vercel dashboard
- Automatic deployments from Git

#### Backend (Render)
- Connect GitHub repository
- Build command: `npm install`
- Start command: `node server.js`
- Add environment variables for API keys

#### Alternative: Netlify
- One-click deploy with OpenAI chatbot template
- Great for static sites with serverless functions

## Ethical & Privacy Considerations

### Safety Protocols
```javascript
const crisisKeywords = ['suicide', 'kill myself', 'end my life', 'want to die'];

function checkForCrisis(message) {
    const containsCrisisKeyword = crisisKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
    );
    
    if (containsCrisisKeyword) {
        return {
            isCrisis: true,
            response: `I'm deeply concerned about what you're experiencing. 
            Please reach out to a crisis counselor immediately:
            National Suicide Prevention Lifeline: 988 (US)
            AASRA: 91-22-27546669 (India)
            These trained professionals can provide the immediate support you need.`
        };
    }
    return { isCrisis: false };
}
```

### Required Disclosures
- Clear AI identification (not real spiritual counselor)
- Not a substitute for professional mental health treatment
- Crisis resources and emergency contacts
- Data privacy and encryption practices

### HIPAA Compliance (if needed)
- Encrypt all data in transit and at rest
- Business Associate Agreements with AI providers
- Audit logging and access controls
- Secure user authentication

## Cost Estimates (Monthly)

### For 1,000 users with 5 conversations each:

**AI Model (GPT-4)**
- Input: ~$150
- Output: ~$300
- **Total**: $450

**Voice Services (ElevenLabs)**
- Starter Plan: $5/month (100k characters)
- Scale Plan: $99/month (2M characters)
- **Recommended**: Scale Plan ($99)

**Hosting**
- Frontend (Vercel): Free tier available
- Backend (Render): $0-25
- **Total**: $0-25

**Monthly Total**: ~$550-575

## Advanced Features Roadmap

### Phase 1: Basic Implementation
- Text-based chat with Krishna prompting
- Basic voice input/output
- Simple web interface

### Phase 2: Enhanced Voice
- Custom voice cloning
- Emotional tone adjustment
- Multilingual support (Hindi/English)

### Phase 3: Personalization
- User conversation history
- Progress tracking
- Personalized spiritual guidance

### Phase 4: Advanced Features
- Emotion detection from voice
- Verse citations with responses
- Mobile app (React Native)
- Meditation timer integration

## Required Dependencies

### Backend
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "openai": "^4.20.1",
    "elevenlabs-node": "^1.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "axios": "^1.5.0"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^13.5.0",
    "tailwindcss": "^3.3.0"
  }
}
```

## Environment Variables

```env
# AI Model
OPENAI_API_KEY=your_openai_api_key

# Voice Services
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_cloned_voice_id

# Database (if using)
DATABASE_URL=your_database_url

# Security
JWT_SECRET=your_jwt_secret
```

## Testing Strategy

### Unit Tests
- AI response generation
- Voice processing functions
- Crisis detection logic

### Integration Tests
- API endpoint functionality
- Voice cloning integration
- Database operations

### User Testing
- Conversation flow quality
- Voice clarity and emotion
- Crisis response accuracy
- Mobile responsiveness

## Monitoring & Analytics

### Key Metrics
- User engagement (messages per session)
- Voice interaction success rate
- Crisis intervention triggers
- Response quality ratings

### Logging
- Conversation metadata (not content for privacy)
- API usage and costs
- Error rates and performance
- User feedback

## Getting Started Checklist

- [ ] Set up development environment
- [ ] Obtain API keys (OpenAI, ElevenLabs)
- [ ] Create voice samples for cloning
- [ ] Set up Bhagavad Gita data source
- [ ] Implement basic chat functionality
- [ ] Add voice input/output
- [ ] Test crisis detection
- [ ] Deploy to staging environment
- [ ] Conduct user testing
- [ ] Launch production version

## Resources & Documentation

### APIs
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [ElevenLabs API Documentation](https://elevenlabs.io/docs)
- [Bhagavad Gita API](https://bhagavadgita.theaum.org/)

### Models
- [BhagavadGita Model on Hugging Face](https://huggingface.co/bajrangCoder/BhagavadGita)

### Deployment
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)

### Ethical Guidelines
- [AI Ethics for Healthcare](https://www.apa.org/topics/artificial-intelligence-machine-learning/ethical-guidance-professional-practice.pdf)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa/index.html)

---

*Last Updated: October 21, 2025*
*Version: 1.0*