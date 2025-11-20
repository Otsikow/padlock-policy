# AI-Powered Insurance Data Ingestion System

## Overview

This system provides automated, AI-powered insurance product data ingestion from multiple sources including APIs, web scrapers, aggregators, and regulatory feeds. It includes intelligent product normalization, duplicate detection, and consistency monitoring.

## Features

### A. Data Sources
- **Company-provided API endpoints** - Direct integration with insurer APIs
- **Industry aggregators** - Integration with comparison sites and aggregators
- **Government insurance regulators** - Automated feeds from regulatory bodies
- **Public product feeds** - RSS/Atom feeds and structured data
- **Web scraping** - AI-powered extraction from insurer product pages

### B. AI Functions

#### 1. Smart Scraper
- Reads unstructured product pages
- Extracts premiums, exclusions, add-ons, benefits
- Uses AI to understand varying page structures
- Handles dynamic content and different layouts

#### 2. Document Reader
- PDF policy wording → structured coverage data
- Extracts key terms, coverage limits, exclusions
- Integrates with existing `analyze-policy` Edge Function

#### 3. Product Comparison AI
- Normalizes different insurers' terminology
- Creates comparable fields (cover limits, pricing, benefits)
- Standardizes product data across providers
- Ensures consistency for accurate comparisons

#### 4. Consistency Monitor
- Alerts admin if a product looks outdated
- Checks for broken links and missing data
- Monitors pricing against market averages
- Flags stale or unverified products

#### 5. Duplicate Detector
- Prevents insurers from posting the same product twice
- Uses AI to identify semantic duplicates
- Calculates similarity scores
- Provides confidence ratings

## Architecture

### Database Tables

#### `data_sources`
Tracks external insurance data sources.
```sql
- id, name, source_type, provider_name
- status (active, paused, error, disabled)
- configuration (JSONB with API keys, endpoints, scraping rules)
- sync_frequency (daily, weekly, hourly, manual)
- last_sync_at, next_sync_at
- error_count, last_error
```

#### `ingestion_jobs`
Tracks individual data ingestion job runs.
```sql
- id, data_source_id, status, job_type
- products_found, products_new, products_updated
- products_duplicates, products_errors
- started_at, completed_at, error_message
```

#### `ingestion_logs`
Detailed logs for each product processed.
```sql
- id, job_id, log_level, message
- product_id, details (JSONB)
```

#### `product_catalog`
Stores insurance products from various sources.
```sql
- id, data_source_id, external_id
- insurer_name, product_name, policy_type
- premium_amount, premium_frequency, currency
- coverage_summary, coverage_limits, benefits, exclusions
- add_ons, product_url, document_url
- ai_summary, ai_normalized_data, risk_score
- status, is_duplicate, duplicate_of
```

#### `product_versions`
Tracks product changes over time.
```sql
- id, product_id, version_number
- changes_detected (JSONB), premium_change
- change_type, snapshot_data (JSONB)
```

#### `duplicate_detections`
Tracks detected duplicate products.
```sql
- id, product_id, duplicate_product_id
- similarity_score, matching_fields
- ai_confidence, status
- reviewed_by, reviewed_at, notes
```

#### `consistency_alerts`
Tracks outdated or inconsistent products.
```sql
- id, product_id, alert_type, severity
- message, details (JSONB), status
- acknowledged_by, acknowledged_at, resolved_at
```

### Edge Functions

#### `/functions/v1/data-ingestion`
Main orchestrator for data ingestion.
```typescript
Actions:
- start_ingestion: Start manual/scheduled ingestion
- get_job_status: Get job progress and logs
- list_sources: List all data sources
- cancel_job: Cancel running job
```

#### `/functions/v1/scrape-product-page`
AI-powered web scraper.
```typescript
Input: { url, scrape_rules }
Output: { products[], count, source_url }
```

