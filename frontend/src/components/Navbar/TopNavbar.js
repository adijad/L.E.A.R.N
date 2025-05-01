import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './TopNavbar.css';
import { FaUserCircle } from 'react-icons/fa';

const navFeatures = {
  Home: ['Dashboard', 'Progress Overview', 'Quick Start'],
  Features: ['TTS (Text-to-Speech)', 'Chatbot Assistant', 'AI-Powered Lessons', 'Multilingual Support'],
  Service: ['Topic Search', 'Lesson Generation', 'Adaptive Quiz'],
  'About Us': ['Our Vision', 'Team', 'How It Works'],
  Contact: ['Help Center', 'Report Issue', 'Feedback'],
};

const TopNavbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const navRef = useRef();

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const toggleDropdown = (label) => {
    setOpenDropdown(prev => (prev === label ? null : label));
  };

  const handleDropdownClick = (label, item) => {
    if (label === 'Home' && item === 'Dashboard') {
      navigate('/home');
    }
    else if(label === 'Service' && item === 'Topic Search') {
      navigate('/home/topic-search');

    }
    // Add additional navigation logic if needed
  };

  const handleClickOutside = (event) => {
    if (navRef.current && !navRef.current.contains(event.target)) {
      setOpenDropdown(null);
      setProfileOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="top-navbar" ref={navRef}>
      <div className="navbar-left">
        <img src="/logo.png" alt="Logo" className="logo" />
        <span className="brand-text">L.E.A.R.N</span>
      </div>

      <div className="navbar-center">
        {Object.keys(navFeatures).map((label) => (
          <div
            key={label}
            className={`nav-item-with-dropdown ${openDropdown === label ? 'active' : ''}`}
            onClick={() => toggleDropdown(label)}
          >
            <span>{label}</span>
            {openDropdown === label && (
              <div className="nav-dropdown">
                {navFeatures[label].map((item, idx) => (
                  <span
                    key={idx}
                    className="dropdown-link"
                    onClick={() => handleDropdownClick(label, item)}
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="navbar-right">
        <FaUserCircle
          className="profile-icon"
          onClick={() => setProfileOpen(!profileOpen)}
          size={28}
        />
        {profileOpen && (
          <div className="dropdown-menu">
            <Link to="#">Profile</Link>
            <Link to="#">My Courses</Link>
            <Link to="#">Settings</Link>
            <button onClick={handleLogout}>Sign Out</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default TopNavbar;
