import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword, verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const adminResult = await pool.query('SELECT * FROM admins WHERE id = $1', [user.id]);
    const admin = adminResult.rows[0];

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const validPassword = await verifyPassword(currentPassword, admin.password);
    if (!validPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const hashedPassword = await hashPassword(newPassword);
    await pool.query(
      'UPDATE admins SET password = $1, must_change_password = false, updated_at = $2 WHERE id = $3',
      [hashedPassword, new Date().toISOString(), user.id]
    );

    const newToken = generateToken({
      id: user.id,
      role: 'admin',
      username: user.username,
    });
    await setAuthCookie(newToken);

    await pool.query(
      'INSERT INTO activity_logs (action, details, performed_by) VALUES ($1, $2, $3)',
      ['Password Changed', `Admin "${user.username}" changed their password`, user.username || 'admin']
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
