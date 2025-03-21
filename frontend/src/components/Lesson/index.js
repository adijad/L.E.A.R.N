import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

import axios from "axios";
import "./index.css";

// Recursive function to render any kind of content (string, array, or object)
const renderContent = (content) => {
    if (typeof content === "string" || typeof content === "number") {
        return <p>{content}</p>;
    }
    if (Array.isArray(content)) {
        return (
            <ul>
                {content.map((item, index) => (
                    <li key={index}>{renderContent(item)}</li>
                ))}
            </ul>
        );
    }
    if (typeof content === "object" && content !== null) {
        return Object.keys(content).map((key) => (
            <div key={key} className="content-section">
                <h4 className="content-key">{key}</h4>
                {renderContent(content[key])}
            </div>
        ));
    }
    return null;
};

const GraphRenderer = ({ graph }) => {
    if (!graph || !graph.data || !graph.type) return null;

    return (
        <div className="lesson-graphs">
            <h3>{graph.title}</h3>
            {graph.type === "line" && (
                <LineChart width={600} height={300} data={graph.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={graph.xKey || "x"} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey={graph.yKey || "y"} stroke="#8884d8" />
                </LineChart>
            )}
        </div>
    );
};


const LessonPage = () => {
    const { state } = useLocation();
    const { topic, lesson_name, toc } = state || {};

    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (lesson_name && topic && toc) {
            const fetchLesson = async () => {
                try {
                    console.log("Request Payload:", { topic, lesson_name, toc });
                    const response = await axios.post(
                        "http://127.0.0.1:8000/generate_lesson",
                        {
                            topic,
                            lesson_name,
                            toc,
                        }
                    );
                    console.log("Response Body:", response.data);
                    // Extract inner lesson data if nested
                    const lessonData = response.data.lesson.lesson
                        ? response.data.lesson.lesson
                        : response.data.lesson;
                    setLesson(lessonData);
                } catch (err) {
                    console.error(err);
                    setError("Failed to load lesson.");
                } finally {
                    setLoading(false);
                }
            };

            fetchLesson();
        }
    }, [lesson_name, topic, toc]);

    if (loading) {
        return <p>Loading lesson...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
        <div className="lesson-container">
            <h1 className="lesson-title">{lesson?.title}</h1>
            <h2>Overview</h2>
            <p className="lesson-overview">{lesson?.overview}</p>

            {lesson?.previous_summary && (
                <div className="lesson-summary">
                    <h3>Previous Summary</h3>
                    {typeof lesson.previous_summary === "object" ? (
                        renderContent(lesson.previous_summary)
                    ) : (
                        <p>{lesson.previous_summary}</p>
                    )}
                </div>
            )}

            {lesson?.content && (
                <div className="lesson-content">
                    <h3>Content</h3>
                    {renderContent(lesson.content)}
                </div>
            )}

            {lesson?.quizzes && (
                <div className="lesson-quizzes">
                    <h3>Quiz</h3>
                    {Array.isArray(lesson.quizzes) ? (
                        lesson.quizzes.map((quiz, index) => (
                            <div key={index} className="quiz-item">
                                <p className="quiz-question">{quiz.question}</p>
                                <ul className="quiz-options">
                                    {quiz.options.map((option, idx) => (
                                        <li key={idx}>{option}</li>
                                    ))}
                                </ul>
                                <p className="quiz-answer">
                                    <strong>Answer: </strong>
                                    {quiz.answer}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="quiz-item">
                            <p className="quiz-question">{lesson.quizzes.question}</p>
                            <ul className="quiz-options">
                                {lesson.quizzes.options.map((option, index) => (
                                    <li key={index}>{option}</li>
                                ))}
                            </ul>
                            <p className="quiz-answer">
                                <strong>Answer: </strong>
                                {lesson.quizzes.answer}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {lesson?.flashcards && (
                <div className="lesson-flashcards">
                    <h3>Flashcards</h3>
                    <ul>
                        {(Array.isArray(lesson.flashcards)
                            ? lesson.flashcards
                            : Object.values(lesson.flashcards)
                        ).map((flashcard, index) => (
                            <li key={index} className="flashcard-item">
                                <strong>{flashcard.term}:</strong> {flashcard.definition}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {lesson?.graphs && <GraphRenderer graph={lesson.graphs} />}


            {lesson?.takeaways && (
                <div className="lesson-takeaways">
                    <h3>Takeaways</h3>
                    <ul>
                        {lesson.takeaways.map((takeaway, index) => (
                            <li key={index}>{takeaway}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default LessonPage;
