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
    
    // Get user's own wishlists with item count
    const ownWishlists = await db.prepare(`
      SELECT w.*, COUNT(wi.id) as items_count
      FROM wishlists w
      LEFT JOIN wish_items wi ON w.id = wi.wishlist_id
      WHERE w.user_id = ?
      GROUP BY w.id
      ORDER BY w.updated_at DESC
    `).all(userId) as unknown as Wishlist[];
    
    // Get followed wishlists with owner info and item count
    const followedWishlists = await db.prepare(`
      SELECT w.*, fw.created_at as followed_at, u.email as owner_email, u.name as owner_name, COUNT(wi.id) as items_count
      FROM followed_wishlists fw
      JOIN wishlists w ON fw.wishlist_id = w.id
      LEFT JOIN users u ON w.user_id = u.id
      LEFT JOIN wish_items wi ON w.id = wi.wishlist_id
      WHERE fw.user_id = ?
      GROUP BY w.id
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
