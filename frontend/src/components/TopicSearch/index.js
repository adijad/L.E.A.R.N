import React, { useState } from "react";
import TableOfContentsPage from "../TableOfContentsPage";
import "./index.css";
import languageOptions from "../../constants/languageOptions";

const TopicSearch = () => {
    const [topic, setTopic] = useState("");
    const [showTOC, setShowTOC] = useState(false);
    const [language, setLanguage] = useState("English_USA");

    const handleSearch = () => {
        if (!topic.trim()) {
            alert("Please enter a topic!");
            return;
        }
        setShowTOC(true);
    };

    return (
        <div className="topic-search-container">
            <div className="topic-search-card">
                {/* Conditionally render the language selector */}
                {!showTOC && (
                    <div className="language-selector">
                        <select
                            id="language-select"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            aria-label="Select language"
                        >
                            {languageOptions.map((lang) => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="topic-search-header">
                    <h1>Explore Topics</h1>
                    <p className="topic-search-subtitle">Discover new learning paths and expand your knowledge.</p>
                </div>

                {!showTOC && (
                    <div className="topic-search-input-group">
                        <input
                            type="text"
                            className="topic-search-input"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Search for topics..."
                        />
                        <button className="topic-search-button" onClick={handleSearch}>
                            L.E.A.R.N
                        </button>
                    </div>
                )}

                {showTOC && (
                    <TableOfContentsPage topic={topic} language={language} />
                )}
            </div>
        </div>
    );
};

export default TopicSearch;