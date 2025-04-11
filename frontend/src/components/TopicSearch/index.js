import React, { useState } from "react";
import TableOfContentsPage from "../TableOfContentsPage";
import { FaSearch } from 'react-icons/fa';
import languageOptions from "../../constants/languageOptions"; // Adjust path
import "./index.css";

const TopicSearch = () => {
    const [topic, setTopic] = useState("");
    const [language, setLanguage] = useState("English_USA");
    const [showTOC, setShowTOC] = useState(false);

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
                <div className="topic-search-header">
                    <h1>Explore Topics</h1>
                    <p className="topic-search-subtitle">
                        Discover new learning paths and expand your knowledge.
                    </p>
                </div>

                {!showTOC && (
                    <>
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

                        <div className="language-selector">
                            {/* <label htmlFor="language-select">Language: </label> */}
                            <select
                                id="language-select"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                {languageOptions.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                {showTOC && (
                    <TableOfContentsPage topic={topic} language={language} />
                )}
            </div>
        </div>
    );
};

export default TopicSearch;
