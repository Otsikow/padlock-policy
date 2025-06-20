
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentText, policyId } = await req.json();

    if (!documentText || !policyId) {
      throw new Error('Document text and policy ID are required');
    }

    // AI prompt to extract policy information
    const prompt = `
      You are an AI assistant specialized in analyzing insurance policy documents. 
      Extract the following information from the provided insurance policy text and return it as a JSON object:

      {
        "insurer_name": "Name of the insurance company",
        "policy_type": "health|auto|life|home|other",
        "coverage_limits": "Maximum coverage amounts",
        "premium_amount": "Monthly or annual premium (return as number only)",
        "exclusions": "Key exclusions or limitations",
        "renewal_date": "Policy renewal/expiration date (YYYY-MM-DD format)",
        "deductible": "Deductible amount if mentioned",
        "coverage_summary": "Brief summary of what's covered",
        "policy_number": "Policy number if available"
      }

      If any information is not available in the document, return null for that field.
      Be precise and extract only information that is clearly stated in the document.

      Policy Document Text:
      ${documentText}
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert insurance policy analyzer. Always return valid JSON responses.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.choices[0].message.content;
    
    // Parse the JSON response from AI
    let extractedData;
    try {
      extractedData = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', analysisText);
      throw new Error('AI response was not valid JSON');
    }

    // Update the policy in the database with extracted information
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const updateData: any = {};
    
    if (extractedData.coverage_summary) {
      updateData.coverage_summary = extractedData.coverage_summary;
    }
    
    if (extractedData.premium_amount && !isNaN(Number(extractedData.premium_amount))) {
      updateData.premium_amount = Number(extractedData.premium_amount);
    }
    
    if (extractedData.renewal_date) {
      updateData.end_date = extractedData.renewal_date;
    }

    if (extractedData.policy_type && 
        ['health', 'auto', 'life', 'home', 'other'].includes(extractedData.policy_type)) {
      updateData.policy_type = extractedData.policy_type;
    }

    // Update the policy with extracted information
    const { error: updateError } = await supabase
      .from('policies')
      .update(updateData)
      .eq('id', policyId);

    if (updateError) {
      console.error('Error updating policy:', updateError);
      throw new Error('Failed to update policy with extracted data');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedData,
        updatedFields: Object.keys(updateData)
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-policy function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }), 
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
