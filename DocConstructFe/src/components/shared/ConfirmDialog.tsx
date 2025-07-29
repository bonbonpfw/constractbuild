import React from 'react';
import {
  Button,
  DialogActions,
  DialogContainer,
  DialogHeader,
  DialogOverlay,
  DialogTitle, Form
} from "../../styles/SharedStyles";


const ConfirmDialog: React.FC<{
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDisabled?: boolean;
}> = ({message, onConfirm, onCancel, isDisabled = false}) => {
  const handleConfirm = (e: React.MouseEvent) => {
    console.log("ConfirmDialog: Confirm button clicked");
    onConfirm();
  };
  
  return (
    <DialogOverlay onClick={onCancel}>
      <DialogContainer onClick={e => e.stopPropagation()}>
        <DialogHeader style={{justifyContent: 'center'}}>
          <DialogTitle style={{textAlign: 'center'}}>{message}</DialogTitle>
        </DialogHeader>
        <Form>
          <DialogActions style={{justifyContent: 'center'}}>
            <Button 
              variant="text" 
              style={{marginLeft: '10px'}} 
              onClick={onCancel}
              disabled={isDisabled}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleConfirm}
              disabled={isDisabled}
            >
              {isDisabled ? 'מחיקה...' : 'אישור'}
            </Button>
          </DialogActions>
        </Form>
      </DialogContainer>
    </DialogOverlay>
  );
};

export default ConfirmDialog;