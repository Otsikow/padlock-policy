import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

/**
 * Common validation schemas and utilities for Supabase Edge Functions
 */

// ============================================
// Common Schemas
// ============================================

export const emailSchema = z.string().email().max(255);

export const urlSchema = z.string().url().max(2000);

export const uuidSchema = z.string().uuid();

export const phoneSchema = z.string().min(5).max(20).regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/);

export const currencySchema = z.string().length(3).regex(/^[A-Z]{3}$/);

export const policyTypeSchema = z.enum(['health', 'auto', 'life', 'home', 'other']);

export const billingFrequencySchema = z.enum(['monthly', 'quarterly', 'annually']);

export const documentTypeSchema = z.enum(['policy', 'receipt', 'id', 'claim', 'other']);

// ============================================
// Policy Management Schemas
// ============================================

export const switchPolicyQuerySchema = z.object({
  from_policy_id: uuidSchema,
  redirect_url: urlSchema.optional(),
});

export const cancelPolicyQuerySchema = z.object({
  policy_id: uuidSchema,
  redirect_url: urlSchema.optional(),
});

export const analyzePolicyBodySchema = z.object({
  policyId: uuidSchema,
  documentText: z.string().max(50000).optional(),
  documentUrl: urlSchema.optional(),
}).refine(
  (data) => data.documentText || data.documentUrl,
  {
    message: "Either documentText or documentUrl must be provided",
  }
);

// ============================================
// Checkout & Payment Schemas
// ============================================

export const createCheckoutBodySchema = z.object({
  type: z.enum(['subscription', 'payment']),
  planId: z.string().min(1).max(100).optional(),
  currency: currencySchema,
  amount: z.number().positive().min(0.01).max(1000000),
  service: z.string().min(1).max(200).optional(),
}).refine(
  (data) => {
    if (data.type === 'subscription') return !!data.planId;
    if (data.type === 'payment') return !!data.service;
    return true;
  },
  {
    message: "planId is required for subscriptions, service is required for payments",
  }
);

// ============================================
// Product Management Schemas
// ============================================

export const productCreateBodySchema = z.object({
  product_name: z.string().min(1).max(200),
  product_code: z.string().min(1).max(50).optional(),
  policy_type: policyTypeSchema,
  description: z.string().max(5000).optional(),
  coverage_details: z.record(z.any()).optional(),
  premium_amount: z.number().positive().min(0).max(1000000),
  currency: currencySchema.default('GBP'),
  billing_frequency: billingFrequencySchema.default('monthly'),
  coverage_limits: z.record(z.any()).optional(),
  deductible: z.number().min(0).max(1000000).optional(),
  benefits: z.record(z.any()).optional(),
  exclusions: z.record(z.any()).optional(),
  available_countries: z.array(z.string().length(2)).optional(),
  minimum_age: z.number().int().min(0).max(150).optional(),
  maximum_age: z.number().int().min(0).max(150).optional(),
  product_image_url: urlSchema.optional(),
  brochure_url: urlSchema.optional(),
  terms_url: urlSchema.optional(),
  search_keywords: z.array(z.string().max(100)).optional(),
  ai_tags: z.array(z.string().max(100)).optional(),
});

export const productUpdateBodySchema = z.object({
  product_id: uuidSchema,
  product_name: z.string().min(1).max(200).optional(),
  product_code: z.string().min(1).max(50).optional(),
  policy_type: policyTypeSchema.optional(),
  description: z.string().max(5000).optional(),
  coverage_details: z.record(z.any()).optional(),
  premium_amount: z.number().positive().min(0).max(1000000).optional(),
  currency: currencySchema.optional(),
  billing_frequency: billingFrequencySchema.optional(),
  coverage_limits: z.record(z.any()).optional(),
  deductible: z.number().min(0).max(1000000).optional(),
  benefits: z.record(z.any()).optional(),
  exclusions: z.record(z.any()).optional(),
  is_active: z.boolean().optional(),
  available_countries: z.array(z.string().length(2)).optional(),
  minimum_age: z.number().int().min(0).max(150).optional(),
  maximum_age: z.number().int().min(0).max(150).optional(),
  product_image_url: urlSchema.optional(),
  brochure_url: urlSchema.optional(),
  terms_url: urlSchema.optional(),
  search_keywords: z.array(z.string().max(100)).optional(),
  ai_tags: z.array(z.string().max(100)).optional(),
  popularity_score: z.number().min(0).max(100).optional(),
});

