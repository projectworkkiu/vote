import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ electionId: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { electionId } = await params;

    // Get election
    const electionResult = await pool.query('SELECT * FROM elections WHERE id = $1', [electionId]);
    const election = electionResult.rows[0];

    if (!election) {
      return NextResponse.json({ error: 'Election not found' }, { status: 404 });
    }

    // Students can see live results for ACTIVE and CLOSED elections (transparency)
    if (user.role === 'student' && election.status === 'DRAFT') {
      return NextResponse.json({ error: 'Results are not available yet' }, { status: 403 });
    }

    // Get positions
    const positionsResult = await pool.query('SELECT * FROM positions WHERE election_id = $1', [electionId]);
    const positions = positionsResult.rows;

    // Get candidates for each position
    const results = await Promise.all(positions.map(async (pos) => {
      const candidatesResult = await pool.query('SELECT * FROM candidates WHERE position_id = $1', [pos.id]);
      return {
        position: pos.name,
        positionId: pos.id,
        candidates: candidatesResult.rows,
      };
    }));

    // Get vote counts per candidate
    const voteCountsResult = await pool.query('SELECT candidate_id, COUNT(*) as count FROM votes WHERE election_id = $1 GROUP BY candidate_id', [electionId]);
    const voteCounts: Record<string, number> = {};
    voteCountsResult.rows.forEach((row: any) => {
      voteCounts[row.candidate_id] = parseInt(row.count);
    });

    // Get total voters
    const totalVotersResult = await pool.query('SELECT COUNT(*) as count FROM voting_records WHERE election_id = $1', [electionId]);
    const totalVoters = parseInt(totalVotersResult.rows[0].count);

    // Build results
    const finalResults = results.map((pos) => ({
      position: pos.position,
      positionId: pos.positionId,
      candidates: pos.candidates.map((c: any) => ({
        id: c.id,
        name: c.name,
        photo: c.photo,
        votes: voteCounts[c.id] || 0,
      })).sort((a: any, b: any) => b.votes - a.votes),
    }));

    return NextResponse.json({
      election: {
        id: election.id,
        title: election.title,
        status: election.status,
        startDate: election.start_date,
        endDate: election.end_date,
      },
      results: finalResults,
      totalVoters,
    });
  } catch (error) {
    console.error('Results error:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
