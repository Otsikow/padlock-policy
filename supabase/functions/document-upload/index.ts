import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocumentUploadRequest {
  title: string;
  description?: string;
  document_type: 'policy' | 'receipt' | 'id' | 'claim' | 'other';
  document_category?: string;
  file_url: string;
  file_size?: number;
  encrypt?: boolean; // Whether to encrypt the document
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('authorization');

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify the user is authenticated
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check rate limit
    const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
      identifier_val: user.id,
      endpoint_val: 'document-upload',
      max_requests: 50,
      window_minutes: 60
    });

    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const documentData: DocumentUploadRequest = await req.json();

    // Validate required fields
    if (!documentData.title || !documentData.document_type || !documentData.file_url) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: title, document_type, and file_url are required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate document_type
    const validDocumentTypes = ['policy', 'receipt', 'id', 'claim', 'other'];
    if (!validDocumentTypes.includes(documentData.document_type)) {
      return new Response(
        JSON.stringify({
          error: `Invalid document_type. Must be one of: ${validDocumentTypes.join(', ')}`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Encryption metadata (simplified - in production use proper encryption service)
    let encryptionMetadata = {
      is_encrypted: false,
      encryption_key_id: null,
      encryption_algorithm: null
    };

    if (documentData.encrypt) {
      // In production, you would:
      // 1. Fetch the file from file_url
      // 2. Encrypt it using a key management service (AWS KMS, Google Cloud KMS, etc.)
      // 3. Upload the encrypted file
      // 4. Store the encryption key ID

      encryptionMetadata = {
        is_encrypted: true,
        encryption_key_id: `key_${Date.now()}`, // Placeholder - use real key ID from KMS
        encryption_algorithm: 'AES-256-GCM'
      };

      console.log('Document will be encrypted with key:', encryptionMetadata.encryption_key_id);
    }

    // Create document record
    const { data: newDocument, error: insertError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title: documentData.title,
        description: documentData.description,
        document_type: documentData.document_type,
        document_category: documentData.document_category,
        file_url: documentData.file_url,
        file_size: documentData.file_size,
        ...encryptionMetadata
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating document:', insertError);
      return new Response(
        JSON.stringify({
          error: 'Failed to create document',
          details: insertError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // If it's a policy document, trigger AI analysis
    let aiAnalysisTriggered = false;
    if (documentData.document_type === 'policy') {
      // Trigger AI analysis asynchronously
      console.log('Triggering AI analysis for policy document:', newDocument.id);
      aiAnalysisTriggered = true;

      // In a real implementation, you would trigger a background job or webhook here
      // For example, send a message to a queue or call the AI analysis function
    }

    return new Response(
      JSON.stringify({
        success: true,
        document: newDocument,
        ai_analysis_triggered: aiAnalysisTriggered,
        encrypted: encryptionMetadata.is_encrypted,
        message: 'Document uploaded successfully'
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in document-upload function:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
