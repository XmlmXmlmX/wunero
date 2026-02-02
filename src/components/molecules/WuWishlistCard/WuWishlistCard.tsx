import { WuButton, WuButtonLink, WuBadge } from "@/components/atoms";
import { type Wishlist } from "@/types";
import { type WuMolecule } from "@/types/WuMolecule";
import styles from "./WuWishlistCard.module.css";
import { File, LockIcon, TrashIcon, User } from "lucide-react";

interface WuWishlistCardProps extends WuMolecule<HTMLDivElement> {
  wishlist: Wishlist;
  onDelete: (id: string) => void;
  isFollowed?: boolean;
  translations?: {
    item: string;
    items: string;
    member: string;
    members: string;
    shared: string;
    private: string;
    created: string;
    followingSince: string;
    by: string;
    viewItems: string;
    delete: string;
    unfollow: string;
  };
}

const defaultTranslations = {
  item: "Item",
  items: "Items",
  member: "Member",
  members: "Members",
  shared: "Shared",
  private: "Private",
  created: "Created",
  followingSince: "Following since",
  by: "by",
  viewItems: "View Items",
  delete: "Delete",
  unfollow: "Unfollow",
};

export function WuWishlistCard({ wishlist, onDelete, isFollowed = false, translations = defaultTranslations, className, ...rest }: WuWishlistCardProps) {
  const t = translations;
  const createdDate = new Date(wishlist.created_at).toLocaleDateString();
  const classes = [styles.card, className].filter(Boolean).join(" ");
  return (
    <div className={classes} {...rest}>
      <div>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>{wishlist.title}</h3>
          <WuBadge variant="primary">
            <File />
            { wishlist.items_count} {wishlist.items_count === 1 ? t.item : t.items}
          </WuBadge>
          {wishlist.members_count && wishlist.members_count > 0 ? (
            <WuBadge variant="default">
              <User />
              {wishlist.members_count} { wishlist.members_count === 1 ? t.member : t.members }
            </WuBadge>
          ) : null}
          {wishlist.is_member ? (
            <WuBadge variant="default">{t.shared}</WuBadge>
          ) : null}
          {wishlist.is_private ?
            <WuBadge variant="danger">
              <LockIcon />
              {t.private}
            </WuBadge> : <></>
          }
        </div>
        {wishlist.description && <p className={styles.description}>{wishlist.description}</p>}
        {isFollowed && (wishlist.owner_name || wishlist.owner_email) && (
          <p className={styles.owner}>{t.by} {wishlist.owner_name || wishlist.owner_email}</p>
        )}
      </div>
      <div className={styles.meta}>
        {isFollowed ? `${t.followingSince} ${new Date(wishlist.followed_at || wishlist.created_at).toLocaleDateString()}` : `${t.created} ${createdDate}`}
      </div>
      <div className={styles.actions}>
        <WuButtonLink href={`/wishlists/${wishlist.id}`} variant="primary" fullWidth>
          {t.viewItems}
        </WuButtonLink>
        <WuButton type="button" variant="danger" onClick={() => onDelete(wishlist.id)}>
          {isFollowed ? t.unfollow : <TrashIcon aria-label={t.delete} />}
        </WuButton>
      </div>
    </div>
  );
}
