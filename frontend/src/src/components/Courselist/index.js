import React from 'react';
import "./index.css";

const courseData = [
  {
    title: 'Web Design',
    level: 'Advance',
    date: '2nd Jan 2023',
    status: 'Completed'
  },
  {
    title: 'React',
    level: 'Advance',
    date: '9th April 2023',
    status: 'On Going'
  },
  {
    title: 'MongoDB',
    level: 'Advance',
    date: '5th June 2023',
    status: 'Interested'
  },
  {
    title: 'Angular',
    level: 'Beginner',
    date: '7th July 2023',
    status: 'Interested'
  },
  {
    title: 'CSS',
    level: 'Intermediate',
    date: '2nd Feb 2023',
    status: 'Completed'
  }
];

const CourseList = () => {
  const textColor = courseData.map(each => {
    if (each.status === "Completed") {
      return 'green';
    } else if (each.status === 'On Going') {
      return 'orange';
    } else {
      return 'blue';
    }
  });

  return (
    <div className="shadow mx-1 px-3 bg-light rounded-3">
      <div className="d-flex align-items-center justify-content-between p-3 mt-3">
        <h4 className="mb-0">My Courses</h4>
        <button className="btn">See All</button>
      </div>
      <div>
        <table className="table">
          <thead>
            <tr>
              <th>Course Name</th>
              <th>Level</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {courseData.map((course, index) => (
              <tr key={index}>
                <td>{course.title}</td>
                <td>{course.level}</td>
                <td>{course.date}</td>
                <td style={{ color: textColor[index] }}>{course.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseList;
