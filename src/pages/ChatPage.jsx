import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import qa from "../data/qa.json";

const FALLBACK_ANSWER =
  "Hmm, I don't have something saved for that exact question. Try asking about a prophet or a pillar — like what Alma taught about repentance, or what baptism is about.";

const SUGGESTED_CHIPS = [
  "What is the Doctrine of Christ?",
  "Who best exemplifies baptism?",
  "What did Nephi teach about faith?",
  "What is the baptismal covenant?",
  "What did Moroni promise?",
  "How do I apply this today?",
];

const RESPONSE_DELAY_MS = 800;
const TYPEWRITER_MS = 14;

function tokenize(s) {
  return (s.toLowerCase().match(/[a-z0-9']+/g) ?? []).filter(Boolean);
}

function matchQa(userText) {
  const uWords = tokenize(userText);
  let bestEntry = qa[0];
  let bestScore = -1;
  for (const entry of qa) {
    const qWords = new Set(tokenize(entry.question));
    let score = 0;
    for (const w of uWords) {
      if (qWords.has(w)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }
  if (bestScore <= 1) {
    return { answer: FALLBACK_ANSWER, score: bestScore };
  }
  return { answer: bestEntry.answer, score: bestScore };
}

export default function ChatPage() {
  const [searchParams] = useSearchParams();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSuggestions, setDropdownSuggestions] = useState([]);

  const initializedFromUrl = useRef(false);
  const delayTimerRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const blurCloseTimerRef = useRef(null);

  const assistantBusy = loading || isTyping;

  useEffect(() => {
    document.title = "Ask the Tutor | Doctrine of Christ Explorer";
  }, []);

  useEffect(() => {
    return () => {
      if (delayTimerRef.current != null) {
        clearTimeout(delayTimerRef.current);
      }
      if (typingIntervalRef.current != null) {
        clearInterval(typingIntervalRef.current);
      }
      if (blurCloseTimerRef.current != null) {
        clearTimeout(blurCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (initializedFromUrl.current) return;
    const prophet = searchParams.get("prophet");
    const pillar = searchParams.get("pillar");
    if (prophet && pillar) {
      setInput(`Tell me what ${prophet} taught about ${pillar}`);
      initializedFromUrl.current = true;
    }
  }, [searchParams]);

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isTyping]);

  function sendMessage(textOverride) {
    const raw = textOverride ?? input;
    const text = typeof raw === "string" ? raw.trim() : "";
    if (!text || assistantBusy) return;

    setShowDropdown(false);
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setLoading(true);
    if (delayTimerRef.current != null) {
      clearTimeout(delayTimerRef.current);
    }
    if (typingIntervalRef.current != null) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    delayTimerRef.current = window.setTimeout(() => {
      delayTimerRef.current = null;
      const { answer } = matchQa(text);
      setLoading(false);
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setIsTyping(true);

      let i = 0;
      typingIntervalRef.current = window.setInterval(() => {
        i += 1;
        const slice = answer.slice(0, i);
        setMessages((prev) => {
          const next = [...prev];
          const lastIdx = next.length - 1;
          if (lastIdx < 0) return prev;
          const last = next[lastIdx];
          if (last?.role !== "assistant") return prev;
          next[lastIdx] = { ...last, content: slice };
          return next;
        });
        if (i >= answer.length) {
          if (typingIntervalRef.current != null) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          setIsTyping(false);
        }
      }, TYPEWRITER_MS);
    }, RESPONSE_DELAY_MS);
  }

  function handleInputChange(e) {
    const value = e.target.value;
    setInput(value);
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setShowDropdown(false);
      return;
    }
    const lower = trimmed.toLowerCase();
    const matches = qa
      .filter((entry) => entry.question.toLowerCase().includes(lower))
      .slice(0, 5);
    setDropdownSuggestions(matches);
    setShowDropdown(true);
  }

  function handleInputBlur() {
    blurCloseTimerRef.current = window.setTimeout(() => {
      blurCloseTimerRef.current = null;
      setShowDropdown(false);
    }, 150);
  }

  function handleInputFocus() {
    if (blurCloseTimerRef.current != null) {
      clearTimeout(blurCloseTimerRef.current);
      blurCloseTimerRef.current = null;
    }
  }

  function handleInputKeyDown(e) {
    if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-suggestions">
            <p>Try asking:</p>
            <div className="chat-chips chat-chips--grid">
              {SUGGESTED_CHIPS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => sendMessage(label)}
                  className="chat-chip-btn"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((m, i) => {
          const showCaret =
            isTyping &&
            m.role === "assistant" &&
            i === messages.length - 1;
          return (
            <div
              key={`${i}-${m.role}`}
              className={`chat-msg-row ${m.role === "user" ? "user" : "assistant"}`}
            >
              <div className={`chat-bubble ${m.role}`}>
                {m.content}
                {showCaret ? (
                  <span className="chat-type-cursor" aria-hidden>
                    ▍
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}

        {loading ? (
          <div className="chat-msg-row assistant">
            <div
              className="chat-typing-dots"
              role="status"
              aria-label="Assistant is typing"
            >
              <span className="chat-typing-dot" />
              <span className="chat-typing-dot" />
              <span className="chat-typing-dot" />
            </div>
          </div>
        ) : null}

        <div ref={endRef} />
      </div>

      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          {showDropdown ? (
            <div
              role="listbox"
              aria-label="Question suggestions"
              style={{
                position: "absolute",
                bottom: "100%",
                left: 0,
                right: 0,
                zIndex: 50,
                marginBottom: 4,
                maxHeight: 280,
                overflow: "hidden",
                background: "#fff",
                border: "1px solid #d3d3d3",
                borderRadius: 8,
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)",
              }}
            >
              {dropdownSuggestions.length > 0
                ? dropdownSuggestions.map((entry) => (
                    <button
                      key={entry.question}
                      type="button"
                      role="option"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setInput(entry.question);
                        sendMessage(entry.question);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 12px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: "inherit",
                        fontFamily: "inherit",
                        color: "#002E5D",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#EBF3FB";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {entry.question}
                    </button>
                  ))
                : (
                    <button
                      type="button"
                      role="option"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => sendMessage()}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 12px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: "inherit",
                        fontFamily: "inherit",
                        color: "#888",
                        fontStyle: "italic",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#EBF3FB";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      Press Enter to send your own question
                    </button>
                  )}
            </div>
          ) : null}
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            onKeyDown={handleInputKeyDown}
            placeholder="Ask about the Doctrine of Christ…"
            className="chat-input"
            disabled={assistantBusy}
            autoComplete="off"
            style={{ width: "100%" }}
          />
        </div>
        <button
          type="submit"
          aria-label="Send message"
          disabled={assistantBusy || !input.trim()}
          className="chat-send"
        >
          Send
        </button>
      </form>
    </div>
  );
}
