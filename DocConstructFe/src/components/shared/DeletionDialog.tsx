import React from 'react';
import ConfirmDialog from "./ConfirmDialog";

const DeletionDialog: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
  isDeleting?: boolean;
}> = ({isOpen, onConfirm, onCancel, message, isDeleting = false}) => {
  console.log("DeletionDialog render, isOpen:", isOpen, "isDeleting:", isDeleting);
  
  if (!isOpen) return null;
  
  const handleConfirm = () => {
    console.log("DeletionDialog: Confirm button clicked");
    onConfirm();
  };

  return (
    <ConfirmDialog
      message={message || "האם ברצונך למחוק את הפרוייקט?"}
      onConfirm={handleConfirm}
      onCancel={onCancel}
      isDisabled={isDeleting}
    />
  );
};

export default DeletionDialog;
