import type {
  SessionWithRelations,
  CreateSessionInput,
  UpdateSessionInput,
  PaginatedResponse,
  ApiError,
} from './types';

const API_BASE = '/api/sessions';

export async function getSessions(params?: {
  status?: string;
  therapist_id?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<SessionWithRelations>> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.therapist_id) searchParams.set('therapist_id', params.therapist_id.toString());
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

