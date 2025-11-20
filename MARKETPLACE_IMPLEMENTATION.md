# Public Marketplace / Search System Implementation

This document describes the implementation of the public insurance marketplace with advanced search and filtering capabilities.

## Features Implemented

### 1. Search Filters

The marketplace includes comprehensive filtering options:

#### Insurance Type
- Health Insurance
- Car Insurance
- Life Insurance
- Home Insurance
- Other Insurance (Travel, Pet, etc.)

#### Price Range
- Minimum monthly premium
- Maximum monthly premium
- Users can set custom price ranges

#### Coverage Amount
- Minimum coverage amount
- Maximum coverage amount
- Flexible coverage limits

#### Region
- UK-wide coverage
- Major cities (London, Manchester, Birmingham, Leeds, Glasgow, Edinburgh, etc.)
- Regional areas (South East, North West, Scotland, Wales, Northern Ireland, etc.)

#### Age Group
- Minimum and maximum age requirements
- Products automatically filtered based on user's age

#### Extra Benefits
- 24/7 Support
- Breakdown Cover (Auto)
- Dental & Optical Cover (Health)
- Legal Cover
- Mental Health Support
- And many more...

#### Company Rating
- Filter by minimum star rating (0-5 stars)
- Visual star rating display

#### Instant Issue / Requires Underwriting
- Toggle for instant issue products
- Shows which products require medical exams

### 2. AI Search Assistant

Natural language search with intelligent query parsing:

#### Example Queries Supported:
- "Find the cheapest car insurance for a 27-year-old in London"
- "Which travel insurance covers pre-existing medical conditions?"
- "Which company covers high-risk jobs?"
- "Show me health insurance under £200 per month"
- "Life insurance with 4+ star rating in Manchester"

#### AI Features:
- Extracts policy type from natural language
- Identifies age requirements
- Parses price constraints
- Detects location/region
- Recognises special requirements (pre-existing conditions, high-risk jobs)
- Understands rating requirements

### 3. Database Schema

#### marketplace_products Table

**Columns:**
- `id` - UUID primary key
- `product_name` - Product name
- `insurer_name` - Insurance company name
- `policy_type` - Type of insurance (enum)
- `monthly_premium` - Monthly cost
- `annual_premium` - Annual cost (optional)
- `coverage_amount` - Coverage limit
- `coverage_summary` - Brief description of coverage
- `region` - Geographic availability
- `min_age` / `max_age` - Age requirements
- `extra_benefits` - Array of additional benefits
- `company_rating` - Rating from 0-5
- `instant_issue` - Boolean for instant approval
- `requires_medical_exam` - Boolean
- `covers_pre_existing_conditions` - Boolean
- `covers_high_risk_jobs` - Boolean
- `description` - Full product description
- `terms_url` - Link to terms and conditions
- `contact_info` - JSONB with contact details

**Indices:**
- Policy type, region, premium, rating, instant issue for fast filtering
- Composite index on age range for efficient age-based queries

**Function:**
- `search_marketplace_products()` - Stored procedure for advanced filtering

### 4. Components

#### MarketplaceFilters Component
Location: `/src/components/MarketplaceFilters.tsx`

Features:
- Collapsible filter panel
- Real-time filter updates
- Active filter counter
- Reset all filters functionality
- Benefits selection with visual tags

#### AISearchAssistant Component
Location: `/src/components/AISearchAssistant.tsx`

Features:
- Natural language input
- Example query suggestions
- Real-time query parsing
- Loading states
- Toast notifications for feedback

#### Marketplace Page
Location: `/src/pages/Marketplace.tsx`

Features:
- Responsive grid layout
- Product cards with all details
- Loading states
- Empty state handling
- Integration with filters and AI search
- Stats display (products found, insurers, avg rating)

### 5. TypeScript Types
Location: `/src/types/marketplace.ts`

**Key Interfaces:**
- `MarketplaceProduct` - Product data structure
- `MarketplaceFilters` - Filter state structure
- `AISearchQuery` - Search query structure

**Constants:**
- `POLICY_TYPES` - Available policy types
- `UK_REGIONS` - Supported regions
- `COMMON_BENEFITS` - Standard benefit options

## Usage

### Accessing the Marketplace

1. **Direct URL:** Navigate to `/marketplace`
2. **Bottom Navigation:** Click the "Marketplace" icon in the bottom navigation bar
3. **Public Access:** No authentication required

### Using Filters

1. Expand the filter panel (left sidebar)
2. Select desired filters
3. Products automatically update
4. View active filter count
5. Click "Reset All" to clear filters

### Using AI Search

1. Type or select an example query
2. Press Enter or click "Search"
3. AI parses your query and applies filters
4. View matching products

### Getting a Quote

1. Browse or search for products
2. Click "Get Quote" on any product card
3. Follow the quote request process

## Database Migrations

### Creating the Table
File: `/supabase/migrations/20251120000000_create_marketplace_products.sql`

Run this migration to create the marketplace_products table and search function.

### Seeding Sample Data
File: `/supabase/migrations/20251120000001_seed_marketplace_products.sql`

Run this migration to populate the database with sample products including:
- 3 Car insurance products
- 4 Health insurance products
- 3 Life insurance products
- 4 Home insurance products
- 5 Other products (Travel, Pet insurance)

## Integration Points

### Currency Support
The marketplace integrates with the existing `useCurrency` hook to display prices in the user's preferred currency (GBP, EUR, USD).

### Navigation
The marketplace is accessible via:
- Bottom navigation (BottomNav component)
- Direct URL routing
- Public access (no authentication required)

### Toast Notifications
Uses the existing toast system for user feedback on:
- Filter applications
- AI search results
- Quote requests

## Future Enhancements

Potential improvements:
1. **Real-time Data:** Connect to Supabase for live product data
2. **Product Comparison:** Allow side-by-side comparison of multiple products
3. **Save Searches:** Let users save their filter combinations
4. **Favourites:** Bookmark products for later review
5. **Advanced AI:** Use actual AI/ML models for better natural language understanding
6. **User Reviews:** Add customer reviews and ratings
7. **Apply Online:** Direct application forms
8. **Price Alerts:** Notify users when prices drop
9. **Personalised Recommendations:** Based on user profile and browsing history

## Technical Notes

- **Mock Data:** Currently uses mock data in the Marketplace component
- **Production:** Replace mock data with Supabase queries
- **Performance:** Indices created for common query patterns
- **Accessibility:** ARIA labels and semantic HTML throughout
- **Responsive:** Mobile-first design with breakpoints
- **Type Safety:** Full TypeScript coverage

## Testing

Test scenarios:
1. Apply various filter combinations
2. Test AI search with different queries
3. Verify age-based filtering
4. Check region-specific results
5. Test mobile responsiveness
6. Verify empty states
7. Test filter reset functionality
8. Check quote request flow

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design from 320px to 1920px+
