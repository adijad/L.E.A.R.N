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
import TTSSection from "./tts";
import languageOptions from "../../constants/languageOptions";

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
const renderContent = (content, currentLanguage) => {
    if (typeof content === "string" || typeof content === "number") {
        return (<p className="font-bold text-gray-700">
            {content} <TTSSection text={content.toString()} />
        </p>);
    }

    if (Array.isArray(content)) {
        return (
            <div className="pl-4">
                {content.map((item, index) => (
                    <div key={index} className="mb-6">
                        {renderContent(item, currentLanguage)}
                    </div>
                ))}
            </div>
        );
    }

    if (typeof content === "object" && content !== null) {
        return Object.keys(content).map((key) => {
            const item = content[key];
            

            if (item.heading && item.description) {
                return (
                    <div key={key} className="mb-6">
                        <h3 className="text-2xl font-semibold text-blue-800">
                            {item.heading}
                        </h3>
                        <p className="font-bold text-gray-700">{item.description}</p>
                        <TTSSection text={item.heading.toString() + item.description.toString()} currentLanguage={currentLanguage}/>
                    </div>
                );
            }

            if (typeof item === "object" || Array.isArray(item)) {
                return (
                    <div key={key} className="content-section mb-6">
                        <div className="font-bold text-xl">{renderContent(item, currentLanguage)}</div>
                        <TTSSection text={item.toString()} currentLanguage={currentLanguage}/>
                    </div>
                );
            }

            return (
                <div key={key} className="content-section mb-6">
                    <p className="font-bold text-gray-700">{item}</p>
                    <TTSSection text={item.toString()} currentLanguage={currentLanguage}/>
                </div>
            );
        });
    }

    return null;
};

// Helper: Format snake_case key to Capitalized Words.
// const formatKey = (key) =>
//     key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

// ==========================
// CollapsibleSection Component
// ==========================
// const CollapsibleSection = ({ sectionKey, value, level }) => {
//     const isTopLevel = level === 1;
//     const [open, setOpen] = useState(true);

//     // Compute heading text.
//     const heading = formatKey(sectionKey);
//     const HeaderTag = `h${Math.min(level + 1, 5)}`;

//     // Decide if we display TTS icon for top-level sections.
//     let ttsText = "";
//     if (typeof value === "string" || typeof value === "number") {
//         ttsText = value.toString();
//     } else if (
//         Array.isArray(value) &&
//         value.every((item) => typeof item === "string" || typeof item === "number")
//     ) {
//         ttsText = value.join(". ");
//     }
//     const showTTS = isTopLevel && ttsText.length > 0;

//     return (
//         <div
//             className={`mb-6 ${isTopLevel ? "rounded-xl shadow-md p-4 bg-white border" : ""
//                 }`}
//         >
//             {isTopLevel ? (
//                 <div
//                     className="flex items-center justify-between cursor-pointer mb-2"
//                     onClick={() => setOpen((prev) => !prev)}
//                 >
//                     <div className="flex items-center gap-2">
//                         {showTTS && (
//                             <span onClick={(e) => e.stopPropagation()}>
//                                 <TTSSection text={`${heading}. ${ttsText}`} />
//                             </span>
//                         )}
//                         <HeaderTag
//                             className={`font-bold ${isTopLevel
//                                     ? "text-2xl text-blue-800"
//                                     : level === 2
//                                         ? "text-xl text-purple-700"
//                                         : "text-lg text-green-800"
//                                 }`}
//                         >
//                             {heading}
//                         </HeaderTag>
//                     </div>
//                     <span className="text-gray-500 text-sm select-none">
//                         {open ? "▾" : "▸"}
//                     </span>
//                 </div>
//             ) : (
//                 <div className="flex items-center gap-2 mb-2">
//                     {showTTS && (
//                         <span onClick={(e) => e.stopPropagation()}>
//                             <TTSSection text={`${heading}. ${ttsText}`} />
//                         </span>
//                     )}
//                     <HeaderTag
//                         className={`font-bold ${level === 2 ? "text-xl text-purple-700" : "text-lg text-green-800"
//                             }`}
//                     >
//                         {heading}
//                     </HeaderTag>
//                 </div>
//             )}

