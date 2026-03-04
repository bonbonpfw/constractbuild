import { useEffect, useState } from "react";
import {
  MessageRow,
  MessageBubble,
  MessageInfo,
  AuthorName,
  Timestamp,
  MessageDate,
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
  const messageDate = new Date(comment.created_at);
  const formattedTime = messageDate.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jerusalem",
  });
  const formattedDate = messageDate.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jerusalem",
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
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        alignItems: isMine ? "flex-end" : "flex-start",
        width: "100%"
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "flex-start", 
          gap: "6px", 
          width: "100%",
          justifyContent: isMine ? "flex-end" : "flex-start"
        }}>
          {isMine ? (
            <>
              {canEdit && !isEditing && (
                <MessageActions>
                  <ActionLink onClick={() => setIsEditing(true)}>ערוך</ActionLink>
                </MessageActions>
              )}
              <MessageBubble $isMine={isMine}>
                {isEditing ? (
                  <>
                    <EditInput
                      value={draftContent}
                      onChange={(e) => setDraftContent(e.target.value)}
                      disabled={isSaving}
                      autoFocus
                    />
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
                      <ActionLink style={{ color: "#303030" }} onClick={() => setIsEditing(false)}>ביטול</ActionLink>
                      <ActionLink style={{ color: "#303030", fontWeight: "bold" }} onClick={handleSave}>שמור</ActionLink>
                    </div>
                  </>
                ) : (
                  <div style={{ wordBreak: "break-word" }}>
                    {comment.content}
                  </div>
                )}
              </MessageBubble>
            </>
          ) : (
            <>
              <MessageBubble $isMine={isMine}>
                {isEditing ? (
                  <>
                    <EditInput
                      value={draftContent}
                      onChange={(e) => setDraftContent(e.target.value)}
                      disabled={isSaving}
                      autoFocus
                    />
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
                      <ActionLink style={{ color: "#303030" }} onClick={() => setIsEditing(false)}>ביטול</ActionLink>
                      <ActionLink style={{ color: "#303030", fontWeight: "bold" }} onClick={handleSave}>שמור</ActionLink>
                    </div>
                  </>
                ) : (
                  <div style={{ wordBreak: "break-word" }}>
                    {comment.content}
                  </div>
                )}
              </MessageBubble>
              {canEdit && !isEditing && (
                <MessageActions>
                  <ActionLink onClick={() => setIsEditing(true)}>ערוך</ActionLink>
                </MessageActions>
              )}
            </>
          )}
        </div>
        <MessageInfo $isMine={isMine}>
          {!isMine && <AuthorName>{comment.author_username}</AuthorName>}
          <Timestamp>{formattedTime}</Timestamp>
          <MessageDate>{formattedDate}</MessageDate>
        </MessageInfo>
      </div>
    </MessageRow>
  );
}
