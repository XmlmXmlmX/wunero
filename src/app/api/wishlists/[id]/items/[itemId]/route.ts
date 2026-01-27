import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { extractProductInfo } from '@/lib/productParser';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import type { WishItem, UpdateWishItemInput } from '@/types';

// GET /api/wishlists/[id]/items/[itemId] - Get a specific item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const item = db.prepare('SELECT * FROM wish_items WHERE id = ?').get(itemId) as WishItem | undefined;
    
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching wish item:', error);
    return NextResponse.json({ error: 'Failed to fetch wish item' }, { status: 500 });
  }
}

// PATCH /api/wishlists/[id]/items/[itemId] - Update an item (require auth for marking purchased)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id } = await params;
    const { itemId } = await params;
    const body: UpdateWishItemInput = await request.json();
    
    // Get the item
    const item = db.prepare('SELECT * FROM wish_items WHERE id = ?').get(itemId);
    
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    // Get the wishlist
    const wishlist = db.prepare('SELECT * FROM wishlists WHERE id = ?').get(id) as { user_id: number; is_private: number } | undefined;
    
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }
    
    // Check if user is authenticated
    const userId = await requireAuth();
    if (!userId) {
      return unauthorizedResponse();
    }
    
    // Check if user is the owner
    const isOwner = wishlist.user_id.toString() === userId;
    
    // Only owner can edit item details, anyone can mark as purchased (if wishlist is public)
    if (body.purchased !== undefined && !isOwner) {
      // Check if wishlist is private - if so, only owner can mark as purchased
      if (wishlist.is_private) {
        return NextResponse.json({ error: 'Cannot mark items as purchased in private wishlists' }, { status: 403 });
      }
      // For public wishlists, allow marking as purchased
      const updates: string[] = [];
      const values: (string | number)[] = [];
      
      if (body.purchased !== undefined) {
        updates.push('purchased = ?');
        values.push(body.purchased ? 1 : 0);
      }
      
      if (body.purchased_quantity !== undefined) {
        updates.push('purchased_quantity = ?');
        values.push(body.purchased_quantity);
      }
      
      updates.push('updated_at = ?');
      values.push(Date.now());
      values.push(itemId);
      
      const stmt = db.prepare(`UPDATE wish_items SET ${updates.join(', ')} WHERE id = ?`);
      stmt.run(...values);
      
      const updated = db.prepare('SELECT * FROM wish_items WHERE id = ?').get(itemId) as WishItem;
      return NextResponse.json(updated);
    }
    
    // Only owner can edit other fields
    if (!isOwner) {
      return NextResponse.json({ error: 'Only the owner can edit this item' }, { status: 403 });
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
    
    if (body.url !== undefined) {
      updates.push('url = ?');
      values.push(body.url);
      
      // Extract product info from new URL
      if (body.url) {
        const productInfo = await extractProductInfo(body.url);
        if (productInfo.image_url) {
          updates.push('image_url = ?');
          values.push(productInfo.image_url);
        }
        if (productInfo.price) {
          updates.push('price = ?');
          values.push(productInfo.price);
        }
      }
    }
    
    if (body.image_url !== undefined) {
      updates.push('image_url = ?');
      values.push(body.image_url);
    }
    
    if (body.price !== undefined) {
      updates.push('price = ?');
      values.push(body.price);
    }
    
    if (body.currency !== undefined) {
      updates.push('currency = ?');
      values.push(body.currency);
    }
    
    if (body.priority !== undefined) {
      updates.push('priority = ?');
      values.push(body.priority);
    }
    
    if (body.quantity !== undefined) {
      updates.push('quantity = ?');
      values.push(body.quantity);
    }
    
    if (body.importance !== undefined) {
      updates.push('importance = ?');
      values.push(body.importance);
    }
    
    if (body.purchased !== undefined) {
      updates.push('purchased = ?');
      values.push(body.purchased ? 1 : 0);
    }
    
    if (body.purchased_quantity !== undefined) {
      updates.push('purchased_quantity = ?');
      values.push(body.purchased_quantity);
    }
    
    updates.push('updated_at = ?');
    values.push(Date.now());
    values.push(itemId);
    
    const stmt = db.prepare(`UPDATE wish_items SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    
    const updated = db.prepare('SELECT * FROM wish_items WHERE id = ?').get(itemId) as WishItem;
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating wish item:', error);
    return NextResponse.json({ error: 'Failed to update wish item' }, { status: 500 });
  }
}

// DELETE /api/wishlists/[id]/items/[itemId] - Delete an item (only owner)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    
    // Require authentication
    const userId = await requireAuth();
    if (!userId) {
      return unauthorizedResponse();
    }
    
    // Get the item
    const item = db.prepare('SELECT * FROM wish_items WHERE id = ?').get(itemId);
    
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    // Get the wishlist
    const wishlist = db.prepare('SELECT * FROM wishlists WHERE id = ?').get(id) as { user_id: number } | undefined;
    
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }
    
    // Only the owner can delete items
    if (wishlist.user_id.toString() !== userId) {
      return NextResponse.json({ error: 'Only the owner can delete items' }, { status: 403 });
    }
    
    db.prepare('DELETE FROM wish_items WHERE id = ?').run(itemId);
    
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting wish item:', error);
    return NextResponse.json({ error: 'Failed to delete wish item' }, { status: 500 });
  }
}
