
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

// Simple PDF text extraction function
async function extractTextFromPDF(pdfUrl: string): Promise<string> {
  try {
    console.log('Attempting to extract text from PDF:', pdfUrl);
    
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Simple text extraction - look for readable text patterns
    const decoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: false });
    const pdfString = decoder.decode(uint8Array);
    
    // Extract text between common PDF text markers
    let extractedText = '';
    
    // Look for text streams and patterns
    const textPatterns = [
      /\((.*?)\)/g,  // Text in parentheses
      /\[(.*?)\]/g,  // Text in brackets
      /BT\s*(.*?)\s*ET/gs,  // BT/ET blocks
    ];
    
    textPatterns.forEach(pattern => {
      const matches = pdfString.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.replace(/[()[\]BT ET]/g, '').trim();
          if (cleaned.length > 3 && /[a-zA-Z]/.test(cleaned)) {
            extractedText += cleaned + ' ';
          }
        });
      }
    });
    
    // Fallback: extract readable ASCII text
    if (extractedText.length < 100) {
      const readableText = pdfString
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .split(' ')
        .filter(word => word.length > 2 && /[a-zA-Z]/.test(word))
        .join(' ');
      
      if (readableText.length > extractedText.length) {
        extractedText = readableText;
      }
    }
    
    console.log('Extracted text length:', extractedText.length);
    return extractedText.substring(0, 8000); // Limit text length
    
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Analyze policy function called');
    
    const { documentText, policyId, documentUrl } = await req.json();
    console.log('Request data:', { 
      policyId, 
      hasDocumentText: !!documentText, 
      documentLength: documentText?.length,
      hasDocumentUrl: !!documentUrl 
    });

    if (!policyId) {
      throw new Error('Policy ID is required');
    }

    if (!openAIApiKey) {
      console.error('OpenAI API key is not configured');
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key is not configured. Please add your OpenAI API key to the Supabase Edge Function secrets.',
          success: false 
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let textToAnalyze = documentText;
    
    // If no document text but we have a document URL, try to extract text from the file
    if ((!textToAnalyze || textToAnalyze.trim() === '') && documentUrl) {
      console.log('No document text provided, attempting to extract from document URL:', documentUrl);
      
      try {
        // Check if it's a PDF file
        if (documentUrl.toLowerCase().includes('.pdf')) {
          textToAnalyze = await extractTextFromPDF(documentUrl);
          console.log('Successfully extracted text from PDF, length:', textToAnalyze.length);
        } else if (documentUrl.toLowerCase().includes('.txt')) {
          // For text files, fetch directly
          const response = await fetch(documentUrl);
          if (response.ok) {
            textToAnalyze = await response.text();
            console.log('Successfully extracted text from text file, length:', textToAnalyze.length);
          } else {
            throw new Error(`Failed to fetch text document: ${response.statusText}`);
          }
        } else {
          // For other file types (DOC, DOCX), we'll try as text but warn user
          console.log('Attempting to extract text from non-PDF document');
          const response = await fetch(documentUrl);
          if (response.ok) {
            textToAnalyze = await response.text();
            console.log('Extracted text from document, length:', textToAnalyze.length);
          } else {
            throw new Error(`Failed to fetch document: ${response.statusText}`);
          }
        }
      } catch (extractionError) {
        console.error('Document extraction error:', extractionError);
        return new Response(
          JSON.stringify({ 
            error: `Failed to extract text from document: ${extractionError.message}. For best results, please upload a PDF with extractable text or a plain text file (.txt).`,
            success: false 
          }), 
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }
    
    if (!textToAnalyze || textToAnalyze.trim() === '') {
      console.log('No document text available for analysis');
      return new Response(
        JSON.stringify({ 
          error: 'No document text available for analysis. Please upload a PDF with extractable text or a plain text file (.txt).',
          success: false 
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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
      ${textToAnalyze.substring(0, 8000)}
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
            content: 'You are an expert insurance policy analyzer. Always return valid JSON responses only, no additional text or explanations.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      let errorMessage = `OpenAI API error: ${response.status}`;
      if (response.status === 429) {
        errorMessage = 'OpenAI API quota exceeded. Please check your OpenAI account billing and usage limits.';
      } else if (response.status === 401) {
        errorMessage = 'Invalid OpenAI API key. Please check your API key configuration.';
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          success: false 
        }), 
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const aiResponse = await response.json();
    console.log('OpenAI response received successfully');
    
    const analysisText = aiResponse.choices[0].message.content;
    console.log('AI analysis text:', analysisText);
    
    // Parse the JSON response from AI
    let extractedData;
    try {
      // Clean the response in case there's extra text
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : analysisText;
      extractedData = JSON.parse(jsonString);
      console.log('Successfully parsed extracted data:', extractedData);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', analysisText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse AI analysis results. The AI response was not in the expected format.',
          success: false 
        }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Update the policy in the database with extracted information
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const updateData: any = {};
    const updatedFields: string[] = [];
    
    if (extractedData.coverage_summary && extractedData.coverage_summary.trim() !== '') {
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
    console.log('Updated fields:', updatedFields);

    if (Object.keys(updateData).length > 0) {
      // Update the policy with extracted information
      const { error: updateError } = await supabase
        .from('policies')
        .update(updateData)
        .eq('id', policyId);

      if (updateError) {
        console.error('Error updating policy:', updateError);
        throw new Error('Failed to update policy with extracted data');
      }

      console.log('Policy updated successfully with', updatedFields.length, 'fields');
    } else {
      console.log('No valid data extracted to update policy');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedData,
        updatedFields: updatedFields.length > 0 ? updatedFields : ['analysis_completed'],
        message: updatedFields.length > 0 
          ? `Successfully extracted and updated ${updatedFields.length} field(s): ${updatedFields.join(', ')}`
          : 'Analysis completed successfully but no extractable policy data was found to update'
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-policy function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred during analysis',
        success: false 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
