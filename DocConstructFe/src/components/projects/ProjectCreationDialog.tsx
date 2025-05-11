import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import {ProjectCreationFormData, ProjectStatus} from '../../types';
import {
  Button,
  DialogActions,
  DialogCloseButton,
  DialogContainer,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  FormGrid,
  Form,
  FullWidthField,
  Input,
  Label,
  Select, TextArea,
} from "../../styles/SharedStyles";
import {errorHandler, ErrorResponseData} from "../shared/ErrorHandler";
import {createProject} from "../../api";

export const DefaultProjectCreationFormData: ProjectCreationFormData = {
  status: ProjectStatus.PRE_PERMIT,
  professionals: []
};

const ProjectCreationDialog: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectCreationFormData>(DefaultProjectCreationFormData);

  const handleSubmit= async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createProject(formData)
      onSuccess();
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'Failed to create project');
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <DialogOverlay onClick={onClose}>
      <DialogContainer onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>צור פרויקט חדש</DialogTitle>
          <DialogCloseButton onClick={onClose}>
            <FaTimes />
          </DialogCloseButton>
        </DialogHeader>
        <Form onSubmit={handleSubmit}>
          <FormGrid>
            <FullWidthField>
              <Label>שם הפרויקט *</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </FullWidthField>
            <FullWidthField>
              <Label>בעל ההיתר *</Label>
              <Input
                type="text"
                value={formData.permit_owner}
                onChange={e => setFormData({ ...formData, permit_owner: e.target.value })}
                required
              />
            </FullWidthField>
            <FullWidthField>
              <Label>מספר בקשה *</Label>
              <Input
                type="text"
                value={formData.request_number}
                onChange={e => setFormData({ ...formData, request_number: e.target.value })}
                required
              />
            </FullWidthField>
            <FullWidthField>
              <Label>תיאור הפרויקט</Label>
              <TextArea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </FullWidthField>
            
            <FullWidthField>
              <Label>סטטוס הפרויקט</Label>
              <Select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
              >
                <option value={ProjectStatus.PRE_PERMIT}>טרום היתר</option>
                <option value={ProjectStatus.POST_PERMIT}>לאחר היתר</option>
                <option value={ProjectStatus.FINAL}>סופי</option>
              </Select>
            </FullWidthField>
            <FullWidthField>
              <Label>תאריך סיום הסטטוס</Label>
              <Input
                type="date"
                value={formData.status_due_date}
                onChange={e => setFormData({ ...formData, status_due_date: e.target.value })}
              />
            </FullWidthField>
          </FormGrid>
          <DialogActions>
            <Button variant='text' onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              אישור
            </Button>
          </DialogActions>
        </Form>
      </DialogContainer>
    </DialogOverlay>
  );
};

export default ProjectCreationDialog;
