import axios from 'axios';
import {Professional, Project, ProjectCreationFormData, DocumentState} from "./types";
import {ProfessionalCreationFormData} from "./components/professionals/ProfessionalCreationDialog";

// Use the direct API URL from environment variables if available
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api';

// Projects API
export const getProjects = async (): Promise<Project[]> => {
  const response = await axios.get(
    `${API_URL}/projects`,
  );
  return response.data.projects
};

export const getProjectById = async (projectId: string): Promise<Project> => {
  const response = await axios.get(
    `${API_URL}/project`,
    {
      params: {
        project_id: projectId
      }
    }
  );
  return response.data.project;
};

export const createProject = async (data: ProjectCreationFormData): Promise<Project> => {
  const response = await axios.post(
    `${API_URL}/project`,
    data
  );
  return response.data;
};

export const updateProject = async (data: Project): Promise<Project> => {
  const { documents, professionals, permit_owner_data, ...rest } = data; // exclude 'documents' and extract permit_owner_data
  
  // Prepare the data for the backend
  const requestData = {
    ...rest,
    // If permit_owner_data exists, use its name as permit_owner
    permit_owner: permit_owner_data ? permit_owner_data.name : rest.permit_owner || rest.permit_owner_name
  };
  
  const response = await axios.put(
    `${API_URL}/project`,
    requestData
  );
  return response.data;
};

export const deleteProject = async (id: string) => {
  const response = await axios.delete(
    `${API_URL}/project`,
    {params: {project_id: id}}
  );
  return response.data;
};

export const getProjectStatuses = async (): Promise<string[]> => {
  const response = await axios.get(
    `${API_URL}/project/statuses`
  );
  return response.data.statuses;
}

// Professionals API
export const getProfessionals = async (): Promise<Professional[]> => {
  const response = await axios.get(
    `${API_URL}/professionals`
  );
  return response.data.professionals;
};

export const getProfessionalById = async (professional_id: string): Promise<Professional> => {
  const response = await axios.get(
    `${API_URL}/professional`,
    {
      params: {
        professional_id
      }
    }
  );
  return response.data.professional;
};

export const createProfessional = async (data: ProfessionalCreationFormData): Promise<Professional> => {
  const response = await axios.post(
    `${API_URL}/professional`,
    data
  );
  return response.data;
};

export const updateProfessional = async (data: Professional): Promise<Professional> => {
  const { documents, ...rest } = data; // exclude 'documents'
  const response = await axios.put(
    `${API_URL}/professional`,
    rest,
  );
  return response.data;
};

export const deleteProfessional = async (professionalId: string ): Promise<null> => {
  const response = await axios.delete(
    `${API_URL}/professional`,
    {
      params: {
        professional_id: professionalId
      }
    }
  );
  return response.data;
};

export async function getProfessionalTypes(): Promise<string[]> {
  const response = await axios.get(
    `${API_URL}/professional/types`
  );
  return response.data.types;
}

export async function getProfessionalStatuses(): Promise<string[]> {
  const response = await axios.get(
    `${API_URL}/professional/statuses`
  );
  return response.data.statuses
}

// Project-Professional Relationship API
export const addProfessionalToProject = async (data: {
  project_id: string;
  professional_id: string;
}) => {
  const response = await axios.post(
    `${API_URL}/project/professionals`,
    data
  );
  return response.data;
};

export const removeProfessionalFromProject = async (data: {
  project_id: string;
  professional_id: string;
}) => {

    const response = await axios.delete(
      `${API_URL}/project/professionals`,
      {
        data,
      }
    );
    return response.data;
};

export const uploadProfessionalDocument = async (
  professionalId: string,
  documentType: string,
  documentName: string,
  file: File
) => {
  const formData = new FormData();
  formData.append('professional_id', professionalId);
  formData.append('document_type', documentType);
  formData.append('document_name', documentName);
  formData.append('file', file);

  const response = await axios.post(
    `${API_URL}/professional/document`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data;
};

export const downloadProfessionalDocument = async (professionalId: string, documentId: string) => {
  const response = await axios.get(
    `${API_URL}/professional/document`,
    {
      params: {
        professional_id: professionalId,
        document_id: documentId
      },
      responseType: 'blob'
    }
  );
  return response.data;
};

export const deleteProfessionalDocument = async (professionalId: string, documentId: string) => {
  const response = await axios.delete(
    `${API_URL}/professional/document`,
    {
      params: {
        professional_id: professionalId,
        document_id: documentId
      }
    }
  );
  return response.data;
};

export const getProfessionalDocumentTypes = async (): Promise<string[]> => {
  const response = await axios.get(
    `${API_URL}/professional/document/types`
  );
  console.log(response.data.document_types);
  return response.data.document_types;
};

export const importProfessionalData = async (file: File): Promise<ProfessionalCreationFormData> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    `${API_URL}/professional/import`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data;
};

// Project Documents API
export const uploadProjectDocument = async (
  projectId: string,
  documentType: string,
  documentName: string,
  file: File,
  status: string = DocumentState.UPLOADED
) => {
  const formData = new FormData();
  formData.append('project_id', projectId);
  formData.append('document_type', documentType);
  formData.append('document_name', documentName);
  formData.append('file', file);
  
  // Send the status directly from the DocumentState enum
  formData.append('status', status);

  const response = await axios.post(
    `${API_URL}/project/document`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data;
};

export const downloadProjectDocument = async (projectId: string, documentId: string) => {
  const response = await axios.get(
    `${API_URL}/project/document`,
    {
      params: {
        project_id: projectId,
        document_id: documentId
      },
      responseType: 'blob'
    }
  );
  return response.data;
};

export const deleteProjectDocument = async (projectId: string, documentId: string) => {
  const response = await axios.delete(
    `${API_URL}/project/document`,
    {
      params: {
        project_id: projectId,
        document_id: documentId
      }
    }
  );
  return response.data;
};

export const getProjectDocumentTypes = async (): Promise<string[]> => {
  const response = await axios.get(
    `${API_URL}/project/document/types`
  );
  return response.data.document_types;
};
