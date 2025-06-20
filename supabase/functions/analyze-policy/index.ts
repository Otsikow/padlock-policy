
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
    console.log('Analyze policy function called');
    
    const { documentText, policyId } = await req.json();
    console.log('Request data:', { policyId, hasDocumentText: !!documentText });

    if (!policyId) {
      throw new Error('Policy ID is required');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    // If no document text is provided, we'll analyze what we can from the policy record
    let textToAnalyze = documentText;
    
    if (!textToAnalyze) {
      console.log('No document text provided, will analyze available policy data');
      textToAnalyze = "No document text available for analysis";
    }

    // AI prompt to extract policy information
    const prompt = `
      You are an AI assistant specialized in analyzing insurance policy documents. 
      Extract the following information from the provided text and return it as a JSON object.
      If specific information is not available, return null for that field.

      Expected JSON format:
      {
        "insurer_name": "Name of the insurance company",
        "policy_type": "health|auto|life|home|other",
        "coverage_limits": "Maximum coverage amounts",
        "premium_amount": "Monthly or annual premium (number only, no currency symbols)",
        "exclusions": "Key exclusions or limitations",
        "renewal_date": "Policy renewal/expiration date (YYYY-MM-DD format)",
        "deductible": "Deductible amount if mentioned",
        "coverage_summary": "Brief summary of what's covered",
        "policy_number": "Policy number if available"
      }

      Document text to analyze:
      ${textToAnalyze}
    `;

    console.log('Calling OpenAI API...');
    
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
            content: 'You are an expert insurance policy analyzer. Always return valid JSON responses only, no additional text.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();
    console.log('OpenAI response received');
    
    const analysisText = aiResponse.choices[0].message.content;
    console.log('AI analysis text:', analysisText);
    
    // Parse the JSON response from AI
    let extractedData;
    try {
      // Clean the response in case there's extra text
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : analysisText;
      extractedData = JSON.parse(jsonString);
      console.log('Extracted data:', extractedData);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', analysisText);
      // Return a basic analysis result
      extractedData = {
        coverage_summary: "AI analysis completed - manual review recommended",
        policy_type: null,
        premium_amount: null
      };
    }

    // Update the policy in the database with extracted information
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const updateData: any = {};
    const updatedFields: string[] = [];
    
    if (extractedData.coverage_summary && extractedData.coverage_summary !== "AI analysis completed - manual review recommended") {
      updateData.coverage_summary = extractedData.coverage_summary;
      updatedFields.push('coverage_summary');
    }
    
    if (extractedData.premium_amount && !isNaN(Number(extractedData.premium_amount))) {
      updateData.premium_amount = Number(extractedData.premium_amount);
      updatedFields.push('premium_amount');
    }
    
    if (extractedData.renewal_date && extractedData.renewal_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      updateData.end_date = extractedData.renewal_date;
      updatedFields.push('end_date');
    }

    if (extractedData.policy_type && 
        ['health', 'auto', 'life', 'home', 'other'].includes(extractedData.policy_type)) {
      updateData.policy_type = extractedData.policy_type;
      updatedFields.push('policy_type');
    }

    console.log('Updating policy with data:', updateData);

    // Update the policy with extracted information
    const { error: updateError } = await supabase
      .from('policies')
      .update(updateData)
      .eq('id', policyId);

    if (updateError) {
      console.error('Error updating policy:', updateError);
      throw new Error('Failed to update policy with extracted data');
    }

    console.log('Policy updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedData,
        updatedFields: updatedFields.length > 0 ? updatedFields : ['analysis_completed']
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
