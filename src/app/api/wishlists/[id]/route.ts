import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import type { Wishlist, UpdateWishlistInput } from '@/types';

// GET /api/wishlists/[id] - Get a specific wishlist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const wishlist = db.prepare('SELECT * FROM wishlists WHERE id = ?').get(id) as Wishlist | undefined;
    
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }
    
    return NextResponse.json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// PATCH /api/wishlists/[id] - Update a wishlist
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateWishlistInput = await request.json();
    
    const wishlist = db.prepare('SELECT * FROM wishlists WHERE id = ?').get(id);
    
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (body.title !== undefined) {
      updates.push('title = ?');
      values.push(body.title);
    }
    
    if (body.description !== undefined) {
      updates.push('description = ?');
      values.push(body.description);
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

// DELETE /api/wishlists/[id] - Delete a wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const wishlist = db.prepare('SELECT * FROM wishlists WHERE id = ?').get(id);
    
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }
    
    db.prepare('DELETE FROM wishlists WHERE id = ?').run(id);
    
    return NextResponse.json({ message: 'Wishlist deleted successfully' });
  } catch (error) {
    console.error('Error deleting wishlist:', error);
    return NextResponse.json({ error: 'Failed to delete wishlist' }, { status: 500 });
  }
}
