import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from React Router
import 'bootstrap/dist/css/bootstrap.min.css';
import "./index.css";

const VerticalNavbar = () => {
  return (
      <nav className="navbar navbar-expand-lg navbar-light">
        <ul className="navbar-nav d-flex flex-column">
          <li className="nav-item">
            <Link className="nav-link" to="/home">Dashboard</Link> {/* Correct path for Dashboard */}
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/home/topic-search">Topic Search</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="#">My Courses</Link> {/* Replace with actual path if needed */}
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="#">Messages</Link> {/* Replace with actual path if needed */}
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="#">Reports</Link> {/* Replace with actual path if needed */}
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="#">Settings</Link> {/* Replace with actual path if needed */}
          </li>
        </ul>
      </nav>
  );
};

export default VerticalNavbar;
