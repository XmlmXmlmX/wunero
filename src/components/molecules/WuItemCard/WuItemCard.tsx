import { WuButton, WuButtonLink, WuBadge } from "@/components/atoms";
import { useRef } from "react";
import { sanitizeUrl, isValidImageUrl, getIconHorseUrl } from "@/lib/urlUtils";
import { getShopName } from "@/lib/productParser";
import { type WishItem, type WishItemImportance, type Currency } from "@/types";
import { type WuMolecule } from "@/types/WuMolecule";
import type { AnimatedIconHandle } from "@/components/ui/types";
import { ChevronUpIcon, ChevronDownIcon, PenIcon } from "lucide-react";
import styles from "./WuItemCard.module.css";
import ExternalLinkIcon from "@/components/ui/external-link-icon";
import ShoppingCartIcon from "@/components/ui/shopping-cart-icon";

interface WuItemCardProps extends WuMolecule<HTMLDivElement> {
  item: WishItem;
  onTogglePurchased: (item: WishItem) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  isOwner?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

const importanceLabels: Record<WishItemImportance, string> = {
  "must-have": "Must have",
  "would-love": "Would love",
  "nice-to-have": "Nice to have",
  "not-sure": "Not sure",
};

const importanceVariants: Record<WishItemImportance, "default" | "primary" | "danger"> = {
  "must-have": "danger",
  "would-love": "primary",
  "nice-to-have": "default",
  "not-sure": "default",
};

const currencySymbols: Record<Currency, string> = {
  "EUR": "€",
  "GBP": "£",
  "USD": "$",
};

export function WuItemCard({ 
  item, 
  onTogglePurchased, 
  onDelete,
  onEdit, 
  onMoveUp, 
  onMoveDown, 
  isOwner = true, 
  isFirst = false, 
  isLast = false, 
  className, 
  ...rest 
}: WuItemCardProps) {
  // Refs for animated icons
  const shoppingCartRef = useRef<AnimatedIconHandle>(null);
  const externalLinkRef = useRef<AnimatedIconHandle>(null);
  const editIconRef = useRef<AnimatedIconHandle>(null);

  const showUrl = item.url && sanitizeUrl(item.url);
  const showImage = item.image_url && isValidImageUrl(item.image_url);
  const purchasedQty = item.purchased_quantity || 0;
  const totalQty = item.quantity || 1;
  const isFullyPurchased = purchasedQty >= totalQty;
  const isPartiallyPurchased = purchasedQty > 0 && purchasedQty < totalQty;
  const isPurchased = Boolean(item.purchased) || isFullyPurchased;
  const classes = [styles.card, isPurchased ? styles.purchased : "", className].filter(Boolean).join(" ");
  
  return (
    <div className={classes} {...rest}>
      <div className={styles.contentWrapper}>
        <div className={styles.imageSection}>
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image_url} alt={item.title} className={styles.image} />
          ) : (
            <div className={styles.imagePlaceholder}>🎁</div>
          )}
        </div>

        <div className={styles.mainContent}>
          <div className={styles.header}>
            <h3 
              className={`${styles.title} ${isPurchased ? styles.titlePurchased : ""}`}
              title={item.title}
            >
              {item.title}
            </h3>
            <div className={styles.badges}>
              {totalQty > 1 && (
                <WuBadge variant={isPartiallyPurchased ? "primary" : "default"}>
                  {purchasedQty > 0 ? `${purchasedQty}/${totalQty}x` : `${totalQty}x`}
                </WuBadge>
              )}
              <WuBadge variant={importanceVariants[item.importance]}>
                {importanceLabels[item.importance]}
              </WuBadge>
              {isFullyPurchased && <WuBadge variant="primary">Purchased</WuBadge>}
            </div>
          </div>

          {item.description && <p className={styles.description}>{item.description}</p>}
          {item.price && (
            <p className={styles.price}>
              {item.currency ? currencySymbols[item.currency] : '€'} {item.price}
            </p>
          )}
        </div>
          
        {isOwner && (onMoveUp || onMoveDown) && (
          <div className={styles.reorderButtons}>
            <button
              type="button"
              onClick={() => onMoveUp?.(item.id)}
              disabled={isFirst}
              className={styles.reorderButton}
              aria-label="Move up"
            >
              <ChevronUpIcon size={20} />
            </button>
            <button
              type="button"
              onClick={() => onMoveDown?.(item.id)}
              disabled={isLast}
              className={styles.reorderButton}
              aria-label="Move down"
            >
              <ChevronDownIcon size={20} />
            </button>
          </div>
        )}
      </div>
      <div className={styles.actions}>
        {showUrl && (
          <div className={styles.bottomLinks}><WuButtonLink href={showUrl} target="_blank" rel="noopener noreferrer" variant="ghost" style={{ '--icon-horse-url': `url(${getIconHorseUrl(item.url!)})` } as React.CSSProperties} className={styles.horseIcon}>
            View on {getShopName(item.url!)} <ExternalLinkIcon ref={externalLinkRef} />
          </WuButtonLink></div>
        )}
        <WuButton
          type="button"
          variant={isFullyPurchased ? "outline" : "secondary"}
          onClick={() => onTogglePurchased(item)}
          animatedIconRef={shoppingCartRef}
        >
          {isFullyPurchased ? "Unmark one" : <><ShoppingCartIcon ref={shoppingCartRef} /> {totalQty > 1 ? "Mark one as Purchased" : "Mark as Purchased"}</>}
        </WuButton>
        {isOwner && (
          <>
            {onEdit && (
              <WuButton type="button" variant="outline" onClick={() => onEdit(item.id)} animatedIconRef={editIconRef}>
                <PenIcon ref={editIconRef} size={16} /> Edit
              </WuButton>
            )}
            <WuButton type="button" variant="danger" onClick={() => onDelete(item.id)}>
              Delete
            </WuButton>
          </>
        )}
      </div>
    </div>
  );
}
