const express = require('express');
const router = express.Router();
const storage = require('../data/storage');

// Get personalized bundles for homepage
router.get('/bundles/personalized', async (req, res) => {
  try {
    const bundles = await storage.getPersonalizedBundles();
    res.json(bundles);
  } catch (error) {
    console.error('Error fetching personalized bundles:', error);
    res.status(500).json({ 
      error: 'Failed to fetch personalized bundles',
      message: 'Unable to load recommendations at this time'
    });
  }
});

// Search products with filters
router.get('/search', async (req, res) => {
  try {
    const { q, category, color, brand, occasion, minPrice, maxPrice } = req.query;
    
    const filters = {
      searchTerm: q,
      category,
      color,
      brand,
      occasion,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
    };

    const results = await storage.searchProducts(filters);
    
    res.json({
      products: results,
      total: results.length,
      filters: filters
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      message: 'Unable to perform search at this time'
    });
  }
});

// Get product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await storage.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found',
        message: 'The requested product could not be found'
      });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product',
      message: 'Unable to load product details'
    });
  }
});

// Get AI recommendations for a product
router.get('/recommendations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { shuffle } = req.query;
    
    const product = await storage.getProductById(id);
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found',
        message: 'Cannot generate recommendations for unknown product'
      });
    }

    const recommendations = await storage.getRecommendations(id, shuffle === 'true');
    
    res.json({
      product,
      recommendations,
      total: recommendations.length
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to generate recommendations',
      message: 'Unable to load outfit recommendations at this time'
    });
  }
});

// Save outfit to user's profile
router.post('/saved-outfits', async (req, res) => {
  try {
    const { outfitId } = req.body;
    
    if (!outfitId) {
      return res.status(400).json({ 
        error: 'Missing outfit ID',
        message: 'Outfit ID is required to save'
      });
    }

    const savedOutfit = await storage.saveOutfit(outfitId);
    
    res.json({
      message: 'Outfit saved successfully',
      savedOutfit
    });
  } catch (error) {
    console.error('Error saving outfit:', error);
    res.status(500).json({ 
      error: 'Failed to save outfit',
      message: 'Unable to save outfit at this time'
    });
  }
});

// Remove saved outfit
router.delete('/saved-outfits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await storage.removeSavedOutfit(id);
    
    if (!success) {
      return res.status(404).json({ 
        error: 'Saved outfit not found',
        message: 'The outfit was not found in your saved items'
      });
    }
    
    res.json({
      message: 'Outfit removed successfully'
    });
  } catch (error) {
    console.error('Error removing saved outfit:', error);
    res.status(500).json({ 
      error: 'Failed to remove outfit',
      message: 'Unable to remove outfit at this time'
    });
  }
});

// Rate outfit combination
router.post('/rate-combination', async (req, res) => {
  try {
    const { outfitId, rating } = req.body;
    
    if (!outfitId || rating === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Outfit ID and rating are required'
      });
    }

    const ratedOutfit = await storage.rateOutfit(outfitId, rating);
    
    res.json({
      message: 'Rating saved successfully',
      outfit: ratedOutfit
    });
  } catch (error) {
    console.error('Error rating outfit:', error);
    res.status(500).json({ 
      error: 'Failed to save rating',
      message: 'Unable to save your rating at this time'
    });
  }
});

// Update user profile
router.post('/user-profile', async (req, res) => {
  try {
    const { physique, skinTone, styleVibe, occasion } = req.body;
    
    const profile = await storage.updateUserProfile({
      physique,
      skinTone,
      styleVibe,
      occasion
    });
    
    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      message: 'Unable to save profile changes at this time'
    });
  }
});

// Get categories
router.get('/categories', (req, res) => {
  try {
    const categories = storage.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      message: 'Unable to load categories at this time'
    });
  }
});

// Get items by category
router.get('/items/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const items = await storage.getItemsByCategory(category);
    
    res.json({
      category,
      items,
      total: items.length
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ 
      error: 'Failed to fetch items',
      message: 'Unable to load items for this category'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Drip Check API is running'
  });
});

router.post('/users/:userId/wardrobe', async (req, res) => {
  try {
    const { userId } = req.params;
    const itemData = req.body;
    
    if (!itemData.name || !itemData.category) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Item name and category are required'
      });
    }

    const item = await storage.addWardrobeItem(userId, itemData);
    
    res.status(201).json({
      message: 'Item added to wardrobe successfully',
      item
    });
  } catch (error) {
    console.error('Error adding wardrobe item:', error);
    res.status(500).json({ 
      error: 'Failed to add item',
      message: 'Unable to add item to wardrobe at this time'
    });
  }
});

router.get('/users/:userId/wardrobe', async (req, res) => {
  try {
    const { userId } = req.params;
    const { category, color } = req.query;
    
    const filters = { category, color };
    const items = await storage.getWardrobeItems(userId, filters);
    
    res.json({
      items,
      total: items.length
    });
  } catch (error) {
    console.error('Error fetching wardrobe items:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wardrobe items',
      message: 'Unable to load wardrobe at this time'
    });
  }
});

router.patch('/users/:userId/wardrobe/:itemId', async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const itemData = req.body;
    
    const updatedItem = await storage.updateWardrobeItem(itemId, userId, itemData);
    
    if (!updatedItem) {
      return res.status(404).json({ 
        error: 'Item not found',
        message: 'The wardrobe item could not be found'
      });
    }
    
    res.json({
      message: 'Item updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('Error updating wardrobe item:', error);
    res.status(500).json({ 
      error: 'Failed to update item',
      message: 'Unable to update wardrobe item at this time'
    });
  }
});

router.delete('/users/:userId/wardrobe/:itemId', async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    
    const success = await storage.deleteWardrobeItem(itemId, userId);
    
    if (!success) {
      return res.status(404).json({ 
        error: 'Item not found',
        message: 'The wardrobe item could not be found'
      });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting wardrobe item:', error);
    res.status(500).json({ 
      error: 'Failed to delete item',
      message: 'Unable to delete wardrobe item at this time'
    });
  }
});

router.get('/users/:userId/wardrobe/:itemId/recommendations', async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    
    const result = await storage.getWardrobeRecommendations(itemId, userId);
    
    if (!result.item) {
      return res.status(404).json({ 
        error: 'Item not found',
        message: 'Cannot generate recommendations for unknown item'
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching wardrobe recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to generate recommendations',
      message: 'Unable to load outfit recommendations at this time'
    });
  }
});

module.exports = router;
