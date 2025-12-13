export interface Therapist {
  id: number;
  name: string;
  specialty: string | null;
}

export interface Patient {
  id: number;
  name: string;
  dob: string | null;
}

export type SessionStatus = 'Scheduled' | 'Completed' | 'Canceled' | 'No Show';

export interface Session {
  id: number;
  therapist_id: number;
  patient_id: number;
  date: string;
  status: SessionStatus;
  therapist_name?: string;
  patient_name?: string;
}

export interface SessionWithRelations extends Session {
  therapist_name: string;
  patient_name: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

