import pool from '@/lib/db';
import { sessionQuerySchema } from '@/lib/validations';
import type { SessionWithRelations, PaginatedResponse } from '@/lib/types';

export async function getSessionsServer(params: {
  status?: string;
  therapist_id?: string;
  therapist_name?: string;
  date_from?: string;
  date_to?: string;
  sort_order?: string;
  page?: string;
  limit?: string;
}): Promise<PaginatedResponse<SessionWithRelations>> {
  const queryParams = {
    status: params.status || undefined,
    therapist_id: params.therapist_id || undefined,
    therapist_name: params.therapist_name || undefined,
    date_from: params.date_from || undefined,
    date_to: params.date_to || undefined,
    sort_order: params.sort_order || 'ASC',
    page: params.page || '1',
    limit: params.limit || '10',
  };

  const validatedParams = sessionQuerySchema.parse(queryParams);
  const { status, therapist_id, therapist_name, date_from, date_to, sort_order, page, limit } = validatedParams;
  const offset = (page - 1) * limit;

  // Build WHERE clause
  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (status) {
    conditions.push(`s.status = $${paramIndex}`);
    values.push(status);
    paramIndex++;
  }

  if (therapist_id) {
    conditions.push(`s.therapist_id = $${paramIndex}`);
    values.push(therapist_id);
    paramIndex++;
  }

  if (therapist_name) {
    conditions.push(`t.name ILIKE $${paramIndex}`);
    values.push(`%${therapist_name}%`);
    paramIndex++;
  }

  if (date_from) {
    conditions.push(`s.date >= $${paramIndex}`);
    values.push(date_from);
    paramIndex++;
  }

  if (date_to) {
    conditions.push(`s.date <= $${paramIndex}`);
    values.push(date_to);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = (therapist_name || date_from || date_to)
    ? `SELECT COUNT(*) FROM sessions s INNER JOIN therapists t ON s.therapist_id = t.id ${whereClause}`
    : `SELECT COUNT(*) FROM sessions s ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].count, 10);

  // Get paginated sessions with joins
  const sessionsQuery = `
    SELECT
      s.id,
      s.therapist_id,
      s.patient_id,
      s.date,
      s.status,
      t.name as therapist_name,
      p.name as patient_name
    FROM sessions s
    INNER JOIN therapists t ON s.therapist_id = t.id
    INNER JOIN patients p ON s.patient_id = p.id
    ${whereClause}
    ORDER BY s.date ${sort_order}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  values.push(limit, offset);
  const sessionsResult = await pool.query(sessionsQuery, values);

  const sessions: SessionWithRelations[] = sessionsResult.rows.map((row) => ({
    id: row.id,
    therapist_id: row.therapist_id,
    patient_id: row.patient_id,
    date: row.date,
    status: row.status,
    therapist_name: row.therapist_name,
    patient_name: row.patient_name,
  }));

  return {
    data: sessions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

