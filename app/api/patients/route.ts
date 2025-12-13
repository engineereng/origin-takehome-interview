import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { Patient, ApiError } from '@/lib/types';

// GET /api/patients - Search patients by name
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let query = 'SELECT id, name, dob FROM patients';
    const values: string[] = [];

    if (search) {
      query += ' WHERE name ILIKE $1';
      values.push(`%${search}%`);
    }

    query += ' ORDER BY name ASC LIMIT 20';

    const result = await pool.query(query, values);
    const patients: Patient[] = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      dob: row.dob,
    }));

    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    const apiError: ApiError = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch patients',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
