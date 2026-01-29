"use client";

import { useState } from "react";
import Link from "next/link";
import { WuInput } from "@/components/atoms/WuInput/WuInput";
import { WuButton } from "@/components/atoms/WuButton/WuButton";
import { WuButtonLink } from "@/components/atoms";
import ArrowNarrowLeftIcon from "@/components/ui/arrow-narrow-left-icon";
import styles from "../signin/page.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send reset link");
        return;
      }

      setMessage(data.message);
      setEmail("");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Forgot Password</h1>
          <p className={styles.subtitle}>
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className={styles.success}>
            <p>{message}</p>
          </div>
        )}

        <form className={styles.content} onSubmit={handleSubmit}>
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

          <WuButton
            type="submit"
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </WuButton>
        </form>

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
