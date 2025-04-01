export interface ApiSurvey {
  survey_name: string;
  survey_date: string;
  survey_file_name: string;
  survey_project_id: string;
  representative_score?: number | null;
  total_respondents?: number | null;
  panel_name?: string;
  margin_of_error?: number | null;
  survey_score?: number | null;
  survey_respondents?: number | null;
  representative_data?: {
    [category: string]: {
      expected: number;
      actual: number;
      deviation: number;
      difference_score: number;
    };
  };
}

export interface Survey {
  id: string;
  surveyName: string;
  date: string;
  fileName: string;
  status: string;
}

export interface User {
  id: string;
  email: string;
  roles: string[];
}

export interface SurveyAccess {
  email: string;
  access_type: 'editor' | 'viewer';
}

export interface SurveyData {
  id: string;
  survey_name: string;
  survey_date: string;
  survey_file_name: string;
  survey_report: string | null;
  survey_bi_data?: string | null;
  num_of_responded: number | null;
  num_of_questions: number | null;
  csv_overtime_data?: any[];
  csv_data?: string;
  segmentation?: string[];
  questions?: string[];
  question_ids?: string[];
  bi_embeded_link?: string;
  statistics?: {
    [key: string]: any;
  };
  access: SurveyAccess[];
  representative_score?: number | null;
  representative_data?: any | null;
  comparison_data?: any | null;
  margin_of_error?: number | null;
  panel_name?: string | null;
}
