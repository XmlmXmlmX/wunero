import { Resend } from 'resend';

let resend: Resend | null = null;

// Initialize Resend client lazily at runtime
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not defined in environment variables');
  }
  
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  
  return resend;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send an email using Resend
 * Note: In development with free tier, emails can only be sent to verified addresses
 */
export async function sendEmail({ to, subject, html, from = 'onboarding@resend.dev' }: SendEmailOptions) {
  try {
    console.log('📧 Sending email to:', to);
    const resendClient = getResendClient();
    const { data, error } = await resendClient.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      console.warn('⚠️  Email sending failed, but continuing operation. In development, verify your domain at resend.com/domains');
      return null; // Return null instead of throwing, so the operation can continue
    }

    console.log('✅ Email sent successfully:', data?.id);
    return data;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.warn('⚠️  Email sending failed, but continuing operation.');
    return null; // Return null instead of throwing
  }
}

/**
 * Get the base URL for the application
 * Uses NEXTAUTH_URL if available, otherwise tries to construct from request headers
 */
function getBaseUrl(): string {
  // Prefer explicit NEXTAUTH_URL
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  // Fallback to Vercel URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Development fallback
  return 'http://localhost:3000';
}

/**
 * Send a verification email with a token
 */
export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = getBaseUrl();
  const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;
  
  console.log('🔗 Verification URL:', verificationUrl);
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to Wunero! 🎁</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">
            Thanks for signing up! Please verify your email address to get started with creating and sharing wishlists.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 14px 28px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: 600;
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              Verify Email Address
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
            ${verificationUrl}
          </p>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            This link will expire in 24 hours for security reasons.
          </p>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            If you didn't create an account with Wunero, you can safely ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify your Wunero account',
    html,
  });
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;
  
  console.log('🔗 Reset URL:', resetUrl);
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Password Reset Request 🔐</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">
            We received a request to reset your password for your Wunero account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 14px 28px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: 600;
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              Reset Password
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
            ${resetUrl}
          </p>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            This link will expire in 1 hour for security reasons.
          </p>
          
          <p style="font-size: 14px; color: #ef4444; font-weight: 600; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.
          </p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset your Wunero password',
    html,
  });
}

/**
 * Send a wishlist invitation email
 */
export async function sendWishlistInvitationEmail(email: string, invitationCode: string, wishlistTitle: string, inviterName: string) {
  const baseUrl = getBaseUrl();
  const acceptUrl = `${baseUrl}/auth/register?invitation=${invitationCode}`;
  
  console.log('🔗 Invitation URL:', acceptUrl);
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">You're invited to a wishlist! 🎁</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">
            <strong>${inviterName}</strong> has invited you to join their wishlist <strong>"${wishlistTitle}"</strong> on Wunero!
          </p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Create your account to start collaborating and managing wishlists together.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 14px 28px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: 600;
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              Accept Invitation
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
            ${acceptUrl}
          </p>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            This invitation link will expire in 7 days.
          </p>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            If you're not interested in this wishlist or don't recognize the sender, you can safely ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `${inviterName} invited you to a wishlist on Wunero`,
    html,
  });
}
