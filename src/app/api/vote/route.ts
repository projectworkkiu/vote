import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import supabaseAdmin from '@/lib/supabase';
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
    const { data: election } = await supabaseAdmin
      .from('elections')
      .select('*')
      .eq('id', electionId)
      .single();

    if (!election || election.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Election is not active' }, { status: 400 });
    }

    const now = new Date();
    if (now < new Date(election.start_date) || now > new Date(election.end_date)) {
      return NextResponse.json({ error: 'Election is not within voting period' }, { status: 400 });
    }

    // Check if student already voted
    const { data: existingRecord } = await supabaseAdmin
      .from('voting_records')
      .select('id')
      .eq('student_id', user.id)
      .eq('election_id', electionId)
      .single();

    if (existingRecord) {
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
    const { error: voteError } = await supabaseAdmin.from('votes').insert(voteRecords);
    if (voteError) throw voteError;

    // Record that this student has voted (without recording what they voted for)
    const { error: recordError } = await supabaseAdmin.from('voting_records').insert({
      student_id: user.id,
      election_id: electionId,
    });
    if (recordError) throw recordError;

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
