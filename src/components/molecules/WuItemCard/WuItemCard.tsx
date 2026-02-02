import { WuButton, WuButtonLink, WuBadge, WuTooltip } from "@/components/atoms";
import { useRef } from "react";
import { sanitizeUrl, isValidImageUrl, getIconHorseUrl, addAmazonPartnerTag, isAmazonAffiliateUrl } from "@/lib/urlUtils";
import { getShopName } from "@/lib/productParser";
import { type WishItem, type WishItemImportance, type Currency } from "@/types";
import { type WuMolecule } from "@/types/WuMolecule";
import type { AnimatedIconHandle } from "@/components/ui/types";
import { ChevronUpIcon, ChevronDownIcon, PenIcon, Trash, TrashIcon, HeartIcon, HeartOff, HeartPlus } from "lucide-react";
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
  translations?: {
    purchased: string;
    mustHave: string;
    wouldLove: string;
    niceToHave: string;
    notSure: string;
    viewOn: string;
    affiliate: string;
    affiliateHint: string;
    unmarkOne: string;
    markAsPurchased: string;
    markOneAsPurchased: string;
    edit: string;
    delete: string;
    moveUp: string;
    moveDown: string;
  };
}

const defaultTranslations = {
  purchased: "Purchased",
  mustHave: "Must have",
  wouldLove: "Would love",
  niceToHave: "Nice to have",
  notSure: "Not sure",
  viewOn: "View on",
  affiliate: "Affiliate link",
  affiliateHint: "Contains an affiliate link",
  unmarkOne: "Unmark one",
  markAsPurchased: "Mark as Purchased",
  markOneAsPurchased: "Mark one as Purchased",
  edit: "Edit",
  delete: "Delete",
  moveUp: "Move up",
  moveDown: "Move down",
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

function getImportanceIcons(importance: WishItemImportance) {
  switch (importance) {
    case "must-have":
      return <><HeartIcon fill="currentColor" strokeWidth={0}/>
        <HeartIcon fill="currentColor" strokeWidth={0}/>
        <HeartIcon fill="currentColor" strokeWidth={0}/>
        <HeartIcon fill="currentColor" strokeWidth={0}/></>;
    case "would-love":
      return <>
        <HeartIcon fill="currentColor" strokeWidth={0}/>
        <HeartIcon fill="currentColor" strokeWidth={0}/>
        <HeartIcon fill="currentColor" strokeWidth={0}/>
        <HeartIcon /></>;
    case "nice-to-have":
      return <>
        <HeartIcon fill="currentColor" strokeWidth={0}/>
        <HeartIcon fill="currentColor" strokeWidth={0}/>
        <HeartIcon />
        <HeartIcon /></>;

    case "not-sure":
      return <>
        <HeartIcon fill="currentColor" strokeWidth={0}/>
        <HeartIcon />
        <HeartIcon />
        <HeartIcon /></>;
  }
}

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
  translations = defaultTranslations,
  className, 
  ...rest 
}: WuItemCardProps) {
  const t = translations;
  
  // Importance labels with translations
  const importanceLabels: Record<WishItemImportance, string> = {
    "must-have": t.mustHave,
    "would-love": t.wouldLove,
    "nice-to-have": t.niceToHave,
    "not-sure": t.notSure,
  };
  
  // Refs for animated icons
  const shoppingCartRef = useRef<AnimatedIconHandle>(null);
  const externalLinkRef = useRef<AnimatedIconHandle>(null);
  const editIconRef = useRef<AnimatedIconHandle>(null);

  const showUrl = item.url && sanitizeUrl(item.url);
  const partnerUrl = showUrl ? addAmazonPartnerTag(showUrl) : undefined;
  const showAffiliateLabel = Boolean(partnerUrl && isAmazonAffiliateUrl(partnerUrl));
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
                {getImportanceIcons(item.importance)}
              </WuBadge>
              {isFullyPurchased && <WuBadge variant="primary">{t.purchased}</WuBadge>}
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
              aria-label={t.moveUp}
            >
              <ChevronUpIcon size={20} />
            </button>
            <button
              type="button"
              onClick={() => onMoveDown?.(item.id)}
              disabled={isLast}
              className={styles.reorderButton}
              aria-label={t.moveDown}
            >
              <ChevronDownIcon size={20} />
            </button>
          </div>
        )}
      </div>
      <div className={styles.actions}>
        {showUrl && (
          <div className={styles.bottomLinks}>
            <WuButtonLink href={partnerUrl ?? showUrl} target="_blank" rel="noopener noreferrer" variant="ghost" style={{ '--icon-horse-url': `url(${getIconHorseUrl(item.url!)})` } as React.CSSProperties} className={styles.horseIcon}>
              {t.viewOn} {getShopName(item.url!)} <ExternalLinkIcon ref={externalLinkRef} />
            </WuButtonLink>
            {showAffiliateLabel && (
              <WuTooltip content={t.affiliateHint}>
                <span className={styles.affiliateLabel}>{t.affiliate}</span>
              </WuTooltip>
            )}
          </div>
        )}
        <WuButton
          type="button"
          variant={isFullyPurchased ? "outline" : "secondary"}
          onClick={() => onTogglePurchased(item)}
          animatedIconRef={shoppingCartRef}
        >
          {isFullyPurchased ? t.unmarkOne : <><ShoppingCartIcon ref={shoppingCartRef} /> {totalQty > 1 ? t.markOneAsPurchased : t.markAsPurchased}</>}
        </WuButton>
        {isOwner && (
          <>
            {onEdit && (
              <WuButton type="button" variant="outline" onClick={() => onEdit(item.id)} animatedIconRef={editIconRef}>
                <PenIcon ref={editIconRef} size={16} aria-label= {t.edit} />
              </WuButton>
            )}
            <WuButton type="button" variant="danger" onClick={() => onDelete(item.id)}>
              <TrashIcon aria-label={t.delete} />
            </WuButton>
          </>
        )}
      </div>
    </div>
  );
}
