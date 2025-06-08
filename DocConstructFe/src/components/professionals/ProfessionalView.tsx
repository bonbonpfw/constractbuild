import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { FaEdit, FaCheck, FaTimes, FaArrowLeft, FaTrash } from 'react-icons/fa';
import {
  getProfessionalById, getProfessionalStatuses,
  getProfessionalTypes,
  updateProfessional,
  uploadProfessionalDocument,
  downloadProfessionalDocument,
  deleteProfessionalDocument,
  getProfessionalDocumentTypes,
} from '../../api';
import {
  DocumentState,
  Professional,
  ProfessionalDocument
} from '../../types';
import {
  PageContainer,
  TopPanel,
  TopPanelGroup,
  TopPanelLogo,
  TopPanelTitle,
  TopPanelTitleHolder,
  PageContent,
  IconButton,
  Label,
  Input,
  Select,
  Field,
  FullWidthField,
  FormGrid,
  Button,
} from '../../styles/SharedStyles';
import {errorHandler, ErrorResponseData} from "../shared/ErrorHandler";
import EmptyStatePlaceholder from "../shared/EmptyState";
import useDeleteProfessional from "./useDeleteProfessional";
import DeletionDialog from "../shared/DeletionDialog";
import {toast} from "react-toastify";
import FileArea, {FileAreaDocument, FilePreview} from "../shared/FileArea";

// Use the direct API URL from environment variables if available
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api';

// --- Linter Workaround --- 
const FaArrowLeftAny = FaArrowLeft as any;
const FaEditAny = FaEdit as any;
const FaTrashAny = FaTrash as any;
const FaCheckAny = FaCheck as any;
const FaTimesAny = FaTimes as any;
// --- End Workaround --- 

