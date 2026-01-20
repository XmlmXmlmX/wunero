import { useState } from "react";
import { WuButton, WuInput, WuTextArea } from "@/components/atoms";
import { type WuOrganism } from "@/types/WuOrganism";
import styles from "./WuWishlistForm.module.css";

interface WuWishlistFormProps extends WuOrganism<HTMLDivElement> {
  onSubmit: (payload: { title: string; description?: string }) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function WuWishlistForm({ onSubmit, onCancel, submitLabel = "Create Wishlist", className, ...rest }: WuWishlistFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim() || undefined });
      setTitle("");
      setDescription("");
    } finally {
      setSubmitting(false);
    }
  };
  const classes = [styles.card, className].filter(Boolean).join(" ");
  return (
    <div className={classes} {...rest}>
      <h2 className={styles.title}>Create New Wishlist</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="title" className={styles.label}>
            Title *
          </label>
          <WuInput
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            fullWidth
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="description" className={styles.label}>
            Description
          </label>
          <WuTextArea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            fullWidth
          />
        </div>
        <div className={styles.actions}>
          <WuButton type="submit" variant="primary" isLoading={submitting}>
            {submitting ? "Saving..." : submitLabel}
          </WuButton>
          {onCancel && (
            <WuButton type="button" variant="outline" onClick={onCancel}>
              Cancel
            </WuButton>
          )}
        </div>
      </form>
    </div>
  );
}
