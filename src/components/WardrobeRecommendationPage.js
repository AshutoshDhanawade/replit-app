import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import WardrobeItemCard from './WardrobeItemCard';

const WardrobeRecommendationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [baseItem, setBaseItem] = useState(null);
  const [recommendations, setRecommendations] = useState({});
  const [selectedItems, setSelectedItems] = useState({});
  const userId = 'user1';

  useEffect(() => {
    loadRecommendations();
  }, [id]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/${userId}/wardrobe/${id}/recommendations`);
      setBaseItem(response.data.item);
      setRecommendations(response.data.recommendations);
      
      const initial = {};
      Object.keys(response.data.recommendations).forEach(category => {
        if (response.data.recommendations[category].length > 0) {
          initial[category] = response.data.recommendations[category][0];
        }
      });
      setSelectedItems(initial);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (category, item) => {
    setSelectedItems(prev => ({
      ...prev,
      [category]: item
    }));
  };

  const handleShuffle = () => {
    const shuffled = {};
    Object.keys(recommendations).forEach(category => {
      const items = recommendations[category];
      if (items.length > 0) {
        const randomIndex = Math.floor(Math.random() * items.length);
        shuffled[category] = items[randomIndex];
      }
    });
    setSelectedItems(shuffled);
  };

  const getCompleteOutfit = () => {
    const outfit = [];
    if (baseItem) outfit.push(baseItem);
    Object.values(selectedItems).forEach(item => {
      if (item) outfit.push(item);
    });
    return outfit;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-state">Generating outfit from your wardrobe...</div>
      </div>
    );
  }

  if (!baseItem) {
    return (
      <div className="container">
        <div className="error-state">
          <h2>Item not found</h2>
          <p>The wardrobe item you're looking for doesn't exist.</p>
          <button className="btn-primary" onClick={() => navigate('/wardrobe')}>
            Back to Wardrobe
          </button>
        </div>
      </div>
    );
  }

  const completeOutfit = getCompleteOutfit();
  const hasRecommendations = Object.keys(recommendations).some(cat => recommendations[cat].length > 0);

  return (
    <div className="recommendation-page">
      <div className="container">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate('/wardrobe')}>
            <i data-feather="arrow-left"></i>
            Back to Wardrobe
          </button>
          <div>
            <h1>Outfit from Your Wardrobe</h1>
            <p className="page-subtitle">Complete outfit based on your {baseItem.name}</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={handleShuffle}>
              <i data-feather="refresh-cw"></i>
              Shuffle
            </button>
          </div>
        </div>

        {!hasRecommendations ? (
          <div className="empty-recommendations">
            <i data-feather="inbox"></i>
            <h3>Not enough items in your wardrobe</h3>
            <p>Add more items to your wardrobe to generate complete outfits</p>
            <button className="btn-primary" onClick={() => navigate('/wardrobe')}>
              Add Items to Wardrobe
            </button>
          </div>
        ) : (
          <>
            <div className="outfit-preview">
              <h2>Complete Outfit</h2>
              <div className="outfit-items">
                {completeOutfit.map((item, index) => (
                  <div key={index} className="outfit-item">
                    <div className="outfit-item-image">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} />
                      ) : (
                        <div className="image-placeholder">
                          <i data-feather="image"></i>
                        </div>
                      )}
                    </div>
                    <div className="outfit-item-info">
                      <h4>{item.name}</h4>
                      <span className="category-badge">{item.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="recommendations-section">
              <h2>Alternative Items</h2>
              {Object.keys(recommendations).map(category => {
                if (recommendations[category].length === 0) return null;
                
                return (
                  <div key={category} className="category-recommendations">
                    <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                    <div className="products-grid">
                      {recommendations[category].map(item => (
                        <div 
                          key={item.id}
                          className={`recommendation-item ${selectedItems[category]?.id === item.id ? 'selected' : ''}`}
                          onClick={() => handleItemSelect(category, item)}
                        >
                          <WardrobeItemCard
                            item={item}
                            onDelete={() => {}}
                            onEdit={() => {}}
                            onGetOutfits={() => {}}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WardrobeRecommendationPage;
