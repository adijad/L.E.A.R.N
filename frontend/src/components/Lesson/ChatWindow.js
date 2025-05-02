// ChatWindow.js
import React, { useState, useEffect, useRef } from 'react';
import './index.css'; // Assuming shared CSS

// --- Chat Message Component ---
const ChatMessage = ({ message }) => {
    const { sender, text, type } = message;
    const messageClass = `chat-message ${sender === 'bot' ? 'bot' : 'user'} type-${type}`;

    return (
        <div className={messageClass}>
            <div className="message-bubble">
                 {/* Optional: Add sender label? */}
                 {/* <span className="sender-label">{sender === 'bot' ? 'Bot' : 'You'}</span> */}
                <p>{text}</p>
            </div>
        </div>
    );
};

// --- Chat Window Component ---
const ChatWindow = ({ isOpen, messages = [], showInput, onClose, onQuestionSubmit }) => {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null); // Ref to scroll to bottom

    // Effect to scroll down when new messages are added or window opens
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]); // Dependency on messages array and open state

    // Handle input change for the question
    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    // Handle form submission for the question
    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent page reload
        const trimmedInput = inputValue.trim();
        if (trimmedInput) {
            onQuestionSubmit(trimmedInput); // Call the handler passed from parent
            setInputValue(''); // Clear the input field
        }
    };

    // Don't render anything if not open
    if (!isOpen) {
        return null;
    }

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

            {/* Messages Area */}
            <div className="chat-messages-area">
                {messages.map((msg) => (
                    // Render message component unless it's just a prompt for input
                    msg.type !== 'question_prompt' && <ChatMessage key={msg.id} message={msg} />
                ))}
                {/* Empty div at the end to scroll to */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area (only shown for 'Ask a question') */}
            {showInput && (
                <form className="chat-input-area" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="Type your question here..."
                        aria-label="Type your question"
                        autoFocus // Focus input when it appears
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