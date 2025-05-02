// ContextMenuHandler.js
import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef, // Keep useRef
} from "react";
// import axios from "axios"; // Keep commented out until real API is used
import "./index.css"; // Import the CSS for styling

// --- Step 1: Change Import from ChatbotIcon to ChatWindow ---
// import ChatbotIcon from './ChatbotIcon'; // Remove or comment out this line
import ChatWindow from './ChatWindow'; // Import the new ChatWindow component

// --- The Visual Context Menu Component (Internal - NO CHANGES NEEDED) ---
const ContextMenu = ({ x, y, show, options, onClose }) => {
    // ... This internal component remains exactly the same ...
    if (!show) { return null; }
    const style = { top: `${y}px`, left: `${x}px`, position: "absolute", zIndex: 1000 };
    const handleMenuClick = (event) => event.stopPropagation();
    return (
        <div style={style} className="custom-context-menu" onClick={handleMenuClick} onMouseLeave={onClose} >
            <ul> {options.map((option) => (
                    <li key={option.label} data-action={option.label.toUpperCase().replace(/ /g, "_")} onClick={option.action} >
                        {option.label}
                    </li>
                 ))}
            </ul>
        </div>
    );
};

// --- The Main Handler Component to Export ---
const ContextMenuHandler = ({
    targetRef, // Ref from Parent
    // Props for context
    lessonName,
    topic,
    currentLanguageLabel,
    email,
    // overview, // Keep if needed for future API calls
    // content,  // Keep if needed for future API calls
}) => {
    // State for the context menu
    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, selectedText: "" });

    // --- Step 2: Replace ChatbotIcon state with ChatWindow state ---
    // Remove old state:
    // const [isChatbotVisible, setIsChatbotVisible] = useState(false);
    // const [chatbotQuery, setChatbotQuery] = useState(null);

    // Add new state for the chat window:
    const [isChatOpen, setIsChatOpen] = useState(false); // Is the chat window currently visible?
    const [chatMessages, setChatMessages] = useState([]); // Array of message objects
    const [showQuestionInput, setShowQuestionInput] = useState(false); // Should the "Ask" input be visible?

    // --- Step 3: Add Helper Function to add messages ---
    const addMessage = useCallback((message) => {
        setChatMessages(prevMessages => [
            ...prevMessages,
            { ...message, id: Date.now() + Math.random() } // Add unique ID
        ]);
    }, []); // No dependency needed for functional update

    // --- Step 4: Modify the Action Handler ---
    const handleContextMenuAction = useCallback(
        async (actionType, text) => {
            console.log(`Context Menu Action Triggered: ${actionType}`);
            console.log(`Selected Text: "${text}"`);
            console.log(`Lesson Context Used: ${lessonName}, ${topic}, ${currentLanguageLabel}, ${email}`);

            // Close context menu
            setContextMenu((prev) => ({ ...prev, show: false }));

            // Simulate API call
            console.log("Simulating API call...");
            await new Promise(resolve => setTimeout(resolve, 300));
            const dummyApiResponse = `Acknowledged '${actionType}' for: "${text}"`;
            console.log("Simulated Response:", dummyApiResponse);

            // Process the response to update chat state
            if (dummyApiResponse) {
                const initialBotMessage = {
                    sender: 'bot',
                    type: 'response',
                    text: dummyApiResponse,
                    originalQuery: { actionType, selectedText: text }
                };

                // If chat wasn't open, start new message list, otherwise append
                if (!isChatOpen) {
                    setChatMessages([initialBotMessage]);
                } else {
                    addMessage(initialBotMessage);
                }

                // Handle "Ask a Question" - show input
                if (actionType === 'ASK_QUESTION') {
                    setShowQuestionInput(true);
                } else {
                    setShowQuestionInput(false); // Hide for other actions
                }

                // Open the chat window
                setIsChatOpen(true);
                console.log("Chat window opened/updated.");

            } else {
                console.error("Simulated API call failed.");
                // alert("Sorry, couldn't process the request."); // Optional user feedback
            }
        },
        [isChatOpen, addMessage, lessonName, topic, currentLanguageLabel, email] // Update dependencies
    );

    // --- Step 5: Add Handler for Question Submission ---
    const handleQuestionSubmit = useCallback((userQuestionText) => {
        console.log("User submitted question:", userQuestionText);
        // 1. Add user's question
        addMessage({ sender: 'user', type: 'question_submitted', text: userQuestionText });
        // 2. Hide input
        setShowQuestionInput(false);
        // 3. Simulate bot reply
        setTimeout(() => {
            addMessage({
                sender: 'bot',
                type: 'response',
                text: `Thanks for asking! This is a generic answer about "${userQuestionText}".`,
            });
        }, 500);
    }, [addMessage]); // Dependency


    // --- Define Menu Options (actions now use updated handler) ---
    const menuOptions = useMemo(
        () => [
            { label: "L.E.A.R.N More", action: () => handleContextMenuAction("LEARN_MORE", contextMenu.selectedText) },
            { label: "Clarify", action: () => handleContextMenuAction("CLARIFY", contextMenu.selectedText) },
            { label: "Ask a question", action: () => handleContextMenuAction("ASK_QUESTION", contextMenu.selectedText) },
        ],
        [handleContextMenuAction, contextMenu.selectedText]
    );

    // --- Event Handlers for Menu Triggering (NO CHANGES NEEDED) ---
    const handleMouseUp = useCallback(() => { }, []);
    const handleContextMenu = useCallback((event) => {
        const selected = window.getSelection().toString().trim();
        if (selected) {
            event.preventDefault();
            setContextMenu({ show: true, x: event.pageX, y: event.pageY, selectedText: selected });
        } else {
            setContextMenu((prev) => ({ ...prev, show: false }));
        }
    }, []);

    // --- Effects (NO CHANGES NEEDED to these effects) ---
    // Effect to add/remove listeners on the target element
    useEffect(() => {
        const targetElement = targetRef?.current;
        if (targetElement) {
            targetElement.addEventListener("mouseup", handleMouseUp);
            targetElement.addEventListener("contextmenu", handleContextMenu);
            return () => {
                targetElement.removeEventListener("mouseup", handleMouseUp);
                targetElement.removeEventListener("contextmenu", handleContextMenu);
            };
        } else {
            console.warn("ContextMenuHandler: targetRef not assigned.");
        }
    }, [targetRef, handleMouseUp, handleContextMenu]);

    // Effect to handle clicks outside the context menu to close it
    useEffect(() => {
        const handleClickOutside = () => {
            if (contextMenu.show) { setContextMenu((prev) => ({ ...prev, show: false })); }
        };
        if (contextMenu.show) { document.addEventListener("click", handleClickOutside); }
        return () => { document.removeEventListener("click", handleClickOutside); };
    }, [contextMenu.show]);

    // --- Render ---
    return (
        <>
            {/* Render the Context Menu (conditionally) */}
            <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                show={contextMenu.show}
                options={menuOptions}
                onClose={() => setContextMenu((prev) => ({ ...prev, show: false }))}
            />

            {/* --- Step 6: Render ChatWindow instead of ChatbotIcon --- */}
            {/* Remove or comment out the old ChatbotIcon rendering: */}
            {/* {isChatbotVisible && (
                <ChatbotIcon
                    initialQuery={chatbotQuery}
                    onClose={() => setIsChatbotVisible(false)}
                />
            )} */}

            {/* Add the new ChatWindow rendering */}
            <ChatWindow
                isOpen={isChatOpen}                   // Use new state variable
                messages={chatMessages}               // Pass messages array
                showInput={showQuestionInput}         // Pass flag for input
                onClose={() => setIsChatOpen(false)} // Function to close window
                onQuestionSubmit={handleQuestionSubmit} // Function to handle submitted question
            />
        </>
    );
};

export default ContextMenuHandler;