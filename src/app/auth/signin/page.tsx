"use client";

import { signIn, getProviders, type ClientSafeProvider } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { WuInput } from "@/components/atoms/WuInput/WuInput";
import { WuButton } from "@/components/atoms/WuButton/WuButton";
import styles from "./page.module.css";
import { WuButtonLink } from "@/components/atoms";
import ArrowNarrowLeftIcon from "@/components/ui/arrow-narrow-left-icon";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/wishlists";
  const error = searchParams.get("error");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null);

  useEffect(() => {
    getProviders().then(setProviders).catch(() => setProviders(null));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setLocalError(null);
    const result = await signIn("credentials", {
      redirect: true,
      callbackUrl,
      email,
      password,
    });
    if (result?.error) {
      setLocalError("Invalid email or password");
      setIsLoading(false);
    }
  };

  const displayedError = localError || (error ? "Authentication failed" : null);
  const socialProviders = Object.values(providers ?? {}).filter(provider => provider.id !== "credentials");

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome to Wunero</h1>
          <p className={styles.subtitle}>Sign in to manage your wishlists</p>
        </div>

        {displayedError && (
          <div className={styles.error}>
            <p>{displayedError}</p>
          </div>
        )}

        {socialProviders.length > 0 && (
          <div className={styles.providers}>
            {socialProviders.map(provider => (
              <WuButton
                key={provider.id}
                type="button"
                onClick={() => signIn(provider.id, { callbackUrl })}
                variant="secondary"
                fullWidth
              >
                Continue with {provider.name}
              </WuButton>
            ))}
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

          <label htmlFor="password">Password</label>
          <WuInput
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            fullWidth
          />

          <WuButton
            type="submit"
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </WuButton>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className={styles.link}>
              Register here
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

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
