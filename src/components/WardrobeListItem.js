import React from 'react';

const WardrobeListItem = ({ item, onDelete, onEdit, onGetOutfits }) => {
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
    <div className="wardrobe-list-item">
      <div className="item-thumbnail">
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
        <div className="thumbnail-placeholder" style={{ display: item.imageUrl ? 'none' : 'flex' }}>
          <i data-feather="image"></i>
        </div>
      </div>

      <div className="item-details">
        <h3 className="item-name">{item.name}</h3>
        <div className="item-meta">
          {item.brand && <span className="item-brand">{item.brand}</span>}
          {item.brand && item.color && <span className="meta-separator">•</span>}
          {item.color && (
            <div className="item-color">
              <span>{item.color}</span>
              {item.colorHex && (
                <span 
                  className="color-dot"
                  style={{ backgroundColor: item.colorHex }}
                  title={item.color}
                ></span>
              )}
            </div>
          )}
        </div>
        <div className="item-tags">
          <span className="tag">{item.category}</span>
          {item.size && <span className="tag">{item.size}</span>}
          {item.material && <span className="tag">{item.material}</span>}
        </div>
      </div>

      <div className="item-actions">
        <button 
          className="btn-primary btn-small"
          onClick={handleGetOutfits}
          title="Create outfit from this item"
        >
          <i data-feather="zap"></i>
          Create Outfit
        </button>
        
        <button 
          className="btn-icon" 
          onClick={handleEdit} 
          title="Edit item"
        >
          <i data-feather="edit-2"></i>
        </button>
        
        <button 
          className="btn-icon btn-danger" 
          onClick={handleDelete} 
          title="Delete item"
        >
          <i data-feather="trash-2"></i>
        </button>
      </div>
    </div>
  );
};

export default WardrobeListItem;
