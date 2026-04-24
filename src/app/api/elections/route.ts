import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// GET all elections
export async function GET() {
  try {
    // Automatically update statuses
    await pool.query(`
      UPDATE elections 
      SET status = 'CLOSED' 
      WHERE end_date < NOW() AND status != 'CLOSED'
    `);
    
    await pool.query(`
      UPDATE elections 
      SET status = 'ACTIVE' 
      WHERE start_date <= NOW() AND end_date >= NOW() AND status != 'ACTIVE'
    `);

    const electionsResult = await pool.query('SELECT * FROM elections ORDER BY created_at DESC');
    const elections = electionsResult.rows;
    const electionIds = elections.map((el: any) => el.id);

    if (electionIds.length === 0) {
      return NextResponse.json([]);
    }

    const positionsResult = await pool.query('SELECT * FROM positions WHERE election_id = ANY($1) ORDER BY created_at ASC', [electionIds]);
    const positions = positionsResult.rows;
    const positionIds = positions.map((pos: any) => pos.id);

    const candidatesResult = positionIds.length > 0
      ? await pool.query('SELECT * FROM candidates WHERE position_id = ANY($1)', [positionIds])
      : { rows: [] };

    const positionsWithCandidates = positions.map((pos: any) => ({
      ...pos,
      candidates: candidatesResult.rows.filter((c: any) => c.position_id === pos.id),
    }));

    const electionsWithNested = elections.map((el: any) => ({
      ...el,
      positions: positionsWithCandidates.filter((pos: any) => pos.election_id === el.id),
    }));

    return NextResponse.json(electionsWithNested);
  } catch (error) {
    console.error('Get elections error:', error);
    return NextResponse.json({ error: 'Failed to fetch elections' }, { status: 500 });
  }
}

// POST create election
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, startDate, endDate, positions } = await request.json();

    if (!title || !startDate || !endDate) {
      return NextResponse.json({ error: 'Title, start date, and end date are required' }, { status: 400 });
    }

    const insertElection = await pool.query(
      'INSERT INTO elections (title, description, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description || '', startDate, endDate, 'DRAFT']
    );
    const election = insertElection.rows[0];

    if (positions && Array.isArray(positions) && positions.length > 0) {
      const positionRecords = positions.map((name: string) => ({ name, election_id: election.id }));
      const values: any[] = [];
      const placeholders = positionRecords.map((pos, index) => {
        const offset = index * 2;
        values.push(pos.name, pos.election_id);
        return `($${offset + 1}, $${offset + 2})`;
      }).join(', ');
      await pool.query(`INSERT INTO positions (name, election_id) VALUES ${placeholders}`, values);
    }

    await pool.query(
      'INSERT INTO activity_logs (action, details, performed_by) VALUES ($1, $2, $3)',
      ['Election Created', `Election "${title}" was created`, user.username || 'admin']
    );

    return NextResponse.json(election, { status: 201 });
  } catch (error) {
    console.error('Create election error:', error);
    return NextResponse.json({ error: 'Failed to create election' }, { status: 500 });
  }
}
