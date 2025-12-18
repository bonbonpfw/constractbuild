import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChatContainer,
  ChatInput,
  ChatWrapper,
  MessagesWrapper,
  SendButton,
} from "./Chat.styles";
import { Label } from "../../../styles/SharedStyles";
import { FaArrowUp } from "react-icons/fa";
import {
  getProjectComments,
  addProjectComment,
  updateProjectComment,
} from "../../../api";
import Avatar from "../../shared/Avatar";
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const chatRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (isSending) return;
    if (!input.trim()) return;
    setIsSending(true);
    const newComment = await addProjectComment(projectId, input);
    setComments([...comments, newComment]);
    setInput("");
    setIsSending(false);
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
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
  };

  useEffect(() => {
    const fetchChat = async () => {
      const chat = await getProjectComments(projectId);
      setComments(chat);
      console.log(chatRef.current);
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    };
    fetchChat();
  }, [projectId]);

  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  }, [comments]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    const fetchChat = async () => {
      const chat = await getProjectComments(projectId);
      setComments(chat);
    };

    const interval = setInterval(() => {
      fetchChat();
    }, 2000);
    return () => clearInterval(interval);
  }, [sortedComments]);

  return (
    <ChatContainer>
      <ChatWrapper>
        <MessagesWrapper ref={chatRef}>
          {sortedComments.map((comment) => (
            <Message
              key={comment.id}
              comment={comment}
              canEdit={comment.author_user_id === currentUserId}
              onUpdate={handleUpdateComment}
            />
          ))}
        </MessagesWrapper>
        <ChatInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="הקלד את התגובה שלך"
          disabled={isSending}
        />
        <SendButton onClick={handleSend}>
          <FaArrowUp />
        </SendButton>
      </ChatWrapper>
    </ChatContainer>
  );
}
