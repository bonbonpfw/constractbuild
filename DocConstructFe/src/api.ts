import axios from "axios";
import {
  Professional,
  Project,
  ProjectCreationFormData,
  DocumentState,
} from "./types";
import { ProfessionalCreationFormData } from "./components/professionals/ProfessionalCreationDialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api";

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZTk0NDk2MDgtNGQ2OC00Nzc1LWJmOWMtOWU5NWUyZWU3MGU3IiwiZXhwIjoxNzY0MjcyNDgwfQ.aEny_rCFjGapf1z1v7v0oWV9ZMMehII-h-YPUZC2EBU";

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${TOKEN}`;

// Projects API

export const getProjects = async (): Promise<Project[]> => {
  const response = await axios.get(`${API_URL}/projects`);
  return response.data.projects;
};

export const getProjectById = async (projectId: string): Promise<Project> => {
  const response = await axios.get(`${API_URL}/project`, {
    params: {
      project_id: projectId,
    },
  });
  return response.data.project;
};

export const createProject = async (
  data: ProjectCreationFormData,
): Promise<Project> => {
  const response = await axios.post(`${API_URL}/project`, data);
  return response.data;
};

export const updateProject = async (data: Project): Promise<Project> => {
  const { documents, professionals, team_members, ...rest } = data; // exclude 'documents', 'professionals', and 'team_members'

  const response = await axios.put(`${API_URL}/project`, rest);
  return response.data;
};

export const deleteProject = async (id: string) => {
  // Based on the backend code at DocConstructBe/app/routes.py:45-47
  // DELETE requests are processed using request.args.to_dict()
  // This means the project_id should be sent as a URL parameter
  console.log(`Starting deleteProject API call with ID: ${id}`);
  try {
    const response = await axios.delete(`${API_URL}/project`, {
      params: { project_id: id },
    });
    console.log(`deleteProject API call successful:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`deleteProject API call failed:`, error);
    throw error;
  }
};

export const getProjectStatuses = async (): Promise<string[]> => {
  const response = await axios.get(`${API_URL}/project/statuses`);
  return response.data.statuses;
};

export const getProjectCities = async (): Promise<
  { value: string; name: string }[]
> => {
  const response = await axios.get(`${API_URL}/project/cities`);
  return response.data.cities;
};

// Professionals API
export const getProfessionals = async (): Promise<Professional[]> => {
  const response = await axios.get(`${API_URL}/professionals`);
  return response.data.professionals;
};

export const getProfessionalById = async (
  professional_id: string,
): Promise<Professional> => {
  const response = await axios.get(`${API_URL}/professional`, {
    params: {
      professional_id,
    },
  });
  return response.data.professional;
};

export const createProfessional = async (
  data: ProfessionalCreationFormData,
): Promise<Professional> => {
  const response = await axios.post(`${API_URL}/professional`, data);
  return response.data;
};

export const updateProfessional = async (
  data: Professional,
): Promise<Professional> => {
  const { documents, ...rest } = data; // exclude 'documents'
  const response = await axios.put(`${API_URL}/professional`, rest);
  return response.data;
};

export const deleteProfessional = async (
  professionalId: string,
): Promise<null> => {
  const response = await axios.delete(`${API_URL}/professional`, {
    params: {
      professional_id: professionalId,
    },
  });
  return response.data;
};

export async function getProfessionalTypes(): Promise<string[]> {
  const response = await axios.get(`${API_URL}/professional/types`);
  return response.data.types;
}

export async function getProfessionalStatuses(): Promise<string[]> {
  const response = await axios.get(`${API_URL}/professional/statuses`);
  return response.data.statuses;
}

// Project-Professional Relationship API
export const addProfessionalToProject = async (data: {
  project_id: string;
  professional_id: string;
}) => {
  const response = await axios.post(`${API_URL}/project/professionals`, data);
  return response.data;
};

export const removeProfessionalFromProject = async (data: {
  project_id: string;
  professional_id: string;
}) => {
  const response = await axios.delete(`${API_URL}/project/professionals`, {
    data,
  });
  return response.data;
};

