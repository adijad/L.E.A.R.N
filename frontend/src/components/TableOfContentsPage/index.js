// TableOfContentsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaLock, FaPlayCircle } from 'react-icons/fa';
import "./index.css";

const TableOfContentsPage = ({ topic: propTopic }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tableOfContents, setTableOfContents] = useState([]);
  const [loadingTOC, setLoadingTOC] = useState(true);
  const [errorTOC, setErrorTOC] = useState("");
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(propTopic || location.state?.topic || new URLSearchParams(location.search).get('topic'));
  const [completedLessons, setCompletedLessons] = useState([]);
  const [startIndex, setStartIndex] = useState(0); // Index of the first uncompleted lesson

  const email = localStorage.getItem("userEmail");
  const tocFromState = location.state?.toc;

  useEffect(() => {
    const fetchTOCAndProgress = async () => {
      if (!currentTopic || !email) {
        setErrorTOC("Topic or user email not provided.");
        setLoadingTOC(false);
        return;
      }

      try {
        const tocResponse = await axios.get("http://localhost:8080/api/auth/progress/getTOC", {
          params: { email, topic: currentTopic }
        });

        if (tocResponse.data && Array.isArray(tocResponse.data.table_of_contents)) {
          setTableOfContents(tocResponse.data.table_of_contents);

          // Fetch user's completed lessons for this topic
          const completedResponse = await axios.get("http://localhost:8080/api/auth/progress/completedLessons", {
            params: { email, topic: currentTopic }
          });

          if (completedResponse.data && Array.isArray(completedResponse.data)) {
            setCompletedLessons(completedResponse.data);
            // Determine the starting index
            const firstUncompletedIndex = tocResponse.data.table_of_contents.findIndex(
                (lesson) => !completedResponse.data.includes(lesson)
            );
            setStartIndex(firstUncompletedIndex === -1 ? 0 : firstUncompletedIndex);

            // Save TOC for user (you might want to do this elsewhere or less frequently)
            await axios.post("http://localhost:8080/api/auth/progress/saveTOC", {
              email,
              topic: currentTopic,
              toc: tocResponse.data.table_of_contents,
            });
          }
        } else {
          setErrorTOC("Invalid TOC response format.");
        }
      } catch (err) {
        console.error("Error fetching TOC or progress:", err);
        setErrorTOC("Failed to load Table of Contents or progress.");
      } finally {
        setLoadingTOC(false);
      }
    };

    // Prioritize TOC from state if available (for faster navigation from dashboard)
    if (tocFromState && currentTopic) {
      setTableOfContents(tocFromState);
      // Still need to fetch completed lessons to determine start index
      const fetchCompletedOnly = async () => {
        try {
          const completedResponse = await axios.get("http://localhost:8080/api/auth/progress/completedLessons", {
            params: { email, topic: currentTopic }
          });
          if (completedResponse.data && Array.isArray(completedResponse.data)) {
            setCompletedLessons(completedResponse.data);
            const firstUncompletedIndex = tocFromState.findIndex(
                (lesson) => !completedResponse.data.includes(lesson)
            );
            setStartIndex(firstUncompletedIndex === -1 ? 0 : firstUncompletedIndex);
            setLoadingTOC(false);
          } else {
            setLoadingTOC(false);
          }
        } catch (error) {
          console.error("Error fetching completed lessons:", error);
          setLoadingTOC(false);
        }
      };
      fetchCompletedOnly();
    } else if (currentTopic && email) {
      fetchTOCAndProgress();
    } else {
      setErrorTOC("Topic or user email not provided.");
      setLoadingTOC(false);
    }
  }, [currentTopic, email, tocFromState]);

  const handleLessonClick = async (lessonName, index) => {
    // Only allow clicking on the current or previously completed lessons
    if (index <= startIndex && !loadingLesson) {
      setLoadingLesson(true);
      setSelectedLesson(lessonName);

      const dataToSend = {
        topic: currentTopic,
        lesson_name: lessonName,
        toc: tableOfContents,
        email,
      };
      navigate("/home/lesson", { state: dataToSend });
    }
  };

  if (loadingLesson && selectedLesson) {
    return (
        <div className="toc-modern-container toc-loading-screen">
          <h1>{currentTopic}</h1>
          <div className="toc-loading-card">
            <div className="loading-animation"></div>
            <p>Loading lesson: {selectedLesson}...</p>
          </div>
          <button className="toc-close-button" onClick={() => window.close()}>
            Close
          </button>
        </div>
    );
  }

  return (
      <div className="toc-modern-container">
        <h1>{currentTopic}</h1>
        <div className="toc-card">
          {loadingTOC ? (
              <p>Loading Table of Contents...</p>
          ) : errorTOC ? (
              <p className="error">{errorTOC}</p>
          ) : (
              <ul className="toc-list">
                {tableOfContents.map((lesson, index) => (
                    <li
                        key={index}
                        className={`toc-item ${index <= startIndex ? "toc-item-active" : "toc-item-locked"} ${completedLessons.includes(lesson) ? "toc-visited" : ""} ${index === startIndex && !completedLessons.includes(lesson) ? "toc-current" : ""}`}
                        onClick={() => handleLessonClick(lesson, index)}
                    >
                      <div className="toc-item-content">
                        <span className="toc-item-number">{index + 1}.</span>
                        <span className="toc-item-title">{lesson}</span>
                      </div>
                      <div className="toc-item-actions">
                        {index <= startIndex ? (
                            <FaPlayCircle className="toc-icon-play" />
                        ) : (
                            <FaLock className="toc-icon-lock" />
                        )}
                      </div>
                    </li>
                ))}
              </ul>
          )}
        </div>
        <button className="toc-close-button" onClick={() => window.close()}>
          Close
        </button>
      </div>
  );
};

export default TableOfContentsPage;