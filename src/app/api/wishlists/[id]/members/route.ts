import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import db from '@/lib/storage';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import { getGravatarUrl } from '@/lib/gravatar';
import { sendWishlistInvitationEmail } from '@/lib/email';

interface ListMember {
  id: string;
  name?: string;
  email: string;
  avatar_url?: string;
  is_pending?: boolean;
}

interface WishlistData {
  title: string;
  user_id: string;
}

interface UserData {
  id: string;
  name?: string;
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

    // Get all pending invitations for this wishlist
    const pendingInvitations = await db.prepare(`
      SELECT email FROM pending_invitations
      WHERE wishlist_id = ? AND expires_at > ?
      ORDER BY created_at ASC
    `).all(wishlistId, Date.now()) as unknown as { email: string }[];

    // Convert pending invitations to member-like objects
    const pendingMembers: ListMember[] = pendingInvitations.map(inv => ({
      id: `pending-${inv.email}`,
      email: inv.email,
      avatar_url: getGravatarUrl(inv.email, 80, 'identicon'),
      is_pending: true
    }));

    // Generate Gravatar URLs for members without avatar_url
    const membersWithAvatars = members.map(member => ({
      ...member,
      avatar_url: member.avatar_url || getGravatarUrl(member.email, 80, 'identicon'),
      is_pending: false
    }));

    return NextResponse.json([...membersWithAvatars, ...pendingMembers]);
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

    const email = body.email.trim().toLowerCase();

    // Verify the user is the owner or a member of the wishlist
    const wishlist = await db.prepare('SELECT user_id, title FROM wishlists WHERE id = ?').get(wishlistId) as unknown as WishlistData | undefined;
    
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    const isMember = wishlist.user_id === userId || 
      await db.prepare('SELECT id FROM list_members WHERE wishlist_id = ? AND user_id = ?').get(wishlistId, userId);

    if (!isMember) {
      return NextResponse.json({ error: 'Only members can add other members' }, { status: 403 });
    }

    // Check if user is trying to add themselves
    const currentUser = await db.prepare('SELECT email FROM users WHERE id = ?').get(userId) as unknown as { email: string } | undefined;
    if (currentUser && currentUser.email === email) {
      return NextResponse.json({ error: 'Cannot add yourself as a member' }, { status: 400 });
    }

    // Find the user by email
    const targetUser = await db.prepare('SELECT id FROM users WHERE email = ?').get(email) as unknown as { id: string } | undefined;
    
    // If user exists, add them as a member
    if (targetUser) {
      // Check if already a member
      const existingMember = await db.prepare('SELECT id FROM list_members WHERE wishlist_id = ? AND user_id = ?').get(wishlistId, targetUser.id);
      
      if (existingMember) {
        return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
      }

      // Remove any pending invitation if it exists
      await db.prepare('DELETE FROM pending_invitations WHERE email = ? AND wishlist_id = ?').run(email, wishlistId);

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
        avatar_url: member.avatar_url || getGravatarUrl(member.email, 80, 'identicon'),
        is_pending: false
      };

      return NextResponse.json(memberWithAvatar, { status: 201 });
    }

    // User doesn't exist - check if there's already a pending invitation
    const existingInvitation = await db.prepare('SELECT id FROM pending_invitations WHERE email = ? AND wishlist_id = ?').get(email, wishlistId);
    
    if (existingInvitation) {
      return NextResponse.json({ error: 'An invitation is already pending for this email' }, { status: 400 });
    }

    // Create a pending invitation
    const invitationId = nanoid();
    const invitationCode = nanoid(32);
    const now = Date.now();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

    await db.prepare(`
      INSERT INTO pending_invitations (id, email, wishlist_id, invitation_code, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(invitationId, email, wishlistId, invitationCode, now, expiresAt);

    // Get the inviter's name
    const inviter = await db.prepare('SELECT name FROM users WHERE id = ?').get(userId) as unknown as UserData | undefined;
    const inviterName = inviter?.name || 'A Wunero user';

    // Send invitation email
    try {
      await sendWishlistInvitationEmail(email, invitationCode, wishlist.title, inviterName);
      console.log(`📧 Invitation email sent to ${email} for wishlist ${wishlistId}`);
    } catch (emailError) {
      console.error('❌ Failed to send invitation email:', emailError);
      // Don't fail the operation if email fails, but log it
    }

    // Return the pending invitation as a member object
    const pendingMember: ListMember = {
      id: `pending-${email}`,
      email,
      avatar_url: getGravatarUrl(email, 80, 'identicon'),
      is_pending: true
    };

    return NextResponse.json(pendingMember, { status: 201 });
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

// PUT /api/wishlists/:id/members - Resend invitation to pending member
export async function PUT(
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

    const email = body.email.trim().toLowerCase();

    // Verify the user is the owner or a member of the wishlist
    const wishlist = await db.prepare('SELECT user_id, title FROM wishlists WHERE id = ?').get(wishlistId) as unknown as WishlistData | undefined;
    
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    const isMember = wishlist.user_id === userId || 
      await db.prepare('SELECT id FROM list_members WHERE wishlist_id = ? AND user_id = ?').get(wishlistId, userId);

    if (!isMember) {
      return NextResponse.json({ error: 'Only members can resend invitations' }, { status: 403 });
    }

    // Check if there's a pending invitation for this email
    const pendingInvitation = await db.prepare('SELECT invitation_code, expires_at FROM pending_invitations WHERE email = ? AND wishlist_id = ?').get(email, wishlistId) as unknown as { invitation_code: string; expires_at: number } | undefined;
    
    if (!pendingInvitation) {
      return NextResponse.json({ error: 'No pending invitation found for this email' }, { status: 404 });
    }

    // Check if invitation is still valid
    if (pendingInvitation.expires_at < Date.now()) {
      return NextResponse.json({ error: 'Invitation has expired. Please create a new one.' }, { status: 400 });
    }

    // Get the inviter's name
    const inviter = await db.prepare('SELECT name FROM users WHERE id = ?').get(userId) as unknown as UserData | undefined;
    const inviterName = inviter?.name || 'A Wunero user';

    // Resend invitation email with the same code
    try {
      await sendWishlistInvitationEmail(email, pendingInvitation.invitation_code, wishlist.title, inviterName);
      console.log(`📧 Invitation email resent to ${email} for wishlist ${wishlistId}`);
    } catch (emailError) {
      console.error('❌ Failed to resend invitation email:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation resent successfully'
    });
  } catch (error) {
    console.error('Error resending invitation:', error);
    return NextResponse.json({ error: 'Failed to resend invitation' }, { status: 500 });
  }
}
