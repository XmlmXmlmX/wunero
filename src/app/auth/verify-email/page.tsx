"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { WuButton } from "@/components/atoms";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import styles from "./page.module.css";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
          setEmail(data.email || "");
          
          // Redirect to sign in after 3 seconds
          setTimeout(() => {
            router.push("/auth/signin?verified=true");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("Failed to verify email. Please try again.");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === "loading" && (
          <>
            <Loader2 className={styles.iconLoading} size={64} />
            <h1 className={styles.title}>Verifying your email...</h1>
            <p className={styles.message}>Please wait while we verify your account.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className={styles.iconSuccess} size={64} />
            <h1 className={styles.title}>Email Verified!</h1>
            <p className={styles.message}>{message}</p>
            {email && <p className={styles.email}>{email}</p>}
            <p className={styles.redirect}>Redirecting to sign in...</p>
            <WuButton 
              variant="primary" 
              onClick={() => router.push("/auth/signin")}
              fullWidth
            >
              Go to Sign In
            </WuButton>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className={styles.iconError} size={64} />
            <h1 className={styles.title}>Verification Failed</h1>
            <p className={styles.message}>{message}</p>
            <div className={styles.actions}>
              <WuButton 
                variant="primary" 
                onClick={() => router.push("/auth/register")}
                fullWidth
              >
                Back to Registration
              </WuButton>
              <WuButton 
                variant="outline" 
                onClick={() => router.push("/auth/signin")}
                fullWidth
              >
                Go to Sign In
              </WuButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.card}>
          <Loader2 className={styles.iconLoading} size={64} />
          <h1 className={styles.title}>Loading...</h1>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
