import React, { useState } from 'react';
import axios from 'axios';

const BundleCard = ({ bundle, showSaveButton = true, showShareButton = true }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [saved, setSaved] = useState(bundle.isSaved || false);

  const handleSave = async (e) => {
    e.stopPropagation();
    if (isSaving) return;

    try {
      setIsSaving(true);
      
      if (saved) {
        await axios.delete(`/api/saved-outfits/${bundle.id}`);
        setSaved(false);
      } else {
        await axios.post('/api/saved-outfits', { outfitId: bundle.id });
        setSaved(true);
      }
    } catch (error) {
      console.error('Error saving/unsaving outfit:', error);
      // You might want to show a toast notification here
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    if (isSharing) return;

    try {
      setIsSharing(true);
      
      if (navigator.share) {
        await navigator.share({
          title: `Check out this outfit: ${bundle.title}`,
          text: bundle.description,
          url: window.location.href
        });
      } else {
        // Fallback: Copy to clipboard
        const shareText = `Check out this outfit: ${bundle.title}\n${bundle.description}\n${window.location.href}`;
        await navigator.clipboard.writeText(shareText);
        // You might want to show a "Copied to clipboard" notification here
      }
    } catch (error) {
      console.error('Error sharing outfit:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const calculateTotalPrice = () => {
    if (bundle.totalPrice) return bundle.totalPrice;
    if (bundle.items && bundle.items.length > 0) {
      return bundle.items.reduce((total, item) => total + (item.price || 0), 0);
    }
    return 0;
  };

  const totalPrice = calculateTotalPrice();

  return (
    <div className="bundle-card">
      {/* Bundle Products Grid */}
      <div className="bundle-products-grid">
        {bundle.items && bundle.items.length > 0 ? (
          bundle.items.slice(0, 3).map((item, index) => (
            <div key={index} className="bundle-product-item">
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
              <div className="product-placeholder" style={{ display: item.imageUrl ? 'none' : 'flex' }}>
                <i data-feather={
                  item.category === 'topwear' ? 'user' : 
                  item.category === 'bottomwear' ? 'grid' : 
                  'package'
                }></i>
              </div>
              <div className="product-label">{item.category}</div>
            </div>
          ))
        ) : (
          <div className="bundle-image">
            {bundle.imageUrl ? (
              <img 
                src={bundle.imageUrl} 
                alt={bundle.title || 'Outfit bundle'}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="image-placeholder" style={{ display: bundle.imageUrl ? 'none' : 'flex' }}>
              <i data-feather="package"></i>
              <span>Outfit Bundle</span>
            </div>
          </div>
        )}
        
        {/* Quick Actions Overlay */}
        <div className="bundle-overlay">
          {showSaveButton && (
            <button
              className={`action-button ${saved ? 'saved' : ''}`}
              onClick={handleSave}
              disabled={isSaving}
              title={saved ? 'Unsave outfit' : 'Save outfit'}
            >
              <i data-feather={saved ? 'heart' : 'heart'} 
                 className={saved ? 'filled' : ''}></i>
            </button>
          )}
          
          {showShareButton && (
            <button
              className="action-button"
              onClick={handleShare}
              disabled={isSharing}
              title="Share outfit"
            >
              <i data-feather="share-2"></i>
            </button>
          )}
        </div>
      </div>

      {/* Bundle Info */}
      <div className="bundle-info">
        <div className="bundle-header">
          <h3 className="bundle-title">
            {bundle.title || bundle.name || 'Complete Outfit'}
          </h3>
          {totalPrice > 0 && (
            <span className="bundle-price">${totalPrice.toFixed(2)}</span>
          )}
        </div>

        {bundle.description && (
          <p className="bundle-description">{bundle.description}</p>
        )}

        {/* Bundle Items Preview */}
        {bundle.items && bundle.items.length > 0 && (
          <div className="bundle-items">
            <div className="items-preview">
              {bundle.items.slice(0, 3).map((item, index) => (
                <div key={index} className="item-preview">
                  <span className="item-name">{item.name}</span>
                  {item.price && (
                    <span className="item-price">${item.price}</span>
                  )}
                </div>
              ))}
              {bundle.items.length > 3 && (
                <span className="more-items">+{bundle.items.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Bundle Tags */}
        <div className="bundle-tags">
          {bundle.occasion && (
            <span className="tag occasion-tag">{bundle.occasion}</span>
          )}
          {bundle.style && (
            <span className="tag style-tag">{bundle.style}</span>
          )}
          {bundle.season && (
            <span className="tag season-tag">{bundle.season}</span>
          )}
        </div>

        {/* Bundle Score/Rating */}
        {bundle.score && (
          <div className="bundle-score">
            <div className="score-bar">
              <div 
                className="score-fill" 
                style={{ width: `${bundle.score}%` }}
              ></div>
            </div>
            <span className="score-text">
              {bundle.score}% Match
            </span>
          </div>
        )}
      </div>

      {/* Bundle Actions */}
      <div className="bundle-actions">
        <button className="btn-primary btn-small">
          View Details
        </button>
        
        <div className="action-group">
          {showSaveButton && (
            <button
              className={`btn-icon ${saved ? 'active' : ''}`}
              onClick={handleSave}
              disabled={isSaving}
              title={saved ? 'Unsave' : 'Save'}
            >
              <i data-feather="heart"></i>
            </button>
          )}
          
          <button className="btn-icon" title="Shuffle similar">
            <i data-feather="shuffle"></i>
          </button>
          
          {showShareButton && (
            <button
              className="btn-icon"
              onClick={handleShare}
              disabled={isSharing}
              title="Share"
            >
              <i data-feather="share-2"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BundleCard;
