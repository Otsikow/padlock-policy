# Role-Based Access Control (RBAC) Security System

## Overview

This document describes the secure role-based access control system implemented for the Padlock Policy platform. The system uses server-side validation with PostgreSQL SECURITY DEFINER functions and Row Level Security (RLS) policies to ensure that role checks cannot be bypassed by client-side manipulation.

## Architecture

### Key Components

1. **user_roles table**: Primary source of truth for role assignments
2. **SECURITY DEFINER functions**: Server-side role validation functions
3. **RLS Policies**: Row-level security on all sensitive tables
4. **React Hooks**: Client-side helpers for role checking
5. **TypeScript Types**: Type-safe role definitions

## Database Schema

### user_roles Table

The `user_roles` table stores all role assignments with full audit trail support:

```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role_enum NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, is_active)
);
```

**Key Features:**
- Audit trail (who assigned, when)
- Role expiration support
- Metadata for additional permissions
- Automatic change logging
- RLS policies prevent unauthorized access

## Available Roles

```typescript
type UserRole =
  | "customer"              // Regular customer users
  | "insurance_company"     // Insurance company representatives
  | "partner"               // Business partners
  | "admin"                 // System administrators
  | "claims_processor"      // AI claims processing staff
  | "claims_reviewer"       // Claims review/approval staff
```

## SECURITY DEFINER Functions

All role checks MUST use these server-side functions. Never query the database directly from client code for role verification.

### 1. has_role()

Check if a user has a specific role.

```sql
-- Check specific user
SELECT has_role('user-uuid-here'::UUID, 'admin'::user_role_enum);

-- Check current user
SELECT has_role('admin'::user_role_enum);
```

**TypeScript/JavaScript Usage:**

```typescript
const { data: hasAdminRole } = await supabase
  .rpc('has_role', { check_role: 'admin' });

if (hasAdminRole) {
  // User has admin role
}
```

### 2. is_admin()

Check if a user is an administrator.

```sql
-- Check specific user
SELECT is_admin('user-uuid-here'::UUID);

-- Check current user
SELECT is_admin();
```

**TypeScript/JavaScript Usage:**

```typescript
const { data: isAdmin } = await supabase.rpc('is_admin');

if (isAdmin) {
  // User is an admin
}
```

### 3. can_process_claims()

Check if a user can process insurance claims (claims_processor, claims_reviewer, or admin).

```typescript
const { data: canProcess } = await supabase.rpc('can_process_claims');
```

### 4. can_review_claims()

Check if a user can review/approve claims (claims_reviewer or admin).

```typescript
const { data: canReview } = await supabase.rpc('can_review_claims');
```

### 5. get_user_roles()

Get all active roles for a user.

```typescript
const { data: roles } = await supabase.rpc('get_user_roles');
// Returns: [{ role: 'admin' }, { role: 'claims_reviewer' }]
```

## React Hooks

### useRole()

The primary hook for role checking in React components:

```typescript
import { useRole } from '@/hooks/useRole';

function MyComponent() {
  const {
    isAdmin,
    canProcessClaims,
    canReviewClaims,
    roles,
    loading,
    hasRole,
    refreshRoles
  } = useRole();

  // Check specific role
  const checkCustomRole = async () => {
    const hasRole = await hasRole('partner');
    if (hasRole) {
      // User has partner role
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      {isAdmin && <AdminPanel />}
      {canProcessClaims && <ClaimsProcessor />}
      {canReviewClaims && <ClaimsReviewer />}
    </div>
  );
}
```

### useRequireAdmin()

Protect admin-only pages with automatic redirect:

```typescript
import { useRequireAdmin } from '@/hooks/useRole';

function AdminPage() {
  const { isAuthorized, loading } = useRequireAdmin('/dashboard');

  if (loading) return <Loader />;
  if (!isAuthorized) return null; // Will redirect automatically

  return <AdminContent />;
}
```

### useRequireClaimsAccess()

Protect claims processing pages:

```typescript
import { useRequireClaimsAccess } from '@/hooks/useRole';

function ClaimsPage() {
  const { isAuthorized, loading } = useRequireClaimsAccess('/dashboard');

  if (loading) return <Loader />;
  if (!isAuthorized) return null;

  return <ClaimsContent />;
}
```

## Edge Functions (Server-Side)

Always use RPC functions in Edge Functions for role verification:

```typescript
import { createClient } from '@supabase/supabase-js';

export async function handler(req: Request) {
  const supabase = createClient(url, serviceKey);

  // Get authenticated user
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);

  // Verify admin access
  const { data: isAdmin } = await supabase.rpc('is_admin', {
    user_id: user.id
  });

  if (!isAdmin) {
    return new Response('Forbidden', { status: 403 });
  }

  // Proceed with admin operation
  // ...
}
```

## Row Level Security (RLS) Policies

### Profiles Table

The profiles table now has RLS enabled with these policies:

- Users can view their own profile
- Users can update their own profile (but NOT role fields)
- Admins can view all profiles
- Admins can update all profiles
- All authenticated users can view basic profile info

### user_roles Table

- Users can view their own role assignments
- Only admins can view all role assignments
- Only admins can insert/update/delete role assignments

## Security Best Practices

### ✅ DO

1. **Always use RPC functions for role checks**
   ```typescript
   // ✅ CORRECT
   const { data: isAdmin } = await supabase.rpc('is_admin');
   ```

