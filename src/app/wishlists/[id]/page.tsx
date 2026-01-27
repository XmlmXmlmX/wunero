"use client";

import { use, useCallback, useEffect, useState } from "react";
import { WuButton, WuButtonLink, WuInput, WuTextArea } from "@/components/atoms";
import { WuEmptyState } from "@/components/molecules/WuEmptyState/WuEmptyState";
import { WuItemCard } from "@/components/molecules/WuItemCard/WuItemCard";
import { WuItemForm } from "@/components/organisms/WuItemForm/WuItemForm";
import { WuPageHeader } from "@/components/organisms/WuPageHeader/WuPageHeader";
import type { WishItem, Wishlist } from "@/types";
import styles from "./page.module.css";
import LinkIcon from "@/components/ui/link-icon";
import LockIcon from "@/components/ui/lock-icon";
import WorldIcon from "@/components/ui/world-icon";
import PenIcon from "@/components/ui/pen-icon";
import { PlusIcon } from "lucide-react";

export default function WishlistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const loadWishlist = useCallback(async () => {
    try {
      const response = await fetch(`/api/wishlists/${id}`);
      if (!response.ok) {
        console.error(`Error: ${response.status}`);
        return;
      }
      const data = await response.json();
      setWishlist(data);
      
      // Check if current user is the owner
      // The API returns owner_id if current user is the owner or is following
      // If current user is the owner, owner_id will match their id
      setIsOwner(data.is_owner === true);
    } catch (error) {
      console.error("Error loading wishlist:", error);
    }
  }, [id]);

  const loadItems = useCallback(async () => {
    try {
      const response = await fetch(`/api/wishlists/${id}/items`);
      if (!response.ok) {
        console.error(`Error: ${response.status}`);
        setItems([]);
        return;
      }
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadWishlist();
    loadItems();
  }, [loadItems, loadWishlist]);

  const createItem = async ({ 
    title, 
    description, 
    url, 
    priority, 
    quantity, 
    importance 
  }: { 
    title: string; 
    description?: string; 
    url?: string; 
    priority: number;
    quantity: number;
    importance: string;
  }) => {
    if (!isOwner) {
      alert("You can only add items to your own wishlists");
      return;
    }

    try {
      const response = await fetch(`/api/wishlists/${id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          url,
          priority,
          quantity,
          importance,
        }),
      });

      if (response.ok) {
        setShowNewForm(false);
        loadItems();
      } else {
        alert("Failed to create item");
      }
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  const togglePurchased = async (item: WishItem) => {
    try {
      const currentPurchasedQty = item.purchased_quantity || 0;
      const totalQty = item.quantity || 1;
      
      // If fully purchased or old "purchased" flag is set, decrement by 1
      // Otherwise increment by 1
      let newPurchasedQty: number;
      if (currentPurchasedQty >= totalQty || item.purchased) {
        newPurchasedQty = Math.max(0, currentPurchasedQty - 1);
      } else {
        newPurchasedQty = Math.min(totalQty, currentPurchasedQty + 1);
      }
      
      await fetch(`/api/wishlists/${id}/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          purchased_quantity: newPurchasedQty,
          purchased: newPurchasedQty >= totalQty ? 1 : 0
        }),
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

  const updateItem = async ({ 
    title, 
    description, 
    url, 
    priority,
    quantity,
    importance,
    price,
    currency
  }: { 
    title: string; 
    description?: string; 
    url?: string; 
    priority: number;
    quantity: number;
    importance: string;
    price?: string;
    currency: string;
  }) => {
    if (!editingItemId) return;

    try {
      const response = await fetch(`/api/wishlists/${id}/items/${editingItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          url,
          priority,
          quantity,
          importance,
          price,
          currency,
        }),
      });

      if (response.ok) {
        setEditingItemId(null);
        loadItems();
      } else {
        alert("Failed to update item");
      }
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const moveItemUp = async (itemId: string) => {
    const index = items.findIndex((item) => item.id === itemId);
    if (index <= 0) return;

    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    
    // Update priorities based on new order
    await updateItemPriorities(newItems);
  };

  const moveItemDown = async (itemId: string) => {
    const index = items.findIndex((item) => item.id === itemId);
    if (index < 0 || index >= items.length - 1) return;

    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    
    // Update priorities based on new order
    await updateItemPriorities(newItems);
  };

  const updateItemPriorities = async (orderedItems: WishItem[]) => {
    setItems(orderedItems);
    
    try {
      // Update priorities starting from highest (length) to lowest (1)
      const updatePromises = orderedItems.map((item, index) => {
        const newPriority = orderedItems.length - index;
        return fetch(`/api/wishlists/${id}/items/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority: newPriority }),
        });
      });

      await Promise.all(updatePromises);
      loadItems(); // Reload to ensure consistency
    } catch (error) {
      console.error("Error updating item priorities:", error);
      loadItems(); // Reload on error to restore correct order
    }
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("Share link copied to clipboard!");
  };

  const togglePrivacy = async () => {
    if (!wishlist) return;

    try {
      const response = await fetch(`/api/wishlists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_private: !wishlist.is_private }),
      });

      if (response.ok) {
        const updatedWishlist = await response.json();
        setWishlist(updatedWishlist);
      } else {
        alert("Failed to update wishlist privacy");
      }
    } catch (error) {
      console.error("Error toggling privacy:", error);
    }
  };

  const startEdit = () => {
    if (!wishlist) return;
    setEditTitle(wishlist.title);
    setEditDescription(wishlist.description || "");
    setIsEditMode(true);
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setEditTitle("");
    setEditDescription("");
  };

  const saveEdit = async () => {
    if (!wishlist) return;
    try {
      const response = await fetch(`/api/wishlists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });
      if (response.ok) {
        const updatedWishlist = await response.json();
        setWishlist(updatedWishlist);
        setIsEditMode(false);
      } else {
        alert("Failed to update wishlist");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
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
          {isEditMode ? (
            <div className={styles.editForm}>
              <WuInput
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Wishlist title"
              />
              <WuTextArea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Wishlist description"
              />
              <div className={styles.editActions}>
                <WuButton type="button" variant="primary" onClick={saveEdit}>
                  Save
                </WuButton>
                <WuButton type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </WuButton>
              </div>
            </div>
          ) : (
            <WuPageHeader
              title={wishlist.title}
              subtitle={wishlist.description}
              backHref="/wishlists"
              backLabel="Back to Wishlists"
              actions={
                <div className={styles.actionsWrapper}>
                  {isOwner && (
                    <WuButton type="button" variant="outline" onClick={startEdit}>
                      <PenIcon /> Edit
                    </WuButton>
                  )}
                  {!wishlist.is_private && (
                    <WuButton type="button" variant="outline" onClick={copyShareLink}>
                      <LinkIcon /> Share
                    </WuButton>
                  )}
                  {isOwner && (
                    <WuButton type="button" variant="outline" onClick={togglePrivacy}>
                      {wishlist.is_private ? <><WorldIcon />Make Public</> : <><LockIcon />Make Private</>}
                    </WuButton>
                  )}
                </div>
              }
            />
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.itemsHeader}>
            <h2>Items</h2>
            {isOwner && (
              <WuButton
                type="button"
                variant={showNewForm ? "outline" : "primary"}
                onClick={() => setShowNewForm(!showNewForm)}
              >
                {showNewForm ? "Cancel" : <><PlusIcon />Add Item</>}
              </WuButton>
            )}
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
                isOwner ? (
                  <WuButton type="button" variant="primary" onClick={() => setShowNewForm(true)}>
                    Add Your First Item
                  </WuButton>
                ) : null
              }
            />
          ) : (
            <div className={styles.itemsList}>
              {items.map((item, index) => {
                const isEditing = editingItemId === item.id;
                
                if (isEditing) {
                  return (
                    <div key={item.id} className={styles.section}>
                      <WuItemForm 
                        isEditMode
                        initialValues={{
                          title: item.title,
                          description: item.description || "",
                          url: item.url || "",
                          priority: item.priority,
                          quantity: item.quantity,
                          importance: item.importance,
                          price: item.price || "",
                          currency: item.currency,
                        }}
                        onSubmit={updateItem}
                        onCancel={() => setEditingItemId(null)}
                      />
                    </div>
                  );
                }
                
                return (
                  <WuItemCard 
                    key={item.id} 
                    item={item} 
                    onTogglePurchased={togglePurchased} 
                    onDelete={deleteItem}
                    onEdit={setEditingItemId}
                    onMoveUp={moveItemUp}
                    onMoveDown={moveItemDown}
                    isOwner={isOwner}
                    isFirst={index === 0}
                    isLast={index === items.length - 1}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
