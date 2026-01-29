"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { WuInput } from "@/components/atoms/WuInput/WuInput";
import { WuButton } from "@/components/atoms/WuButton/WuButton";
import { WuButtonLink } from "@/components/atoms";
import ArrowNarrowLeftIcon from "@/components/ui/arrow-narrow-left-icon";
import styles from "../signin/page.module.css";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link");
    }
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to reset password");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Invalid Reset Link</h1>
            <p className={styles.subtitle}>
              The password reset link is invalid or has expired.
            </p>
          </div>
          <div className={styles.footer}>
            <WuButtonLink href="/auth/forgot-password" variant="ghost">
              Request New Link
            </WuButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.subtitle}>Enter your new password</p>
        </div>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className={styles.success}>
            <p>Password reset successful! Redirecting to sign in...</p>
          </div>
        )}

        {!success && (
          <form className={styles.content} onSubmit={handleSubmit}>
            <label htmlFor="password">New Password (min 8 characters)</label>
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

            <label htmlFor="confirmPassword">Confirm Password</label>
            <WuInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? "Resetting..." : "Reset Password"}
            </WuButton>
          </form>
        )}

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Remember your password?{" "}
            <Link href="/auth/signin" className={styles.link}>
              Sign in here
            </Link>
          </p>
          <WuButtonLink href="/" variant="ghost">
            <ArrowNarrowLeftIcon /> Back to Home
          </WuButtonLink>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.subtitle}>Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
