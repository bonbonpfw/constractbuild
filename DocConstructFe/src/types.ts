// Types for the Permit Management System

// Professional Types
export enum ProfessionalStatus {
  ACTIVE = 'Active',
  WARNING = 'Warning',
  EXPIRED = 'Expired'
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

// Permit Owner Data
export interface PermitOwnerData {
  name: string;
  address: string;
  phone: string;
  email?: string;
}

// Project Types
export enum ProjectStatus {
  PRE_PERMIT = 'Pre permit',
  POST_PERMIT = 'Post permit',
  FINAL = 'Final'
}

export enum DocumentState {
  PENDING = 'Pending',
  SIGNED = 'Signed',
  DELIVERED = 'Delivered',
  MISSING = 'Missing',
  UPLOADED = 'Uploaded'
}

export interface Project {
  id: string;
  name: string;
  request_number: string;
  permit_number: string;
  construction_supervision_number: string;
  engineering_coordinator_number: string;
  firefighting_number: string;
  description: string;
  permit_owner: string;
  permit_owner_name?: string;
  permit_owner_address?: string;
  permit_owner_phone?: string;
  permit_owner_email?: string;
  permit_owner_data?: PermitOwnerData;
  status_due_date?: string;
  status?: string;
  is_warning?: boolean;
  is_expired?: boolean;
  professionals: Professional[];
  documents?: ProjectDocument[];
}

export interface ProjectCreationFormData extends Omit<Project, 'id'> {}