//             {(!isTopLevel || open) && (
//                 <div className="ml-4 mt-2">{renderContent(value, level + 1)}</div>
//             )}
//         </div>
//     );
// };

// ==========================
// renderContent Function
// ==========================
// const renderContent = (content, level = 1) => {
//     // 1. Primitives → render as paragraph.
//     if (typeof content === "string" || typeof content === "number") {
//         return <p className="text-gray-700 italic">{content}</p>;
//     }

//     // 2. Arrays:
//     if (Array.isArray(content)) {
//         // If array of primitives → render as an ordered list.
//         if (
//             content.every(
//                 (item) => typeof item === "string" || typeof item === "number"
//             )
//         ) {
//             return (
//                 <ol className="list-decimal list-inside ml-6 text-gray-800">
//                     {content.map((item, idx) => (
//                         <li key={idx}>{item}</li>
//                     ))}
//                 </ol>
//             );
//         }
//         // Otherwise, assume array of objects.
//         return (
//             <>
//                 {content.map((item, idx) => (
//                     <div key={idx} className="ml-4 mb-4 border-l-2 border-gray-200 pl-4">
//                         {renderContent(item, level + 1)}
//                     </div>
//                 ))}
//             </>
//         );
//     }

//     // 3. Objects: iterate over its keys.
//     if (typeof content === "object" && content !== null) {
//         return (
//             <div>
//                 {Object.entries(content).map(([key, value]) =>
//                     level === 1 ? (
//                         <CollapsibleSection
//                             key={key}
//                             sectionKey={key}
//                             value={value}
//                             level={level}
//                         />
//                     ) : (
//                         <div key={key} className="mb-4">
//                             <div className="flex items-center gap-2 mb-1">
//                                 <h4 className="font-bold text-lg text-green-800">
//                                     {formatKey(key)}
//                                 </h4>
//                             </div>
//                             <div className="ml-4">{renderContent(value, level + 1)}</div>
//                         </div>
//                     )
//                 )}
//             </div>
//         );
//     }

//     // 4. Fallback.
//     return null;
// };

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
    const initialCards = React.useMemo(() => {
        const allCards = pairs.flatMap((p, idx) => [
            { id: `term-${idx}`, content: p.term, pairId: idx },
            { id: `def-${idx}`, content: p.definition, pairId: idx },
        ]);
        return allCards.sort(() => Math.random() - 0.5);
    }, [pairs]);

    const [cards, setCards] = useState(initialCards);
    const [flipped, setFlipped] = useState([]);
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
   4) RENDER INTERACTIVE
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
----------------------------------------------- */

