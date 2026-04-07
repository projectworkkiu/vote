import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Only students can vote' }, { status: 403 });
    }

    const { electionId, votes } = await request.json();
    // votes: Array of { positionId, candidateId }

    if (!electionId || !votes || !Array.isArray(votes) || votes.length === 0) {
      return NextResponse.json({ error: 'Election ID and votes are required' }, { status: 400 });
    }

    // Check election is active
    const electionResult = await pool.query('SELECT * FROM elections WHERE id = $1', [electionId]);
    const election = electionResult.rows[0];

    if (!election || election.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Election is not active' }, { status: 400 });
    }

    const now = new Date();
    if (now < new Date(election.start_date) || now > new Date(election.end_date)) {
      return NextResponse.json({ error: 'Election is not within voting period' }, { status: 400 });
    }

    // Check if student already voted
    const recordResult = await pool.query('SELECT id FROM voting_records WHERE student_id = $1 AND election_id = $2', [user.id, electionId]);
    if (recordResult.rows.length > 0) {
      return NextResponse.json({ error: 'You have already voted in this election' }, { status: 409 });
    }

    // Create anonymous vote records
    const voteRecords = votes.map((vote: { positionId: string; candidateId: string }) => {
      // Generate anonymous token (hash of random UUID — cannot be traced back)
      const token = createHash('sha256').update(uuidv4() + Date.now().toString()).digest('hex');
      return {
        candidate_id: vote.candidateId,
        position_id: vote.positionId,
        election_id: electionId,
        token,
      };
    });

    // Insert votes (anonymous)
    const placeholders = voteRecords.map((_, i) => `($${i*4 + 1}, $${i*4 + 2}, $${i*4 + 3}, $${i*4 + 4})`).join(', ');
    const values = voteRecords.flatMap(r => [r.candidate_id, r.position_id, r.election_id, r.token]);
    await pool.query(`INSERT INTO votes (candidate_id, position_id, election_id, token) VALUES ${placeholders}`, values);

    // Record that this student has voted (without recording what they voted for)
    await pool.query('INSERT INTO voting_records (student_id, election_id) VALUES ($1, $2)', [user.id, electionId]);

    return NextResponse.json({
      success: true,
      message: 'Your vote has been recorded anonymously',
      receiptToken: voteRecords[0].token.substring(0, 12) + '...',
    });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Failed to cast vote' }, { status: 500 });
  }
}
