import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChatContainer,
  ChatInput,
  MessagesWrapper,
  SendButton,
  InputWrapper,
} from "./Chat.styles";
import { FaArrowUp } from "react-icons/fa";
import {
  getProjectComments,
  addProjectComment,
  updateProjectComment,
} from "../../../api";
import Message from "./Message";

export type Comment = {
  id: string;
  author_user_id: string;
  author_username: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export default function Chat({ projectId }: { projectId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (isSending || !input.trim()) return;
    setIsSending(true);
    try {
      const newComment = await addProjectComment(projectId, input);
      setComments((prev) => [...prev, newComment]);
      setInput("");
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Failed to send comment:", err);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("user_info");
    if (storedUserInfo) {
      try {
        const parsedUser = JSON.parse(storedUserInfo);
        setCurrentUserId(parsedUser.id || null);
      } catch {
        setCurrentUserId(null);
      }
    }
  }, []);

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      const updatedComment = await updateProjectComment(
        projectId,
        commentId,
        content
      );
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === updatedComment.id ? updatedComment : comment
        )
      );
    } catch (err) {
      console.error("Failed to update comment:", err);
    }
  };

  const loadChat = async () => {
    try {
      const chat = await getProjectComments(projectId);
      setComments(chat);
    } catch (err) {
      console.error("Failed to load chat:", err);
    }
  };

  useEffect(() => {
    loadChat();
    const interval = setInterval(loadChat, 3000);
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  }, [comments]);

  return (
    <ChatContainer>
      <MessagesWrapper>
        {sortedComments.map((comment) => (
          <Message
            key={comment.id}
            comment={comment}
            isMine={comment.author_user_id === currentUserId}
            canEdit={comment.author_user_id === currentUserId}
            onUpdate={handleUpdateComment}
          />
        ))}
        <div ref={messagesEndRef} />
      </MessagesWrapper>
      <InputWrapper>
        <ChatInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="הקלד הודעה..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <SendButton $disabled={!input.trim() || isSending} onClick={handleSend}>
          <FaArrowUp />
        </SendButton>
      </InputWrapper>
    </ChatContainer>
  );
}
