"use client";

import React, { useState, useContext, useRef, useEffect } from "react";
import { Popcorn, SendHorizonal, X } from "lucide-react";
import { LanguageContext } from "../context/LanguageContext";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "../styles/MovieChatWidget.css";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function MovieChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("MovieChatWidget must be used within a LanguageProvider");
  }
  const { t, selectedLanguage } = context;

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const languageInstruction = {
        vi: "Hãy trả lời bằng Tiếng Việt.",
        en: "Please answer in English.",
        zh: "请用中文回答 (Please answer in Chinese).",
      }[selectedLanguage] || "Please answer in Vietnamese or English.";

      const fullPrompt = `Bạn là một trợ lý AI chuyên về phim ảnh cho trang web xem phim.
        Hãy trả lời thân thiện, hữu ích, chuyên nghiệp và ngắn gọn.
        Nếu được hỏi về gợi ý phim, hãy đưa ra 3 phim cụ thể và định dạng chúng bằng dấu gạch đầu dòng (bullet points) và chỉ bao gồm tên phim, thể loại và năm phát hành. Không thêm bất kỳ văn bản giải thích nào khác.

        Ví dụ:
        Gợi ý phim hài:
        - The Grand Budapest Hotel (Hài, 2014)
        - La La Land (Nhạc kịch, 2016)
        - Inside Out (Hoạt hình, 2015)

${languageInstruction}
Câu hỏi: ${userMessage.content}`;

      const result = await model.generateContent(fullPrompt);
      const aiResponseText = result.response.text();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponseText,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Gemini error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: t("chatbot_error"),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="chat-widget-container">
        <button className="chat-toggle-button" onClick={toggleChat}>
          {isOpen ? <X className="icon-large" /> : <Popcorn className="icon-large" />}
        </button>
      </div>

      {isOpen && (
        <div className="chat-popup-container">
          <div className="chat-popup-card">
            <header className="chat-header">
              <h1 className="chat-title">
                <span>🤖 {t("chatbot_title")}</span>
                <button className="close-button" onClick={toggleChat}>
                  <X className="icon-small" />
                </button>
              </h1>
            </header>
            <div className="chat-content">
              <div className="chat-messages-container">
                {isTyping && (
                  <div className="message-container justify-start">
                    <div className="ai-message typing-indicator">
                      <span className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </span>
                    </div>
                  </div>
                )}
                {[...messages].reverse().map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-container ${
                      msg.isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`message-bubble ${
                        msg.isUser ? "user-message" : "ai-message"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-input-area">
                <input
                  className="chat-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t("chatbot_placeholder")}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={isTyping}
                />
                <button
                  onClick={handleSend}
                  className="send-button"
                  disabled={isTyping}
                >
                  <SendHorizonal className="icon-small" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}