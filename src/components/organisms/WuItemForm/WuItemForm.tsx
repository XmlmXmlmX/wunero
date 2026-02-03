import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { WuButton, WuInput, WuTextArea, WuCheckbox, WuSelect } from "@/components/atoms";
import type { AnimatedIconHandle } from "@/components/ui/types";
import { WuInputGroup } from "@/components/molecules/WuInputGroup/WuInputGroup";
import { WuModal } from "@/components/molecules/WuModal/WuModal";
import ExternalLinkIcon from "@/components/ui/external-link-icon";
import { isSupportedPlatform } from "@/lib/productParser";
import { type WuOrganism } from "@/types/WuOrganism";
import type { WishItemImportance, Currency } from "@/types";
import styles from "./WuItemForm.module.css";
import { HeartIcon } from "lucide-react";

interface WuItemFormProps extends Omit<WuOrganism<HTMLDivElement>, 'onSubmit'> {
  onSubmit: (payload: { 
    title: string; 
    description?: string; 
    url?: string; 
    priority: number;
    quantity: number;
    importance: WishItemImportance;
    price?: string;
    currency: Currency;
  }) => Promise<void> | void;
  onCancel?: () => void;
  initialValues?: {
    title?: string;
    description?: string;
    url?: string;
    priority?: number;
    quantity?: number;
    importance?: WishItemImportance;
    price?: string;
    currency?: Currency;
  };
  isEditMode?: boolean;
  inModal?: boolean;
}

interface ParsedProductData {
  title?: string;
  price?: string;
  currency?: Currency;
  image_url?: string;
  blocked?: boolean;
  timedOut?: boolean;
}

