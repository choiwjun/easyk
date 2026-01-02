export interface Job {
  id: string;
  posted_by: string;
  position: string;
  company_name: string;
  company_phone: string | null;
  company_address: string | null;
  location: string;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'temporary';
  salary_range: string | null;
  salary_currency: string | null;
  description: string;
  requirements: string | null;
  preferred_qualifications: string | null;
  benefits: string | null;
  required_languages: string[] | null;
  status: 'active' | 'closed' | 'expired' | 'draft';
  deadline: string;
  created_at: string;
  updated_at: string;
}

export interface JobDetail extends Job {
  has_applied: boolean;
}

export interface JobCreate {
  position: string;
  company_name: string;
  company_phone?: string;
  company_address?: string;
  location: string;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'temporary';
  salary_range?: string;
  salary_currency?: string;
  description: string;
  requirements?: string;
  preferred_qualifications?: string;
  benefits?: string;
  required_languages?: string[];
  status?: 'active' | 'closed' | 'expired' | 'draft';
  deadline: string;
}

export interface JobUpdate {
  position?: string;
  company_name?: string;
  company_phone?: string;
  company_address?: string;
  location?: string;
  employment_type?: 'full-time' | 'part-time' | 'contract' | 'temporary';
  salary_range?: string;
  salary_currency?: string;
  description?: string;
  requirements?: string;
  preferred_qualifications?: string;
  benefits?: string;
  required_languages?: string[];
  status?: 'active' | 'closed' | 'expired' | 'draft';
  deadline?: string;
}

export interface ApplicantInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  nationality: string | null;
}

export interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  status: 'applied' | 'in_review' | 'accepted' | 'rejected';
  cover_letter: string | null;
  resume_url: string | null;
  reviewer_comment: string | null;
  applied_at: string;
  reviewed_at: string | null;
  updated_at: string;
}

export interface JobApplicationWithApplicant extends JobApplication {
  applicant: ApplicantInfo;
}
