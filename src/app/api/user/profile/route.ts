import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';

// GET /api/user/profile - Get current user profile
export async function GET() {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const user = db.prepare('SELECT id, email, name, avatar_url, created_at FROM users WHERE id = ?').get(userId) as {
      id: string;
      email: string;
      name: string | null;
      avatar_url: string | null;
      created_at: number;
    } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PATCH /api/user/profile - Update user profile (name, avatar_url)
export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { name, avatar_url } = body;

    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }

    if (avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      values.push(avatar_url);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    values.push(userId);

    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const updatedUser = db.prepare('SELECT id, email, name, avatar_url, created_at FROM users WHERE id = ?').get(userId);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
