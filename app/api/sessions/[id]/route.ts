import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { updateSessionSchema } from '@/lib/validations';
import type { ApiError, SessionWithRelations } from '@/lib/types';

// GET /api/sessions/[id] - Get a single session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id, 10);

    if (isNaN(sessionId)) {
      const apiError: ApiError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid session ID',
        },
      };
      return NextResponse.json(apiError, { status: 400 });
    }

    const result = await pool.query(
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
      [sessionId]
    );

    if (result.rows.length === 0) {
      const apiError: ApiError = {
        error: {
          code: 'NOT_FOUND',
          message: 'Session not found',
        },
      };
      return NextResponse.json(apiError, { status: 404 });
    }

    return NextResponse.json(result.rows[0] as SessionWithRelations);
  } catch (error) {
    console.error('Error fetching session:', error);
    const apiError: ApiError = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch session',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}

// PATCH /api/sessions/[id] - Update a session
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id, 10);

    if (isNaN(sessionId)) {
      const apiError: ApiError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid session ID',
        },
      };
      return NextResponse.json(apiError, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateSessionSchema.parse(body);

    // Build dynamic update query
    const updates: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    if (validatedData.therapist_id !== undefined) {
      updates.push(`therapist_id = $${paramIndex}`);
      values.push(validatedData.therapist_id);
      paramIndex++;
    }

    if (validatedData.patient_id !== undefined) {
      updates.push(`patient_id = $${paramIndex}`);
      values.push(validatedData.patient_id);
      paramIndex++;
    }

    if (validatedData.date !== undefined) {
      updates.push(`date = $${paramIndex}`);
      values.push(validatedData.date);
      paramIndex++;
    }

    if (validatedData.status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      values.push(validatedData.status);
      paramIndex++;
    }

    if (updates.length === 0) {
      const apiError: ApiError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No fields to update',
        },
      };
      return NextResponse.json(apiError, { status: 400 });
    }

    values.push(sessionId);
    const updateQuery = `
      UPDATE sessions
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, therapist_id, patient_id, date, status
    `;

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      const apiError: ApiError = {
        error: {
          code: 'NOT_FOUND',
          message: 'Session not found',
        },
      };
      return NextResponse.json(apiError, { status: 404 });
    }

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
      [sessionId]
    );

    return NextResponse.json(sessionWithRelations.rows[0] as SessionWithRelations);
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

    // Handle database constraint errors (e.g., foreign key violations)
    if (error && typeof error === 'object' && 'code' in error) {
      const dbError = error as { code: string; message?: string };
      if (dbError.code === '23503') {
        // Foreign key violation
        const apiError: ApiError = {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid therapist_id or patient_id',
          },
        };
        return NextResponse.json(apiError, { status: 400 });
      }
    }

    console.error('Error updating session:', error);
    const apiError: ApiError = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update session',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}

// DELETE /api/sessions/[id] - Delete a session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id, 10);

    if (isNaN(sessionId)) {
      const apiError: ApiError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid session ID',
        },
      };
      return NextResponse.json(apiError, { status: 400 });
    }

    const result = await pool.query('DELETE FROM sessions WHERE id = $1 RETURNING id', [
      sessionId,
    ]);

    if (result.rows.length === 0) {
      const apiError: ApiError = {
        error: {
          code: 'NOT_FOUND',
          message: 'Session not found',
        },
      };
      return NextResponse.json(apiError, { status: 404 });
    }

    return NextResponse.json({ message: 'Session deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting session:', error);
    const apiError: ApiError = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete session',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}

