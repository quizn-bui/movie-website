"use client";

import { useState } from 'react';
import '../styles/FilterSelect.css';

interface DropdownOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  label: string;
  options: DropdownOption[];
  onSelect: (values: string[]) => void;
  selectedValues: string[];
}

const FilterSelect = ({ label, options, onSelect, selectedValues }: FilterSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (value: string) => {
    if (value === '') {
      onSelect(['']);
    } else {
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter(val => val !== value)
        : [...selectedValues.filter(v => v !== ''), value]; 
      onSelect(newValues.length === 0 ? [''] : newValues);
    }
  };

  const getLabelText = () => {
    if (selectedValues.length === 1 && selectedValues[0] === '') {
      return label;
    }
    const selectedLabels = options
      .filter(opt => selectedValues.includes(opt.value))
      .map(opt => opt.label);
    
    return selectedLabels.join(', ') || label;
  };

  return (
    <div className="filters-container__filter">
      <div 
        className={`filters-container__filter-header ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="filters-container__filter-label">
          {getLabelText()}
        </span>
        <span className="filters-container__filter-arrow">▼</span>
      </div>
      {isOpen && (
        <div className="filters-container__filter-menu">
          {options.map(option => (
            <div
              key={option.value}
              className={`filters-container__filter-item ${selectedValues.includes(option.value) ? 'selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleToggle(option.value);
              }}
            >
              <span className="filter-item-label">{option.label}</span>
              {selectedValues.includes(option.value) && (
                <span className="selected-icon">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterSelect;