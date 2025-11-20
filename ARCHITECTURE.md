# Production-Ready Backend Architecture

## Overview

This document outlines the production-ready backend architecture for Padlock Policy, including database design, API endpoints, security measures, and scaling strategies.

## Table of Contents

1. [Database Architecture](#database-architecture)
2. [Row Level Security (RLS)](#row-level-security)
3. [API Endpoints](#api-endpoints)
4. [Security Features](#security-features)
5. [Scaling Infrastructure](#scaling-infrastructure)
6. [Deployment Guide](#deployment-guide)

---

## Database Architecture

### Technology Stack

- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (JWT-based)
- **Storage**: Supabase Storage with encryption support
- **Real-time**: Supabase Realtime subscriptions

### Database Tables

#### 1. Core Tables

##### `insurance_companies`
Insurance companies that offer products on the platform.

```sql
- id (UUID, primary key)
- name (TEXT, unique)
- description (TEXT)
- logo_url (TEXT)
- website (TEXT)
- contact_email (TEXT)
- contact_phone (TEXT)
- address (TEXT)
- country (TEXT)
- is_active (BOOLEAN)
- api_key (TEXT, unique) -- For API authentication
- business_registration_number (TEXT)
- license_number (TEXT)
- regulatory_body (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

##### `insurance_products`
Insurance products offered by companies.

```sql
- id (UUID, primary key)
- company_id (UUID, foreign key)
- product_name (TEXT)
- product_code (TEXT)
- policy_type (ENUM: health|auto|life|home|other)
- description (TEXT)
- coverage_details (JSONB)
- premium_amount (DECIMAL)
- currency (TEXT)
- billing_frequency (TEXT)
- coverage_limits (JSONB)
- deductible (DECIMAL)
- benefits (JSONB)
- exclusions (JSONB)
- is_active (BOOLEAN)
- available_countries (TEXT[])
- minimum_age (INTEGER)
- maximum_age (INTEGER)
- product_image_url (TEXT)
- brochure_url (TEXT)
- terms_url (TEXT)
- search_keywords (TEXT[])
- ai_tags (TEXT[])
- popularity_score (INTEGER)
- last_crawled_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

##### `policies`
User's insurance policies.

```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- policy_type (ENUM)
- policy_number (TEXT)
- premium_amount (DECIMAL)
- start_date (DATE)
- end_date (DATE)
- status (TEXT)
- document_url (TEXT)
- ai_summary (TEXT)
- coverage_summary (TEXT)
- fine_print_summary (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

##### `claims`
Insurance claims submitted by users.

```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- policy_id (UUID, foreign key)
- claim_reason (TEXT)
- claim_amount (DECIMAL)
- claim_status (ENUM: pending|approved|rejected|processing)
- claim_documents (TEXT)
- ai_risk_score (DECIMAL)
- risk_factors (TEXT[])
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

##### `documents`
Uploaded documents with encryption support.

```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- title (TEXT)
- description (TEXT)
- document_type (ENUM: policy|receipt|id|claim|other)
- document_category (TEXT)
- file_url (TEXT)
- file_size (INTEGER)
- is_encrypted (BOOLEAN)
- encryption_key_id (TEXT)
- encryption_algorithm (TEXT)
- created_at (TIMESTAMPTZ)
```

#### 2. Supporting Tables

##### `audit_logs`
Comprehensive audit trail for all operations.

```sql
- id (UUID, primary key)
- user_id (UUID)
- company_id (UUID)
- action (TEXT) -- CREATE, UPDATE, DELETE, LOGIN, etc.
- table_name (TEXT)
- record_id (UUID)
- old_values (JSONB)
- new_values (JSONB)
- ip_address (TEXT)
- user_agent (TEXT)
- request_path (TEXT)
- created_at (TIMESTAMPTZ)
```

##### `admin_users`
Admin users with elevated permissions.

```sql
- id (UUID, primary key)
- role (TEXT) -- admin, super_admin
- permissions (JSONB)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

##### `rate_limits`
Rate limiting tracking.

```sql
- id (UUID, primary key)
- identifier (TEXT) -- user_id, ip_address, api_key
- endpoint (TEXT)
- request_count (INTEGER)
- window_start (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
```

##### `job_queue`
Background job queue for async processing.

```sql
- id (UUID, primary key)
- job_type (TEXT) -- ai_crawl, pdf_extraction, etc.
- status (TEXT) -- pending, processing, completed, failed
- priority (INTEGER)
- payload (JSONB)
- result (JSONB)
- error_message (TEXT)
- attempts (INTEGER)
- max_attempts (INTEGER)
- next_retry_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
- started_at (TIMESTAMPTZ)
- completed_at (TIMESTAMPTZ)
- worker_id (TEXT)
- locked_until (TIMESTAMPTZ)
```

### Database Indexes

Performance indexes have been created on:

- User IDs for all user-related tables
- Policy types and statuses
- Claim statuses
- Document types
- Search keywords (GIN index)
- AI tags (GIN index)
- Coverage details (GIN index)
- Timestamps for time-based queries
- Rate limiting identifiers and endpoints

---

## Row Level Security (RLS)

### User Data Isolation

**Policies**: Users can only access their own policies
```sql
- Users can view their own policies
- Users can insert their own policies
- Users can update their own policies
- Users can delete their own policies
- Admins have full access
```

**Claims**: Users can only access their own claims
```sql
- Users can view their own claims
- Users can insert their own claims
- Users can update their own claims
- Admins have full access
```

**Documents**: Users can only access their own documents with encryption support
```sql
- Users can view their own documents
- Users can insert their own documents
- Users can update their own documents
- Users can delete their own documents
- Admins have full access
```

### Company Data Isolation

**Insurance Companies**: Companies can only access their own data
```sql
- Companies can view their own data (via API key)
- Companies can update their own data
- Admins have full access
```

**Insurance Products**: Companies can only manage their own products
```sql
- Products are publicly viewable (for search)
- Companies can insert their own products
- Companies can update their own products
- Companies can delete their own products
- Admins have full access
```

### Admin Access

**Audit Logs**: Only admins can view
```sql
- Only admins can view audit logs
- Service role can insert audit logs
```

**Admin Users**: Only super admins can manage
```sql
- Admins can view admin users
- Super admins can manage admin users
```

---

## API Endpoints

All API endpoints are implemented as Supabase Edge Functions (Deno runtime).

### Product Management APIs

#### 1. Create Product
**Endpoint**: `/functions/v1/product-create`
**Method**: POST
**Authentication**: API Key (x-api-key header)
**Rate Limit**: 100 requests/hour per company

**Request Body**:
```json
{
  "product_name": "Comprehensive Health Insurance",
  "product_code": "CHI-001",
  "policy_type": "health",
  "description": "Full coverage health insurance",
  "premium_amount": 299.99,
  "currency": "GBP",
  "billing_frequency": "monthly",
  "coverage_details": {
    "hospital": "Full coverage",
    "outpatient": "80% coverage"
  },
  "benefits": {
    "dental": true,
    "vision": true
  },
  "exclusions": {
    "cosmetic": true
  },
  "available_countries": ["GB", "IE"],
  "minimum_age": 18,
  "maximum_age": 65,
  "search_keywords": ["health", "medical", "hospital"]
}
```

**Response**:
```json
{
  "success": true,
  "product": { /* product object */ },
  "message": "Product created successfully"
}
```

#### 2. Update Product
**Endpoint**: `/functions/v1/product-update`
**Method**: POST
**Authentication**: API Key (x-api-key header)
**Rate Limit**: 100 requests/hour per company

**Request Body**:
```json
{
  "product_id": "uuid",
  "premium_amount": 279.99,
  "is_active": true
}
```

#### 3. Search Products
**Endpoint**: `/functions/v1/product-search`
**Method**: GET or POST
**Authentication**: None (public)
**Rate Limit**: 1000 requests/hour per IP

**Query Parameters** (GET):
```
?policy_type=health
&min_premium=100
&max_premium=500
&currency=GBP
&country=GB
&age=30
&search_term=dental
&page=1
&per_page=20
&sort_by=premium_amount
&sort_order=asc
```

**Response**:
```json
{
  "success": true,
  "products": [ /* array of products */ ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_items": 156,
    "total_pages": 8,
    "has_next": true,
    "has_previous": false
  }
}
```

### Company Management APIs

#### 4. Onboard Insurance Company
**Endpoint**: `/functions/v1/company-onboard`
**Method**: POST
**Authentication**: Admin JWT token
**Rate Limit**: 10 requests/hour per admin

**Request Body**:
```json
{
  "name": "Premier Insurance Ltd",
  "description": "Leading UK insurance provider",
  "contact_email": "api@premierinsurance.co.uk",
  "contact_phone": "+44 20 1234 5678",
  "website": "https://premierinsurance.co.uk",
  "country": "GB",
  "business_registration_number": "12345678",
  "license_number": "INS-UK-12345"
}
```

**Response**:
```json
{
  "success": true,
  "company": { /* company object */ },
  "api_key": "pk_xxxxxxxxxxxxxxxx",
  "message": "Insurance company onboarded successfully",
  "instructions": "Please save the API key securely..."
}
```

### Document Management APIs

#### 5. Upload Document
**Endpoint**: `/functions/v1/document-upload`
**Method**: POST
**Authentication**: User JWT token
**Rate Limit**: 50 requests/hour per user

**Request Body**:
```json
{
  "title": "Car Insurance Policy",
  "description": "Annual car insurance policy document",
  "document_type": "policy",
  "file_url": "https://storage.supabase.co/...",
  "file_size": 524288,
  "encrypt": true
}
```

**Response**:
```json
{
  "success": true,
  "document": { /* document object */ },
  "ai_analysis_triggered": true,
  "encrypted": true,
  "message": "Document uploaded successfully"
}
```

### AI & Webhooks

#### 6. AI Product Ingestion Webhook
**Endpoint**: `/functions/v1/ai-product-ingest`
**Method**: POST
**Authentication**: Webhook Secret (x-webhook-secret header)
**Rate Limit**: 200 requests/hour

**Request Body**:
```json
{
  "source_url": "https://insurancecompany.com/products/health-plan",
  "company_name": "Insurance Company Name",
  "product_data": {
    "product_name": "Premium Health Plan",
    "policy_type": "health",
    "premium_amount": 199.99
  }
}
```

**Response**:
```json
{
  "success": true,
  "action": "created", // or "updated"
  "product": { /* product object */ },
  "extracted_data": { /* AI extracted data */ }
}
```

### Background Job Processing

#### 7. Job Worker
**Endpoint**: `/functions/v1/job-worker`
**Method**: POST
**Authentication**: Service Role Key
**Usage**: Triggered by cron or manually

Processes jobs from the queue:
- PDF extraction
- AI product crawls
- Product data refresh
- Email notifications

---

## Security Features

### 1. JWT Sessions
- Implemented via Supabase Auth
- Secure token-based authentication
- Automatic token refresh
- Session management

### 2. Document Encryption
- Optional encryption for sensitive documents
- Encryption metadata stored in database
- Algorithm: AES-256-GCM
- Integration ready for KMS (AWS KMS, Google Cloud KMS)

**Encryption Fields**:
```sql
- is_encrypted (BOOLEAN)
- encryption_key_id (TEXT) -- KMS key identifier
- encryption_algorithm (TEXT) -- AES-256-GCM
```

### 3. Rate Limiting
- Implemented at database level via `check_rate_limit()` function
- Configurable limits per endpoint
- Per-user, per-IP, per-API-key tracking
- Automatic window-based reset

**Usage in Edge Functions**:
```typescript
const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
  identifier_val: user.id,
  endpoint_val: 'document-upload',
  max_requests: 50,
  window_minutes: 60
});
```

### 4. Audit Logs
- Automatic logging via triggers
- Tracks all CUD operations on critical tables
- Stores old and new values
- Includes user, IP, and timestamp
- Only accessible by admins

**Audited Tables**:
- policies
- insurance_products
- insurance_companies
- claims

### 5. API Key Management
- Secure API key generation for insurance companies
- Format: `pk_` + 64 hex characters
- Stored securely in database
- Used for company API authentication

---

## Scaling Infrastructure

### 1. Cron Jobs for Daily AI Crawls

**Setup** (run as superuser in Supabase):
```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily AI crawls at 2 AM UTC
SELECT cron.schedule(
  'daily-ai-crawls',
  '0 2 * * *',
  'SELECT public.schedule_daily_ai_crawls();'
);

-- Schedule weekly cleanup at 3 AM UTC on Sundays
SELECT cron.schedule(
  'weekly-job-cleanup',
  '0 3 * * 0',
  'SELECT public.cleanup_old_jobs();'
);
```

**What it does**:
1. Crawls all active insurance company websites
2. Schedules refresh for products not updated in 7+ days
3. Enqueues jobs in the background queue
4. Processes via job-worker Edge Function

### 2. Background Queue for PDF Extraction

**Automatic Enqueueing**:
- Trigger automatically enqueues PDFs when uploaded
- Higher priority for policy documents (priority: 10)
- Standard priority for other documents (priority: 5)

**Manual Enqueueing**:
```sql
SELECT public.enqueue_pdf_extraction(
  'document-uuid',
  'https://storage.supabase.co/file.pdf',
  10 -- priority
);
```

**Processing**:
- Job worker function processes queue
- Extracts text from PDFs
- Retries on failure (max 3 attempts)
- Exponential backoff for retries

### 3. Database Indexing for Fast Search

**Key Indexes**:
- GIN indexes on JSONB columns (coverage_details, benefits, exclusions)
- GIN indexes on array columns (search_keywords, ai_tags)
- B-tree indexes on frequently queried columns
- Composite indexes on common query patterns

**Query Optimization**:
```sql
-- Example: Fast product search
EXPLAIN ANALYZE
SELECT * FROM insurance_products
WHERE policy_type = 'health'
  AND premium_amount BETWEEN 100 AND 500
  AND is_active = true
  AND 'dental' = ANY(search_keywords);
```

### 4. CDN for Product Images

**Implementation Steps**:

1. **Supabase Storage Setup**:
   - Create public bucket: `product-images`
   - Enable RLS policies
   - Configure automatic image optimization

2. **CDN Configuration** (Cloudflare example):
   ```
   - Origin: https://ryqawthghqhsgjucgong.supabase.co/storage/v1/object/public/product-images
   - Cache Everything: ON
   - Browser Cache TTL: 1 month
   - Edge Cache TTL: 1 month
   - Image Resizing: Enabled
   - WebP Conversion: Automatic
   ```

3. **Usage in Application**:
   ```typescript
   const imageUrl = `https://cdn.padlockpolicy.com/products/${productId}/image.jpg`;
   ```

### 5. Connection Pooling

**Supabase Pooler**:
- Use Supabase connection pooler for high-traffic scenarios
- Transaction mode for short-lived connections
- Session mode for long-lived connections

**Configuration**:
```
Connection String (Pooler): postgresql://postgres.[project-ref]:[password]@[region].pooler.supabase.com:6543/postgres
```

---

## Deployment Guide

### Prerequisites

1. Supabase account and project
2. OpenAI API key (for AI features)
3. Stripe account (for payments)
4. Domain name (for production)

### Step 1: Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Step 2: Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy product-create
supabase functions deploy product-update
supabase functions deploy product-search
supabase functions deploy company-onboard
supabase functions deploy document-upload
supabase functions deploy ai-product-ingest
supabase functions deploy job-worker

# Set environment secrets
supabase secrets set OPENAI_API_KEY=your-openai-api-key
supabase secrets set WEBHOOK_SECRET=your-webhook-secret
supabase secrets set STRIPE_SECRET_KEY=your-stripe-secret-key
```

### Step 3: Enable pg_cron

```sql
-- Run in Supabase SQL Editor with superuser
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily AI crawls
SELECT cron.schedule(
  'daily-ai-crawls',
  '0 2 * * *',
  'SELECT public.schedule_daily_ai_crawls();'
);

-- Schedule weekly cleanup
SELECT cron.schedule(
  'weekly-job-cleanup',
  '0 3 * * 0',
  'SELECT public.cleanup_old_jobs();'
);
```

### Step 4: Configure Worker

Set up a cron job to call the job-worker function every minute:

```bash
# Using cron (Linux/Mac)
* * * * * curl -X POST https://your-project-ref.supabase.co/functions/v1/job-worker \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"

# Or use Supabase Cron
SELECT cron.schedule(
  'process-jobs',
  '* * * * *',
  $$
  SELECT net.http_post(
    url:='https://your-project-ref.supabase.co/functions/v1/job-worker',
    headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  )
  $$
);
```

### Step 5: Create First Admin User

```sql
-- Insert your user ID as admin
INSERT INTO public.admin_users (id, role, permissions)
VALUES ('your-user-uuid', 'super_admin', '["all"]'::jsonb);
```

### Step 6: Onboard First Insurance Company

```bash
# Call the company-onboard endpoint
curl -X POST https://your-project-ref.supabase.co/functions/v1/company-onboard \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Insurance Ltd",
    "contact_email": "admin@testinsurance.com",
    "website": "https://testinsurance.com"
  }'
```

Save the returned API key securely!

### Step 7: Test Product Creation

```bash
# Create a test product
curl -X POST https://your-project-ref.supabase.co/functions/v1/product-create \
  -H "x-api-key: YOUR_COMPANY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Basic Health Plan",
    "policy_type": "health",
    "premium_amount": 99.99,
    "currency": "GBP",
    "description": "Affordable health insurance"
  }'
```

### Step 8: Configure CDN (Optional)

1. Set up Cloudflare or similar CDN
2. Point to Supabase Storage bucket
3. Update image URLs in application

---

## Monitoring & Maintenance

### Database Monitoring

```sql
-- Check job queue status
SELECT job_type, status, COUNT(*)
FROM public.job_queue
GROUP BY job_type, status;

-- Check recent audit logs
SELECT * FROM public.audit_logs
ORDER BY created_at DESC
LIMIT 100;

-- Check rate limit usage
SELECT identifier, endpoint, request_count
FROM public.rate_limits
WHERE window_start > now() - interval '1 hour'
ORDER BY request_count DESC;
```

### Performance Monitoring

- Monitor database query performance via Supabase dashboard
- Track Edge Function execution time and errors
- Monitor job queue processing latency
- Set up alerts for failed jobs

### Regular Maintenance

```sql
-- Cleanup old jobs (run weekly)
SELECT public.cleanup_old_jobs();

-- Vacuum and analyze tables (run monthly)
VACUUM ANALYZE;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

---

## API Rate Limits Summary

| Endpoint | Limit | Window |
|----------|-------|--------|
| product-create | 100 req | 1 hour |
| product-update | 100 req | 1 hour |
| product-search | 1000 req | 1 hour |
| company-onboard | 10 req | 1 hour |
| document-upload | 50 req | 1 hour |
| ai-product-ingest | 200 req | 1 hour |

---

## Support & Documentation

- Supabase Docs: https://supabase.com/docs
- API Reference: See individual Edge Function files
- Database Schema: See migration files in `supabase/migrations/`

---

## License

Proprietary - All rights reserved
