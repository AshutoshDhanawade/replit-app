const { Client } = require('pg');

class DataStorage {
  constructor() {
    this.categories = [
      { id: 'topwear', name: 'Topwear' },
      { id: 'bottomwear', name: 'Bottomwear' },
      { id: 'footwear', name: 'Footwear' }
    ];
  }

  async getClient() {
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    });
    await client.connect();
    return client;
  }

  async getPersonalizedBundles() {
    const client = await this.getClient();
    try {
      const result = await client.query(`
        SELECT b.*, 
          json_agg(json_build_object(
            'id', p.id,
            'name', p.name,
            'brand', p.brand,
            'price', p.price,
            'color', p.color,
            'occasion', p.occasion
          )) as items
        FROM bundles b
        LEFT JOIN bundle_items bi ON b.id = bi.bundle_id
        LEFT JOIN products p ON bi.product_id = p.id
        GROUP BY b.id
        ORDER BY b.score DESC
        LIMIT 6
      `);
      
      return result.rows.map(bundle => ({
        id: bundle.id,
        title: bundle.title,
        description: bundle.description,
        occasion: bundle.occasion,
        style: bundle.style,
        season: bundle.season,
        score: bundle.score,
        totalPrice: parseFloat(bundle.total_price),
        items: bundle.items.filter(item => item.id !== null)
      }));
    } finally {
      await client.end();
    }
  }

  async searchProducts(filters) {
    const { searchTerm, category, color, brand, occasion, minPrice, maxPrice } = filters;
    const client = await this.getClient();
    
    try {
      let query = 'SELECT * FROM products WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (searchTerm) {
        query += ` AND (name ILIKE $${paramIndex} OR brand ILIKE $${paramIndex} OR color ILIKE $${paramIndex} OR occasion ILIKE $${paramIndex})`;
        params.push(`%${searchTerm}%`);
        paramIndex++;
      }

      if (category) {
        query += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      if (color) {
        query += ` AND color ILIKE $${paramIndex}`;
        params.push(`%${color}%`);
        paramIndex++;
      }

      if (brand) {
        query += ` AND brand ILIKE $${paramIndex}`;
        params.push(`%${brand}%`);
        paramIndex++;
      }

      if (occasion) {
        query += ` AND occasion ILIKE $${paramIndex}`;
        params.push(`%${occasion}%`);
        paramIndex++;
      }

      if (minPrice !== undefined) {
        query += ` AND price >= $${paramIndex}`;
        params.push(minPrice);
        paramIndex++;
      }

      if (maxPrice !== undefined) {
        query += ` AND price <= $${paramIndex}`;
        params.push(maxPrice);
        paramIndex++;
      }

      query += ' ORDER BY name';

      const result = await client.query(query, params);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        brand: row.brand,
        color: row.color,
        colorHex: row.color_hex,
        price: parseFloat(row.price),
        occasion: row.occasion,
        patternType: row.pattern_type,
        imageUrl: row.image_url,
        description: row.description
      }));
    } finally {
      await client.end();
    }
  }

  async getProductById(id) {
    const client = await this.getClient();
    try {
      const result = await client.query('SELECT * FROM products WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        category: row.category,
        brand: row.brand,
        color: row.color,
        colorHex: row.color_hex,
        price: parseFloat(row.price),
        occasion: row.occasion,
        patternType: row.pattern_type,
        imageUrl: row.image_url,
        description: row.description
      };
    } finally {
      await client.end();
    }
  }

  async getRecommendations(productId, shuffle = false) {
    const client = await this.getClient();
    try {
      const productResult = await client.query('SELECT * FROM products WHERE id = $1', [productId]);
      
      if (productResult.rows.length === 0) {
        return [];
      }

      const selectedProduct = productResult.rows[0];
      const recommendations = [];

      const complementaryItems = await this.findComplementaryItems(client, selectedProduct);

      for (let i = 0; i < Math.min(5, complementaryItems.length); i++) {
        const bundle = {
          id: `rec_${productId}_${i}`,
          title: `${selectedProduct.occasion || 'Stylish'} Outfit ${i + 1}`,
          description: this.generateOutfitDescription(selectedProduct, complementaryItems[i]),
          occasion: selectedProduct.occasion,
          items: [selectedProduct, ...complementaryItems[i]].map(item => ({
            id: item.id,
            name: item.name,
            brand: item.brand,
            price: parseFloat(item.price),
            color: item.color,
            occasion: item.occasion
          })),
          totalPrice: parseFloat(selectedProduct.price) + complementaryItems[i].reduce((sum, item) => sum + parseFloat(item.price), 0),
          score: 85 + Math.floor(Math.random() * 15)
        };
        recommendations.push(bundle);
      }

      if (shuffle) {
        return this.shuffleArray(recommendations);
      }

      return recommendations;
    } finally {
      await client.end();
    }
  }

  async findComplementaryItems(client, product) {
    const complementaryCategories = {
      'topwear': ['bottomwear', 'footwear'],
      'bottomwear': ['topwear', 'footwear'],
      'footwear': ['topwear', 'bottomwear']
    };

    const categories = complementaryCategories[product.category] || [];
    const combinations = [];

    for (let i = 0; i < 5; i++) {
      const items = [];
      
      for (const cat of categories) {
        const result = await client.query(
          `SELECT * FROM products 
           WHERE category = $1 
           AND (occasion = $2 OR occasion = 'casual')
           ORDER BY RANDOM()
           LIMIT 1`,
          [cat, product.occasion || 'casual']
        );
        
        if (result.rows.length > 0) {
          items.push(result.rows[0]);
        }
      }
      
      if (items.length === categories.length) {
        combinations.push(items);
      }
    }

    return combinations;
  }

  generateOutfitDescription(baseProduct, complementaryItems) {
    const descriptions = [
      `${baseProduct.color} ${baseProduct.category} paired with complementary pieces for a cohesive look`,
      `Complete outfit featuring ${baseProduct.brand} ${baseProduct.category} with matching accessories`,
      `Stylish combination perfect for ${baseProduct.occasion} occasions`,
      `Curated ensemble with ${baseProduct.color} as the anchor color`,
      `Well-balanced outfit for modern ${baseProduct.occasion} wear`
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async saveOutfit(outfitId) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        `INSERT INTO saved_outfits (bundle_id, user_id) 
         VALUES ($1, $2) 
         RETURNING *`,
        [outfitId, 'user1']
      );
      
      return {
        id: result.rows[0].id,
        outfitId: result.rows[0].bundle_id,
        savedAt: result.rows[0].saved_at,
        userId: result.rows[0].user_id
      };
    } finally {
      await client.end();
    }
  }

  async removeSavedOutfit(outfitId) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        'DELETE FROM saved_outfits WHERE bundle_id = $1 AND user_id = $2 RETURNING *',
        [outfitId, 'user1']
      );
      
      return result.rows.length > 0;
    } finally {
      await client.end();
    }
  }

  async rateOutfit(outfitId, rating) {
    return {
      id: outfitId,
      rating,
      ratedAt: new Date().toISOString()
    };
  }

  async updateUserProfile(profileData) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        `INSERT INTO user_profiles (user_id, physique, skin_tone, style_vibe, occasion_preference)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           physique = EXCLUDED.physique,
           skin_tone = EXCLUDED.skin_tone,
           style_vibe = EXCLUDED.style_vibe,
           occasion_preference = EXCLUDED.occasion_preference,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        ['user1', profileData.physique, profileData.skinTone, profileData.styleVibe, profileData.occasion]
      );
      
      return {
        physique: result.rows[0].physique,
        skinTone: result.rows[0].skin_tone,
        styleVibe: result.rows[0].style_vibe,
        occasion: result.rows[0].occasion_preference,
        updatedAt: result.rows[0].updated_at
      };
    } finally {
      await client.end();
    }
  }

  getCategories() {
    return this.categories;
  }

  async getItemsByCategory(category) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        'SELECT * FROM products WHERE category = $1 ORDER BY name',
        [category]
      );
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        brand: row.brand,
        color: row.color,
        colorHex: row.color_hex,
        price: parseFloat(row.price),
        occasion: row.occasion,
        patternType: row.pattern_type,
        imageUrl: row.image_url,
        description: row.description
      }));
    } finally {
      await client.end();
    }
  }

  async getSavedOutfits(userId = 'user1') {
    const client = await this.getClient();
    try {
      const result = await client.query(
        `SELECT so.*, b.*
         FROM saved_outfits so
         JOIN bundles b ON so.bundle_id = b.id
         WHERE so.user_id = $1
         ORDER BY so.saved_at DESC`,
        [userId]
      );
      
      return result.rows;
    } finally {
      await client.end();
    }
  }

  async addWardrobeItem(userId, itemData) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        `INSERT INTO wardrobe_items 
         (user_id, name, category, brand, color, color_hex, size, material, tags, image_url, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          userId, 
          itemData.name, 
          itemData.category, 
          itemData.brand, 
          itemData.color, 
          itemData.colorHex,
          itemData.size, 
          itemData.material, 
          itemData.tags, 
          itemData.imageUrl, 
          itemData.description
        ]
      );
      
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        category: row.category,
        brand: row.brand,
        color: row.color,
        colorHex: row.color_hex,
        size: row.size,
        material: row.material,
        tags: row.tags,
        imageUrl: row.image_url,
        description: row.description,
        createdAt: row.created_at
      };
    } finally {
      await client.end();
    }
  }

  async getWardrobeItems(userId, filters = {}) {
    const client = await this.getClient();
    try {
      let query = 'SELECT * FROM wardrobe_items WHERE user_id = $1';
      const params = [userId];
      let paramIndex = 2;

      if (filters.category) {
        query += ` AND category = $${paramIndex}`;
        params.push(filters.category);
        paramIndex++;
      }

      if (filters.color) {
        query += ` AND color ILIKE $${paramIndex}`;
        params.push(`%${filters.color}%`);
        paramIndex++;
      }

      query += ' ORDER BY created_at DESC';

      const result = await client.query(query, params);
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        category: row.category,
        brand: row.brand,
        color: row.color,
        colorHex: row.color_hex,
        size: row.size,
        material: row.material,
        tags: row.tags,
        imageUrl: row.image_url,
        description: row.description,
        createdAt: row.created_at
      }));
    } finally {
      await client.end();
    }
  }

  async updateWardrobeItem(itemId, userId, itemData) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        `UPDATE wardrobe_items 
         SET name = $1, category = $2, brand = $3, color = $4, color_hex = $5,
             size = $6, material = $7, tags = $8, image_url = $9, description = $10
         WHERE id = $11 AND user_id = $12
         RETURNING *`,
        [
          itemData.name,
          itemData.category,
          itemData.brand,
          itemData.color,
          itemData.colorHex,
          itemData.size,
          itemData.material,
          itemData.tags,
          itemData.imageUrl,
          itemData.description,
          itemId,
          userId
        ]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        category: row.category,
        brand: row.brand,
        color: row.color,
        colorHex: row.color_hex,
        size: row.size,
        material: row.material,
        tags: row.tags,
        imageUrl: row.image_url,
        description: row.description,
        createdAt: row.created_at
      };
    } finally {
      await client.end();
    }
  }

  async deleteWardrobeItem(itemId, userId) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        'DELETE FROM wardrobe_items WHERE id = $1 AND user_id = $2 RETURNING id',
        [itemId, userId]
      );
      
      return result.rows.length > 0;
    } finally {
      await client.end();
    }
  }

  async getWardrobeRecommendations(itemId, userId) {
    const client = await this.getClient();
    try {
      const itemResult = await client.query(
        'SELECT * FROM wardrobe_items WHERE id = $1 AND user_id = $2',
        [itemId, userId]
      );

      if (itemResult.rows.length === 0) {
        return { item: null, recommendations: [] };
      }

      const baseItem = itemResult.rows[0];
      const recommendations = {};

      if (baseItem.category === 'topwear') {
        const bottomwear = await client.query(
          'SELECT * FROM wardrobe_items WHERE user_id = $1 AND category = $2 ORDER BY RANDOM() LIMIT 3',
          [userId, 'bottomwear']
        );
        const footwear = await client.query(
          'SELECT * FROM wardrobe_items WHERE user_id = $1 AND category = $2 ORDER BY RANDOM() LIMIT 3',
          [userId, 'footwear']
        );
        recommendations.bottomwear = bottomwear.rows;
        recommendations.footwear = footwear.rows;
      } else if (baseItem.category === 'bottomwear') {
        const topwear = await client.query(
          'SELECT * FROM wardrobe_items WHERE user_id = $1 AND category = $2 ORDER BY RANDOM() LIMIT 3',
          [userId, 'topwear']
        );
        const footwear = await client.query(
          'SELECT * FROM wardrobe_items WHERE user_id = $1 AND category = $2 ORDER BY RANDOM() LIMIT 3',
          [userId, 'footwear']
        );
        recommendations.topwear = topwear.rows;
        recommendations.footwear = footwear.rows;
      } else if (baseItem.category === 'footwear') {
        const topwear = await client.query(
          'SELECT * FROM wardrobe_items WHERE user_id = $1 AND category = $2 ORDER BY RANDOM() LIMIT 3',
          [userId, 'topwear']
        );
        const bottomwear = await client.query(
          'SELECT * FROM wardrobe_items WHERE user_id = $1 AND category = $2 ORDER BY RANDOM() LIMIT 3',
          [userId, 'bottomwear']
        );
        recommendations.topwear = topwear.rows;
        recommendations.bottomwear = bottomwear.rows;
      }

      return {
        item: baseItem,
        recommendations
      };
    } finally {
      await client.end();
    }
  }
}

const storage = new DataStorage();
module.exports = storage;
