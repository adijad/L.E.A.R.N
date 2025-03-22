import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

const VerticalNavbar = () => {
  return (
      <nav className="navbar navbar-expand-lg navbar-light fixed-navbar">
        <ul className="navbar-nav d-flex flex-column">
          <li className="nav-item">
            <Link className="nav-link" to="/home">Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/home/topic-search">Topic Search</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="#">My Courses</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="#">Messages</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="#">Reports</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="#">Settings</Link>
          </li>
        </ul>
      </nav>
  );
};

export default VerticalNavbar;
