import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from "react-router-dom";
import TopNavbar from './components/Navbar/TopNavbar';
import Body from './components/Body';
import TopicSearch from './components/TopicSearch';
import TableOfContentsPage from './components/TableOfContentsPage';
import LessonPage from './components/Lesson';
import AuthDialog from "./components/AuthDialog";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication status

    return (
        <Router>
            <Routes>
                {/* Login Page */}
                <Route path="/" element={
                    isAuthenticated
                        ? <Navigate to="/home" replace />
                        : <AuthDialog setIsAuthenticated={setIsAuthenticated} />
                } />

                {/* Protected Dashboard Routes */}
                <Route path="/home/*" element={
                    isAuthenticated
                        ? <div className="app-wrapper">
                            <TopNavbar />
                            <div className="main-content">
                                <Outlet />
                            </div>
                        </div>
                        : <Navigate to="/" replace />
                }>
                    <Route index element={<Body />} />
                    <Route path="topic-search" element={<TopicSearch />} />
                    <Route path="table-of-contents" element={<TableOfContentsPage />} />
                    <Route path="lesson" element={<LessonPage />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;