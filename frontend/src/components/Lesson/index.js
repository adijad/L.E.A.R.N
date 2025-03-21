import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

// Recursive function to render content dynamically
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
                    const response = await axios.post("http://127.0.0.1:8000/generate_lesson", {
                        topic,
                        lesson_name,
                        toc,
                    });
                    console.log("Response Body:", response.data);
                    // If the API returns lesson data nested as response.data.lesson.lesson, extract it
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
                    {Array.isArray(lesson.previous_summary) ? (
                        <ul>
                            {lesson.previous_summary.map((summary, index) => (
                                <li key={index}>{summary}</li>
                            ))}
                        </ul>
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
                        {lesson.flashcards.map((flashcard, index) => (
                            <li key={index} className="flashcard-item">
                                <strong>{flashcard.term}:</strong> {flashcard.definition}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {lesson?.graphs && (
                <div className="lesson-graphs">
                    <h3>{lesson.graphs.title}</h3>
                    <div dangerouslySetInnerHTML={{ __html: lesson.graphs.code }} />
                </div>
            )}

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
