import { useState } from "react";
import axios from "axios";

interface Message {
  role: "user" | "assistant";
  content: string;
  emotion?: string;
  confidence?: number;
  isCrisis?: boolean;
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
      return "#fff9c4"; // deeper yellow
    case "sadness":
      return "#bbdefb"; // deeper blue
    case "anger":
      return "#ffcdd2"; // deeper red
    case "fear":
      return "#d1c4e9"; // deeper lavender
    default:
      return "#e0e0e0"; // deeper gray
  }
}

function App() {
  const [text, setText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const send = async () => {
    if (!text.trim()) return;
    const userMessage: Message = { role: "user", content: text };
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
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Server error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Krishna Chat — "Talk to your Kanha" 🌼</h1>

      <div
        style={{
          border: "1px solid #db4949ff",
          padding: 16,
          minHeight: 200,
          marginBottom: 12,
          borderRadius: 8,
          background: "#f5f5f5",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              background: m.role === "assistant" ? emotionColor(m.emotion) : "#e3f2fd",
              padding: 8,
              borderRadius: 6,
              marginBottom: 8,
              border: "1px solid rgba(0,0,0,0.1)",
              color: "#212121",
            }}
          >
            <b>{m.role === "assistant" ? "Krishna" : "You"}</b>: {m.content}{" "}
            {m.role === "assistant" && m.emotion && (
              <span title={m.emotion}>{emotionIcon(m.emotion)}</span>
            )}
          </div>
        ))}
        {loading && <div><i>Krishna is thinking...</i></div>}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        style={{ width: "100%", marginBottom: 8 }}
        placeholder="Speak your heart..."
      />
      <button onClick={send} disabled={loading} style={{ padding: "8px 16px" }}>
        {loading ? "Please wait..." : "Send"}
      </button>
    </div>
  );
}

export default App;