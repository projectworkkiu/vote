import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword, verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';
import pool from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newUsername, newPassword } = await request.json();

    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
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

    const updateClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (newUsername && newUsername.trim() !== '') {
      const duplicate = await pool.query(
        'SELECT id FROM admins WHERE username = $1 AND id <> $2',
        [newUsername.trim(), user.id]
      );
      if (duplicate.rows.length > 0) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
      }
      updateClauses.push(`username = $${paramIndex++}`);
      values.push(newUsername.trim());
    }

    if (newPassword && newPassword.trim() !== '') {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      updateClauses.push(`password = $${paramIndex++}`);
      values.push(await hashPassword(newPassword));
    }

    updateClauses.push(`updated_at = $${paramIndex++}`);
    values.push(new Date().toISOString());
    values.push(user.id);

    await pool.query(`UPDATE admins SET ${updateClauses.join(', ')} WHERE id = $${paramIndex}`, values);

    if (newUsername && newUsername.trim() !== '') {
      const newToken = generateToken({
        id: user.id,
        role: 'admin',
        username: newUsername.trim(),
      });
      await setAuthCookie(newToken);
    }

    await pool.query(
      'INSERT INTO activity_logs (action, details, performed_by) VALUES ($1, $2, $3)',
      ['Credentials Updated', 'Admin updated their login credentials', newUsername?.trim() || admin.username]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Update credentials error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
