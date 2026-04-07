import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, electionId } = await request.json();

    if (!name || !electionId) {
      return NextResponse.json({ error: 'Name and election ID are required' }, { status: 400 });
    }

    const insertResult = await pool.query(
      'INSERT INTO positions (name, election_id) VALUES ($1, $2) RETURNING *',
      [name, electionId]
    );

    return NextResponse.json(insertResult.rows[0], { status: 201 });
  } catch (error) {
    console.error('Create position error:', error);
    return NextResponse.json({ error: 'Failed to create position' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const electionId = searchParams.get('electionId');
    const values: any[] = [];
    let query = 'SELECT * FROM positions';

    if (electionId) {
      query += ' WHERE election_id = $1';
      values.push(electionId);
    }

    query += ' ORDER BY created_at ASC';
    const positionsResult = await pool.query(query, values);
    const positions = positionsResult.rows;

    const positionIds = positions.map((pos: any) => pos.id);
    const candidates = positionIds.length > 0
      ? (await pool.query('SELECT * FROM candidates WHERE position_id = ANY($1)', [positionIds])).rows
      : [];

    const results = positions.map((pos: any) => ({
      ...pos,
      candidates: candidates.filter((candidate: any) => candidate.position_id === pos.id),
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Get positions error:', error);
    return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 });
  }
}