#### `/functions/v1/normalize-product`
Product comparison AI for terminology normalization.
```typescript
Input: { product }
Output: Normalized product data with standardized fields
```

#### `/functions/v1/detect-duplicates`
Duplicate detection engine.
```typescript
Input: { product_id }
Output: { duplicates[], count, high_confidence_duplicates }
```

#### `/functions/v1/consistency-check`
Consistency monitoring.
```typescript
Actions:
- check_all: Check all active products
- check_product: Check specific product
Output: { alerts[], count, critical_count }
```

#### `/functions/v1/scheduled-ingestion`
Automated scheduled ingestion (cron job).
```typescript
Triggers ingestion for sources due for sync
Calculates next sync time based on frequency
```

### Frontend Services

#### `dataIngestionService.ts`
- Data source management (CRUD)
- Job monitoring and control
- Consistency alert management
- Duplicate detection review

#### `productCatalogService.ts`
- Product search and filtering
- Product comparison
- Version history
- Statistics and analytics

### UI Components

#### `DataIngestionDashboard.tsx`
Comprehensive dashboard showing:
- Statistics cards (total products, data sources, alerts, duplicates)
- Data sources management
- Ingestion jobs monitoring
- Consistency alerts
- Duplicate detections

#### Page: `/data-ingestion`
Protected route accessible to authenticated users.

## Setup Instructions

### 1. Database Migration

Run the migration to create all required tables:
```bash
supabase migration up
```

The migration file is located at:
`supabase/migrations/20251120000000-ai-powered-data-ingestion.sql`

### 2. Environment Variables

Configure the following environment variables in your Supabase project:

```bash
OPENAI_API_KEY=sk-...  # Required for AI functions
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=...  # For server-side operations
```

### 3. Deploy Edge Functions

Deploy all edge functions:
```bash
supabase functions deploy data-ingestion
supabase functions deploy scrape-product-page
supabase functions deploy normalize-product
supabase functions deploy detect-duplicates
supabase functions deploy consistency-check
supabase functions deploy scheduled-ingestion
```

### 4. Set Up Scheduled Jobs (Optional)

