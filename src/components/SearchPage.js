import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import ProductCard from './ProductCard';
import FilterPanel from './FilterPanel';
import axios from 'axios';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const navigate = useNavigate();

  const searchTerm = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const filters = {
    color: searchParams.get('color') || '',
    brand: searchParams.get('brand') || '',
    occasion: searchParams.get('occasion') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || ''
  };

  useEffect(() => {
    if (searchTerm || category || Object.values(filters).some(f => f)) {
      performSearch();
    }
  }, [searchParams]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        q: searchTerm,
        category,
        ...filters
      };

      // Remove empty parameters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await axios.get('/api/search', { params });
      setProducts(response.data.products || []);
      setTotalResults(response.data.total || 0);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 'Search failed. Please try again.');
      setProducts([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newSearchTerm, newFilters) => {
    const params = new URLSearchParams({
      q: newSearchTerm,
      ...newFilters
    });
    
    // Remove empty parameters
    for (let [key, value] of params.entries()) {
      if (!value) params.delete(key);
    }
    
    setSearchParams(params);
  };

  const handleFilterChange = (newFilters) => {
    const params = new URLSearchParams({
      q: searchTerm,
      category,
      ...newFilters
    });
    
    // Remove empty parameters
    for (let [key, value] of params.entries()) {
      if (!value) params.delete(key);
    }
    
    setSearchParams(params);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="search-page">
      <div className="container">
        {/* Search Header */}
        <div className="search-header">
          <SearchBar 
            onSearch={handleSearch}
            initialValue={searchTerm}
            placeholder="Search by item, color, brand, or occasion..."
          />
        </div>

        {/* Results Header */}
        {(searchTerm || category) && (
          <div className="results-header">
            <h2 className="results-title">
              {loading ? 'Searching...' : 
               error ? 'Search Error' :
               totalResults === 0 ? 'No Results Found' :
               `${totalResults} Result${totalResults !== 1 ? 's' : ''} Found`}
            </h2>
            
            {searchTerm && (
              <p className="search-query">
                Search results for: <span className="accent-text">"{searchTerm}"</span>
              </p>
            )}
            
            {category && (
              <p className="category-filter">
                Category: <span className="accent-text">{category}</span>
              </p>
            )}
          </div>
        )}

        <div className="search-content">
          {/* Filter Sidebar */}
          <aside className="filters-sidebar">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </aside>

          {/* Results Section */}
          <section className="results-section">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Searching for products...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <i data-feather="alert-circle"></i>
                <h3>Search Error</h3>
                <p>{error}</p>
                <button 
                  className="btn-primary" 
                  onClick={performSearch}
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <i data-feather="search"></i>
                <h3>No Products Found</h3>
                <p>
                  {searchTerm || Object.values(filters).some(f => f) ? 
                    'Try adjusting your search terms or filters' :
                    'Use the search bar above to find products'
                  }
                </p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => handleProductClick(product.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
