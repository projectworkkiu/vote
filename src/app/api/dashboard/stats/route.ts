import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import supabaseAdmin from '@/lib/supabase';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Total students
    const { count: totalStudents } = await supabaseAdmin
      .from('students')
      .select('id', { count: 'exact' });

    // Active elections
    const { data: activeElections } = await supabaseAdmin
      .from('elections')
      .select('id')
      .eq('status', 'ACTIVE');

    // Total votes cast
    const { count: totalVotes } = await supabaseAdmin
      .from('votes')
      .select('id', { count: 'exact' });

    // Total unique voters
    const { count: totalVoters } = await supabaseAdmin
      .from('voting_records')
      .select('id', { count: 'exact' });

    // Participation rate
    const participationRate = totalStudents && totalStudents > 0
      ? Math.round(((totalVoters || 0) / totalStudents) * 100)
      : 0;

    // Recent activity
    const { data: recentActivity } = await supabaseAdmin
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Election stats for charts
    const { data: elections } = await supabaseAdmin
      .from('elections')
      .select('id, title, status')
      .order('created_at', { ascending: false })
      .limit(5);

    const electionStats = [];
    if (elections) {
      for (const el of elections) {
        const { count } = await supabaseAdmin
          .from('votes')
          .select('id', { count: 'exact' })
          .eq('election_id', el.id);
        electionStats.push({
          name: el.title,
          votes: count || 0,
          status: el.status,
        });
      }
    }

    return NextResponse.json({
      totalStudents: totalStudents || 0,
      activeElections: activeElections?.length || 0,
      totalVotes: totalVotes || 0,
      totalVoters: totalVoters || 0,
      participationRate,
      recentActivity: recentActivity || [],
      electionStats,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
