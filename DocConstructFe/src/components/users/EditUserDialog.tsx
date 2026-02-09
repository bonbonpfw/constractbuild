import React, { useState } from "react";
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
import { Form, Input, Select } from "antd";
import { EditUserValues } from "../../types";
import { editUser } from "../../api";

interface EditUsersDialogProps {
  id: string | null;
  currentRole: string;
  onClose: () => void;
  onUserUpdated?: () => void;
}

const EditUserDialog: React.FC<EditUsersDialogProps> = ({ id, currentRole, onClose, onUserUpdated }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: EditUserValues) => {
    const { role, newPassword } = values;
    setLoading(true);

    if (id) {
      try {
        await editUser(id, {
          role: role,
          ...(newPassword && { new_password: newPassword }),
        });

        onUserUpdated?.();
        onClose();
      } catch (error) {
        errorHandler(
          error as ErrorResponseData,
          "Failed to update user",
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
            initialValues={{ role: currentRole }}
          >
            <Form.Item
              label="תפקיד"
              name="role"
              rules={[{ required: true, message: "נא לבחור תפקיד" }]}
            >
              <Select size="large">
                <Select.Option value="user">משתמש</Select.Option>
                <Select.Option value="admin">מנהל</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="סיסמה חדשה (השאר ריק אם לא רוצה לשנות)"
              name="newPassword"
              rules={[
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
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const newPassword = getFieldValue("newPassword");
                    if (!newPassword || newPassword === value) {
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
