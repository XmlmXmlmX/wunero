"use client";

import { use, useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { WuButton, WuButtonLink, WuInput, WuTextArea, WuSegmentControl, WuSpinner } from "@/components/atoms";
import { WuAvatar } from "@/components/atoms/WuAvatar/WuAvatar";
import { WuEmptyState } from "@/components/molecules/WuEmptyState/WuEmptyState";
import { WuItemCard } from "@/components/molecules/WuItemCard/WuItemCard";
import { WuItemForm } from "@/components/organisms/WuItemForm/WuItemForm";
import { WuImportAmazonWishlistForm } from "@/components/organisms/WuImportAmazonWishlistForm/WuImportAmazonWishlistForm";
import { WuPageHeader } from "@/components/organisms/WuPageHeader/WuPageHeader";
import { WuWishlistInviteModal } from "@/components/organisms/WuWishlistInviteModal/WuWishlistInviteModal";
import type { WishItem, Wishlist } from "@/types";
import type { AnimatedIconHandle } from "@/components/ui/types";
import styles from "./page.module.css";
import LinkIcon from "@/components/ui/link-icon";
import LockIcon from "@/components/ui/lock-icon";
import WorldIcon from "@/components/ui/world-icon";
import PenIcon from "@/components/ui/pen-icon";
import { PlusIcon, UserPlus } from "lucide-react";
import ArrowBigDownDashIcon from "@/components/ui/arrow-big-down-dash-icon";

export default function WishlistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("wishlists.detail");
  const tItem = useTranslations("wishlists.item");
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isInviteMode, setIsInviteMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [members, setMembers] = useState<Array<{ id: string; name?: string; email: string; avatar_url?: string; is_pending?: boolean }>>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberError, setMemberError] = useState<string | null>(null);
  const [resendingInvitation, setResendingInvitation] = useState<string | null>(null);

  // Refs for animated icons
  const editIconRef = useRef<AnimatedIconHandle>(null);
  const shareIconRef = useRef<AnimatedIconHandle>(null);
  const importIconRef = useRef<AnimatedIconHandle>(null);

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
      setCanEdit(data.can_edit === true);
    } catch (error) {
      console.error("Error loading wishlist:", error);
    }
  }, [id]);

  const loadMembers = useCallback(async () => {
    try {
      setMembersLoading(true);
      const response = await fetch(`/api/wishlists/${id}/members`);
      if (!response.ok) {
        setMembers([]);
        return;
      }
      const data = await response.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading members:", error);
      setMembers([]);
    } finally {
      setMembersLoading(false);
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
    loadMembers();
  }, [loadItems, loadMembers, loadWishlist]);

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
    if (!canEdit) {
      alert("You can only add items to wishlists you can edit");
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

  const updateItem = async ({
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
    if (!canEdit || !editingItemId) {
      alert("You can only edit items in wishlists you can edit");
      return;
    }

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

  const handleImportAmazon = async (importedItems: Array<{
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
  }>) => {
    try {
      if (!canEdit) {
        alert("You can only import items into wishlists you can edit");
        return;
      }
      // Add imported items to this wishlist
      for (const item of importedItems) {
        const response = await fetch(`/api/wishlists/${id}/items`, {
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
      loadItems();
    } catch (error) {
      console.error("Error importing Amazon wishlist:", error);
      alert("Failed to import items");
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

      await fetch(`/api/wishlists/${id}/items/${item.id}` , {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchased_quantity: newPurchasedQty,
          purchased: newPurchasedQty >= totalQty ? 1 : 0,
        }),
      });

      loadItems();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm(t("deleteItemConfirm"))) return;

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
    alert(t("copyLinkSuccess"));
  };

  const togglePrivacy = async (newPrivacy: boolean) => {
    if (!wishlist) return;

    try {
      const response = await fetch(`/api/wishlists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_private: newPrivacy }),
      });

      if (response.ok) {
        const updatedWishlist = await response.json();
        setWishlist(updatedWishlist);
      } else {
        alert(t("updatePrivacyFailed"));
      }
    } catch (error) {
      console.error("Error toggling privacy:", error);
    }
  };

  const startEdit = () => {
    if (!wishlist) return;
    setEditTitle(wishlist.title);
    setEditDescription(wishlist.description || "");
    setIsInviteMode(false);
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
        setIsInviteMode(false);
        setIsEditMode(false);
      } else {
        alert(t("updateFailed"));
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  const startInvite = () => {
    setMemberEmail("");
    setMemberError(null);
    setIsEditMode(false);
    setIsInviteMode(true);
  };

  const cancelInvite = () => {
    setIsInviteMode(false);
    setMemberEmail("");
    setMemberError(null);
  };

  const addMember = async () => {
    if (!memberEmail.trim()) return;
    setMemberError(null);
    try {
      const response = await fetch(`/api/wishlists/${id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: memberEmail.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        setMemberError(error?.error || t("addMemberFailed"));
        return;
      }

      setMemberEmail("");
      await loadMembers();
    } catch (error) {
      console.error("Error adding member:", error);
      setMemberError(t("addMemberFailed"));
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm(t("removeMemberConfirm"))) return;
    try {
      const response = await fetch(`/api/wishlists/${id}/members?memberId=${encodeURIComponent(memberId)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error?.error || t("removeMemberFailed"));
        return;
      }

      await loadMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      alert(t("removeMemberFailed"));
    }
  };

  const resendInvitation = async (memberEmail: string) => {
    setResendingInvitation(memberEmail);
    try {
      const response = await fetch(`/api/wishlists/${id}/members`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: memberEmail }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error?.error || t("resendInviteFailed"));
        return;
      }

      alert(t("resendInviteSuccess"));
    } catch (error) {
      console.error("Error resending invitation:", error);
      alert(t("resendInviteFailed"));
    } finally {
      setResendingInvitation(null);
    }
  };

  const titleWithMembers = useMemo(() => {
    return (
      <div className={styles.titleRow}>
        <span className={styles.titleText}>{wishlist?.title}</span>
        {members.length > 0 && (
          <div className={styles.memberAvatars} aria-label={t("memberListLabel")}>
            {members.slice(0, 5).map((member) => (
              <WuAvatar 
                key={member.id}
                src={member.avatar_url}
                alt={member.name || member.email}
                fallbackText={member.name || member.email}
                size="sm"
                className={styles.memberAvatar}
                title={member.name || member.email}
              />
            ))}
            {members.length > 5 && (
              <div className={styles.memberAvatarMore}>+{members.length - 5}</div>
            )}
          </div>
        )}
      </div>
    );
  }, [members, wishlist?.title, t]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <WuSpinner size="lg" />
      </div>
    );
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
              {isOwner && (
                <div className={styles.membersSection}>
                  <h3 className={styles.membersTitle}>Members</h3>
                  <div className={styles.membersAddRow}>
                    <WuInput
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      placeholder="Add member by email"
                      type="email"
                      fullWidth
                    />
                    <WuButton type="button" variant="primary" onClick={addMember} disabled={!memberEmail.trim()}>
                      Add
                    </WuButton>
                  </div>
                  {memberError && <p className={styles.memberError}>{memberError}</p>}
                  {membersLoading ? (
                    <div className={styles.memberHint}><WuSpinner size="sm" /></div>
                  ) : (
                    <ul className={styles.membersList}>
                      {members.length === 0 && <li className={styles.memberHint}>No members yet.</li>}
                      {members.map((member) => {
                        const isPending = member.is_pending === true;
                        return (
                          <li key={member.id} className={`${styles.memberItem} ${isPending ? styles.memberItemPending : ''}`}>
                            <div className={styles.memberInfo}>
                              <WuAvatar 
                                src={member.avatar_url}
                                alt={member.name || member.email}
                                fallbackText={member.name || member.email}
                                size="md"
                              />
                              <div>
                                <div className={styles.memberName}>
                                  {member.name || member.email}
                                  {isPending && <span className={styles.memberPendingBadge}> • Invitation pending</span>}
                                </div>
                                {member.name && <div className={styles.memberEmail}>{member.email}</div>}
                              </div>
                            </div>
                            <div className={styles.memberActions}>
                              {isPending && (
                                <WuButton 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => resendInvitation(member.email)}
                                  disabled={resendingInvitation === member.email}
                                >
                                  {resendingInvitation === member.email ? "Resending..." : "Resend"}
                                </WuButton>
                              )}
                              {member.id !== wishlist.user_id && (
                                <WuButton type="button" variant="outline" onClick={() => removeMember(member.id)}>
                                  Remove
                                </WuButton>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
              <div className={styles.editActions}>
                <WuButton type="button" variant="primary" onClick={saveEdit}>
                  Save
                </WuButton>
                <WuButton type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </WuButton>
              </div>
            </div>
          ) : isInviteMode ? (
            <div className={styles.editForm}>
              {isOwner && (
                <div className={styles.membersSection}>
                  <h3 className={styles.membersTitle}>Members</h3>
                  <div className={styles.membersAddRow}>
                    <WuInput
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      placeholder="Add member by email"
                      type="email"
                      fullWidth
                    />
                    <WuButton type="button" variant="primary" onClick={addMember} disabled={!memberEmail.trim()}>
                      Add
                    </WuButton>
                  </div>
                  {memberError && <p className={styles.memberError}>{memberError}</p>}
                  {membersLoading ? (
                    <div className={styles.memberHint}><WuSpinner size="sm" /></div>
                  ) : (
                    <ul className={styles.membersList}>
                      {members.length === 0 && <li className={styles.memberHint}>No members yet.</li>}
                      {members.map((member) => {
                        const isPending = member.is_pending === true;
                        return (
                          <li key={member.id} className={`${styles.memberItem} ${isPending ? styles.memberItemPending : ''}`}>
                            <div className={styles.memberInfo}>
                              <WuAvatar 
                                src={member.avatar_url}
                                alt={member.name || member.email}
                                fallbackText={member.name || member.email}
                                size="md"
                              />
                              <div>
                                <div className={styles.memberName}>
                                  {member.name || member.email}
                                  {isPending && <span className={styles.memberPendingBadge}> • Invitation pending</span>}
                                </div>
                                {member.name && <div className={styles.memberEmail}>{member.email}</div>}
                              </div>
                            </div>
                            <div className={styles.memberActions}>
                              {isPending && (
                                <WuButton 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => resendInvitation(member.email)}
                                  disabled={resendingInvitation === member.email}
                                >
                                  {resendingInvitation === member.email ? "Resending..." : "Resend"}
                                </WuButton>
                              )}
                              {member.id !== wishlist.user_id && (
                                <WuButton type="button" variant="outline" onClick={() => removeMember(member.id)}>
                                  Remove
                                </WuButton>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
              <div className={styles.editActions}>
                <WuButton type="button" variant="outline" onClick={cancelInvite}>
                  Close
                </WuButton>
              </div>
            </div>
          ) : (
            <WuPageHeader
              title={titleWithMembers}
              subtitle={wishlist.description}
              backHref="/wishlists"
              backLabel={t("backToWishlists")}
              actions={
                <div className={styles.actionsWrapper}>
                  {canEdit && (
                    <WuButton type="button" variant="outline" onClick={startEdit} animatedIconRef={editIconRef}>
                      <PenIcon ref={editIconRef} /> {t("edit")}
                    </WuButton>
                  )}
                  {isOwner && (
                    <WuButton type="button" variant="outline" onClick={startInvite}>
                      <UserPlus size={16} /> {t("invite")}
                    </WuButton>
                  )}
                  {!wishlist.is_private && (
                    <WuButton type="button" variant="outline" onClick={copyShareLink} animatedIconRef={shareIconRef}>
                      <LinkIcon ref={shareIconRef} /> {t("share")}
                    </WuButton>
                  )}
                  {isOwner && (
                    <WuSegmentControl
                      value={wishlist.is_private ? "private" : "public"}
                      onChange={(value) => togglePrivacy(value === "private")}
                      options={[
                        { value: "public", label: t("publicWishlist"), icon: <WorldIcon /> },
                        { value: "private", label: t("privateWishlist"), icon: <LockIcon /> }
                      ]}
                      size="md"
                    />
                  )}
                </div>
              }
            />
          )}
        </div>

        <WuWishlistInviteModal
          isOpen={isInviteMode}
          isOwner={isOwner}
          ownerId={wishlist.user_id}
          memberEmail={memberEmail}
          onMemberEmailChange={setMemberEmail}
          onAddMember={addMember}
          memberError={memberError}
          membersLoading={membersLoading}
          members={members}
          resendingInvitation={resendingInvitation}
          onResendInvitation={resendInvitation}
          onRemoveMember={removeMember}
          onClose={cancelInvite}
        />

        <div className={styles.section}>
          <div className={styles.itemsHeader}>
            <h2>{t("addItem")}</h2>
            {canEdit && (
              <div className={styles.itemsActions}>
                <WuButton
                  type="button"
                  variant={showImportForm ? "outline" : "ghost"}
                  onClick={() => {
                    setShowImportForm(!showImportForm);
                    setShowNewForm(false);
                  }}
                  animatedIconRef={importIconRef}
                >
                  {showImportForm ? t("cancel") : <><ArrowBigDownDashIcon ref={importIconRef} /> {t("import")}</>}
                </WuButton>
                <WuButton
                  type="button"
                  variant={showNewForm ? "outline" : "primary"}
                  onClick={() => {
                    setShowNewForm(!showNewForm);
                    setShowImportForm(false);
                  }}
                >
                  {showNewForm ? t("cancel") : <><PlusIcon /> {t("addItem")}</>}
                </WuButton>
              </div>
            )}
          </div>

          {showImportForm && (
            <div className={styles.section}>
              <WuImportAmazonWishlistForm 
                targetWishlistId={id}
                onSuccess={handleImportAmazon}
                onCancel={() => setShowImportForm(false)} 
              />
            </div>
          )}

          {showNewForm && (
            <WuItemForm inModal onSubmit={createItem} onCancel={() => setShowNewForm(false)} />
          )}

          {items.length === 0 ? (
            <WuEmptyState
              icon="🎁"
              title={t("noItemsYet")}
              description={t("noItemsDescription")}
              actions={
                canEdit ? (
                  <WuButton type="button" variant="primary" onClick={() => setShowNewForm(true)}>
                    {t("createFirstItem")}
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
                    <WuItemForm 
                      key={item.id}
                      inModal
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
                    isOwner={canEdit}
                    isFirst={index === 0}
                    isLast={index === items.length - 1}
                                        isPublicWishlist={wishlist?.is_private === 0}
                    translations={{
                      purchased: tItem("purchased"),
                      mustHave: tItem("mustHave"),
                      wouldLove: tItem("wouldLove"),
                      niceToHave: tItem("niceToHave"),
                      notSure: tItem("notSure"),
                      viewOn: tItem("viewOn"),
                      affiliate: tItem.has("affiliate") ? tItem("affiliate") : "Affiliate link",
                      affiliateHint: tItem.has("affiliateHint") ? tItem("affiliateHint") : "Contains an affiliate link",
                      unmarkOne: tItem("unmarkOne"),
                      markAsPurchased: tItem("markAsPurchased"),
                      markOneAsPurchased: tItem("markOneAsPurchased"),
                      edit: tItem("edit"),
                      delete: tItem("delete"),
                      moveUp: tItem("moveUp"),
                      moveDown: tItem("moveDown"),
                    }}
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
