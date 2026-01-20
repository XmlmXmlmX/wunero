"use client";

import { useEffect, useState } from "react";
import { WuButton } from "@/components/atoms";
import { WuEmptyState } from "@/components/molecules/WuEmptyState/WuEmptyState";
import { WuWishlistCard } from "@/components/molecules/WuWishlistCard/WuWishlistCard";
import { WuPageHeader } from "@/components/organisms/WuPageHeader/WuPageHeader";
import { WuWishlistForm } from "@/components/organisms/WuWishlistForm/WuWishlistForm";
import type { Wishlist } from "@/types";
import styles from "./page.module.css";

export default function WishlistsPage() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    loadWishlists();
  }, []);

  const loadWishlists = async () => {
    try {
      const response = await fetch("/api/wishlists");
      const data = await response.json();
      setWishlists(data);
    } catch (error) {
      console.error("Error loading wishlists:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWishlist = async ({ title, description }: { title: string; description?: string }) => {
    try {
      const response = await fetch("/api/wishlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        setShowNewForm(false);
        loadWishlists();
      }
    } catch (error) {
      console.error("Error creating wishlist:", error);
    }
  };

  const deleteWishlist = async (id: string) => {
    if (!confirm("Are you sure you want to delete this wishlist?")) return;

    try {
      const response = await fetch(`/api/wishlists/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadWishlists();
      }
    } catch (error) {
      console.error("Error deleting wishlist:", error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <WuPageHeader
            title="My Wishlists"
            backHref="/"
            backLabel="Back to Home"
            actions={
              <WuButton
                type="button"
                variant={showNewForm ? "outline" : "primary"}
                onClick={() => setShowNewForm(!showNewForm)}
              >
                {showNewForm ? "Cancel" : "+ New Wishlist"}
              </WuButton>
            }
          />
        </div>

        {showNewForm && (
          <div style={{ marginBottom: "2rem" }}>
            <WuWishlistForm onSubmit={handleCreateWishlist} onCancel={() => setShowNewForm(false)} />
          </div>
        )}

        {wishlists.length === 0 ? (
          <WuEmptyState
            icon="📝"
            title="No wishlists yet"
            description="Create your first wishlist to get started!"
            actions={
              <WuButton type="button" variant="primary" onClick={() => setShowNewForm(true)}>
                Create Your First Wishlist
              </WuButton>
            }
          />
        ) : (
          <div className={styles.grid}>
            {wishlists.map((wishlist) => (
              <WuWishlistCard key={wishlist.id} wishlist={wishlist} onDelete={deleteWishlist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
