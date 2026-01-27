import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    // Find user with this token
    const user = db.prepare(`
      SELECT id, email, email_verified, verification_token_expires
      FROM users
      WHERE verification_token = ?
    `).get(token) as { id: string; email: string; email_verified: number; verification_token_expires: number } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 });
    }

    // Check if already verified
    if (user.email_verified) {
      return NextResponse.json({ message: 'Email already verified' }, { status: 200 });
    }

    // Check if token expired
    if (user.verification_token_expires < Date.now()) {
      return NextResponse.json({ error: 'Verification token has expired' }, { status: 400 });
    }

    // Verify the email
    db.prepare(`
      UPDATE users
      SET email_verified = 1,
          email_verified_at = ?,
          verification_token = NULL,
          verification_token_expires = NULL
      WHERE id = ?
    `).run(Date.now(), user.id);

    return NextResponse.json({ 
      message: 'Email verified successfully',
      email: user.email
    });

  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 });
  }
}

// POST endpoint to resend verification email
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user
    const user = db.prepare(`
      SELECT id, email, email_verified
      FROM users
      WHERE email = ?
    `).get(email) as { id: string; email: string; email_verified: number } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.email_verified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    // Generate new token
    const { nanoid } = await import('nanoid');
    const { sendVerificationEmail } = await import('@/lib/email');
    
    const newToken = nanoid(32);
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Update user with new token
    db.prepare(`
      UPDATE users
      SET verification_token = ?,
          verification_token_expires = ?
      WHERE id = ?
    `).run(newToken, expiresAt, user.id);

    // Send verification email
    await sendVerificationEmail(user.email, newToken);

    return NextResponse.json({ message: 'Verification email sent' });

  } catch (error) {
    console.error('Error resending verification email:', error);
    return NextResponse.json({ error: 'Failed to resend verification email' }, { status: 500 });
  }
}
