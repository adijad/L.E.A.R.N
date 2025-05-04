// ChatWindow.js
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './index.css'; // Your shared styles

// --- Chat Message Component ---
const ChatMessage = ({ message }) => {
  const { sender, text, type } = message;
  const messageClass = `chat-message ${sender === 'bot' ? 'bot' : 'user'} type-${type}`;

  // If it's a user‐submitted message, check for our three prefixes:
  let content;
  if (sender === 'user') {
    let prefixClass, prefixText, rest;
    if (text.startsWith('Learn more')) {
      prefixText = 'Learn more';
      prefixClass = 'highlight-learn';
    } else if (text.startsWith('Clarify')) {
      prefixText = 'Clarify';
      prefixClass = 'highlight-clarify';
    } else if (text.startsWith('I have a question regarding')) {
      prefixText = 'I have a question regarding';
      prefixClass = 'highlight-question';
    }

    if (prefixText) {
      rest = text.slice(prefixText.length);
      content = (
        <>
          <span className={prefixClass}>{prefixText}</span>
          <span>{rest}</span>
        </>
      );
    } else {
      content = <span>{text}</span>;
    }
  } else {
    // Bot message → render markdown
    content = (
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {text}
      </ReactMarkdown>
    );
  }

  return (
    <div className={messageClass}>
      <div className="message-bubble">{content}</div>
    </div>
  );
};

// --- Chat Window Component ---
const ChatWindow = ({ isOpen, messages = [], showInput, onClose, onQuestionSubmit }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleInputChange = (e) => setInputValue(e.target.value);
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
      <div className="chat-header">
        <h3>L.E.A.R.N Assistant</h3>
        <button
          className="chat-close-button"
          onClick={onClose}
          title="Close Chat"
          aria-label="Close Chat"
        >✕</button>
      </div>

      <div className="chat-messages-area">
        {messages.map(msg => 
          msg.type !== 'question_prompt' && <ChatMessage key={msg.id} message={msg} />
        )}
        <div ref={messagesEndRef} />
      </div>

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
          <button type="submit" disabled={!inputValue.trim()}>Send</button>
        </form>
      )}
    </div>
  );
};

export default ChatWindow;
