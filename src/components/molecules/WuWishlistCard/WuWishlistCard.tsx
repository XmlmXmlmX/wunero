import { WuButton, WuButtonLink, WuBadge } from "@/components/atoms";
import { type Wishlist } from "@/types";
import { type WuMolecule } from "@/types/WuMolecule";
import styles from "./WuWishlistCard.module.css";
import { File, LockIcon, User } from "lucide-react";

interface WuWishlistCardProps extends WuMolecule<HTMLDivElement> {
  wishlist: Wishlist;
  onDelete: (id: string) => void;
  isFollowed?: boolean;
}

export function WuWishlistCard({ wishlist, onDelete, isFollowed = false, className, ...rest }: WuWishlistCardProps) {
  const createdDate = new Date(wishlist.created_at).toLocaleDateString();
  const classes = [styles.card, className].filter(Boolean).join(" ");
  return (
    <div className={classes} {...rest}>
      <div>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>{wishlist.title}</h3>
          <WuBadge variant="primary">
            <File />
            { wishlist.items_count} {wishlist.items_count === 1 ? 'Item' : 'Items'}
          </WuBadge>
          {wishlist.members_count && wishlist.members_count > 0 ? (
            <WuBadge variant="default">
              <User />
              {wishlist.members_count} { wishlist.members_count === 1 ? 'Member' : 'Members' }
            </WuBadge>
          ) : null}
          {wishlist.is_member ? (
            <WuBadge variant="default">Shared</WuBadge>
          ) : null}
          {wishlist.is_private ?
            <WuBadge variant="danger">
              <LockIcon />
              Private
            </WuBadge> : <></>
          }
        </div>
        {wishlist.description && <p className={styles.description}>{wishlist.description}</p>}
        {isFollowed && (wishlist.owner_name || wishlist.owner_email) && (
          <p className={styles.owner}>by {wishlist.owner_name || wishlist.owner_email}</p>
        )}
      </div>
      <div className={styles.meta}>
        {isFollowed ? `Following since ${new Date(wishlist.followed_at || wishlist.created_at).toLocaleDateString()}` : `Created ${createdDate}`}
      </div>
      <div className={styles.actions}>
        <WuButtonLink href={`/wishlists/${wishlist.id}`} variant="primary" fullWidth>
          View Items
        </WuButtonLink>
        <WuButton type="button" variant="danger" onClick={() => onDelete(wishlist.id)}>
          {isFollowed ? 'Unfollow' : 'Delete'}
        </WuButton>
      </div>
    </div>
  );
}
