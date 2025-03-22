import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
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

import "./index.css";

/* -----------------------------------------------
   1) GRAPH RENDERING (unchanged logic)
----------------------------------------------- */
const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088FE",
    "#FFBB28",
];

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

/* -----------------------------------------------
   2) RENDER CONTENT RECURSIVELY
----------------------------------------------- */
const renderContent = (content) => {
    // If content is a string or number, render it as a paragraph with bold content
    if (typeof content === "string" || typeof content === "number") {
        return <p className="font-bold text-gray-700">{content}</p>;
    }

    // If content is an array, recursively render each item
    if (Array.isArray(content)) {
        return (
            <div className="pl-4">
                {content.map((item, index) => (
                    <div key={index} className="mb-6">
                        {renderContent(item)}
                    </div>
                ))}
            </div>
        );
    }

    // If content is an object, recursively handle its content
    if (typeof content === "object" && content !== null) {
        return Object.keys(content).map((key) => {
            const item = content[key];

            // If the item contains both "heading" and "description", render them
            if (item.heading && item.description) {
                return (
                    <div key={key} className="mb-6">
                        <h3 className="text-2xl font-semibold text-blue-800">{item.heading}</h3>
                        <p className="font-bold text-gray-700">{item.description}</p>
                    </div>
                );
            }

            // If the item is an array or object, recursively render its content
            if (typeof item === 'object' || Array.isArray(item)) {
                return (
                    <div key={key} className="content-section mb-6">
                        <div className="font-bold text-xl">{renderContent(item)}</div>
                    </div>
                );
            }

            // Render the content (value) as bold inside the section
            return (
                <div key={key} className="content-section mb-6">
                    <p className="font-bold text-gray-700">{item}</p>
                </div>
            );
        });
    }

    return null;
};






/* -----------------------------------------------
   3) INTERACTIVE COMPONENTS (actual logic)
----------------------------------------------- */

