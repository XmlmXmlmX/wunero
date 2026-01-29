"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { WuInput } from "@/components/atoms/WuInput/WuInput";
import { WuButton } from "@/components/atoms/WuButton/WuButton";
import styles from "./page.module.css";
import { WuButtonLink } from "@/components/atoms";
import ArrowNarrowLeftIcon from "@/components/ui/arrow-narrow-left-icon";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [invitationInfo, setInvitationInfo] = useState<{ wishlistTitle?: string } | null>(null);

  const invitationCode = searchParams.get("invitation");

  useEffect(() => {
    // If there's an invitation code, we could fetch the invitation details here
    if (invitationCode) {
      // For now, we'll just show a message that they're joining via invitation
      setInvitationInfo({ wishlistTitle: "a wishlist" });
    }
  }, [invitationCode]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const body: any = { email, password };
    if (invitationCode) {
      body.invitation = invitationCode;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Registration failed");
      setIsLoading(false);
      return;
    }

    await signIn("credentials", { redirect: true, callbackUrl: "/wishlists", email, password });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>
            {invitationCode ? `Join a wishlist and connect with friends` : `Join Wunero and start collecting wishes`}
          </p>
        </div>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {invitationCode && (
          <div className={`${styles.infoBox} ${styles.infoBoxInvitation}`}>
            <p className={styles.infoText}>
              🎁 You've been invited to join {invitationInfo?.wishlistTitle || "a wishlist"}. Create your account to accept the invitation!
            </p>
          </div>
        )}

        <form className={styles.content} onSubmit={handleSubmit}>
          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              Create a new account to manage your wishlists, add items, and share with friends.
            </p>
          </div>

          <label htmlFor="email">Email</label>
          <WuInput
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            fullWidth
          />

          <label htmlFor="password">Password (min 8 characters)</label>
          <WuInput
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            minLength={8}
            autoComplete="new-password"
            fullWidth
          />

          <WuButton
            type="submit"
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? "Creating Account..." : "Register"}
          </WuButton>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <p className={styles.signinPrompt}>
            Already have an account?{" "}
            <Link href="/auth/signin" className={styles.link}>
              Sign in here
            </Link>
          </p>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            We use secure credential-based authentication.
          </p>
          <WuButtonLink href="/" variant="ghost">
            <ArrowNarrowLeftIcon /> Back to Home
          </WuButtonLink>
        </div>
      </div>
    </div>
  );
}
