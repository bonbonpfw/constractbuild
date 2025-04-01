import {DialogContainer, DialogOverlay} from "../styles/SharedStyles";
import React from "react";

const Dialog = ({onClose, children, width}: {
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}) => {
  return (
    <DialogOverlay onClick={onClose}>
      <DialogContainer width={width} onClick={(e) => e.stopPropagation()}>
        {children}
      </DialogContainer>
    </DialogOverlay>
  );
};

export default Dialog;