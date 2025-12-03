import Avatar from "../../shared/Avatar";
import {
  MessageContent,
  Message as MessageWrapper,
  MessageTimestamp,
  MessageAuthor,
} from "./Chat.styles";

import { Comment } from "./Chat";

export default function Message({ comment }: { comment: Comment }) {
  const formattedDate = new Date(comment.created_at).toLocaleDateString(
    "he-IL"
  );

  const formattedTime = new Date(comment.created_at).toLocaleTimeString(
    "he-IL"
  );
  return (
    <MessageWrapper>
      <Avatar name={comment.author_username} />
      <MessageContent>
        <MessageAuthor>{comment.author_username}</MessageAuthor>
        <span>{comment.content}</span>
        <MessageTimestamp>
          {formattedDate} {formattedTime}
        </MessageTimestamp>
      </MessageContent>
    </MessageWrapper>
  );
}