export const uploadProfessionalDocument = async (
  professionalId: string,
  documentType: string,
  documentName: string,
  file: File,
) => {
  const formData = new FormData();
  formData.append("professional_id", professionalId);
  formData.append("document_type", documentType);
  formData.append("document_name", documentName);
  formData.append("file", file);

  const response = await axios.post(
    `${API_URL}/professional/document`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export const downloadProfessionalDocument = async (
  professionalId: string,
  documentId: string,
) => {
  const response = await axios.get(`${API_URL}/professional/document`, {
    params: {
      professional_id: professionalId,
      document_id: documentId,
    },
    responseType: "blob",
  });
  return response.data;
};

export const deleteProfessionalDocument = async (
  professionalId: string,
  documentId: string,
) => {
  const response = await axios.delete(`${API_URL}/professional/document`, {
    params: {
      professional_id: professionalId,
      document_id: documentId,
    },
  });
  return response.data;
};

export const getProfessionalDocumentTypes = async (): Promise<string[]> => {
  const response = await axios.get(`${API_URL}/professional/document/types`);
  console.log(response.data.document_types);
  return response.data.document_types;
};

export const importProfessionalData = async (
  file: File,
): Promise<ProfessionalCreationFormData> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `${API_URL}/professional/import`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

// Project Documents API
export const uploadProjectDocument = async (
  projectId: string,
  documentType: string,
  documentName: string,
  file: File,
  status: string = DocumentState.UPLOADED,
  mode?: "auto" | "manual",
  city?: string,
) => {
  const formData = new FormData();
  formData.append("project_id", projectId);
  formData.append("document_type", documentType);
  formData.append("document_name", documentName);
  formData.append("file", file);

  // Send the status directly from the DocumentState enum
  formData.append("status", status);
  if (mode) {
    formData.append("mode", mode);
  }
  if (city) {
    formData.append("city", city);
  }
  const response = await axios.post(`${API_URL}/project/document`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const downloadProjectDocument = async (
  projectId: string,
  documentId: string,
) => {
  const response = await axios.get(`${API_URL}/project/document`, {
    params: {
      project_id: projectId,
      document_id: documentId,
    },
    responseType: "blob",
  });
  return response.data;
};

export const deleteProjectDocument = async (
  projectId: string,
  documentId: string,
  status: string,
) => {
  const response = await axios.delete(`${API_URL}/project/document`, {
    params: {
      project_id: projectId,
      document_id: documentId,
      status: status,
    },
  });
  return response.data;
};

export const getProjectDocumentTypes = async (
  city: string,
): Promise<string[]> => {
  const response = await axios.get(`${API_URL}/project/document/types`, {
    params: {
      city: city,
    },
  });
  return response.data.document_types;
};

export const getProjectTeamRoles = async (): Promise<
  { value: string; name: string }[]
> => {
  const response = await axios.get(`${API_URL}/project/team/roles`);
  return response.data.roles;
};

export const getProjectTeamMembers = async (projectId: string) => {
  const response = await axios.get(`${API_URL}/project/teams`, {
    params: { project_id: projectId },
  });
  return response.data.teams;
};

export const createProjectTeamMember = async (data: any) => {
  const response = await axios.post(`${API_URL}/project/teams`, data);
  return response.data;
};

export const updateProjectTeamMember = async (data: any) => {
  const response = await axios.put(`${API_URL}/project/teams`, data);
  return response.data;
};

export const deleteProjectTeamMember = async (id: string) => {
  const response = await axios.delete(`${API_URL}/project/teams`, {
    data: { id },
  });
  return response.data;
};

// Auto fill document
export const autoFillDocument = async (
  projectId: string,
  documentId: string,
  documentType: string,
  file: File,
  city: string,
) => {
  const formData = new FormData();
  formData.append("project_id", projectId);
  formData.append("document_id", documentId);
  formData.append("document_type", documentType);
  formData.append("file", file);
  formData.append("city", city);

  const response = await axios.put(`${API_URL}/project/document`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const login = async (username: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/token`, {
    username,
    password,
  });
  return response.data;
};
