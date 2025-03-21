import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import VerticalNavbar from './components/Navbar';
import Body from './components/Body';
import TopicSearch from './components/TopicSearch';
import TableOfContentsPage from './components/TableOfContentsPage';
import AuthDialog from "./components/AuthDialog";
import { Outlet } from 'react-router-dom';
import LessonPage from "./components/Lesson";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication status

    return (
        <Router>
            <Routes>
                {/* Authentication Route */}
                <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <AuthDialog setIsAuthenticated={setIsAuthenticated} />} />

                {/* Protected Routes - Accessible only after login */}
                {isAuthenticated && (
                    <Route path="/home" element={<div className='d-flex'>
                        <VerticalNavbar /> {/* Vertical Navbar always visible */}
                        <div className="content">
                            <Outlet /> {/* This is where nested routes will render */}
                        </div>
                    </div>}>
                        {/* Nested routes now use relative paths */}
                        <Route index element={<Body />} /> {/* Default route for /home */}
                        <Route path="topic-search" element={<TopicSearch />} />
                        <Route path="table-of-contents" element={<TableOfContentsPage />} />
                        {/* Move /lesson to a relative path under /home */}
                        <Route path="lesson" element={<LessonPage />} />
                    </Route>
                )}

                {/* Redirect to login if not authenticated */}
                {!isAuthenticated && <Route path="*" element={<Navigate to="/" />} />}
            </Routes>
        </Router>
    );
}

export default App;