export function WuItemForm({ onSubmit, onCancel, initialValues, isEditMode = false, inModal = false, className, ...rest }: WuItemFormProps) {
  const t = useTranslations("wishlists.itemForm");
  const tItem = useTranslations("wishlists.item");
  
  // Ref for animated icon
  const externalLinkIconRef = useRef<AnimatedIconHandle>(null);

  const [url, setUrl] = useState(initialValues?.url || "");
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [price, setPrice] = useState(initialValues?.price || "");
  const [currency, setCurrency] = useState<Currency>(initialValues?.currency || "EUR");
  const [priority, setPriority] = useState(initialValues?.priority || 1);
  const [quantity, setQuantity] = useState(initialValues?.quantity || 1);
  const [importance, setImportance] = useState<WishItemImportance>(initialValues?.importance || "would-love");
  const [submitting, setSubmitting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [showManualForm, setShowManualForm] = useState(isEditMode || !!initialValues);
  const [parseError, setParseError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showReparseDialog, setShowReparseDialog] = useState(false);
  const [newParsedData, setNewParsedData] = useState<ParsedProductData | null>(null);
  const [selectedDataFields, setSelectedDataFields] = useState<Set<string>>(new Set());
  const [originalUrl] = useState(initialValues?.url || "");

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleParseUrl = async () => {
    if (!url.trim()) {
      setShowManualForm(true);
      return;
    }

    setParsing(true);
    setParseError(null);

    try {
      const response = await fetch('/api/parse-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse URL');
      }

      const productInfo = await response.json();
      
      if (productInfo.timedOut) {
        if (productInfo.blocked) {
          setParseError('This website blocks automated requests. Please fill in the details manually.');
        } else {
          setParseError('Fetching product details took too long. Please fill in the details manually.');
        }
      }
      
      // In edit mode with URL change, show reparse dialog
      if (isEditMode && originalUrl && originalUrl !== url.trim()) {
        setNewParsedData(productInfo);
        setShowReparseDialog(true);
      } else {
        // In create mode, auto-apply parsed data
        if (productInfo.title) {
          setTitle(productInfo.title);
        }
        
        if (productInfo.price) {
          setPrice(productInfo.price);
        }
        
        if (productInfo.currency) {
          setCurrency(productInfo.currency);
        }
        
        if (productInfo.image_url) {
          setImageUrl(productInfo.image_url);
        }
        
        setShowManualForm(true);
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
      setParseError('Failed to parse URL. You can still add the item manually.');
      setShowManualForm(true);
    } finally {
      setParsing(false);
    }
  };

  const handleReparseConfirm = () => {
    if (!newParsedData) return;

    // Apply selected fields
    if (selectedDataFields.has('title') && newParsedData.title) {
      setTitle(newParsedData.title);
    }
    
    if (selectedDataFields.has('price') && newParsedData.price) {
      setPrice(newParsedData.price);
    }
    
    if (selectedDataFields.has('currency') && newParsedData.currency) {
      setCurrency(newParsedData.currency);
    }
    
    if (selectedDataFields.has('image') && newParsedData.image_url) {
      setImageUrl(newParsedData.image_url);
    }

    setShowReparseDialog(false);
    setNewParsedData(null);
    setSelectedDataFields(new Set());
  };

  const toggleFieldSelection = (field: string) => {
    const newSet = new Set(selectedDataFields);
    if (newSet.has(field)) {
      newSet.delete(field);
    } else {
      newSet.add(field);
    }
    setSelectedDataFields(newSet);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        url: url.trim() || undefined,
        priority: Number.isNaN(priority) ? 0 : priority,
        quantity,
        importance,
        price: price.trim() || undefined,
        currency,
      });
      setTitle("");
      setDescription("");
      setUrl("");
      setPriority(0);
      setShowManualForm(false);
      setParseError(null);
      setImageUrl(null);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleReset = () => {
    setShowManualForm(false);
    setUrl("");
    setTitle("");
    setDescription("");
    setPriority(0);
    setParseError(null);
    setImageUrl(null);
  };

  const classes = [styles.card, className].filter(Boolean).join(" ");
  
  const formContent = (
    <div className={inModal ? "" : classes} {...(inModal ? {} : rest)}>
      {!inModal && <h3 className={styles.title}>{isEditMode ? t("editTitle") : t("addTitle")}</h3>}
      
      {!showManualForm ? (
        // Step 1: URL Input
        <div className={styles.urlStep}>
          <p className={styles.hint}>
            {t("urlHint")}
          </p>
          <div className={styles.field}>
            <label htmlFor="item-url-input" className={styles.label}>
              {t("urlLabel")}
            </label>
            {isValidUrl(url) ? (
              <WuInputGroup
                className={`${styles.urlGroup} ${parsing ? styles.urlGroupLoading : ''}`}
                fullWidth
                inputProps={{
                  id: "item-url-input",
                  type: "url",
                  placeholder: t("urlPlaceholder"),
                  value: url,
                  onChange: (event) => setUrl(event.target.value),
                  onKeyDown: (e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleParseUrl();
                    }
                  },
                  fullWidth: true,
                }}
                buttonProps={{
                  type: "button",
                  variant: "ghost",
                  title: t("openInNewTab"),
                  onClick: () => window.open(url, "_blank", "noopener,noreferrer"),
                  animatedIconRef: externalLinkIconRef,
                  children: <ExternalLinkIcon ref={externalLinkIconRef} size={18} />,
                }}
              />
            ) : (
              <WuInput
                id="item-url-input"
                type="url"
                placeholder={t("urlPlaceholder")}
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleParseUrl();
                  }
                }}
                fullWidth
              />
            )}
            {url && isSupportedPlatform(url) && (
              <p className={styles.supportedHint}>{t("supportedPlatform")}</p>
            )}
          </div>
          <div className={styles.actions}>
            <WuButton 
              type="button" 
              variant="primary" 
              onClick={handleParseUrl}
              isLoading={parsing}
            >
              {parsing ? t("parsing") : url.trim() ? t("parseUrl") : t("skipToManual")}
            </WuButton>
            {onCancel && (
              <WuButton type="button" variant="outline" onClick={onCancel}>
                {t("cancel")}
              </WuButton>
            )}
          </div>
        </div>
      ) : (
        // Step 2: Details Form
        <form onSubmit={handleSubmit}>
          {parseError && (
            <div className={styles.error}>
              {parseError}
            </div>
          )}
          
          <div className={styles.field}>
            <label htmlFor="item-url" className={styles.label}>
              {t("productUrl")}
            </label>
            {isValidUrl(url) ? (
              <div className={styles.urlWithActions}>
                <WuInput
                  id="item-url"
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  fullWidth
                />
                <div className={styles.urlActions}>
                  {isEditMode && originalUrl && originalUrl !== url.trim() && (
                    <WuButton 
                      type="button" 
                      variant="secondary" 
                      onClick={handleParseUrl}
                      isLoading={parsing}
                    >
                      {parsing ? t("parsing") : t("parse")}
                    </WuButton>
                  )}
                  <WuButton 
                    type="button" 
                    variant="ghost" 
                    onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                    animatedIconRef={externalLinkIconRef}
                  >
                    <ExternalLinkIcon ref={externalLinkIconRef} size={18} />
                  </WuButton>
                </div>
              </div>
            ) : (
              <WuInput
                id="item-url"
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                fullWidth
              />
            )}
            {imageUrl && (
              <div className={styles.imagePreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Product preview" className={styles.previewImage} />
              </div>
            )}
          </div>
          
          <div className={styles.field}>
            <label htmlFor="item-title" className={styles.label}>
              {t("titleRequired")}
            </label>
            <WuInput
              id="item-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              fullWidth
            />
          </div>
          
          <div className={styles.field}>
            <label htmlFor="item-description" className={styles.label}>
              {t("description")}
            </label>
            <WuTextArea
              id="item-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              fullWidth
            />
          </div>
          
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="item-price" className={styles.label}>
                {t("price")}
              </label>
              <WuInput
                id="item-price"
                type="text"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder={t("pricePlaceholder")}
                fullWidth
              />
            </div>
            
            <div className={styles.field}>
              <label htmlFor="item-currency" className={styles.label}>
                {t("currency")}
              </label>
              <WuSelect
                id="item-currency"
                value={currency}
                onChange={(event) => setCurrency(event.target.value as Currency)}
                fullWidth
              >
                <option value="EUR">€ Euro</option>
                <option value="GBP">£ British Pound</option>
                <option value="USD">$ US Dollar</option>
              </WuSelect>
            </div>
          </div>
          
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="item-quantity" className={styles.label}>
                {t("quantity")}
              </label>
              <WuInput
                id="item-quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => {
                  const parsed = parseInt(event.target.value, 10);
                  setQuantity(Number.isNaN(parsed) || parsed < 1 ? 1 : parsed);
                }}
                fullWidth
              />
            </div>
            
            <div className={styles.field}>
              <label htmlFor="item-importance" className={styles.label}>
                {t("importance")}
              </label>
              <WuSelect
                id="item-importance"
                value={importance}
                onChange={(event) => setImportance(event.target.value as WishItemImportance)}
                fullWidth
              >
                <option value="must-have">
                  {tItem("mustHave")}
                  <HeartIcon fill="currentColor" />
                  <HeartIcon fill="currentColor" />
                  <HeartIcon fill="currentColor" />
                  <HeartIcon fill="currentColor" />
                </option>
                <option value="would-love">
                  {tItem("wouldLove")}
                  <HeartIcon fill="currentColor" />
                  <HeartIcon fill="currentColor" />
                  <HeartIcon fill="currentColor" />
                  <HeartIcon />
                </option>
                <option value="nice-to-have">
                  {tItem("niceToHave")}
                  <HeartIcon fill="currentColor" />
                  <HeartIcon fill="currentColor" />
                  <HeartIcon />
                  <HeartIcon />
                </option>
                <option value="not-sure">
                  {tItem("notSure")}
                  <HeartIcon fill="currentColor" />
                  <HeartIcon />
                  <HeartIcon />
                  <HeartIcon />
                </option>
              </WuSelect>
            </div>
          </div>
          
          <div className={styles.actions}>
            <WuButton type="submit" variant="primary" isLoading={submitting}>
              {submitting ? t("saving") : isEditMode ? t("updateItem") : t("addItem")}
            </WuButton>
            {!isEditMode && (
              <WuButton type="button" variant="outline" onClick={handleReset}>
                {t("back")}
              </WuButton>
            )}
            {onCancel && (
              <WuButton type="button" variant="ghost" onClick={onCancel}>
                {t("cancel")}
              </WuButton>
            )}
          </div>
        </form>
      )}

      {showReparseDialog && newParsedData && (
        <WuModal
          isOpen
          title={t("reparseTitle")}
          onClose={() => {
            setShowReparseDialog(false);
            setNewParsedData(null);
            setSelectedDataFields(new Set());
          }}
          actions={(
            <>
              <WuButton 
                type="button" 
                variant="primary"
                onClick={handleReparseConfirm}
              >
                {t("applySelected")}
              </WuButton>
              <WuButton 
                type="button" 
                variant="outline"
                onClick={() => {
                  setShowReparseDialog(false);
                  setNewParsedData(null);
                  setSelectedDataFields(new Set());
                }}
              >
                {t("keepCurrent")}
              </WuButton>
            </>
          )}
        >
          <p className={styles.dialogDescription}>
            {t("reparseDescription")}
          </p>
          
          <div className={styles.dataOptions}>
            {newParsedData.title && (
              <WuCheckbox
                className={styles.dataOption}
                checked={selectedDataFields.has('title')}
                onChange={() => toggleFieldSelection('title')}
                label={(
                  <span className={styles.dataOptionLabel}>
                    <span className={styles.dataOptionField}>{t("fieldTitle")}</span> {newParsedData.title}
                  </span>
                )}
              />
            )}
            {newParsedData.price && (
              <WuCheckbox
                className={styles.dataOption}
                checked={selectedDataFields.has('price')}
                onChange={() => toggleFieldSelection('price')}
                label={(
                  <span className={styles.dataOptionLabel}>
                    <span className={styles.dataOptionField}>{t("fieldPrice")}</span> {newParsedData.price}
                  </span>
                )}
              />
            )}
            {newParsedData.currency && (
              <WuCheckbox
                className={styles.dataOption}
                checked={selectedDataFields.has('currency')}
                onChange={() => toggleFieldSelection('currency')}
                label={(
                  <span className={styles.dataOptionLabel}>
                    <span className={styles.dataOptionField}>{t("fieldCurrency")}</span> {newParsedData.currency}
                  </span>
                )}
              />
            )}
            {newParsedData.image_url && (
              <WuCheckbox
                className={styles.dataOption}
                checked={selectedDataFields.has('image')}
                onChange={() => toggleFieldSelection('image')}
                label={(
                  <span className={styles.dataOptionLabel}>
                    <span className={styles.dataOptionField}>{t("fieldImage")}</span>
                  </span>
                )}
              />
            )}
          </div>
        </WuModal>
      )}
    </div>
  );
  
  if (inModal) {
    return (
      <WuModal
        isOpen
        title={isEditMode ? t("editTitle") : t("addTitle")}
        onClose={onCancel || (() => {})}
      >
        {formContent}
      </WuModal>
    );
  }
  
  return formContent;
}
