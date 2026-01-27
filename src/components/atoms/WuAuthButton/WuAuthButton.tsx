"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { WuButton } from "@/components/atoms";
import styles from "./WuAuthButton.module.css";

export function WuAuthButton() {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <div className={styles.container}>
        <span>{session.user.email}</span>
        <WuButton
          type="button"
          variant="outline"
          onClick={() => signOut()}
        >
          Sign Out
        </WuButton>
      </div>
    );
  }

  return (
    <WuButton
      type="button"
      variant="primary"
      onClick={() => signIn("keycloak")}
    >
      Sign In
    </WuButton>
  );
}
