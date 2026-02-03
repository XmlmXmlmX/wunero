"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n";
import { WuButton, WuInput, WuAvatar } from "@/components/atoms";
import { WuPageHeader } from "@/components/organisms/WuPageHeader/WuPageHeader";
import { getGravatarUrl } from "@/lib/gravatar";
import styles from "./page.module.css";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: number;
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Email form
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      loadProfile();
    }
  }, [status]);

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setName(data.name || "");
        setAvatarUrl(data.avatar_url || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatar_url: avatarUrl || null }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setProfileMessage({ type: "success", text: t("profileInfo.successMessage") });
        
        // Update session
        await update({ name, image: avatarUrl || null });
      } else {
        const data = await response.json();
        setProfileMessage({ type: "error", text: data.error || t("profileInfo.errorMessage") });
      }
    } catch (error) {
      setProfileMessage({ type: "error", text: t("profileInfo.errorMessage") });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: t("password.passwordsNoMatch") });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: t("password.passwordTooShort") });
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        setPasswordMessage({ type: "success", text: t("password.successMessage") });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await response.json();
        setPasswordMessage({ type: "error", text: data.error || t("password.errorMessage") });
      }
    } catch (error) {
      setPasswordMessage({ type: "error", text: t("password.errorMessage") });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMessage(null);

    setChangingEmail(true);

    try {
      const response = await fetch("/api/user/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, password: emailPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        setEmailMessage({ type: "success", text: t("email.successMessage") });
        setNewEmail("");
        setEmailPassword("");
        
        // Reload profile
        setTimeout(() => {
          loadProfile();
        }, 1000);
      } else {
        const data = await response.json();
        setEmailMessage({ type: "error", text: data.error || t("email.errorMessage") });
      }
    } catch (error) {
      setEmailMessage({ type: "error", text: t("email.errorMessage") });
    } finally {
      setChangingEmail(false);
    }
  };

  const useGravatar = () => {
    if (profile?.email) {
      const gravatarUrl = getGravatarUrl(profile.email, 200);
      setAvatarUrl(gravatarUrl);
    }
  };

  if (loading || status === "loading") {
    return <div className={styles.loading}>{t("loading")}</div>;
  }

  if (!profile) {
    return null;
  }

  const displayAvatarUrl = avatarUrl || (profile.email ? getGravatarUrl(profile.email, 200) : null);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <WuPageHeader title={t("title")} backHref="/wishlists" backLabel={t("backToWishlists")} />

        <div className={styles.content}>
          {/* Profile Section */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t("profileInfo.title")}</h2>
            
            <div className={styles.avatarSection}>
              <WuAvatar src={displayAvatarUrl} alt={name || profile.email} size="lg" fallbackText={name || profile.email} />
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className={styles.field}>
                <label htmlFor="name" className={styles.label}>
                  {t("profileInfo.displayName")}
                </label>
                <WuInput
                  id="name"
                  type="text"
                  placeholder={t("profileInfo.displayNamePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="avatar" className={styles.label}>
                  {t("profileInfo.avatarUrl")}
                </label>
                <WuInput
                  id="avatar"
                  type="url"
                  placeholder={t("profileInfo.avatarUrlPlaceholder")}
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  fullWidth
                />
                <button type="button" className={styles.linkButton} onClick={useGravatar}>
                  {t("profileInfo.useGravatar")}
                </button>
              </div>

              {profileMessage && (
                <div className={profileMessage.type === "success" ? styles.success : styles.error}>
                  {profileMessage.text}
                </div>
              )}

              <WuButton type="submit" variant="primary" isLoading={savingProfile}>
                {savingProfile ? t("profileInfo.saving") : t("profileInfo.saveButton")}
              </WuButton>
            </form>
          </div>

          {/* Email Section */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t("email.title")}</h2>
            <p className={styles.hint}>{t("email.currentEmail")} <strong>{profile.email}</strong></p>
            
            <form onSubmit={handleChangeEmail}>
              <div className={styles.field}>
                <label htmlFor="new-email" className={styles.label}>
                  {t("email.newEmail")}
                </label>
                <WuInput
                  id="new-email"
                  type="email"
                  placeholder={t("email.newEmailPlaceholder")}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  fullWidth
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="email-password" className={styles.label}>
                  {t("email.confirmPassword")}
                </label>
                <WuInput
                  id="email-password"
                  type="password"
                  placeholder={t("email.confirmPasswordPlaceholder")}
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  required
                  fullWidth
                />
              </div>

              {emailMessage && (
                <div className={emailMessage.type === "success" ? styles.success : styles.error}>
                  {emailMessage.text}
                </div>
              )}

              <WuButton type="submit" variant="primary" isLoading={changingEmail}>
                {changingEmail ? t("email.changing") : t("email.changeButton")}
              </WuButton>
            </form>
          </div>

          {/* Password Section */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t("password.title")}</h2>
            
            <form onSubmit={handleChangePassword}>
              <div className={styles.field}>
                <label htmlFor="current-password" className={styles.label}>
                  {t("password.currentPassword")}
                </label>
                <WuInput
                  id="current-password"
                  type="password"
                  placeholder={t("password.currentPasswordPlaceholder")}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  fullWidth
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="new-password" className={styles.label}>
                  {t("password.newPassword")}
                </label>
                <WuInput
                  id="new-password"
                  type="password"
                  placeholder={t("password.newPasswordPlaceholder")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  fullWidth
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="confirm-password" className={styles.label}>
                  {t("password.confirmPassword")}
                </label>
                <WuInput
                  id="confirm-password"
                  type="password"
                  placeholder={t("password.confirmPasswordPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  fullWidth
                />
              </div>

              {passwordMessage && (
                <div className={passwordMessage.type === "success" ? styles.success : styles.error}>
                  {passwordMessage.text}
                </div>
              )}

              <WuButton type="submit" variant="primary" isLoading={changingPassword}>
                {changingPassword ? t("password.changing") : t("password.changeButton")}
              </WuButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
