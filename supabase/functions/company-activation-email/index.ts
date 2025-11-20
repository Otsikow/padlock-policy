import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { companyActivationEmailBodySchema, validateJsonBody, createValidationErrorResponse } from "../_shared/validation.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate request body
    const validationResult = await validateJsonBody(req, companyActivationEmailBodySchema);
    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.errors!, corsHeaders);
    }

    const { companyId, status } = validationResult.data;

    // Get company details
    const { data: company, error: companyError } = await supabaseClient
      .from('insurance_companies')
      .select('*, user_id')
      .eq('id', companyId)
      .single();

    if (companyError) throw companyError;

    // Get user email
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(company.user_id);

    if (userError) throw userError;

    if (!user?.email) {
      throw new Error('User email not found');
    }

    let emailSubject = '';
    let emailHtml = '';

    if (status === 'approved') {
      emailSubject = '🎉 Your Padlock Partner Application has been Approved!';
      emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Application Approved</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Padlock Partners!</h1>
            </div>

            <div style="background: #f8fafc; padding: 40px 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 18px; margin-bottom: 20px;">Dear ${company.legal_name} Team,</p>

              <p style="font-size: 16px; margin-bottom: 20px;">
                Congratulations! We're excited to inform you that your application to become a Padlock partner has been <strong>approved</strong>! 🎉
              </p>

              <div style="background: white; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 16px;">
                  You can now access your Partner Dashboard and start offering your insurance products through the Padlock platform.
                </p>
              </div>

              <h2 style="color: #2563eb; font-size: 20px; margin-top: 30px;">Next Steps:</h2>
              <ul style="font-size: 16px; line-height: 1.8;">
                <li>Access your Partner Dashboard at <a href="${Deno.env.get('SITE_URL')}/partner/dashboard" style="color: #2563eb;">Partner Dashboard</a></li>
                <li>Complete your product listings</li>
                <li>Configure your pricing and coverage options</li>
                <li>Start connecting with customers</li>
              </ul>

              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
                <p style="font-size: 16px; margin-bottom: 10px;">
                  <strong>Company Details:</strong>
                </p>
                <ul style="list-style: none; padding: 0; font-size: 14px; color: #64748b;">
                  <li>Registration Number: ${company.registration_number}</li>
                  <li>Country: ${company.country}</li>
                  <li>Phone: ${company.phone}</li>
                </ul>
              </div>

              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-top: 30px;">
                <p style="margin: 0; font-size: 14px; color: #1e40af;">
                  <strong>Need help getting started?</strong><br>
                  Our support team is here to help. Contact us at <a href="mailto:partners@padlock.com" style="color: #2563eb;">partners@padlock.com</a>
                </p>
              </div>

              <p style="font-size: 16px; margin-top: 30px;">
                We're thrilled to have you as a partner!
              </p>

              <p style="font-size: 16px; margin-top: 20px;">
                Best regards,<br>
                <strong>The Padlock Team</strong>
              </p>
            </div>

            <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Padlock. All rights reserved.</p>
            </div>
          </body>
        </html>
      `;
    } else {
      emailSubject = 'Update Required: Your Padlock Partner Application';
      emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Application Update Required</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Application Update Required</h1>
            </div>

            <div style="background: #f8fafc; padding: 40px 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 18px; margin-bottom: 20px;">Dear ${company.legal_name} Team,</p>

              <p style="font-size: 16px; margin-bottom: 20px;">
                Thank you for your interest in becoming a Padlock partner. After reviewing your application, we need some additional information or updates.
              </p>

              <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #991b1b;">Reason for Update:</p>
                <p style="margin: 0; font-size: 16px; color: #7f1d1d;">
                  ${company.rejection_reason || 'Please contact our support team for more details.'}
                </p>
              </div>

              <h2 style="color: #2563eb; font-size: 20px; margin-top: 30px;">What to do next:</h2>
              <ul style="font-size: 16px; line-height: 1.8;">
                <li>Review the feedback provided above</li>
                <li>Update your application with the necessary changes</li>
                <li>Resubmit your application for review</li>
              </ul>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${Deno.env.get('SITE_URL')}/company/profile"
                   style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Update Application
                </a>
              </div>

              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-top: 30px;">
                <p style="margin: 0; font-size: 14px; color: #1e40af;">
                  <strong>Need help?</strong><br>
                  Our support team is here to assist you. Contact us at <a href="mailto:support@padlock.com" style="color: #2563eb;">support@padlock.com</a>
                </p>
              </div>

              <p style="font-size: 16px; margin-top: 30px;">
                We look forward to working with you once the updates are complete.
              </p>

              <p style="font-size: 16px; margin-top: 20px;">
                Best regards,<br>
                <strong>The Padlock Team</strong>
              </p>
            </div>

            <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Padlock. All rights reserved.</p>
            </div>
          </body>
        </html>
      `;
    }

    // Send email using Resend (or Supabase's built-in email if RESEND_API_KEY is not set)
    if (RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Padlock Partners <partners@padlock.com>',
          to: [user.email],
          subject: emailSubject,
          html: emailHtml,
        }),
      });

      if (!resendResponse.ok) {
        const error = await resendResponse.text();
        throw new Error(`Failed to send email: ${error}`);
      }
    } else {
      // Fallback: Create notification in database
      await supabaseClient.from('notifications').insert({
        user_id: company.user_id,
        message: status === 'approved'
          ? `Your company application has been approved! Access your Partner Dashboard to get started.`
          : `Your company application requires updates. Reason: ${company.rejection_reason}`,
        status: 'unread',
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
