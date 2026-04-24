import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json();

    if (!username || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (role === 'admin') {
      // Check admin credentials
      const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
      const admin = result.rows[0];

      if (!admin) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const validPassword = await verifyPassword(password, admin.password);
      if (!validPassword) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const token = generateToken({
        id: admin.id,
        role: 'admin',
        username: admin.username,
      });

      await setAuthCookie(token);

      // Log activity
      await pool.query('INSERT INTO activity_logs (action, details, performed_by) VALUES ($1, $2, $3)', [
        'Admin Login',
        `Admin "${admin.username}" logged in`,
        admin.username,
      ]);

      return NextResponse.json({
        success: true,
        role: 'admin',
        mustChangePassword: admin.must_change_password,
      });
    } else if (role === 'student') {
      // Check student credentials
      const result = await pool.query('SELECT * FROM students WHERE student_id = $1', [username]);
      const student = result.rows[0];

      if (!student) {
        return NextResponse.json({ error: 'Invalid student ID or password' }, { status: 401 });
      }

      if (!student.is_active) {
        return NextResponse.json({ error: 'Your account has been deactivated' }, { status: 403 });
      }

      const validPassword = await verifyPassword(password, student.password);
      if (!validPassword) {
        return NextResponse.json({ error: 'Invalid student ID or password' }, { status: 401 });
      }

      const token = generateToken({
        id: student.id,
        role: 'student',
        studentId: student.student_id,
      });

      await setAuthCookie(token);

      return NextResponse.json({
        success: true,
        role: 'student',
        name: student.name,
      });
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  } catch (error) {
    console.error('Login error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
