import React, { useState } from "react";
import TableOfContentsPage from "../TableOfContentsPage"; // Import the TOC component
import "./index.css";

const TopicSearch = () => {
    const [topic, setTopic] = useState("");
    const [showTOC, setShowTOC] = useState(false); // State to control showing the TOC

    const fetchTOC = async () => {
        if (!topic.trim()) return alert("Please enter a topic!");

        // Show the Table of Contents component when the button is clicked
        setShowTOC(true);
    };

    return (
        <div className="container">
            <h1>Explore Topics</h1>

            {/* Only show the search bar and button if showTOC is false */}
            {!showTOC && (
                <>
                    <input
                        type="text"
                        className="input-box"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter a topic..."
                    />
                    <button className="button" onClick={fetchTOC}>Generate Table of Contents</button>
                </>
            )}

            {/* Conditionally render the Table of Contents component */}
            {showTOC && <TableOfContentsPage topic={topic} />}
        </div>
    );
};

export default TopicSearch;
