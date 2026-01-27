import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import db from '@/lib/db';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';

// POST /api/wishlists/follow - Follow a wishlist
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { wishlistId } = body;

    if (!wishlistId) {
      return NextResponse.json({ error: 'Wishlist ID is required' }, { status: 400 });
    }

    // Check if wishlist exists
    const wishlist = db.prepare('SELECT * FROM wishlists WHERE id = ?').get(wishlistId);
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    // Check if already following
    const existing = db.prepare('SELECT * FROM followed_wishlists WHERE user_id = ? AND wishlist_id = ?')
      .get(userId, wishlistId);

    if (existing) {
      return NextResponse.json({ error: 'Already following this wishlist' }, { status: 400 });
    }

    const id = nanoid();
    const now = Date.now();

    db.prepare(`
      INSERT INTO followed_wishlists (id, user_id, wishlist_id, created_at)
      VALUES (?, ?, ?, ?)
    `).run(id, userId, wishlistId, now);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error following wishlist:', error);
    return NextResponse.json({ error: 'Failed to follow wishlist' }, { status: 500 });
  }
}

// DELETE /api/wishlists/follow - Unfollow a wishlist
export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const wishlistId = searchParams.get('wishlistId');

    if (!wishlistId) {
      return NextResponse.json({ error: 'Wishlist ID is required' }, { status: 400 });
    }

    const result = db.prepare('DELETE FROM followed_wishlists WHERE user_id = ? AND wishlist_id = ?')
      .run(userId, wishlistId);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Not following this wishlist' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unfollowing wishlist:', error);
    return NextResponse.json({ error: 'Failed to unfollow wishlist' }, { status: 500 });
  }
}
