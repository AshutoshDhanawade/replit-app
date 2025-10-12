import React, { useState } from 'react';
import axios from 'axios';

const ProductCard = ({ product, onClick }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const userId = 'user1';

  const handleClick = () => {
    if (onClick) {
      onClick(product.id);
    }
  };

  const handleGetRecommendations = (e) => {
    e.stopPropagation();
    window.location.href = `/recommendations/${product.id}`;
  };

  const handleAddToWardrobe = async (e) => {
    e.stopPropagation();
    if (isAdding || added) return;

    try {
      setIsAdding(true);
      await axios.post(`/api/users/${userId}/wardrobe/from-product/${product.id}`);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error('Error adding to wardrobe:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to add item to wardrobe');
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="product-card" onClick={handleClick}>
      {/* Product Image */}
      <div className="product-image">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="image-placeholder" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
          <i data-feather="image"></i>
        </div>
        
        {/* Quick Action Overlay */}
        <div className="product-overlay">
          <button 
            className="quick-action-button"
            onClick={handleGetRecommendations}
            title="Get AI recommendations"
          >
            <i data-feather="zap"></i>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="product-info">
        <div className="product-header">
          <h3 className="product-name">{product.name}</h3>
          {product.price && (
            <span className="product-price">${product.price}</span>
          )}
        </div>

        <div className="product-details">
          {product.brand && (
            <span className="product-brand">{product.brand}</span>
          )}
          
          {product.color && (
            <div className="color-info">
              <span className="color-name">{product.color}</span>
              {product.colorHex && (
                <span 
                  className="color-swatch"
                  style={{ backgroundColor: product.colorHex }}
                  title={product.color}
                ></span>
              )}
            </div>
          )}
        </div>

        {/* Product Tags */}
        <div className="product-tags">
          <span className="tag category-tag">{product.category}</span>
          
          {product.occasion && (
            <span className="tag occasion-tag">{product.occasion}</span>
          )}
          
          {product.patternType && (
            <span className="tag pattern-tag">{product.patternType}</span>
          )}
        </div>

        {/* Product Actions */}
        <div className="product-actions">
          <button 
            className="btn-primary btn-small"
            onClick={handleGetRecommendations}
          >
            <i data-feather="zap"></i>
            Get Outfits
          </button>
          
          <button 
            className={`btn-icon ${added ? 'active' : ''}`}
            onClick={handleAddToWardrobe}
            disabled={isAdding}
            title={added ? 'Added to wardrobe!' : 'Add to wardrobe'}
          >
            <i data-feather={added ? 'check' : 'plus'}></i>
          </button>
        </div>
      </div>

      {/* Hover Effect Indicator */}
      <div className="card-hover-indicator">
        <i data-feather="arrow-right"></i>
      </div>
    </div>
  );
};

export default ProductCard;
