import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import db from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const id = nanoid();
    const now = Date.now();
    const verificationToken = nanoid(32);
    const tokenExpires = now + 24 * 60 * 60 * 1000; // 24 hours

    db.prepare(`
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

    return NextResponse.json({ 
      success: true,
      message: "Registration successful. Please check your email to verify your account."
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
