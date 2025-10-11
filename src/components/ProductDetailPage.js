import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.response?.data?.message || 'Product not found');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = () => {
    navigate(`/recommendations/${id}`);
  };

  const handleBackToSearch = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="error-state">
            <i data-feather="alert-circle"></i>
            <h2>Product Not Found</h2>
            <p>{error || 'The requested product could not be found.'}</p>
            <button 
              className="btn-primary" 
              onClick={handleBackToSearch}
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <button 
            className="breadcrumb-link"
            onClick={handleBackToSearch}
          >
            <i data-feather="arrow-left"></i>
            Back to Search
          </button>
        </nav>

        <div className="product-detail">
          {/* Product Image */}
          <div className="product-image-section">
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
                <span>No Image Available</span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              <div className="product-category">
                <span className="category-badge">{product.category}</span>
              </div>
            </div>

            <div className="product-details">
              <div className="detail-group">
                <h3>Product Information</h3>
                <div className="detail-grid">
                  {product.brand && (
                    <div className="detail-item">
                      <span className="detail-label">Brand:</span>
                      <span className="detail-value">{product.brand}</span>
                    </div>
                  )}
                  
                  {product.color && (
                    <div className="detail-item">
                      <span className="detail-label">Color:</span>
                      <span className="detail-value">
                        {product.color}
                        {product.colorHex && (
                          <span 
                            className="color-swatch"
                            style={{ backgroundColor: product.colorHex }}
                          ></span>
                        )}
                      </span>
                    </div>
                  )}

                  {product.price && (
                    <div className="detail-item">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value price">${product.price}</span>
                    </div>
                  )}

                  {product.occasion && (
                    <div className="detail-item">
                      <span className="detail-label">Occasion:</span>
                      <span className="detail-value">{product.occasion}</span>
                    </div>
                  )}

                  {product.patternType && (
                    <div className="detail-item">
                      <span className="detail-label">Pattern:</span>
                      <span className="detail-value">{product.patternType}</span>
                    </div>
                  )}
                </div>
              </div>

              {product.description && (
                <div className="detail-group">
                  <h3>Description</h3>
                  <p className="product-description">{product.description}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="product-actions">
              <button 
                className="btn-primary btn-large"
                onClick={handleGetRecommendations}
              >
                <i data-feather="zap"></i>
                Get AI Outfit Recommendations
              </button>
              
              <button className="btn-secondary">
                <i data-feather="heart"></i>
                Save to Favorites
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
