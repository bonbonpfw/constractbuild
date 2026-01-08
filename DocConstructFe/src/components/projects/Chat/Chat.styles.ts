import styled from "styled-components";
import { Button, TextArea } from "../../../styles/SharedStyles";

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  direction: rtl;
`;

export const MessagesWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: linear-gradient(135deg, #f0f4ff 0%, #fef6f3 100%);

  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #c7d2fe;
    border-radius: 10px;
  }
`;

export const MessageRow = styled.div<{ $isMine: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.$isMine ? "flex-start" : "flex-end")};
  width: 100%;
`;

export const MessageBubble = styled.div<{ $isMine: boolean }>`
  max-width: 70%;
  padding: 10px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  ${(props) =>
    props.$isMine
      ? `
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border-bottom-right-radius: 4px;
  `
      : `
    background: linear-gradient(135deg, #fda4af 0%, #fb7185 100%);
    color: white;
    border-bottom-left-radius: 4px;
  `}
`;

export const MessageInfo = styled.div<{ $isMine: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 11px;
  color: #64748b;
  flex-direction: ${(props) => (props.$isMine ? "row" : "row-reverse")};
`;

export const MessageDate = styled.span`
  font-size: 10px;
  color: #94a3b8;
`;

export const AuthorName = styled.span`
  font-weight: 600;
`;

export const Timestamp = styled.span`
  opacity: 0.8;
`;

export const InputWrapper = styled.div`
  padding: 16px;
  background-color: #ffffff;
  border-top: 1px solid #f1f1f1;
  display: flex;
  align-items: flex-end;
  gap: 12px;
`;

export const ChatInput = styled.textarea`
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 10px 16px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  max-height: 120px;
  min-height: 40px;
  background-color: #f8f9fa;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #8b5cf6;
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  }
`;

export const SendButton = styled.button<{ $disabled: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${(props) => (props.$disabled ? "#e2e8f0" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)")};
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${(props) => (props.$disabled ? "default" : "pointer")};
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    ${(props) => !props.$disabled && "transform: scale(1.05); filter: brightness(1.1);"}
  }

  &:active {
    ${(props) => !props.$disabled && "transform: scale(0.95);"}
  }

  svg {
    font-size: 16px;
  }
`;

export const MessageActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`;

export const ActionLink = styled.button`
  background: none;
  border: none;
  font-size: 10px;
  color: #6366f1;
  cursor: pointer;
  padding: 0;
  &:hover {
    text-decoration: underline;
  }
`;

export const EditInput = styled.textarea`
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  border-radius: 8px;
  padding: 8px;
  font-size: 14px;
  font-family: inherit;
  margin-bottom: 8px;
`;
