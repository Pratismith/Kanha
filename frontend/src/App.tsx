import { useState, useRef, useEffect } from "react";
import axios from "axios";

interface ISpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface ISpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface ISpeechRecognition {
  continuous: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: ISpeechRecognitionEvent) => void;
  onerror: (event: ISpeechRecognitionErrorEvent) => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

interface Message {
  role: "user" | "assistant";
  content: string;
  emotion?: string;
  confidence?: number;
  isCrisis?: boolean;
  timestamp?: string;
}

function emotionIcon(emotion?: string): string {
  switch (emotion) {
    case "joy":
      return "😊";
    case "sadness":
      return "😔";
    case "anger":
      return "😡";
    case "fear":
      return "😨";
    case "surprise":
      return "😲";
    default:
      return "🕉️";
  }
}

function emotionColor(emotion?: string): string {
  switch (emotion) {
    case "joy":
      return "#fff59d";
    case "sadness":
      return "#90caf9";
    case "anger":
      return "#ef9a9a";
    case "fear":
      return "#b39ddb";
    default:
      return "#e0e0e0";
  }
}

// ---- Speech Recognition ----
const SpeechRecognitionConstructor =
  window.SpeechRecognition ?? window.webkitSpeechRecognition;

const recognition = SpeechRecognitionConstructor
  ? new SpeechRecognitionConstructor()
  : null;

if (recognition) {
  recognition.continuous = false;
  recognition.lang = "en-US";
}

function App() {
  const [text, setText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🎵 Setup flute background music
  useEffect(() => {
    const audio = new Audio("/flute.mp3");
    audio.loop = true;
    audio.volume = 0.25;
    audioRef.current = audio;

    const tryPlay = () => {
      audio.play().then(() => {
        setIsMusicPlaying(true);
        document.removeEventListener("click", tryPlay);
      }).catch(() => {});
    };

    // Autoplay policy fix — wait for click
    document.addEventListener("click", tryPlay);

    return () => {
      audio.pause();
      document.removeEventListener("click", tryPlay);
    };
  }, []);

  // 🎚️ Smooth fade-in/out for volume
  const fadeAudio = (targetVolume: number, duration = 800) => {
    const audio = audioRef.current;
    if (!audio) return;
    const startVolume = audio.volume;
    const diff = targetVolume - startVolume;
    const steps = 30;
    const step = diff / steps;
    const interval = duration / steps;
    let count = 0;
    const fade = setInterval(() => {
      count++;
      audio.volume = Math.max(0, Math.min(1, startVolume + step * count));
      if (count >= steps) clearInterval(fade);
    }, interval);
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMusicPlaying) {
      fadeAudio(0, 700);
      setTimeout(() => audio.pause(), 700);
    } else {
      audio.play();
      fadeAudio(0.25, 700);
    }

    setIsMusicPlaying(!isMusicPlaying);
  };

  // 🎶 Adjust background music mood by emotion
  useEffect(() => {
    if (!audioRef.current) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;

    if (last.emotion === "sadness") fadeAudio(0.15, 1000);
    else if (last.emotion === "joy") fadeAudio(0.3, 1000);
    else fadeAudio(0.25, 1000);
  }, [messages]);

  // 🧘‍♀️ Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startListening = () => {
    if (!recognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    try {
      recognition.start();
    } catch {
      recognition.stop();
      setTimeout(() => recognition.start(), 300);
    }

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
    };

    recognition.onerror = (err: ISpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", err);
    };
  };

  const speak = (text: string) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const voice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.toLowerCase().includes("female") ||
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("susan") ||
          v.name.toLowerCase().includes("google"))
    );
    utterance.voice = voice || voices[0];
    utterance.rate = 0.95;
    utterance.pitch = 1.15;
    utterance.volume = 1;
    utterance.lang = "en-US";
    synth.speak(utterance);
  };

  const send = async () => {
    if (!text.trim()) return;
    const userMessage: Message = {
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setText("");
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/chat", {
        userId: "user1",
        message: userMessage.content,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: res.data.text,
        emotion: res.data.emotion,
        confidence: res.data.confidence,
        isCrisis: res.data.isCrisis,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      speak(assistantMessage.content);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Server error. Please try again.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "90%",
        maxWidth: "900px",
        margin: "auto",

        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(to bottom, #fdfbfb, #ebedee)",
        padding: "20px",
        borderRadius: "20px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        position: "relative",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#5e35b1", marginBottom: 16 }}>
        <span style={{ display: "block", fontSize: 28 }}>"Talk to Kanha"</span>
        <span style={{ display: "block", fontSize: 16, marginTop: 6 }}>your Safe Space </span>
      </h1>

      {/* 🎶 Music Toggle Button */}
      <button
        onClick={toggleMusic}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          backgroundColor: isMusicPlaying ? "#8bc34a" : "#ef5350",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: 48,
          height: 48,
          fontSize: 22,
          cursor: "pointer",
          boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
          transition: "0.3s ease",
        }}
        title={isMusicPlaying ? "Turn off music" : "Turn on music"}
      >
        {isMusicPlaying ? "🔊" : "🔇"}
      </button>

      {/* Chat Messages */}
      <div
        style={{
          border: "1px solid #db4949ff",
          padding: 16,
          minHeight: 400,
          maxHeight: 500,
          marginBottom: 12,
          borderRadius: 16,
          background: "#f5f5f5",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "assistant" ? "flex-start" : "flex-end",
              background:
                m.role === "assistant" ? emotionColor(m.emotion) : "#64b5f6",
              color: m.role === "assistant" ? "#212121" : "#fff",
              padding: "12px 16px",
              borderRadius: 16,
              marginBottom: 10,
              maxWidth: "80%",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              animation: "fadeIn 0.3s ease-in",
            }}
          >
            <div style={{ fontSize: 14, marginBottom: 4, fontWeight: 600 }}>
              {m.role === "assistant" ? "Krishna" : "You"}{" "}
              <span style={{ fontSize: 12, marginLeft: 8, color: "#555" }}>
                {m.timestamp}
              </span>
            </div>
            <div style={{ fontSize: 16 }}>{m.content}</div>
            {m.role === "assistant" && m.emotion && (
              <div style={{ marginTop: 4 }}>{emotionIcon(m.emotion)}</div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ fontStyle: "italic", color: "#666" }}>
            Krishna is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Textbox */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        rows={3}
        style={{
          width: "100%",
          marginBottom: 12,
          padding: 12,
          borderRadius: 12,
          border: "1px solid #7052a3ff",
          fontSize: 16,
          resize: "none",
          backgroundColor: "#fff",
          color: "#212121",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
        placeholder="Speak your heart... (Shift+Enter for newline)"
      />

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          marginTop: 8,
        }}
      >
        <button
          onClick={send}
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: 12,
            border: "none",
            backgroundColor: "#7052a3ff",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            transition: "0.3s",
            flex: 1,
          }}
        >
          {loading ? "Please wait..." : "Send"}
        </button>
        <button
          onClick={startListening}
          style={{
            padding: "10px 20px",
            borderRadius: 12,
            border: "none",
            backgroundColor: "#29b6f6",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            transition: "0.3s",
            flex: 1,
          }}
        >
          🎤 Speak
        </button>
      </div>
    </div>
  );
}

export default App;
