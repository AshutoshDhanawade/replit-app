import React, { useState } from 'react';

const WardrobeItemCard = ({ item, onDelete, onEdit, onGetOutfits }) => {
  const [showActions, setShowActions] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this item from your wardrobe?')) {
      onDelete(item.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(item);
  };

  const handleGetOutfits = (e) => {
    e.stopPropagation();
    onGetOutfits(item.id);
  };

  return (
    <div 
      className="product-card wardrobe-item-card" 
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="product-image">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="image-placeholder" style={{ display: item.imageUrl ? 'none' : 'flex' }}>
          <i data-feather="image"></i>
        </div>
        
        {showActions && (
          <div className="product-overlay wardrobe-overlay">
            <button 
              className="quick-action-button"
              onClick={handleGetOutfits}
              title="Generate outfit"
            >
              <i data-feather="zap"></i>
            </button>
          </div>
        )}
      </div>

      <div className="product-info">
        <div className="product-header">
          <h3 className="product-name">{item.name}</h3>
        </div>

        <div className="product-details">
          {item.brand && (
            <span className="product-brand">{item.brand}</span>
          )}
          
          {item.color && (
            <div className="color-info">
              <span className="color-name">{item.color}</span>
              {item.colorHex && (
                <span 
                  className="color-swatch"
                  style={{ backgroundColor: item.colorHex }}
                  title={item.color}
                ></span>
              )}
            </div>
          )}
        </div>

        <div className="product-tags">
          <span className="tag category-tag">{item.category}</span>
          {item.size && <span className="tag size-tag">{item.size}</span>}
          {item.material && <span className="tag material-tag">{item.material}</span>}
        </div>

        <div className="product-actions wardrobe-actions">
          <button 
            className="btn-primary btn-small"
            onClick={handleGetOutfits}
          >
            <i data-feather="zap"></i>
            Create Outfit
          </button>
          
          <button className="btn-icon" onClick={handleEdit} title="Edit item">
            <i data-feather="edit-2"></i>
          </button>
          
          <button className="btn-icon btn-danger" onClick={handleDelete} title="Delete item">
            <i data-feather="trash-2"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WardrobeItemCard;
