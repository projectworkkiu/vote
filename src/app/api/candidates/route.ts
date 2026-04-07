import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// GET all candidates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const positionId = searchParams.get('positionId');
    const electionId = searchParams.get('electionId');

    const conditions: string[] = [];
    const values: any[] = [];

    if (positionId) {
      conditions.push('candidates.position_id = $' + (values.length + 1));
      values.push(positionId);
    }

    if (electionId) {
      conditions.push('elections.id = $' + (values.length + 1));
      values.push(electionId);
    }

    let query = `SELECT candidates.*, positions.id AS position_id, positions.name AS position_name, positions.election_id, elections.id AS election_id, elections.title AS election_title, elections.status AS election_status
      FROM candidates
      JOIN positions ON candidates.position_id = positions.id
      JOIN elections ON positions.election_id = elections.id`;

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY candidates.created_at DESC';

    const result = await pool.query(query, values);
    const candidates = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      bio: row.bio,
      photo: row.photo,
      position_id: row.position_id,
      position: {
        id: row.position_id,
        name: row.position_name,
        election: {
          id: row.election_id,
          title: row.election_title,
          status: row.election_status,
        },
      },
    }));

    return NextResponse.json(candidates);
  } catch (error) {
    console.error('Get candidates error:', error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}

// POST create candidate
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, bio, photo, positionId } = await request.json();

    if (!name || !positionId) {
      return NextResponse.json({ error: 'Name and position are required' }, { status: 400 });
    }

    const insertResult = await pool.query(
      'INSERT INTO candidates (name, bio, photo, position_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, bio || '', photo || null, positionId]
    );

    const candidate = insertResult.rows[0];

    await pool.query(
      'INSERT INTO activity_logs (action, details, performed_by) VALUES ($1, $2, $3)',
      ['Candidate Added', `Candidate "${name}" was added`, user.username || 'admin']
    );

    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    console.error('Create candidate error:', error);
    return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 });
  }
}
