import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await pool.query('DELETE FROM positions WHERE id = $1', [id]);  } catch (error) {
    console.error('Delete position error:', error);
    return NextResponse.json({ error: 'Failed to delete position' }, { status: 500 });
  }
}
