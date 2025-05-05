import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import {
  FaCheckCircle,
  FaHourglassHalf,
  FaBookOpen,
  FaTrash,
  FaArrowLeft,
  FaArrowRight
} from 'react-icons/fa';
import './index.css';
import TopNavbar from "../Navbar/TopNavbar";

const Body = () => {
  const email = localStorage.getItem("userEmail");
  const [summary, setSummary] = useState([]);
  const navigate = useNavigate();
  const [tocData, setTocData] = useState({}); // State to store TOC data, including trivia and images

  // Scroll controls state
  const [showLeftProgress, setShowLeftProgress] = useState(false);
  const [showRightProgress, setShowRightProgress] = useState(false); // Initialize to false
  const [showLeftCompleted, setShowLeftCompleted] = useState(false);
  const [showRightCompleted, setShowRightCompleted] = useState(false); // Initialize to false
  const progressScrollRef = useRef(null);
  const completedScrollRef = useRef(null);

  const fetchTopicSummary = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/auth/progress/summary", {
        params: { email }
      });
      setSummary(res.data);
      // Initial check for scroll buttons visibility after data loads
      setTimeout(() => {
        if (progressScrollRef.current) {
          setShowRightProgress(progressScrollRef.current.scrollWidth > progressScrollRef.current.clientWidth);
        }
        if (completedScrollRef.current) {
          setShowRightCompleted(completedScrollRef.current.scrollWidth > completedScrollRef.current.clientWidth);
        }
      }, 500); // Adjust timeout as needed
    } catch (err) {
      console.error("❌ Failed to fetch topic summary", err);
    }
  };

  useEffect(() => {
    fetchTopicSummary();
  }, [email]);

  const handleDeleteCourse = async (topicToDelete) => {
    if (window.confirm(`Are you sure you want to delete the course '${topicToDelete}'?`)) {
      try {
        const response = await axios.delete("http://localhost:8080/api/auth/progress/deleteCourse", {
          params: { email, topic: topicToDelete }
        });
        console.log("Course deleted:", response.data.message);
        fetchTopicSummary();
      } catch (error) {
        console.error("Error deleting course:", error);
      }
    }
  };

  const handleContinueClick = async (topicName) => {
    try {
      const response = await axios.get("http://localhost:8080/api/auth/progress/getTOC", {
        params: { email, topic: topicName }
      });


      if (response.data && Array.isArray(response.data.table_of_contents)) {
        const {
          table_of_contents: toc,
          trivia = [],
          image_urls = []
        } = response.data;


        // Store TOC data (this is likely working, but the log is misleading due to async nature)
        setTocData({
          topic: topicName,
          toc,
          trivia,
          imageUrls: image_urls
        });
        console.log("tocData state after update:", tocData);

        navigate(`/home/table-of-contents?topic=${topicName}`, {
          state: {
            topic: topicName,
            toc,
            trivia, // Passing trivia
            imageUrls: image_urls // Passing imageUrls
          }
        });

      } else {
        console.error("Invalid TOC response:", response.data);
      }
    } catch (error) {
      console.error("Error fetching TOC:", error);
    }
  };
  const handleScroll = (ref, direction) => {
    const container = ref.current;
    const scrollAmount = container.offsetWidth * 0.8; // Scroll 80% of container width

    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  };

  const setupScrollListener = (ref, setLeft, setRight) => {
    const container = ref.current;

    const handleScroll = () => {
      setLeft(container.scrollLeft > 0);
      setRight(container.scrollLeft + container.clientWidth < container.scrollWidth);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  };

  useEffect(() => {
    if (progressScrollRef.current) {
      return setupScrollListener(
          progressScrollRef,
          setShowLeftProgress,
          setShowRightProgress
      );
    }
  }, []);

  useEffect(() => {
    if (completedScrollRef.current) {
      return setupScrollListener(
          completedScrollRef,
          setShowLeftCompleted,
          setShowRightCompleted
      );
    }
  }, []);

  const inProgress = summary.filter(item => item.completionPercentage < 100);
  const completed = summary.filter(item => item.completionPercentage === 100);

  return (
      <div className="dashboard-body-container sophisticated-dashboard">
        <header className="dashboard-body-header">
          <h1>Your Learning Dashboard</h1>
          <p className="dashboard-body-subtitle">
            Track your progress and continue your learning journey!
          </p>
        </header>

        <main className="dashboard-body-content">
          {/* In Progress Section */}
          <section className="progress-section">
            <div className="section-header">
              <h2><FaHourglassHalf className="section-icon" /> In Progress</h2>
            </div>
            <div className="carousel-wrapper">
              {showLeftProgress && (
                  <button
                      className="scroll-button left"
                      onClick={() => handleScroll(progressScrollRef, 'left')}
                  >
                    <FaArrowLeft />
                  </button>
              )}
              <div className="scroll-container" ref={progressScrollRef}>
                <div className="topic-grid">
                  {inProgress.length === 0 ? (
                      <div className="empty-state">
                        <p>You are not currently enrolled in any topics.</p>
                      </div>
                  ) : (
                      inProgress.map((item, idx) => (
                          <div key={idx} className="topic-card in-progress-card sophisticated-card">
                            <div className="topic-card-header">
                              <h3 className="topic-title">{item.topic.toUpperCase()}</h3>
                              <span className="topic-percentage">{item.completionPercentage}%</span>
                            </div>
                            <div className="topic-card-body">
                              <p className="lesson-info">
                                <FaBookOpen className="info-icon" />
                                {item.completedLessons} / {item.totalLessons} Lessons
                              </p>
                              <div className="progress-bar-container">
                                <div
                                    className="progress-bar"
                                    style={{ width: `${item.completionPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="topic-card-footer">
                              <button
                                  className="sophisticated-button"
                                  onClick={() => handleContinueClick(item.topic)}
                              >
                                Continue
                              </button>
                              <button
                                  className="sophisticated-delete-button"
                                  onClick={() => handleDeleteCourse(item.topic)}
                              >
                                <FaTrash className="delete-icon" />
                              </button>
                            </div>
                          </div>
                      ))
                  )}
                </div>
              </div>
              {showRightProgress && (
                  <button
                      className="scroll-button right"
                      onClick={() => handleScroll(progressScrollRef, 'right')}
                  >
                    <FaArrowRight />
                  </button>
              )}
            </div>
          </section>

          {/* Completed Section */}
          <section className="completed-section">
            <div className="section-header">
              <h2><FaCheckCircle className="section-icon" /> Completed</h2>
            </div>
            <div className="carousel-wrapper">
              {showLeftCompleted && (
                  <button
                      className="scroll-button left"
                      onClick={() => handleScroll(completedScrollRef, 'left', setShowLeftCompleted, setShowRightCompleted)}
                  >
                    <FaArrowLeft />
                  </button>
              )}
              <div className="scroll-container" ref={completedScrollRef}>
                <div className="topic-grid">
                  {completed.length === 0 ? (
                      <div className="empty-state">
                        <p>No completed topics yet. Keep learning!</p>
                      </div>
                  ) : (
                      completed.map((item, idx) => (
                          <div key={idx} className="topic-card completed-card sophisticated-card">
                            <div className="topic-card-header">
                              <h3 className="topic-title">{item.topic.toUpperCase()}</h3>
                              <span className="topic-percentage completed-percentage">Completed</span>
                            </div>
                            <div className="topic-card-body">
                              <p className="lesson-info">
                                <FaBookOpen className="info-icon" />
                                All {item.totalLessons} Lessons
                              </p>
                              <div className="progress-bar-container">
                                <div className="progress-bar completed"></div>
                              </div>
                            </div>
                            <div className="topic-card-footer">
                              <button className="sophisticated-button">Review</button>
                              <button
                                  className="sophisticated-delete-button"
                                  onClick={() => handleDeleteCourse(item.topic)}
                              >
                                <FaTrash className="delete-icon" />
                              </button>
                            </div>
                          </div>
                      ))
                  )}
                </div>
              </div>
              {showRightCompleted && (
                  <button
                      className="scroll-button right"
                      onClick={() => handleScroll(completedScrollRef, 'right', setShowLeftCompleted, setShowRightCompleted)}
                  >
                    <FaArrowRight />
                  </button>
              )}
            </div>
          </section>
        </main>
      </div>
  );
};

export default Body;