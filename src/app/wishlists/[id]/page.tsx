"use client";

import { use, useCallback, useEffect, useState } from "react";
import { WuButton, WuButtonLink } from "@/components/atoms";
import { WuEmptyState } from "@/components/molecules/WuEmptyState/WuEmptyState";
import { WuItemCard } from "@/components/molecules/WuItemCard/WuItemCard";
import { WuItemForm } from "@/components/organisms/WuItemForm/WuItemForm";
import { WuPageHeader } from "@/components/organisms/WuPageHeader/WuPageHeader";
import type { WishItem, Wishlist } from "@/types";
import styles from "./page.module.css";

export default function WishlistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);

  const loadWishlist = useCallback(async () => {
    try {
      const response = await fetch(`/api/wishlists/${id}`);
      const data = await response.json();
      setWishlist(data);
    } catch (error) {
      console.error("Error loading wishlist:", error);
    }
  }, [id]);

  const loadItems = useCallback(async () => {
    try {
      const response = await fetch(`/api/wishlists/${id}/items`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadWishlist();
    loadItems();
  }, [loadItems, loadWishlist]);

  const createItem = async ({ title, description, url, priority }: { title: string; description?: string; url?: string; priority: number }) => {
    try {
      const response = await fetch(`/api/wishlists/${id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          url,
          priority,
        }),
      });

      if (response.ok) {
        setShowNewForm(false);
        loadItems();
      }
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  const togglePurchased = async (item: WishItem) => {
    try {
      await fetch(`/api/wishlists/${id}/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchased: !item.purchased }),
      });
      loadItems();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/wishlists/${id}/items/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadItems();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("Share link copied to clipboard!");
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!wishlist) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <WuEmptyState
            title="Wishlist not found"
            description="The wishlist you are looking for does not exist."
            actions={
              <WuButtonLink href="/wishlists" variant="outline">
                Back to Wishlists
              </WuButtonLink>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.section}>
          <WuPageHeader
            title={wishlist.title}
            subtitle={wishlist.description}
            backHref="/wishlists"
            backLabel="Back to Wishlists"
            actions={
              <WuButton type="button" variant="outline" onClick={copyShareLink}>
                🔗 Share
              </WuButton>
            }
          />
        </div>

        <div className={styles.section}>
          <div className={styles.itemsHeader}>
            <h2>Items</h2>
            <WuButton
              type="button"
              variant={showNewForm ? "outline" : "primary"}
              onClick={() => setShowNewForm(!showNewForm)}
            >
              {showNewForm ? "Cancel" : "+ Add Item"}
            </WuButton>
          </div>

          {showNewForm && (
            <div className={styles.section}>
              <WuItemForm onSubmit={createItem} onCancel={() => setShowNewForm(false)} />
            </div>
          )}

          {items.length === 0 ? (
            <WuEmptyState
              icon="🎁"
              title="No items yet"
              description="Add your first wish item to this list!"
              actions={
                <WuButton type="button" variant="primary" onClick={() => setShowNewForm(true)}>
                  Add Your First Item
                </WuButton>
              }
            />
          ) : (
            <div className={styles.itemsList}>
              {items.map((item) => (
                <WuItemCard key={item.id} item={item} onTogglePurchased={togglePurchased} onDelete={deleteItem} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
