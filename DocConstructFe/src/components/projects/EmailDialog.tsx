import React, { useState, useEffect } from "react";
import {
  DialogOverlay,
  DialogContainer,
  DialogHeader,
  DialogTitle,
  DialogCloseButton,
  DialogActions,
  Form,
  Field,
  FullWidthField,
  Label,
  Input,
  TextArea,
  Button,
} from "../../styles/SharedStyles";
import * as FaIcons from "react-icons/fa";

interface EmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (recipientEmail: string, subject: string, body: string) => Promise<void>;
  defaultRecipientEmail?: string;
  defaultSubject?: string;
  defaultBody?: string;
  isSending?: boolean;
}

const EmailDialog: React.FC<EmailDialogProps> = ({
  isOpen,
  onClose,
  onSend,
  defaultRecipientEmail = "",
  defaultSubject = process.env.NEXT_PUBLIC_FILLED_PROJECT_DOCUMENTS_EMAIL_SUBJECT || "",
  defaultBody = process.env.NEXT_PUBLIC_FILLED_PROJECT_DOCUMENTS_EMAIL_BODY || "",
  isSending = false,
}) => {
  const [recipientEmail, setRecipientEmail] = useState(defaultRecipientEmail);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);

  useEffect(() => {
    if (isOpen) {
      setRecipientEmail(defaultRecipientEmail);
      setSubject(defaultSubject);
      setBody(defaultBody);
    }
  }, [isOpen, defaultRecipientEmail, defaultSubject, defaultBody]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!recipientEmail || !subject || !body) {
      return;
    }
    await onSend(recipientEmail, subject, body);
  };

  const handleClose = () => {
    if (!isSending) {
      onClose();
    }
  };

  return (
    <DialogOverlay>
      <DialogContainer onClick={(e) => e.stopPropagation()} style={{ width: "600px" }}>
        <DialogHeader>
          <DialogTitle>שלח מסמכים במייל</DialogTitle>
          <DialogCloseButton onClick={handleClose} disabled={isSending}>
            <FaIcons.FaTimes />
          </DialogCloseButton>
        </DialogHeader>
        <Form>
          <FullWidthField>
            <Label>מ:</Label>
            <Input
              type="email"
              value={
                process.env.NEXT_PUBLIC_MAIL_DEFAULT_SENDER_EMAIL ||
                "miri@opazit.co.il"
              }
              disabled
              style={{ backgroundColor: "#f5f5f5" }}
            />
          </FullWidthField>
          <FullWidthField>
            <Label>אל:</Label>
            <Input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="הכנס כתובת אימייל"
              disabled={isSending}
              required
            />
          </FullWidthField>
          <FullWidthField>
            <Label>נושא:</Label>
            <Input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="נושא המייל"
              disabled={isSending}
              required
            />
          </FullWidthField>
          <FullWidthField>
            <Label>תוכן:</Label>
            <TextArea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="תוכן המייל"
              disabled={isSending}
              required
              style={{ minHeight: "120px" }}
            />
          </FullWidthField>
          <DialogActions>
            <Button
              variant="text"
              onClick={handleClose}
              disabled={isSending}
            >
              ביטול
            </Button>
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={isSending || !recipientEmail || !subject || !body}
            >
              {isSending ? "שולח..." : "שלח"}
            </Button>
          </DialogActions>
        </Form>
      </DialogContainer>
    </DialogOverlay>
  );
};

export default EmailDialog;

