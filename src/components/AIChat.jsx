import { useState, useRef, useEffect } from "react";
import axios from "axios";

function AIChat({ userStatus }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  // 1. Load messages from LocalStorage
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("chat_history");
    return savedMessages
      ? JSON.parse(savedMessages)
      : [
          {
            role: "assistant",
            content: `היי ${userStatus.name}, אני העוזר האישי שלך. איך אפשר לעזור לך היום בשבוע ${userStatus.currentWeek}?`,
          },
        ];
  });

  // 2. Auto-scroll and Save History
  useEffect(() => {
    localStorage.setItem("chat_history", JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  // 3. Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const clearChat = () => {
    const initialMsg = [
      {
        role: "assistant",
        content: `היי ${userStatus.name}, התחלנו צ'אט חדש. איך אפשר לעזור?`,
      },
    ];
    setMessages(initialMsg);
    localStorage.removeItem("chat_history");
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user", content: input };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post("/api/ai/chat", {
        messages: updatedMessages,
        currentWeek: userStatus.currentWeek,
        userName: userStatus.name,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.reply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "מצטער, חלה שגיאה בחיבור." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="chat-widget-container"
      style={{ position: "fixed", bottom: "20px", left: "20px", zIndex: 1000 }}
    >
      <style>
        {`
          @keyframes fadeInUpCustom {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-chat { animation: fadeInUpCustom 0.4s ease-out; }
          
          /* Remove Bootstrap focus borders and the gray line */
          .custom-input-group:focus-within {
            border-color: #0d6efd !important;
            box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
          }
          .chat-textarea:focus {
            outline: none !important;
            box-shadow: none !important;
          }
          .chat-textarea::-webkit-scrollbar { width: 4px; }
          .chat-textarea::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
        `}
      </style>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center"
        style={{ width: "60px", height: "60px", fontSize: "1.5rem" }}
      >
        {isOpen ? "✖" : "💬"}
      </button>

      {isOpen && (
        <div
          className="card shadow-lg mt-2 overflow-hidden animate-chat"
          style={{
            width: "350px",
            position: "absolute",
            bottom: "75px",
            left: "0",
            borderRadius: "15px",
            border: "none",
          }}
        >
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
            <h6 className="mb-0">ליווי הריון חכם ✨</h6>
            <div>
              <button
                className="btn btn-sm btn-outline-light me-2"
                onClick={clearChat}
              >
                🗑️
              </button>
              <button
                className="btn-close btn-close-white"
                onClick={() => setIsOpen(false)}
              ></button>
            </div>
          </div>

          <div
            className="card-body bg-light"
            style={{
              height: "400px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              padding: "15px",
            }}
            ref={scrollRef}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`d-flex mb-3 ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`}
              >
                <div
                  className={`p-2 px-3 shadow-sm ${msg.role === "user" ? "bg-primary text-white" : "bg-white text-dark border"}`}
                  style={{
                    maxWidth: "85%",
                    fontSize: "0.9rem",
                    whiteSpace: "pre-wrap",
                    borderRadius:
                      msg.role === "user"
                        ? "15px 15px 0 15px"
                        : "15px 15px 15px 0",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-muted small">מעבד...</div>}
          </div>

          <div className="card-footer bg-white border-top-0 pt-0">
            <form
              onSubmit={sendMessage}
              className="input-group align-items-end custom-input-group"
              style={{
                border: "1px solid #dee2e6",
                borderRadius: "20px",
                overflow: "hidden",
                backgroundColor: "white",
              }}
            >
              <textarea
                ref={textareaRef}
                className="form-control chat-textarea border-0"
                placeholder="שאלי אותי משהו..."
                rows="1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={isLoading}
                style={{
                  resize: "none",
                  maxHeight: "120px",
                  overflowY: "auto",
                  padding: "12px 15px",
                  lineHeight: "1.4",
                  backgroundColor: "transparent",
                }}
              />
              <button
                className="btn text-primary d-flex align-items-center justify-content-center border-0"
                type="submit"
                disabled={isLoading || !input.trim()}
                style={{
                  height: "48px",
                  padding: "0 15px",
                  backgroundColor: "transparent",
                  fontWeight: "bold",
                  boxShadow: "none",
                }}
              >
                שלחי
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIChat;
