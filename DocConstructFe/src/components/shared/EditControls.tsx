import React from "react";
import styled from "styled-components";
import { FaEdit, FaCheck, FaTimes } from "react-icons/fa";

const EditControlsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 12px;
`;

const IconButton = styled.button<{ $variant?: "default" | "save" | "cancel" }>`
  width: 30px;
  height: 30px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid ${(p) => 
    p.$variant === "save" ? "#bbf7d0" : 
    p.$variant === "cancel" ? "#fecaca" : 
    "#e2e8f0"
  };
  background-color: ${(p) => 
    p.$variant === "save" ? "#dcfce7" : 
    p.$variant === "cancel" ? "#fee2e2" : 
    "#ffffff"
  };
  color: ${(p) => 
    p.$variant === "save" ? "#166534" : 
    p.$variant === "cancel" ? "#dc2626" : 
    "#64748b"
  };
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

type EditControlsProps = {
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
  editTitle?: string;
  saveTitle?: string;
  cancelTitle?: string;
};

const EditControls: React.FC<EditControlsProps> = ({
  isEditing,
  onEdit,
  onSave,
  onCancel,
  saving = false,
  editTitle = "עריכה",
  saveTitle = "שמירה",
  cancelTitle = "ביטול",
}) => {
  return (
    <EditControlsContainer>
      {!isEditing ? (
        <IconButton onClick={onEdit} title={editTitle}>
          <FaEdit />
        </IconButton>
      ) : (
        <>
          <IconButton
            $variant="save"
            onClick={onSave}
            disabled={saving}
            title={saveTitle}
          >
            <FaCheck />
          </IconButton>
          <IconButton
            $variant="cancel"
            onClick={onCancel}
            disabled={saving}
            title={cancelTitle}
          >
            <FaTimes />
          </IconButton>
        </>
      )}
    </EditControlsContainer>
  );
};

export default EditControls;

