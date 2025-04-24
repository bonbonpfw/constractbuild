import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";
import Link from "next/link";
import {
  Button, Field,
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
import {Professional, Project, ProjectDocument} from "../../types";
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
import {FaArrowLeft, FaCheck, FaEdit, FaPlus, FaTimes, FaTrash} from "react-icons/fa";
import EmptyStatePlaceholder from "../shared/EmptyState";
import useDeleteProject from "./useDeleteProject";
import DeletionDialog from "../shared/DeletionDialog";
import {toast} from "react-toastify";
import FileArea, {FileAreaDocument} from "../shared/FileArea";
import styled from "styled-components";
import ProjectProfessionalDialog from "./ProjectProfessionalDialog";

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 16px;
  background: ${({ status }) =>
    status === 'Active' ? '#e6ffed' :
    status === 'Inactive' ? '#ffeef0' :
    '#fffbdd'};
  color: ${({ status }) =>
    status === 'Active' ? '#22863a' :
    status === 'Inactive' ? '#cb2431' :
    '#735c0f'};
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
      setDocumentTypes(docTypes);

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
      if (errorData.response.data.error_code === 'project_does_not_exist') {
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
    // Only add the most recent document of each type
    const doc = docs[0]; // Assuming the first document is the most recent
    filesData.push({
      fileId: doc.id,
      fileName: doc.name,
      state: 'uploaded',
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
        state: 'missing',
        fileType: type
      });
    }
  });

  const handleFileUpload = async (fileType: string, file: File) => {
    if (!id || !file) return;

    try {
      const fileName = file.name;
      await uploadProjectDocument(id, fileType, fileName, file);
      await loadData();
      toast.success(`${fileType} uploaded successfully`);
    } catch (error) {
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
              <IconButton onClick={() => router.back()} title="Back">
                <FaArrowLeft />
              </IconButton>
              <IconButton onClick={startEditing} title="Edit">
                <FaEdit />
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                title="Delete"
              >
               <FaTrash />
              </IconButton>
            </>
          ) : (
            <>
              <IconButton
                onClick={saveChanges}
                title="Save"
                disabled={saving}
              >
                <FaCheck />
              </IconButton>
              <IconButton
                onClick={cancelEditing}
                title="Cancel"
                disabled={saving}
              >
                <FaTimes />
              </IconButton>
            </>
          )}
        </TopPanelGroup>
      </TopPanel>
      <PageContent>
        {!formData ? (
          <EmptyStatePlaceholder msg="Project not found" />
        ) : (
          <div style={{ display: 'flex', width: '100%', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Form fields on the left */}
            <FormGrid style={{ flex: '1', minWidth: '420px', minHeight: 'fit-content', paddingBottom: '20px', marginBottom: '20px' }}>
              <Label style={{ gridColumn: 'span 2', fontSize: 25, textAlign: 'center', margin: '10px 0 20px 0', display: 'block' }}>General</Label>
              <FullWidthField>
                <Label>Name</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </FullWidthField>
              <Field>
                <Label>Case ID</Label>
                <Input
                  name="case_id"
                  value={formData.case_id}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
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
              <FullWidthField>
                <Label>Description</Label>
                <TextArea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  disabled={!isEditing}
                />
              </FullWidthField>
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
                <Label>Due Date</Label>
                <Input
                  name="due_date"
                  type="date"
                  value={formData.due_date || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Field>
              <Field>
                <Label>Status Due Date</Label>
                <Input
                  name="status_due_date"
                  type="date"
                  value={formData.status_due_date || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Field>

              {/* Professionals section */}
              <FullWidthField style={{ marginTop: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <Label style={{ fontSize: '20px', margin: 0 }}>Professionals</Label>
                  <Button 
                    onClick={handleAddProfessional} 
                    disabled={!isEditing}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <FaPlus /> Add Professional
                  </Button>
                </div>

                {isLoadingProfessionals ? (
                  <p>Loading professionals...</p>
                ) : professionals.length === 0 ? (
                  <p>No professionals attached to this project</p>
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <TableHeader>Name</TableHeader>
                        <TableHeader>Occupation</TableHeader>
                        <TableHeader>Status</TableHeader>
                        <TableHeader></TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {professionals.map(professional => (
                        <tr key={professional.id}>
                          <TableBody>
                            <Link href={`/professionals/${professional.id}`} passHref>
                              <a style={{ color: '#51789f', textDecoration: 'none', cursor: 'pointer' }}>
                                {professional.name}
                              </a>
                            </Link>
                          </TableBody>
                          <TableBody>{professional.professional_type}</TableBody>
                          <TableBody>
                            <StatusBadge status={professional.status}>{professional.status}</StatusBadge>
                          </TableBody>
                          <TableBody>
                            <IconButton 
                              onClick={() => handleRemoveProfessional(professional)} 
                              title="Remove professional"
                              disabled={!isEditing}
                            >
                              <FaTrash />
                            </IconButton>
                          </TableBody>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </FullWidthField>
            </FormGrid>

            {/* Documents area on the right */}
            <div style={{ flex: '0 0 500px', minWidth: '300px', marginBottom: '20px' }}>
              <Label style={{ fontSize: 25, textAlign: 'center', margin: '10px 0 40px 0', display: 'block' }}>Documents</Label>
              <FileArea
                files={filesData}
                disabled={!isEditing}
                onUpload={handleFileUpload}
                onDownload={handleFileDownload}
                onDelete={handleFileDelete}
              />
            </div>
          </div>
        )}
        <DeletionDialog
          isOpen={isDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          message={`Are you sure you want to delete project ${formData?.name}?`}
        />

        {/* Dialog for removing a professional from the project */}
        <DeletionDialog
          isOpen={!!professionalToRemove}
          onConfirm={confirmRemoveProfessional}
          onCancel={cancelRemoveProfessional}
          message={`Are you sure you want to remove ${professionalToRemove?.name} from this project?`}
        />

        {/* Dialog for adding a professional to the project */}
        {showAddProfessionalDialog && (
          <ProjectProfessionalDialog
            projectId={id}
            onClose={handleProfessionalAdded}
            existingProfessionalIds={professionals.map(p => p.id)}
          />
        )}
      </PageContent>
    </PageContainer>
  );
};

export default ProjectView;
