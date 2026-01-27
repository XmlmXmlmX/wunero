import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/api-auth';
import type { Wishlist, UpdateWishlistInput } from '@/types';

// GET /api/wishlists/[id] - Get a specific wishlist (owner or follower can view)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const wishlist = db.prepare(`
      SELECT w.*, COUNT(wi.id) as items_count
      FROM wishlists w
      LEFT JOIN wish_items wi ON w.id = wi.wishlist_id
      WHERE w.id = ?
      GROUP BY w.id
    `).get(id) as { user_id: number; is_private: number; [key: string]: any } | undefined;

    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    // Check if user is owner or is following the wishlist
    const isOwner = wishlist.user_id.toString() === userId;
    const isFollowing = db.prepare('SELECT * FROM followed_wishlists WHERE user_id = ? AND wishlist_id = ?')
      .get(userId, id);

    // If wishlist is private and user is not the owner, deny access
    if (wishlist.is_private && !isOwner) {
      return forbiddenResponse();
    }

    if (!isOwner && !isFollowing) {
      return forbiddenResponse();
    }

    return NextResponse.json({ ...wishlist, is_owner: isOwner });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// DELETE /api/wishlists/[id] - Delete a wishlist (only owner can delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const wishlist = db.prepare('SELECT * FROM wishlists WHERE id = ?').get(id) as { user_id: number } | undefined;

    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    if (wishlist.user_id.toString() !== userId) {
      return forbiddenResponse();
    }

    db.prepare('DELETE FROM wishlists WHERE id = ?').run(id);

    return NextResponse.json({ message: 'Wishlist deleted successfully' });
  } catch (error) {
    console.error('Error deleting wishlist:', error);
    return NextResponse.json({ error: 'Failed to delete wishlist' }, { status: 500 });
  }
}

// PATCH /api/wishlists/[id] - Update a wishlist (only owner can update)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body: UpdateWishlistInput = await request.json();
    
    const wishlist = db.prepare('SELECT * FROM wishlists WHERE id = ?').get(id) as { user_id: number } | undefined;
    
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    if (wishlist.user_id.toString() !== userId) {
      return forbiddenResponse();
    }
    
    const updates: string[] = [];
    const values: (string | number)[] = [];
    
    if (body.title !== undefined) {
      updates.push('title = ?');
      values.push(body.title);
    }
    
    if (body.description !== undefined) {
      updates.push('description = ?');
      values.push(body.description);
    }

    if (body.is_private !== undefined) {
      updates.push('is_private = ?');
      values.push(body.is_private ? 1 : 0);
    }
    
    updates.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);
    
    const stmt = db.prepare(`UPDATE wishlists SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    
    const updated = db.prepare('SELECT * FROM wishlists WHERE id = ?').get(id) as Wishlist;
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating wishlist:', error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}
