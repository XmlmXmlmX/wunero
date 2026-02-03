import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import db from "@/lib/storage";
import { sendVerificationEmail } from "@/lib/email";

interface RegisterRequest {
  email?: unknown;
  password?: unknown;
  invitation?: unknown;
}

export async function POST(request: Request) {
  try {
    const body: RegisterRequest = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const invitationCode = typeof body.invitation === "string" ? body.invitation : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const id = nanoid();
    const now = Date.now();
    const verificationToken = nanoid(32);
    const tokenExpires = now + 24 * 60 * 60 * 1000; // 24 hours

    await db.prepare(`
      INSERT INTO users (
        id, 
        email, 
        password_hash, 
        created_at, 
        email_verified, 
        verification_token, 
        verification_token_expires
      ) VALUES (?, ?, ?, ?, 0, ?, ?)
    `).run(id, email, password_hash, now, verificationToken, tokenExpires);

    // Send verification email
    try {
      console.log('📧 Attempting to send verification email to:', email);
      await sendVerificationEmail(email, verificationToken);
      console.log('✅ Verification email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      // Don't fail registration if email fails, but log it
    }

    // If there's an invitation code, process pending invitations for this email
    if (invitationCode) {
      try {
        const invitation = await db.prepare(
          'SELECT wishlist_id FROM pending_invitations WHERE invitation_code = ? AND email = ? AND expires_at > ?'
        ).get(invitationCode, email, now) as unknown as { wishlist_id: string } | undefined;

        if (invitation) {
          // Add the user to the wishlist
          const memberId = nanoid();
          await db.prepare(`
            INSERT INTO list_members (id, wishlist_id, user_id, created_at)
            VALUES (?, ?, ?, ?)
          `).run(memberId, invitation.wishlist_id, id, now);

          // Delete the invitation
          await db.prepare('DELETE FROM pending_invitations WHERE invitation_code = ?').run(invitationCode);

          console.log(`✅ User ${email} automatically added to wishlist ${invitation.wishlist_id}`);
        }
      } catch (inviteError) {
        console.error('❌ Failed to process invitation:', inviteError);
        // Don't fail registration if invitation processing fails
      }
    } else {
      // Even without invitation code, check if there are any pending invitations for this email
      try {
        const pendingInvitations = await db.prepare(
          'SELECT id, wishlist_id FROM pending_invitations WHERE email = ? AND expires_at > ?'
        ).all(email, now) as unknown as { id: string; wishlist_id: string }[];

        if (pendingInvitations.length > 0) {
          // Add the user to all wishlists with pending invitations
          for (const inv of pendingInvitations) {
            const memberId = nanoid();
            await db.prepare(`
              INSERT INTO list_members (id, wishlist_id, user_id, created_at)
              VALUES (?, ?, ?, ?)
            `).run(memberId, inv.wishlist_id, id, now);

            // Delete the invitation
            await db.prepare('DELETE FROM pending_invitations WHERE id = ?').run(inv.id);
          }

          console.log(`✅ User ${email} automatically added to ${pendingInvitations.length} wishlists`);
        }
      } catch (inviteError) {
        console.error('❌ Failed to process pending invitations:', inviteError);
        // Don't fail registration if invitation processing fails
      }
    }

    return NextResponse.json({ 
      success: true,
      message: "Registration successful. Please check your email to verify your account."
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
