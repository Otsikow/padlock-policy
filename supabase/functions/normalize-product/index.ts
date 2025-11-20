import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { product } = await req.json();

    if (!product) {
      throw new Error('Product data is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Use AI to normalize product data across different insurers' terminology
    const prompt = `You are an AI insurance product normalizer. Different insurance companies use different terminology for the same concepts. Your job is to standardize and normalize insurance product data.

Original product data:
${JSON.stringify(product, null, 2)}

Tasks:
1. Normalize the insurer name (standardize company names, remove Ltd, plc, etc.)
2. Standardize the product name (remove marketing fluff, focus on core offering)
3. Classify the policy_type into one of: health, auto, life, home, travel, pet, business, other
4. Extract and normalize premium_amount (convert to monthly if needed)
5. Standardize premium_frequency (monthly, annual, quarterly, one-time)
6. Normalize currency code (GBP, USD, EUR, etc.)
7. Create a clear, jargon-free coverage_summary
8. Extract and structure coverage_limits as JSON object with standardized keys
9. Normalize benefits array (remove duplicates, standardize terminology)
10. Normalize exclusions array (standardize language)
11. Structure add_ons as JSON array with name and price
12. Extract contact_info as JSON (phone, email, address)
13. Identify availability_regions as array of region codes/names
14. Generate ai_summary (2-3 sentences explaining the product simply)
15. Calculate a risk_score (0-100) based on coverage comprehensiveness and exclusions

Important normalization rules:
- Premium amounts should be monthly equivalents
- Policy types must match exactly: health, auto, life, home, travel, pet, business, other
- Benefits and exclusions should be concise, actionable statements
- Coverage limits should use standardized keys like "max_claim_amount", "annual_limit", "per_incident_limit"
- Contact info should include phone, email, address fields
- All monetary values should be numbers, not strings

Return a JSON object with these normalized fields:
{
  "insurer_name": "string",
  "product_name": "string",
  "policy_type": "string",
  "premium_amount": number,
  "premium_frequency": "string",
  "currency": "string",
  "coverage_summary": "string",
  "coverage_limits": {},
  "benefits": [],
  "exclusions": [],
  "add_ons": [],
  "contact_info": {},
  "availability_regions": [],
  "ai_summary": "string",
  "risk_score": number,
  "normalized_terminology": {
    "original_terms": [],
    "standardized_terms": []
  }
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert insurance product analyst specializing in data normalization and standardization. You understand insurance terminology across different providers and can create consistent, comparable product data. Always return valid JSON.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2, // Low temperature for consistent normalization
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const normalizedProduct = JSON.parse(aiResponse.choices[0].message.content);

    // Validate and ensure required fields
    const validatedProduct = {
      insurer_name: normalizedProduct.insurer_name || product.insurer_name || 'Unknown',
      product_name: normalizedProduct.product_name || product.product_name || 'Unnamed Product',
      policy_type: validatePolicyType(normalizedProduct.policy_type || product.policy_type),
      premium_amount: parseFloat(normalizedProduct.premium_amount) || null,
      premium_frequency: normalizedProduct.premium_frequency || 'monthly',
      currency: normalizedProduct.currency || 'GBP',
      coverage_summary: normalizedProduct.coverage_summary || '',
      coverage_limits: normalizedProduct.coverage_limits || {},
      benefits: normalizedProduct.benefits || [],
      exclusions: normalizedProduct.exclusions || [],
      add_ons: normalizedProduct.add_ons || [],
      contact_info: normalizedProduct.contact_info || {},
      availability_regions: normalizedProduct.availability_regions || ['UK'],
      ai_summary: normalizedProduct.ai_summary || '',
      risk_score: Math.min(100, Math.max(0, normalizedProduct.risk_score || 50)),
      normalized_terminology: normalizedProduct.normalized_terminology || {},
      normalization_timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(validatedProduct), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in normalize-product:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function validatePolicyType(type: string | undefined): string {
  const validTypes = ['health', 'auto', 'life', 'home', 'travel', 'pet', 'business', 'other'];

  if (!type) return 'other';

  const normalized = type.toLowerCase().trim();

  // Map common variations
  const typeMap: { [key: string]: string } = {
    'medical': 'health',
    'healthcare': 'health',
    'car': 'auto',
    'vehicle': 'auto',
    'motor': 'auto',
    'automobile': 'auto',
    'property': 'home',
    'house': 'home',
    'homeowners': 'home',
    'dwelling': 'home',
    'term': 'life',
    'whole': 'life',
    'universal': 'life',
    'vacation': 'travel',
    'trip': 'travel',
    'commercial': 'business',
    'liability': 'business',
  };

  // Check direct match
  if (validTypes.includes(normalized)) {
    return normalized;
  }

  // Check mapped variations
  for (const [key, value] of Object.entries(typeMap)) {
    if (normalized.includes(key)) {
      return value;
    }
  }

  return 'other';
}
