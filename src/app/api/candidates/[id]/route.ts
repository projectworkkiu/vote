import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// PUT update candidate
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
    if (body.bio !== undefined) {
      fields.push(`bio = $${idx++}`);
      values.push(body.bio);
    }
    if (body.photo !== undefined) {
      fields.push(`photo = $${idx++}`);
      values.push(body.photo);
    }
    if (body.positionId) {
      fields.push(`position_id = $${idx++}`);
      values.push(body.positionId);
    }

    fields.push(`updated_at = $${idx++}`);
    values.push(new Date().toISOString());
    values.push(id);

    const updateResult = await pool.query(
      `UPDATE candidates SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    return NextResponse.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Update candidate error:', error);
    return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
  }
}

// DELETE candidate
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await pool.query('DELETE FROM candidates WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete candidate error:', error);
    return NextResponse.json({ error: 'Failed to delete candidate' }, { status: 500 });
  }
}
