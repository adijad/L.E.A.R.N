import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode } from '@fortawesome/free-solid-svg-icons';
import "./index.css";

const TestScheduleComponent = () => {
  const testItems = [
    {
      title: 'React Test',
      description: 'Jan 2nd 2023, 2pm to 4pm',
    },
    {
      title: 'Web Design Test',
      description: '5th Jan 2023, 10am to 12pm',
    },
    {
      title: 'CSS Test',
      description: '8th Jan 2023, 2pm to 4pm',
    },
    {
      title: 'MongoDB',
      description: '12th Jan 2023, 10am to 12pm',
    },
  ];

  return (
    <div className='shadow bg-light p-3 h-100'>
      <h5 className='fw-bold'>Test Schedule</h5>
      {testItems.map((item, index) => (
        <div 
          key={index}
          className="test-div row d-flex align-items-center"
        >
          <div className="col-md-4">
            <FontAwesomeIcon icon={faCode} />
          </div>
          <div className="col-md-8">
            <p>{item.title}</p>
            <p className="test_details">{item.description}</p>
          </div>
        </div>
      ))}
      <hr />
      <div className="text-center">
        <button className="btn btn-primary">See All</button>
      </div>
    </div>
  );
};

export default TestScheduleComponent;