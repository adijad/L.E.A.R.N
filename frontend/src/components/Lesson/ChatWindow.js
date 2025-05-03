// ChatWindow.js
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './index.css'; // Your existing styles

// --- Chat Message Component ---
const ChatMessage = ({ message }) => {
  const { sender, text, type } = message;
  const messageClass = `chat-message ${sender === 'bot' ? 'bot' : 'user'} type-${type}`;

  return (
    <div className={messageClass}>
      <div className="message-bubble">
        {sender === 'bot' ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {text}
          </ReactMarkdown>
        ) : (
          <p>{text}</p>
        )}
      </div>
    </div>
  );
};

// --- Chat Window Component ---
const ChatWindow = ({ isOpen, messages = [], showInput, onClose, onQuestionSubmit }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // scroll to bottom when messages change or window opens
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      onQuestionSubmit(trimmed);
      setInputValue('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-window-container">
      {/* Header */}
      <div className="chat-header">
        <h3>Chat Assistant</h3>
        <button
          className="chat-close-button"
          onClick={onClose}
          title="Close Chat"
          aria-label="Close Chat"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages-area">
        {messages.map(msg =>
          msg.type !== 'question_prompt' && <ChatMessage key={msg.id} message={msg} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {showInput && (
        <form className="chat-input-area" onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type your question here..."
            aria-label="Type your question"
            autoFocus
          />
          <button type="submit" disabled={!inputValue.trim()}>
            Send
          </button>
        </form>
      )}
    </div>
  );
};

export default ChatWindow;
