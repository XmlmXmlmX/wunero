import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/storage';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import type { Wishlist } from '@/types';

interface SearchWishlistRow extends Wishlist {
  user_id: string;
  is_private: number;
  owner_email?: string;
  owner_name?: string;
}

// Helper function to extract ID from URL or return as-is
function extractWishlistId(input: string): string {
  // Check if input is a URL
  try {
    const url = new URL(input);
    // Extract ID from URL path like /wishlists/0AHxWkZlM_mzO0zPZbDiW
    const match = url.pathname.match(/\/wishlists\/([^\/]+)/);
    if (match && match[1]) {
      return match[1];
    }
  } catch {
    // Not a URL, continue with input as ID
  }
  
  // Return input as-is if it's a plain ID
  return input.trim();
}

// GET /api/wishlists/search?id=xxx - Search for a wishlist by ID or URL to follow
export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const input = searchParams.get('id');

    if (!input) {
      return NextResponse.json({ error: 'Wishlist ID or URL is required' }, { status: 400 });
    }

    // Extract ID from URL or use as-is
    const wishlistId = extractWishlistId(input);

    const wishlist = await db.prepare<SearchWishlistRow>(`
      SELECT w.*, u.email as owner_email, u.name as owner_name
      FROM wishlists w
      LEFT JOIN users u ON w.user_id = u.id
      WHERE w.id = ?
    `).get(wishlistId);

    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    // Check if user is the owner
    const isOwner = wishlist.user_id.toString() === userId;

    // If wishlist is private and user is not the owner, deny access
    if (wishlist.is_private && !isOwner) {
      return NextResponse.json({ error: 'This wishlist is private' }, { status: 403 });
    }

    // Check if user is already following
    const isFollowing = await db.prepare('SELECT * FROM followed_wishlists WHERE user_id = ? AND wishlist_id = ?')
      .get(userId, wishlistId);

    return NextResponse.json({
      ...wishlist,
      isFollowing: !!isFollowing,
      isOwner
    });
  } catch (error) {
    console.error('Error searching wishlist:', error);
    return NextResponse.json({ error: 'Failed to search wishlist' }, { status: 500 });
  }
}
