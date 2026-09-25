"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  type?: "chat" | "image" | "voice" | "error";
  content?: string;
  image?: string;
  audio?: string;
  prompt?: string;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = message.trim();

    if (!text || loading) return;

    setMessage("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        type: "chat",
        content: text,
      },
    ]);

    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          type: data.type,
          content: data.reply,
          image: data.image,
          audio: data.audio,
          prompt: data.prompt,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          type: "error",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (loading) return;
    setMessages([]);
    setMessage("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const usePrompt = (prompt: string) => {
    setMessage(prompt);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <main className="app-shell">
      {/* Header */}
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-mark">
              <span />
              <span />
              <span />
            </div>

            <span className="brand-name">Austin</span>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearChat}
              disabled={loading}
              className="clear-button"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
              </svg>

              <span>Clear</span>
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <div className="page-content">
        {messages.length === 0 ? (
          <section className="welcome">
            <div className="welcome-logo">
              <span />
              <span />
              <span />
            </div>

            <h1>What can I help you with?</h1>

            <p>
              Ask anything, create an image, or generate voice content.
            </p>

            <div className="quick-actions">
              <button
                onClick={() => usePrompt("Explain something to me")}
                className="quick-card"
              >
                <div className="quick-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 3v18" />
                    <path d="M3 12h18" />
                  </svg>
                </div>

                <div>
                  <strong>Ask anything</strong>
                  <span>Get help with any topic</span>
                </div>
              </button>

              <button
                onClick={() =>
                  usePrompt(
                    "/image a futuristic black sports car in a dark studio"
                  )
                }
                className="quick-card"
              >
                <div className="quick-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="8.5" cy="9" r="1.5" />
                    <path d="m21 15-5-5L5 20" />
                  </svg>
                </div>

                <div>
                  <strong>Create an image</strong>
                  <span>Generate with /image</span>
                </div>
              </button>

              <button
                onClick={() =>
                  usePrompt(
                    "/voice Hello, welcome to my AI assistant."
                  )
                }
                className="quick-card"
              >
                <div className="quick-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="9" y="3" width="6" height="12" rx="3" />
                    <path d="M5 11a7 7 0 0 0 14 0" />
                    <path d="M12 18v3" />
                    <path d="M8 21h8" />
                  </svg>
                </div>

                <div>
                  <strong>Create voice</strong>
                  <span>Generate with /voice</span>
                </div>
              </button>
            </div>
          </section>
        ) : (
          <section className="conversation">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-row ${
                  msg.role === "user"
                    ? "message-row-user"
                    : "message-row-assistant"
                }`}
              >
                {msg.role === "user" ? (
                  <div className="user-message">
                    {msg.content}
                  </div>
                ) : (
                  <div className="assistant-message">
                    {msg.type === "chat" && (
                      <div className="assistant-content">
                        {msg.content}
                      </div>
                    )}

                    {msg.type === "image" && msg.image && (
                      <div className="media-card">
                        <div className="media-header">
                          <div className="media-title">
                            <div className="media-icon">
                              <svg
                                width="17"
                                height="17"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <rect
                                  x="3"
                                  y="4"
                                  width="18"
                                  height="16"
                                  rx="2"
                                />
                                <circle cx="8.5" cy="9" r="1.5" />
                                <path d="m21 15-5-5L5 20" />
                              </svg>
                            </div>

                            <span>Generated image</span>
                          </div>

                          <a
                            href={msg.image}
                            download="generated-image.png"
                            className="download-button"
                          >
                            Download
                          </a>
                        </div>

                        <div className="image-container">
                          <img
                            src={msg.image}
                            alt={msg.prompt || "Generated image"}
                          />
                        </div>

                        {msg.prompt && (
                          <div className="media-prompt">
                            <span>Prompt</span>
                            <p>{msg.prompt}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {msg.type === "voice" && msg.audio && (
                      <div className="media-card voice-card">
                        <div className="media-header">
                          <div className="media-title">
                            <div className="media-icon">
                              <svg
                                width="17"
                                height="17"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <rect
                                  x="9"
                                  y="3"
                                  width="6"
                                  height="12"
                                  rx="3"
                                />
                                <path d="M5 11a7 7 0 0 0 14 0" />
                                <path d="M12 18v3" />
                                <path d="M8 21h8" />
                              </svg>
                            </div>

                            <span>Generated voice</span>
                          </div>

                          <a
                            href={msg.audio}
                            download="generated-voice.wav"
                            className="download-button"
                          >
                            Download
                          </a>
                        </div>

                        <audio
                          controls
                          src={msg.audio}
                          className="audio-player"
                        />

                        {msg.prompt && (
                          <div className="media-prompt">
                            <span>Text</span>
                            <p>{msg.prompt}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {msg.type === "error" && (
                      <div className="error-card">
                        <div className="error-icon">
                          !
                        </div>

                        <div>
                          <strong>Something went wrong</strong>
                          <p>{msg.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="message-row message-row-assistant">
                <div className="assistant-message">
                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </section>
        )}
      </div>

      {/* Composer */}
      <div className="composer-area">
        <div className="composer-wrapper">
          <div className="composer">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message..."
              disabled={loading}
            />

            <button
              onClick={sendMessage}
              disabled={!message.trim() || loading}
              className="send-button"
              aria-label="Send message"
            >
              {loading ? (
                <div className="send-spinner" />
              ) : (
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 19V5" />
                  <path d="m6 11 6-6 6 6" />
                </svg>
              )}
            </button>
          </div>

          <div className="command-bar">
            <button
              onClick={() => usePrompt("/image ")}
              disabled={loading}
            >
              <span className="command-symbol">+</span>
              Image
            </button>

            <button
              onClick={() => usePrompt("/voice ")}
              disabled={loading}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="9" y="3" width="6" height="12" rx="3" />
                <path d="M5 11a7 7 0 0 0 14 0" />
              </svg>
              Voice
            </button>

            <span className="composer-hint">
              Enter to send
            </span>
          </div>

          <p className="disclaimer">
            AI can make mistakes. Check important information.
          </p>
        </div>
      </div>
    </main>
  );
}