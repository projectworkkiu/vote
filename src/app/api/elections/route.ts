import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import supabaseAdmin from '@/lib/supabase';

// GET all elections
export async function GET() {
  try {
    const { data: elections, error } = await supabaseAdmin
      .from('elections')
      .select(`
        *,
        positions (
          id, name,
          candidates (id, name, photo, bio)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(elections);
  } catch (error) {
    console.error('Get elections error:', error);
    return NextResponse.json({ error: 'Failed to fetch elections' }, { status: 500 });
  }
}

// POST create election
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, startDate, endDate, positions } = await request.json();

    if (!title || !startDate || !endDate) {
      return NextResponse.json({ error: 'Title, start date, and end date are required' }, { status: 400 });
    }

    // Create election
    const { data: election, error } = await supabaseAdmin
      .from('elections')
      .insert({
        title,
        description: description || '',
        start_date: startDate,
        end_date: endDate,
        status: 'DRAFT',
      })
      .select()
      .single();

    if (error) throw error;

    // Create positions if provided
    if (positions && Array.isArray(positions) && positions.length > 0) {
      const positionRecords = positions.map((name: string) => ({
        name,
        election_id: election.id,
      }));
      await supabaseAdmin.from('positions').insert(positionRecords);
    }

    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      action: 'Election Created',
      details: `Election "${title}" was created`,
      performed_by: user.username || 'admin',
    });

    return NextResponse.json(election, { status: 201 });
  } catch (error) {
    console.error('Create election error:', error);
    return NextResponse.json({ error: 'Failed to create election' }, { status: 500 });
  }
}
