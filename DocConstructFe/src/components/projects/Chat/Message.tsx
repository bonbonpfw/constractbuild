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

  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 90%)`;
  };

  const userColor = stringToColor(comment.author_username);

  return (
    <MessageWrapper>
      <Avatar name={comment.author_username} />
      <MessageContent $backgroundColor={userColor}>
        <MessageAuthor>{comment.author_username}</MessageAuthor>
        <span>{comment.content}</span>
        <MessageTimestamp>
          {formattedDate} {formattedTime}
        </MessageTimestamp>
      </MessageContent>
    </MessageWrapper>
  );
}
