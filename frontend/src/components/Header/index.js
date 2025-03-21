import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircleUser } from '@fortawesome/free-solid-svg-icons';
import "./index.css";

const Header = () => {
  return (
    <header className="d-flex justify-content-between align-items-center p-3 bg-light shadow">
      <input type="text" className="form-control w-50" placeholder="Search..." />
      <div className="d-flex align-items-center">
        <FontAwesomeIcon icon={faBell} className="bell-icon me-3" />
        <FontAwesomeIcon icon={faCircleUser} className="profile-icon me-3" />
      </div>
    </header>
  );
};

export default Header;
