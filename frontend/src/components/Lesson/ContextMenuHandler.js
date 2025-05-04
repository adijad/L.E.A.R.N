// ContextMenuHandler.js
import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
  } from "react";
  import "./index.css";
  import ChatWindow from "./ChatWindow";

  import languageOptions from "../../constants/languageOptions";
  
  const ContextMenu = ({ x, y, show, options, onClose }) => {
    if (!show) return null;
    const style = { top: `${y}px`, left: `${x}px`, position: "absolute", zIndex: 1000 };
    return (
      <div
        style={style}
        className="custom-context-menu"
        onClick={e => e.stopPropagation()}
        onMouseLeave={onClose}
      >
        <ul>
          {options.map(opt => (
            <li
              key={opt.label}
              data-action={opt.label.toUpperCase().replace(/ /g, "_")}
              onClick={opt.action}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  const ContextMenuHandler = ({
    targetRef,
    lessonName,
    topic,
    toc,
    overview,
    content,
    language
  }) => {
    // Context menu state
    const [contextMenu, setContextMenu] = useState({
      show: false,
      x: 0,
      y: 0,
      selectedText: "",
    });

    const getLabelFromCode = (code) => {
      const lang = languageOptions.find((l) => l.code === code);
      return lang ? lang.label : "English (USA)";
  };
  
    // Chat state
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [showQuestionInput, setShowQuestionInput] = useState(false);
  
    // Append a message (preserve history)
    const addMessage = useCallback(msg => {
      setChatMessages(prev => [...prev, { ...msg, id: Date.now() + Math.random() }]);
    }, []);
  
    // Ensure overview/content are strings
    const serialize = useCallback(x => (typeof x === "string" ? x : JSON.stringify(x)), []);
  
    // Map action → API mode
    const mapMode = useCallback(actionType => {
      switch (actionType) {
        case "LEARN_MORE":   return "learn";
        case "CLARIFY":      return "clarify";
        case "ASK_QUESTION": return "question";
        default:
          console.error("Unknown actionType:", actionType);
          return "learn";
      }
    }, []);
  
    // Generic API call
    const callApi = useCallback(async payload => {
      console.log("⏳ Sending payload:", payload);
      const res = await fetch(`http://127.0.0.1:8000/chatbot_qa?language=${encodeURIComponent(
        getLabelFromCode(language)
    )}`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (!res.ok) {
        let detail;
        try { detail = JSON.parse(text).detail; } catch { detail = text; }
        console.error(`API ${res.status}:`, detail);
        return detail;
      }
      const data = JSON.parse(text);
      return data.answer ?? data.response ?? JSON.stringify(data);
    }, []);
  
    // Handle Learn / Clarify / Ask-Question clicks
    const handleContextMenuAction = useCallback(
      async (actionType, selectedText) => {
        setContextMenu(prev => ({ ...prev, show: false }));
  
        // Build and send the user message templated
        let userText;
        if (actionType === "LEARN_MORE") {
          userText = `Learn more about "${selectedText}"`;
        } else if (actionType === "CLARIFY") {
          userText = `Clarify "${selectedText}"`;
        } else {
          userText = `I have a question regarding "${selectedText}"`;
        }
        addMessage({ sender: "user", type: "question_submitted", text: userText });
        setIsChatOpen(true);
  
        // If it's Ask-Question: just open the input, no API yet
        if (actionType === "ASK_QUESTION") {
          setShowQuestionInput(true);
          return;
        }
  
        // For Learn/Clarify: show loading placeholder then call API
        const loadingId = Date.now() + Math.random();
        setChatMessages(prev => [
          ...prev,
          { sender: "bot", type: "loading", id: loadingId, text: "Loading..." }
        ]);
  
        const payload = {
          topic,
          lesson_name: lessonName,
          question: "",             // no free-text
          selected_text: selectedText,
          toc,
          overview: serialize(overview),
          content: serialize(content),
          mode: mapMode(actionType),
        };
        const reply = await callApi(payload);
  
        // Replace the loading message
        setChatMessages(prev =>
          prev.map(msg =>
            msg.id === loadingId
              ? { ...msg, type: "response", text: reply }
              : msg
          )
        );
      },
      [lessonName, topic, toc, overview, content, addMessage, serialize, mapMode, callApi]
    );
  
    // Handle actual question submit
    const handleQuestionSubmit = useCallback(
      async userQuestionText => {
        // 1) add the user's typed question
        addMessage({ sender: "user", type: "question_submitted", text: userQuestionText });
        setShowQuestionInput(false);
  
        // 2) show loading
        const loadingId = Date.now() + Math.random();
        setChatMessages(prev => [
          ...prev,
          { sender: "bot", type: "loading", id: loadingId, text: "Loading..." }
        ]);
  
        // 3) call API with question
        const payload = {
          topic,
          lesson_name: lessonName,
          question: userQuestionText,
          selected_text: contextMenu.selectedText,
          toc,
          overview: serialize(overview),
          content: serialize(content),
          mode: "question",
        };
        const reply = await callApi(payload);
  
        // 4) swap out loading
        setChatMessages(prev =>
          prev.map(msg =>
            msg.id === loadingId
              ? { ...msg, type: "response", text: reply }
              : msg
          )
        );
      },
      [lessonName, topic, contextMenu.selectedText, toc, overview, content, addMessage, serialize, callApi]
    );
  
    // Build menu options
    const menuOptions = useMemo(() => [
      {
        label: "L.E.A.R.N More",
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
    ], [handleContextMenuAction, contextMenu.selectedText]);
  
    // Show/hide on right-click + selection
    const handleContext = useCallback(e => {
      const sel = window.getSelection().toString().trim();
      if (sel) {
        e.preventDefault();
        setContextMenu({ show: true, x: e.pageX, y: e.pageY, selectedText: sel });
      } else {
        setContextMenu(prev => ({ ...prev, show: false }));
      }
    }, []);
  
    // Attach contextlistener
    useEffect(() => {
      const el = targetRef?.current;
      if (!el) return;
      el.addEventListener("contextmenu", handleContext);
      return () => el.removeEventListener("contextmenu", handleContext);
    }, [targetRef, handleContext]);
  
    // Close on outside click
    useEffect(() => {
      const onClickOutside = () => {
        if (contextMenu.show) setContextMenu(prev => ({ ...prev, show: false }));
      };
      if (contextMenu.show) document.addEventListener("click", onClickOutside);
      return () => document.removeEventListener("click", onClickOutside);
    }, [contextMenu.show]);
  
    return (
      <>
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          show={contextMenu.show}
          options={menuOptions}
          onClose={() => setContextMenu(prev => ({ ...prev, show: false }))}
        />
  
        <ChatWindow
          isOpen={isChatOpen}
          messages={chatMessages}
          showInput={showQuestionInput}         // only for ASK_QUESTION
          onClose={() => setIsChatOpen(false)}
          onQuestionSubmit={handleQuestionSubmit}
        />
      </>
    );
  };
  
  export default ContextMenuHandler;
  