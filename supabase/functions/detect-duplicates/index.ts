import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { product_id } = await req.json();

    if (!product_id) {
      throw new Error('product_id is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the product
    const { data: product, error: productError } = await supabase
      .from('product_catalog')
      .select('*')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      throw new Error(`Product not found: ${productError?.message}`);
    }

    // Get potential duplicates from the same insurer with same policy type
    const { data: candidates, error: candidatesError } = await supabase
      .from('product_catalog')
      .select('*')
      .eq('insurer_name', product.insurer_name)
      .eq('policy_type', product.policy_type)
      .neq('id', product_id)
      .eq('status', 'active');

    if (candidatesError) {
      throw new Error(`Failed to fetch candidates: ${candidatesError.message}`);
    }

    if (!candidates || candidates.length === 0) {
      return new Response(JSON.stringify({ duplicates: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use AI to detect duplicates
    const duplicates = await detectDuplicatesWithAI(product, candidates);

    // Store duplicate detections in database
    for (const duplicate of duplicates) {
      if (duplicate.similarity_score >= 70) { // Only store high-confidence duplicates
        // Check if detection already exists
        const { data: existing } = await supabase
          .from('duplicate_detections')
          .select('id')
          .eq('product_id', product_id)
          .eq('duplicate_product_id', duplicate.product_id)
          .single();

        if (!existing) {
          await supabase.from('duplicate_detections').insert({
            product_id,
            duplicate_product_id: duplicate.product_id,
            similarity_score: duplicate.similarity_score,
            matching_fields: duplicate.matching_fields,
            ai_confidence: duplicate.ai_confidence,
            status: 'pending',
          });

          // Mark the product as potential duplicate
          if (duplicate.similarity_score >= 90) {
            await supabase
              .from('product_catalog')
              .update({
                is_duplicate: true,
                duplicate_of: duplicate.product_id,
              })
              .eq('id', product_id);
          }
        }
      }
    }

    return new Response(JSON.stringify({
      duplicates,
      count: duplicates.length,
      high_confidence_duplicates: duplicates.filter(d => d.similarity_score >= 90).length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in detect-duplicates:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function detectDuplicatesWithAI(product: any, candidates: any[]): Promise<any[]> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

  if (!openAIApiKey) {
    // Fallback to simple matching if no API key
    return detectDuplicatesSimple(product, candidates);
  }

  const duplicates = [];

  // Process candidates in batches to avoid token limits
  for (const candidate of candidates) {
    try {
      const prompt = `You are an AI duplicate detector for insurance products. Analyze these two products and determine if they are duplicates (same product posted multiple times).

Product A:
${JSON.stringify({
  product_name: product.product_name,
  insurer_name: product.insurer_name,
  policy_type: product.policy_type,
  premium_amount: product.premium_amount,
  premium_frequency: product.premium_frequency,
  coverage_summary: product.coverage_summary,
  benefits: product.benefits,
  external_id: product.external_id,
}, null, 2)}

Product B:
${JSON.stringify({
  product_name: candidate.product_name,
  insurer_name: candidate.insurer_name,
  policy_type: candidate.policy_type,
  premium_amount: candidate.premium_amount,
  premium_frequency: candidate.premium_frequency,
  coverage_summary: candidate.coverage_summary,
  benefits: candidate.benefits,
  external_id: candidate.external_id,
}, null, 2)}

Analyze:
1. Are these the same product? (Consider product name variations, identical coverage, same pricing)
2. What fields match exactly?
3. What is your confidence level?

Return JSON:
{
  "is_duplicate": boolean,
  "similarity_score": number (0-100, where 100 is identical),
  "matching_fields": string[] (list of fields that match),
  "ai_confidence": number (0-100),
  "reasoning": "brief explanation"
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
              content: 'You are an expert at detecting duplicate insurance products. Be strict - only mark as duplicates if you are highly confident they are the exact same product. Minor variations in wording or pricing might indicate different product tiers.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1, // Very low temperature for consistent duplicate detection
          response_format: { type: "json_object" },
        }),
      });

      if (response.ok) {
        const aiResponse = await response.json();
        const result = JSON.parse(aiResponse.choices[0].message.content);

        if (result.is_duplicate && result.similarity_score >= 70) {
          duplicates.push({
            product_id: candidate.id,
            product_name: candidate.product_name,
            similarity_score: result.similarity_score,
            matching_fields: result.matching_fields,
            ai_confidence: result.ai_confidence,
            reasoning: result.reasoning,
          });
        }
      }
    } catch (error) {
      console.error('Error processing candidate:', error);
      // Continue with next candidate
    }
  }

  return duplicates;
}

function detectDuplicatesSimple(product: any, candidates: any[]): any[] {
  const duplicates = [];

  for (const candidate of candidates) {
    const matchingFields = [];
    let matchScore = 0;

    // Check product name similarity
    if (normalizeString(product.product_name) === normalizeString(candidate.product_name)) {
      matchingFields.push('product_name');
      matchScore += 30;
    }

    // Check insurer (should already match from query)
    if (product.insurer_name === candidate.insurer_name) {
      matchingFields.push('insurer_name');
      matchScore += 20;
    }

    // Check premium amount
    if (product.premium_amount && candidate.premium_amount) {
      const priceDiff = Math.abs(product.premium_amount - candidate.premium_amount);
      if (priceDiff < 1) { // Less than £1 difference
        matchingFields.push('premium_amount');
        matchScore += 25;
      }
    }

    // Check coverage summary similarity
    if (product.coverage_summary && candidate.coverage_summary) {
      const similarity = calculateStringSimilarity(
        normalizeString(product.coverage_summary),
        normalizeString(candidate.coverage_summary)
      );
      if (similarity > 0.8) {
        matchingFields.push('coverage_summary');
        matchScore += 25;
      }
    }

    // Check external ID
    if (product.external_id === candidate.external_id) {
      matchingFields.push('external_id');
      matchScore += 40; // High weight for external ID match
    }

    if (matchScore >= 70) {
      duplicates.push({
        product_id: candidate.id,
        product_name: candidate.product_name,
        similarity_score: Math.min(100, matchScore),
        matching_fields: matchingFields,
        ai_confidence: 60, // Lower confidence for simple matching
        reasoning: 'Simple field matching',
      });
    }
  }

  return duplicates;
}

function normalizeString(str: string | null | undefined): string {
  if (!str) return '';
  return str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}
