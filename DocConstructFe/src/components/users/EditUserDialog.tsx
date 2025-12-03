import React, { Dispatch, useState } from "react";
import { FaTimes } from "react-icons/fa";
import {
  Button,
  DialogActions,
  DialogCloseButton,
  DialogContainer,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "../../styles/SharedStyles";
import { errorHandler, ErrorResponseData } from "../shared/ErrorHandler";
import { Form, Input } from "antd";
import { CreateUserValues, EditUserValues, User } from "../../types";
import { createUser, editUser } from "../../api";

interface EditUsersDialogProps {
  id: string | null;
  onClose: () => void;
}

const EditUserDialog: React.FC<EditUsersDialogProps> = ({ id, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: EditUserValues) => {
    const { oldPassword, newPassword } = values;
    setLoading(true);

    if (id) {
      try {
        await editUser(id, {
          old_password: oldPassword,
          new_password: newPassword,
        });

        onClose();
      } catch (error) {
        errorHandler(
          error as ErrorResponseData,
          "Failed to update user password",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <DialogOverlay>
        <DialogContainer
          style={{
            width: 1200,
            maxWidth: "99vw",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>עריכת משתמש</DialogTitle>
            <DialogCloseButton onClick={onClose}>
              <FaTimes />
            </DialogCloseButton>
          </DialogHeader>
          <Form<EditUserValues>
            layout="vertical"
            colon={false}
            onFinish={handleSubmit}
            style={{ padding: "20px" }}
          >
            <Form.Item
              label="סיסמה נוכחית"
              name="oldPassword"
              rules={[{ required: true, message: "נא להזין סיסמה נוכחית" }]}
            >
              <Input.Password placeholder="••••••••" size="large" />
            </Form.Item>

            <Form.Item
              label="סיסמה חדשה"
              name="newPassword"
              rules={[
                { required: true, message: "נא להזין סיסמה חדשה" },
                { min: 6, message: "הסיסמה חייבת להכיל לפחות 6 תווים" },
              ]}
            >
              <Input.Password placeholder="••••••••" size="large" />
            </Form.Item>

            <Form.Item
              label="אימות סיסמה חדשה"
              name="confirmNewPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "נא לאשר את הסיסמה החדשה" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("הסיסמאות אינן תואמות"));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="••••••••" size="large" />
            </Form.Item>
            <DialogActions>
              <Button variant="text" onClick={onClose}>
                ביטול
              </Button>
              <Button variant="contained" type="submit" disabled={loading}>
                {loading ? "שומר..." : "שמור"}
              </Button>
            </DialogActions>
          </Form>
        </DialogContainer>
      </DialogOverlay>
    </>
  );
};

export default EditUserDialog;
