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
}> = ({message, onConfirm, onCancel}) => {
  return (
    <DialogOverlay onClick={onCancel}>
      <DialogContainer onClick={e => e.stopPropagation()}>
        <DialogHeader style={{justifyContent: 'center'}}>
          <DialogTitle style={{textAlign: 'center'}}>{message}</DialogTitle>
        </DialogHeader>
        <Form>
          <DialogActions style={{justifyContent: 'center'}}>
            <Button variant="text" style={{marginLeft: '10px'}} onClick={onCancel}>Cancel</Button>
            <Button variant="contained" onClick={onConfirm}>Confirm</Button>
          </DialogActions>
        </Form>
      </DialogContainer>
    </DialogOverlay>
  );
};

export default ConfirmDialog;