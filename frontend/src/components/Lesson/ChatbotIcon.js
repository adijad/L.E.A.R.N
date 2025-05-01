// ChatbotIcon.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './index.css'; // Make sure CSS is imported

// --- Configuration ---
const ICON_SIZE = 60; // Width and height of the icon container
const BOTTOM_OFFSET = 25; // Desired distance from the bottom edge of the window
const RIGHT_OFFSET = 25; // Desired distance from the right edge of the window

const ChatbotIcon = ({ initialQuery, onClose }) => {
    const [isHovered, setIsHovered] = useState(false);
    const iconRef = useRef(null); // Ref to the icon's main div
    // State to hold the calculated inline styles for positioning
    const [dynamicStyle, setDynamicStyle] = useState({});

    // --- Function to Calculate and Update Position ---
    const updatePosition = useCallback(() => {
        // Calculate desired top position
        const top = window.scrollY + window.innerHeight - ICON_SIZE - BOTTOM_OFFSET;
        // Calculate desired left position
        const left = window.scrollX + window.innerWidth - ICON_SIZE - RIGHT_OFFSET;

        // Update the state with the new style object
        // We use 'absolute' positioning now, as JS calculates position within the document flow
        setDynamicStyle({
            position: 'absolute',
            top: `${top}px`,
            left: `${left}px`,
            // Keep other visual styles if needed, or rely on CSS class
            width: `${ICON_SIZE}px`,
            height: `${ICON_SIZE}px`,
            zIndex: 1050, // Keep z-index high
        });
    }, []); // No dependencies needed if constants are defined outside

    // --- Effect to Add Event Listeners ---
    useEffect(() => {
        // Update position initially on mount
        updatePosition();

        // Add listeners for scroll and resize events on the window
        window.addEventListener('scroll', updatePosition);
        window.addEventListener('resize', updatePosition);

        // Cleanup function: Remove listeners when component unmounts
        return () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
        };
    }, [updatePosition]); // Re-run if updatePosition function changes (it won't here)

    // --- Click Handler ---
    const handleClick = () => {
        console.log("Chatbot icon clicked. Initial query:", initialQuery);
        // Implement opening chat window logic here later
    };

    // --- Render ---
    return (
        <div
            ref={iconRef} // Attach ref
            className="chatbot-icon-container" // Use class for non-positional styles
            style={dynamicStyle} // Apply calculated position via inline style
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title={`Chat about: ${initialQuery?.selectedText || 'context'}`}
        >
            {/* Icon Content */}
            <span className="chatbot-icon-emoji">🤖</span>

            {/* Close Button */}
            <button
                className="chatbot-icon-close"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent container click
                    onClose();
                }}
                title="Close Chatbot"
                aria-label="Close Chatbot"
            >
                ✕
            </button>
        </div>
    );
};

export default ChatbotIcon;