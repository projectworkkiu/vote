import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';
import supabaseAdmin from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json();

    if (!username || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (role === 'admin') {
      // Check admin credentials
      const { data: admin, error } = await supabaseAdmin
        .from('admins')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !admin) {
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
      await supabaseAdmin.from('activity_logs').insert({
        action: 'Admin Login',
        details: `Admin "${admin.username}" logged in`,
        performed_by: admin.username,
      });

      return NextResponse.json({
        success: true,
        role: 'admin',
        mustChangePassword: admin.must_change_password,
      });
    } else if (role === 'student') {
      // Check student credentials
      const { data: student, error } = await supabaseAdmin
        .from('students')
        .select('*')
        .eq('student_id', username)
        .single();

      if (error || !student) {
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
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
