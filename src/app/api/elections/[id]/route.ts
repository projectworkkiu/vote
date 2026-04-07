import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// GET single election
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const electionResult = await pool.query('SELECT * FROM elections WHERE id = $1', [id]);
    const election = electionResult.rows[0];

    if (!election) {
      return NextResponse.json({ error: 'Election not found' }, { status: 404 });
    }

    const positionsResult = await pool.query('SELECT * FROM positions WHERE election_id = $1 ORDER BY created_at ASC', [id]);
    const positionIds = positionsResult.rows.map((pos: any) => pos.id);
    const candidatesResult = positionIds.length > 0
      ? await pool.query('SELECT * FROM candidates WHERE position_id = ANY($1)', [positionIds])
      : { rows: [] };

    const positions = positionsResult.rows.map((pos: any) => ({
      ...pos,
      candidates: candidatesResult.rows.filter((c: any) => c.position_id === pos.id),
    }));

    let hasVoted = false;
    const user = await getCurrentUser();
    if (user && user.role === 'student') {
      const recordResult = await pool.query(
        'SELECT id FROM voting_records WHERE election_id = $1 AND student_id = $2 LIMIT 1',
        [id, user.id]
      );
      hasVoted = recordResult.rows.length > 0;
    }

    return NextResponse.json({ ...election, positions, hasVoted });
  } catch (error) {
    console.error('Get election error:', error);
    return NextResponse.json({ error: 'Failed to fetch election' }, { status: 500 });
  }
}

// PUT update election
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const voteCountResult = await pool.query('SELECT COUNT(*) AS count FROM votes WHERE election_id = $1', [id]);
    const votesCount = parseInt(voteCountResult.rows[0]?.count || '0', 10);

    const updateFields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (votesCount > 0 && body.status !== 'CLOSED') {
      if (body.status !== undefined) {
        updateFields.push(`status = $${idx++}`);
        values.push(body.status);
      }
    } else {
      if (body.title) {
        updateFields.push(`title = $${idx++}`);
        values.push(body.title);
      }
      if (body.description !== undefined) {
        updateFields.push(`description = $${idx++}`);
        values.push(body.description);
      }
      if (body.startDate) {
        updateFields.push(`start_date = $${idx++}`);
        values.push(body.startDate);
      }
      if (body.endDate) {
        updateFields.push(`end_date = $${idx++}`);
        values.push(body.endDate);
      }
      if (body.status) {
        updateFields.push(`status = $${idx++}`);
        values.push(body.status);
      }
    }

    updateFields.push(`updated_at = $${idx++}`);
    values.push(new Date().toISOString());
    values.push(id);

    const electionUpdateResult = await pool.query(
      `UPDATE elections SET ${updateFields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    const election = electionUpdateResult.rows[0];

    if (body.positions && Array.isArray(body.positions)) {
      await pool.query('DELETE FROM positions WHERE election_id = $1', [id]);
      if (body.positions.length > 0) {
        const positionValues: any[] = [];
        const positionPlaceholders = body.positions.map((name: string, index: number) => {
          positionValues.push(name, id);
          return `($${index * 2 + 1}, $${index * 2 + 2})`;
        }).join(', ');
        await pool.query(`INSERT INTO positions (name, election_id) VALUES ${positionPlaceholders}`, positionValues);
      }
    }

    await pool.query(
      'INSERT INTO activity_logs (action, details, performed_by) VALUES ($1, $2, $3)',
      ['Election Updated', `Election "${election.title}" was updated`, user.username || 'admin']
    );

    return NextResponse.json(election);
  } catch (error) {
    console.error('Update election error:', error);
    return NextResponse.json({ error: 'Failed to update election' }, { status: 500 });
  }
}

// DELETE election
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const electionResult = await pool.query('SELECT title FROM elections WHERE id = $1', [id]);
    const election = electionResult.rows[0];

    await pool.query('DELETE FROM elections WHERE id = $1', [id]);
    await pool.query(
      'INSERT INTO activity_logs (action, details, performed_by) VALUES ($1, $2, $3)',
      ['Election Deleted', `Election "${election?.title}" was deleted`, user.username || 'admin']
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete election error:', error);
    return NextResponse.json({ error: 'Failed to delete election' }, { status: 500 });
  }
}
