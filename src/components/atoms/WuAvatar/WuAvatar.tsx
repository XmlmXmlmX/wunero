import { type WuAtom } from "@/types/WuAtom";
import styles from "./WuAvatar.module.css";

interface WuAvatarProps extends WuAtom<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg";
  fallbackText?: string;
}

export function WuAvatar({ src, alt = "Avatar", size = "md", fallbackText, className, ...rest }: WuAvatarProps) {
  const sizeClass = styles[`avatar-${size}`];
  const classes = [styles.avatar, sizeClass, className].filter(Boolean).join(" ");

  // Get initials from fallback text (e.g., "John Doe" -> "JD")
  const getInitials = (text?: string) => {
    if (!text) return "?";
    const parts = text.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  return (
    <div className={classes} {...rest}>
      {src ? (
        <img src={src} alt={alt} className={styles.image} />
      ) : (
        <div className={styles.fallback}>{getInitials(fallbackText)}</div>
      )}
    </div>
  );
}
