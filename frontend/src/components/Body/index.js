import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaHourglassHalf, FaBookOpen, FaTrash } from 'react-icons/fa';
import './index.css';

const Body = () => {
  const email = localStorage.getItem("userEmail");
  const [summary, setSummary] = useState([]);
  const navigate = useNavigate();
  const inProgressRef = useRef(null);
  const completedRef = useRef(null);

  const fetchTopicSummary = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/auth/progress/summary", {
        params: { email }
      });
      console.log("🎯 Topic Summary:", res.data);
      setSummary(res.data);
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
        const toc = response.data.table_of_contents;
        navigate(`/home/table-of-contents?topic=${topicName}`, { state: { topic: topicName, toc } });
      } else {
        console.error("Invalid TOC response:", response.data);
      }
    } catch (error) {
      console.error("Error fetching TOC:", error);
    }
  };

  const inProgress = summary.filter(item => item.completionPercentage < 100);
  const completed = summary.filter(item => item.completionPercentage === 100);

  return (
      <div className="dashboard-body-container sophisticated-dashboard">
        <header className="dashboard-body-header">
          <h1>Your Learning Dashboard</h1>
          <p className="dashboard-body-subtitle">Track your progress and continue your learning journey!</p>
        </header>

        <main className="dashboard-body-content">
          {/* In Progress Section */}
          <section className="progress-section">
            <div className="section-header">
              <h2><FaHourglassHalf className="section-icon" /> In Progress</h2>
            </div>
            <div className="topic-carousel-outer">
              <div className="topic-carousel-inner" ref={inProgressRef}>
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
                              <FaBookOpen className="info-icon" /> {item.completedLessons} / {item.totalLessons} Lessons
                            </p>
                            <div className="progress-bar-container">
                              <div className="progress-bar" style={{ width: `${item.completionPercentage}%` }}></div>
                            </div>
                          </div>
                          <div className="topic-card-footer">
                            <button className="sophisticated-button" onClick={() => handleContinueClick(item.topic)}>Continue</button>
                            <button className="sophisticated-delete-button" onClick={() => handleDeleteCourse(item.topic)}>
                              Delete <FaTrash className="delete-icon" />
                            </button>
                          </div>
                        </div>
                    ))
                )}
              </div>
            </div>
          </section>

          {/* Completed Section */}
          <section className="completed-section">
            <div className="section-header">
              <h2><FaCheckCircle className="section-icon" /> Completed</h2>
            </div>
            <div className="topic-carousel-outer">
              <div className="topic-carousel-inner" ref={completedRef}>
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
                              <FaBookOpen className="info-icon" /> All {item.totalLessons} Lessons
                            </p>
                            <div className="progress-bar-container">
                              <div className="progress-bar completed" style={{ width: `100%` }}></div>
                            </div>
                          </div>
                          <div className="topic-card-footer">
                            <button className="sophisticated-button">Review</button>
                            <button className="sophisticated-delete-button" onClick={() => handleDeleteCourse(item.topic)}>
                              Delete <FaTrash className="delete-icon" />
                            </button>
                          </div>
                        </div>
                    ))
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
  );
};

export default Body;
