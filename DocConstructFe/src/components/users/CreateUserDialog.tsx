import React, { useState, useEffect } from "react";
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
import { CreateUserValues } from "../../types";
import { createUser } from "../../api";

interface CreateUsersDialogProps {
  onClose: () => void;
  onUserCreated: () => void;
}

const CreateUserDialog: React.FC<CreateUsersDialogProps> = ({
  onUserCreated,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const handleSubmit = async (values: CreateUserValues) => {
    setLoading(true);
    const { username, password, role } = values;
    try {
      await createUser(username, password, role);
      onUserCreated();
      onClose();
    } catch (error) {
      errorHandler(error as ErrorResponseData, "Failed to create user");
    } finally {
      setLoading(false);
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
            <DialogTitle>יצירת משתמש</DialogTitle>
            <DialogCloseButton onClick={onClose}>
              <FaTimes />
            </DialogCloseButton>
          </DialogHeader>
          <Form
            form={form}
            layout="vertical"
            colon={false}
            onFinish={handleSubmit}
            style={{ padding: "20px" }}
          >
            <Form.Item
              label="שם משתמש"
              name="username"
              rules={[{ required: true, message: "Please enter username" }]}
            >
              <Input autoComplete="off" onPressEnter={() => form.submit()} />
            </Form.Item>
            <Form.Item
              label="סיסמה"
              name="password"
              rules={[
                { required: true, message: "Please enter password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password
                autoComplete="new-password"
                placeholder="••••••••"
                size="large"
                onPressEnter={() => form.submit()}
              />
            </Form.Item>
            <Form.Item
              label="אימות סיסמה"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password
                autoComplete="new-password"
                placeholder="••••••••"
                size="large"
                onPressEnter={() => form.submit()}
              />
            </Form.Item>
            <Form.Item
              label="תפקיד"
              name="role"
              initialValue="user"
              rules={[{ required: true, message: "Please select a role" }]}
            >
              <Select size="large">
                <Select.Option value="user">משתמש</Select.Option>
                <Select.Option value="admin">מנהל</Select.Option>
              </Select>
            </Form.Item>
            <DialogActions>
              <Button variant="text" onClick={onClose} type="button">
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

export default CreateUserDialog;
