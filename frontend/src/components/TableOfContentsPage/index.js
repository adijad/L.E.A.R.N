import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaLock, FaPlay, FaCheck, FaArrowLeft } from 'react-icons/fa';
import "./index.css";

const TableOfContentsPage = ({ topic: propTopic }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tableOfContents, setTableOfContents] = useState([]);
  const [loadingTOC, setLoadingTOC] = useState(true);
  const [errorTOC, setErrorTOC] = useState("");
  const [currentTopic, setCurrentTopic] = useState(propTopic || location.state?.topic || new URLSearchParams(location.search).get('topic'));
  const [completedLessons, setCompletedLessons] = useState([]);
  const [startIndex, setStartIndex] = useState(0);

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
        let fetchedTOC = tocFromState;
        let shouldFetchNewTOC = false;

        if (!tocFromState) {
          shouldFetchNewTOC = true;
        }

        if (shouldFetchNewTOC) {
          const tocResponse = await axios.post("http://127.0.0.1:8000/get_toc", { topic: currentTopic });

          if (tocResponse.data?.table_of_contents) {
            fetchedTOC = tocResponse.data.table_of_contents;
            setTableOfContents(fetchedTOC);
            await axios.post("http://localhost:8080/api/auth/progress/saveTOC", {
              email,
              topic: currentTopic,
              toc: fetchedTOC,
            });
          }
        } else {
          setTableOfContents(fetchedTOC);
        }

        const completedResponse = await axios.get("http://localhost:8080/api/auth/progress/completedLessons", {
          params: { email, topic: currentTopic }
        });

        if (completedResponse.data) {
          setCompletedLessons(completedResponse.data);
          const firstUncompletedIndex = fetchedTOC?.findIndex(lesson => !completedResponse.data.includes(lesson)) ?? 0;
          setStartIndex(firstUncompletedIndex === -1 ? 0 : firstUncompletedIndex);
        }
      } catch (err) {
        setErrorTOC("Failed to load content");
      } finally {
        setLoadingTOC(false);
      }
    };

    setLoadingTOC(true);
    currentTopic && email && fetchTOCAndProgress();
  }, [currentTopic, email, tocFromState]);

  const handleLessonClick = (lessonName, index) => {
    if (index <= startIndex) {
      navigate("/home/lesson", {
        state: {
          topic: currentTopic,
          lesson_name: lessonName,
          toc: tableOfContents,
          email
        }
      });
    }
  };

  const calculateProgress = () => {
    return Math.round((completedLessons.length / tableOfContents.length) * 100) || 0;
  };

  return (
      <div className="toc-modern-container">
        <div className="toc-card">
          <div className="toc-header">
            <div className="back-icon" onClick={() => navigate(-1)}>
              <FaArrowLeft />
            </div>
            <div className="topic-title-container">
              <span className="toc-label">Table of Content</span>
              <h1>{currentTopic?.toUpperCase()}</h1>
            </div>
            <div className="circular-progress-container">
              <div className="circular-progress" style={{ '--progress': calculateProgress() }}>
                <div className="progress-value">{calculateProgress()}%</div>
              </div>
            </div>
          </div>

          {loadingTOC ? (
              <div className="toc-loading">
                <div className="loading-animation"></div>
                <p>Loading Curriculum...</p>
              </div>
          ) : errorTOC ? (
              <p className="error">{errorTOC}</p>
          ) : (
              <ul className="toc-list">
                {tableOfContents.map((lesson, index) => {
                  const isCompleted = completedLessons.includes(lesson);
                  const isCurrent = index === startIndex && !isCompleted;

                  return (
                      <li
                          key={index}
                          className={`toc-item ${isCompleted ? "toc-visited" : ""} ${isCurrent ? "toc-current" : ""} ${index > startIndex ? "toc-item-locked" : ""}`}
                          onClick={() => handleLessonClick(lesson, index)}
                      >
                        <div className="toc-item-content">
                          <span className="toc-item-number">{index + 1}</span>
                          <span className="toc-item-title">{lesson}</span>
                        </div>
                        <div className="toc-item-status">
                          {isCompleted ? <FaCheck size={14} /> :
                              isCurrent ? <FaPlay size={14} /> :
                                  <FaLock size={14} />}
                        </div>
                      </li>
                  );
                })}
              </ul>
          )}
        </div>
      </div>
  );
};

export default TableOfContentsPage;
