// Body.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaHourglassHalf, FaBookOpen } from 'react-icons/fa';

import './index.css';

const Body = () => {
  const email = localStorage.getItem("userEmail");
  const [summary, setSummary] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
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

    fetchTopicSummary();
  }, [email]);

  const inProgress = summary.filter(item => item.completionPercentage < 100);
  const completed = summary.filter(item => item.completionPercentage === 100);

  const handleContinueClick = async (topicName) => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      console.error("User email not found.");
      return;
    }

    try {
      const response = await axios.get("http://localhost:8080/api/auth/progress/getTOC", {
        params: { email: email, topic: topicName }
      });

      if (response.data && Array.isArray(response.data.table_of_contents)) {
        const toc = response.data.table_of_contents;
        // Navigate to the nested route 'table-of-contents' under '/home'
        navigate(`/home/table-of-contents?topic=${topicName}`, { state: { topic: topicName, toc } });
      } else {
        console.error("Invalid TOC response:", response.data);
      }
    } catch (error) {
      console.error("Error fetching TOC:", error);
    }
  };

  return (
      <div className="dashboard-body-container">
        <header className="dashboard-body-header">
          <h1>Your Learning Dashboard</h1>
          <p className="dashboard-body-subtitle">Track your progress and continue your learning journey!</p>
        </header>

        <main className="dashboard-body-content">
          <section className="progress-section">
            <div className="section-header">
              <h2><FaHourglassHalf className="section-icon" /> In Progress</h2>
            </div>
            <div className="topic-grid">
              {inProgress.length === 0 ? (
                  <div className="empty-state">
                    <p>You are not currently enrolled in any topics.</p>
                  </div>
              ) : (
                  inProgress.map((item, idx) => (
                      <div key={idx} className="topic-card in-progress-card">
                        <div className="topic-card-header">
                          <h3 className="topic-title">{item.topic.toUpperCase()} <span className="topic-percentage">{item.completionPercentage}%</span></h3>
                        </div>
                        <div className="topic-card-body">
                          <p className="lesson-info">
                            <FaBookOpen className="info-icon" /> {item.completedLessons} / {item.totalLessons} Lessons
                          </p>
                          <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${item.completionPercentage}%` }}>
                            </div>
                          </div>
                        </div>
                        <div className="topic-card-footer">
                          <button className="continue-button" onClick={() => handleContinueClick(item.topic)}>Continue</button>
                        </div>
                      </div>
                  ))
              )}
            </div>
          </section>

          <section className="completed-section">
            <div className="section-header">
              <h2><FaCheckCircle className="section-icon" /> Completed</h2>
            </div>
            <div className="topic-grid">
              {completed.length === 0 ? (
                  <div className="empty-state">
                    <p>No completed topics yet. Keep up the great work!</p>
                  </div>
              ) : (
                  completed.map((item, idx) => (
                      <div key={idx} className="topic-card completed-card">
                        <div className="topic-card-header">
                          <h3 className="topic-title">{item.topic.toUpperCase()} <span className="topic-percentage completed-percentage">Completed</span></h3>
                        </div>
                        <div className="topic-card-body">
                          <p className="lesson-info">
                            <FaBookOpen className="info-icon" /> All {item.totalLessons} Lessons
                          </p>
                          <div className="progress-bar-container">
                            <div className="progress-bar completed" style={{ width: `100%` }}>
                            </div>
                          </div>
                        </div>
                        <div className="topic-card-footer">
                          <button className="review-button">Review</button>
                        </div>
                      </div>
                  ))
              )}
            </div>
          </section>
        </main>
      </div>
  );
};

export default Body;