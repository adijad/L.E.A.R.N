import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaLock, FaPlay, FaCheck, FaArrowLeft } from 'react-icons/fa';
import "./index.css";
import languageOptions from "../../constants/languageOptions";
import axios from "axios";

const TableOfContentsPage = ({ topic, language, toc: propToc, trivia: propTrivia, imageUrls: propImageUrls }) => {

  const [translating, setTranslating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [tableOfContents, setTableOfContents] = useState([]);
  const [loadingTOC, setLoadingTOC] = useState(true);
  const [errorTOC, setErrorTOC] = useState("");
  const [currentTopic, setCurrentTopic] = useState(topic || location.state?.topic || new URLSearchParams(location.search).get('topic'));
  const [completedLessons, setCompletedLessons] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState(
      language ||
      location.state?.language ||
      new URLSearchParams(location.search).get("language") ||
      "English_USA"
  );
  const email = localStorage.getItem("userEmail");
  const tocFromState = location.state?.toc;
  const [lessonImages, setLessonImages] = useState(location.state?.imageUrls || []);
  const [lessonTrivia, setLessonTrivia] = useState(location.state?.trivia || []);


  const getLabelFromCode = (code) => {
    const lang = languageOptions.find((l) => l.code === code);
    return lang ? lang.label : "English (USA)"; // default fallback
  };

  useEffect(() => {
    setLessonImages(propImageUrls || location.state?.imageUrls || []);
    setLessonTrivia(propTrivia || location.state?.trivia || []);
    }, [propImageUrls, propTrivia, location.state?.imageUrls, location.state?.trivia]);

  useEffect(() => {
    const fetchTOCAndProgress = async () => {
      if (!currentTopic || !email) {
        setErrorTOC("Topic or user email not provided.");
        setLoadingTOC(false);
        return;
      }

      try {
        let fetchedTOC = tocFromState || propToc;
        let shouldFetchNewTOC = false;

        if (!tocFromState && !propToc) {
          shouldFetchNewTOC = true;
        }

        if (shouldFetchNewTOC) {
          const tocResponse = await axios.post(
              `http://127.0.0.1:8000/get_toc?language=${encodeURIComponent(
                  getLabelFromCode(currentLanguage)
              )}`,
              { topic: currentTopic },
              { headers: { "Content-Type": "application/json" } }
          );
          console.log("Response from /get_toc:", tocResponse); // Log the entire response

          if (
              tocResponse.data &&
              Array.isArray(tocResponse.data.table_of_contents)
          ) {
            fetchedTOC = tocResponse.data.table_of_contents;
            setTableOfContents(fetchedTOC);
            setLessonImages(tocResponse.data.image_urls || []);
            setLessonTrivia(tocResponse.data.trivia || []);
            await axios.post("http://localhost:8080/api/auth/progress/saveTOC", {
              email,
              topic: currentTopic,
              toc: fetchedTOC,
              trivia: tocResponse.data.trivia,
              imageUrls: tocResponse.data.image_urls
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
  }, [currentTopic, email, tocFromState, propToc]);

  useEffect(() => {
    const translateTOC = async () => {
      if (tableOfContents.length === 0) return;

      try {
        const response = await axios.post(
            `http://127.0.0.1:8000/translate?language=${encodeURIComponent(
                getLabelFromCode(currentLanguage)
            )}`,
            {
              table_of_contents: tableOfContents,
            },
            {
              headers: { "Content-Type": "application/json" },
            }
        );

        if (Array.isArray(response.data.table_of_contents)) {
          setTableOfContents(response.data.table_of_contents);
        } else {
          console.warn("Unexpected translate response:", response.data);
        }
      } catch (error) {
        console.error("Translation failed:", error);
      } finally {
        setTranslating(false);
      }
    };

    if (!loadingTOC && !errorTOC) {
      setTranslating(true);
      translateTOC();
    }
  }, [currentLanguage, loadingTOC, errorTOC, tableOfContents]);


  const handleLessonClick = (lessonName, index) => {
    if (index <= startIndex) {
      console.log("Navigating with lessonImages:", lessonImages);
      console.log("Navigating with lessonTrivia:", lessonTrivia);
      navigate("/home/lesson", {
        state: {
          topic: currentTopic,
          lesson_name: lessonName,
          toc: tableOfContents,
          email,
          language: currentLanguage,
          lessonImages,
          lessonTrivia
        }
      });
    }
  };

  const calculateProgress = () => {
    return Math.round((completedLessons.length / tableOfContents.length) * 100) || 0;
  };

  return (
      <div className="toc-modern-container">
        <div className="toc-language-selector">
          <label htmlFor="language-select">Language: </label>
          <select
              id="language-select"
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
          >
            {languageOptions.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
            ))}
          </select>
        </div>
        <div className="toc-card">
          {translating && (
              <div className="toc-translation-message">
                <p>Translating lessons to {getLabelFromCode(currentLanguage)}...</p>
              </div>
          )}
          <div className="toc-header">
            <div className="back-icon" onClick={() => navigate(-1)}>
              <FaArrowLeft/>
            </div>
            <div className="topic-title-container">
              <span className="toc-label">Table of Content</span>
              <h1>{currentTopic?.toUpperCase()}</h1>
            </div>
            <div className="circular-progress-container">
              <div className="circular-progress" style={{'--progress': calculateProgress()}}>
                <div className="progress-value">{calculateProgress()}%</div>
              </div>
            </div>
          </div>

          {loadingTOC ? (
              <div className="toc-loading">
                <div className="loading-animation"></div>
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
                          {isCompleted ? <FaCheck size={14}/> :
                              isCurrent ? <FaPlay size={14}/> :
                                  <FaLock size={14}/>}
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