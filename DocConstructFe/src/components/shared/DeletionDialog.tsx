import React from 'react';
import ConfirmDialog from "./ConfirmDialog";

const DeletionDialog: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
}> = ({isOpen, onConfirm, onCancel, message}) => {
  if (!isOpen) return null;

  return (
    <ConfirmDialog
      message={message || "Are you sure you want to delete it?"}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};

export default DeletionDialog;
