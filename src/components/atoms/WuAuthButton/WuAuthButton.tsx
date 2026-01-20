"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { WuButton } from "./WuButton/WuButton";

export function WuAuthButton() {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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
