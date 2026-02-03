import { useState } from "react";
import { WuButton, WuInput } from "@/components/atoms";
import { type WuOrganism } from "@/types/WuOrganism";
import styles from "./WuFollowWishlistForm.module.css";

interface FoundWishlist {
  id: string;
  title: string;
  description?: string;
  owner_email?: string;
}

interface WuFollowWishlistFormProps extends Omit<WuOrganism<HTMLDivElement>, 'onSubmit'> {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function WuFollowWishlistForm({ onSuccess, onCancel, className, ...rest }: WuFollowWishlistFormProps) {
  const [wishlistId, setWishlistId] = useState("");
  const [searching, setSearching] = useState(false);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundWishlist, setFoundWishlist] = useState<FoundWishlist | null>(null);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!wishlistId.trim()) return;

    setSearching(true);
    setError(null);
    setFoundWishlist(null);

    try {
      const response = await fetch(`/api/wishlists/search?id=${encodeURIComponent(wishlistId.trim())}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Wishlist not found');
      }

      const data = await response.json();
      
      if (data.isOwner) {
        setError('This is your own wishlist');
        return;
      }
      
      if (data.isFollowing) {
        setError('You are already following this wishlist');
        return;
      }

      setFoundWishlist(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find wishlist');
    } finally {
      setSearching(false);
    }
  };

  const handleFollow = async () => {
    if (!foundWishlist) return;

    setFollowing(true);
    setError(null);

    try {
      const response = await fetch('/api/wishlists/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishlistId: foundWishlist.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to follow wishlist');
      }

      setWishlistId("");
      setFoundWishlist(null);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to follow wishlist');
    } finally {
      setFollowing(false);
    }
  };

  const classes = [styles.card, className].filter(Boolean).join(" ");
  return (
    <div className={classes} {...rest}>
      <h3 className={styles.title}>Follow a Wishlist</h3>
      
      <form onSubmit={handleSearch}>
        <div className={styles.field}>
          <label htmlFor="wishlist-id" className={styles.label}>
            Wishlist ID or Share Link
          </label>
          <WuInput
            id="wishlist-id"
            type="text"
            placeholder="Paste wishlist ID or share link..."
            value={wishlistId}
            onChange={(event) => setWishlistId(event.target.value)}
            fullWidth
          />
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {foundWishlist && (
          <div className={styles.preview}>
            <div className={styles.previewHeader}>Found Wishlist</div>
            <div className={styles.previewTitle}>{foundWishlist.title}</div>
            {foundWishlist.description && (
              <div className={styles.previewDescription}>{foundWishlist.description}</div>
            )}
            {foundWishlist.owner_email && (
              <div className={styles.previewOwner}>by {foundWishlist.owner_email}</div>
            )}
          </div>
        )}

        <div className={styles.actions}>
          {!foundWishlist ? (
            <>
              <WuButton type="submit" variant="primary" isLoading={searching}>
                {searching ? 'Searching...' : 'Search'}
              </WuButton>
              {onCancel && (
                <WuButton type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </WuButton>
              )}
            </>
          ) : (
            <>
              <WuButton type="button" variant="primary" onClick={handleFollow} isLoading={following}>
                {following ? 'Following...' : 'Follow'}
              </WuButton>
              <WuButton 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setFoundWishlist(null);
                  setError(null);
                }}
              >
                Search Again
              </WuButton>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
