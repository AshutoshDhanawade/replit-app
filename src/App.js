import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import SearchPage from './components/SearchPage';
import ProductDetailPage from './components/ProductDetailPage';
import RecommendationPage from './components/RecommendationPage';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="container">
            <h1 className="logo">
              <a href="/">Drip Check</a>
            </h1>
          </div>
        </header>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/recommendations/:id" element={<RecommendationPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
