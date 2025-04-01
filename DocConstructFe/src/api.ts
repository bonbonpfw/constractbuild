import axios, {AxiosResponse} from 'axios';
import {ApiSurvey, SurveyAccess, SurveyData, User} from "./types";
import Cookies from "js-cookie";

// Add this at the top of the file
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Use the direct API URL from environment variables if available
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Configure Axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

// Add this function to get headers with auth token
const getHeaders = (): { [key: string]: string } => {
  const token = Cookies.get('accessToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Projects API
export const createProject = async (data: {
  project_name: string;
  project_description?: string;
  project_address: string;
  project_case_id: string;
  project_date: string;
  project_status_id: string;
  project_docs_path?: string;
}) => {
  try {
    const response = await axios.post(`${API_URL}/create_project`, data, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const updateProject = async (data: {
  project_id: string;
  project_name?: string;
  project_description?: string;
  project_address?: string;
  project_case_id?: string;
  project_date?: string;
  project_status_id?: string;
  project_docs_path?: string;
}) => {
  try {
    const response = await axios.post(`${API_URL}/update_project`, data, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (data: { project_id: string }) => {
  try {
    const response = await axios.post(`${API_URL}/delete_project`, data, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

export const getProjects = async () => {
  try {
    const response = await axios.get(`${API_URL}/projects`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const getProjectById = async (project_id: string) => {
  try {
    const response = await axios.get(`${API_URL}/projects/${project_id}`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};

// Professionals API
export const createProfessional = async (data: {
  proffsional_name: string;
  proffsional_email: string;
  proffsional_phone: string;
  proffsional_address: string;
  proffsional_license_number: string;
  proffsional_license_expiration_date: string;
  proffsional_type: string;
  proffsional_status: string;
  proffsional_state_id: string;
}) => {
  try {
    const response = await axios.post(`${API_URL}/create_proffsional`, data, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating professional:', error);
    throw error;
  }
};

export const createProfessionalFromFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/create_proffsional_from_file`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating professional from file:', error);
    throw error;
  }
};

export const updateProfessional = async (data: {
  professional_id: string;
  proffsional_name?: string;
  proffsional_email?: string;
  proffsional_phone?: string;
  proffsional_address?: string;
  proffsional_license_number?: string;
  proffsional_license_expiration_date?: string;
  proffsional_type?: string;
  proffsional_status?: string;
  proffsional_state_id?: string;
}) => {
  try {
    const response = await axios.post(`${API_URL}/update_proffsional`, data, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating professional:', error);
    throw error;
  }
};

export const deleteProfessional = async (data: { professional_id: string }) => {
  try {
    const response = await axios.post(`${API_URL}/delete_proffsional`, data, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting professional:', error);
    throw error;
  }
};

export const getProfessionals = async () => {
  try {
    const response = await axios.get(`${API_URL}/proffsionals`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching professionals:', error);
    throw error;
  }
};

export const getProfessionalById = async (professional_id: string) => {
  try {
    const response = await axios.get(`${API_URL}/proffsionals/${professional_id}`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching professional:', error);
    throw error;
  }
};

// Documents API
export const uploadDocument = async (data: {
  project_id: string;
  professional_id: string;
  document_type: string;
  file: File;
}) => {
  try {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('project_id', data.project_id);
    formData.append('professional_id', data.professional_id);
    formData.append('document_type', data.document_type);
    
    const response = await axios.post(`${API_URL}/documents/upload`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

export const downloadDocument = async (document_id: string) => {
  try {
    const response = await axios.get(`${API_URL}/documents/download/${document_id}`, {
      headers: getHeaders(),
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
};

export const deleteDocument = async (data: {
  project_id: string;
  document_id: string;
}) => {
  try {
    const response = await axios.delete(`${API_URL}/documents/delete`, {
      headers: getHeaders(),
      data
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

export const getDocuments = async (project_id?: string) => {
  try {
    const response = await axios.get(`${API_URL}/documents`, {
      headers: getHeaders(),
      params: project_id ? { project_id } : undefined
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
};

export const getDocumentType = async (document_id: string) => {
  try {
    const response = await axios.get(`${API_URL}/document/get_document_type/${document_id}`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching document type:', error);
    throw error;
  }
};

// Project-Professional Relationship API
export const addProfessionalToProject = async (data: {
  project_id: string;
  professional_id: string;
}) => {
  try {
    const response = await axios.post(`${API_URL}/project/add_proffsional_to_project`, data, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error adding professional to project:', error);
    throw error;
  }
};

export const removeProfessionalFromProject = async (data: {
  project_id: string;
  professional_id: string;
}) => {
  try {
    const response = await axios.post(`${API_URL}/project/remove_proffsional_from_project`, data, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error removing professional from project:', error);
    throw error;
  }
};

// Municipalities API
export const getMunicipalities = async () => {
  try {
    const response = await axios.get(`${API_URL}/municipalities`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching municipalities:', error);
    throw error;
  }
};

export const getMunicipalityById = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/municipalities/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching municipality with id ${id}:`, error);
    throw error;
  }
};

export const createMunicipality = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/municipalities`, data, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating municipality:', error);
    throw error;
  }
};

export const updateMunicipality = async (id: number, data: any) => {
  try {
    const response = await axios.put(`${API_URL}/municipalities/${id}`, data, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating municipality with id ${id}:`, error);
    throw error;
  }
};

export const deleteMunicipality = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/municipalities/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting municipality with id ${id}:`, error);
    throw error;
  }
};

// Documents API
export const getDocumentTemplates = async () => {
  try {
    const response = await axios.get(`${API_URL}/documents/templates`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching document templates:', error);
    throw error;
  }
};

export const getDocumentTemplateById = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/document-templates/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching document template with id ${id}:`, error);
    throw error;
  }
};

export const createDocumentTemplate = async (data: FormData) => {
  try {
    const response = await axios.post(`${API_URL}/documents/templates`, data, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating document template:', error);
    throw error;
  }
};

export const updateDocumentTemplate = async (id: number, data: FormData) => {
  try {
    const response = await axios.put(`${API_URL}/documents/templates/${id}`, data, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating document template with id ${id}:`, error);
    throw error;
  }
};

export const deleteDocumentTemplate = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/documents/templates/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting document template with id ${id}:`, error);
    throw error;
  }
};

export const downloadFile = async (fileId: number) => {
  try {
    const response = await axios.get(`${API_URL}/documents/files/${fileId}`, {
      responseType: 'blob',
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error(`Error downloading file with id ${fileId}:`, error);
    throw error;
  }
};

// Projects API
export const get_all_projects = async () => {
  try {
    const response = await axios.get(`${API_URL}/projects`, {
      headers: getHeaders(),
      params: {
        include_professionals: true,
        include_municipalities: true,
        include_documents: true
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all projects data:', error);
    throw error;
  }
};

export const getProjectProfessionals = async (projectId: number) => {
  try {
    const response = await axios.get(`${API_URL}/projects/${projectId}/professionals`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching professionals for project with id ${projectId}:`, error);
    throw error;
  }
};

export const generateDocument = async (projectId: number, data: any) => {
  try {
    const response = await axios.post(`${API_URL}/projects/${projectId}/generate`, data, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error(`Error generating document for project with id ${projectId}:`, error);
    throw error;
  }
};

// Authentication API functions
export async function apiLogin(
  email: string,
  password: string
): Promise<
  AxiosResponse<{
    access_token: string;
    user_id: string;
    email: string;
  }>
> {
  return axios.post(`${API_URL}/auth/login`, {
    email: email,
    password: password
  }, {
    withCredentials: true
  });
}

export async function apiValidateToken(): Promise<AxiosResponse> {
  return axios({
    method: 'get',
    headers: getHeaders(),
    url: `${API_URL}/auth/profile`,
  });
}

export async function apiChangePassword(
  currentPassword: string,
  newPassword: string
): Promise<AxiosResponse> {
  return axios({
    method: 'post',
    headers: getHeaders(),
    url: `${API_URL}/auth/change-password`,
    data: {
      current_password: currentPassword,
      new_password: newPassword
    },
  });
}