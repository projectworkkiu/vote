import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Automatically update election statuses
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

    const electionsResult = await pool.query('SELECT * FROM elections WHERE status = ANY($1) ORDER BY created_at DESC', [['ACTIVE', 'CLOSED']]);
    const elections = electionsResult.rows;
    const electionIds = elections.map((el: any) => el.id);

    const positionsResult = electionIds.length > 0
      ? await pool.query('SELECT * FROM positions WHERE election_id = ANY($1) ORDER BY created_at ASC', [electionIds])
      : { rows: [] };

    const positionIds = positionsResult.rows.map((pos: any) => pos.id);
    const candidatesResult = positionIds.length > 0
      ? await pool.query('SELECT * FROM candidates WHERE position_id = ANY($1)', [positionIds])
      : { rows: [] };

    const electionsWithPositions = elections.map((el: any) => ({
      ...el,
      positions: positionsResult.rows
        .filter((pos: any) => pos.election_id === el.id)
        .map((pos: any) => ({
          ...pos,
          candidates: candidatesResult.rows.filter((c: any) => c.position_id === pos.id),
        })),
    }));

    const votedRecordsResult = await pool.query('SELECT election_id FROM voting_records WHERE student_id = $1', [user.id]);
    const votedElectionIds = new Set(votedRecordsResult.rows.map((row: any) => row.election_id));

    const totalStudentsResult = await pool.query('SELECT COUNT(*) AS count FROM students');
    const totalBallotsResult = await pool.query('SELECT COUNT(*) AS count FROM voting_records');
    const totalStudents = parseInt(totalStudentsResult.rows[0]?.count || '0', 10);
    const totalBallots = parseInt(totalBallotsResult.rows[0]?.count || '0', 10);

    const enrichedElections = electionsWithPositions.map((el: any) => ({
      ...el,
      hasVoted: votedElectionIds.has(el.id),
    }));

    return NextResponse.json({
      elections: enrichedElections,
      stats: {
        totalStudents,
        totalBallots,
        turnoutPercentage: totalStudents ? Math.round((totalBallots / totalStudents) * 100) : 0,
      },
    });
  } catch (error: any) {
    console.error('Student dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
