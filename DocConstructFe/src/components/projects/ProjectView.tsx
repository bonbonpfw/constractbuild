import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";
import Link from "next/link";
import {
  Button,
  Field,
  FormGrid,
  FullWidthField,
  IconButton,
  Input,
  Label,
  PageContainer,
  PageContent,
  Select,
  Table,
  TableBody,
  TableHeader,
  TextArea,
  TopPanel,
  TopPanelGroup,
  TopPanelLogo,
  TopPanelTitle,
  TopPanelTitleHolder
} from "../../styles/SharedStyles";
import {Professional, Project, ProjectDocument, DocumentState} from "../../types";
import {
  getProjectById,
  getProjectStatuses,
  updateProject,
  removeProfessionalFromProject,
  uploadProjectDocument,
  downloadProjectDocument,
  deleteProjectDocument,
  getProjectDocumentTypes
} from "../../api";
import {errorHandler, ErrorResponseData} from "../shared/ErrorHandler";
import * as FaIcons from "react-icons/fa";
import EmptyStatePlaceholder from "../shared/EmptyState";
import useDeleteProject from "./useDeleteProject";
import DeletionDialog from "../shared/DeletionDialog";
import {toast} from "react-toastify";
import FileArea, {FileAreaDocument, FilePreview} from "../shared/FileArea";
import styled from "styled-components";
import ProjectProfessionalDialog from "./ProjectProfessionalDialog";

// Modern status badge with Apple-style design
const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  background: ${({ status }) =>
    status === 'Active' ? '#e3f6ec' :
    status === 'Inactive' ? '#ffecef' :
    '#fff7e0'};
  color: ${({ status }) =>
    status === 'Active' ? '#1d8450' :
    status === 'Inactive' ? '#e1273d' :
    '#b0851f'};
`;

// Main content layout
const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  grid-template-rows: auto;
  grid-template-areas: "project documents";
  gap: 16px;
  width: 100%;
  overflow: visible;
`;

// Project details panel
const ProjectPanel = styled.div`
  grid-area: project;
  padding: 0 12px;
`;

// Documents panel
const DocumentsPanel = styled.div`
  grid-area: documents;
  width: 380px;
  padding: 0 12px;
  border-right: 1px solid #eaeaea;
  overflow-y: visible;
`;

// Tab container
const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 16px;
`;

// Tab button
const TabButton = styled.button<{ active: boolean }>`
  background: transparent;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: ${p => p.active ? '700' : '600'};
  color: ${p => p.active ? '#0071e3' : '#666'};
  border-bottom: 2px solid ${p => p.active ? '#0071e3' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #0071e3;
  }
`;

// Tab content
const TabContent = styled.div`
  padding: 0;
`;

// Section card component with Apple-style design
const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  padding: 16px;
  margin-bottom: 16px;
`;

// Section titles
const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
`;

// Container for action buttons in document area
const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

// Compact form grid
const CompactFormGrid = styled(FormGrid)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

// Compact field
const CompactField = styled(Field)`
  margin-bottom: 8px;
`;

// Compact label
const CompactLabel = styled(Label)`
  margin-bottom: 4px;
  font-size: 14px;
`;

// Compact table
const CompactTable = styled(Table)`
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  
  th {
    background-color: #f5f5f7;
    padding: 8px 12px;
    font-size: 13px;
    font-weight: 600;
    color: #333;
    text-align: right;
  }
  
  td {
    padding: 8px 12px;
    border-top: 1px solid #f0f0f0;
    font-size: 13px;
  }
  
  tr:hover td {
    background-color: #f9f9fb;
  }
`;

// Compact button
const CompactButton = styled(Button)`
  padding: 6px 12px;
  font-size: 13px;
  height: auto;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #0071e3;
  
  &:hover {
    background-color: #0262c2;
  }
`;

// Compact icon only button
const IconOnlyButton = styled(IconButton)`
  width: 30px;
  height: 30px;
  font-size: 14px;
`;

// Fix import for ProfessionalsGrid and ProfessionalCard components
const ProfessionalsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-start;
`;

// More compact professional card
const ProfessionalCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 10px 12px;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 230px;
  max-width: 280px;
  
  &:hover {
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  }
`;

const ProfessionalInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProfessionalName = styled.a`
  color: #0071e3;
  text-decoration: none;
  font-weight: 500;
  font-size: 13px;
`;

const ProfessionalType = styled.span`
  font-size: 12px;
  color: #666;
