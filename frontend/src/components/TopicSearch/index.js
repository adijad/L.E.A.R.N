import React, { useState } from "react";
import TableOfContentsPage from "../TableOfContentsPage"; // Import the TOC component
import { FaSearch } from 'react-icons/fa'; // Import search icon
import "./index.css";

const TopicSearch = () => {
    const [topic, setTopic] = useState("");
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

                {showTOC && <TableOfContentsPage topic={topic} />}
            </div>
        </div>
    );
};

export default TopicSearch;