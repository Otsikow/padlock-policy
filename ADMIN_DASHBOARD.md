# Admin Dashboard Documentation

## Overview

The Admin Dashboard provides comprehensive control over insurance companies, products, AI operations, and analytics for the Padlock Policy platform.

## Features

### 1. Dashboard Overview

Access the admin dashboard at `/admin` (requires admin role).

**Key Metrics:**
- Total insurance companies onboarded
- Pending verifications
- New product submissions
- AI alerts and data mismatches
- Customer search statistics
- Active products
- Running crawl operations

### 2. Insurance Company Management

**Capabilities:**
- View all registered insurance companies
- Approve/reject company applications
- Suspend or disable company accounts
- Request additional documentation
- View KYC and compliance files
- Manage company verification status

**Company Statuses:**
- `pending` - Awaiting admin verification
- `approved` - Active and verified
- `rejected` - Application denied
- `suspended` - Temporarily disabled
- `disabled` - Permanently deactivated

**Company Information:**
- Company name and trading name
- Registration number
- FCA (Financial Conduct Authority) number
- VAT number
- Contact details (email, phone)
- Address
- Website
- Compliance documents

### 3. Product Management

**Capabilities:**
- View all insurance products
- Approve/reject product submissions
- Edit product listings
- Manually create products on behalf of insurers
- Flag risky products
- Force "Paused" status for compliance failures
- Track product performance (views, clicks, conversions)

**Product Statuses:**
- `draft` - Work in progress
- `pending` - Awaiting admin approval
- `approved` - Verified but not live
- `active` - Live and visible to customers
- `rejected` - Denied approval
- `paused` - Temporarily disabled
- `archived` - Removed from active use

**Product Information:**
- Product name and type
- Base premium and frequency
- Coverage details and amounts
- Excess amounts
- Age restrictions
- Geographic coverage
- AI risk flags
- Performance metrics

**Manual Product Creation:**
Admins can create products with the following fields:
- Insurance company selection
- Product name and type
- Description
- Pricing (premium, currency, frequency)
- Coverage amounts
- Age eligibility
- Excess amounts

### 4. AI Operations Control Panel

**Capabilities:**
- Start/stop data crawlers
- Manage scraping rules
- Manage API integrations
- Trigger re-crawling operations
- Monitor crawl status and progress
- View operation logs and errors
- Approve AI-normalised coverage data

**Operation Types:**
- `scrape` - Web scraping operations
- `api_sync` - API data synchronisation
- `normalize` - AI data normalisation
- `re-crawl` - Re-crawl existing sources

**Crawl Status:**
- `running` - Operation in progress
- `completed` - Successfully finished
- `failed` - Operation encountered errors
- `paused` - Temporarily stopped

**Crawl Metrics:**
- Products found
- Products created
- Products updated
- Execution duration
- Error logs

**Crawl Configuration:**
Custom JSON rules for crawling operations:
```json
{
  "selectors": {
    "price": ".product-price",
    "name": ".product-title"
  },
  "filters": {
    "minPrice": 10,
    "maxPrice": 1000
  }
}
```

### 5. Analytics Dashboard

**Key Performance Indicators:**
- Total product views
- Total clicks
- Total conversions
- Conversion rate
- Click-through rate (CTR)
- Total searches

**Analytics Views:**

#### Top Performing Products
- Ranked by views
- Shows views, clicks, and conversions
- Performance metrics

#### Top Performing Insurers
- Ranked by total views
- Product count per company
- Aggregate performance

#### Search Trends
- Most searched queries
- Search frequency
- User search behaviour

#### Insurance Type Breakdown
- Distribution by insurance type
- Percentage breakdown
- Visual progress bars

#### Regional Insights
- Top 5 regions by demand
- Search counts by country
- Geographic distribution

**Time Range Filters:**
- Last 24 hours
- Last 7 days
- Last 30 days
- Last 90 days
- All time

## Database Schema

### New Tables

#### insurance_companies
Stores registered insurance company information and verification status.

#### products
Insurance products with pricing, coverage, and AI-generated metadata.

#### product_verifications
Tracks admin verification actions and requested documentation.

#### ai_crawl_logs
Logs all AI crawling operations and their results.

#### search_queries
Records user search behaviour for analytics.

#### analytics_events
Tracks user interactions (views, clicks, conversions).

### Enums

- `user_role_enum`: customer, partner, admin
- `company_status_enum`: pending, approved, rejected, suspended, disabled
- `product_status_enum`: draft, pending, approved, rejected, paused, active, archived
- `insurance_type_enum`: health, auto, life, home, travel, business, pet, other
- `ai_operation_status_enum`: running, completed, failed, paused
- `verification_status_enum`: pending, approved, rejected, additional_docs_required

## Access Control

### Role-Based Access (RBAC)

