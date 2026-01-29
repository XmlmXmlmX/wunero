import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/storage';
import { requireAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/api-auth';
import type { Wishlist, UpdateWishlistInput } from '@/types';

interface WishlistRow extends Wishlist {
  items_count: number;
  is_private: number;
  user_id: string;
  members_count?: number;
}

// Helper function to check if user is owner or member of wishlist
async function canEditWishlist(wishlistId: string, userId: string): Promise<boolean> {
  const wishlist = await db.prepare('SELECT user_id FROM wishlists WHERE id = ?').get(wishlistId) as { user_id: string } | undefined;
  
  if (!wishlist) return false;
  
  // Owner can always edit
  if (wishlist.user_id === userId) return true;
  
  // Check if user is a member
  const member = await db.prepare('SELECT id FROM list_members WHERE wishlist_id = ? AND user_id = ?').get(wishlistId, userId);
  
  return !!member;
}

interface WishlistRow extends Wishlist {
  items_count: number;
  is_private: number;
  user_id: string;
}

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
    const wishlist = await db.prepare<WishlistRow>(`
      SELECT w.*, 
        COUNT(DISTINCT wi.id) as items_count,
        COUNT(DISTINCT lm.user_id) as members_count
      FROM wishlists w
      LEFT JOIN wish_items wi ON w.id = wi.wishlist_id
      LEFT JOIN list_members lm ON w.id = lm.wishlist_id
      WHERE w.id = ?
      GROUP BY w.id
    `).get(id);

    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    // Check if user is owner, member, or is following the wishlist
    const isOwner = wishlist.user_id.toString() === userId;
    const isMember = await db.prepare('SELECT id FROM list_members WHERE user_id = ? AND wishlist_id = ?')
      .get(userId, id);
    const isFollowing = await db.prepare('SELECT id FROM followed_wishlists WHERE user_id = ? AND wishlist_id = ?')
      .get(userId, id);

    // If wishlist is private and user is not owner or member, deny access
    if (wishlist.is_private && !isOwner && !isMember) {
      return forbiddenResponse();
    }

    if (!isOwner && !isMember && !isFollowing) {
      return forbiddenResponse();
    }

    return NextResponse.json({
      ...wishlist,
      is_owner: isOwner,
      is_member: Boolean(isMember),
      can_edit: isOwner || Boolean(isMember),
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// DELETE /api/wishlists/[id] - Delete a wishlist (owner or members can delete)
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
    
    // Check if user can edit (is owner or member)
    const canEdit = await canEditWishlist(id, userId);
    if (!canEdit) {
      return forbiddenResponse();
    }

    await db.prepare('DELETE FROM wishlists WHERE id = ?').run(id);

    return NextResponse.json({ message: 'Wishlist deleted successfully' });
  } catch (error) {
    console.error('Error deleting wishlist:', error);
    return NextResponse.json({ error: 'Failed to delete wishlist' }, { status: 500 });
  }
}

// PATCH /api/wishlists/[id] - Update a wishlist (owner or members can update)
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
    
    // Check if user can edit (is owner or member)
    const canEdit = await canEditWishlist(id, userId);
    if (!canEdit) {
      return forbiddenResponse();
    }

    const body: UpdateWishlistInput = await request.json();
    
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
    await stmt.run(...values);
    
    const updated = await db.prepare('SELECT * FROM wishlists WHERE id = ?').get(id) as unknown as Wishlist;
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating wishlist:', error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}