/* TIMELINE */
const Timeline = ({ title = "Timeline", data = [] }) => {
    return (
        <div className="interactive-block timeline-block">
            <h4>{title}</h4>
            <div className="timeline-line"></div>
            <ul>
                {data.map((item, idx) => (
                    <li key={idx} className="timeline-event">
                        <div className="timeline-year">{item.year}</div>
                        <div className="timeline-event-text">{item.event}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

/* MEMORY MATCH */
const MemoryMatch = ({ title = "Memory Match", pairs = [] }) => {
    // Expand each pair into two cards
    const initialCards = React.useMemo(() => {
        const allCards = pairs.flatMap((p, idx) => [
            { id: `term-${idx}`, content: p.term, pairId: idx },
            { id: `def-${idx}`, content: p.definition, pairId: idx },
        ]);
        // shuffle
        return allCards.sort(() => Math.random() - 0.5);
    }, [pairs]);

    const [cards, setCards] = useState(initialCards);
    const [flipped, setFlipped] = useState([]); // indexes of flipped
    const [matched, setMatched] = useState([]);

    const handleFlip = (i) => {
        if (matched.includes(i) || flipped.includes(i)) return;
        const newFlipped = [...flipped, i];
        if (newFlipped.length === 2) {
            const [first, second] = newFlipped;
            if (cards[first].pairId === cards[second].pairId) {
                setMatched((m) => [...m, first, second]);
            }
            setTimeout(() => setFlipped([]), 800);
        } else {
            setFlipped(newFlipped);
        }
    };

    return (
        <div className="interactive-block memory-match-block">
            <h4>{title}</h4>
            <div className="memory-grid">
                {cards.map((c, i) => {
                    const isFlipped = flipped.includes(i) || matched.includes(i);
                    return (
                        <div
                            key={c.id}
                            className={`memory-card ${isFlipped ? "flipped" : ""}`}
                            onClick={() => handleFlip(i)}
                        >
                            <div className="memory-card-inner">
                                <div className="memory-card-front">{c.content}</div>
                                <div className="memory-card-back">?</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* DRAG & DROP */
const DragDrop = ({ prompt = "Drag & Drop", items = [] }) => {
    const [correct, setCorrect] = useState([]);

    const handleDrop = (label) => {
        const item = items.find((it) => it.label === label);
        if (item && item.target === "Correct") {
            setCorrect((prev) => [...prev, label]);
        }
    };

    return (
        <div className="interactive-block dragdrop-block">
            <h4>{prompt}</h4>
            <div className="dragdrop-zone">
                <p>Drop items here if you think they fit!</p>
                <div
                    className="drop-area"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const data = e.dataTransfer.getData("text/plain");
                        handleDrop(data);
                    }}
                >
                    {correct.length > 0 ? (
                        correct.map((c) => (
                            <div key={c} className="dropped-item">
                                {c}
                            </div>
                        ))
                    ) : (
                        <div className="placeholder">No items dropped yet</div>
                    )}
                </div>
            </div>
            <div className="drag-items">
                {items.map((it) => (
                    <div
                        key={it.label}
                        className="drag-item"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/plain", it.label)}
                    >
                        {it.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

/* MAP */
const MapRegions = ({ title = "Map", regions = [] }) => {
    const [selected, setSelected] = useState(null);
    return (
        <div className="interactive-block map-block">
            <h4>{title}</h4>
            <div className="map-region-list">
                {regions.map((r, idx) => (
                    <div
                        key={idx}
                        className={`map-region-item ${r.highlight ? "highlight" : ""}`}
                        onClick={() => setSelected(r.name)}
                    >
                        {r.name}
                    </div>
                ))}
            </div>
            {selected && (
                <div className="map-region-tooltip">
                    <strong>{selected}</strong> selected!
                </div>
            )}
        </div>
    );
};

/* MAP HOTSPOTS */
const HotspotMap = ({ image = "", hotspots = [] }) => {
    const handleHotspotClick = (spot) => {
        alert(`Clicked on ${spot.label}: ${spot.tooltip}`);
    };

    return (
        <div className="interactive-block hotspot-map-block">
            <h4>Hotspot Map</h4>
            <div className="hotspot-map-wrapper">
                {image && (
                    <div className="map-container">
                        <img src={image} alt="Hotspot" className="hotspot-image" />
                        {hotspots.map((h, idx) => (
                            <div
                                key={idx}
                                className="hotspot-pin"
                                style={{ left: `${h.x}px`, top: `${h.y}px` }}
                                onClick={() => handleHotspotClick(h)}
                            >
                                ●
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

/* TYPING CHALLENGE */
const TypingChallenge = ({ text = "Type me!" }) => {
    const [userInput, setUserInput] = useState("");
    const [done, setDone] = useState(false);

    const handleChange = (e) => {
        const val = e.target.value;
        setUserInput(val);
        if (val === text) {
            setDone(true);
        }
    };

    return (
        <div className="interactive-block typing-challenge-block">
            <h4>Typing Challenge</h4>
            <p className="typing-target">Target: {text}</p>
            <input
                type="text"
                value={userInput}
                onChange={handleChange}
                placeholder="Start typing..."
                className="typing-input"
            />
            {done && <p className="typing-success">Perfect match!</p>}
        </div>
    );
};

/* SORT */
const SortList = ({ prompt = "Sort the items", items = [] }) => {
    const [sortedItems, setSortedItems] = useState(items);

    const moveUp = (idx) => {
        if (idx === 0) return;
        const newArr = [...sortedItems];
        [newArr[idx], newArr[idx - 1]] = [newArr[idx - 1], newArr[idx]];
        setSortedItems(newArr);
    };
    const moveDown = (idx) => {
        if (idx === sortedItems.length - 1) return;
        const newArr = [...sortedItems];
        [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]];
        setSortedItems(newArr);
    };

    const isSorted = JSON.stringify(sortedItems) === JSON.stringify(items);

    return (
        <div className="interactive-block sort-block">
            <h4>{prompt}</h4>
            <ul>
                {sortedItems.map((itm, idx) => (
                    <li key={idx} className="sort-item">
                        <span>{itm}</span>
                        <div className="sort-controls">
                            <button onClick={() => moveUp(idx)}>↑</button>
                            <button onClick={() => moveDown(idx)}>↓</button>
                        </div>
                    </li>
                ))}
            </ul>
            {isSorted && <p className="sort-success">Correct Order!</p>}
        </div>
    );
};

/* -----------------------------------------------
   4) RENDER INTERACTIVE (NO QUIZ TYPE!)
   Graceful error handling
----------------------------------------------- */
const InteractiveRenderer = ({ interactive }) => {
    if (!interactive || typeof interactive !== "object") return null;
    const { type } = interactive;
    if (!type) return null;

    try {
        switch (type) {
            case "timeline":
                return <Timeline {...interactive} />;
            case "memory_match":
                return <MemoryMatch {...interactive} />;
            case "drag_drop":
                return <DragDrop {...interactive} />;
            case "map":
                return <MapRegions {...interactive} />;
            case "map_hotspots":
                return <HotspotMap {...interactive} />;
            case "typing_challenge":
                return <TypingChallenge {...interactive} />;
            case "sort":
                return <SortList {...interactive} />;
            default:
                return null;
        }
    } catch (err) {
        console.error("Failed to render interactive:", type, err);
        return null;
    }
};

/* -----------------------------------------------
   5) MAIN LESSON PAGE
   transform normal quiz => interactive logic
   BUT handle array of quizzes if present
----------------------------------------------- */
const LessonPage = () => {
    const { state } = useLocation();
    const { topic, lesson_name, toc } = state || {};
    const [references, setReferences] = useState([]);
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

                const referencesData = response.data.lesson.references || [];
                setLesson(lessonData);
                setReferences(referencesData);
                console.log("Full Lesson:", lessonData);
                console.log("Full Lesson:", referencesData);
                const index = toc.findIndex((item) => item === lesson_name);
                setCurrentLessonIndex(index);
            } catch (err) {
                console.error(err);
                setError("Failed to load lesson.");
            } finally {
                setLoading(false);
            }
        };

        if (topic && lesson_name && toc) {
            fetchLesson();
        }
    }, [topic, lesson_name, toc]);

    const isLocked = (index) => index > currentLessonIndex;

    // We'll store selected answers & feedback for each quiz item
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [quizFeedbacks, setQuizFeedbacks] = useState({});

    // called when user clicks an option for a certain quizIndex
    const handleQuizOptionClick = (quizIndex, option) => {
        if (!lesson.quizzes) return;

        // If it's an array, do array logic
        if (Array.isArray(lesson.quizzes)) {
            const correctAnswer = lesson.quizzes[quizIndex]?.answer;
            if (!correctAnswer) return; // avoid undefined
            setSelectedAnswers((prev) => ({ ...prev, [quizIndex]: option }));
            if (option === correctAnswer) {
                setQuizFeedbacks((prev) => ({ ...prev, [quizIndex]: "✅ Correct!" }));
            } else {
                setQuizFeedbacks((prev) => ({ ...prev, [quizIndex]: "❌ Incorrect, try again!" }));
            }
        } else {
            // Single quiz object fallback
            const correctAnswer = lesson.quizzes.answer;
            setSelectedAnswers((prev) => ({ ...prev, 0: option }));
            if (option === correctAnswer) {
                setQuizFeedbacks((prev) => ({ ...prev, 0: "✅ Correct!" }));
            } else {
                setQuizFeedbacks((prev) => ({ ...prev, 0: "❌ Incorrect, try again!" }));
            }
        }
    };

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
                    {/* previous_summary */}
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

                    {/* content */}
                    {lesson?.content && (
                        <div className="lesson-content">
                            <h3>Content</h3>
                            {renderContent(lesson.content)}
                        </div>
                    )}

                    {/* Our new "interactive" version of the normal quiz -- now for arrays too */}
                    {lesson?.quizzes && (
                        <div className="lesson-quizzes">
                            <h3>Quiz</h3>

                            {/* If quizzes is an array, map each one. Otherwise fallback */}
                            {Array.isArray(lesson.quizzes) ? (
                                lesson.quizzes.map((quiz, quizIndex) => (
                                    <div key={quizIndex} className="quiz-item">
                                        <p className="quiz-question">{quiz.question}</p>
                                        <ul className="quiz-options">
                                            {quiz.options.map((option, optIndex) => (
                                                <li
                                                    key={optIndex}
                                                    onClick={() => handleQuizOptionClick(quizIndex, option)}
                                                    className="quiz-option"
                                                >
                                                    {option}
                                                </li>
                                            ))}
                                        </ul>
                                        {selectedAnswers[quizIndex] && (
                                            <p className="quiz-feedback">
                                                {quizFeedbacks[quizIndex]}
                                            </p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                // If it's a single quiz object
                                <div className="quiz-item">
                                    <p className="quiz-question">{lesson.quizzes.question}</p>
                                    <ul className="quiz-options">
                                        {lesson.quizzes.options.map((option, index) => (
                                            <li
                                                key={index}
                                                onClick={() => handleQuizOptionClick(0, option)}
                                                className="quiz-option"
                                            >
                                                {option}
                                            </li>
                                        ))}
                                    </ul>
                                    {selectedAnswers[0] && (
                                        <p className="quiz-feedback">
                                            {quizFeedbacks[0]}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* flashcards */}
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

                    {/* Graphs */}
                    {lesson?.graphs && <GraphRenderer graph={lesson.graphs} />}

                    {/* Interactives */}
                    {lesson?.interactives && (
                        <div className="lesson-interactives">
                            <h3>Interactive Activities</h3>
                            {lesson.interactives.map((item, idx) => (
                                <InteractiveRenderer key={idx} interactive={item} />
                            ))}
                        </div>
                    )}

                    {/* Takeaways */}
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

                    {/* References Section */}
                    {references.length > 0 && (
                        <div className="lesson-references bg-gray-100 p-4 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold mb-2 text-left">References</h3>
                            <div className="space-y-2">
                                {references.map((ref, index) => {
                                    // Extract only the URL starting from "https"
                                    const cleanLink = ref.split('Source:')[1]?.trim().split(']')[0] || ref;

                                    return (
                                        <div key={index} className="flex items-center space-x-2 p-2 bg-white rounded-md shadow-sm">
                                            <img
                                                src="https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png"
                                                alt="Wikipedia"
                                                className="w-2 h-2" // Even smaller size for the Wikipedia logo
                                            />
                                            <a
                                                href={cleanLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 font-semibold hover:underline"
                                            >
                                                {cleanLink} {/* Only show the cleaned link */}
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}




                    {/* Next Lesson */}
                    {currentLessonIndex < toc.length - 1 && (
                        <div className="lesson-navigation">
                            <button
                                className="next-button"
                                onClick={async () => {
                                    const nextLessonName = toc[currentLessonIndex + 1];
                                    try {
                                        setLoading(true);
                                        const response = await axios.post(
                                            "http://127.0.0.1:8000/generate_lesson",
                                            {
                                                topic,
                                                lesson_name: nextLessonName,
                                                toc,
                                            }
                                        );
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
