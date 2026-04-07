import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import pool from '@/lib/db';

// GET all students
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = 'SELECT id, student_id, name, class, is_active, created_at FROM students';
    const params: string[] = [];

    if (search) {
      query += ' WHERE name ILIKE $1 OR student_id ILIKE $1 OR class ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

// POST create student
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentId, name, className, password } = await request.json();

    if (!studentId || !name || !className || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Check for duplicate
    const existingResult = await pool.query('SELECT id FROM students WHERE student_id = $1', [studentId]);
    if (existingResult.rows.length > 0) {
      return NextResponse.json({ error: 'Student ID already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const insertResult = await pool.query(
      'INSERT INTO students (student_id, name, class, password) VALUES ($1, $2, $3, $4) RETURNING id, student_id, name, class, is_active, created_at',
      [studentId, name, className, hashedPassword]
    );
    const student = insertResult.rows[0];

    await pool.query('INSERT INTO activity_logs (action, details, performed_by) VALUES ($1, $2, $3)', [
      'Student Added',
      `Student "${name}" (${studentId}) was added`,
      user.username || 'admin',
    ]);

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
