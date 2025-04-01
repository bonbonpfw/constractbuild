// Types for the Permit Management System

// Authentication Types
export interface User {
  id: string;
  email: string;
}

// Professional Types
export enum ProfessionalStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

export interface ProfessionalType {
  type_id: number;
  type_name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Professional {
  professional_id: number;
  name: string;
  license_number: string;
  professional_type_id: number;
  email: string;
  phone: string;
  address?: string;
  status: ProfessionalStatus;
  created_at?: string;
  updated_at?: string;
  professional_type?: ProfessionalType;
}

// Municipality Types
export interface Municipality {
  municipality_id: number;
  name: string;
  state?: string;
  county?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}

// Document Types
export interface DocumentTemplate {
  template_id: number;
  template_name: string;
  professional_type_id?: number;
  municipality_id?: number;
  file_id: number;
  created_at?: string;
  updated_at?: string;
  professional_type?: ProfessionalType;
  file?: File;
}

export interface File {
  file_id: number;
  entity_type: string;
  entity_id: number;
  file_path: string;
  file_type: string;
  file_name: string;
  file_size: number;
  created_at?: string;
  updated_at?: string;
}

export interface GeneratedDocument {
  document_id: number;
  project_id: number;
  template_id: number;
  professional_id?: number;
  file_id: number;
  created_at?: string;
  updated_at?: string;
  project?: Project;
  template?: DocumentTemplate;
  professional?: Professional;
  file?: File;
}

// Project Types
export enum ProjectStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed'
}

export interface Project {
  project_id: number;
  name: string;
  description?: string;
  address: string;
  municipality_id: number;
  status?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
  municipality?: Municipality;
  professional_associations?: ProjectProfessional[];
  generated_documents?: GeneratedDocument[];
}

export interface ProjectProfessional {
  pp_id: number;
  project_id: number;
  professional_id: number;
  role?: string;
  document_id?: number;
  created_at?: string;
  updated_at?: string;
  professional?: Professional;
  project?: Project;
  document?: File;
}

// Form related types
export interface FormField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  value?: any;
}

export interface FormTemplate {
  id: number;
  name: string;
  fields: FormField[];
  municipality_id: number;
  professional_type_id: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface LoginResponse {
  access_token: string;
  user_id: string;
  email: string;
}
