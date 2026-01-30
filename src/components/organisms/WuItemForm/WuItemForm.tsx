import { useState, useRef } from "react";
import { WuButton, WuInput, WuTextArea, WuCheckbox } from "@/components/atoms";
import type { AnimatedIconHandle } from "@/components/ui/types";
import { WuInputGroup } from "@/components/molecules/WuInputGroup/WuInputGroup";
import { WuModal } from "@/components/molecules/WuModal/WuModal";
import ExternalLinkIcon from "@/components/ui/external-link-icon";
import { isSupportedPlatform } from "@/lib/productParser";
import { type WuOrganism } from "@/types/WuOrganism";
import type { WishItemImportance, Currency } from "@/types";
import styles from "./WuItemForm.module.css";

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
}

interface ParsedProductData {
  title?: string;
  price?: string;
  currency?: Currency;
  image_url?: string;
  blocked?: boolean;
  timedOut?: boolean;
}

export function WuItemForm({ onSubmit, onCancel, initialValues, isEditMode = false, className, ...rest }: WuItemFormProps) {
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
  return (
    <div className={classes} {...rest}>
      <h3 className={styles.title}>{isEditMode ? "Edit Item" : "Add New Item"}</h3>
      
      {!showManualForm ? (
        // Step 1: URL Input
        <div className={styles.urlStep}>
          <p className={styles.hint}>
            Paste a product URL to automatically fill in details, or skip to add manually.
          </p>
          <div className={styles.field}>
            <label htmlFor="item-url-input" className={styles.label}>
              Product URL (Optional)
            </label>
            {isValidUrl(url) ? (
              <WuInputGroup
                className={`${styles.urlGroup} ${parsing ? styles.urlGroupLoading : ''}`}
                fullWidth
                inputProps={{
                  id: "item-url-input",
                  type: "url",
                  placeholder: "https://www.amazon.com/...",
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
                  title: "Open URL in new tab",
                  onClick: () => window.open(url, "_blank", "noopener,noreferrer"),
                  animatedIconRef: externalLinkIconRef,
                  children: <ExternalLinkIcon ref={externalLinkIconRef} size={18} />,
                }}
              />
            ) : (
              <WuInput
                id="item-url-input"
                type="url"
                placeholder="https://www.amazon.com/..."
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
              <p className={styles.supportedHint}>✓ Supported platform detected</p>
            )}
          </div>
          <div className={styles.actions}>
            <WuButton 
              type="button" 
              variant="primary" 
              onClick={handleParseUrl}
              isLoading={parsing}
            >
              {parsing ? 'Parsing...' : url.trim() ? 'Parse URL' : 'Skip to Manual Entry'}
            </WuButton>
            {onCancel && (
              <WuButton type="button" variant="outline" onClick={onCancel}>
                Cancel
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
              Product URL
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
                      {parsing ? 'Parsing...' : 'Parse'}
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
              Title *
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
              Description
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
                Price
              </label>
              <WuInput
                id="item-price"
                type="text"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="29.99"
                fullWidth
              />
            </div>
            
            <div className={styles.field}>
              <label htmlFor="item-currency" className={styles.label}>
                Currency
              </label>
              <select
                id="item-currency"
                value={currency}
                onChange={(event) => setCurrency(event.target.value as Currency)}
                className={styles.select}
              >
                <option value="EUR">€ Euro</option>
                <option value="GBP">£ British Pound</option>
                <option value="USD">$ US Dollar</option>
              </select>
            </div>
          </div>
          
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="item-quantity" className={styles.label}>
                Quantity
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
                Importance
              </label>
              <select
                id="item-importance"
                value={importance}
                onChange={(event) => setImportance(event.target.value as WishItemImportance)}
                className={styles.select}
              >
                <option value="must-have">Must have</option>
                <option value="would-love">Would love</option>
                <option value="nice-to-have">Nice to have</option>
                <option value="not-sure">Not sure</option>
              </select>
            </div>
          </div>
          
          <div className={styles.actions}>
            <WuButton type="submit" variant="primary" isLoading={submitting}>
              {submitting ? "Saving..." : isEditMode ? "Update Item" : "Add Item"}
            </WuButton>
            {!isEditMode && (
              <WuButton type="button" variant="outline" onClick={handleReset}>
                Back
              </WuButton>
            )}
            {onCancel && (
              <WuButton type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </WuButton>
            )}
          </div>
        </form>
      )}

      {showReparseDialog && newParsedData && (
        <WuModal
          isOpen
          title="New Product Data Available"
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
                Apply Selected
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
                Keep Current Data
              </WuButton>
            </>
          )}
        >
          <p className={styles.dialogDescription}>
            The product URL has changed. Select which information you&apos;d like to update:
          </p>
          
          <div className={styles.dataOptions}>
            {newParsedData.title && (
              <WuCheckbox
                className={styles.dataOption}
                checked={selectedDataFields.has('title')}
                onChange={(_checked, _event) => toggleFieldSelection('title')}
                label={(
                  <span className={styles.dataOptionLabel}>
                    <span className={styles.dataOptionField}>Title:</span> {newParsedData.title}
                  </span>
                )}
              />
            )}
            {newParsedData.price && (
              <WuCheckbox
                className={styles.dataOption}
                checked={selectedDataFields.has('price')}
                onChange={(_checked, _event) => toggleFieldSelection('price')}
                label={(
                  <span className={styles.dataOptionLabel}>
                    <span className={styles.dataOptionField}>Price:</span> {newParsedData.price}
                  </span>
                )}
              />
            )}
            {newParsedData.currency && (
              <WuCheckbox
                className={styles.dataOption}
                checked={selectedDataFields.has('currency')}
                onChange={(_checked, _event) => toggleFieldSelection('currency')}
                label={(
                  <span className={styles.dataOptionLabel}>
                    <span className={styles.dataOptionField}>Currency:</span> {newParsedData.currency}
                  </span>
                )}
              />
            )}
            {newParsedData.image_url && (
              <WuCheckbox
                className={styles.dataOption}
                checked={selectedDataFields.has('image')}
                onChange={(_checked, _event) => toggleFieldSelection('image')}
                label={(
                  <span className={styles.dataOptionLabel}>
                    <span className={styles.dataOptionField}>Product Image</span>
                  </span>
                )}
              />
            )}
          </div>
        </WuModal>
      )}
    </div>
  );
}
