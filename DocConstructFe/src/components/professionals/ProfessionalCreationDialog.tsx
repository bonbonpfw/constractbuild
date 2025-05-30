import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Professional } from '../../types';
import { createProfessional, importProfessionalData } from '../../api';
import {
  Button, DialogActions,
  DialogCloseButton,
  DialogContainer,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  Field,
  FormGrid,
  Form,
  FullWidthField,
  Input,
  Label,
  Select
} from "../../styles/SharedStyles";
import {errorHandler, ErrorResponseData} from "../shared/ErrorHandler";

export type ProfessionalCreationFormData = Omit<Professional, 'id' | 'status' | 'created_at' | 'updated_at'>;

export const defaultProfessionalCreationFormData: ProfessionalCreationFormData = {
  name: '',
  address: '',
  phone: '',
  email: '',
    professional_type: '',
  national_id: '',
  license_number: '',
  license_expiration_date: '',
}

interface AddProfessionalDialogProps {
  professionalTypes: string[];
  onClose: () => void;
}

const ProfessionalCreationDialog: React.FC<AddProfessionalDialogProps> = ({
  professionalTypes,
  onClose,
}) => {
  const [formData, setFormData] = useState<ProfessionalCreationFormData>({
    ...defaultProfessionalCreationFormData,
  });
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Update professional_type default when professionalTypes changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [professionalTypes]);

  const handleImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const importedData = await importProfessionalData(file);
      // Convert ISO date string to YYYY-MM-DD format for input
      const formattedData = {
        ...importedData,
        license_expiration_date: importedData.license_expiration_date ? 
          new Date(importedData.license_expiration_date).toISOString().split('T')[0] : ''
      };
      setFormData(formattedData);
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'Failed to import professional data');
    } finally {
      setImporting(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    } as ProfessionalCreationFormData));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createProfessional(formData);
      onClose();
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'Failed to create professional');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogOverlay onClick={onClose}>
      <DialogContainer onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Add Professional</DialogTitle>
          <DialogCloseButton onClick={onClose}>
            <FaTimes />
          </DialogCloseButton>
        </DialogHeader>
        <Form onSubmit={handleSubmit}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <FormGrid>
            <FullWidthField>
              <Button
                variant="outlined"
                onClick={handleImport}
                disabled={importing}
              >
                {importing ? 'Importing…' : 'Import from File'}
              </Button>
            </FullWidthField>
            <FullWidthField>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </FullWidthField>
            <FullWidthField>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </FullWidthField>
            <Field>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+972 (50) 123-4567"
                inputMode="tel"
                required
              />
            </Field>
            <Field>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Field>
            <Field>
              <Label htmlFor="professional_type">Type</Label>
              <Select
                id="professional_type"
                name="professional_type"
                value={formData.professional_type}
                onChange={handleChange}
                required
              >
                <option value="" disabled style={{ color: '#999', fontStyle: 'italic', fontWeight: 'normal' }}>בחר סוג רשיון</option>
                {professionalTypes.map(t => (<option key={t} value={t}>{t}</option>))}
              </Select>
            </Field>
            <Field>
              <Label htmlFor="national_id">National ID</Label>
              <Input
                id="national_id"
                name="national_id"
                value={formData.national_id}
                onChange={handleChange}
                required
              />
            </Field>
            <Field>
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                required
              />
            </Field>
            <Field>
              <Label htmlFor="license_expiration_date">
                License Expiration Date
              </Label>
              <Input
                id="license_expiration_date"
                name="license_expiration_date"
                type="date"
                value={formData.license_expiration_date || ''}
                onChange={handleChange}
                required
              />
            </Field>
          </FormGrid>
          <DialogActions>
            <Button variant='text' onClick={onClose}>Cancel</Button>
            <Button variant='contained' type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Form>
      </DialogContainer>
    </DialogOverlay>
  );
};

export default ProfessionalCreationDialog;
