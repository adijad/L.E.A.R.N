import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    ScatterChart,
    Scatter,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import axios from "axios";
import "./index.css";

const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088FE",
    "#FFBB28",
];

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

    const {
        type,
        title,
        data,
        xKey = "x",
        yKey = "y",
        categoryKey,
        dataKey,
    } = graph;

    return (
        <div className="lesson-graphs">
            <h3>{title}</h3>
            {type === "line" && (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xKey} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey={yKey} stroke="#8884d8" />
                    </LineChart>
                </ResponsiveContainer>
            )}
            {type === "bar" && (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xKey} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey={yKey} fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            )}
            {type === "pie" && (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Tooltip />
                        <Legend />
                        <Pie
                            data={data}
                            dataKey={yKey}
                            nameKey={xKey}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                        >
                            {data.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            )}
            {type === "area" && (
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xKey} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey={yKey}
                            stroke="#8884d8"
                            fill="#8884d8"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
            {type === "scatter" && (
                <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                        <CartesianGrid />
                        <XAxis dataKey={xKey} />
                        <YAxis dataKey={yKey} />
                        <Tooltip />
                        <Legend />
                        <Scatter name={title} data={data} fill="#8884d8" />
                    </ScatterChart>
                </ResponsiveContainer>
            )}
            {type === "radar" && (
                <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={data}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey={categoryKey || xKey} />
                        <PolarRadiusAxis />
                        <Tooltip />
                        <Radar
                            name={title}
                            dataKey={dataKey || yKey}
                            stroke="#8884d8"
                            fill="#8884d8"
                            fillOpacity={0.6}
                        />
                    </RadarChart>
                </ResponsiveContainer>
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
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                setLoading(true);
                const response = await axios.post(
                    "http://127.0.0.1:8000/generate_lesson",
                    {
                        topic,
                        lesson_name,
                        toc,
                    }
                );
                const lessonData = response.data.lesson.lesson
                    ? response.data.lesson.lesson
                    : response.data.lesson;
                setLesson(lessonData);
                const index = toc.findIndex((item) => item === lesson_name);
                setCurrentLessonIndex(index);
            } catch (err) {
                console.error(err);
                setError("Failed to load lesson.");
            } finally {
                setLoading(false);
            }
        };

        if (topic && lesson_name && toc) fetchLesson();
    }, [topic, lesson_name, toc]);

    const isLocked = (index) => index > currentLessonIndex;

    if (loading) return <p>Loading lesson...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="lesson-layout">
            {/* Floating ToC */}
            <aside className="lesson-sidebar">
                <h3>Table of Contents</h3>
                <ul className="lesson-toc">
                    {toc.map((item, index) => (
                        <li
                            key={index}
                            className={
                                index < currentLessonIndex
                                    ? "toc-visited"
                                    : index === currentLessonIndex
                                        ? "toc-current"
                                        : "toc-locked"
                            }
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Lesson Content */}
            <div className="lesson-container">
                <h1 className="lesson-title">{lesson?.title}</h1>
                <h2>Overview</h2>
                <p className="lesson-overview">{lesson?.overview}</p>

                <div className={isLocked(currentLessonIndex) ? "locked-section" : ""}>
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
                        </div>
                    )}

                    {lesson?.flashcards && (
                        <div className="lesson-flashcards">
                            <h3>Flashcards</h3>
                            <div className="flashcard-grid">
                                {(Array.isArray(lesson.flashcards)
                                    ? lesson.flashcards
                                    : Object.values(lesson.flashcards)
                                ).map((flashcard, index) => (
                                    <div key={index} className="flashcard">
                                        <div className="flashcard-inner">
                                            <div className="flashcard-front">
                                                <p>{flashcard.term}</p>
                                            </div>
                                            <div className="flashcard-back">
                                                <p>{flashcard.definition}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
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

                    {currentLessonIndex < toc.length - 1 && (
                        <div className="lesson-navigation">
                            <button
                                className="next-button"
                                onClick={async () => {
                                    const nextLessonName = toc[currentLessonIndex + 1];
                                    try {
                                        setLoading(true);
                                        const response = await axios.post("http://127.0.0.1:8000/generate_lesson", {
                                            topic,
                                            lesson_name: nextLessonName,
                                            toc,
                                        });
                                        const lessonData = response.data.lesson.lesson
                                            ? response.data.lesson.lesson
                                            : response.data.lesson;
                                        setLesson(lessonData);
                                        setCurrentLessonIndex(currentLessonIndex + 1);
                                    } catch (err) {
                                        console.error("Failed to load next lesson:", err);
                                        setError("Failed to load next lesson.");
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                            >
                                Next Lesson →
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default LessonPage;
