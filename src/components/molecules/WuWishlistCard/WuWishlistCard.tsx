import { WuButton, WuButtonLink } from "@/components/atoms";
import { type Wishlist } from "@/types";
import { type WuMolecule } from "@/types/WuMolecule";
import styles from "./WuWishlistCard.module.css";

interface WuWishlistCardProps extends WuMolecule<HTMLDivElement> {
  wishlist: Wishlist;
  onDelete: (id: string) => void;
}

export function WuWishlistCard({ wishlist, onDelete, className, ...rest }: WuWishlistCardProps) {
  const createdDate = new Date(wishlist.created_at).toLocaleDateString();
  const classes = [styles.card, className].filter(Boolean).join(" ");
  return (
    <div className={classes} {...rest}>
      <div>
        <h3 className={styles.title}>{wishlist.title}</h3>
        {wishlist.description && <p className={styles.description}>{wishlist.description}</p>}
      </div>
      <div className={styles.meta}>Created {createdDate}</div>
      <div className={styles.actions}>
        <WuButtonLink href={`/wishlists/${wishlist.id}`} variant="primary" fullWidth>
          View Items
        </WuButtonLink>
        <WuButton type="button" variant="danger" onClick={() => onDelete(wishlist.id)}>
          Delete
        </WuButton>
      </div>
    </div>
  );
}
