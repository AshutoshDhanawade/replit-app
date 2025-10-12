import React, { useState } from 'react';

const FilterPanel = ({ 
  filters = {}, 
  onFilterChange,
  showPriceFilter = true,
  showBrandFilter = true,
  showOccasionFilter = true,
  showColorFilter = true,
  showCategoryFilter = false
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isCollapsed, setIsCollapsed] = useState(false);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...localFilters, [filterKey]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = Object.keys(localFilters).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {});
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(filter => filter);
  const hasUnappliedChanges = JSON.stringify(localFilters) !== JSON.stringify(filters);

  const colorOptions = [
    { value: 'black', label: 'Black', hex: '#000000' },
    { value: 'white', label: 'White', hex: '#FFFFFF' },
    { value: 'gray', label: 'Gray', hex: '#808080' },
    { value: 'blue', label: 'Blue', hex: '#0066CC' },
    { value: 'red', label: 'Red', hex: '#CC0000' },
    { value: 'green', label: 'Green', hex: '#00CC00' },
    { value: 'yellow', label: 'Yellow', hex: '#FFCC00' },
    { value: 'brown', label: 'Brown', hex: '#8B4513' },
    { value: 'pink', label: 'Pink', hex: '#FF69B4' },
    { value: 'purple', label: 'Purple', hex: '#800080' },
    { value: 'orange', label: 'Orange', hex: '#FF8800' },
    { value: 'navy', label: 'Navy', hex: '#000080' }
  ];

  const occasionOptions = [
    'casual', 'formal', 'business', 'party', 'date', 'workout', 
    'travel', 'beach', 'wedding', 'interview', 'brunch', 'night-out'
  ];

  const categoryOptions = [
    'topwear', 'bottomwear', 'footwear', 'accessories'
  ];

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        <div className="filter-header-actions">
          {hasActiveFilters && (
            <button 
              className="clear-all"
              onClick={clearAllFilters}
              title="Clear all filters"
            >
              Clear All
            </button>
          )}
          <button 
            className="collapse-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand filters' : 'Collapse filters'}
          >
            <i data-feather={isCollapsed ? 'chevron-down' : 'chevron-up'}></i>
          </button>
        </div>
      </div>

      <div className={`filter-content ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Price Range Filter */}
        {showPriceFilter && (
          <div className="filter-group">
            <label className="filter-label">Price Range</label>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="price-input"
                min="0"
                step="0.01"
              />
              <span className="price-separator">to</span>
              <input
                type="number"
                placeholder="Max"
                value={localFilters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="price-input"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        )}

        {/* Brand Filter */}
        {showBrandFilter && (
          <div className="filter-group">
            <label className="filter-label">Brand</label>
            <input
              type="text"
              placeholder="Enter brand name"
              value={localFilters.brand || ''}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="filter-input"
            />
          </div>
        )}

        {/* Color Filter */}
        {showColorFilter && (
          <div className="filter-group">
            <label className="filter-label">Color</label>
            <div className="color-grid">
              {colorOptions.map(color => (
                <label key={color.value} className="color-option">
                  <input
                    type="radio"
                    name="color"
                    value={color.value}
                    checked={localFilters.color === color.value}
                    onChange={(e) => handleFilterChange('color', e.target.value)}
                  />
                  <div className="color-swatch" style={{ backgroundColor: color.hex }}>
                    {localFilters.color === color.value && (
                      <i data-feather="check" className="color-check"></i>
                    )}
                  </div>
                  <span className="color-label">{color.label}</span>
                </label>
              ))}
              <label className="color-option">
                <input
                  type="radio"
                  name="color"
                  value=""
                  checked={!localFilters.color}
                  onChange={(e) => handleFilterChange('color', '')}
                />
                <div className="color-swatch any-color">
                  <span>Any</span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Occasion Filter */}
        {showOccasionFilter && (
          <div className="filter-group">
            <label className="filter-label">Occasion</label>
            <select
              value={localFilters.occasion || ''}
              onChange={(e) => handleFilterChange('occasion', e.target.value)}
              className="filter-select"
            >
              <option value="">Any Occasion</option>
              {occasionOptions.map(occasion => (
                <option key={occasion} value={occasion}>
                  {occasion.charAt(0).toUpperCase() + occasion.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Category Filter */}
        {showCategoryFilter && (
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              value={localFilters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="active-filters">
            <h4>Active Filters:</h4>
            <div className="filter-tags">
              {Object.entries(localFilters).map(([key, value]) => {
                if (!value) return null;
                
                let displayValue = value;
                if (key === 'minPrice' || key === 'maxPrice') {
                  displayValue = `$${value}`;
                }
                
                return (
                  <span key={key} className="filter-tag">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}: {displayValue}
                    <button
                      onClick={() => handleFilterChange(key, '')}
                      className="remove-filter"
                      title="Remove filter"
                    >
                      <i data-feather="x"></i>
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Apply Filters Button */}
        {hasUnappliedChanges && (
          <button 
            className="apply-filters-button"
            onClick={applyFilters}
          >
            <i data-feather="check-circle"></i>
            Apply Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;