export const productSearchSchema = z.object({
  policy_type: policyTypeSchema.optional(),
  company_id: uuidSchema.optional(),
  min_premium: z.number().min(0).optional(),
  max_premium: z.number().min(0).max(1000000).optional(),
  currency: currencySchema.optional(),
  country: z.string().length(2).optional(),
  age: z.number().int().min(0).max(150).optional(),
  search_term: z.string().max(200).optional(),
  page: z.number().int().positive().default(1),
  per_page: z.number().int().positive().max(100).default(20),
  sort_by: z.enum(['premium_amount', 'popularity_score', 'created_at']).default('popularity_score'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================
// AI & Document Schemas
// ============================================

export const aiAnalysisBodySchema = z.object({
  type: z.enum(['risk_score', 'policy_summary', 'extract_policy_number', 'chat']),
  data: z.record(z.any()),
});

export const documentUploadBodySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  document_type: documentTypeSchema,
  document_category: z.string().max(100).optional(),
  file_url: urlSchema,
  file_size: z.number().int().positive().max(100 * 1024 * 1024).optional(), // Max 100MB
  encrypt: z.boolean().default(false),
});

export const aiProductIngestBodySchema = z.object({
  source_url: urlSchema,
  company_name: z.string().min(1).max(200).optional(),
  product_data: z.object({
    product_name: z.string().max(200).optional(),
    policy_type: policyTypeSchema.optional(),
    premium_amount: z.number().positive().optional(),
    description: z.string().max(5000).optional(),
  }).passthrough().optional(),
});

// ============================================
// Company Management Schemas
// ============================================

export const companyOnboardBodySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  logo_url: urlSchema.optional(),
  website: urlSchema.optional(),
  contact_email: emailSchema,
  contact_phone: phoneSchema.optional(),
  address: z.string().max(500).optional(),
  country: z.string().length(2).optional(),
  business_registration_number: z.string().max(100).optional(),
  license_number: z.string().max(100).optional(),
  regulatory_body: z.string().max(200).optional(),
});

export const companyActivationEmailBodySchema = z.object({
  companyId: uuidSchema,
  status: z.enum(['approved', 'rejected']),
});

// ============================================
// Data Ingestion Schemas
// ============================================

export const dataIngestionBodySchema = z.object({
  action: z.enum(['start_ingestion', 'get_job_status', 'list_sources', 'cancel_job']),
  data_source_id: uuidSchema.optional(),
  job_id: uuidSchema.optional(),
  job_type: z.enum(['scheduled', 'manual', 'webhook']).optional(),
}).refine(
  (data) => {
    if (data.action === 'start_ingestion') return !!data.data_source_id;
    if (data.action === 'get_job_status' || data.action === 'cancel_job') return !!data.job_id;
    return true;
  },
  {
    message: "Required field missing for the specified action",
  }
);

// ============================================
// Validation Helper Functions
// ============================================

export interface ValidationError {
  field?: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

/**
 * Validates data against a Zod schema and returns a standardized result
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const parsed = schema.parse(data);
    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      errors: [{ message: 'Validation failed' }],
    };
  }
}

/**
 * Creates a standardized error response for validation failures
 */
export function createValidationErrorResponse(
  errors: ValidationError[],
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error: 'Validation failed',
      details: errors,
    }),
    {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Parses and validates query parameters from a URL
 */
export function validateQueryParams<T>(
  url: URL,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return validate(schema, params);
}

/**
 * Parses and validates JSON body from a request
 */
export async function validateJsonBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const body = await req.json();
    return validate(schema, body);
  } catch (error) {
    return {
      success: false,
      errors: [{ message: 'Invalid JSON body' }],
    };
  }
}
