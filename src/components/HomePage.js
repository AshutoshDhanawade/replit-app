import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import CategoryCard from './CategoryCard';
import BundleCard from './BundleCard';
import axios from 'axios';

const HomePage = () => {
  const [personalizedBundles, setPersonalizedBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const categories = [
    { 
      id: 'topwear', 
      name: 'Topwear', 
      description: 'Shirts, T-shirts, Jackets',
      icon: 'package'
    },
    { 
      id: 'bottomwear', 
      name: 'Bottomwear', 
      description: 'Pants, Jeans, Shorts',
      icon: 'layers'
    },
    { 
      id: 'footwear', 
      name: 'Footwear', 
      description: 'Sneakers, Boots, Sandals',
      icon: 'compass'
    }
  ];

  useEffect(() => {
    fetchPersonalizedBundles();
  }, []);

  const fetchPersonalizedBundles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/bundles/personalized');
      setPersonalizedBundles(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching personalized bundles:', err);
      setError('Unable to load personalized recommendations at this time.');
      setPersonalizedBundles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm, filters) => {
    const params = new URLSearchParams({
      q: searchTerm,
      ...filters
    });
    navigate(`/search?${params.toString()}`);
  };

  const handleCategorySelect = (categoryId) => {
    navigate(`/search?category=${categoryId}`);
  };

  return (
    <div className="home-page">
      <div className="container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Discover Your Perfect
              <span className="accent-text"> Drip</span>
            </h1>
            <p className="hero-subtitle">
              AI-powered outfit recommendations tailored to your style, occasion, and preferences
            </p>
          </div>
          
          <div className="search-section">
            <SearchBar onSearch={handleSearch} placeholder="Search by item, color, brand, or occasion..." />
          </div>
        </section>

        {/* Categories Section */}
        <section className="categories-section">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories-grid">
            {categories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() => handleCategorySelect(category.id)}
              />
            ))}
          </div>
        </section>

        {/* Personalized Bundles Section */}
        <section className="bundles-section">
          <div className="section-header">
            <h2 className="section-title">Personalized for You</h2>
            <p className="section-subtitle">
              Curated outfit bundles based on trending styles and seasonal preferences
            </p>
          </div>
          
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading personalized recommendations...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <i data-feather="alert-circle"></i>
              <h3>Unable to Load Recommendations</h3>
              <p>{error}</p>
              <button 
                className="btn-primary" 
                onClick={fetchPersonalizedBundles}
              >
                Try Again
              </button>
            </div>
          ) : personalizedBundles.length === 0 ? (
            <div className="empty-state">
              <i data-feather="package"></i>
              <h3>No Personalized Bundles Available</h3>
              <p>Check back later for curated outfit recommendations</p>
            </div>
          ) : (
            <div className="bundles-grid">
              {personalizedBundles.map(bundle => (
                <BundleCard
                  key={bundle.id}
                  bundle={bundle}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
