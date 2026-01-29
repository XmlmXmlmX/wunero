import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import db from '@/lib/storage';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import { getGravatarUrl } from '@/lib/gravatar';

interface ListMember {
  id: string;
  name?: string;
  email: string;
  avatar_url?: string;
}

// GET /api/wishlists/:id/members - Get all members of a wishlist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const { id: wishlistId } = await params;

    // Verify the user has access to this wishlist (owner, member, or follower if public)
    const wishlist = await db.prepare('SELECT user_id, is_private FROM wishlists WHERE id = ?').get(wishlistId) as unknown as { user_id: string; is_private: number } | undefined;
    
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    const isMember = userId === wishlist.user_id || 
      await db.prepare('SELECT id FROM list_members WHERE wishlist_id = ? AND user_id = ?').get(wishlistId, userId);
    const isFollowing = await db.prepare('SELECT id FROM followed_wishlists WHERE user_id = ? AND wishlist_id = ?').get(userId, wishlistId);

    if (wishlist.is_private && !isMember) {
      return unauthorizedResponse();
    }

    if (!isMember && !isFollowing) {
      return unauthorizedResponse();
    }

    // Get all members
    const members = await db.prepare(`
      SELECT u.id, u.name, u.email, u.avatar_url
      FROM list_members lm
      JOIN users u ON lm.user_id = u.id
      WHERE lm.wishlist_id = ?
      ORDER BY lm.created_at ASC
    `).all(wishlistId) as unknown as ListMember[];

    // Generate Gravatar URLs for members without avatar_url
    const membersWithAvatars = members.map(member => ({
      ...member,
      avatar_url: member.avatar_url || getGravatarUrl(member.email, 80, 'identicon')
    }));

    return NextResponse.json(membersWithAvatars);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

// POST /api/wishlists/:id/members - Add a member to a wishlist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const { id: wishlistId } = await params;
    const body = await request.json() as { email: string };

    if (!body.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Verify the user is the owner or a member of the wishlist
    const wishlist = await db.prepare('SELECT user_id FROM wishlists WHERE id = ?').get(wishlistId) as unknown as { user_id: string } | undefined;
    
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    const isMember = wishlist.user_id === userId || 
      await db.prepare('SELECT id FROM list_members WHERE wishlist_id = ? AND user_id = ?').get(wishlistId, userId);

    if (!isMember) {
      return NextResponse.json({ error: 'Only members can add other members' }, { status: 403 });
    }

    // Find the user by email
    const targetUser = await db.prepare('SELECT id FROM users WHERE email = ?').get(body.email) as unknown as { id: string } | undefined;
    
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.id === userId) {
      return NextResponse.json({ error: 'Cannot add yourself as a member' }, { status: 400 });
    }

    // Check if already a member
    const existingMember = await db.prepare('SELECT id FROM list_members WHERE wishlist_id = ? AND user_id = ?').get(wishlistId, targetUser.id) as unknown as { id: string } | undefined;
    
    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
    }

    // Add the member
    const memberId = nanoid();
    const now = Date.now();

    await db.prepare(`
      INSERT INTO list_members (id, wishlist_id, user_id, created_at)
      VALUES (?, ?, ?, ?)
    `).run(memberId, wishlistId, targetUser.id, now);

    const member = await db.prepare(`
      SELECT u.id, u.name, u.email, u.avatar_url
      FROM users u
      WHERE u.id = ?
    `).get(targetUser.id) as unknown as ListMember;

    // Generate Gravatar URL if avatar_url is not set
    const memberWithAvatar = {
      ...member,
      avatar_url: member.avatar_url || getGravatarUrl(member.email, 80, 'identicon')
    };

    return NextResponse.json(memberWithAvatar, { status: 201 });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}

// DELETE /api/wishlists/:id/members - Remove a member from a wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const { id: wishlistId } = await params;
    const memberId = request.nextUrl.searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // Verify the user is the owner or a member of the wishlist
    const wishlist = await db.prepare('SELECT user_id FROM wishlists WHERE id = ?').get(wishlistId) as unknown as { user_id: string } | undefined;
    
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    const isMember = wishlist.user_id === userId || 
      await db.prepare('SELECT id FROM list_members WHERE wishlist_id = ? AND user_id = ?').get(wishlistId, userId);

    if (!isMember) {
      return NextResponse.json({ error: 'Only members can remove other members' }, { status: 403 });
    }

    // Remove the member
    await db.prepare('DELETE FROM list_members WHERE wishlist_id = ? AND user_id = ?').run(wishlistId, memberId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
