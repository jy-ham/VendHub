import React from 'react';
import axios from 'axios';

const Add: React.FC = () => {
  const handleClick = async () => {
    try {
      await axios.post('http://localhost:3001/api/vending-machine', {
        lat: '49.2485',
        lon: '-123.0117',
        location: 'SW9',
        desc: 'Vending Machine Test B',
        available: true,
        items: JSON.stringify(['Snickers', 'Mars Bars', 'Coffee'])
      });
      console.log('POST successful');
    } catch (error) {
      console.error('Error during POST:', error);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        fontSize: '24px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      +
    </button>
  );
};

export default Add;