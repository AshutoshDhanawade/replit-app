import React, { useState } from 'react';

const SearchBar = ({ onSearch, initialValue = '', placeholder = 'Search...' }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isExpanded, setIsExpanded] = useState(false);
  const [quickFilters, setQuickFilters] = useState({
    color: '',
    brand: '',
    occasion: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm, quickFilters);
  };

  const handleQuickFilterChange = (filterType, value) => {
    const newFilters = { ...quickFilters, [filterType]: value };
    setQuickFilters(newFilters);
    onSearch(searchTerm, newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { color: '', brand: '', occasion: '' };
    setQuickFilters(clearedFilters);
    onSearch(searchTerm, clearedFilters);
  };

  const hasActiveFilters = Object.values(quickFilters).some(filter => filter);

  return (
    <div className="search-bar-container">
      <form className="search-bar" onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <i data-feather="search" className="search-icon"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="search-input"
          />
          <button 
            type="button"
            className="filter-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label="Toggle filters"
          >
            <i data-feather="sliders"></i>
          </button>
        </div>
        
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {/* Quick Filters */}
      {isExpanded && (
        <div className="quick-filters">
          <div className="quick-filters-header">
            <span>Quick Filters</span>
            {hasActiveFilters && (
              <button 
                type="button"
                className="clear-filters"
                onClick={clearFilters}
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="quick-filters-grid">
            <div className="filter-group">
              <label>Color</label>
              <select
                value={quickFilters.color}
                onChange={(e) => handleQuickFilterChange('color', e.target.value)}
              >
                <option value="">Any Color</option>
                <option value="black">Black</option>
                <option value="white">White</option>
                <option value="blue">Blue</option>
                <option value="red">Red</option>
                <option value="green">Green</option>
                <option value="yellow">Yellow</option>
                <option value="brown">Brown</option>
                <option value="gray">Gray</option>
                <option value="pink">Pink</option>
                <option value="purple">Purple</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Brand</label>
              <input
                type="text"
                value={quickFilters.brand}
                onChange={(e) => handleQuickFilterChange('brand', e.target.value)}
                placeholder="Enter brand name"
              />
            </div>

            <div className="filter-group">
              <label>Occasion</label>
              <select
                value={quickFilters.occasion}
                onChange={(e) => handleQuickFilterChange('occasion', e.target.value)}
              >
                <option value="">Any Occasion</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="business">Business</option>
                <option value="party">Party</option>
                <option value="date">Date</option>
                <option value="workout">Workout</option>
                <option value="travel">Travel</option>
                <option value="beach">Beach</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