`;

const ProjectView: React.FC = () => {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  if (!id) {
    return (
      <PageContainer />
    );
  }

  const {isDeleteDialogOpen, handleDelete, handleConfirmDelete, handleCancelDelete} = useDeleteProject(id);

  const [formData, setFormData] = useState<Project | null>(null);
  const originalData = useRef<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statuses, setStatuses] = useState<string[]>([]);

  // Professionals state
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);
  const [showAddProfessionalDialog, setShowAddProfessionalDialog] = useState(false);
  const [professionalToRemove, setProfessionalToRemove] = useState<Professional | null>(null);

  // Documents state
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);

  // Add tab state
  const [activeTab, setActiveTab] = useState<'details' | 'professionals'>('details');

  const loadData = async () => {
    try {
      const [proj, statuses, docTypes] = await Promise.all([
        getProjectById(id),
        getProjectStatuses(),
        getProjectDocumentTypes()
      ]);
      setFormData(proj);
      originalData.current = proj;
      setStatuses(statuses);
      setDocumentTypes([...docTypes]); 

      // Extract professionals data directly from the project
      setIsLoadingProfessionals(true);
      try {
        if (proj.professionals && Array.isArray(proj.professionals)) {
          // Map the professionals data to the Professional type
          const projectProfessionals = proj.professionals.map(prof => ({
            id: prof.id,
            name: prof.name,
            email: prof.email,
            professional_type: prof.professional_type,
            status: prof.status,
            // Add default values for required fields that might not be in the API response
            national_id: '',
            phone: '',
            license_number: '',
            license_expiration_date: '',
            address: ''
          }));
          setProfessionals(projectProfessionals);
        } else {
          setProfessionals([]);
        }
      } catch (error) {
        errorHandler(error as ErrorResponseData, 'Failed to load professionals');
        setProfessionals([]);
      } finally {
        setIsLoadingProfessionals(false);
      }

      // Load project documents
      setIsLoadingDocuments(true);
      try {
        if (proj.documents && Array.isArray(proj.documents)) {
          setDocuments(proj.documents);
        } else {
          setDocuments([]);
        }
      } catch (error) {
        errorHandler(error as ErrorResponseData, 'Failed to load documents');
        setDocuments([]);
      } finally {
        setIsLoadingDocuments(false);
      }
    } catch (error) {
      const errorData = error as ErrorResponseData;
      // Add proper checks to avoid "Cannot read properties of undefined"
      if (errorData && 
          errorData.response && 
          errorData.response.data && 
          errorData.response.data.error_code === 'project_does_not_exist') {
        router.push('/projects');
      } else {
         errorHandler(error as ErrorResponseData, 'Failed to load project');
      }
    }
  };


  const handleAddProfessional = () => {
    setShowAddProfessionalDialog(true);
  };

  const handleProfessionalAdded = async () => {
    setShowAddProfessionalDialog(false);

    // Reload the project data to get the updated professionals list
    if (id) {
      try {
        const updatedProject = await getProjectById(id);
        setFormData(updatedProject);
        originalData.current = updatedProject;

        // Update professionals list from the updated project data
        if (updatedProject.professionals && Array.isArray(updatedProject.professionals)) {
          const projectProfessionals = updatedProject.professionals.map(prof => ({
            id: prof.id,
            name: prof.name,
            email: prof.email,
            professional_type: prof.professional_type,
            status: prof.status,
            // Add default values for required fields that might not be in the API response
            national_id: '',
            phone: '',
            license_number: '',
            license_expiration_date: '',
            address: ''
          }));
          setProfessionals(projectProfessionals);
        }
      } catch (error) {
        errorHandler(error as ErrorResponseData, 'Failed to reload project data');
      }
    }
  };

  const handleRemoveProfessional = (professional: Professional) => {
    setProfessionalToRemove(professional);
  };

  const confirmRemoveProfessional = async () => {
    if (!professionalToRemove || !id) return;

    try {
      await removeProfessionalFromProject({
        project_id: id,
        professional_id: professionalToRemove.id.toString() // Convert to string if the API expects a string
      });

      // Reload the project data to get the updated professionals list
      try {
        const updatedProject = await getProjectById(id);
        setFormData(updatedProject);
        originalData.current = updatedProject;

        // Update professionals list from the updated project data
        if (updatedProject.professionals && Array.isArray(updatedProject.professionals)) {
          const projectProfessionals = updatedProject.professionals.map(prof => ({
            id: prof.id,
            name: prof.name,
            email: prof.email,
            professional_type: prof.professional_type,
            status: prof.status,
            // Add default values for required fields that might not be in the API response
            national_id: '',
            phone: '',
            license_number: '',
            license_expiration_date: '',
            address: ''
          }));
          setProfessionals(projectProfessionals);
        } else {
          setProfessionals([]);
        }
      } catch (error) {
        errorHandler(error as ErrorResponseData, 'Failed to reload project data');
        // If we can't reload, at least update the local state
        setProfessionals(prevProfessionals => 
          prevProfessionals.filter(p => p.id !== professionalToRemove.id)
        );
      }

      toast.success('Professional removed from project');
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'Failed to remove professional from project');
    } finally {
      setProfessionalToRemove(null);
    }
  };

  const cancelRemoveProfessional = () => {
    setProfessionalToRemove(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev =>
      prev ? ({ ...prev, [name]: value } as Project) : prev
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
      await updateProject(formData);

      // Fetch the updated project data
      try {
        const updatedProject = await getProjectById(id);
        setFormData(updatedProject);
        originalData.current = updatedProject;

        // Update professionals list from the updated project data
        if (updatedProject.professionals && Array.isArray(updatedProject.professionals)) {
          const projectProfessionals = updatedProject.professionals.map(prof => ({
            id: prof.id,
            name: prof.name,
            email: prof.email,
            professional_type: prof.professional_type,
            status: prof.status,
            // Add default values for required fields that might not be in the API response
            national_id: '',
            phone: '',
            license_number: '',
            license_expiration_date: '',
            address: ''
          }));
          setProfessionals(projectProfessionals);
        }
      } catch (error) {
        errorHandler(error as ErrorResponseData, 'Failed to reload project data');
        // If we can't reload, at least update the local state with what we have
        setFormData(formData);
        originalData.current = formData;
      }

      setIsEditing(false);
      toast.success('Changes saved')
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Convert ProjectDocument[] to FileAreaDocument[]
  const filesData: FileAreaDocument[] = [];

  // Group documents by type
  const documentsByType: Record<string, ProjectDocument[]> = {};
  documents.forEach(doc => {
    if (!documentsByType[doc.document_type]) {
      documentsByType[doc.document_type] = [];
    }
    documentsByType[doc.document_type].push(doc);
  });

  // Add documents to filesData
  Object.entries(documentsByType).forEach(([type, docs]) => {
    if (type === 'כללי') {
      // Add all general files
      docs.forEach(generalDoc => {
        filesData.push({
          fileId: generalDoc.id,
          fileName: generalDoc.name,
          state: DocumentState.UPLOADED,
          fileType: type
        });
      });
    } else {
      // For other document types, only add the most recent document
      const doc = docs[0]; // Assuming the first document is the most recent
      filesData.push({
        fileId: doc.id,
        fileName: doc.name,
        state: DocumentState.UPLOADED,
        fileType: type
      });
    }
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
      const formData = new FormData();
      formData.append('project_id', id);
      formData.append('document_type', fileType);
      formData.append('document_name', file.name);
      formData.append('file', file);
      formData.append('status', DocumentState.UPLOADED);

      console.log(`Uploading file: ${file.name}, type: ${fileType}, size: ${file.size} bytes, status: ${DocumentState.UPLOADED}`);
      
      await uploadProjectDocument(id, fileType, file.name, file, DocumentState.UPLOADED);
      await loadData();
      toast.success(`${fileType} uploaded successfully`);
    } catch (error) {
      console.error("File upload error details:", error);
      errorHandler(error as ErrorResponseData, `Failed to upload ${fileType}`);
    }
  };

  const handleFileDownload = async (fileId: string, fileName: string) => {
    try {
      const blob = await downloadProjectDocument(id, fileId);
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
      await deleteProjectDocument(id, fileId);
      await loadData();
      toast.success('File deleted successfully');
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'Failed to delete file');
    }
  };

  const handleFilePreview = async (fileId: string, fileName: string) => {
    try {
      const blob = await downloadProjectDocument(id, fileId);
      const url = window.URL.createObjectURL(blob);
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

  const handleUploadGeneralFile = async (file: File) => {
    if (!id || !file) return;

    try {
      const fileName = file.name;
      console.log(`Uploading general file: ${fileName}, size: ${file.size} bytes, status: ${DocumentState.UPLOADED}`);
      await uploadProjectDocument(id, 'כללי', fileName, file, DocumentState.UPLOADED);
      await loadData();
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error("File upload error:", error); 
      errorHandler(error as ErrorResponseData, 'Failed to upload file');
    }
  };

  const handleDownloadAllFiles = async () => {
    // Get all uploaded documents
    const uploadedDocs = documents.filter(doc => doc.id);
    
    if (uploadedDocs.length === 0) {
      toast.info('No files to download');
      return;
    }
    
    // Download each file
    for (const doc of uploadedDocs) {
      try {
        await handleFileDownload(doc.id, doc.name);
      } catch (error) {
        errorHandler(error as ErrorResponseData, `Failed to download ${doc.name}`);
      }
    }
    
    toast.success(`Downloading ${uploadedDocs.length} files`);
  };

  const handleEmailAllFiles = () => {
    // Would implement email functionality here
    // This would typically open a dialog to enter email address
    toast.info('Email all files feature would be implemented here');
  };

  // Render icons directly
  const renderIcon = (iconType: any, size = 14) => {
    const IconComponent = iconType;
    return <IconComponent size={size} />;
  };

  return (
    <PageContainer>
      <TopPanel>
        <TopPanelLogo/>
        <TopPanelTitleHolder>
          <TopPanelTitle>
            {formData?.name || 'Project Details'}
          </TopPanelTitle>
        </TopPanelTitleHolder>
        <TopPanelGroup>
          {!isEditing ? (
            <>
              <IconOnlyButton onClick={() => router.back()} title="Back">
                {renderIcon(FaIcons.FaArrowLeft)}
              </IconOnlyButton>
              <IconOnlyButton onClick={startEditing} title="Edit">
                {renderIcon(FaIcons.FaEdit)}
              </IconOnlyButton>
              <IconOnlyButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                title="Delete"
              >
                {renderIcon(FaIcons.FaTrash)}
              </IconOnlyButton>
            </>
          ) : (
            <>
              <IconOnlyButton
                onClick={saveChanges}
                title="Save"
                disabled={saving}
              >
                {renderIcon(FaIcons.FaCheck)}
              </IconOnlyButton>
              <IconOnlyButton
                onClick={cancelEditing}
                title="Cancel"
                disabled={saving}
              >
                {renderIcon(FaIcons.FaTimes)}
              </IconOnlyButton>
            </>
          )}
        </TopPanelGroup>
      </TopPanel>
      <PageContent style={{ padding: '16px 0 0 0' }}>
        {!formData ? (
          <EmptyStatePlaceholder msg="Project not found" />
        ) : (
          <MainLayout>
            {/* Project Panel with Tabs */}
            <ProjectPanel>
              <Card>
                <TabContainer>
                  <TabButton 
                    active={activeTab === 'details'} 
                    onClick={() => setActiveTab('details')}
                  >
                    פרטי הפרויקט
                  </TabButton>
                  <TabButton 
                    active={activeTab === 'professionals'} 
                    onClick={() => setActiveTab('professionals')}
                  >
                    בעלי מקצוע
                  </TabButton>
                </TabContainer>
                
                {activeTab === 'details' && (
                  <TabContent>
                    <CompactFormGrid>
                      <FullWidthField>
                        <CompactLabel>שם הפרויקט</CompactLabel>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={!isEditing}
                          style={{ borderRadius: '8px', padding: '8px 10px', height: '36px' }}
                        />
                      </FullWidthField>
                      <CompactField>
                        <CompactLabel>מספר בקשה</CompactLabel>
                        <Input
                          name="request_number"
                          value={formData.request_number}
                          onChange={handleChange}
                          disabled={!isEditing}
                          style={{ borderRadius: '8px', padding: '8px 10px', height: '36px' }}
                        />
                      </CompactField>
                      <CompactField>
                        <CompactLabel>מספר היתר</CompactLabel>
                        <Input
                          name="permit_number"
                          value={formData.permit_number}
                          onChange={handleChange}
                          disabled={!isEditing}
                          style={{ borderRadius: '8px', padding: '8px 10px', height: '36px' }}
                        />
                      </CompactField>
                      <CompactField>
                        <CompactLabel>מספר תיק טיפול</CompactLabel>
                        <Input
                          name="construction_supervision_number"
                          value={formData.construction_supervision_number}
                          onChange={handleChange}
                          disabled={!isEditing}
                          style={{ borderRadius: '8px', padding: '8px 10px', height: '36px' }}
                        />
                      </CompactField>
                      <CompactField>
                        <CompactLabel>מספר תיאום הנדסי</CompactLabel>
                        <Input
                          name="engineering_coordinator_number"
                          value={formData.engineering_coordinator_number}
                          onChange={handleChange}
                          disabled={!isEditing}
                          style={{ borderRadius: '8px', padding: '8px 10px', height: '36px' }}
                        />
                      </CompactField>
                      <CompactField>
                        <CompactLabel>מספר תיק כיבוי</CompactLabel>
                        <Input
                          name="firefighting_number"
                          value={formData.firefighting_number}
                          onChange={handleChange}
                          disabled={!isEditing}
                          style={{ borderRadius: '8px', padding: '8px 10px', height: '36px' }}
                        />
                      </CompactField>
                      <CompactField>
                        <CompactLabel>סטטוס הפרויקט</CompactLabel>
                        <Select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          disabled={!isEditing}
                          style={{ borderRadius: '8px', padding: '8px 10px', height: '36px' }}
                        >
                          {statuses.map(s => (<option key={s} value={s}>{s}</option>))}
                        </Select>
                      </CompactField>
                      <CompactField>
                        <CompactLabel>בעל ההיתר</CompactLabel>
                        <Input
                          name="permit_owner"
                          type="text"
                          value={formData.permit_owner || ''}
                          onChange={handleChange}
                          disabled={!isEditing}
                          style={{ borderRadius: '8px', padding: '8px 10px', height: '36px' }}
                        />
                      </CompactField>
                      <CompactField>
                        <CompactLabel>תאריך סיום</CompactLabel>
                        <Input
                          name="status_due_date"
                          type="date"
                          value={formData.status_due_date || ''}
                          onChange={handleChange}
                          disabled={!isEditing}
                          style={{ borderRadius: '8px', padding: '8px 10px', height: '36px' }}
                        />
                      </CompactField>
                      <FullWidthField>
                        <CompactLabel>תיאור הפרויקט</CompactLabel>
                        <TextArea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          disabled={!isEditing}
                          style={{ borderRadius: '8px', padding: '8px 10px', minHeight: '60px' }}
                        />
                      </FullWidthField>
                    </CompactFormGrid>
                  </TabContent>
                )}
                
                {activeTab === 'professionals' && (
                  <TabContent>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                      <CompactButton 
                        onClick={handleAddProfessional} 
                        disabled={!isEditing}
                      >
                        {renderIcon(FaIcons.FaPlus, 12)} הוסף בעל מקצוע
                      </CompactButton>
                    </div>
                    
                    {isLoadingProfessionals ? (
                      <p style={{ fontSize: '13px', color: '#666' }}>טוען בעלי מקצוע...</p>
                    ) : professionals.length === 0 ? (
                      <div style={{ 
                        padding: '16px 12px', 
                        textAlign: 'center', 
                        backgroundColor: '#f9f9fb',
                        borderRadius: '8px',
                        color: '#666',
                        fontSize: '13px'
                      }}>
                        אין בעלי מקצוע מצורפים לפרויקט
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {professionals.map(professional => (
                          <ProfessionalCard key={professional.id}>
                            <ProfessionalInfo>
                              <Link href={`/professionals/${professional.id}`} passHref>
                                <ProfessionalName>
                                  {professional.name}
                                </ProfessionalName>
                              </Link>
                              <ProfessionalType>{professional.professional_type}</ProfessionalType>
                              <StatusBadge status={professional.status}>{professional.status}</StatusBadge>
                            </ProfessionalInfo>
                            <IconOnlyButton 
                              onClick={() => handleRemoveProfessional(professional)} 
                              title="הסר בעל מקצוע"
                              disabled={!isEditing}
                              style={{ margin: '0', width: '24px', height: '24px', fontSize: '12px' }}
                            >
                              {renderIcon(FaIcons.FaTrash, 12)}
                            </IconOnlyButton>
                          </ProfessionalCard>
                        ))}
                      </div>
                    )}
                  </TabContent>
                )}
              </Card>
            </ProjectPanel>

            {/* Documents Panel */}
            <DocumentsPanel>
              <Card style={{ height: 'auto' }}>
                <FileArea
                  files={filesData}
                  disabled={!isEditing}
                  onUpload={handleFileUpload}
                  onDownload={handleFileDownload}
                  onDelete={handleFileDelete}
                  onPreview={handleFilePreview}
                  onUploadGeneral={handleUploadGeneralFile}
                />
              </Card>
            </DocumentsPanel>
          </MainLayout>
        )}
        <DeletionDialog
          isOpen={isDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          message={`האם אתה בטוח שברצונך למחוק את הפרויקט ${formData?.name}?`}
        />

        {/* Dialog for removing a professional from the project */}
        <DeletionDialog
          isOpen={!!professionalToRemove}
          onConfirm={confirmRemoveProfessional}
          onCancel={cancelRemoveProfessional}
          message={`האם אתה בטוח שברצונך להסיר את ${professionalToRemove?.name} מפרויקט זה?`}
        />

        {/* Dialog for adding a professional to the project */}
        {showAddProfessionalDialog && (
          <ProjectProfessionalDialog
            projectId={id}
            onClose={handleProfessionalAdded}
            existingProfessionalIds={professionals.map(p => p.id)}
          />
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
    </PageContainer>
  );
};

export default ProjectView;
