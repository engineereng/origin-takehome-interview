import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createSessionSchema, sessionQuerySchema } from '@/lib/validations';
import type { SessionWithRelations, ApiError, PaginatedResponse } from '@/lib/types';

// GET /api/sessions - List sessions with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      status: searchParams.get('status') || undefined,
      therapist_id: searchParams.get('therapist_id') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    };

    const validatedParams = sessionQuerySchema.parse(queryParams);
    const { status, therapist_id, page, limit } = validatedParams;
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

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM sessions s ${whereClause}`;
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
      ORDER BY s.date ASC
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

    const response: PaginatedResponse<SessionWithRelations> = {
      data: sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      const apiError: ApiError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
        },
      };
      return NextResponse.json(apiError, { status: 400 });
    }

    console.error('Error fetching sessions:', error);
    const apiError: ApiError = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch sessions',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}

// POST /api/sessions - Create a new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createSessionSchema.parse(body);

    const result = await pool.query(
      `INSERT INTO sessions (therapist_id, patient_id, date, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, therapist_id, patient_id, date, status`,
      [
        validatedData.therapist_id,
        validatedData.patient_id,
        validatedData.date,
        validatedData.status,
      ]
    );

    const session = result.rows[0];

    // Fetch with relations
    const sessionWithRelations = await pool.query(
      `SELECT
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
      WHERE s.id = $1`,
      [session.id]
    );

    return NextResponse.json(sessionWithRelations.rows[0], { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      const apiError: ApiError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message || 'Invalid request data',
        },
      };
      return NextResponse.json(apiError, { status: 400 });
    }

    console.error('Error creating session:', error);
    const apiError: ApiError = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create session',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}

