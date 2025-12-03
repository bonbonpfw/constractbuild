import React, { useEffect, useState } from "react";
import {
  IconButton,
  PageContainer,
  PageContent,
  TableBody,
  TopPanel,
  TopPanelGroup,
  TopPanelLogo,
  TopPanelTitle,
  TopPanelTitleHolder,
  Table,
} from "../../styles/SharedStyles";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { deleteUser, getUsers } from "../../api";
import { errorHandler, ErrorResponseData } from "../shared/ErrorHandler";
import EmptyStatePlaceholder from "../shared/EmptyState";
import { User } from "../../types";
import DeletionDialog from "../shared/DeletionDialog";
import CreateUserDialog from "./CreateUserDialog";
import EditUserDialog from "./EditUserDialog";

const UserManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<null | string>(null);
  const [users, setUsers] = useState<User[]>([]);

  const onDelete = async () => {
    if (selectedUserId) {
      setLoading(true);
      try {
        await deleteUser(selectedUserId);

        setUsers((prevState) =>
          prevState.filter((user) => user.id !== selectedUserId),
        );
        setShowDeleteDialog(false);
      } catch (error) {
        errorHandler(error as ErrorResponseData, "נכשל במחיקה");
      } finally {
        setLoading(false);
        setSelectedUserId(null);
      }
    }
  };

  const handleDeleteUser = (id: string) => {
    setShowDeleteDialog(true);
    setSelectedUserId(id);
  };

  const handleEditUser = (id: string) => {
    setShowEditModal(true);
    setSelectedUserId(id);
  };

  const onModalClose = () => {
    setShowEditModal(false);
    setShowCreateModal(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res?.users ?? []);
    } catch (error) {
      errorHandler(error as ErrorResponseData, "נכשל בטעינת המשתמשים");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const renderTableView = () => {
    if (users.length === 0) {
      return <EmptyStatePlaceholder msg="אין משתמשים זמינים" />;
    }

    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, color: "#4b6b8e" }}>
            משתמשים ({users.length})
          </h2>
        </div>

        <Table>
          <thead>
            <tr>
              <th style={{ textAlign: "right" }}>שם משתמש</th>
              <th style={{ textAlign: "right" }} />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <TableBody style={{ textAlign: "right" }}>{user.username}</TableBody>
                <TableBody style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <button
                    onClick={() => handleEditUser(user.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#1f5fbf",
                      fontSize: "16px",
                      padding: "4px 8px",
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#c0392b",
                      fontSize: "16px",
                      padding: "4px 8px",
                      marginLeft: 8,
                    }}
                  >
                    <FaTrash />
                  </button>
                </TableBody>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  };

  return (
    <PageContainer>
      <TopPanel>
        <TopPanelLogo />
        <TopPanelTitleHolder>
          <TopPanelTitle>ניהול משתמשים</TopPanelTitle>
        </TopPanelTitleHolder>
        <TopPanelGroup>
          <IconButton onClick={() => setShowCreateModal(true)}>
            <FaPlus />
          </IconButton>
        </TopPanelGroup>
      </TopPanel>
      <PageContent style={{ flexDirection: "column" }}>
        {renderTableView()}
      </PageContent>
      {showCreateModal && (
        <CreateUserDialog onClose={onModalClose} onUserCreated={fetchUsers} />
      )}
      {showEditModal && (
        <EditUserDialog onClose={onModalClose} id={selectedUserId} />
      )}
      {showDeleteDialog && (
        <DeletionDialog
          isDeleting={loading}
          isOpen={showDeleteDialog}
          onConfirm={onDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </PageContainer>
  );
};

export default UserManagement;
