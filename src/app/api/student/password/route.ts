import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword, verifyPassword } from '@/lib/auth';
import supabaseAdmin from '@/lib/supabase';

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

    // 1. Get current student record
    const { data: student, error: fetchError } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // 2. Verify current password
    const valid = await verifyPassword(currentPassword, student.password);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // 3. Update with new hashed password
    const hashedPassword = await hashPassword(newPassword);
    const { error: updateError } = await supabaseAdmin
      .from('students')
      .update({ password: hashedPassword, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    console.error('Update student password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
