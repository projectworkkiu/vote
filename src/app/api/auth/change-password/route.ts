import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword, verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';
import supabaseAdmin from '@/lib/supabase';

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

    // Fetch admin
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Verify current password
    const validPassword = await verifyPassword(currentPassword, admin.password);
    if (!validPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Hash new password and update
    const hashedPassword = await hashPassword(newPassword);
    await supabaseAdmin
      .from('admins')
      .update({ password: hashedPassword, must_change_password: false, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    // Generate new token without mustChangePassword
    const newToken = generateToken({
      id: user.id,
      role: 'admin',
      username: user.username,
    });
    await setAuthCookie(newToken);

    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      action: 'Password Changed',
      details: `Admin "${user.username}" changed their password`,
      performed_by: user.username || 'admin',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
