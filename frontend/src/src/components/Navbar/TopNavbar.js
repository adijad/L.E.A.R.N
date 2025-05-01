// TopNavbar.js
import React, {useState} from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './TopNavbar.css';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const navFeatures = {
    Home: 'Home',
    'Topic Search': 'Topic Search',
};

const TopNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        window.location.href = '/signin';
    };

    const getLink = (label) => {
        switch (label) {
            case 'Home':
                return '/home';
            case 'Topic Search':
                return '/home/topic-search';
            default:
                return '#';
        }
    };

    return (
        <nav className="top-navbar">
            <div className="navbar-left">
                <img src="/logo.png" alt="Logo" className="logo" />
                <span className="brand-text">L.E.A.R.N</span>
            </div>

            <div className="navbar-center">
                {Object.entries(navFeatures).map(([key, label]) => (
                    <Link
                        key={key}
                        to={getLink(key)}
                        className={`nav-link ${location.pathname === getLink(key) ? 'active' : ''}`}
                    >
                        <span>{label}</span>
                    </Link>
                ))}
            </div>

            <div className="navbar-right">
                <div className="signout-container">
                    <button onClick={handleLogout} className="signout-button">
                        <FaSignOutAlt className="signout-icon" />
                        <span className="signout-label">Sign Out</span>
                    </button>
                </div>
                <FaUserCircle
                    className="profile-icon"
                    onClick={() => setProfileOpen(!profileOpen)}
                    size={28}
                />
            </div>
        </nav>
    );
};

export default TopNavbar;