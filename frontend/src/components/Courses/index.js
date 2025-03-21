import React from 'react';
import "./index.css";

const Courses = ({ each }) => {
  return (
    <div className="course-card shadow p-3 rounded" style={{ backgroundColor: each.color }}>
      <h5 className="text-white">{each.total}</h5>
      <p className="text-white">{each.text}</p>
    </div>
  );
};

export default Courses;