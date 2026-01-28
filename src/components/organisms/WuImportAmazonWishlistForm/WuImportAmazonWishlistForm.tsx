import { useState } from "react";
import Image from "next/image";
import { WuButton, WuInput, WuCheckbox } from "@/components/atoms";
import { type WuOrganism } from "@/types/WuOrganism";
import styles from "./WuImportAmazonWishlistForm.module.css";

interface ImportedItem {
  title: string;
  url?: string;
  image_url?: string;
  price?: string;
  currency?: string;
  selected: boolean;
}

interface WuImportAmazonWishlistFormProps extends Omit<WuOrganism<HTMLDivElement>, 'onSubmit'> {
  onSuccess?: (items: ImportedItem[]) => void;
  onCancel?: () => void;
}

export function WuImportAmazonWishlistForm({ 
  onSuccess, 
  onCancel, 
  className, 
  ...rest 
}: WuImportAmazonWishlistFormProps) {
  const [url, setUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedItems, setImportedItems] = useState<ImportedItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleImport = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!url.trim()) return;

    setImporting(true);
    setError(null);
    setImportedItems([]);
    setShowPreview(false);

    try {
      const response = await fetch('/api/wishlists/import-amazon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import wishlist');
      }

      if (!data.items || data.items.length === 0) {
        setError(data.error || 'No items found in the wishlist. Make sure it is public and contains items.');
        return;
      }

      // Mark all items as selected by default
      const items = data.items.map((item: ImportedItem) => ({
        ...item,
        selected: true,
      }));

      setImportedItems(items);
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import Amazon wishlist');
    } finally {
      setImporting(false);
    }
  };

  const handleToggleItem = (index: number) => {
    setImportedItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleToggleAll = () => {
    const allSelected = importedItems.every(item => item.selected);
    setImportedItems(prev => 
      prev.map(item => ({ ...item, selected: !allSelected }))
    );
  };

  const handleConfirm = () => {
    const selectedItems = importedItems.filter(item => item.selected);
    if (selectedItems.length > 0) {
      onSuccess?.(selectedItems);
      setUrl("");
      setImportedItems([]);
      setShowPreview(false);
    }
  };

  const handleCancel = () => {
    setUrl("");
    setImportedItems([]);
    setShowPreview(false);
    setError(null);
    onCancel?.();
  };

  const selectedCount = importedItems.filter(item => item.selected).length;
  const classes = [styles.card, className].filter(Boolean).join(" ");

  return (
    <div className={classes} {...rest}>
      <h3 className={styles.title}>Import from Amazon Wishlist</h3>
      
      {!showPreview ? (
        <form onSubmit={handleImport}>
          <div className={styles.field}>
            <label htmlFor="amazon-url" className={styles.label}>
              Amazon Wishlist URL
            </label>
            <WuInput
              id="amazon-url"
              type="url"
              placeholder="https://www.amazon.de/hz/wishlist/ls/..."
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              fullWidth
            />
            <p className={styles.hint}>
              Paste the URL of a public Amazon wishlist to import its items
            </p>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.actions}>
            <WuButton type="submit" variant="primary" isLoading={importing}>
              {importing ? "Importing..." : "Import Items"}
            </WuButton>
            <WuButton type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </WuButton>
          </div>
        </form>
      ) : (
        <div className={styles.preview}>
          <div className={styles.previewHeader}>
            <p className={styles.previewInfo}>
              Found {importedItems.length} items. Select the items you want to import:
            </p>
            <WuButton 
              type="button" 
              variant="ghost" 
              onClick={handleToggleAll}
              className={styles.toggleAll}
            >
              {selectedCount === importedItems.length ? "Deselect All" : "Select All"}
            </WuButton>
          </div>

          <div className={styles.itemsList}>
            {importedItems.map((item, index) => (
              <div 
                key={index} 
                className={`${styles.previewItem} ${!item.selected ? styles.itemDeselected : ''}`}
              >
                <WuCheckbox
                  checked={item.selected}
                  onChange={() => handleToggleItem(index)}
                  className={styles.checkbox}
                />
                {item.image_url && (
                  <div className={styles.itemImageWrapper}>
                    <Image 
                      src={item.image_url} 
                      alt={item.title}
                      width={60}
                      height={60}
                      className={styles.itemImage}
                      unoptimized
                    />
                  </div>
                )}
                <div className={styles.itemInfo}>
                  <h4 className={styles.itemTitle}>{item.title}</h4>
                  {item.price && (
                    <p className={styles.itemPrice}>
                      {item.currency === 'EUR' && '€'}
                      {item.currency === 'USD' && '$'}
                      {item.currency === 'GBP' && '£'}
                      {item.price}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.actions}>
            <WuButton 
              type="button" 
              variant="primary" 
              onClick={handleConfirm}
              disabled={selectedCount === 0}
            >
              Import {selectedCount} {selectedCount === 1 ? 'Item' : 'Items'}
            </WuButton>
            <WuButton type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </WuButton>
          </div>
        </div>
      )}
    </div>
  );
}