const ProfessionalView: React.FC = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };

  const [formData, setFormData] = useState<Professional | null>(null);
  const originalData = useRef<Professional | null>(null);
  const [types, setTypes] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [documents, setDocuments] = useState<ProfessionalDocument[]>([]);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);

  const {isDeleteDialogOpen, handleDelete, handleConfirmDelete, handleCancelDelete} = useDeleteProfessional(id);

  // Add licenses to the filesData conversion logic
  const filesData: FileAreaDocument[] = [];

  // Group documents by type
  const documentsByType: Record<string, ProfessionalDocument[]> = {};
  documents.forEach(doc => {
    if (!documentsByType[doc.document_type]) {
      documentsByType[doc.document_type] = [];
    }
    documentsByType[doc.document_type].push(doc);
  });

  // Add documents to filesData
  Object.entries(documentsByType).forEach(([type, docs]) => {
    // Only add the most recent document of each type
    const doc = docs[0]; // Assuming the first document is the most recent
    filesData.push({
      fileId: doc.id,
      fileName: doc.name,
      state: DocumentState.UPLOADED,
      fileType: type
    });
  });

  // Add missing document types
  const existingTypes = Object.keys(documentsByType);


  documentTypes?.forEach(type => {
    if (!existingTypes.includes(type)) {
      filesData.push({
        fileId: '',
        fileName: null,
        state: DocumentState.MISSING,
        fileType: type
      });
    }
  });


  const handleFileUpload = async (fileType: string, file: File) => {
    if (!id || !file) return;

    try {
      const fileName = file.name;
      await uploadProfessionalDocument(id, fileType, fileName, file);
      await loadProfessional();
      toast.success(`${fileType} uploaded successfully`);
    } catch (error) {
      errorHandler(error as ErrorResponseData, `Failed to upload ${fileType}`);
    }
  };

  const handleFileDownload = async (fileId: string, fileName: string) => {
    try {
      const blob = await downloadProfessionalDocument(id, fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'Failed to download file');
    }
  };

  const handleFileDelete = async (fileId: string) => {
    if (!id || !fileId) return;

    try {
      await deleteProfessionalDocument(id, fileId);
      await loadProfessional();
      toast.success('File deleted successfully');
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'Failed to delete file');
    }
  };

  const handleFilePreview = async (fileId: string, fileName: string) => {
    try {
      // Get the file from backend
      const blob = await downloadProfessionalDocument(id, fileId);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Set the preview state
      setPreviewFileUrl(url);
      setPreviewFileName(fileName);
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'Failed to preview file');
    }
  };

  const closePreview = () => {
    if (previewFileUrl) {
      window.URL.revokeObjectURL(previewFileUrl);
    }
    setPreviewFileUrl(null);
    setPreviewFileName(null);
  };

  useEffect(() => {
    if (!id) return;
    loadProfessional();
  }, [id]);

  const loadProfessional = async () => {
    try {
      const [prof, types, statuses, docTypes] = await Promise.all([
        getProfessionalById(id),
        getProfessionalTypes(),
        getProfessionalStatuses(),
        getProfessionalDocumentTypes()
      ]);
      if (prof.status) {
        // Convert uppercase API status to title case
        prof.status = prof.status.charAt(0) + prof.status.slice(1).toLowerCase();
      }
      setFormData(prof);
      originalData.current = prof;
      setTypes(types);
      setStatuses(statuses);
      setDocumentTypes(docTypes);
      setDocuments(prof.documents || []);
    } catch (error) {
      const errorData = error as ErrorResponseData;
      if (errorData?.response?.data?.error_code === 'professional_does_not_exist') {
        router.push('/professionals');
      } else {
         errorHandler(error as ErrorResponseData, 'Failed to load professional');
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev =>
      prev ? ({ ...prev, [name]: value } as Professional) : prev
    );
  };

  const startEditing = () => setIsEditing(true);
  const cancelEditing = () => {
    setFormData(originalData.current);
    setIsEditing(false);
  };

  const saveChanges = async () => {
    if (!formData) return;
    setSaving(true);
    try {
      await updateProfessional(formData);
      setFormData(formData);
      originalData.current = formData;
      setIsEditing(false);
      toast.success('Changes saved')
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'Failed to save changes');
    } finally {
      await loadProfessional();
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <TopPanel>
        <TopPanelLogo/>
        <TopPanelTitleHolder>
          <TopPanelTitle>
            {formData?.name || 'Professional Details'}
          </TopPanelTitle>
        </TopPanelTitleHolder>
        <TopPanelGroup>
          <IconButton onClick={() => router.back()} title="Back">
            <FaArrowLeftAny />
          </IconButton>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            title="Delete"
          >
            <FaTrashAny />
          </IconButton>
        </TopPanelGroup>
      </TopPanel>
      <PageContent>
        {!formData ? (
          <EmptyStatePlaceholder msg="Professional not found" />
        ) : (
          <div style={{ display: 'flex', width: '100%', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Form fields on the left */}
            <FormGrid style={{ flex: '1', minWidth: '420px', minHeight: 'fit-content', paddingBottom: '20px', marginBottom: '20px' }}>
              <Label style={{ gridColumn: 'span 2', fontSize: 25, textAlign: 'center', margin: '10px 0 20px 0', display: 'block' }}>General</Label>
              <Field>
                <Label>Name</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Field>
              <Field>
                <Label>Phone</Label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  pattern='\\d{9,15}'
                  onInvalid={e => {
                    const input = e.currentTarget;
                    // set your custom message…
                    input.setCustomValidity('Phone number must be 9–15 digits');
                    // and immediately show the tooltip
                    input.reportValidity();
                  }}
                  onInput={e => {
                    const input = e.currentTarget;
                    // clear the message so user can retry
                    input.setCustomValidity('');
                  }}
                />
              </Field>
              <Field>
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Field>
              <Field>
                <Label>National ID</Label>
                <Input
                  name="national_id"
                  value={formData.national_id}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Field>
              <FullWidthField>
                <Label>Address</Label>
                <Input
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </FullWidthField>
              <Field>
                <Label>License Number</Label>
                <Input
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Field>
              <Field>
                <Label>Type</Label>
                <Select
                  name="professional_type"
                  value={formData.professional_type}
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  {types.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </Field>
              <Field>
                <Label>Status</Label>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  {statuses.map(s => (<option key={s} value={s}>{s}</option>))}
                </Select>
              </Field>
              <Field>
                <Label>Expiry Date</Label>
                <Input
                  name="license_expiration_date"
                  type="date"
                  value={formData.license_expiration_date}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Field>
              <FullWidthField>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                {!isEditing ? (
                  <Button style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 16, fontSize: 13, padding: '6px 12px', backgroundColor: '#4b87c3', color: '#fff' }} onClick={startEditing}>
                    <FaEditAny style={{ marginInlineEnd: 4 }} /> Edit
                  </Button>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 16, fontSize: 13, padding: '6px 12px', backgroundColor: '#4b87c3', color: '#fff' }} onClick={saveChanges} disabled={saving}>
                      <FaCheckAny style={{ marginInlineEnd: 4 }} /> Save
                    </Button>
                    <Button style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 16, fontSize: 13, padding: '6px 12px', backgroundColor: '#4b87c3', color: '#fff' }} onClick={cancelEditing} disabled={saving}>
                      <FaTimesAny style={{ marginInlineEnd: 4 }} /> Cancel
                    </Button>
                  </div>
                )}
              </div>
              </FullWidthField>
            </FormGrid>

            {/* Documents area on the right */}
            <div style={{ flex: '0 0 500px', minWidth: '300px', marginBottom: '20px' }}>
              <Label style={{ fontSize: 25, textAlign: 'center', margin: '10px 0 40px 0', display: 'block' }}>Documents</Label>
              <FileArea
                files={filesData}
                disabled={false}
                onUpload={handleFileUpload}
                onDelete={handleFileDelete}
                onPreview={handleFilePreview}
              />
            </div>
          </div>
        )}
        
        {/* File Preview Modal */}
        {previewFileUrl && previewFileName && (
          <FilePreview
            fileUrl={previewFileUrl}
            fileName={previewFileName}
            onClose={closePreview}
          />
        )}
      </PageContent>
      <DeletionDialog
        isOpen={isDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        message={`Are you sure you want to delete professional ${formData?.name}?`}
      />
    </PageContainer>
  );
};

export default ProfessionalView;
