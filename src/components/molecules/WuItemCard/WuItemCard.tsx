import { WuButton, WuButtonLink } from "@/components/atoms";
import { sanitizeUrl, isValidImageUrl } from "@/lib/urlUtils";
import { type WishItem } from "@/types";
import { type WuMolecule } from "@/types/WuMolecule";
import styles from "./WuItemCard.module.css";

interface WuItemCardProps extends WuMolecule<HTMLDivElement> {
  item: WishItem;
  onTogglePurchased: (item: WishItem) => void;
  onDelete: (id: string) => void;
}

export function WuItemCard({ item, onTogglePurchased, onDelete, className, ...rest }: WuItemCardProps) {
  const showUrl = item.url && sanitizeUrl(item.url);
  const showImage = item.image_url && isValidImageUrl(item.image_url);
  const isPurchased = Boolean(item.purchased);
  const classes = [styles.card, isPurchased ? styles.purchased : "", className].filter(Boolean).join(" ");
  return (
    <div className={classes} {...rest}>
      <div className={styles.header}>
        <h3 className={`${styles.title} ${isPurchased ? styles.titlePurchased : ""}`}>{item.title}</h3>
        {item.priority > 0 && <span className={styles.badge}>Priority: {item.priority}</span>}
        {isPurchased && <span className={`${styles.badge} ${styles.badgeSuccess}`}>Purchased</span>}
      </div>

      {item.description && <p className={styles.description}>{item.description}</p>}
      {item.price && <p className={styles.price}>{item.price}</p>}

      {showUrl && (
        <WuButtonLink href={showUrl} target="_blank" rel="noopener noreferrer" variant="ghost">
          🔗 View Product
        </WuButtonLink>
      )}

      {showImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt={item.title} className={styles.image} />
      )}

      <div className={styles.actions}>
        <WuButton
          type="button"
          variant={isPurchased ? "outline" : "secondary"}
          onClick={() => onTogglePurchased(item)}
        >
          {isPurchased ? "Unmark" : "Mark as Purchased"}
        </WuButton>
        <WuButton type="button" variant="danger" onClick={() => onDelete(item.id)}>
          Delete
        </WuButton>
      </div>
    </div>
  );
}
