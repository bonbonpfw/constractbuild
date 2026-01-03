import { useEffect, useState } from "react";
import {
  MessageRow,
  MessageBubble,
  MessageInfo,
  AuthorName,
  Timestamp,
  MessageActions,
  ActionLink,
  EditInput,
} from "./Chat.styles";
import { Comment } from "./Chat";

type MessageProps = {
  comment: Comment;
  isMine: boolean;
  canEdit?: boolean;
  onUpdate?: (commentId: string, content: string) => Promise<void>;
};

export default function Message({
  comment,
  isMine,
  canEdit = false,
  onUpdate,
}: MessageProps) {
  const formattedTime = new Date(comment.created_at).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setDraftContent(comment.content);
    }
  }, [comment.content, isEditing]);

  const handleSave = async () => {
    if (!onUpdate) {
      setIsEditing(false);
      return;
    }
    const trimmedContent = draftContent.trim();
    if (!trimmedContent) return;
    setIsSaving(true);
    try {
      await onUpdate(comment.id, trimmedContent);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MessageRow $isMine={isMine}>
      <MessageInfo $isMine={isMine}>
        <AuthorName>{isMine ? "אתה" : comment.author_username}</AuthorName>
        <Timestamp>{formattedTime}</Timestamp>
      </MessageInfo>
      <MessageBubble $isMine={isMine}>
        {isEditing ? (
          <>
            <EditInput
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              disabled={isSaving}
              autoFocus
            />
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <ActionLink style={{ color: "white" }} onClick={() => setIsEditing(false)}>ביטול</ActionLink>
              <ActionLink style={{ color: "white", fontWeight: "bold" }} onClick={handleSave}>שמור</ActionLink>
            </div>
          </>
        ) : (
          <div>{comment.content}</div>
        )}
      </MessageBubble>
      {canEdit && !isEditing && (
        <MessageActions>
          <ActionLink onClick={() => setIsEditing(true)}>ערוך</ActionLink>
        </MessageActions>
      )}
    </MessageRow>
  );
}
