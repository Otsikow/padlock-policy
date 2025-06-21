
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { type, data } = await req.json();

    let response;
    switch (type) {
      case 'risk_score':
        response = await analyzeClaimRisk(data, openAIApiKey);
        break;
      case 'policy_summary':
        response = await generatePolicySummary(data, openAIApiKey);
        break;
      case 'chat':
        response = await handleChatMessage(data, openAIApiKey, supabaseClient);
        break;
      default:
        throw new Error('Invalid analysis type');
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function analyzeClaimRisk(claimData: any, apiKey: string) {
  const prompt = `Analyze this insurance claim for risk factors and provide a risk score from 0-100:
  
Claim Details:
- Policy Type: ${claimData.policy_type}
- Claim Reason: ${claimData.claim_reason}
- Claim Amount: $${claimData.claim_amount || 'Not specified'}
- Additional Context: ${claimData.context || 'None'}

Please provide:
1. A risk score (0-100, where 0 is low risk and 100 is high risk)
2. A list of risk factors identified
3. Brief explanation of the assessment

Format your response as JSON with: {"risk_score": number, "risk_factors": ["factor1", "factor2"], "explanation": "text"}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert insurance claims analyst. Provide accurate risk assessments based on claim details.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch {
    return {
      risk_score: 50,
      risk_factors: ['Unable to parse AI response'],
      explanation: content
    };
  }
}

async function generatePolicySummary(policyData: any, apiKey: string) {
  const prompt = `Generate a comprehensive but easy-to-understand summary of this insurance policy:

Policy Details:
- Type: ${policyData.policy_type}
- Premium: $${policyData.premium_amount}/month
- Coverage Period: ${policyData.start_date} to ${policyData.end_date}
- Coverage Summary: ${policyData.coverage_summary || 'Not provided'}
- Document Content: ${policyData.document_content || 'Not provided'}

Please provide:
1. A clear AI summary of what this policy covers
2. Key benefits and limitations
3. Important fine print details in plain English

Format as JSON with: {"ai_summary": "text", "fine_print_summary": "text"}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert insurance advisor. Explain complex policy terms in simple, clear language that anyone can understand.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch {
    return {
      ai_summary: content,
      fine_print_summary: 'AI summary generated successfully'
    };
  }
}

async function handleChatMessage(chatData: any, apiKey: string, supabase: any) {
  const { message, conversation_id, user_policies } = chatData;

  // Get conversation history
  const { data: messages } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('conversation_id', conversation_id)
    .order('created_at', { ascending: true });

  const conversationHistory = messages || [];
  
  // Build context about user's policies
  const policyContext = user_policies?.map((p: any) => 
    `${p.policy_type} insurance: $${p.premium_amount}/month, covers ${p.coverage_summary || 'standard coverage'}`
  ).join('\n') || 'No policies on file';

  const systemPrompt = `You are a helpful insurance assistant. The user has the following policies:
${policyContext}

Answer questions about insurance coverage, claims, policies, and general insurance advice. Be helpful, accurate, and conversational.`;

  const chatMessages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: message }
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: chatMessages,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const assistantMessage = data.choices[0].message.content;

  // Save messages to database
  await supabase.from('chat_messages').insert([
    { conversation_id, role: 'user', content: message },
    { conversation_id, role: 'assistant', content: assistantMessage }
  ]);

  return { message: assistantMessage };
}
