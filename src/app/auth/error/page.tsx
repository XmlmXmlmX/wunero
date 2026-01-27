"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { WuButton } from "@/components/atoms/WuButton/WuButton";
import styles from "./page.module.css";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    OAuthSignin: "Error connecting to provider. Please try again.",
    OAuthCallback: "Error during callback. Please try again.",
    OAuthCreateAccount: "Could not create account with provider.",
    EmailCreateAccount: "Could not create account.",
    Callback: "An error occurred in the callback handler.",
    EmailSignInError: "Could not sign in with email.",
    CredentialsSignin: "Sign in failed. Please check your credentials.",
    default: "An authentication error occurred.",
  };

  const message = error ? errorMessages[error] || errorMessages.default : errorMessages.default;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Authentication Error</h1>
          <p className={styles.subtitle}>{message}</p>
        </div>

        <div className={styles.actions}>
          <WuButton href="/auth/signin">
            Try Again
          </WuButton>
          <WuButton href="/" variant="outline">
            Back to Home
          </WuButton>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
