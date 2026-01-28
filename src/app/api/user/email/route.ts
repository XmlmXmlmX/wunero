import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/storage';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';

// POST /api/user/email - Change user email (with password confirmation)
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { newEmail, password } = body;

    if (!newEmail || !password) {
      return NextResponse.json({ error: 'New email and password are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Get current user
    const user = await db.prepare('SELECT password_hash, email FROM users WHERE id = ?').get(userId) as { 
      password_hash: string; 
      email: string;
    } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Password is incorrect' }, { status: 401 });
    }

    // Check if email is already taken
    const existingUser = await db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(newEmail, userId);
    if (existingUser) {
      return NextResponse.json({ error: 'Email is already in use' }, { status: 409 });
    }

    // Update email
    await db.prepare('UPDATE users SET email = ? WHERE id = ?').run(newEmail, userId);

    return NextResponse.json({ success: true, message: 'Email updated successfully', email: newEmail });
  } catch (error) {
    console.error('Error changing email:', error);
    return NextResponse.json({ error: 'Failed to change email' }, { status: 500 });
  }
}
