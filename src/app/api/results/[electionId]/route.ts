import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import supabaseAdmin from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: Promise<{ electionId: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { electionId } = await params;

    // Get election with positions and candidates
    const { data: election } = await supabaseAdmin
      .from('elections')
      .select(`
        *,
        positions (
          id, name,
          candidates (id, name, photo, bio)
        )
      `)
      .eq('id', electionId)
      .single();

    if (!election) {
      return NextResponse.json({ error: 'Election not found' }, { status: 404 });
    }

    // Students can only see results after election is closed
    if (user.role === 'student' && election.status !== 'CLOSED') {
      return NextResponse.json({ error: 'Results are not available yet' }, { status: 403 });
    }

    // Get vote counts per candidate
    const { data: votes } = await supabaseAdmin
      .from('votes')
      .select('candidate_id')
      .eq('election_id', electionId);

    // Count votes per candidate
    const voteCounts: Record<string, number> = {};
    votes?.forEach((v: any) => {
      voteCounts[v.candidate_id] = (voteCounts[v.candidate_id] || 0) + 1;
    });

    // Get total voters
    const { count: totalVoters } = await supabaseAdmin
      .from('voting_records')
      .select('id', { count: 'exact' })
      .eq('election_id', electionId);

    // Build results
    const results = election.positions?.map((pos: any) => ({
      position: pos.name,
      positionId: pos.id,
      candidates: pos.candidates?.map((c: any) => ({
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
      results,
      totalVoters: totalVoters || 0,
    });
  } catch (error) {
    console.error('Results error:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
