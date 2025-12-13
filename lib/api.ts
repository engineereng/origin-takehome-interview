import type {
  SessionWithRelations,
  PaginatedResponse,
  ApiError,
  Therapist,
  Patient,
} from './types';
import type { CreateSessionInput, UpdateSessionInput } from './validations';

const API_BASE = '/api/sessions';

export async function getSessions(params?: {
  status?: string;
  therapist_id?: string;
  therapist_name?: string;
  date_from?: string;
  date_to?: string;
  sort_order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<SessionWithRelations>> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.therapist_id) searchParams.set('therapist_id', params.therapist_id.toString());
  if (params?.therapist_name) searchParams.set('therapist_name', params.therapist_name);
  if (params?.date_from) searchParams.set('date_from', params.date_from);
  if (params?.date_to) searchParams.set('date_to', params.date_to);
  if (params?.sort_order) searchParams.set('sort_order', params.sort_order);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}

export async function searchTherapists(search: string = ''): Promise<Therapist[]> {
  const searchParams = new URLSearchParams();
  if (search) searchParams.set('search', search);

  const url = `/api/therapists${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}

export async function searchPatients(search: string = ''): Promise<Patient[]> {
  const searchParams = new URLSearchParams();
  if (search) searchParams.set('search', search);

  const url = `/api/patients${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}

export async function getSession(id: number): Promise<SessionWithRelations> {
  const response = await fetch(`${API_BASE}/${id}`);

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}

export async function createSession(data: CreateSessionInput): Promise<SessionWithRelations> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}

export async function updateSession(
  id: number,
  data: UpdateSessionInput
): Promise<SessionWithRelations> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}

export async function deleteSession(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error.message);
  }
}

