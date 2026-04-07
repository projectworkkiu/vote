import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import supabaseAdmin from '@/lib/supabase';

// GET all candidates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const positionId = searchParams.get('positionId');
    const electionId = searchParams.get('electionId');

    let query = supabaseAdmin
      .from('candidates')
      .select(`
        *,
        position:positions (
          id, name,
          election:elections (id, title, status)
        )
      `)
      .order('created_at', { ascending: false });

    if (positionId) {
      query = query.eq('position_id', positionId);
    }

    const { data: candidates, error } = await query;
    if (error) throw error;

    // Filter by electionId if provided
    let filtered = candidates;
    if (electionId) {
      filtered = candidates?.filter((c: any) => c.position?.election?.id === electionId) || [];
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Get candidates error:', error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}

// POST create candidate
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, bio, photo, positionId } = await request.json();

    if (!name || !positionId) {
      return NextResponse.json({ error: 'Name and position are required' }, { status: 400 });
    }

    const { data: candidate, error } = await supabaseAdmin
      .from('candidates')
      .insert({
        name,
        bio: bio || '',
        photo: photo || null,
        position_id: positionId,
      })
      .select()
      .single();

    if (error) throw error;

    await supabaseAdmin.from('activity_logs').insert({
      action: 'Candidate Added',
      details: `Candidate "${name}" was added`,
      performed_by: user.username || 'admin',
    });

    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    console.error('Create candidate error:', error);
    return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 });
  }
}
