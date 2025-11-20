# API Reference Guide

Quick reference for all production-ready APIs.

## Base URL

```
https://ryqawthghqhsgjucgong.supabase.co/functions/v1
```

## Authentication

### User Authentication (JWT)
```http
Authorization: Bearer <user-jwt-token>
```

### Company Authentication (API Key)
```http
x-api-key: <company-api-key>
```

### Webhook Authentication
```http
x-webhook-secret: <webhook-secret>
```

---

## Product Management APIs

### 1. Create Product

Create a new insurance product.

```http
POST /product-create
Content-Type: application/json
x-api-key: <your-api-key>

{
  "product_name": "Premium Health Insurance",
  "policy_type": "health",
  "premium_amount": 299.99,
  "currency": "GBP",
  "billing_frequency": "monthly",
  "description": "Comprehensive health coverage",
  "coverage_details": {
    "hospital": "Full coverage",
    "dental": "80% coverage"
  },
  "available_countries": ["GB", "IE"],
  "minimum_age": 18,
  "maximum_age": 70
}
```

**Response (201)**:
```json
{
  "success": true,
  "product": {
    "id": "uuid",
    "company_id": "uuid",
    "product_name": "Premium Health Insurance",
    "premium_amount": 299.99,
    ...
  },
  "message": "Product created successfully"
}
```

### 2. Update Product

Update an existing product.

```http
POST /product-update
Content-Type: application/json
x-api-key: <your-api-key>

{
  "product_id": "product-uuid",
  "premium_amount": 279.99,
  "is_active": true,
  "description": "Updated description"
}
```

**Response (200)**:
```json
{
  "success": true,
  "product": { ... },
  "message": "Product updated successfully"
}
```

### 3. Search Products

Search and filter insurance products.

```http
GET /product-search?policy_type=health&min_premium=100&max_premium=500&page=1&per_page=20
```

**Or using POST**:
```http
POST /product-search
Content-Type: application/json

{
  "policy_type": "health",
  "min_premium": 100,
  "max_premium": 500,
  "currency": "GBP",
  "country": "GB",
  "age": 35,
  "search_term": "dental",
  "page": 1,
  "per_page": 20,
  "sort_by": "premium_amount",
  "sort_order": "asc"
}
```

**Response (200)**:
```json
{
  "success": true,
  "products": [
    {
      "id": "uuid",
      "product_name": "Basic Health Plan",
      "premium_amount": 150.00,
      "insurance_companies": {
        "name": "Premier Insurance",
        "logo_url": "https://..."
      },
      ...
    }
  ],
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

---

## Company Management APIs

### 4. Onboard Company

Onboard a new insurance company (Admin only).

```http
POST /company-onboard
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "name": "Premier Insurance Ltd",
  "description": "Leading UK insurance provider",
  "contact_email": "api@premierinsurance.co.uk",
  "contact_phone": "+44 20 1234 5678",
  "website": "https://premierinsurance.co.uk",
  "country": "GB",
  "address": "123 Insurance Street, London",
  "business_registration_number": "12345678",
  "license_number": "INS-UK-12345",
  "regulatory_body": "FCA"
}
```

**Response (201)**:
```json
{
  "success": true,
  "company": {
    "id": "uuid",
    "name": "Premier Insurance Ltd",
    "api_key": "pk_a1b2c3d4e5f6...",
    ...
  },
  "message": "Insurance company onboarded successfully",
  "instructions": "Please save the API key securely. It will not be shown again."
}
```

---

## Document Management APIs

### 5. Upload Document

Upload and optionally encrypt a document.

```http
POST /document-upload
Authorization: Bearer <user-jwt-token>
Content-Type: application/json

{
  "title": "Car Insurance Policy 2025",
  "description": "Annual car insurance policy",
  "document_type": "policy",
  "document_category": "auto",
  "file_url": "https://storage.supabase.co/object/public/documents/...",
  "file_size": 524288,
  "encrypt": true
}
```

**Response (201)**:
```json
{
  "success": true,
  "document": {
    "id": "uuid",
    "title": "Car Insurance Policy 2025",
    "is_encrypted": true,
    "encryption_algorithm": "AES-256-GCM",
    ...
  },
  "ai_analysis_triggered": true,
  "encrypted": true,
  "message": "Document uploaded successfully"
}
```

---

## AI & Webhook APIs

### 6. AI Product Ingestion

Webhook for automated product ingestion (AI-powered).

```http
POST /ai-product-ingest
x-webhook-secret: <webhook-secret>
Content-Type: application/json

