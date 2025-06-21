
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
    const { type, data } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let prompt = '';
    let systemMessage = '';

    switch (type) {
      case 'risk_score':
        systemMessage = 'You are an AI insurance risk assessor. Analyze the claim data and provide a risk score (0-100) and identify risk factors.';
        prompt = `Analyze this insurance claim and provide a JSON response with:
        - risk_score: number between 0-100 (0 = low risk, 100 = high risk)
        - risk_factors: array of strings describing specific risk factors
        
        Claim data:
        Policy Type: ${data.policy_type}
        Claim Reason: ${data.claim_reason}
        Claim Amount: ${data.claim_amount || 'Not specified'}
        Additional Context: ${data.context || 'None'}
        
        Consider factors like claim amount relative to typical claims, unusual circumstances, timing, and policy type.`;
        break;

      case 'policy_summary':
        systemMessage = 'You are an AI insurance expert that explains complex insurance policies in simple terms.';
        prompt = `Analyze this insurance policy and provide a JSON response with:
        - ai_summary: a clear, concise summary of the policy coverage in plain English
        - fine_print_summary: key important details, limitations, and exclusions explained simply
        
        Policy data:
        Type: ${data.policy_type}
        Premium: $${data.premium_amount}/month
        Coverage Period: ${data.start_date} to ${data.end_date}
        Coverage Summary: ${data.coverage_summary || 'Standard coverage'}
        Document Content: ${data.document_content || 'Not available'}
        
        Focus on what the policy covers, what it doesn't cover, and any important conditions.`;
        break;

      case 'extract_policy_number':
        systemMessage = 'You are an AI document analyzer that extracts policy numbers from insurance documents.';
        prompt = `Extract the policy number from this insurance document text. Look for patterns like:
        - Policy Number: [number]
        - Policy #: [number]  
        - Certificate Number: [number]
        - Contract Number: [number]
        
        Document text: ${data.document_text}
        
        Return a JSON response with:
        - policy_number: the extracted policy number (string) or null if not found
        - confidence: number between 0-1 indicating confidence in the extraction`;
        break;

      case 'chat':
        systemMessage = `You are an AI insurance assistant. You help users understand their insurance policies and answer questions about coverage. 
        
        User's policies:
        ${data.user_policies.map((p: any) => `- ${p.policy_type} insurance: $${p.premium_amount}/month, coverage: ${p.coverage_summary || 'Standard coverage'}`).join('\n')}`;
        
        prompt = data.message;
        break;

      default:
        throw new Error('Unknown analysis type');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;

    // For chat responses, return the content directly
    if (type === 'chat') {
      // Store the message in the database
      if (data.conversation_id) {
        await supabase.from('chat_messages').insert([
          { conversation_id: data.conversation_id, role: 'user', content: data.message },
          { conversation_id: data.conversation_id, role: 'assistant', content: content }
        ]);
      }
      
      return new Response(JSON.stringify({ content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For other types, try to parse as JSON
    let result;
    try {
      result = JSON.parse(content);
    } catch {
      // If not valid JSON, return the content wrapped in an object
      result = { content };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI analysis:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
