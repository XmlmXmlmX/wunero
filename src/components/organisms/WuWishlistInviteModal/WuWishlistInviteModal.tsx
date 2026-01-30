import { WuButton, WuInput } from "@/components/atoms";
import { WuAvatar } from "@/components/atoms/WuAvatar/WuAvatar";
import { WuModal } from "@/components/molecules/WuModal/WuModal";
import styles from "./WuWishlistInviteModal.module.css";

interface WishlistMember {
  id: string;
  name?: string;
  email: string;
  avatar_url?: string;
  is_pending?: boolean;
}

interface WuWishlistInviteModalProps {
  isOpen: boolean;
  isOwner: boolean;
  ownerId: string;
  memberEmail: string;
  onMemberEmailChange: (value: string) => void;
  onAddMember: () => void;
  memberError: string | null;
  membersLoading: boolean;
  members: WishlistMember[];
  resendingInvitation: string | null;
  onResendInvitation: (email: string) => void;
  onRemoveMember: (memberId: string) => void;
  onClose: () => void;
}

export function WuWishlistInviteModal({
  isOpen,
  isOwner,
  ownerId,
  memberEmail,
  onMemberEmailChange,
  onAddMember,
  memberError,
  membersLoading,
  members,
  resendingInvitation,
  onResendInvitation,
  onRemoveMember,
  onClose,
}: WuWishlistInviteModalProps) {
  if (!isOwner) return null;

  return (
    <WuModal isOpen={isOpen} title="Invite Members" onClose={onClose}>
      <div className={styles.membersSection}>
        <div className={styles.membersAddRow}>
          <WuInput
            value={memberEmail}
            onChange={(e) => onMemberEmailChange(e.target.value)}
            placeholder="Add member by email"
            type="email"
            fullWidth
          />
          <WuButton type="button" variant="primary" onClick={onAddMember} disabled={!memberEmail.trim()}>
            Add
          </WuButton>
        </div>
        {memberError && <p className={styles.memberError}>{memberError}</p>}
        {membersLoading ? (
          <p className={styles.memberHint}>Loading members...</p>
        ) : (
          <ul className={styles.membersList}>
            {members.length === 0 && <li className={styles.memberHint}>No members yet.</li>}
            {members.map((member) => {
              const isPending = member.is_pending === true;
              return (
                <li key={member.id} className={`${styles.memberItem} ${isPending ? styles.memberItemPending : ""}`}>
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
                        onClick={() => onResendInvitation(member.email)}
                        disabled={resendingInvitation === member.email}
                      >
                        {resendingInvitation === member.email ? "Resending..." : "Resend"}
                      </WuButton>
                    )}
                    {member.id !== ownerId && (
                      <WuButton type="button" variant="outline" onClick={() => onRemoveMember(member.id)}>
                        Remove
                      </WuButton>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className={styles.actionsRow}>
          <WuButton type="button" variant="outline" onClick={onClose}>
            Close
          </WuButton>
        </div>
      </div>
    </WuModal>
  );
}
