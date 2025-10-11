# Drip Check - AI-Powered Outfit Recommendation Platform

## Overview

Drip Check is a full-stack web application that provides AI-powered outfit recommendations. The platform operates in two distinct modes:

1. **Marketplace Mode**: Users browse and search clothing items from a marketplace catalog, selecting items to receive complete outfit recommendations
2. **Wardrobe Mode**: Users maintain a personal wardrobe of their own clothing items and generate outfit combinations exclusively from their collection

The application features a clean, minimal design with gold accent colors and focuses on creating complete outfit bundles from individual clothing items across three main categories: topwear, bottomwear, and footwear.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with React Router for client-side routing

**Build System**: Webpack with Babel transpilation
- Custom webpack configuration for production builds
- CSS modules loaded via style-loader and css-loader
- Automatic cache-busting with content hashes in bundle filenames

**State Management**: React Context API
- `AppModeContext` manages global application state for switching between marketplace and wardrobe modes
- Local component state via React hooks for UI interactions

**Styling Approach**: Pure CSS without UI frameworks
- Custom CSS with CSS variables for theming (gold accent: #E5C77E)
- Responsive design with mobile-first principles
- Feather Icons integrated via CDN for iconography

**Key Design Patterns**:
- Component-based architecture with reusable UI components (BundleCard, ProductCard, CategoryCard, etc.)
- Container/Presentational component pattern
- Controlled components for forms and filters

### Backend Architecture

**Framework**: Express.js 5 with Node.js

**API Design**: RESTful architecture
- `/api/bundles/personalized` - Fetches AI-recommended outfit bundles
- `/api/search` - Multi-attribute product search with filters
- `/api/products/:id` - Individual product details
- `/api/recommendations/:id` - Outfit recommendations based on selected item
- `/api/users/:userId/wardrobe` - Wardrobe CRUD operations
- `/api/users/:userId/wardrobe/:id/recommendations` - Wardrobe-based outfit generation

**Middleware Stack**:
- CORS for cross-origin requests
- body-parser for JSON and URL-encoded payloads
- Static file serving for React production build
- Custom error handling middleware

**Data Layer**: PostgreSQL with pg client
- Connection via environment variable `DATABASE_URL`
- Promise-based async/await pattern throughout
- Database initialization script creates schema on startup

**Routing Strategy**: 
- API routes prefixed with `/api`
- All non-API routes serve React SPA (single-page application pattern)
- Express 5 compatibility ensured via middleware approach instead of wildcard routing

### Database Schema

**Core Tables**:

1. **products** - Marketplace clothing items
   - Attributes: name, category, brand, color, color_hex, price, occasion, pattern_type, image_url, description
   - Categories: topwear, bottomwear, footwear

2. **bundles** - Pre-generated outfit combinations
   - Attributes: title, description, occasion, style, season, score, total_price, image_url
   - Used for personalized homepage recommendations

3. **bundle_items** - Junction table linking bundles to products
   - Foreign keys to both bundles and products tables
   - Cascade deletion enabled

**Wardrobe System** (schema exists but may need implementation):
- User-specific wardrobe items stored separately from marketplace products
- Similar attributes to products table but personalized per user
- Supports image uploads, custom tags, and metadata

### Application Flow

**Marketplace Mode**:
1. User lands on homepage with search, category cards, and personalized bundle recommendations
2. Search functionality filters products by multiple attributes (color, brand, occasion, price range)
3. Clicking a product shows details and "Get Recommendations" button
4. Recommendation engine suggests complete outfits based on selected item
5. Users can save, shuffle, or share outfit bundles

**Wardrobe Mode**:
1. Users switch to wardrobe mode via header toggle
2. Wardrobe page displays user's personal clothing collection
3. Users can add items with images and metadata, edit, or delete
4. Selecting an item generates outfit recommendations using only wardrobe items
5. Outfit combinations are created from the user's existing pieces

### Key Architectural Decisions

**Monorepo Structure**: Frontend and backend coexist in single repository with build output served by Express
- **Rationale**: Simplifies deployment and development workflow for full-stack application
- **Trade-off**: Less separation of concerns but easier to maintain for small-to-medium projects

**PostgreSQL Over MongoDB**: Relational database chosen despite MERN-like stack
- **Rationale**: Structured data with clear relationships (bundles to products, many-to-many)
- **Alternative**: MongoDB would work but relational model fits outfit bundling better

**Pure CSS Over Framework**: No Bootstrap, Material-UI, or Tailwind
- **Rationale**: Full design control, smaller bundle size, custom brand identity
- **Trade-off**: More CSS to write but better performance and unique aesthetics

**Context API Over Redux**: Lightweight state management for mode switching
- **Rationale**: Application state is minimal (marketplace vs wardrobe mode)
- **Alternative**: Redux would be overkill for current complexity

**In-Memory Initial Development**: Code suggests MVP started with in-memory storage before PostgreSQL migration
- **Rationale**: Faster prototyping and testing
- **Production**: Now migrated to PostgreSQL for persistence

## External Dependencies

### NPM Packages

**Frontend**:
- `react` & `react-dom` (19.2.0) - Core UI framework
- `react-router-dom` (7.9.3) - Client-side routing
- `axios` (1.12.2) - HTTP client for API calls

**Backend**:
- `express` (5.1.0) - Web application framework
- `pg` (8.16.3) - PostgreSQL client
- `cors` (2.8.5) - Cross-origin resource sharing
- `body-parser` (2.2.0) - Request body parsing
- `dotenv` (17.2.3) - Environment variable management

**Build Tools**:
- `webpack` (5.102.0) & `webpack-cli` - Module bundler
- `webpack-dev-server` (5.2.2) - Development server
- `babel-loader` with presets - JavaScript/JSX transpilation
- `css-loader` & `style-loader` - CSS processing
- `html-webpack-plugin` - HTML template generation

### External Services

**CDN Resources**:
- Feather Icons (unpkg.com) - Icon library loaded via script tag
- Google Fonts (fonts.googleapis.com) - Inter font family

### Database

**PostgreSQL**: Primary data store
- Connection string via `DATABASE_URL` environment variable
- Tables: products, bundles, bundle_items (and wardrobe-related tables)
- Requires PostgreSQL instance (local or cloud-hosted like Heroku Postgres, Supabase, etc.)

### Environment Variables

Required configuration:
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment mode (development/production)
- Port defaults to 5000 (hardcoded) but configurable

### Future Integration Points

The application architecture is prepared for:
- AI/ML recommendation engine (currently uses scoring algorithm)
- Image upload service for wardrobe items (URLs stored, actual upload service needed)
- User authentication system (userId currently hardcoded as 'user1')
- Social sharing APIs (Web Share API with clipboard fallback)
- Payment processing for marketplace purchases (infrastructure exists)