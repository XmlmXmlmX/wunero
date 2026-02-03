"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { WuButton } from "@/components/atoms";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import styles from "./page.module.css";

function VerifyEmailContent() {
  const t = useTranslations('auth.verifyEmail');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage(t('noToken'));
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || t('verified'));
          setEmail(data.email || "");
          
          // Redirect to sign in after 3 seconds
          setTimeout(() => {
            router.push("signin?verified=true");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.error || t('verificationFailed'));
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage(t('verificationError'));
      }
    };

    verifyEmail();
  }, [token, router, t]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === "loading" && (
          <>
            <Loader2 className={styles.iconLoading} size={64} />
            <h1 className={styles.title}>{t('verifying')}</h1>
            <p className={styles.message}>{t('pleaseWait')}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className={styles.iconSuccess} size={64} />
            <h1 className={styles.title}>{t('verified')}</h1>
            <p className={styles.message}>{message}</p>
            {email && <p className={styles.email}>{email}</p>}
            <p className={styles.redirect}>{t('redirecting')}</p>
            <WuButton 
              variant="primary" 
              onClick={() => router.push("signin")}
              fullWidth
            >
              {t('goToSignin')}
            </WuButton>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className={styles.iconError} size={64} />
            <h1 className={styles.title}>{t('verificationFailed')}</h1>
            <p className={styles.message}>{message}</p>
            <div className={styles.actions}>
              <WuButton 
                variant="primary" 
                onClick={() => router.push("register")}
                fullWidth
              >
                {t('backToRegistration')}
              </WuButton>
              <WuButton 
                variant="outline" 
                onClick={() => router.push("signin")}
                fullWidth
              >
                {t('goToSignin')}
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
