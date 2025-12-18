import { useEffect, useState } from "react";
import Avatar from "../../shared/Avatar";
import {
  MessageContent,
  Message as MessageWrapper,
  MessageTimestamp,
  MessageAuthor,
  MessageActions,
  MessageActionButton,
  MessageEditInput,
} from "./Chat.styles";

import { Comment } from "./Chat";

type MessageProps = {
  comment: Comment;
  canEdit?: boolean;
  onUpdate?: (commentId: string, content: string) => Promise<void>;
};

export default function Message({
  comment,
  canEdit = false,
  onUpdate,
}: MessageProps) {
  const formattedDate = new Date(comment.created_at).toLocaleDateString(
    "he-IL"
  );

  const formattedTime = new Date(comment.created_at).toLocaleTimeString(
    "he-IL"
  );

  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setDraftContent(comment.content);
    }
  }, [comment.content, isEditing]);

  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 90%)`;
  };

  const userColor = stringToColor(comment.author_username);

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
    <MessageWrapper>
      <Avatar name={comment.author_username} />
      <MessageContent $backgroundColor={userColor}>
        <MessageAuthor>{comment.author_username}</MessageAuthor>
        {isEditing ? (
          <MessageEditInput
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            disabled={isSaving}
          />
        ) : (
          <span>{comment.content}</span>
        )}
        <MessageTimestamp>
          {formattedDate} {formattedTime}
        </MessageTimestamp>
        {canEdit && (
          <MessageActions>
            {isEditing ? (
              <>
                <MessageActionButton
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  ביטול
                </MessageActionButton>
                <MessageActionButton
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  שמור
                </MessageActionButton>
              </>
            ) : (
              <MessageActionButton
                type="button"
                onClick={() => setIsEditing(true)}
              >
                ערוך
              </MessageActionButton>
            )}
          </MessageActions>
        )}
      </MessageContent>
    </MessageWrapper>
  );
}
