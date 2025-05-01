import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaTachometerAlt, FaSearch, FaBook, FaEnvelope, FaChartBar, FaCog, FaSignOutAlt, FaUserCircle } from 'react-icons/fa'; // Import user icon
import './index.css';

const VerticalNavbar = () => {
    const location = useLocation();
    const userEmail = localStorage.getItem('userEmail'); // Retrieve user email from local storage

    const navItems = [
        { path: '/home', label: 'Dashboard', icon: <FaTachometerAlt /> },
        { path: '/home/topic-search', label: 'Topic Search', icon: <FaSearch /> },
        { path: '#', label: 'My Courses', icon: <FaBook /> },
        { path: '#', label: 'Messages', icon: <FaEnvelope /> },
        { path: '#', label: 'Reports', icon: <FaChartBar /> },
        { path: '#', label: 'Settings', icon: <FaCog /> },
    ];

    const handleSignOut = () => {
        localStorage.removeItem('userEmail');
        window.location.href = '/signin';
    };

    return (
        <nav className="modern-vertical-navbar">
            <div className="navbar-brand-container">
                {/* Replace with your actual logo or branding */}
                <span className="navbar-brand-text">L.E.A.R.N</span>
            </div>
            {/* User Info just below LEARN */}
            {userEmail && (
                <div className="navbar-user-info">
                    <FaUserCircle className="user-icon" />
                    <span className="user-email">{userEmail}</span>
                </div>
            )}
            <ul className="navbar-nav">
                {navItems.map((item, index) => (
                    <li key={index} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}>
                        <Link className="nav-link" to={item.path}>
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
            {/* Sign Out Button at the Bottom */}
            <div className="navbar-signout">
                <button onClick={handleSignOut}>
                    <FaSignOutAlt className="nav-icon" />
                    <span className="nav-label">Sign Out</span>
                </button>
            </div>
        </nav>
    );
};

export default VerticalNavbar;