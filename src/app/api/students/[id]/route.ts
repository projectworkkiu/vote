import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import pool from '@/lib/db';

// PUT update student
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (body.name) {
      fields.push(`name = $${idx++}`);
      values.push(body.name);
    }
    if (body.className) {
      fields.push(`class = $${idx++}`);
      values.push(body.className);
    }
    if (body.isActive !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(body.isActive);
    }
    if (body.password) {
      fields.push(`password = $${idx++}`);
      values.push(await hashPassword(body.password));
    }

    fields.push(`updated_at = $${idx++}`);
    values.push(new Date().toISOString());
    values.push(id);

    const updateResult = await pool.query(
      `UPDATE students SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, student_id, name, class, is_active, created_at`,
      values
    );

    return NextResponse.json(updateResult.rows[0]);
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
    await pool.query('DELETE FROM students WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
