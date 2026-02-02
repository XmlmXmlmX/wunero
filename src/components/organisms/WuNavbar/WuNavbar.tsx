"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "@/i18n";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { WuAvatar, WuLanguageSwitcher, WuDropdown } from "@/components/atoms";
import { getGravatarUrl } from "@/lib/gravatar";
import styles from "./WuNavbar.module.css";
import Link from "next/link";
import GearIcon from "@/components/ui/gear-icon";
import UnorderedListIcon from "@/components/ui/unordered-list-icon";
import LogoutIcon from "@/components/ui/logout-icon";

export function WuNavbar() {
  const t = useTranslations('nav');
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

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
          <WuLanguageSwitcher />
          
          <WuDropdown
            trigger={
              <button
                className={styles.avatarButton}
                aria-label={t('userMenu')}
              >
                <WuAvatar src={avatarUrl} alt={displayName} size="md" fallbackText={displayName} />
              </button>
            }
            isOpen={isDropdownOpen}
            onOpenChange={setIsDropdownOpen}
            align="right"
          >
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
              <span>{t('profile')}</span>
            </button>

            <button
              className={styles.dropdownItem}
              onClick={() => {
                setIsDropdownOpen(false);
                router.push("/wishlists");
              }}
            >
              <UnorderedListIcon />
              <span>{t('wishlists')}</span>
            </button>

            <div className={styles.dropdownDivider} />

            <button className={styles.dropdownItem} onClick={handleSignOut}>
              <LogoutIcon />
              <span>{t('signOut')}</span>
            </button>
          </WuDropdown>
        </div>
      </div>
    </nav>
  );
}