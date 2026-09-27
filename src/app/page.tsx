"use client";

import { useEffect, useRef, useState } from "react";
import { generateImage } from "@/lib/image-generator";

type Message = {
  role: "user" | "assistant";
  type?: "chat" | "image" | "error";
  content?: string;
  image?: string;
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

    // Add user message
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
      // =====================================================
      // IMAGE GENERATION - PUTER IN THE BROWSER
      // =====================================================

      if (text.toLowerCase().startsWith("/image")) {
        const prompt = text
          .slice("/image".length)
          .trim();

        if (!prompt) {
          throw new Error(
            "Please provide an image prompt."
          );
        }

        console.log(
          "Generating image:",
          prompt
        );

        const image = await generateImage(prompt);

        console.log(
          "Image generated successfully"
        );

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            type: "image",
            image,
            prompt,
          },
        ]);

        return;
      }

      // =====================================================
      // NORMAL CHAT - OPENROUTER API
      // =====================================================

      const response = await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: text,
        }),
      });

      // Read response safely
      const responseText = await response.text();

      let data: {
        type?: "chat";
        reply?: string;
        error?: string;
      } = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Server returned an invalid response (${response.status}).`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Request failed (${response.status}).`
        );
      }

      if (!data.reply) {
        throw new Error(
          "The AI returned an empty response."
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          type: "chat",
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error(
        "Request failed:",
        error
      );

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
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-mark">
              <span />
              <span />
              <span />
            </div>

            <span className="brand-name">
              Austin
            </span>
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

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="page-content">
        {messages.length === 0 ? (
          // =================================================
          // WELCOME SCREEN
          // =================================================

          <section className="welcome">
            <div className="welcome-logo">
              <span />
              <span />
              <span />
            </div>

            <h1>
              What can I help you with?
            </h1>

            <p>
              Ask anything or create an image.
            </p>

            <div className="quick-actions">
              {/* Ask anything */}

              <button
                onClick={() =>
                  usePrompt(
                    "Explain something to me"
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
                    <path d="M12 3v18" />
                    <path d="M3 12h18" />
                  </svg>
                </div>

                <div>
                  <strong>
                    Ask anything
                  </strong>

                  <span>
                    Get help with any topic
                  </span>
                </div>
              </button>

              {/* Create image */}

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
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="16"
                      rx="2"
                    />

                    <circle
                      cx="8.5"
                      cy="9"
                      r="1.5"
                    />

                    <path d="m21 15-5-5L5 20" />
                  </svg>
                </div>

                <div>
                  <strong>
                    Create an image
                  </strong>

                  <span>
                    Generate with /image
                  </span>
                </div>
              </button>
            </div>
          </section>
        ) : (
          // =================================================
          // CONVERSATION
          // =================================================

          <section className="conversation">
            {messages.map(
              (msg, index) => (
                <div
                  key={index}
                  className={`message-row ${
                    msg.role === "user"
                      ? "message-row-user"
                      : "message-row-assistant"
                  }`}
                >
                  {msg.role === "user" ? (
                    // =========================================
                    // USER MESSAGE
                    // =========================================

                    <div className="user-message">
                      {msg.content}
                    </div>
                  ) : (
                    // =========================================
                    // ASSISTANT MESSAGE
                    // =========================================

                    <div className="assistant-message">
                      {/* Normal chat */}

                      {msg.type === "chat" && (
                        <div className="assistant-content">
                          {msg.content}
                        </div>
                      )}

                      {/* Generated image */}

                      {msg.type === "image" &&
                        msg.image && (
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

                                    <circle
                                      cx="8.5"
                                      cy="9"
                                      r="1.5"
                                    />

                                    <path d="m21 15-5-5L5 20" />
                                  </svg>
                                </div>

                                <span>
                                  Generated image
                                </span>
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
                                alt={
                                  msg.prompt ||
                                  "Generated image"
                                }
                              />
                            </div>

                            {msg.prompt && (
                              <div className="media-prompt">
                                <span>
                                  Prompt
                                </span>

                                <p>
                                  {msg.prompt}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                      {/* Error */}

                      {msg.type === "error" && (
                        <div className="error-card">
                          <div className="error-icon">
                            !
                          </div>

                          <div>
                            <strong>
                              Something went wrong
                            </strong>

                            <p>
                              {msg.content}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            )}

            {/* =================================================
                LOADING INDICATOR
            ================================================== */}

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

      {/* =====================================================
          COMPOSER
      ====================================================== */}

      <div className="composer-area">
        <div className="composer-wrapper">
          <div className="composer">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();

                  sendMessage();
                }
              }}
              placeholder="Message..."
              disabled={loading}
            />

            <button
              onClick={sendMessage}
              disabled={
                !message.trim() ||
                loading
              }
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

          {/* =================================================
              COMMAND BAR
          ================================================== */}

          <div className="command-bar">
            <button
              onClick={() =>
                usePrompt("/image ")
              }
              disabled={loading}
            >
              <span className="command-symbol">
                +
              </span>

              Image
            </button>

            <span className="composer-hint">
              Enter to send
            </span>
          </div>

          <p className="disclaimer">
            AI can make mistakes. Check important
            information.
          </p>
        </div>
      </div>
    </main>
  );
}