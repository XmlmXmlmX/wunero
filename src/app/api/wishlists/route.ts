import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import db from '@/lib/db';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import type { Wishlist, CreateWishlistInput } from '@/types';

// GET /api/wishlists - Get all wishlists for current user
export async function GET() {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return unauthorizedResponse();
    }
    const wishlists = db.prepare('SELECT * FROM wishlists WHERE user_id = ? ORDER BY updated_at DESC').all(userId) as Wishlist[];
    return NextResponse.json(wishlists);
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
    
    const stmt = db.prepare(`
      INSERT INTO wishlists (id, user_id, title, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, userId, body.title, body.description || null, now, now);
    
    const wishlist = db.prepare('SELECT * FROM wishlists WHERE id = ?').get(id) as Wishlist;
    
    return NextResponse.json(wishlist, { status: 201 });
  } catch (error) {
    console.error('Error creating wishlist:', error);
    return NextResponse.json({ error: 'Failed to create wishlist' }, { status: 500 });
  }
}
