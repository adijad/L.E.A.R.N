// ContextMenuHandler.js
import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    // Keep useRef if you pass targetRef from LessonPage
    useRef, // Assuming targetRef is passed as a prop
} from "react";
// import axios from "axios"; // Keep commented out until real API is used
import "./index.css"; // Import the CSS for styling

// --- Import the ChatbotIcon component ---
import ChatbotIcon from './ChatbotIcon'; // Adjust path if needed

// --- The Visual Context Menu Component (Internal to this file) ---
const ContextMenu = ({ x, y, show, options, onClose }) => {
    // Check if the component should render
    if (!show) {
        return null;
    }

    // Style for positioning
    const style = {
        top: `${y}px`,
        left: `${x}px`,
        position: "absolute", // Use absolute positioning
        zIndex: 1000,         // Ensure it appears above other content
    };

    // Prevent clicks inside the menu from closing it immediately
    const handleMenuClick = (event) => event.stopPropagation();

    // Render the menu
    return (
        <div
            style={style}
            className="custom-context-menu" // Apply CSS class
            onClick={handleMenuClick}     // Handle clicks inside the menu
            onMouseLeave={onClose}        // Close menu when mouse leaves
        >
            <ul>
                {/* Map through the provided menu options */}
                {options.map((option) => (
                    <li
                        key={option.label} // Use label as key (assuming unique)
                        // Set data-action for potential CSS targeting (e.g., icons)
                        data-action={option.label.toUpperCase().replace(/ /g, "_")}
                        onClick={option.action} // Execute action on click
                    >
                        {option.label} {/* Display option text */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

// --- The Main Handler Component to Export ---
const ContextMenuHandler = ({
    targetRef, // Ref of the element to attach listeners to (passed from Parent)
    // Props needed for context / API call:
    lessonName,
    topic,
    currentLanguageLabel, // Pass the result of getLabelFromCode
    email,
    // overview, // Uncomment and pass from parent if needed for real API
    // content,  // Uncomment and pass from parent if needed for real API
}) => {
    // State for the context menu's visibility, position, and selected text
    const [contextMenu, setContextMenu] = useState({
        show: false,
        x: 0,
        y: 0,
        selectedText: "",
    });

    // State for the chatbot icon's visibility and the data to pass to it
    const [isChatbotVisible, setIsChatbotVisible] = useState(false);
    const [chatbotQuery, setChatbotQuery] = useState(null); // Stores { actionType, selectedText }

    // --- Action Handler for Context Menu Options ---
    const handleContextMenuAction = useCallback(
        async (actionType, text) => {
            // Log the action and context (for debugging)
            console.log(`Context Menu Action Triggered: ${actionType}`);
            console.log(`Selected Text: "${text}"`);
            console.log(`Lesson Context Used: ${lessonName}, ${topic}, ${currentLanguageLabel}, ${email}`);

            // Close the context menu right away
            setContextMenu((prev) => ({ ...prev, show: false }));

            // ** SIMULATED API CALL **
            console.log("Simulating API call...");
            // Introduce a small delay to mimic network latency
            await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 second delay

            // Assume a successful response for now
            const dummyApiResponse = "Yes, acknowledged."; // Your dummy response
            console.log("Simulated API Response Received:", dummyApiResponse);

            // ** PROCESS SIMULATED RESPONSE **
            // In a real scenario, you would check the actual response content here
            if (dummyApiResponse) {
                // Set the data needed for the chatbot
                setChatbotQuery({ actionType, selectedText: text });
                // Make the chatbot icon visible
                setIsChatbotVisible(true);
                console.log("Chatbot icon triggered to display.");
            } else {
                // Handle potential errors from the (simulated) API call
                console.error("Simulated API call failed or returned no response.");
                // Optionally, inform the user: alert("Sorry, couldn't process the request right now.");
            }
            // ** END OF SIMULATED API CALL LOGIC **

        },
        // Dependencies: Include all props/state used within this handler
        [lessonName, topic, currentLanguageLabel, email]
    );

    // --- Define Menu Options ---
    // Use useMemo to prevent redefining options on every render unless dependencies change
    const menuOptions = useMemo(
        () => [
            {
                label: "L.E.A.R.N More", // Label displayed in the menu
                // Action calls the handler, passing the type and current selected text
                action: () => handleContextMenuAction("LEARN_MORE", contextMenu.selectedText),
            },
            {
                label: "Clarify",
                action: () => handleContextMenuAction("CLARIFY", contextMenu.selectedText),
            },
            {
                label: "Ask a question",
                action: () => handleContextMenuAction("ASK_QUESTION", contextMenu.selectedText),
            },
        ],
        // Dependencies: The action handler and the selected text it depends on
        [handleContextMenuAction, contextMenu.selectedText]
    );

    // --- Event Handlers for Menu Triggering ---
    // MouseUp doesn't need to do anything specific for selection capture anymore
    const handleMouseUp = useCallback(() => { }, []);

    // ContextMenu (Right-click) handler: Prevents default menu and shows custom one
    const handleContextMenu = useCallback((event) => {
        // Get currently selected text on the page
        const selected = window.getSelection().toString().trim();
        // Only show the menu if some text is actually selected
        if (selected) {
            event.preventDefault(); // Stop the browser's default right-click menu
            // Update state to show the menu at the click coordinates
            setContextMenu({
                show: true,
                x: event.pageX, // Horizontal position
                y: event.pageY, // Vertical position
                selectedText: selected, // Store the selected text
            });
        } else {
            // If no text is selected, ensure the custom menu is hidden
            setContextMenu((prev) => ({ ...prev, show: false }));
        }
    }, []); // This handler doesn't depend on component state/props

    // --- Effects ---
    // Effect to add/remove event listeners on the target element (passed via ref)
    useEffect(() => {
        const targetElement = targetRef.current; // Get the DOM element from the ref
        // Only add listeners if the target element exists
        if (targetElement) {
            // Attach listeners for mouse up and right-click
            targetElement.addEventListener("mouseup", handleMouseUp);
            targetElement.addEventListener("contextmenu", handleContextMenu);

            // Cleanup function: Remove listeners when component unmounts or dependencies change
            return () => {
                targetElement.removeEventListener("mouseup", handleMouseUp);
                targetElement.removeEventListener("contextmenu", handleContextMenu);
            };
        }
        // Dependencies: Re-run effect if the target element ref or handlers change
    }, [targetRef, handleMouseUp, handleContextMenu]);

    // Effect to handle clicks outside the context menu to close it
    useEffect(() => {
        // Function to check if menu should close
        const handleClickOutside = () => {
            // If the menu is currently shown, hide it
            // A more complex check could involve checking event.target against the menu ref,
            // but simply closing on any click is often sufficient.
            if (contextMenu.show) {
                setContextMenu((prev) => ({ ...prev, show: false }));
            }
        };
        // Add the click listener ONLY when the menu is visible
        if (contextMenu.show) {
            document.addEventListener("click", handleClickOutside);
        }
        // Cleanup: Remove the listener when the menu hides or component unmounts
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [contextMenu.show]); // Dependency: Only run when menu visibility changes

    // --- Render ---
    // Use a React Fragment (<>...</>) to return multiple components side-by-side
    return (
        <>
            {/* Render the Context Menu itself (it's internally conditional based on `show`) */}
            <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                show={contextMenu.show}
                options={menuOptions}
                // Pass a function to close the menu from the ContextMenu component (e.g., onMouseLeave)
                onClose={() => setContextMenu((prev) => ({ ...prev, show: false }))}
            />

            {/* Conditionally render the Chatbot Icon */}
            {/* It only renders when isChatbotVisible is true */}
            {isChatbotVisible && (
                <ChatbotIcon
                    initialQuery={chatbotQuery} // Pass the stored query data
                    // Pass a function to allow the ChatbotIcon to close itself
                    onClose={() => setIsChatbotVisible(false)}
                />
            )}
        </>
    );
};

export default ContextMenuHandler;