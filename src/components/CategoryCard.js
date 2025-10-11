import React from 'react';

const CategoryCard = ({ category, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(category.id);
    }
  };

  return (
    <div className="category-card" onClick={handleClick}>
      <div className="category-icon">
        <i data-feather={category.icon || 'package'}></i>
      </div>
      
      <div className="category-content">
        <h3 className="category-name">{category.name}</h3>
        {category.description && (
          <p className="category-description">{category.description}</p>
        )}
      </div>
      
      <div className="category-arrow">
        <i data-feather="arrow-right"></i>
      </div>
    </div>
  );
};

export default CategoryCard;
