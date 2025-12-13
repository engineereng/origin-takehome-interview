import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { Therapist, ApiError } from '@/lib/types';

// GET /api/therapists - Search therapists by name
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let query = 'SELECT id, name, specialty FROM therapists';
    const values: string[] = [];

    if (search) {
      query += ' WHERE name ILIKE $1';
      values.push(`%${search}%`);
    }

    query += ' ORDER BY name ASC LIMIT 20';

    const result = await pool.query(query, values);
    const therapists: Therapist[] = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      specialty: row.specialty,
    }));

    return NextResponse.json(therapists);
  } catch (error) {
    console.error('Error fetching therapists:', error);
    const apiError: ApiError = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch therapists',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
