import React from 'react';
import {DialogButton, DialogButtonGroup, DialogTitle} from "../styles/SharedStyles";
import Dialog from "./Dialog";


const ConfirmModal: React.FC<{
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({message, onConfirm, onCancel}) => {
  return (
    <Dialog onClose={onCancel}>
      <DialogTitle>{message}</DialogTitle>
      <DialogButtonGroup>
        <DialogButton style={{marginLeft: '10px'}} onClick={onCancel}>ביטול</DialogButton>
        <DialogButton variant="contained" onClick={onConfirm}>אישור</DialogButton>
      </DialogButtonGroup>
    </Dialog>
  );
};

export default ConfirmModal;