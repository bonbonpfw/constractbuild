// Types for the Permit Management System

// Professional Types
export enum ProfessionalStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PENDING = 'Pending'
}

export interface ProfessionalType {
  value: string;
  label: string;
  description?: string;
}

export interface Professional {
  id: string;
  name: string;
  national_id: string;
  email: string;
  phone: string;
  license_number: string;
  license_expiration_date: string;
  professional_type: string;
  address: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  documents?: ProfessionalDocument[];
}

export interface ProfessionalDocument {
  id: string;
  professional_id: string;
  document_type: string;
  name: string;
  file_path: string;
  status: string;
  created_at: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  document_type: string;
  name: string;
  file_path: string;
  status: string;
  created_at: string;
}

// Project Types
export enum ProjectStatus {
  PRE_PERMIT = 'Pre permit',
  POST_PERMIT = 'Post permit',
  FINAL = 'Final'
}

export interface Project {
  id: string;
  name?: string;
  description?: string;
  address?: string;
  case_id?: string;
  due_date?: string;
  status_due_date?: string;
  status?: string;
  professionals: Professional[];
  documents?: ProjectDocument[];
}

export interface ProjectCreationFormData extends Omit<Project, 'id'> {}
