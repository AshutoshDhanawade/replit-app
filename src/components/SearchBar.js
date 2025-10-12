import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const SearchBar = ({ onSearch, initialValue = '', placeholder = 'Search...' }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [quickFilters, setQuickFilters] = useState({
    color: '',
    brand: '',
    occasion: ''
  });
  const suggestionsRef = useRef(null);
  const searchBarRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchSuggestions = async (query) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setIsLoadingSuggestions(true);
      const response = await axios.get(
        `/api/search/suggestions?q=${encodeURIComponent(query)}`,
        { signal: abortController.signal }
      );
      
      if (!abortController.signal.aborted) {
        setSuggestions(response.data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoadingSuggestions(false);
      }
    }
  };

  const handleSearchTermChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSuggestionClick = (productId) => {
    setShowSuggestions(false);
    window.location.href = `/products/${productId}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
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
      <form className="search-bar" onSubmit={handleSubmit} ref={searchBarRef}>
        <div className="search-input-wrapper">
          <i data-feather="search" className="search-icon"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchTermChange}
            placeholder={placeholder}
            className="search-input"
            autoComplete="off"
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

      {/* Search Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions" ref={suggestionsRef}>
          {suggestions.map((product) => (
            <div
              key={product.id}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(product.id)}
            >
              <div className="suggestion-image">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} />
                ) : (
                  <div className="suggestion-image-placeholder">
                    <i data-feather="image"></i>
                  </div>
                )}
              </div>
              <div className="suggestion-details">
                <div className="suggestion-name">{product.name}</div>
                <div className="suggestion-meta">
                  <span className="suggestion-brand">{product.brand}</span>
                  {product.price && (
                    <>
                      <span className="suggestion-separator">•</span>
                      <span className="suggestion-price">${product.price.toFixed(2)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="suggestion-category">{product.category}</div>
            </div>
          ))}
        </div>
      )}

      {isLoadingSuggestions && (
        <div className="search-suggestions" ref={suggestionsRef}>
          <div className="suggestions-loading">Loading...</div>
        </div>
      )}

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
