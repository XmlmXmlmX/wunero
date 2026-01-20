import { useState } from "react";
import { WuButton, WuInput, WuTextArea } from "@/components/atoms";
import { type WuOrganism } from "@/types/WuOrganism";
import styles from "./WuItemForm.module.css";

interface WuItemFormProps extends WuOrganism<HTMLDivElement> {
  onSubmit: (payload: { title: string; description?: string; url?: string; priority: number }) => Promise<void> | void;
  onCancel?: () => void;
}

export function WuItemForm({ onSubmit, onCancel, className, ...rest }: WuItemFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [priority, setPriority] = useState(0);
  const [submitting, setSubmitting] = useState(false);

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
      });
      setTitle("");
      setDescription("");
      setUrl("");
      setPriority(0);
    } finally {
      setSubmitting(false);
    }
  };
  const classes = [styles.card, className].filter(Boolean).join(" ");
  return (
    <div className={classes} {...rest}>
      <h3 className={styles.title}>Add New Item</h3>
      <form onSubmit={handleSubmit}>
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
        <div className={styles.field}>
          <label htmlFor="item-url" className={styles.label}>
            Product URL (Amazon, eBay, Idealo)
          </label>
          <WuInput
            id="item-url"
            type="url"
            placeholder="https://www.amazon.com/..."
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            fullWidth
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="item-priority" className={styles.label}>
            Priority (0-10)
          </label>
          <WuInput
            id="item-priority"
            type="number"
            min={0}
            max={10}
            value={priority}
            onChange={(event) => {
              const parsed = parseInt(event.target.value, 10);
              setPriority(Number.isNaN(parsed) ? 0 : parsed);
            }}
            fullWidth
          />
        </div>
        <div className={styles.actions}>
          <WuButton type="submit" variant="primary" isLoading={submitting}>
            {submitting ? "Saving..." : "Add Item"}
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
