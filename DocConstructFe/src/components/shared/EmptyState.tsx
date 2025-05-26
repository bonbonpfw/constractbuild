import React from "react";
import { EmptyState, EmptyStateIcon, EmptyStateText } from "../../styles/SharedStyles";

interface EmptyStatePlaceholderProps {
  msg?: string;
}

const EmptyStatePlaceholder: React.FC<EmptyStatePlaceholderProps> = ({msg = "No data available"}) => (
  <EmptyState>
    <EmptyStateIcon />
    <EmptyStateText>{msg}</EmptyStateText>
  </EmptyState>
);

export default EmptyStatePlaceholder;