"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { WuAvatar } from "@/components/atoms";
import { getGravatarUrl } from "@/lib/gravatar";
import styles from "./WuNavbar.module.css";
import Link from "next/link";
import GearIcon from "@/components/ui/gear-icon";
import UnorderedListIcon from "@/components/ui/unordered-list-icon";
import LogoutIcon from "@/components/ui/logout-icon";

export function WuNavbar() {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  if (status === "loading") {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const avatarUrl = user.image || (user.email ? getGravatarUrl(user.email, 80) : null);
  const displayName = user.name || user.email || "User";

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">Wunero</Link>
        </div>

        <div className={styles.actions}>
          <div className={styles.avatarWrapper} ref={dropdownRef}>
            <button
              className={styles.avatarButton}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="User menu"
            >
              <WuAvatar src={avatarUrl} alt={displayName} size="md" fallbackText={displayName} />
            </button>

            {isDropdownOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownName}>{displayName}</div>
                  {user.email && <div className={styles.dropdownEmail}>{user.email}</div>}
                </div>

                <div className={styles.dropdownDivider} />

                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push("/profile");
                  }}
                >
                  <GearIcon />
                  <span>Profile Settings</span>
                </button>

                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push("/wishlists");
                  }}
                >
                  <UnorderedListIcon />
                  <span>My Wishlists</span>
                </button>

                <div className={styles.dropdownDivider} />

                <button className={styles.dropdownItem} onClick={handleSignOut}>
                  <LogoutIcon />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