{
  "source_url": "https://insurancecompany.com/products/health-plan",
  "company_name": "Insurance Company Ltd",
  "product_data": {
    "product_name": "Premium Health Plan",
    "policy_type": "health",
    "premium_amount": 199.99,
    "description": "Comprehensive health coverage"
  }
}
```

**Response (201 or 200)**:
```json
{
  "success": true,
  "action": "created",
  "product": { ... },
  "source_url": "https://...",
  "extracted_data": { ... },
  "message": "Product created successfully"
}
```

---

## Background Job APIs

### 7. Job Worker

Process background jobs (triggered by cron or manually).

```http
POST /job-worker
Authorization: Bearer <service-role-key>
```

**Response (200)**:
```json
{
  "success": true,
  "worker_id": "worker_1234567890_abc123",
  "job_id": "uuid",
  "job_type": "pdf_extraction",
  "result": {
    "document_id": "uuid",
    "text_length": 5432,
    "success": true
  }
}
```

---

## Database Functions (via Supabase Client)

### Check Rate Limit

```typescript
const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
  identifier_val: user.id,
  endpoint_val: 'document-upload',
  max_requests: 50,
  window_minutes: 60
});
```

### Check if User is Admin

```typescript
const { data: isAdmin } = await supabase.rpc('is_admin', {
  user_id: user.id
});
```

### Enqueue Job

```typescript
const { data: jobId } = await supabase.rpc('enqueue_job', {
  job_type_val: 'pdf_extraction',
  payload_val: { document_id: 'uuid', file_url: 'https://...' },
  priority_val: 10,
  max_attempts_val: 3
});
```

### Schedule Daily AI Crawls

```typescript
const { data: crawlCount } = await supabase.rpc('schedule_daily_ai_crawls');
// Returns number of jobs scheduled
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error information (if available)"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| product-create | 100 requests | 1 hour |
| product-update | 100 requests | 1 hour |
| product-search | 1000 requests | 1 hour |
| company-onboard | 10 requests | 1 hour |
| document-upload | 50 requests | 1 hour |
| ai-product-ingest | 200 requests | 1 hour |

When rate limit is exceeded:
```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

---

## Testing with cURL

### Create Product
```bash
curl -X POST https://your-project.supabase.co/functions/v1/product-create \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Test Health Insurance",
    "policy_type": "health",
    "premium_amount": 99.99,
    "currency": "GBP"
  }'
```

### Search Products
```bash
curl "https://your-project.supabase.co/functions/v1/product-search?policy_type=health&min_premium=50&max_premium=200"
```

### Upload Document
```bash
curl -X POST https://your-project.supabase.co/functions/v1/document-upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Policy",
    "document_type": "policy",
    "file_url": "https://storage.supabase.co/...",
    "encrypt": true
  }'
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Search products
const { data, error } = await supabase.functions.invoke('product-search', {
  body: {
    policy_type: 'health',
    min_premium: 100,
    max_premium: 500,
    country: 'GB'
  }
});

// Upload document
const { data: doc, error } = await supabase.functions.invoke('document-upload', {
  body: {
    title: 'My Policy',
    document_type: 'policy',
    file_url: fileUrl,
    encrypt: true
  }
});
```

### Python

```python
from supabase import create_client

supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Search products
response = supabase.functions.invoke('product-search', {
    'body': {
        'policy_type': 'health',
        'min_premium': 100,
        'max_premium': 500
    }
})
```

---

## Webhook Integration Example

Set up a webhook to receive product updates:

```typescript
// Your webhook endpoint
app.post('/webhooks/product-ingest', async (req, res) => {
  const secret = req.headers['x-webhook-secret'];

  if (secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Invalid secret' });
  }

  const { source_url, company_name, product_data } = req.body;

  // Forward to Supabase AI ingest
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/ai-product-ingest`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': WEBHOOK_SECRET
      },
      body: JSON.stringify({ source_url, company_name, product_data })
    }
  );

  const result = await response.json();
  res.json(result);
});
```

---

## Support

For API support and questions:
- Documentation: See ARCHITECTURE.md
- Issues: GitHub Issues
- Email: support@padlockpolicy.com
