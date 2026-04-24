import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET public students (safe limited fields for autocomplete)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    if (!search || search.length < 2) {
       return NextResponse.json([]);
    }

    // Only return non-sensitive fields natively needed for login visual autocomplete
    const query = 'SELECT student_id, name FROM students WHERE name ILIKE $1 OR student_id ILIKE $1 ORDER BY name ASC LIMIT 10';
    const params = [`%${search}%`];

    const result = await pool.query(query, params);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Public get students error:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}
