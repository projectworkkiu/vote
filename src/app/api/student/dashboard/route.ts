import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import supabaseAdmin from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Get all relevant elections (Active and Closed)
    const { data: elections, error: electionsError } = await supabaseAdmin
      .from('elections')
      .select(`
        *,
        positions (
          id, name,
          candidates (id, name, photo, bio)
        )
      `)
      .in('status', ['ACTIVE', 'CLOSED'])
      .order('created_at', { ascending: false });

    if (electionsError) throw electionsError;

    // 2. Check which elections this student has already voted in
    const { data: votedRecords, error: recordsError } = await supabaseAdmin
      .from('voting_records')
      .select('election_id')
      .eq('student_id', user.id);

    if (recordsError) throw recordsError;

    const votedElectionIds = new Set(votedRecords.map(r => r.election_id));

    // 3. Get system-wide stats for lively updates
    // Total students
    const { count: totalStudents, error: countError } = await supabaseAdmin
      .from('students')
      .select('*', { count: 'exact', head: true });

    // Total unique voters across all elections
    const { count: totalBallots, error: ballotsError } = await supabaseAdmin
      .from('voting_records')
      .select('*', { count: 'exact', head: true });

    if (countError || ballotsError) throw (countError || ballotsError);

    // 4. Enrich elections with voted status
    const enrichedElections = (elections || []).map(el => ({
      ...el,
      hasVoted: votedElectionIds.has(el.id)
    }));

    return NextResponse.json({
      elections: enrichedElections,
      stats: {
        totalStudents: totalStudents || 0,
        totalBallots: totalBallots || 0,
        turnoutPercentage: totalStudents ? Math.round(((totalBallots || 0) / totalStudents) * 100) : 0
      }
    });

  } catch (error: any) {
    console.error('Student dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
