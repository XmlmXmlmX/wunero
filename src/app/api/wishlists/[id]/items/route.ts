import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import db from '@/lib/storage';
import { extractProductInfo } from '@/lib/productParser';
import { requireAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/api-auth';
import type { WishItem, CreateWishItemInput } from '@/types';

// GET /api/wishlists/[id]/items - Get all items in a wishlist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if wishlist exists
    const wishlist = await db.prepare('SELECT * FROM wishlists WHERE id = ?').get(id);
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }
    
    const items = await db.prepare('SELECT * FROM wish_items WHERE wishlist_id = ? ORDER BY priority DESC, created_at DESC').all(id) as unknown as WishItem[];
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching wish items:', error);
    return NextResponse.json({ error: 'Failed to fetch wish items' }, { status: 500 });
  }
}

// POST /api/wishlists/[id]/items - Add a new item to wishlist (only owner can add items)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body: CreateWishItemInput = await request.json();
    
    // Check if wishlist exists and user is owner
    const wishlist = await db.prepare('SELECT * FROM wishlists WHERE id = ?').get(id) as { user_id: string } | undefined;
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    if (wishlist.user_id.toString() !== userId) {
      return forbiddenResponse();
    }
    
    if (!body.title || body.title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const itemId = nanoid();
    const now = Date.now();
    
    // Extract product info from URL if provided
    let productInfo: { title?: string; image_url?: string; price?: string; currency?: string } = {};
    if (body.url) {
      productInfo = await extractProductInfo(body.url);
    }
    
    const stmt = db.prepare(`
      INSERT INTO wish_items (id, wishlist_id, title, description, url, image_url, price, currency, priority, quantity, importance, purchased, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      itemId,
      id,
      body.title,
      body.description || null,
      body.url || null,
      productInfo.image_url || null,
      body.price || productInfo.price || null,
      body.currency || productInfo.currency || 'EUR',
      body.priority || 0,
      body.quantity || 1,
      body.importance || 'would-love',
      0,
      now,
      now
    );
    
    const item = await db.prepare('SELECT * FROM wish_items WHERE id = ?').get(itemId) as unknown as WishItem;
    
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating wish item:', error);
    return NextResponse.json({ error: 'Failed to create wish item' }, { status: 500 });
  }
}
