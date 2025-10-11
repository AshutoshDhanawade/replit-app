import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AppModeProvider, useAppMode } from './context/AppModeContext';
import HomePage from './components/HomePage';
import SearchPage from './components/SearchPage';
import ProductDetailPage from './components/ProductDetailPage';
import RecommendationPage from './components/RecommendationPage';
import WardrobePage from './components/WardrobePage';
import WardrobeRecommendationPage from './components/WardrobeRecommendationPage';

function AppHeader() {
  const { mode, toggleMode, isWardrobeMode } = useAppMode();
  const navigate = useNavigate();

  const handleModeToggle = () => {
    toggleMode();
    if (isWardrobeMode) {
      navigate('/');
    } else {
      navigate('/wardrobe');
    }
  };

  return (
    <header className="app-header">
      <div className="container header-container">
        <h1 className="logo">
          <Link to="/">Drip Check</Link>
        </h1>
        
        <nav className="main-nav">
          <Link to="/" className={!isWardrobeMode ? 'active' : ''}>
            Marketplace
          </Link>
          <Link to="/wardrobe" className={isWardrobeMode ? 'active' : ''}>
            My Wardrobe
          </Link>
        </nav>

        <div className="mode-toggle">
          <button 
            className={`toggle-btn ${isWardrobeMode ? 'wardrobe-mode' : 'marketplace-mode'}`}
            onClick={handleModeToggle}
            title={`Switch to ${isWardrobeMode ? 'Marketplace' : 'Wardrobe'} Mode`}
          >
            <i data-feather={isWardrobeMode ? 'shopping-bag' : 'home'}></i>
            <span>{isWardrobeMode ? 'Wardrobe Mode' : 'Marketplace Mode'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function AppContent() {
  return (
    <>
      <AppHeader />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/recommendations/:id" element={<RecommendationPage />} />
          <Route path="/wardrobe" element={<WardrobePage />} />
          <Route path="/wardrobe/recommendations/:id" element={<WardrobeRecommendationPage />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppModeProvider>
        <div className="App">
          <AppContent />
        </div>
      </AppModeProvider>
    </Router>
  );
}

export default App;
