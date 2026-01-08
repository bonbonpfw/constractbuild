import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Button,
  IconButton,
  Input,
  PageContainer,
  PageContent,
  Select,
  TextArea,
  TopPanel,
  TopPanelGroup,
  TopPanelLogo,
  TopPanelTitle,
  TopPanelTitleHolder,
} from "../../styles/SharedStyles";
import {
  Professional,
  Project,
  ProjectDocument,
  DocumentState,
  ProjectStatus,
} from "../../types";
import {
  getProjectById,
  getProjectStatuses,
  updateProject,
  removeProfessionalFromProject,
  uploadProjectDocument,
  downloadProjectDocument,
  deleteProjectDocument,
  getProjectDocumentTypes,
  getProjectTeamRoles,
  getProjectTeamMembers,
  createProjectTeamMember,
  updateProjectTeamMember,
  deleteProjectTeamMember,
  autoFillDocument,
  sendFilledProjectDocuments,
  ServiceType,
  SERVICE_TYPE_OPTIONS,
} from "../../api";
import { errorHandler, ErrorResponseData } from "../shared/ErrorHandler";
import * as FaIcons from "react-icons/fa";
import EmptyStatePlaceholder from "../shared/EmptyState";
import useDeleteProject from "./useDeleteProject";
import DeletionDialog from "../shared/DeletionDialog";
import { toast } from "react-toastify";
import FileArea, { FileAreaDocument, FilePreview } from "../shared/FileArea";
import styled from "styled-components";
import ProjectProfessionalDialog from "./ProjectProfessionalDialog";
import { Tab, Tabs } from "../shared/Tabs";
import { Chat } from "./Chat";
import EmailDialog from "./EmailDialog";
import EditControls from "../shared/EditControls";

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  background: ${({ status }) =>
    status === "Active"
      ? "#e3f6ec"
      : status === "Expired"
        ? "#ffecef"
        : status === "Warning"
          ? "#fff7e0"
          : "#ffecef"};
  color: ${({ status }) =>
    status === "Active"
      ? "#1d8450"
      : status === "Expired"
        ? "#e1273d"
        : status === "Warning"
          ? "#b0851f"
          : "#e1273d"};
`;

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 180px 1fr 320px;
  grid-template-rows: 1fr;
  grid-template-areas: "sidebar project chat";
  gap: 16px;
  width: 100%;
  height: calc(100vh - 140px);
  overflow: hidden;
  padding: 0 16px;
  direction: rtl;
  align-items: stretch;

  @media (max-width: 1400px) {
    grid-template-columns: 160px 1fr 280px;
    gap: 12px;
    padding: 0 12px;
  }
`;

const ChatSidebar = styled.div`
  grid-area: chat;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid #f0f2f5;
  direction: rtl;
  min-height: 0;
  height: 100%;
`;

const ChatHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
`;

const ChatTitle = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
`;

const SecondSidebar = styled.div`
  grid-area: sidebar;
  width: 200px;
  display: flex;
  flex-direction: column;
  direction: rtl;
  border-right: 1px solid #eaeaea;
  padding-right: 16px;

  @media (max-width: 1400px) {
    width: 170px;
    padding-right: 12px;
  }
`;

const SecondSidebarContent = styled.div`
  margin-top: 20px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SidebarGroup = styled.div`
  margin-bottom: 24px;
`;

const SidebarButton = styled.button<{ active: boolean }>`
  width: 100%;
  background: ${(p) => (p.active ? "rgb(227, 237, 246)" : "transparent")};
  border: none;
  height: 36px;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: ${(p) => (p.active ? "600" : "400")};
  color: ${(p) => (p.active ? "#1e40af" : "#51789f")};
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  text-align: right;
  border-radius: 6px;

  &:hover {
    background-color: rgb(235, 242, 250);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ProjectPanel = styled.div`
  grid-area: project;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  border: 1px solid #f0f2f5;
  overflow: hidden;
`;

const TabContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow: hidden;
`;

const TabPane = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 4px 8px;

  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
  }
`;

const CompactFormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 8px;
  width: 100%;
  max-width: 100%;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CompactField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
`;

const CompactLabel = styled.label`
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  margin-right: 4px;
`;

const ModernInput = styled(Input)`
  border-radius: 10px !important;
  border: 1px solid #e2e8f0 !important;
  padding: 10px 14px !important;
  height: 42px !important;
  font-size: 14px !important;
  background-color: ${(p) => (p.disabled ? "#f8fafc" : "#ffffff")} !important;
  transition: all 0.2s ease !important;
  color: #1e293b !important;
  width: 100% !important;
  box-sizing: border-box !important;

  &:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    outline: none !important;
  }

  &:disabled {
    border-color: #f1f5f9 !important;
    color: #64748b !important;
    cursor: default;
  }
`;

const ModernSelect = styled(Select)`
  border-radius: 10px !important;
  border: 1px solid #e2e8f0 !important;
  padding: 0 14px !important;
  height: 42px !important;
  font-size: 14px !important;
  background-color: ${(p) => (p.disabled ? "#f8fafc" : "#ffffff")} !important;
  color: #1e293b !important;

  &:disabled {
    border-color: #f1f5f9 !important;
    opacity: 1;
  }
`;

const ModernTextArea = styled(TextArea)`
  border-radius: 10px !important;
  border: 1px solid #e2e8f0 !important;
  padding: 12px 14px !important;
  font-size: 14px !important;
  background-color: ${(p) => (p.disabled ? "#f8fafc" : "#ffffff")} !important;
  min-height: 100px !important;
  line-height: 1.5 !important;

  &:disabled {
    border-color: #f1f5f9 !important;
  }
