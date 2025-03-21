import React from 'react';
import Header from '../Header';
import Courses from '../Courses';
import CourseList from '../Courselist';
import "./index.css";
import TestSchedule from '../TestSchedule';

const courseDetails = [
  {
    id: 1,
    total: 2,
    text: 'Current Courses',
    color: 'orange'
  },
  {
    id: 2,
    total: 5,
    text: 'Completed Courses',
    color: 'green'
  },
  {
    id: 3,
    total: 10,
    text: "Interested Courses",
    color: 'blue'
  }
];

const Body = () => {
  return (
    <div className='w-100 course-wrapper'>
      <Header />
      <h4 className='mx-3 d-block'>Welcome Back, Harsha</h4>
      <div className='d-flex justify-content-around'>
        <div>
          <div className='d-flex gap-5 mt-4'>
            {courseDetails.map(each => (
              <Courses 
                key={each.id}
                each={each}
              />
            ))}
          </div>
          <div>
            <CourseList />
          </div>
        </div>
        <TestSchedule />
      </div>
    </div>
  );
};

export default Body;