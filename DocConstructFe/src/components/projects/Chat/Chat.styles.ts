import styled from "styled-components";
import { Button, TextArea } from "../../../styles/SharedStyles";

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
  border-radius: 0;
  overflow: hidden;
  position: relative;
  direction: rtl;
`;

export const MessagesWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background-color: #e5ddd5;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='a' patternUnits='userSpaceOnUse' width='100' height='100' patternTransform='scale(0.5) rotate(0)'%3E%3Crect x='0' y='0' width='100' height='100' fill='hsla(0,0%25,100%25,0)'/%3E%3Cpath d='M50 50h50v50H50z' stroke-width='0.5' stroke='hsla(258.5,59.3%25,59.1%25,0.05)' fill='none'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23a)'/%3E%3C/svg%3E");

  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
  }
`;

export const MessageRow = styled.div<{ $isMine: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 2px;
`;

export const MessageBubble = styled.div<{ $isMine: boolean }>`
  max-width: 65%;
  padding: 6px 7px 8px 9px;
  border-radius: 7.5px;
  font-size: 14.2px;
  line-height: 19px;
  position: relative;
  word-wrap: break-word;
  box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13);

  ${(props) =>
    props.$isMine
      ? `
    background-color: #dcf8c6;
    color: #303030;
    border-bottom-left-radius: 0;
  `
      : `
    background-color: #ffffff;
    color: #303030;
    border-bottom-right-radius: 0;
  `}
`;

export const MessageInfo = styled.div<{ $isMine: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
  font-size: 11px;
  color: #667781;
  flex-direction: ${(props) => (props.$isMine ? "row-reverse" : "row")};
  padding: 0 4px;
`;

export const MessageDate = styled.span`
  font-size: 11px;
  color: #667781;
`;

export const AuthorName = styled.span`
  font-weight: 500;
  color: #667781;
`;

export const Timestamp = styled.span`
  font-size: 11px;
  color: rgba(0, 0, 0, 0.45);
  white-space: nowrap;
`;

export const InputWrapper = styled.div`
  padding: 8px 12px;
  background-color: #f0f2f5;
  border-top: 1px solid #e4e6eb;
  display: flex;
  align-items: flex-end;
  gap: 8px;
`;

export const ChatInput = styled.textarea`
  flex: 1;
  border: none;
  border-radius: 21px;
  padding: 9px 12px 9px 16px;
  font-size: 15px;
  font-family: inherit;
  resize: none;
  max-height: 100px;
  min-height: 42px;
  background-color: #ffffff;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  &:focus {
    outline: none;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  }
`;

export const SendButton = styled.button<{ $disabled: boolean }>`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: ${(props) => (props.$disabled ? "#e4e6eb" : "#0084ff")};
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${(props) => (props.$disabled ? "default" : "pointer")};
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    ${(props) => !props.$disabled && "background: #0073e6;"}
  }

  &:active {
    ${(props) => !props.$disabled && "transform: scale(0.95);"}
  }

  svg {
    font-size: 18px;
  }
`;

export const MessageActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding-top: 6px;
  flex-shrink: 0;
`;

export const ActionLink = styled.button`
  background: none;
  border: none;
  font-size: 11px;
  color: #667781;
  cursor: pointer;
  padding: 0;
  &:hover {
    text-decoration: underline;
    color: #0084ff;
  }
`;

export const EditInput = styled.textarea`
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.9);
  color: #303030;
  border-radius: 8px;
  padding: 8px;
  font-size: 14px;
  font-family: inherit;
  margin-bottom: 8px;
`;
