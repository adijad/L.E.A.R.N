import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./index.css";

const TableOfContentsPage = ({ topic }) => {
  const navigate = useNavigate();
  const [tableOfContents, setTableOfContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTOC = async () => {
      if (!topic) {
        setError("Topic is not provided.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post("http://127.0.0.1:8000/get_toc", { topic });

        console.log("Full Response:", response);
        console.log("Response Body:", response.data);

        if (response.data && Array.isArray(response.data.table_of_contents)) {
          setTableOfContents(response.data.table_of_contents);
        } else {
          setError("Invalid response format.");
        }
      } catch (err) {
        setError("Failed to load Table of Contents.");
      } finally {
        setLoading(false);
      }
    };

    fetchTOC();
  }, [topic]);

  const handleLessonClick = (lessonName) => {
    const dataToSend = {
      topic: topic,
      lesson_name: lessonName,
      toc: tableOfContents,
    };

    // Pass the data in the navigate state, no need to include /home or /lesson in the path
    navigate("/home/lesson", { state: dataToSend });
  };

  return (
      <div className="toc-container">
        <h1>Table of Contents for {topic}</h1>

        {loading ? (
            <p>Loading Table of Contents...</p>
        ) : error ? (
            <p className="error">{error}</p>
        ) : (
            <table className="toc-table">
              <thead>
              <tr>
                <th>#</th>
                <th>Lesson</th>
              </tr>
              </thead>
              <tbody>
              {tableOfContents.map((lesson, index) => (
                  <tr
                      key={index}
                      className={index === 0 ? "active-lesson" : "disabled-lesson"}
                      onClick={() => handleLessonClick(lesson)} // Handle lesson click
                  >
                    <td>{index + 1}</td>
                    <td>{lesson}</td>
                  </tr>
              ))}
              </tbody>
            </table>
        )}

        <button className="close-button" onClick={() => window.close()}>
          Close
        </button>
      </div>
  );
};

export default TableOfContentsPage;