**Roles:**
- `customer` - Standard users
- `partner` - Insurance company partners
- `admin` - Platform administrators

**Admin Permissions:**
- Full access to all companies and products
- Manage user roles
- Control AI operations
- View all analytics
- Approve/reject submissions
- Suspend accounts

**Partner Permissions:**
- View their own company
- Manage their own products
- View their product analytics

**Customer Permissions:**
- View active/approved products
- Search and compare insurance

### Row-Level Security (RLS)

All tables have RLS policies implemented:
- Admins can view and manage all data
- Partners can only view/edit their own company and products
- Customers can only view approved/active products
- Helper functions: `is_admin()`, `is_partner()`

## Setup Instructions

### 1. Run Database Migration

Apply the migration to create all necessary tables and enums:

```bash
supabase db push
```

The migration file is located at:
`supabase/migrations/20251120000000_admin_dashboard_schema.sql`

### 2. Create Admin User

To promote a user to admin:

1. Sign up a user through the normal authentication flow
2. Run this SQL in Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'USER_ID_HERE';
```

Or using email:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'admin@example.com'
);
```

### 3. Verify Access

1. Log in with the admin account
2. Navigate to the dashboard
3. You should see an "Admin" button in the header
4. Click to access `/admin` route

## Components

### React Components

- **AdminRoute** - Protects admin-only routes (`/src/components/AdminRoute.tsx`)
- **AdminDashboard** - Main dashboard page (`/src/pages/AdminDashboard.tsx`)
- **CompanyManagement** - Company admin UI (`/src/components/admin/CompanyManagement.tsx`)
- **ProductManagement** - Product admin UI (`/src/components/admin/ProductManagement.tsx`)
- **AIOperations** - AI operations panel (`/src/components/admin/AIOperations.tsx`)
- **Analytics** - Analytics dashboard (`/src/components/admin/Analytics.tsx`)

### Hooks

- **useAdmin** - Check admin permissions (`/src/hooks/useAdmin.tsx`)

### Types

All TypeScript types are auto-generated from the database schema in:
`/src/integrations/supabase/types.ts`

## API Integration

### Supabase Client

All data operations use the Supabase client with real-time subscriptions available.

### Edge Functions (Future Enhancement)

Planned Edge Functions for admin operations:
- `admin-approve-company` - Approve company applications
- `admin-approve-product` - Approve product submissions
- `admin-trigger-crawl` - Start AI crawling operations
- `admin-generate-report` - Generate analytics reports

## Security Considerations

### Authentication

- All admin routes require authentication
- AdminRoute component verifies user role
- Session-based authentication via Supabase Auth

### Authorisation

- Row-level security on all database tables
- Helper functions for permission checks
- No direct admin role assignment via UI (must use SQL)

### Data Protection

- Sensitive company documents stored in Supabase Storage
- KYC documents access restricted to admins
- Audit trail for all admin actions (via updated_at, verified_by fields)

### Input Validation

- All forms validate required fields
- JSON parsing for crawl rules
- Type-safe operations with TypeScript

## Future Enhancements

1. **Audit Logging**
   - Track all admin actions
   - Who did what and when
   - Change history

2. **Bulk Operations**
   - Bulk approve/reject products
   - Batch import products
   - Bulk company verification

3. **Advanced Analytics**
   - Revenue tracking
   - Commission calculations
   - Predictive analytics with AI

4. **Notification System**
   - Email alerts for pending approvals
   - Real-time notifications for partners
   - Admin action alerts

5. **Document Management**
   - Upload and verify KYC documents
   - Automated document verification
   - Document expiry tracking

6. **Reporting**
   - Export analytics as CSV/PDF
   - Scheduled reports
   - Custom report builder

7. **Integration Management**
   - API key management
   - Webhook configuration
   - Integration health monitoring

## Troubleshooting

### Admin Access Issues

**Problem:** Admin button not showing
- **Solution:** Verify user role is set to 'admin' in profiles table
- **Check:** Run `SELECT role FROM profiles WHERE id = 'USER_ID'`

**Problem:** "Access Denied" when visiting /admin
- **Solution:** Ensure AdminRoute is properly configured in App.tsx
- **Check:** Verify RLS policies allow admin access

### Data Not Loading

**Problem:** Empty dashboard metrics
- **Solution:** Ensure data exists in respective tables
- **Check:** RLS policies may be blocking data access

**Problem:** Companies/Products not showing
- **Solution:** Verify Supabase connection
- **Check:** Browser console for errors

### Permission Errors

**Problem:** "permission denied for table X"
- **Solution:** Review RLS policies in migration file
- **Check:** Ensure is_admin() function is working

## Support

For issues or questions:
1. Check browser console for errors
2. Review Supabase logs
3. Verify database migration applied correctly
4. Check user role assignment

## Licence

This admin dashboard is part of the Padlock Policy platform.
