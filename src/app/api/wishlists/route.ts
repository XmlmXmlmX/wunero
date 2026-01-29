import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import db from '@/lib/storage';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import type { Wishlist, CreateWishlistInput } from '@/types';

// GET /api/wishlists - Get all wishlists for current user
export async function GET() {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return unauthorizedResponse();
    }
    
    // Get user's own wishlists and member wishlists with item count and member count
    const ownWishlists = await db.prepare(`
      SELECT w.*, 
        COUNT(DISTINCT wi.id) as items_count,
        COUNT(DISTINCT lm.user_id) as members_count,
        CASE WHEN w.user_id = ? THEN 1 ELSE 0 END as can_edit,
        CASE WHEN lm_self.user_id IS NOT NULL THEN 1 ELSE 0 END as is_member
      FROM wishlists w
      LEFT JOIN wish_items wi ON w.id = wi.wishlist_id
      LEFT JOIN list_members lm ON w.id = lm.wishlist_id
      LEFT JOIN list_members lm_self ON w.id = lm_self.wishlist_id AND lm_self.user_id = ?
      WHERE w.user_id = ? OR lm_self.user_id IS NOT NULL
      GROUP BY w.id, w.title, w.description, w.created_at, w.updated_at, w.user_id, w.is_private, lm_self.user_id
      ORDER BY w.updated_at DESC
    `).all(userId, userId, userId) as unknown as Wishlist[];
    
    // Get followed wishlists with owner info, item count, and member count
    const followedWishlists = await db.prepare(`
      SELECT w.*, fw.created_at as followed_at, u.email as owner_email, u.name as owner_name,
        COUNT(DISTINCT wi.id) as items_count,
        COUNT(DISTINCT lm.user_id) as members_count
      FROM followed_wishlists fw
      JOIN wishlists w ON fw.wishlist_id = w.id
      LEFT JOIN users u ON w.user_id = u.id
      LEFT JOIN wish_items wi ON w.id = wi.wishlist_id
      LEFT JOIN list_members lm ON w.id = lm.wishlist_id
      WHERE fw.user_id = ?
      GROUP BY w.id, w.title, w.description, w.created_at, w.updated_at, w.user_id, w.is_private, fw.created_at, u.email, u.name
      ORDER BY fw.created_at DESC
    `).all(userId) as unknown as Array<Wishlist & { followed_at: number; owner_email?: string; owner_name?: string }>;
    
    return NextResponse.json({
      own: ownWishlists,
      followed: followedWishlists
    });
  } catch (error) {
    console.error('Error fetching wishlists:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlists' }, { status: 500 });
  }
}

// POST /api/wishlists - Create a new wishlist
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return unauthorizedResponse();
    }
    const body: CreateWishlistInput = await request.json();
    
    if (!body.title || body.title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const id = nanoid();
    const now = Date.now();
    
    console.log('Creating wishlist:', { id, userId, title: body.title, now });
    
    const stmt = db.prepare(`
      INSERT INTO wishlists (id, user_id, title, description, is_private, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = await stmt.run(id, userId, body.title, body.description || null, body.is_private ? 1 : 0, now, now);
    console.log('Insert result:', result);
    
    const wishlist = await db.prepare('SELECT * FROM wishlists WHERE id = ?').get(id) as unknown as Wishlist;
    console.log('Retrieved wishlist:', wishlist);
    
    return NextResponse.json(wishlist, { status: 201 });
  } catch (error) {
    console.error('Error creating wishlist:', error);
    return NextResponse.json({ error: 'Failed to create wishlist' }, { status: 500 });
  }
}
