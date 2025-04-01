import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { ProjectStatus } from '../../types';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 32px;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  left: 16px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #333;
  }
`;

const ModalTitle = styled.h2`
  margin-bottom: 24px;
  color: #0A2540;
  font-size: 24px;
  text-align: right;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #4a4a4a;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  background-color: white;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const TextArea = styled.textarea`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.variant === 'primary' ? `
    background-color: #2563eb;
    color: white;
    border: none;

    &:hover {
      background-color: #1d4ed8;
    }
  ` : `
    background-color: white;
    color: #666;
    border: 1px solid #e0e0e0;

    &:hover {
      background-color: #f5f5f5;
    }
  `}
`;

interface CreateProjectProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: any) => void;
}

const CreateProject: React.FC<CreateProjectProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    project_name: '',
    project_case_id: '',
    project_description: '',
    project_address: '',
    project_due_date: '',
    project_status: ProjectStatus.PRE_PERMIT,
    project_status_due_date: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
        <ModalTitle>צור פרויקט חדש</ModalTitle>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>שם הפרויקט *</Label>
            <Input
              type="text"
              value={formData.project_name}
              onChange={e => setFormData({ ...formData, project_name: e.target.value })}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>מספר תיק *</Label>
            <Input
              type="text"
              value={formData.project_case_id}
              onChange={e => setFormData({ ...formData, project_case_id: e.target.value })}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>כתובת הפרויקט *</Label>
            <Input
              type="text"
              value={formData.project_address}
              onChange={e => setFormData({ ...formData, project_address: e.target.value })}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>תיאור הפרויקט</Label>
            <TextArea
              value={formData.project_description}
              onChange={e => setFormData({ ...formData, project_description: e.target.value })}
            />
          </FormGroup>
          <FormGroup>
            <Label>תאריך יעד לפרויקט</Label>
            <Input
              type="date"
              value={formData.project_due_date}
              onChange={e => setFormData({ ...formData, project_due_date: e.target.value })}
            />
          </FormGroup>
          <FormGroup>
            <Label>סטטוס הפרויקט</Label>
            <Select
              value={formData.project_status}
              onChange={e => setFormData({ ...formData, project_status: e.target.value as ProjectStatus })}
            >
              <option value={ProjectStatus.PRE_PERMIT}>טרום היתר</option>
              <option value={ProjectStatus.POST_PERMIT}>לאחר היתר</option>
              <option value={ProjectStatus.FINAL}>סופי</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>תאריך יעד לסטטוס</Label>
            <Input
              type="date"
              value={formData.project_status_due_date}
              onChange={e => setFormData({ ...formData, project_status_due_date: e.target.value })}
            />
          </FormGroup>
          <ButtonGroup>
            <Button type="button" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" variant="primary">
              צור פרויקט
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CreateProject; 