`;

const CompactButton = styled(Button)`
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #3b82f6;
  color: white;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background-color: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 6px 12px -1px rgba(59, 130, 246, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &.cancel {
    background-color: #f1f5f9;
    color: #64748b;
    box-shadow: none;

    &:hover {
      background-color: #e2e8f0;
      color: #475569;
    }
  }
`;

const IconOnlyButton = styled(IconButton)`
  width: 30px;
  height: 30px;
  font-size: 14px;
`;

const CityLogo = styled.img`
  height: 36px;
  width: auto;
  object-fit: contain;
  margin-top: 10px;
`;

const ProfessionalCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  padding: 10px 12px;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 230px;

  &:hover {
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  }
`;

const ProfessionalInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  overflow: hidden;
  width: 100%;
  min-width: 0;
`;

const ProfessionalName = styled.a`
  color: #0071e3;
  text-decoration: none;
  font-weight: 500;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  display: block;
  text-align: right;
`;

const ProfessionalType = styled.span`
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  display: block;
  text-align: right;
`;

const ProjectView: React.FC = () => {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  if (!id) {
    return <PageContainer />;
  }

  const {
    isDeleteDialogOpen,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    isDeleting,
  } = useDeleteProject(id);

  const [formData, setFormData] = useState<Project | null>(null);
  const originalData = useRef<Project | null>(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statuses, setStatuses] = useState<string[]>([]);

  // Professionals state
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);
  const [showAddProfessionalDialog, setShowAddProfessionalDialog] =
    useState(false);
  const [professionalToRemove, setProfessionalToRemove] =
    useState<Professional | null>(null);

  // Documents state
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [autoFillingDocId, setAutoFillingDocId] = useState<string | null>(null);
  const [engCoordForm, setEngCoordForm] = useState({
    status: "",
    target_date: "",
    contact_name: "",
    contact_phone: "",
    notes: "",
  });

  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);

  // Categories and Tabs state
  const [activeCategory, setActiveCategory] = useState<"general" | "stages">("general");
  const [activeTab, setActiveTab] = useState<
    "details" | "start_work" | "eng_coord" | "form4" | "professionals" | "team" | "documents"
  >("details");

  const [teamRoles, setTeamRoles] = useState<{ key: string; label: string }[]>(
    []
  );
  const [rolesLoading, setRolesLoading] = useState(true);
  const [teamData, setTeamData] = useState<
    Record<
      string,
      { name: string; phone: string; email: string; address: string }
    >
  >({});

  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  const [isEditingTeam, setIsEditingTeam] = useState(false);

  // Email dialog state
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const serviceTypes = useMemo(() => {
    if (!formData) return [];
    if (Array.isArray(formData.service_types)) return formData.service_types;
    if (typeof (formData as any).service_types === "string") {
      return (formData as any).service_types
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    return [];
  }, [formData]);

  const isAllServices =
    serviceTypes.length === 0 || serviceTypes.length >= 3;
  const hasService = (value: string) => serviceTypes.includes(value);
  const startWorkEnabled = isAllServices || hasService(ServiceType.SW);
  const engCoordEnabled = isAllServices || hasService(ServiceType.ENG);
  const form4Enabled = isAllServices || hasService(ServiceType.FOUR);

  // Helper to map project professionals to Professional type
  const mapProfessionals = (professionals: any[]): Professional[] => {
    return professionals.map((prof) => ({
      id: prof.id,
      name: prof.name,
      email: prof.email,
      professional_type: prof.professional_type,
      status: prof.status,
      national_id: "",
      phone: "",
      license_number: "",
      license_expiration_date: "",
      address: "",
    }));
  };

  const loadData = async () => {
    try {
      const [proj, statuses] = await Promise.all([
        getProjectById(id),
        getProjectStatuses(),
      ]);
      setFormData(proj as Project);
      originalData.current = proj as Project;
      setStatuses(statuses);

      // Extract professionals data directly from the project
      setIsLoadingProfessionals(true);
      if (proj.professionals && Array.isArray(proj.professionals)) {
        setProfessionals(mapProfessionals(proj.professionals));
      } else {
        setProfessionals([]);
      }
      setIsLoadingProfessionals(false);

      // Load project documents
      if (proj.documents && Array.isArray(proj.documents)) {
        setDocuments(proj.documents);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      const errorData = error as ErrorResponseData;
      // Add proper checks to avoid "Cannot read properties of undefined"
      if (
        errorData &&
        errorData.response &&
        errorData.response.data &&
        errorData.response.data.error_code === "project_does_not_exist"
      ) {
        router.push("/projects");
      } else {
        errorHandler(error as ErrorResponseData, "Failed to load project");
      }
    }
  };

  useEffect(() => {
    // Fetch team member roles from backend
    getProjectTeamRoles()
      .then((roles) => {
        setTeamRoles(
          roles.map((role: any) => ({ key: role.name, label: role.value }))
        );
      })
      .finally(() => setRolesLoading(false));
  }, []);

  useEffect(() => {
    if (teamRoles.length > 0) {
      const data: Record<
        string,
        { name: string; phone: string; email: string; address: string }
      > = {};
      teamRoles.forEach((role) => {
        // Find the team member for this role
        const member = teamMembers.find((m: any) => m.role === role.label);
        data[role.key] = {
          name: member?.name || "",
          phone: member?.phone || "",
          email: member?.email || "",
          address: member?.address || "",
        };
      });
      setTeamData(data);
    }
  }, [teamRoles, teamMembers]);

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
          setProfessionals(mapProfessionals(updatedProject.professionals));
        }
      } catch (error) {
        errorHandler(error as ErrorResponseData, "Failed to reload project data");
      }
    }
  };

  const handleRemoveProfessional = (professional: Professional) => {
    setProfessionalToRemove(professional);
  };

  const confirmRemoveProfessional = async () => {
    if (!professionalToRemove || !id) return;
    setProfessionalToRemove(null);
    try {
      const professional_id = professionalToRemove.id.toString();
      await removeProfessionalFromProject({
        project_id: id,
        professional_id: professional_id,
      });
      await loadData();
      toast.success("Professional removed from project");
    } catch (error) {
      errorHandler(
        error as ErrorResponseData,
        "Failed to remove professional from project"
      );
    }
  };

  const cancelRemoveProfessional = () => {
    setProfessionalToRemove(null);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) =>
      prev ? ({ ...prev, [name]: value } as Project) : prev
    );
  };

  const cancelEditing = () => {
    setFormData(originalData.current);
    setIsEditingDetails(false);
  };

  const handleServiceTypeToggle = (value: ServiceType) => {
    setFormData((prev) => {
      if (!prev) return prev;
      const existing = Array.isArray(prev.service_types)
        ? prev.service_types
        : typeof (prev as any).service_types === "string"
          ? (prev as any).service_types
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [];
      const next = existing.includes(value)
        ? existing.filter((v: string) => v !== value)
        : [...existing, value];
      return { ...(prev as Project), service_types: next };
    });
  };

  const saveChanges = async () => {
    if (!formData) return;
    setSaving(true);
    try {
      // Send updated data to the backend
      await updateProject(formData);

      // Fetch the updated project data
      try {
        const updatedProject = await getProjectById(id);
        setFormData(updatedProject as Project);
        originalData.current = updatedProject as Project;

        // Update professionals list from the updated project data
        if (updatedProject.professionals && Array.isArray(updatedProject.professionals)) {
          setProfessionals(mapProfessionals(updatedProject.professionals));
        }
      } catch (error) {
        errorHandler(error as ErrorResponseData, "Failed to reload project data");
        setFormData(formData);
        originalData.current = formData;
      }

      setIsEditingDetails(false);
      toast.success("Changes saved");
    } catch (error) {
      errorHandler(error as ErrorResponseData, "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case ProjectStatus.PRE_PERMIT:
        return 'קדם היתר';
      case ProjectStatus.POST_PERMIT:
        return 'אחרי היתר';
      case ProjectStatus.FINAL:
        return 'אושר לתחילת עבודות';
      default:
        return 'לא ידוע';
    }
  };

  // Convert ProjectDocument[] to FileAreaDocument[]
  const filesData: FileAreaDocument[] = [];

  // Group documents by type
  const documentsByType: Record<string, ProjectDocument[]> = {};
  documents.forEach((doc) => {
    if (!documentsByType[doc.document_type]) {
      documentsByType[doc.document_type] = [];
    }
    documentsByType[doc.document_type].push(doc);
  });

  // Add documents to filesData
  Object.entries(documentsByType).forEach(([type, docs]) => {
    if (type === "כללי") {
      // Add all general files
      docs.forEach((generalDoc) => {
        filesData.push({
          fileId: generalDoc.id,
          fileName: generalDoc.name,
          state: DocumentState.UPLOADED,
          fileType: type,
          status: generalDoc.status,
          created_at: generalDoc.created_at,
          versions: [], // General files don't have versions
        });
      });
    } else {
      // For other document types, sort by created_at and take the most recent
      const sortedDocs = docs.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const doc = sortedDocs[0]; // Take the most recent document

      // Create versions array from all documents of this type
      const versions = docs.map((versionDoc) => ({
        id: versionDoc.id,
        name: versionDoc.name,
        status: versionDoc.status,
        created_at: versionDoc.created_at,
      }));

      filesData.push({
        fileId: doc.id,
        fileName: doc.name,
        state: DocumentState.UPLOADED,
        fileType: type,
        status: doc.status,
        created_at: doc.created_at,
        versions: versions,
      });
    }
  });

  // Add missing document types
  const existingTypes = Object.keys(documentsByType);
  documentTypes?.forEach((type) => {
    // Do not create a missing placeholder for general documents
    if (type === "כללי") {
      return;
    }
    if (!existingTypes.includes(type)) {
      filesData.push({
        fileId: "",
        fileName: null,
        state: DocumentState.MISSING,
        fileType: type,
        versions: [],
      });
    }
  });

  const stageFiles = filesData.filter(
    (f) =>
      f.fileType !== "כללי" &&
      (documentTypes.length === 0 || documentTypes.includes(f.fileType))
  );

  const handleFileUpload = async (
    fileType: string,
    file: File,
    mode: "auto" | "manual",
    status: string = DocumentState.UPLOADED
  ) => {
    if (!id || !file) return;
    try {
      await uploadProjectDocument(
        id,
        fileType,
        file.name,
        file,
        status,
        mode,
        formData?.city || ""
      );
      await loadData();
      toast.success(`${fileType} uploaded successfully`);
    } catch (error) {
      errorHandler(error as ErrorResponseData, `Failed to upload ${fileType}`);
    }
  };

  const handleAutoFill = async (
    fileId: string,
    documentType: string,
    fileName: string
  ) => {
    if (!id || !fileId) return;

    // Set loading state for this document
    setAutoFillingDocId(fileId);

    try {
      // Download the current file
      const blob = await downloadProjectDocument(id, fileId);
      const file = new File([blob], fileName, { type: blob.type });

      // Update the document with auto-fill and forward city
      await autoFillDocument(
        id,
        fileId,
        documentType,
        file,
        formData?.city || ""
      );
      await loadData();
      toast.success("Document auto-filled successfully");
    } catch (error) {
      errorHandler(error as ErrorResponseData, "Failed to auto-fill document");
    } finally {
      // Clear loading state
      setAutoFillingDocId(null);
    }
  };

  const handleFileDownload = async (fileId: string, fileName: string) => {
    try {
      const blob = await downloadProjectDocument(id, fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      errorHandler(error as ErrorResponseData, "Failed to download file");
    }
  };

  // Handler for downloading a specific version of a document
  const handleVersionDownload = async (versionId: string) => {
    if (!id) {
      toast.error("שגיאה: מזהה פרויקט חסר");
      return;
    }

    if (!versionId) {
      toast.error("שגיאה: מזהה גרסה חסר");
      return;
    }

    try {
      // Find the document version details
      let fileName = "";
      for (const file of filesData) {
        if (file.versions) {
          const version = file.versions.find((v) => v.id === versionId);
          if (version) {
            fileName = version.name;
            break;
          }
        }
      }

      const blob = await downloadProjectDocument(id, versionId);
      if (blob.size === 0) {
        toast.error("הקובץ שהורד ריק");
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || `document-${versionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("הגרסה הורדה בהצלחה");
    } catch (error) {
      errorHandler(
        error as ErrorResponseData,
        "Failed to download document version"
      );
    }
  };

  const handleFileDelete = async (fileId: string) => {
    if (!id || !fileId) return;

    // Find the file to get its status
    const fileToDelete = filesData.find((file) => file.fileId === fileId);
    const status = fileToDelete?.status || DocumentState.UPLOADED;

    try {
      await deleteProjectDocument(id, fileId, status);
      await loadData();
      toast.success("File deleted successfully");
    } catch (error) {
      errorHandler(error as ErrorResponseData, "Failed to delete file");
    }
  };

  const handleFilePreview = async (fileId: string, fileName: string) => {
    try {
      const blob = await downloadProjectDocument(id, fileId);
      const url = window.URL.createObjectURL(blob);
      setPreviewFileUrl(url);
      setPreviewFileName(fileName);
    } catch (error) {
      errorHandler(error as ErrorResponseData, "Failed to preview file");
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
      await uploadProjectDocument(
        id,
        "כללי",
        file.name,
        file,
        DocumentState.GENERAL
      );
      await loadData();
      toast.success("File uploaded successfully");
    } catch (error) {
      errorHandler(error as ErrorResponseData, "Failed to upload file");
    }
  };

  const handleDownloadAllFiles = async () => {
    // Get all uploaded documents
    const uploadedDocs = documents.filter((doc) => doc.id);

    if (uploadedDocs.length === 0) {
      toast.info("No files to download");
      return;
    }

    // Download each file
    for (const doc of uploadedDocs) {
      try {
        await handleFileDownload(doc.id, doc.name);
      } catch (error) {
        errorHandler(
          error as ErrorResponseData,
          `Failed to download ${doc.name}`
        );
      }
    }

    toast.success(`Downloading ${uploadedDocs.length} files`);
  };

  const getPermitOwnerEmail = (): string => {
    const permitOwner = teamMembers.find(
      (member: any) => member.role === "בעל ההיתר"
    );
    return permitOwner?.email || "";
  };

  const handleEmailAllFiles = () => {
    setIsEmailDialogOpen(true);
  };

  const handleSendEmail = async (
    recipientEmail: string,
    subject: string,
    body: string
  ) => {
    if (!id) return;

    setIsSendingEmail(true);
    try {
      await sendFilledProjectDocuments(id, recipientEmail, subject, body);
      toast.success("המייל נשלח בהצלחה");
      setIsEmailDialogOpen(false);
    } catch (error) {
      errorHandler(error as ErrorResponseData, "נכשל בשליחת המייל");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Render icons directly
  const renderIcon = (iconType: any, size = 14) => {
    const IconComponent = iconType;
    return <IconComponent size={size} />;
  };

  // Fetch team members when loading the project or after save
  const loadTeamMembers = async () => {
    if (!id) return;
    const members = await getProjectTeamMembers(id);
    setTeamMembers(members);
  };

  useEffect(() => {
    loadTeamMembers();
  }, [id]);

  // Prepare filesData for FileArea
  let generalFiles = filesData.filter((f) => f.fileType === "כללי");
  // Sort general files by file name (ascending). Missing placeholders always last.
  generalFiles = generalFiles.sort((a, b) => {
    const aMissing = a.state === DocumentState.MISSING;
    const bMissing = b.state === DocumentState.MISSING;
    if (aMissing && !bMissing) return 1;
    if (bMissing && !aMissing) return -1;
    const an = (a.fileName || "").toString();
    const bn = (b.fileName || "").toString();
    return an.localeCompare(bn, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  const generalTabs: Tab[] = [
    { label: "פרטי פרויקט", value: "details", icon: <FaIcons.FaInfoCircle /> },
    { label: "בעלי מקצוע", value: "professionals", icon: <FaIcons.FaUserTie /> },
    { label: "צוות הפרויקט", value: "team", icon: <FaIcons.FaUsers /> },
    { label: "מסמכים כלליים", value: "documents", icon: <FaIcons.FaFileAlt /> },
  ];

  const stageTabs: Tab[] = useMemo(() => [
    { label: "תחילת עבודות", value: "start_work", disabled: !startWorkEnabled, icon: <FaIcons.FaPlay /> },
    { label: "תיאום הנדסי", value: "eng_coord", disabled: !engCoordEnabled, icon: <FaIcons.FaCogs /> },
    { label: "טופס 4", value: "form4", disabled: !form4Enabled, icon: <FaIcons.FaClipboardCheck /> },
  ], [startWorkEnabled, engCoordEnabled, form4Enabled]);

  const getServiceTypeForTab = useCallback((tab: string): string | undefined => {
    if (tab === "start_work") return ServiceType.SW;
    if (tab === "eng_coord") return ServiceType.ENG;
    if (tab === "form4") return ServiceType.FOUR;
    return undefined;
  }, []);

  const getFirstEnabledStage = useCallback((): "start_work" | "eng_coord" | "form4" | "details" => {
    if (startWorkEnabled) return "start_work";
    if (engCoordEnabled) return "eng_coord";
    if (form4Enabled) return "form4";
    return "details";
  }, [startWorkEnabled, engCoordEnabled, form4Enabled]);

  const handleCategoryChange = (category: "general" | "stages") => {
    setActiveCategory(category);
    if (category === "general") {
      setActiveTab("details");
    } else if (category === "stages") {
      setActiveTab(getFirstEnabledStage());
    }
  };

  useEffect(() => {
    if (activeCategory !== "stages") return;
    const tabEnabled: Record<string, boolean> = {
      start_work: startWorkEnabled,
      eng_coord: engCoordEnabled,
      form4: form4Enabled,
    };
    if (!tabEnabled[activeTab]) {
      setActiveTab(getFirstEnabledStage());
    }
  }, [activeCategory, activeTab, startWorkEnabled, engCoordEnabled, form4Enabled, getFirstEnabledStage]);

  useEffect(() => {
    if (!formData?.city) return;
    if (!["start_work", "eng_coord", "form4"].includes(activeTab)) return;
    const serviceType = getServiceTypeForTab(activeTab);
    const loadDocTypes = async () => {
      try {
        const docTypes = await getProjectDocumentTypes(
          formData.city || "",
          serviceType,
        );
        setDocumentTypes([...docTypes]);
      } catch (error) {
        errorHandler(error as ErrorResponseData, "Failed to load document types");
        setDocumentTypes([]);
      }
    };
    loadDocTypes();
  }, [activeTab, formData?.city, getServiceTypeForTab]);

  const saveTeam = async (data: typeof teamData) => {
    if (!id) return;
    const currentMembers = await getProjectTeamMembers(id);
    let hasValidationError = false;

    for (const roleKey of Object.keys(teamData)) {
      const role = teamRoles.find((r) => r.key === roleKey);
      if (!role) continue;
      const memberData = teamData[roleKey];
      const existing = currentMembers.find((m: any) => m.role === role.label);

      // If all fields are empty, skip
      if (
        !memberData.name &&
        !memberData.phone &&
        !memberData.email &&
        !memberData.address
      ) {
        if (existing) {
          await deleteProjectTeamMember(existing.id);
        }
        continue;
      }

      // If some fields are filled but not all required, show error and skip
      // if (!memberData.name || !memberData.address || !memberData.phone) {
      //   hasValidationError = true;
      //   toast.error(`יש למלא שם, כתובת וטלפון עבור תפקיד: ${role.label}`);
      //   continue;
      // }

      // All required fields are filled, create or update
      if (existing) {
        await updateProjectTeamMember({
          id: existing.id,
          name: memberData.name,
          address: memberData.address,
          phone: memberData.phone,
          email: memberData.email,
          role: role.label,
        });
      } else {
        await createProjectTeamMember({
          project_id: id,
          name: memberData.name,
          address: memberData.address,
          phone: memberData.phone,
          email: memberData.email,
          role: role.label,
        });
      }
    }
    await loadTeamMembers();
    if (!hasValidationError) {
      toast.success("Team members saved successfully");
    }
  };

  const renderProjectDetails = () => {
    if (!formData) return null;
    return (
    <div>
      <EditControls
        isEditing={isEditingDetails}
        onEdit={() => setIsEditingDetails(true)}
        onSave={async () => {
          await saveChanges();
          setIsEditingDetails(false);
        }}
        onCancel={() => {
          cancelEditing();
          setIsEditingDetails(false);
        }}
        saving={saving}
      />
      
      <CompactFormGrid style={{ gap: "12px" }}>
        <div style={{ gridColumn: "span 3" }}>
          <CompactField style={{ gap: "4px" }}>
            <CompactLabel style={{ fontSize: "12px" }}>שם הפרויקט</CompactLabel>
            <ModernInput
              style={{ height: "32px", padding: "6px 10px", fontSize: "13px" }}
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditingDetails}
              placeholder="הכנס שם פרויקט..."
            />
          </CompactField>
        </div>

        <CompactField style={{ gap: "4px" }}>
          <CompactLabel style={{ fontSize: "12px" }}>מספר בקשה</CompactLabel>
          <ModernInput
            style={{ height: "32px", padding: "6px 10px", fontSize: "13px" }}
            name="request_number"
            value={formData.request_number}
            onChange={handleChange}
            disabled={!isEditingDetails}
          />
        </CompactField>


        <CompactField style={{ gap: "4px" }}>
          <CompactLabel style={{ fontSize: "12px" }}>מספר היתר</CompactLabel>
          <ModernInput
            style={{ height: "32px", padding: "6px 10px", fontSize: "13px" }}
            name="permit_number"
            value={formData.permit_number}
            onChange={handleChange}
            disabled={!isEditingDetails}
          />
        </CompactField>

        <CompactField style={{ gap: "4px" }}>
          <CompactLabel style={{ fontSize: "12px" }}>מספר תיק טיפול</CompactLabel>
          <ModernInput
            style={{ height: "32px", padding: "6px 10px", fontSize: "13px" }}
            name="construction_supervision_number"
            value={formData.construction_supervision_number}
            onChange={handleChange}
            disabled={!isEditingDetails}
          />
        </CompactField>

        <CompactField style={{ gap: "4px" }}>
          <CompactLabel style={{ fontSize: "12px" }}>מספר תיאום הנדסי</CompactLabel>
          <ModernInput
            style={{ height: "32px", padding: "6px 10px", fontSize: "13px" }}
            name="engineering_coordinator_number"
            value={formData.engineering_coordinator_number}
            onChange={handleChange}
            disabled={!isEditingDetails}
          />
        </CompactField>

        <CompactField style={{ gap: "4px" }}>
          <CompactLabel style={{ fontSize: "12px" }}>מספר תיק כיבוי</CompactLabel>
          <ModernInput
            style={{ height: "32px", padding: "6px 10px", fontSize: "13px" }}
            name="firefighting_number"
            value={formData.firefighting_number}
            onChange={handleChange}
            disabled={!isEditingDetails}
          />
        </CompactField>

        <CompactField style={{ gap: "4px" }}>
          <CompactLabel style={{ fontSize: "12px" }}>סטטוס הפרויקט</CompactLabel>
          <ModernSelect
            style={{ height: "32px", padding: "0 10px", fontSize: "13px" }}
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={!isEditingDetails}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {getStatusLabel(s)}
              </option>
            ))}
          </ModernSelect>
        </CompactField>

        <CompactField style={{ gap: "4px" }}>
          <CompactLabel style={{ fontSize: "12px" }}>סוג השירות</CompactLabel>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {SERVICE_TYPE_OPTIONS.map((option) => (
              <label
                key={option.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "13px",
                  color: "#334155",
                }}
              >
                <input
                  type="checkbox"
                  checked={serviceTypes.includes(option.value)}
                  onChange={() => handleServiceTypeToggle(option.value)}
                  disabled={!isEditingDetails}
                  style={{ cursor: isEditingDetails ? "pointer" : "default" }}
                />
                {option.label}
              </label>
            ))}
          </div>
        </CompactField>

        <CompactField style={{ gap: "4px" }}>
          <CompactLabel style={{ fontSize: "12px" }}>תאריך תחילת עבודות</CompactLabel>
          <ModernInput
            style={{ height: "32px", padding: "6px 10px", fontSize: "13px" }}
            name="status_due_date"
            type="date"
            value={formData.status_due_date || ""}
            onChange={handleChange}
            disabled={!isEditingDetails}
          />
        </CompactField>

        <div style={{ gridColumn: "span 3" }}>
          <CompactField style={{ gap: "4px" }}>
            <CompactLabel style={{ fontSize: "12px" }}>תיאור הפרויקט</CompactLabel>
            <ModernTextArea
              style={{ minHeight: "60px", padding: "8px 10px", fontSize: "13px" }}
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={!isEditingDetails}
              placeholder="הוסף תיאור קצר לפרויקט..."
            />
          </CompactField>
        </div>
      </CompactFormGrid>
    </div>
  );
  };

  return (
    <PageContainer>
      <TopPanel>
        <TopPanelLogo />
        <TopPanelTitleHolder style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <TopPanelTitle>{formData?.name || "פרטי הפרויקט"}</TopPanelTitle>
          {formData?.city && (() => {
            const city = formData.city.toLowerCase();
            // Tel Aviv
            if (city.includes("תל אביב") || city.includes("תל-אביב") || city.includes("tel aviv") || city.includes("telaviv")) {
              return <CityLogo src="https://upload.wikimedia.org/wikipedia/he/e/e0/Tel_Aviv_New_Logo.svg" alt="Tel Aviv Logo" title="תל אביב" />;
            }
            // Ramat Gan
            if (formData.city.includes("רמת גן") || formData.city.includes("רמת-גן") || city.includes("ramat gan") || city.includes("ramatgan")) {
              return <CityLogo src="https://upload.wikimedia.org/wikipedia/commons/c/c5/Coat_of_arms_of_Ramat_Gan.svg" alt="Ramat Gan Logo" title="רמת גן" />;
            }
            // Ra'anana
            if (formData.city.includes("רעננה") || city.includes("raanana") || city.includes("ra'anana")) {
              return <CityLogo src="https://upload.wikimedia.org/wikipedia/commons/e/e9/Coat_of_arms_of_Raanana.svg" alt="Ra'anana Logo" title="רעננה" />;
            }
            // Ramat HaSharon
            if (formData.city.includes("רמת השרון") || formData.city.includes("רמת-השרון") || city.includes("ramat hasharon") || city.includes("ramathasharon")) {
              return <CityLogo src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Flag_of_Ramat_HaSharon.svg" alt="Ramat HaSharon Logo" title="רמת השרון" />;
            }
            return null;
          })()}
        </TopPanelTitleHolder>
        <TopPanelGroup>
          <IconOnlyButton onClick={() => router.back()} title="Back">
            {renderIcon(FaIcons.FaArrowLeft)}
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
        </TopPanelGroup>
      </TopPanel>
      <PageContent style={{ padding: "12px 0", overflow: "hidden" }}>
        {!formData ? (
          <EmptyStatePlaceholder msg="Project not found" />
        ) : (
          <MainLayout>
            <ChatSidebar>
              <ChatHeader>
                <ChatTitle>הודעות הפרויקט</ChatTitle>
              </ChatHeader>
              <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                <Chat projectId={id} />
              </div>
            </ChatSidebar>

            {/* Navigation Sidebar (Categories) */}
            <SecondSidebar>
              <SecondSidebarContent>
                <SidebarGroup>
                  <SidebarButton
                    active={activeCategory === "general"}
                    onClick={() => handleCategoryChange("general")}
                  >
                    מידע כללי
                  </SidebarButton>
                  <SidebarButton
                    active={activeCategory === "stages"}
                    onClick={() => handleCategoryChange("stages")}
                    disabled={!startWorkEnabled && !engCoordEnabled && !form4Enabled}
                  >
                    שלבי הפרויקט
                  </SidebarButton>
                </SidebarGroup>
              </SecondSidebarContent>
            </SecondSidebar>

            {/* Main Content Panel */}
            <ProjectPanel>
              <Card style={{ marginBottom: 0, flex: 1, height: "100%" }}>
                {/* Top Sub-Tabs */}
                {activeCategory === "general" && (
                  <Tabs
                    tabs={generalTabs}
                    activeTab={activeTab}
                    onTabChange={(tab) => setActiveTab(tab as any)}
                  />
                )}
                {activeCategory === "stages" && (
                  <Tabs
                    tabs={stageTabs}
                    activeTab={activeTab}
                    onTabChange={(tab) => setActiveTab(tab as any)}
                  />
                )}

                <TabContent>
                  {activeTab === "details" && (
                    <TabPane style={{ padding: 0 }}>
                      {renderProjectDetails()}
                    </TabPane>
                  )}
                
                {activeTab === "professionals" && (
                  <TabPane>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginBottom: "12px" }}>
                      <button
                        onClick={handleAddProfessional}
                        title="הוסף בעל מקצוע"
                        style={{ 
                          width: "30px",
                          height: "30px",
                          fontSize: "14px",
                          borderRadius: "6px",
                          border: "1px solid #e2e8f0",
                          backgroundColor: "#ffffff",
                          color: "#64748b",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <FaIcons.FaPlus />
                      </button>
                    </div>
                    {isLoadingProfessionals ? (
                      <p style={{ fontSize: "13px", color: "#666" }}>
                        טוען בעלי מקצוע...
                      </p>
                    ) : professionals.length === 0 ? (
                      <div
                        style={{
                          padding: "24px",
                          textAlign: "center",
                          backgroundColor: "#f8fafc",
                          borderRadius: "12px",
                          color: "#64748b",
                          fontSize: "14px",
                          border: "1px dashed #cbd5e1"
                        }}
                      >
                        אין בעלי מקצוע מצורפים לפרויקט
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                          gap: "12px",
                        }}
                      >
                        {professionals.map((professional) => (
                          <ProfessionalCard
                            key={professional.id}
                            style={{ 
                              border: "1px solid #e2e8f0", 
                              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                              padding: "12px",
                              borderRadius: "12px"
                            }}
                          >
                            <ProfessionalInfo style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
                              <Link
                                href={`/professionals/${professional.id}`}
                                passHref
                              >
                                <ProfessionalName
                                  style={{ fontSize: "15px", fontWeight: 700 }}
                                  title={professional.name}
                                >
                                  {professional.name}
                                </ProfessionalName>
                              </Link>
                              <ProfessionalType
                                style={{ color: "#64748b" }}
                                title={professional.professional_type}
                              >
                                {professional.professional_type}
                              </ProfessionalType>
                              <div style={{ marginTop: "8px" }}>
                                <StatusBadge status={professional.status}>
                                  {professional.status}
                                </StatusBadge>
                              </div>
                            </ProfessionalInfo>
                            <IconOnlyButton
                              onClick={() =>
                                handleRemoveProfessional(professional)
                              }
                              title="הסר בעל מקצוע"
                              style={{
                                margin: "0",
                                width: "32px",
                                height: "32px",
                                backgroundColor: "#fff1f2",
                                color: "#e11d48",
                                border: "none"
                              }}
                            >
                              {renderIcon(FaIcons.FaTrash, 14)}
                            </IconOnlyButton>
                          </ProfessionalCard>
                        ))}
                      </div>
                    )}
                  </TabPane>
                )}

                {activeTab === "team" && (
                  <TabPane>
                    <EditControls
                      isEditing={isEditingTeam}
                      onEdit={() => setIsEditingTeam(true)}
                      onSave={async () => {
                        await saveTeam(teamData);
                        setIsEditingTeam(false);
                      }}
                      onCancel={() => {
                        setIsEditingTeam(false);
                        loadTeamMembers();
                      }}
                      saving={saving}
                    />
                    {rolesLoading ? (
                      <div>טוען תפקידים...</div>
                    ) : (
                      <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", 
                        gap: "8px",
                        width: "100%",
                        alignContent: "start"
                      }}>
                        {teamRoles.map((member) => (
                          <Card key={member.key} style={{ 
                            marginBottom: 0, 
                            padding: "6px", 
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "none",
                            height: "auto"
                          }}>
                            <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "11px", marginBottom: 4 }}>
                              {member.label}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                              <ModernInput
                                style={{ height: "20px", padding: "2px 6px", fontSize: "10px", width: "100%" }}
                                value={teamData[member.key]?.name || ""}
                                onChange={(e) =>
                                  setTeamData((prev) => ({
                                    ...prev,
                                    [member.key]: {
                                      ...prev[member.key],
                                      name: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="שם מלא"
                                disabled={!isEditingTeam}
                              />
                              <ModernInput
                                style={{ height: "20px", padding: "2px 6px", fontSize: "10px", width: "100%" }}
                                value={teamData[member.key]?.phone || ""}
                                onChange={(e) =>
                                  setTeamData((prev) => ({
                                    ...prev,
                                    [member.key]: {
                                      ...prev[member.key],
                                      phone: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="טלפון"
                                disabled={!isEditingTeam}
                              />
                              <ModernInput
                                style={{ height: "20px", padding: "2px 6px", fontSize: "10px", width: "100%" }}
                                value={teamData[member.key]?.email || ""}
                                onChange={(e) =>
                                  setTeamData((prev) => ({
                                    ...prev,
                                    [member.key]: {
                                      ...prev[member.key],
                                      email: e.target.value,
                                    },
                                  }))
                                }
                                placeholder={'דוא"ל'}
                                disabled={!isEditingTeam}
                              />
                              <ModernInput
                                style={{ height: "20px", padding: "2px 6px", fontSize: "10px", width: "100%" }}
                                value={teamData[member.key]?.address || ""}
                                onChange={(e) =>
                                  setTeamData((prev) => ({
                                    ...prev,
                                    [member.key]: {
                                      ...prev[member.key],
                                      address: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="כתובת"
                                disabled={!isEditingTeam}
                              />
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabPane>
                )}

                {activeTab === "documents" && (
                  <TabPane>
                    <FileArea
                      files={generalFiles}
                      disabled={false}
                      onDelete={handleFileDelete}
                      onPreview={handleFilePreview}
                      onDownloadVersion={handleVersionDownload}
                      onUploadGeneral={handleUploadGeneralFile}
                    />
                  </TabPane>
                )}

                {/* Contextual Area for Stages */}
                {(["start_work", "eng_coord", "form4"].includes(activeTab)) && (
                  <TabPane>
                    {activeTab === "start_work" ? (
                      <FileArea
                        files={stageFiles}
                        disabled={false}
                        onUpload={handleFileUpload}
                        onDelete={handleFileDelete}
                        onPreview={handleFilePreview}
                        onAutoFill={handleAutoFill}
                        onDownloadVersion={handleVersionDownload}
                        isAutoFill={true}
                        autoFillingDocId={autoFillingDocId}
                        onDownloadAll={handleDownloadAllFiles}
                        onEmailAll={handleEmailAllFiles}
                        downloadAllDisabled={stageFiles.filter((f: FileAreaDocument) => f.state === DocumentState.UPLOADED).length === 0}
                        emailAllDisabled={stageFiles.filter((f: FileAreaDocument) => f.status === DocumentState.FILLED).length === 0}
                      />
                    ) : activeTab === "eng_coord" ? (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, minmax(240px, 1fr))",
                          gap: "16px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          padding: "16px",
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <CompactField>
                            <CompactLabel>סטטוס תיאום</CompactLabel>
                            <ModernInput
                              value={engCoordForm.status}
                              onChange={(e) =>
                                setEngCoordForm((prev) => ({ ...prev, status: e.target.value }))
                              }
                              placeholder="לדוגמה: בתהליך / נשלח / הושלם"
                            />
                          </CompactField>
                          <CompactField>
                            <CompactLabel>תאריך יעד</CompactLabel>
                            <ModernInput
                              type="date"
                              value={engCoordForm.target_date}
                              onChange={(e) =>
                                setEngCoordForm((prev) => ({ ...prev, target_date: e.target.value }))
                              }
                            />
                          </CompactField>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <CompactField>
                            <CompactLabel>איש קשר</CompactLabel>
                            <ModernInput
                              value={engCoordForm.contact_name}
                              onChange={(e) =>
                                setEngCoordForm((prev) => ({ ...prev, contact_name: e.target.value }))
                              }
                              placeholder="שם איש הקשר"
                            />
                          </CompactField>
                          <CompactField>
                            <CompactLabel>טלפון איש קשר</CompactLabel>
                            <ModernInput
                              value={engCoordForm.contact_phone}
                              onChange={(e) =>
                                setEngCoordForm((prev) => ({ ...prev, contact_phone: e.target.value }))
                              }
                              placeholder="לדוגמה: 050-1234567"
                            />
                          </CompactField>
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                          <CompactField>
                            <CompactLabel>הערות</CompactLabel>
                            <ModernTextArea
                              value={engCoordForm.notes}
                              onChange={(e) =>
                                setEngCoordForm((prev) => ({ ...prev, notes: e.target.value }))
                              }
                              placeholder="הוסף הערות/משימות לתיאום ההנדסי"
                              style={{ minHeight: "80px" }}
                            />
                          </CompactField>
                        </div>
                        <div style={{ gridColumn: "span 2", marginTop: "8px" }}>
                          <h4 style={{ margin: "0 0 8px 0", color: "#1f2937" }}>מסמכי תיאום הנדסי</h4>
                          <FileArea
                            files={stageFiles}
                            disabled={false}
                            onUpload={handleFileUpload}
                            onDelete={handleFileDelete}
                            onPreview={handleFilePreview}
                            onAutoFill={handleAutoFill}
                            onDownloadVersion={handleVersionDownload}
                            isAutoFill={false}
                            autoFillingDocId={autoFillingDocId}
                          />
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                        <p style={{ color: "#64748b", marginBottom: "20px", fontWeight: 600 }}>שלב זה נמצא כרגע בתהליך איפיון. להלן שדות לדוגמה:</p>
                        <CompactFormGrid>
                          <CompactField>
                            <CompactLabel>סטטוס טופס</CompactLabel>
                            <ModernInput disabled placeholder="PLACEHOLDER - סטטוס נוכחי" />
                          </CompactField>
                          <CompactField>
                            <CompactLabel>תאריך יעד משוער</CompactLabel>
                            <ModernInput type="date" disabled />
                          </CompactField>
                          <CompactField>
                            <CompactLabel>איש קשר לביצוע</CompactLabel>
                            <ModernInput disabled placeholder="PLACEHOLDER - שם איש קשר" />
                          </CompactField>
                          <div style={{ gridColumn: "span 3" }}>
                            <CompactField>
                              <CompactLabel>הערות ומשימות לביצוע</CompactLabel>
                              <ModernTextArea disabled placeholder="PLACEHOLDER - כאן יופיעו הערות ומשימות הקשורות לשלב זה..." />
                            </CompactField>
                          </div>
                        </CompactFormGrid>
                      </div>
                    )}
                  </TabPane>
                )}
                </TabContent>
              </Card>
            </ProjectPanel>
          </MainLayout>
        )}
        <DeletionDialog
          isOpen={isDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          message={`האם אתה בטוח שברצונך למחוק את הפרויקט ${formData?.name}?`}
          isDeleting={isDeleting}
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
            existingProfessionalIds={professionals.map((p) => p.id)}
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

        {/* Email Dialog */}
        <EmailDialog
          isOpen={isEmailDialogOpen}
          onClose={() => setIsEmailDialogOpen(false)}
          onSend={handleSendEmail}
          defaultRecipientEmail={getPermitOwnerEmail()}
          defaultSubject={
            process.env.NEXT_PUBLIC_FILLED_PROJECT_DOCUMENTS_EMAIL_SUBJECT
          }
          defaultBody={
            process.env.NEXT_PUBLIC_FILLED_PROJECT_DOCUMENTS_EMAIL_BODY
          }
          isSending={isSendingEmail}
        />
      </PageContent>
    </PageContainer>
  );
};

export default ProjectView;
