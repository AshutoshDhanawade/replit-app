import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BundleCard from './BundleCard';
import FilterPanel from './FilterPanel';
import axios from 'axios';

const RecommendationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    brand: '',
    occasion: ''
  });

  useEffect(() => {
    fetchRecommendations();
  }, [id]);

  useEffect(() => {
    applyFilters();
  }, [recommendations, filters]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch selected product and recommendations
      const [productResponse, recommendationsResponse] = await Promise.all([
        axios.get(`/api/products/${id}`),
        axios.get(`/api/recommendations/${id}`)
      ]);
      
      setSelectedProduct(productResponse.data);
      setRecommendations(recommendationsResponse.data.recommendations || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.response?.data?.message || 'Unable to load recommendations');
      setSelectedProduct(null);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...recommendations];

    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      filtered = filtered.filter(rec => rec.totalPrice >= minPrice);
    }

    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      filtered = filtered.filter(rec => rec.totalPrice <= maxPrice);
    }

    if (filters.brand) {
      filtered = filtered.filter(rec => 
        rec.items.some(item => 
          item.brand?.toLowerCase().includes(filters.brand.toLowerCase())
        )
      );
    }

    if (filters.occasion) {
      filtered = filtered.filter(rec => 
        rec.occasion?.toLowerCase().includes(filters.occasion.toLowerCase()) ||
        rec.items.some(item => 
          item.occasion?.toLowerCase().includes(filters.occasion.toLowerCase())
        )
      );
    }

    setFilteredRecommendations(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleShuffle = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/recommendations/${id}?shuffle=true`);
      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      console.error('Error shuffling recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToProduct = () => {
    navigate(`/product/${id}`);
  };

  if (loading && !selectedProduct) {
    return (
      <div className="recommendation-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading AI recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !selectedProduct) {
    return (
      <div className="recommendation-page">
        <div className="container">
          <div className="error-state">
            <i data-feather="alert-circle"></i>
            <h2>Unable to Load Recommendations</h2>
            <p>{error}</p>
            <button 
              className="btn-primary" 
              onClick={fetchRecommendations}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendation-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <button 
            className="breadcrumb-link"
            onClick={handleBackToProduct}
          >
            <i data-feather="arrow-left"></i>
            Back to Product
          </button>
        </nav>

        {/* Selected Product Section */}
        {selectedProduct && (
          <section className="selected-product-section">
            <div className="selected-product">
              <div className="product-image">
                {selectedProduct.imageUrl ? (
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="image-placeholder" style={{ display: selectedProduct.imageUrl ? 'none' : 'flex' }}>
                  <i data-feather="image"></i>
                </div>
              </div>
              <div className="product-info">
                <h2 className="product-name">{selectedProduct.name}</h2>
                <p className="product-details">
                  {selectedProduct.brand} • {selectedProduct.color} • ${selectedProduct.price}
                </p>
              </div>
            </div>
            
            <div className="recommendations-header">
              <h1 className="page-title">AI Outfit Recommendations</h1>
              <p className="page-subtitle">
                Complete outfit combinations that perfectly complement your selected item
              </p>
            </div>
          </section>
        )}

        <div className="recommendations-content">
          {/* Filter Sidebar */}
          <aside className="filters-sidebar">
            <div className="filters-header">
              <h3>Filter Recommendations</h3>
              <button 
                className="btn-secondary btn-small"
                onClick={handleShuffle}
                disabled={loading}
              >
                <i data-feather="shuffle"></i>
                {loading ? 'Shuffling...' : 'Shuffle'}
              </button>
            </div>
            
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              showOccasionFilter={true}
              showPriceFilter={true}
              showBrandFilter={true}
            />
          </aside>

          {/* Recommendations Section */}
          <section className="recommendations-section">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Generating new recommendations...</p>
              </div>
            ) : error && recommendations.length === 0 ? (
              <div className="error-state">
                <i data-feather="alert-circle"></i>
                <h3>No Recommendations Available</h3>
                <p>{error}</p>
                <button 
                  className="btn-primary" 
                  onClick={fetchRecommendations}
                >
                  Try Again
                </button>
              </div>
            ) : filteredRecommendations.length === 0 ? (
              <div className="empty-state">
                <i data-feather="filter"></i>
                <h3>No Matching Recommendations</h3>
                <p>
                  {recommendations.length === 0 ? 
                    'No recommendations available for this item' :
                    'Try adjusting your filters to see more recommendations'
                  }
                </p>
                {recommendations.length > 0 && (
                  <button 
                    className="btn-secondary"
                    onClick={() => setFilters({ minPrice: '', maxPrice: '', brand: '', occasion: '' })}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="recommendations-header-inline">
                  <h3>
                    {filteredRecommendations.length} Recommendation{filteredRecommendations.length !== 1 ? 's' : ''}
                  </h3>
                </div>
                
                <div className="recommendations-grid">
                  {filteredRecommendations.map(recommendation => (
                    <BundleCard
                      key={recommendation.id}
                      bundle={recommendation}
                      showSaveButton={true}
                      showShareButton={true}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default RecommendationPage;
