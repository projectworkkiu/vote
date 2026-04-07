import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword, verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';
import supabaseAdmin from '@/lib/supabase';

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

    // Verify current auth
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const validPassword = await verifyPassword(currentPassword, admin.password);
    if (!validPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const updateFields: any = { updated_at: new Date().toISOString() };

    // Set new username
    if (newUsername && newUsername.trim() !== '') {
      // check if username is taken by another admin
      const { data: existing } = await supabaseAdmin
        .from('admins')
        .select('id')
        .eq('username', newUsername)
        .neq('id', user.id)
        .single();
      
      if (existing) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
      }

      updateFields.username = newUsername.trim();
    }

    // Set new password
    if (newPassword && newPassword.trim() !== '') {
      if (newPassword.length < 6) {
         return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      updateFields.password = await hashPassword(newPassword);
    }

    // Update the DB
    const { error: updateError } = await supabaseAdmin
      .from('admins')
      .update(updateFields)
      .eq('id', user.id);

    if (updateError) throw updateError;

    // Refresh cookie if username changed so context stays active
    if (updateFields.username) {
      const newToken = generateToken({
        id: user.id,
        role: 'admin',
        username: updateFields.username,
      });
      await setAuthCookie(newToken);
    }

    // Log the activity
    await supabaseAdmin.from('activity_logs').insert({
      action: 'Credentials Updated',
      details: 'Admin updated their login credentials',
      performed_by: updateFields.username || admin.username,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Update credentials error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
