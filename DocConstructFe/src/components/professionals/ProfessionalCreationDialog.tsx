import React, { useState, useEffect } from 'react';
import { FaTimes, FaUpload, FaSpinner, FaBrain, FaCog } from 'react-icons/fa';
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
  const [importStep, setImportStep] = useState<string>('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Create a fake event object to reuse the existing handleFileChange function
      const fakeEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(fakeEvent);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportStep('מאתחל תצוגה מקדימה של הקובץ...');
    
    try {
      // First, initialize the file preview
      setImportedFile(file);
      setFileUrl(URL.createObjectURL(file));
      
      // Wait for preview to be ready
      await new Promise(resolve => setTimeout(resolve, 500));
      setImportStep('תצוגה מקדימה מוכנה - מתחיל ניתוח בינה מלאכותית...');
      
      // Now start AI processing steps
      await new Promise(resolve => setTimeout(resolve, 600));
      setImportStep('מנתח מבנה המסמך...');
      
      await new Promise(resolve => setTimeout(resolve, 800));
      setImportStep('מחלץ נתוני איש מקצוע...');

      const importedData = await importProfessionalData(file);
      
      await new Promise(resolve => setTimeout(resolve, 600));
      setImportStep('מעבד ומאמת מידע...');
      
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
      
      await new Promise(resolve => setTimeout(resolve, 400));
      setImportStep('מסיים ייבוא נתונים...');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setImportStep('ייבוא הושלם בהצלחה!');
      
      // Clear the step message after a brief success display
      setTimeout(() => {
        setImportStep('');
      }, 1500);
      
    } catch (error) {
      setImportStep('ייבוא נכשל - אנא נסה שוב');
      errorHandler(error as ErrorResponseData, 'Failed to import professional data');
      setTimeout(() => {
        setImportStep('');
      }, 2000);
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
    <>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
          }
          .fa-spin {
            animation: fa-spin 1s infinite linear;
          }
          @keyframes fa-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <DialogOverlay onClick={onClose}>
      <DialogContainer 
        style={{ 
          width: 1200,
          maxWidth: '99vw'
        }} 
        onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>הוספת איש מקצוע</DialogTitle>
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
                  <div 
                    style={{
                      border: `2px dashed ${isDragOver ? '#34C759' : '#007AFF'}`,
                      borderRadius: 12,
                      padding: 24,
                      textAlign: 'center',
                      background: importing ? '#F2F2F7' : (isDragOver ? '#F0F9FF' : '#FAFAFA'),
                      transition: 'all 0.2s ease',
                      cursor: importing ? 'default' : 'pointer',
                      transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: isDragOver ? '0 8px 25px rgba(0, 122, 255, 0.15)' : 'none'
                    }}
                    onClick={importing ? undefined : handleImport}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {importing ? (
                      <div>
                        <div style={{
                          width: 40,
                          height: 40,
                          margin: '0 auto 16px',
                          background: '#007AFF',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FaSpinner className="fa-spin" style={{ color: 'white', fontSize: 16 }} />
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 500, color: '#1D1D1F', marginBottom: 8 }}>
                          בינה מלאכותית מנתחת את המסמך
                        </div>
                        <div style={{ fontSize: 14, color: '#86868B' }}>
                          {importStep}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{
                          width: 40,
                          height: 40,
                          margin: '0 auto 16px',
                          background: isDragOver ? '#34C759' : '#007AFF',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease'
                        }}>
                          <FaUpload style={{ color: 'white', fontSize: 16 }} />
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 500, color: '#1D1D1F', marginBottom: 8 }}>
                          {isDragOver ? 'שחרר כאן!' : 'העלאת מסמך'}
                        </div>
                        <div style={{ fontSize: 14, color: '#86868B' }}>
                          {isDragOver ? 'הקובץ יועלה אוטומטית' : 'גרור ושחרר או לחץ לבחירה'}
                        </div>
                      </div>
                    )}
                  </div>
                </FullWidthField>
                <FullWidthField>
                  <Label htmlFor="name">שם מלא</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </FullWidthField>
                <FullWidthField>
                  <Label htmlFor="address">כתובת</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </FullWidthField>
                <Field>
                  <Label htmlFor="phone">טלפון</Label>
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
                  <Label htmlFor="email">אימייל</Label>
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
                  <Label htmlFor="professional_type">תפקיד</Label>
                  <Select
                    id="professional_type"
                    name="professional_type"
                    value={formData.professional_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>בחר תפקיד</option>
                    {professionalTypes.map(t => (<option key={t} value={t}>{t}</option>))}
                  </Select>
                </Field>
                <Field>
                  <Label htmlFor="national_id">תעודת זהות</Label>
                  <Input
                    id="national_id"
                    name="national_id"
                    value={formData.national_id}
                    onChange={handleChange}
                    required
                  />
                </Field>
                <Field>
                  <Label htmlFor="license_number">מספר רישיון</Label>
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
                    תאריך פג תוקף רישיון
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
                  background: '#FFFFFF',
                  border: '1px solid #E5E5E7',
                  borderRadius: 16,
                  minHeight: 500,
                  maxHeight: 820,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  margin: '0 0 0 0',
                  padding: 24,
                  flexDirection: 'column',
                }}
              >
                {/* Enhanced image preview with zoom and pan */}
                {isImage ? (
                  <>
                    <div style={{ 
                      marginBottom: 16, 
                      display: 'flex', 
                      gap: 8, 
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#F8F9FA',
                      padding: '8px 16px',
                      borderRadius: 20,
                      border: '1px solid #E9ECEF'
                    }}>
                      <Button 
                        variant="text" 
                        disabled={zoom === 1} 
                        onClick={handleZoomOut}
                        style={{
                          minWidth: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: zoom === 1 ? '#F8F9FA' : '#007AFF',
                          color: zoom === 1 ? '#ADB5BD' : 'white',
                          border: 'none',
                          fontSize: 16,
                          fontWeight: 600
                        }}
                      >
                        −
                      </Button>
                      <span style={{ 
                        minWidth: 50, 
                        textAlign: 'center', 
                        fontWeight: 500,
                        fontSize: 14,
                        color: '#495057'
                      }}>
                        {Math.round(zoom * 100)}%
                      </span>
                      <Button 
                        variant="text" 
                        onClick={handleZoomIn} 
                        disabled={zoom >= maxZoom}
                        style={{
                          minWidth: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: zoom >= maxZoom ? '#F8F9FA' : '#007AFF',
                          color: zoom >= maxZoom ? '#ADB5BD' : 'white',
                          border: 'none',
                          fontSize: 16,
                          fontWeight: 600
                        }}
                      >
                        +
                      </Button>
                    </div>
                    <div
                      ref={imgContainerRef}
                      style={{
                        width: '100%',
                        height: 400,
                        maxWidth: 580,
                        maxHeight: 400,
                        overflow: zoom > 1 ? 'scroll' : 'hidden',
                        background: '#FFFFFF',
                        borderRadius: 12,
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                        cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default',
                        position: 'relative',
                        userSelect: 'none',
                        touchAction: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #F1F3F4'
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
                        alt="תצוגה מקדימה של איש המקצוע"
                        draggable={false}
                        style={{
                          transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)` ,
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          borderRadius: 8,
                          background: '#FFFFFF',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                          transition: dragging ? 'none' : 'transform 0.2s ease',
                          cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default',
                          userSelect: 'none',
                        }}
                      />
                    </div>
                  </>
                ) : isPdf ? (
                  <div style={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'center',
                    background: '#FFFFFF',
                    borderRadius: 12,
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #F1F3F4',
                    overflow: 'hidden'
                  }}>
                    <iframe
                      src={imgUrl || undefined}
                      title="תצוגה מקדימה של PDF"
                      style={{ 
                        width: 594, 
                        height: 400, 
                        border: 'none', 
                        background: '#FFFFFF', 
                        borderRadius: 8
                      }}
                    />
                  </div>
                ) : importedFile ? (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#86868B', 
                    fontSize: 16, 
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    background: '#F8F9FA',
                    borderRadius: 12,
                    border: '1px solid #E9ECEF'
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.7 }}>📄</div>
                    <div style={{ fontWeight: 500, marginBottom: 8, color: '#495057' }}>{importedFile.name}</div>
                    <div style={{ fontSize: 14, color: '#6C757D' }}>תצוגה מקדימה לא זמינה</div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
          <DialogActions>
            <Button variant='text' onClick={onClose}>ביטול</Button>
            <Button variant='contained' type="submit" disabled={loading}>
              {loading ? 'שומר...' : 'שמור'}
            </Button>
          </DialogActions>
        </Form>
      </DialogContainer>
    </DialogOverlay>
    </>
  );
};

export default ProfessionalCreationDialog;
