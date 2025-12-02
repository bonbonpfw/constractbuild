import styled from "styled-components";
import { Button, TextArea } from "../../../styles/SharedStyles";

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

export const ChatInput = styled(TextArea)`
  width: 100%;
  min-height: 100px;
  resize: none;
  padding-bottom: 40px;
`;

export const ChatWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  flex-grow: 1;
  min-height: 0;
`;

export const SendButton = styled(Button)`
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 4px;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  margin-left: 4px;
  margin-bottom: 4px;
`;

export const MessagesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
`;

export const Message = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
`;

export const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 8px;
`;

export const MessageTimestamp = styled.div`
  font-size: 10px;
  color: #999999;
  text-align: right;
`;

export const MessageAuthor = styled.div`
  font-size: 12px;
  color: #333333;
  font-weight: 600;
`;
