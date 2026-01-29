import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import db from '@/lib/storage';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    interface UserRow {
      id: string;
      email: string;
    }
    const user = await db.prepare<UserRow>('SELECT id, email FROM users WHERE email = ?').get(email);

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a reset link has been sent' });
    }

    // Generate reset token
    const resetToken = nanoid(32);
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    // Store reset token
    await db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?')
      .run(resetToken, expiresAt, user.id);

    // Send reset email
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    
    await sendEmail({
      to: email,
      subject: 'Reset Your Password - Wunero',
      html: `
        <h1>Reset Your Password</h1>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return NextResponse.json({ message: 'If an account exists, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