const LessonPage = () => {
    const { state } = useLocation();
    const {
        topic,
        lesson_name,
        toc: stateToc,
        email: stateEmail,
        language: stateLanguage,
    } = state || {};
    const [currentLanguage, setCurrentLanguage] = useState(
        stateLanguage || "English_USA"
    );
    const [toc, setCurrentToC] = useState(stateToc);
    const email = stateEmail || localStorage.getItem("userEmail");
    const [references, setReferences] = useState([]);
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [lessonName, setLessonName] = useState(lesson_name);
    const [showScorePopup, setShowScorePopup] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [nextDifficulty, setNextDifficulty] = useState("");
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [quizFeedbacks, setQuizFeedbacks] = useState({});

    //loading states
    const [nextLessonLoad, setNextLessonLoad] = useState(false);
    const [translateLoad, setTranslateLoad] = useState(false);

    // Helper function to map a language code to its user-friendly label.
    const getLabelFromCode = (code) => {
        const lang = languageOptions.find((l) => l.code === code);
        return lang ? lang.label : "English (USA)";
    };

    //translate
    const translateLesson = async () => {
        setLoading(true);
        try {
            // Call the /translate API with the current lesson JSON
            const response = await axios.post(
                `http://127.0.0.1:8000/translate?language=${encodeURIComponent(
                    getLabelFromCode(currentLanguage)
                )}`,
                { lesson }, // Payload structure: { lesson: { ... } }
                { headers: { "Content-Type": "application/json" } }
            );
            // Update lesson with translated lesson JSON.
            if (response.data.lesson) {
                console.log(response.data.lesson);
                setLesson(response.data.lesson);
            }
        } catch (error) {
            console.error("Error translating lesson", error);
        } finally {
            setLoading(false);
        }
    };

    const translateToC = async () => {
        try {
            // Call the /translate API with the current lesson JSON
            const response = await axios.post(
                `http://127.0.0.1:8000/translate?language=${encodeURIComponent(
                    getLabelFromCode(currentLanguage)
                )}`,
                { toc }, // Payload structure: { lesson: { ... } }
                { headers: { "Content-Type": "application/json" } }
            );
            // Update lesson with translated lesson JSON.
            if (response.data.toc) {
                console.log(response.data.toc);
                setCurrentToC(response.data.toc);
            }
        } catch (error) {
            console.error("Error translating lesson", error);
        }
    };

    //fetch lesson
    const fetchLesson = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `http://127.0.0.1:8000/generate_lesson?language=${encodeURIComponent(
                    getLabelFromCode(currentLanguage)
                )}`,
                { topic, lesson_name, toc },
                { headers: { "Content-Type": "application/json" } }
            );

            const lessonData = response.data.lesson.lesson || response.data.lesson;
            const referencesData = response.data.lesson.references || [];

            setLesson(lessonData);
            setReferences(referencesData);

            const index = toc.findIndex((item) => item === lesson_name);
            setCurrentLessonIndex(index);

            await axios.post("http://localhost:8080/api/auth/progress/save", {
                email,
                topic,
                lessonName: lesson_name,
                tocIndex: index,
                completed: false,
                lessonJson: JSON.stringify(lessonData),
            });
        } catch (err) {
            console.error(err);
            setError("Failed to load lesson.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (lesson_name) fetchLesson();
    }, [lesson_name]);

    // ---------------------------------
    // 2) When the language changes, translate the loaded lesson.
    // ---------------------------------
    useEffect(() => {
        // Only translate if a lesson exists
        if (!lesson) return;

        translateLesson();
        translateToC();
    }, [currentLanguage]); // Runs whenever language changes

    const handleQuizOptionClick = (quizIndex, option) => {
        if (!lesson?.quizzes) return;

        const quizzes = Array.isArray(lesson.quizzes)
            ? lesson.quizzes
            : [lesson.quizzes];
        const correctAnswer = quizzes[quizIndex]?.answer;

        if (!correctAnswer) return;

        setSelectedAnswers((prev) => ({ ...prev, [quizIndex]: option }));
        setQuizFeedbacks((prev) => ({
            ...prev,
            [quizIndex]:
                option === correctAnswer ? "✅ Correct!" : "❌ Incorrect, try again!",
        }));
    };

    const calculateScoreAndShowPopup = async () => {
        if (!lesson?.quizzes) {
            await handleNextLesson();
            return;
        }

        const quizzes = Array.isArray(lesson.quizzes)
            ? lesson.quizzes
            : [lesson.quizzes];
        let correct = 0;

        quizzes.forEach((quiz, index) => {
            if (selectedAnswers[index] === quiz.answer) correct++;
        });

        const score = (correct / quizzes.length) * 100;
        setQuizScore(score);

        if (score > 0) {
            await axios.post("http://localhost:8080/api/auth/progress/save", {
                email,
                topic,
                lessonName,
                tocIndex: currentLessonIndex,
                completed: true,
                lessonJson: JSON.stringify(lesson),
            });
        }

        setNextDifficulty(score < 50 ? "Easy" : score <= 80 ? "Medium" : "Hard");
        setShowScorePopup(score > 0);
    };

    const handleNextLesson = async () => {
        const nextLessonName = toc[currentLessonIndex + 1];
        try {
            // setLoading(true);
            setNextLessonLoad(true);
            const response = await axios.post(
                `http://127.0.0.1:8000/generate_lesson?language=${encodeURIComponent(
                    getLabelFromCode(currentLanguage)
                )}`,
                {
                    topic,
                    lesson_name: nextLessonName,
                    toc,
                },
                { headers: { "Content-Type": "application/json" } }
            );

            setLesson(response.data.lesson.lesson || response.data.lesson);
            setCurrentLessonIndex((prev) => prev + 1);
            setSelectedAnswers({});
            setQuizFeedbacks({});
            setLessonName(nextLessonName);
        } catch (err) {
            console.error("Failed to load next lesson:", err);
            setError("Failed to load next lesson.");
        } finally {
            setNextLessonLoad(false);
            // setLoading(false);
        }
    };

    // if (loading) return <div className="lesson-loading">📚 Loading lesson...</div>;

    //------------ Fancy Loading ---------------------------

    if (loading)
        return (
            <div className="loader-layout">
                <div className="loader-container">
                    <svg
                        className="loaderSVG"
                        viewBox="0 0 120 30"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle cx="15" cy="15" r="16" fill="#3b82f6">
                            <animate
                                attributeName="cy"
                                values="15;7;15;15"
                                dur="1.6s"
                                keyTimes="0;0.3;0.6;1"
                                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
                                calcMode="spline"
                                repeatCount="indefinite"
                                begin="0s"
                            />
                            <animate
                                attributeName="ry"
                                values="8;8;6;8"
                                dur="1.6s"
                                keyTimes="0;0.3;0.6;1"
                                repeatCount="indefinite"
                                begin="0s"
                            />
                            <animate
                                attributeName="rx"
                                values="8;8;9;8"
                                dur="1.6s"
                                keyTimes="0;0.3;0.6;1"
                                repeatCount="indefinite"
                                begin="0s"
                            />
                            <animate
                                attributeName="fill"
                                values="#3b82f6;#6366f1;#8b5cf6;#3b82f6"
                                dur="1.6s"
                                repeatCount="indefinite"
                                begin="0s"
                            />
                        </circle>

                        <circle cx="60" cy="15" r="16" fill="#3b82f6">
                            <animate
                                attributeName="cy"
                                values="15;7;15;15"
                                dur="1.6s"
                                keyTimes="0;0.3;0.6;1"
                                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
                                calcMode="spline"
                                repeatCount="indefinite"
                                begin="0.4s"
                            />
                            <animate
                                attributeName="ry"
                                values="8;8;6;8"
                                dur="1.6s"
                                keyTimes="0;0.3;0.6;1"
                                repeatCount="indefinite"
                                begin="0.4s"
                            />
                            <animate
                                attributeName="rx"
                                values="8;8;9;8"
                                dur="1.6s"
                                keyTimes="0;0.3;0.6;1"
                                repeatCount="indefinite"
                                begin="0.4s"
                            />
                            <animate
                                attributeName="fill"
                                values="#3b82f6;#6366f1;#8b5cf6;#3b82f6"
                                dur="1.6s"
                                repeatCount="indefinite"
                                begin="0.4s"
                            />
                        </circle>

                        <circle cx="105" cy="15" r="16" fill="#3b82f6">
                            <animate
                                attributeName="cy"
                                values="15;7;15;15"
                                dur="1.6s"
                                keyTimes="0;0.3;0.6;1"
                                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
                                calcMode="spline"
                                repeatCount="indefinite"
                                begin="0.8s"
                            />
                            <animate
                                attributeName="ry"
                                values="8;8;6;8"
                                dur="1.6s"
                                keyTimes="0;0.3;0.6;1"
                                repeatCount="indefinite"
                                begin="0.8s"
                            />
                            <animate
                                attributeName="rx"
                                values="8;8;9;8"
                                dur="1.6s"
                                keyTimes="0;0.3;0.6;1"
                                repeatCount="indefinite"
                                begin="0.8s"
                            />
                            <animate
                                attributeName="fill"
                                values="#3b82f6;#6366f1;#8b5cf6;#3b82f6"
                                dur="1.6s"
                                repeatCount="indefinite"
                                begin="0.8s"
                            />
                        </circle>
                        <circle cx="150" cy="15" r="16" fill="#3b82f6">
                            <animate
                                attributeName="cy"
                                values="15;7;15;15"
                                dur="1.6s"
                                keyTimes="0;0.3;0.6;1"
                                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
                                calcMode="spline"
                                repeatCount="indefinite"
                                begin="0.8s"
                            />
                            <animate
                                attributeName="ry"
                                values="8;8;6;8"
                                dur="1.6s"
                                keyTimes="0;0.3;0.6;1"
                                repeatCount="indefinite"
                                begin="0.8s"
                            />
                            <animate
                                attributeName="rx"
                                values="8;8;9;8"
                                dur="1.6s"
                                keyTimes="0;0.3;0.6;1"
                                repeatCount="indefinite"
                                begin="0.8s"
                            />
                            <animate
                                attributeName="fill"
                                values="#3b82f6;#6366f1;#8b5cf6;#3b82f6"
                                dur="1.6s"
                                repeatCount="indefinite"
                                begin="0.8s"
                            />
                        </circle>
                    </svg>
                </div>
            </div>
        );

    //----------------

    if (error) return <div className="lesson-error">⚠️ {error}</div>;

    return (
        <div className="lesson-layout">
            {/* Sidebar */}
            <div className="lesson-header">
                <div className="lesson-language-selector">
                    <select
                        id="lesson-language-select"
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
            </div>
            <aside className="lesson-sidebar">
                <h3>Course Progress</h3>
                <ul className="lesson-toc">
                    {toc?.map((item, index) => (
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

            {/* Main Content */}
            <div className="lesson-container">
                {/* Header */}

                <h1 className="lesson-title">{lesson?.title}</h1>

                {/* Overview */}
                {lesson?.overview && (
                    <div className="lesson-overview">
                        <div className="overview-icon">📘</div>
                        {lesson.overview}
                    </div>
                )}

                {/* Previous Summary */}
                {lesson?.previous_summary && (
                    <div className="lesson-summary">
                        <h3>📌 Previous Summary</h3>
                        <div className="summary-content">
                            {typeof lesson.previous_summary === "object"
                                ? renderContent(lesson.previous_summary, currentLanguage)
                                : lesson.previous_summary}
                        </div>
                    </div>
                )}

                {/* Main Content */}
                {lesson?.content && (
                    <div className="lesson-content">
                        <h3 className="mb-4">📖 Lesson Content</h3>
                        <div className="content-grid">{renderContent(lesson.content, currentLanguage)}</div>
                    </div>
                )}

                {/* Quizzes */}
                {lesson?.quizzes && (
                    <div className="lesson-quizzes">
                        <h3>📝 Knowledge Check</h3>
                        {(Array.isArray(lesson.quizzes)
                            ? lesson.quizzes
                            : [lesson.quizzes]
                        ).map((quiz, quizIndex) => (
                            <div key={quizIndex} className="quiz-item">
                                <p className="quiz-question">{quiz.question}</p>
                                <div className="quiz-options">
                                    {quiz.options?.map((option, optIndex) => (
                                        <div
                                            key={optIndex}
                                            className={`quiz-option ${selectedAnswers[quizIndex] === option ? "selected" : ""
                                                }`}
                                            onClick={() => handleQuizOptionClick(quizIndex, option)}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                                {quizFeedbacks[quizIndex] && (
                                    <div className="quiz-feedback">
                                        {quizFeedbacks[quizIndex]}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Flashcards */}
                {lesson?.flashcards && (
                    <div className="lesson-flashcards">
                        <h3>🔑 Key Concepts</h3>
                        <div className="flashcard-grid">
                            {(Array.isArray(lesson.flashcards)
                                ? lesson.flashcards
                                : Object.entries(lesson.flashcards)
                            ).map((flashcard, index) => (
                                <div key={index} className="flashcard">
                                    <div className="flashcard-inner">
                                        <div className="flashcard-front">
                                            <p>
                                                {Array.isArray(flashcard)
                                                    ? flashcard[0]
                                                    : flashcard.term}
                                            </p>
                                        </div>
                                        <div className="flashcard-back">
                                            <p>
                                                {Array.isArray(flashcard)
                                                    ? flashcard[1]
                                                    : flashcard.definition}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {lesson?.graphs && <GraphRenderer graph={lesson.graphs} />}

                {/* Interactive Activities */}
                {lesson?.interactives && (
                    <div className="lesson-interactives">
                        <h3>🎮 Interactive Learning</h3>
                        {lesson.interactives.length > 0 ? (
                            lesson.interactives.map((interactive, idx) => (
                                <InteractiveRenderer
                                    key={idx}
                                    interactive={{
                                        ...interactive,
                                        pairs: interactive.pairs || [],
                                        items: interactive.items || [],
                                        regions: interactive.regions || [],
                                        hotspots: interactive.hotspots || [],
                                    }}
                                />
                            ))
                        ) : (
                            <div className="empty-state">
                                🎲 No interactive activities available for this lesson
                            </div>
                        )}
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

                {/* References */}
                {references.length > 0 && (
                    <div className="lesson-references">
                        <h3>📚 Reference Materials</h3>
                        <div className="references-grid">
                            {references
                                .filter((ref) => typeof ref === "string")
                                .map((ref, index) => {
                                    const cleanRef = ref.replace(/^Source:\s*/i, "");
                                    return (
                                        <div key={index} className="reference-item">
                                            <img
                                                src="https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png"
                                                alt="Reference"
                                                className="reference-icon"
                                            />
                                            <a
                                                href={cleanRef}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="reference-link"
                                            >
                                                {cleanRef}
                                            </a>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                {currentLessonIndex < toc?.length - 1 && !nextLessonLoad ? (
                    <div className="lesson-navigation">
                        <button
                            className="next-button"
                            onClick={calculateScoreAndShowPopup}
                        >
                            {Object.keys(selectedAnswers).length === 0
                                ? "Continue Learning →"
                                : "Check Progress →"}
                        </button>
                    </div>
                ) : (
                    <div class="loading-wrapper">
                        <div class="loader"></div>
                    </div>
                )}

                {/* Score Popup */}
                {showScorePopup && (
                    <div className="score-popup-overlay">
                        <div className="score-popup">
                            <h3>🎉 Progress Update</h3>
                            <div className="score-display">
                                <div className="score-value">{quizScore.toFixed(0)}%</div>
                                <p className="score-message">
                                    {quizScore === 100 ? (
                                        <>
                                            Perfect score! Ready for the next challenge at{" "}
                                            <strong>{nextDifficulty}</strong> level!
                                        </>
                                    ) : (
                                        <>
                                            Great effort! Next lesson will be{" "}
                                            <strong>{nextDifficulty}</strong> difficulty
                                        </>
                                    )}
                                </p>
                            </div>
                            <button
                                className={`proceed-button ${quizScore === 100 ? "success" : "warning"
                                    }`}
                                onClick={() => {
                                    setShowScorePopup(false);
                                    handleNextLesson();
                                }}
                            >
                                Continue Journey →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper function for content rendering

export default LessonPage;
