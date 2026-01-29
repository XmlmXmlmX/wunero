import db from '@/lib/storage';

/**
 * Check if a user is the owner of a wishlist
 */
export async function isWishlistOwner(wishlistId: string, userId: string): Promise<boolean> {
  const wishlist = await db.prepare('SELECT user_id FROM wishlists WHERE id = ?').get(wishlistId) as { user_id: string } | undefined;
  return wishlist?.user_id === userId;
}

/**
 * Check if a user is a member of a wishlist
 */
export async function isWishlistMember(wishlistId: string, userId: string): Promise<boolean> {
  const member = await db.prepare('SELECT id FROM list_members WHERE wishlist_id = ? AND user_id = ?').get(wishlistId, userId);
  return !!member;
}

/**
 * Check if user can edit wishlist (owner or member)
 */
export async function canEditWishlist(wishlistId: string, userId: string): Promise<boolean> {
  return await isWishlistOwner(wishlistId, userId) || await isWishlistMember(wishlistId, userId);
}
