import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const totalStudentsResult = await pool.query('SELECT COUNT(*) AS count FROM students');
    const totalStudents = parseInt(totalStudentsResult.rows[0]?.count || '0', 10);

    const activeElectionsResult = await pool.query('SELECT COUNT(*) AS count FROM elections WHERE status = $1', ['ACTIVE']);
    const activeElections = parseInt(activeElectionsResult.rows[0]?.count || '0', 10);

    const totalVotesResult = await pool.query('SELECT COUNT(*) AS count FROM votes');
    const totalVotes = parseInt(totalVotesResult.rows[0]?.count || '0', 10);

    const totalVotersResult = await pool.query('SELECT COUNT(*) AS count FROM voting_records');
    const totalVoters = parseInt(totalVotersResult.rows[0]?.count || '0', 10);

    const participationRate = totalStudents > 0 ? Math.round((totalVoters / totalStudents) * 100) : 0;

    const recentActivityResult = await pool.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10');
    const recentActivity = recentActivityResult.rows;

    const electionsResult = await pool.query('SELECT id, title, status FROM elections ORDER BY created_at DESC LIMIT 5');
    const electionStats = [];

    for (const el of electionsResult.rows) {
      const voteCountResult = await pool.query('SELECT COUNT(*) AS count FROM votes WHERE election_id = $1', [el.id]);
      electionStats.push({
        name: el.title,
        votes: parseInt(voteCountResult.rows[0]?.count || '0', 10),
        status: el.status,
      });
    }

    return NextResponse.json({
      totalStudents,
      activeElections,
      totalVotes,
      totalVoters,
      participationRate,
      recentActivity,
      electionStats,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
