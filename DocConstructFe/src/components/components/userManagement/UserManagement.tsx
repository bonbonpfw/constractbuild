import React, { useState, useEffect } from 'react';
import {
  Button,
  Select,
  ErrorMessage,
  PageContainer,
  PageContent,
  PageTitle,
  ProgressOverlay,
  ProgressContainer,
  ProgressText,
} from '../../styles/SharedStyles';
import styled from 'styled-components';

// Create styled components for the table
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: right;
  border-bottom: 2px solid ${props => props.theme.colors.lightGrey};
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: ${props => props.theme.colors.secondary};
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.lightGrey};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid ${props => props.theme.colors.lightGrey};
  border-radius: ${props => props.theme.borderRadius.small};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

interface User {
  id: string;
  email: string;
  roles: string[];
}

interface NewUser {
  email: string;
  password: string;
  roles: string[];
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({ email: '', password: '', roles: [] });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement API call to fetch users
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    setError(null);
    try {
      // TODO: Implement API call to create user
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError('Failed to create user');
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setError(null);
    try {
      // TODO: Implement API call to delete user
      await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <ProgressOverlay>
        <ProgressContainer>
          <ProgressText>Loading users...</ProgressText>
        </ProgressContainer>
      </ProgressOverlay>
    );
  }

  return (
    <PageContainer>
      <PageTitle>User Management</PageTitle>
      <PageContent>
        <Button onClick={() => setIsModalOpen(true)}>Add New User</Button>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Table>
          <thead>
            <TableRow>
              <TableHeader>Email</TableHeader>
              <TableHeader>Roles</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.roles.join(', ')}</TableCell>
                <TableCell>
                  <Button onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>

        {isModalOpen && (
          <ProgressOverlay onClick={() => setIsModalOpen(false)}>
            <ProgressContainer onClick={e => e.stopPropagation()}>
              <Form onSubmit={e => { e.preventDefault(); handleCreateUser(); }}>
                <h2>Add New User</h2>
                <Input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewUser({ ...newUser, email: e.target.value })}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewUser({ ...newUser, password: e.target.value })}
                />
                <Select
                  multiple
                  value={newUser.roles}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                    setNewUser({ ...newUser, roles: Array.from(e.target.selectedOptions, option => option.value) })}
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </Select>
                <Button type="submit">Create User</Button>
              </Form>
            </ProgressContainer>
          </ProgressOverlay>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default UserManagement; 