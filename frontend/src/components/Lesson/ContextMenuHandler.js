import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from "react";
import axios from "axios"; // Assuming you still want to use axios for the API call
import "./index.css"; // Import the CSS for styling

// --- The Visual Context Menu Component (Internal to this file) ---
const ContextMenu = ({ x, y, show, options, onClose }) => {
    if (!show) {
        return null;
    }
    const style = {
        top: `${y}px`,
        left: `${x}px`,
        position: "absolute",
        zIndex: 1000,
    };
    const handleMenuClick = (event) => event.stopPropagation(); // Prevent closing when clicking menu

    return (
        <div
            style={style}
            className="custom-context-menu"
            onClick={handleMenuClick}
            onMouseLeave={onClose}
        >
            <ul>
                {options.map((option) => (
                    <li
                        key={option.label}
                        data-action={option.label.toUpperCase().replace(/ /g, "_")}
                        onClick={option.action}
                    >
                        {option.label}
                    </li>
                ))}
            </ul>
        </div>
    );
};

// --- The Main Handler Component to Export ---
const ContextMenuHandler = ({
    targetRef, // Ref of the element to attach listeners to
    lessonName,
    topic,
    currentLanguageLabel, // Pass the result of getLabelFromCode
    email,
    // Add any other context needed for the API call as props
}) => {
    const [contextMenu, setContextMenu] = useState({
        show: false,
        x: 0,
        y: 0,
        selectedText: "",
    });

    // --- API Call Logic (Placeholder - Adapt to your needs) ---
    const handleContextMenuAction = useCallback(
        async (actionType, text) => {
            console.log(`Context Menu Action: ${actionType}`);
            console.log(`Selected Text: "${text}"`);
            // Use props passed to ContextMenuHandler
            console.log(
                `Lesson Context: ${lessonName}, ${topic}, ${currentLanguageLabel}, ${email}`
            );

            // ** YOUR ACTUAL API CALL LOGIC GOES HERE **
            // Example structure:
            // const apiUrl = "YOUR_API_ENDPOINT";
            // const payload = {
            //     action: actionType,
            //     selected_text: text,
            //     lesson_name: lessonName,
            //     topic: topic,
            //     language: currentLanguageLabel, // Use the passed label
            //     user_email: email,
            // };
            // try {
            //     const response = await axios.post(apiUrl, payload);
            //     console.log('API Response:', response.data);
            //     alert(`API Response for ${actionType}:\n${JSON.stringify(response.data)}`);
            // } catch (error) {
            //     console.error(`API call failed for action ${actionType}:`, error);
            //     alert(`Failed to perform action "${actionType}". Please try again.`);
            // } finally {
            //     setContextMenu(prev => ({ ...prev, show: false })); // Close menu
            // }

            // Placeholder feedback:
            alert(
                `Action "${actionType}" triggered for text: "${text}".\n(API call placeholder - check console)`
            );
            setContextMenu((prev) => ({ ...prev, show: false })); // Close menu

            // Add props used inside the API call logic to the dependency array
        },
        [lessonName, topic, currentLanguageLabel, email]
    );

    // --- Menu Options ---
    const menuOptions = useMemo(
        () => [
            {
                label: "L.E.A.R.N More",
                action: () =>
                    handleContextMenuAction("LEARN_MORE", contextMenu.selectedText),
            },
            {
                label: "Clarify",
                action: () =>
                    handleContextMenuAction("CLARIFY", contextMenu.selectedText),
            },
            {
                label: "Ask a question",
                action: () =>
                    handleContextMenuAction("ASK_QUESTION", contextMenu.selectedText),
            },
        ],
        [handleContextMenuAction, contextMenu.selectedText]
    ); // Depend on handler and selected text

    // --- Event Handlers ---
    const handleMouseUp = useCallback(() => {
        // We don't need to do anything here anymore, selection is checked on right-click
    }, []);

    const handleContextMenu = useCallback((event) => {
        const selected = window.getSelection().toString().trim();
        if (selected) {
            event.preventDefault();
            setContextMenu({
                show: true,
                x: event.pageX,
                y: event.pageY,
                selectedText: selected,
            });
        } else {
            setContextMenu((prev) => ({ ...prev, show: false }));
        }
    }, []);

    // --- Effects ---
    // Effect to attach/detach listeners to the target element
    useEffect(() => {
        const targetElement = targetRef.current;
        if (targetElement) {
            targetElement.addEventListener("mouseup", handleMouseUp);
            targetElement.addEventListener("contextmenu", handleContextMenu);

            // Cleanup function
            return () => {
                targetElement.removeEventListener("mouseup", handleMouseUp);
                targetElement.removeEventListener("contextmenu", handleContextMenu);
            };
        }
        // Re-run if the targetRef itself changes (though unlikely) or handlers change
    }, [targetRef, handleMouseUp, handleContextMenu]);

    // Effect to handle clicking outside the menu to close it
    useEffect(() => {
        const handleClickOutside = () => {
            if (contextMenu.show) {
                setContextMenu((prev) => ({ ...prev, show: false }));
            }
        };
        // Add listener only when menu is shown
        if (contextMenu.show) {
            document.addEventListener("click", handleClickOutside);
        }
        // Cleanup listener
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [contextMenu.show]);

    // --- Render the visual ContextMenu component ---
    return (
        <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            show={contextMenu.show}
            options={menuOptions}
            onClose={() => setContextMenu((prev) => ({ ...prev, show: false }))}
        />
    );
};

export default ContextMenuHandler;
