import React, { useState, useEffect } from 'react';
import { FaTimes, FaUpload } from 'react-icons/fa';
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
    professional_type: professionalTypes[0] || '',
  });
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // --- Image preview logic moved to top level ---
  const imgUrl = imagePreviewUrl || (importedFile && fileUrl) || '';
  const fileType = importedFile?.type || '';
  const isImage = fileType.startsWith('image/') || (typeof imgUrl === 'string' && (imgUrl.endsWith('.jpg') || imgUrl.endsWith('.jpeg') || imgUrl.endsWith('.png') || imgUrl.endsWith('.webp') || imgUrl.endsWith('.gif') || imgUrl.endsWith('.bmp')));
  const isPdf = fileType === 'application/pdf' || (typeof imgUrl === 'string' && imgUrl.endsWith('.pdf'));
  // React state for zoom/pan
  const [zoom, setZoom] = React.useState(1);
  const [dragging, setDragging] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [startDrag, setStartDrag] = React.useState<{ x: number; y: number } | null>(null);
  const imgContainerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setDragging(false);
    setStartDrag(null);
  }, [imgUrl]);
  // Mouse/touch event handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom === 1) return;
    setDragging(true);
    setStartDrag({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !startDrag) return;
    setPosition({ x: e.clientX - startDrag.x, y: e.clientY - startDrag.y });
  };
  const handleMouseUp = () => {
    setDragging(false);
    setStartDrag(null);
  };
  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom === 1) return;
    const touch = e.touches[0];
    setDragging(true);
    setStartDrag({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging || !startDrag) return;
    const touch = e.touches[0];
    setPosition({ x: touch.clientX - startDrag.x, y: touch.clientY - startDrag.y });
  };
  const handleTouchEnd = () => {
    setDragging(false);
    setStartDrag(null);
  };
  // Clamp zoom
  const minZoom = 1;
  const maxZoom = 5;
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, maxZoom));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, minZoom));
  //const handleReset = () => { setZoom(1); setPosition({ x: 0, y: 0 }); };

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
      setImportedFile(file);
      setFileUrl(URL.createObjectURL(file));

      const importedData = await importProfessionalData(file);
      // Convert ISO date string to YYYY-MM-DD format for input
      const formattedData = {
        ...importedData,
        license_expiration_date: importedData.license_expiration_date ? 
          new Date(importedData.license_expiration_date).toISOString().split('T')[0] : ''
      };
      setFormData(formattedData);
      // Handle image preview if present in imported data
      const img = (importedData as any)?.['photo'] || (importedData as any)?.['image'];
      if (img) {
        setImagePreviewUrl(img);
      } else {
        setImagePreviewUrl(null);
      }
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

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

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
      <DialogContainer 
        style={{ 
          width: 1200,
          maxWidth: '99vw'
        }} 
        onClick={e => e.stopPropagation()}>
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
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 40 }}>
            {/* Form fields on the left */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <FormGrid>
                <FullWidthField>
                  <Button
                    variant="text"
                    onClick={handleImport}
                    disabled={importing}
                  >
                    {importing ? 'Importing...' : 'Import from File'}
                    <FaUpload style={{ marginRight: 8 }} />
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
            </div>
            {/* File/Image Preview on the right (only if present) */}
            {(imagePreviewUrl || (importedFile && fileUrl)) && (
              <div
                style={{
                  flex: '0 0 630px',
                  minWidth: 630,
                  maxWidth: 630,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f7fafd',
                  border: '1.5px solid #e3e8f0',
                  borderRadius: 12,
                  minHeight: 500,
                  maxHeight: 820,
                  boxShadow: '0 2px 16px #0001',
                  margin: '0 0 0 0',
                  padding: 24,
                  flexDirection: 'column',
                }}
              >
                {/* Enhanced image preview with zoom and pan */}
                {isImage ? (
                  <>
                    <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                      <Button variant="contained" disabled={zoom === 1} onClick={handleZoomOut}>-</Button>
                      <span style={{ marginTop: 7, minWidth: 40, textAlign: 'center', fontWeight: 500 }}>{Math.round(zoom * 100)}%</span>
                      <Button variant="contained" onClick={handleZoomIn} disabled={zoom >= maxZoom}>+</Button>
                      {/*<Button variant="text" onClick={handleReset} disabled={zoom === 1 && position.x === 0 && position.y === 0}>Reset</Button>*/}
                    </div>
                    <div
                      ref={imgContainerRef}
                      style={{
                        width: '100%',
                        height: 400,
                        maxWidth: 580,
                        maxHeight: 400,
                        overflow: zoom > 1 ? 'scroll' : 'hidden',
                        background: '#fff',
                        borderRadius: 8,
                        boxShadow: '0 2px 8px #0001',
                        cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default',
                        position: 'relative',
                        userSelect: 'none',
                        touchAction: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <img
                        src={imgUrl || undefined}
                        alt="Professional Preview"
                        draggable={false}
                        style={{
                          transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)` ,
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          borderRadius: 8,
                          background: '#fff',
                          boxShadow: '0 2px 8px #0001',
                          transition: dragging ? 'none' : 'transform 0.2s',
                          cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default',
                          userSelect: 'none',
                        }}
                      />
                    </div>
                  </>
                ) : isPdf ? (
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <iframe
                      src={imgUrl || undefined}
                      title="PDF Preview"
                      style={{ width: 594, height: 400, border: 'none', background: '#fff', borderRadius: 4, boxShadow: '0 2px 8px #0001' }}
                    />
                  </div>
                ) : importedFile ? (
                  <div style={{ textAlign: 'center', color: '#888', fontSize: 16, width: '100%' }}>
                    <span role="img" aria-label="file" style={{ fontSize: 60 }}>📄</span>
                    <p style={{ margin: '16px 0 0 0', fontWeight: 600 }}>{importedFile.name}</p>
                    <p style={{ margin: 0 }}>Preview not available</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
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
