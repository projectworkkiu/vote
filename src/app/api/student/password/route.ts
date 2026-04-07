import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword, verifyPassword } from '@/lib/auth';
import pool from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    const studentResult = await pool.query('SELECT * FROM students WHERE id = $1', [user.id]);
    const student = studentResult.rows[0];

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const valid = await verifyPassword(currentPassword, student.password);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const hashedPassword = await hashPassword(newPassword);
    await pool.query(
      'UPDATE students SET password = $1, updated_at = $2 WHERE id = $3',
      [hashedPassword, new Date().toISOString(), user.id]
    );

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update student password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
