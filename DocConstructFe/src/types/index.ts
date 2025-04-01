export enum ProjectStatus {
  PRE_PERMIT = 'PRE_PERMIT',
  POST_PERMIT = 'POST_PERMIT',
  FINAL = 'FINAL'
}

export interface Project {
  project_id: string;
  project_name: string;
  project_case_id: string;
  project_description?: string;
  project_address: string;
  project_due_date?: string;
  project_status: ProjectStatus;
  project_status_due_date?: string;
  created_at: string;
} 