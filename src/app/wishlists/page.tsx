"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WuButton } from "@/components/atoms";
import { WuEmptyState } from "@/components/molecules/WuEmptyState/WuEmptyState";
import { WuWishlistCard } from "@/components/molecules/WuWishlistCard/WuWishlistCard";
import { WuPageHeader } from "@/components/organisms/WuPageHeader/WuPageHeader";
import { WuWishlistForm } from "@/components/organisms/WuWishlistForm/WuWishlistForm";
import { WuFollowWishlistForm } from "@/components/organisms/WuFollowWishlistForm/WuFollowWishlistForm";
import { WuImportAmazonWishlistForm } from "@/components/organisms/WuImportAmazonWishlistForm/WuImportAmazonWishlistForm";
import type { Wishlist } from "@/types";
import styles from "./page.module.css";
import ArrowBigDownDashIcon from "@/components/ui/arrow-big-down-dash-icon";
import { PlusIcon } from "lucide-react";

export default function WishlistsPage() {
  const router = useRouter();
  const [ownWishlists, setOwnWishlists] = useState<Wishlist[]>([]);
  const [followedWishlists, setFollowedWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showFollowForm, setShowFollowForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);

  useEffect(() => {
    loadWishlists();
  }, []);

  const loadWishlists = async () => {
    try {
      const response = await fetch("/api/wishlists");
      if (!response.ok) {
        console.error(`Error: ${response.status}`);
        setOwnWishlists([]);
        setFollowedWishlists([]);
        return;
      }
      const data = await response.json();
      setOwnWishlists(Array.isArray(data.own) ? data.own : []);
      setFollowedWishlists(Array.isArray(data.followed) ? data.followed : []);
    } catch (error) {
      console.error("Error loading wishlists:", error);
      setOwnWishlists([]);
      setFollowedWishlists([]);
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

  const handleImportAmazon = async (items: Array<{
    title: string;
    url?: string;
    image_url?: string;
    price?: string;
    currency?: string;
    quantity?: number;
    priority?: number;
    importance?: string;
    purchased_quantity?: number;
    description?: string;
  }>, targetWishlistId?: string, wishlistName?: string | null) => {
    try {
      let wishlistId = targetWishlistId;
      
      // Wenn keine Ziel-Wishlist angegeben, neue erstellen
      if (!wishlistId) {
        const title = wishlistName || `Imported from Amazon (${new Date().toLocaleDateString()})`;
        const createResponse = await fetch("/api/wishlists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            title,
            description: "Items imported from Amazon wishlist" 
          }),
        });

        if (!createResponse.ok) {
          alert("Failed to create wishlist for imported items");
          return;
        }

        const newWishlist = await createResponse.json();
        wishlistId = newWishlist.id;
      }

      // Add each imported item to the new wishlist
      for (const item of items) {
        const response = await fetch(`/api/wishlists/${wishlistId}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: item.title,
            description: item.description,
            url: item.url,
            image_url: item.image_url,
            price: item.price,
            currency: item.currency,
            quantity: item.quantity ?? 1,
            priority: item.priority ?? 0,
            importance: item.importance ?? "nice-to-have",
            purchased_quantity: item.purchased_quantity ?? 0,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error(`Failed to import item "${item.title}":`, error);
        }
      }

      setShowImportForm(false);
      loadWishlists();
      
      // Navigate zu der Wishlist (neue oder existierende)
      if (!targetWishlistId) {
        router.push(`/wishlists/${wishlistId}`);
      }
    } catch (error) {
      console.error("Error importing Amazon wishlist:", error);
      alert("Failed to import items");
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

  const unfollowWishlist = async (id: string) => {
    if (!confirm("Are you sure you want to unfollow this wishlist?")) return;

    try {
      const response = await fetch(`/api/wishlists/follow?wishlistId=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadWishlists();
      }
    } catch (error) {
      console.error("Error unfollowing wishlist:", error);
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
              <div className={styles.headerActions}>
                <WuButton
                  type="button"
                  variant={showImportForm ? "outline" : "ghost"}
                  onClick={() => {
                    setShowImportForm(!showImportForm);
                    setShowNewForm(false);
                    setShowFollowForm(false);
                  }}
                >
                  {showImportForm ? "Cancel" : <><ArrowBigDownDashIcon /> Import</>}
                </WuButton>
                <WuButton
                  type="button"
                  variant={showFollowForm ? "outline" : "ghost"}
                  onClick={() => {
                    setShowFollowForm(!showFollowForm);
                    setShowNewForm(false);
                    setShowImportForm(false);
                  }}
                >
                  {showFollowForm ? "Cancel" : <><PlusIcon /> Follow</>}
                </WuButton>
                <WuButton
                  type="button"
                  variant={showNewForm ? "outline" : "primary"}
                  onClick={() => {
                    setShowNewForm(!showNewForm);
                    setShowFollowForm(false);
                    setShowImportForm(false);
                  }}
                >
                  {showNewForm ? "Cancel" : <><PlusIcon /> New Wishlist</>}
                </WuButton>
              </div>
            }
          />
        </div>

        {showNewForm && (
          <div className={styles.formWrapper}>
            <WuWishlistForm onSubmit={handleCreateWishlist} onCancel={() => setShowNewForm(false)} />
          </div>
        )}

        {showFollowForm && (
          <div className={styles.formWrapper}>
            <WuFollowWishlistForm 
              onSuccess={() => {
                setShowFollowForm(false);
                loadWishlists();
              }} 
              onCancel={() => setShowFollowForm(false)} 
            />
          </div>
        )}

        {showImportForm && (
          <div className={styles.formWrapper}>
            <WuImportAmazonWishlistForm 
              onSuccess={handleImportAmazon}
              onCancel={() => setShowImportForm(false)} 
            />
          </div>
        )}

        {ownWishlists.length === 0 && followedWishlists.length === 0 ? (
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
          <>
            {ownWishlists.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>My Wishlists</h2>
                <div className={styles.grid}>
                  {ownWishlists.map((wishlist) => (
                    <WuWishlistCard key={wishlist.id} wishlist={wishlist} onDelete={deleteWishlist} />
                  ))}
                </div>
              </div>
            )}

            {followedWishlists.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Following</h2>
                <div className={styles.grid}>
                  {followedWishlists.map((wishlist) => (
                    <WuWishlistCard 
                      key={wishlist.id} 
                      wishlist={wishlist} 
                      onDelete={unfollowWishlist}
                      isFollowed
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
