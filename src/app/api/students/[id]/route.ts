import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import supabaseAdmin from '@/lib/supabase';

// PUT update student
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.name) updateData.name = body.name;
    if (body.className) updateData.class = body.className;
    if (body.isActive !== undefined) updateData.is_active = body.isActive;
    if (body.password) updateData.password = await hashPassword(body.password);

    const { data, error } = await supabaseAdmin
      .from('students')
      .update(updateData)
      .eq('id', id)
      .select('id, student_id, name, class, is_active, created_at')
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

// DELETE student
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { error } = await supabaseAdmin.from('students').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
