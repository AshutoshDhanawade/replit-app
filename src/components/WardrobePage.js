import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WardrobeListItem from './WardrobeListItem';
import axios from 'axios';

const WardrobePage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'topwear',
    brand: '',
    color: '',
    colorHex: '#000000',
    size: '',
    material: '',
    tags: '',
    imageUrl: '',
    description: ''
  });

  const categories = ['topwear', 'bottomwear', 'footwear'];
  const userId = 'user1';

  useEffect(() => {
    loadWardrobeItems();
  }, [filterCategory]);

  const loadWardrobeItems = async () => {
    try {
      setLoading(true);
      const params = filterCategory ? `?category=${filterCategory}` : '';
      const response = await axios.get(`/api/users/${userId}/wardrobe${params}`);
      setItems(response.data.items);
    } catch (error) {
      console.error('Error loading wardrobe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/users/${userId}/wardrobe`, formData);
      setShowAddModal(false);
      resetForm();
      loadWardrobeItems();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item to wardrobe');
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/api/users/${userId}/wardrobe/${editingItem.id}`, formData);
      setEditingItem(null);
      resetForm();
      loadWardrobeItems();
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await axios.delete(`/api/users/${userId}/wardrobe/${itemId}`);
      loadWardrobeItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      brand: item.brand || '',
      color: item.color || '',
      colorHex: item.colorHex || '#000000',
      size: item.size || '',
      material: item.material || '',
      tags: item.tags || '',
      imageUrl: item.imageUrl || '',
      description: item.description || ''
    });
  };

  const handleGetOutfits = (itemId) => {
    navigate(`/wardrobe/recommendations/${itemId}`);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'topwear',
      brand: '',
      color: '',
      colorHex: '#000000',
      size: '',
      material: '',
      tags: '',
      imageUrl: '',
      description: ''
    });
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
    resetForm();
  };

  const filteredItems = items;

  return (
    <div className="wardrobe-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>My Wardrobe</h1>
            <p className="page-subtitle">Manage your personal clothing collection</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <i data-feather="plus"></i>
            Add Item
          </button>
        </div>

        <div className="wardrobe-filters">
          <div className="filter-group">
            <label>Category:</label>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="items-count">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading your wardrobe...</div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <i data-feather="shopping-bag"></i>
            <h3>Your wardrobe is empty</h3>
            <p>Start by adding your first clothing item</p>
            <button 
              className="btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              Add Your First Item
            </button>
          </div>
        ) : (
          <div className="wardrobe-list">
            {filteredItems.map(item => (
              <WardrobeListItem
                key={item.id}
                item={item}
                onDelete={handleDeleteItem}
                onEdit={handleEditItem}
                onGetOutfits={handleGetOutfits}
              />
            ))}
          </div>
        )}

        {(showAddModal || editingItem) && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                <button className="btn-icon" onClick={handleCloseModal}>
                  <i data-feather="x"></i>
                </button>
              </div>
              
              <form onSubmit={editingItem ? handleUpdateItem : handleAddItem}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Item Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      placeholder="e.g., Blue Denim Jacket"
                    />
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      placeholder="e.g., Levi's"
                    />
                  </div>

                  <div className="form-group">
                    <label>Color</label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      placeholder="e.g., Navy Blue"
                    />
                  </div>

                  <div className="form-group">
                    <label>Color Code</label>
                    <input
                      type="color"
                      value={formData.colorHex}
                      onChange={(e) => setFormData({...formData, colorHex: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Size</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({...formData, size: e.target.value})}
                      placeholder="e.g., M, L, XL"
                    />
                  </div>

                  <div className="form-group">
                    <label>Material</label>
                    <input
                      type="text"
                      value={formData.material}
                      onChange={(e) => setFormData({...formData, material: e.target.value})}
                      placeholder="e.g., Cotton, Denim"
                    />
                  </div>

                  <div className="form-group">
                    <label>Tags</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="e.g., casual, summer"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Image URL</label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Add any additional notes..."
                      rows="3"
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WardrobePage;
