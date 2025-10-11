const { Client } = require('pg');

async function initializeDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        brand VARCHAR(100),
        color VARCHAR(50),
        color_hex VARCHAR(7),
        price DECIMAL(10,2),
        occasion VARCHAR(100),
        pattern_type VARCHAR(50),
        image_url TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bundles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        occasion VARCHAR(100),
        style VARCHAR(100),
        season VARCHAR(50),
        score INTEGER,
        total_price DECIMAL(10,2),
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bundle_items (
        id SERIAL PRIMARY KEY,
        bundle_id INTEGER REFERENCES bundles(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_outfits (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) DEFAULT 'user1',
        bundle_id INTEGER REFERENCES bundles(id) ON DELETE CASCADE,
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) UNIQUE DEFAULT 'user1',
        physique VARCHAR(50),
        skin_tone VARCHAR(50),
        style_vibe VARCHAR(100),
        occasion_preference VARCHAR(100),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database tables created successfully');

    const { rows } = await client.query('SELECT COUNT(*) FROM products');
    const productCount = parseInt(rows[0].count);

    if (productCount === 0) {
      console.log('Seeding database with sample products...');
      await seedProducts(client);
      await seedBundles(client);
      console.log('Database seeded successfully');
    } else {
      console.log(`Database already contains ${productCount} products`);
    }

  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function seedProducts(client) {
  const products = [
    { name: 'Classic White T-Shirt', category: 'topwear', brand: 'BasicWear', color: 'White', color_hex: '#FFFFFF', price: 25.00, occasion: 'casual', pattern_type: 'solid', description: 'Essential white cotton t-shirt for everyday wear' },
    { name: 'Black Denim Jacket', category: 'topwear', brand: 'UrbanEdge', color: 'Black', color_hex: '#000000', price: 89.99, occasion: 'casual', pattern_type: 'solid', description: 'Classic black denim jacket with vintage wash' },
    { name: 'Navy Blue Blazer', category: 'topwear', brand: 'FormalFit', color: 'Navy', color_hex: '#000080', price: 149.99, occasion: 'formal', pattern_type: 'solid', description: 'Professional navy blazer for business occasions' },
    { name: 'Striped Oxford Shirt', category: 'topwear', brand: 'ClassicStyle', color: 'Blue', color_hex: '#0066CC', price: 55.00, occasion: 'business', pattern_type: 'striped', description: 'Blue and white striped oxford shirt' },
    { name: 'Gray Hoodie', category: 'topwear', brand: 'ComfortZone', color: 'Gray', color_hex: '#808080', price: 45.00, occasion: 'casual', pattern_type: 'solid', description: 'Cozy gray cotton hoodie' },
    
    { name: 'Blue Slim Jeans', category: 'bottomwear', brand: 'DenimCo', color: 'Blue', color_hex: '#0066CC', price: 69.99, occasion: 'casual', pattern_type: 'solid', description: 'Comfortable slim-fit blue jeans' },
    { name: 'Black Chinos', category: 'bottomwear', brand: 'UrbanEdge', color: 'Black', color_hex: '#000000', price: 59.99, occasion: 'business', pattern_type: 'solid', description: 'Versatile black chino pants' },
    { name: 'Khaki Cargo Pants', category: 'bottomwear', brand: 'OutdoorGear', color: 'Brown', color_hex: '#8B4513', price: 65.00, occasion: 'casual', pattern_type: 'solid', description: 'Practical khaki cargo pants with multiple pockets' },
    { name: 'Gray Dress Pants', category: 'bottomwear', brand: 'FormalFit', color: 'Gray', color_hex: '#808080', price: 79.99, occasion: 'formal', pattern_type: 'solid', description: 'Professional gray dress pants' },
    { name: 'Light Blue Shorts', category: 'bottomwear', brand: 'SummerStyle', color: 'Blue', color_hex: '#87CEEB', price: 39.99, occasion: 'beach', pattern_type: 'solid', description: 'Casual light blue summer shorts' },
    
    { name: 'White Sneakers', category: 'footwear', brand: 'SportMax', color: 'White', color_hex: '#FFFFFF', price: 85.00, occasion: 'casual', pattern_type: 'solid', description: 'Classic white leather sneakers' },
    { name: 'Black Oxford Shoes', category: 'footwear', brand: 'FormalFit', color: 'Black', color_hex: '#000000', price: 129.99, occasion: 'formal', pattern_type: 'solid', description: 'Elegant black oxford dress shoes' },
    { name: 'Brown Leather Boots', category: 'footwear', brand: 'BootCraft', color: 'Brown', color_hex: '#8B4513', price: 159.99, occasion: 'casual', pattern_type: 'solid', description: 'Durable brown leather boots' },
    { name: 'Navy Loafers', category: 'footwear', brand: 'ClassicStyle', color: 'Navy', color_hex: '#000080', price: 95.00, occasion: 'business', pattern_type: 'solid', description: 'Comfortable navy blue loafers' },
    { name: 'Gray Running Shoes', category: 'footwear', brand: 'SportMax', color: 'Gray', color_hex: '#808080', price: 110.00, occasion: 'workout', pattern_type: 'solid', description: 'Lightweight gray running shoes' }
  ];

  for (const product of products) {
    await client.query(
      `INSERT INTO products (name, category, brand, color, color_hex, price, occasion, pattern_type, description) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [product.name, product.category, product.brand, product.color, product.color_hex, product.price, product.occasion, product.pattern_type, product.description]
    );
  }
}

async function seedBundles(client) {
  const bundles = [
    { title: 'Casual Weekend Look', description: 'Perfect for relaxed weekend outings', occasion: 'casual', style: 'relaxed', season: 'all', score: 92, items: [1, 6, 11] },
    { title: 'Business Professional', description: 'Sharp and professional for office meetings', occasion: 'business', style: 'professional', season: 'all', score: 95, items: [3, 9, 12] },
    { title: 'Smart Casual Combo', description: 'Balanced look for semi-formal occasions', occasion: 'date', style: 'smart-casual', season: 'all', score: 88, items: [4, 7, 14] },
    { title: 'Urban Street Style', description: 'Trendy street-inspired outfit', occasion: 'casual', style: 'urban', season: 'fall', score: 90, items: [2, 6, 13] },
    { title: 'Summer Beach Vibes', description: 'Light and breezy for beach days', occasion: 'beach', style: 'casual', season: 'summer', score: 85, items: [1, 10, 11] }
  ];

  for (const bundle of bundles) {
    const totalPrice = await calculateBundlePrice(client, bundle.items);
    
    const result = await client.query(
      `INSERT INTO bundles (title, description, occasion, style, season, score, total_price) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [bundle.title, bundle.description, bundle.occasion, bundle.style, bundle.season, bundle.score, totalPrice]
    );
    
    const bundleId = result.rows[0].id;
    
    for (const productId of bundle.items) {
      await client.query(
        `INSERT INTO bundle_items (bundle_id, product_id) VALUES ($1, $2)`,
        [bundleId, productId]
      );
    }
  }
}

async function calculateBundlePrice(client, productIds) {
  const placeholders = productIds.map((_, i) => `$${i + 1}`).join(',');
  const result = await client.query(
    `SELECT SUM(price) as total FROM products WHERE id IN (${placeholders})`,
    productIds
  );
  return result.rows[0].total || 0;
}

module.exports = { initializeDatabase };
