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
  background-color: #f9f9f9;

  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #e2e8f0;
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
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  ${(props) =>
    props.$isMine
      ? `
    background-color: #007aff;
    color: white;
    border-bottom-right-radius: 4px;
  `
      : `
    background-color: #e9e9eb;
    color: #1c1c1e;
    border-bottom-left-radius: 4px;
  `}
`;

export const MessageInfo = styled.div<{ $isMine: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 11px;
  color: #8e8e93;
  flex-direction: ${(props) => (props.$isMine ? "row" : "row-reverse")};
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
    border-color: #007aff;
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }
`;

export const SendButton = styled.button<{ $disabled: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${(props) => (props.$disabled ? "#e2e8f0" : "#007aff")};
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${(props) => (props.$disabled ? "default" : "pointer")};
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    ${(props) => !props.$disabled && "transform: scale(1.05); background-color: #0063db;"}
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
  color: #007aff;
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