To enable automatic scheduled ingestion, enable pg_cron and set up the cron job:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule ingestion to run every 6 hours
SELECT cron.schedule(
  'scheduled-data-ingestion',
  '0 */6 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://[YOUR-PROJECT-REF].supabase.co/functions/v1/scheduled-ingestion',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer [SERVICE-ROLE-KEY]"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);
```

### 5. Seed Example Data Sources

The migration includes three example data sources:
- FCA Insurance Products Register (regulator)
- MoneySuperMarket API (aggregator)
- Direct Line Products Scraper (web scraper)

You can add more sources via the UI at `/data-ingestion`.

## Usage

### Adding a Data Source

1. Navigate to `/data-ingestion`
2. Click "Add Data Source" (or via API)
3. Configure:
   - Name and provider
   - Source type (API, scraper, aggregator, regulator, feed)
   - Configuration (API endpoints, scraping rules, credentials)
   - Sync frequency (hourly, daily, weekly, manual)

Example API source configuration:
```json
{
  "api_endpoint": "https://api.insurer.com/products",
  "api_key": "your-api-key",
  "method": "GET"
}
```

Example scraper configuration:
```json
{
  "target_url": "https://insurer.com/products",
  "scrape_rules": {
    "selector": ".product-card",
    "product_name": ".product-title",
    "premium": ".price",
    "insurer_name": ".company-name",
    "link": "a.product-link"
  }
}
```

### Starting Manual Ingestion

```typescript
import { startIngestion } from '@/services/dataIngestionService';

const result = await startIngestion(dataSourceId);
console.log('Job started:', result.job_id);
```

### Monitoring Jobs

```typescript
import { getJobStatus } from '@/services/dataIngestionService';

const { job, logs } = await getJobStatus(jobId);
console.log('Status:', job.status);
console.log('Products found:', job.products_found);
```

### Running Consistency Checks

```typescript
import { runConsistencyCheck } from '@/services/dataIngestionService';

const result = await runConsistencyCheck();
console.log('Alerts created:', result.count);
```

### Searching Products

```typescript
import { searchProducts, getProducts } from '@/services/productCatalogService';

// Search by query
const results = await searchProducts('car insurance');

// Filter products
const filtered = await getProducts({
  policy_type: ['auto'],
  min_premium: 20,
  max_premium: 100,
  status: 'active',
});
```

### Comparing Products

```typescript
import { compareProducts } from '@/services/productCatalogService';

const products = await compareProducts([productId1, productId2, productId3]);
// Returns normalized products for side-by-side comparison
```

## AI Processing Pipeline

### 1. Data Ingestion
```
Data Source → API/Scraper → Raw Product Data
```

### 2. Normalization
```
Raw Data → normalize-product (AI) → Standardized Data
- Terminology mapping
- Field extraction
- Coverage limit structuring
- Benefit/exclusion normalization
```

### 3. Duplicate Detection
```
New Product → detect-duplicates (AI) → Similarity Analysis
- Semantic matching
- Field comparison
- Confidence scoring
```

### 4. Consistency Monitoring
```
Existing Products → consistency-check → Alerts
- Outdated detection
- Missing data checks
- Link validation
- Pricing analysis
```

## Security & Privacy

- **Row Level Security (RLS)** enabled on all tables
- **Service role access** required for ingestion operations
- **Authenticated users** can view products and run manual ingestions
- **API keys** stored securely in JSONB configuration fields
- **Audit logging** via ingestion_logs table

## Monitoring & Alerts

The system provides several types of alerts:

### Consistency Alerts
- **Outdated**: Product not verified in 30+ days
- **Missing Data**: Critical fields missing
- **Stale Pricing**: Price significantly different from market average
- **Broken Link**: Product URL inaccessible
- **Verification Failed**: Last sync attempt failed

### Duplicate Detections
- **High confidence** (90%+): Automatically marked as duplicate
- **Medium confidence** (70-89%): Flagged for review
- **Low confidence** (<70%): Not flagged

### Severity Levels
- **Critical**: Immediate attention required
- **High**: Address soon
- **Medium**: Review when convenient
- **Low**: Informational

## Performance Considerations

- **Batch processing**: Large ingestion jobs process products in batches
- **Rate limiting**: Respects source API rate limits
- **Caching**: Avoids redundant API calls
- **Indexing**: Database indexes on frequently queried fields
- **Pagination**: Results limited to 100 products by default

## Future Enhancements

- [ ] Machine learning-based pricing prediction
- [ ] Automated product categorization
- [ ] Multi-language support
- [ ] Real-time webhook ingestion
- [ ] Advanced analytics dashboard
- [ ] Export to various formats (CSV, Excel, PDF)
- [ ] Integration with more aggregators
- [ ] Coverage comparison scoring

## Troubleshooting

### Ingestion Job Failed

Check the ingestion logs:
```typescript
const logs = await getIngestionLogs(jobId);
logs.forEach(log => {
  if (log.log_level === 'error') {
    console.error(log.message, log.details);
  }
});
```

### High Error Count on Data Source

1. Check `last_error` field on the data source
2. Verify API credentials are valid
3. Check if the source URL is accessible
4. Review scraping rules if using a scraper

### Products Not Appearing

1. Check if products are marked as `active`
2. Verify RLS policies allow access
3. Check for duplicate flags
4. Review normalization logs

## Support

For issues or questions:
1. Check the ingestion logs in the dashboard
2. Review consistency alerts for product-specific issues
3. Examine duplicate detections if products seem to be missing
4. Contact the development team with job IDs for investigation

---

**Version**: 1.0.0
**Last Updated**: 2025-11-20
**Maintained By**: Padlock Policy Development Team