2. **Use React hooks for client-side checks**
   ```typescript
   // ✅ CORRECT
   const { isAdmin } = useRole();
   ```

3. **Verify roles in Edge Functions**
   ```typescript
   // ✅ CORRECT
   const { data: isAdmin } = await supabase.rpc('is_admin', { user_id });
   if (!isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });
   ```

4. **Trust RLS policies for data access**
   - The database automatically filters data based on user roles
   - No need to add WHERE clauses for role-based filtering

### ❌ DON'T

1. **Never query profiles table directly for role checks**
   ```typescript
   // ❌ WRONG - Can be bypassed!
   const { data } = await supabase
     .from('profiles')
     .select('role')
     .eq('id', userId);
   ```

2. **Never perform role checks only on client side**
   ```typescript
   // ❌ WRONG - Client-side only, not secure!
   if (userRole === 'admin') {
     // Perform sensitive operation
   }
   ```

3. **Never bypass RPC functions**
   ```typescript
   // ❌ WRONG - Direct table access
   const { data } = await supabase
     .from('user_roles')
     .select('role')
     .eq('user_id', userId);
   ```

## Assigning Roles

### Via Database (Admins Only)

```sql
-- Assign a role to a user
INSERT INTO public.user_roles (user_id, role, assigned_by)
VALUES ('user-uuid', 'claims_processor', 'admin-uuid');

-- Assign a temporary role (expires in 30 days)
INSERT INTO public.user_roles (user_id, role, assigned_by, expires_at)
VALUES ('user-uuid', 'claims_reviewer', 'admin-uuid', now() + interval '30 days');

-- Deactivate a role
UPDATE public.user_roles
SET is_active = false
WHERE user_id = 'user-uuid' AND role = 'claims_processor';
```

### Via API (Future Implementation)

An admin API endpoint should be created for role management:

```typescript
// POST /api/admin/roles/assign
{
  "user_id": "uuid",
  "role": "claims_processor",
  "expires_at": "2024-12-31T23:59:59Z",  // optional
  "metadata": {
    "permissions": ["view_claims", "edit_claims"]
  }
}
```

## Audit Trail

All role changes are automatically logged in the `audit_logs` table:

```sql
SELECT * FROM audit_logs
WHERE table_name = 'user_roles'
ORDER BY created_at DESC;
```

This provides:
- Who made the change (user_id)
- What changed (old_data, new_data)
- When it changed (created_at)
- What action (INSERT, UPDATE, DELETE)

## Migration Guide

### Migrating Existing Code

**Before (Insecure):**
```typescript
// Client-side role check
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (profile.role === 'admin') {
  // Show admin features
}
```

**After (Secure):**
```typescript
// Server-side role check via RPC
const { data: isAdmin } = await supabase.rpc('is_admin');

if (isAdmin) {
  // Show admin features
}

// Or use the React hook
const { isAdmin } = useRole();
if (isAdmin) {
  // Show admin features
}
```

## Testing

### Testing Role Checks

```typescript
import { createClient } from '@supabase/supabase-js';

describe('Role Security', () => {
  it('should verify admin access via RPC', async () => {
    const supabase = createClient(url, anonKey);

    // Sign in as admin
    await supabase.auth.signInWithPassword({
      email: 'admin@test.com',
      password: 'password'
    });

    // Check admin status
    const { data: isAdmin } = await supabase.rpc('is_admin');
    expect(isAdmin).toBe(true);
  });

  it('should deny non-admin access', async () => {
    const supabase = createClient(url, anonKey);

    // Sign in as regular user
    await supabase.auth.signInWithPassword({
      email: 'user@test.com',
      password: 'password'
    });

    const { data: isAdmin } = await supabase.rpc('is_admin');
    expect(isAdmin).toBe(false);
  });
});
```

## Troubleshooting

### "permission denied for function has_role"

Make sure the function has proper grants:

```sql
GRANT EXECUTE ON FUNCTION public.has_role(UUID, user_role_enum) TO authenticated;
```

### "RLS policy violation"

Check that:
1. RLS is enabled on the table
2. Appropriate policies exist
3. User is authenticated
4. User has the required role

### Role not updating immediately

Call `refreshRoles()` from the `useRole()` hook:

```typescript
const { refreshRoles } = useRole();

// After role change
await refreshRoles();
```

## Performance Considerations

1. **Caching**: The `useRole()` hook caches role information to avoid repeated RPC calls
2. **Parallel Queries**: Multiple role checks are performed in parallel for better performance
3. **Indexes**: All role tables have appropriate indexes for fast lookups
4. **RLS Performance**: RLS policies use indexed columns for optimal performance

## Security Checklist

- [x] All role checks use SECURITY DEFINER functions
- [x] RLS enabled on all sensitive tables
- [x] No client-side only role validation
- [x] Audit logging for all role changes
- [x] Proper grants on all functions
- [x] Role expiration support
- [x] Backward compatibility with existing roles
- [x] TypeScript type safety
- [x] React hooks for easy integration
- [x] Edge Function examples

## Support

For questions or issues related to the RBAC system, please:

1. Check this documentation
2. Review the migration file: `20251120040000_secure_role_based_access_control.sql`
3. Check the implementation in `/src/hooks/useRole.tsx`
4. Open an issue on GitHub

## License

This security system is part of the Padlock Policy platform and follows the same license terms.
