// components/Dropdown.js
import React, { useState } from 'react';
import '../styles/Dropdown.css';

const Dropdown = ({ options }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleChange = (e) => {
    const selectedIndex = e.target.value;
    setSelectedOption(options[selectedIndex]);
  };

  return (
    <div className="dropdown-container">
      <select className="dropdown-select" onChange={handleChange}>
        <option value="" disabled selected>Select an option</option>
        {options.map((option, index) => (
          <option key={index} value={index}>
            {option.label}
          </option>
        ))}
      </select>
      {selectedOption && (
        <div className="description-container">
          <p dangerouslySetInnerHTML={{ __html: selectedOption.description }} />
        </div>
      )}
    </div>
  );
};

export default Dropdown;
