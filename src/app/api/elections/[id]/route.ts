import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import supabaseAdmin from '@/lib/supabase';

// GET single election
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data: election, error } = await supabaseAdmin
      .from('elections')
      .select(`
        *,
        positions (
          id, name,
          candidates (id, name, photo, bio)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !election) {
      return NextResponse.json({ error: 'Election not found' }, { status: 404 });
    }

    // Check if current user is a student and has voted
    let hasVoted = false;
    const user = await getCurrentUser();
    if (user && user.role === 'student') {
      const { data: record } = await supabaseAdmin
        .from('voting_records')
        .select('id')
        .eq('election_id', id)
        .eq('student_id', user.id)
        .single();
      
      if (record) hasVoted = true;
    }

    return NextResponse.json({ ...election, hasVoted });
  } catch (error) {
    console.error('Get election error:', error);
    return NextResponse.json({ error: 'Failed to fetch election' }, { status: 500 });
  }
}

// PUT update election
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if voting has started
    const { data: votes } = await supabaseAdmin
      .from('votes')
      .select('id')
      .eq('election_id', id)
      .limit(1);

    if (votes && votes.length > 0 && body.status !== 'CLOSED') {
      // Allow only status changes after voting starts
      const allowedFields = ['status'];
      const updateFields: Record<string, unknown> = {};
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateFields[field] = body[field];
        }
      }
      updateFields.updated_at = new Date().toISOString();

      const { data, error } = await supabaseAdmin
        .from('elections')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.startDate) updateData.start_date = body.startDate;
    if (body.endDate) updateData.end_date = body.endDate;
    if (body.status) updateData.status = body.status;

    const { data: election, error } = await supabaseAdmin
      .from('elections')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Handle positions update
    if (body.positions && Array.isArray(body.positions)) {
      // Delete old positions (cascade deletes candidates)
      await supabaseAdmin.from('positions').delete().eq('election_id', id);
      // Insert new positions
      const positionRecords = body.positions.map((name: string) => ({
        name,
        election_id: id,
      }));
      await supabaseAdmin.from('positions').insert(positionRecords);
    }

    await supabaseAdmin.from('activity_logs').insert({
      action: 'Election Updated',
      details: `Election "${election.title}" was updated`,
      performed_by: user.username || 'admin',
    });

    return NextResponse.json(election);
  } catch (error) {
    console.error('Update election error:', error);
    return NextResponse.json({ error: 'Failed to update election' }, { status: 500 });
  }
}

// DELETE election
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: election } = await supabaseAdmin
      .from('elections')
      .select('title')
      .eq('id', id)
      .single();

    const { error } = await supabaseAdmin.from('elections').delete().eq('id', id);
    if (error) throw error;

    await supabaseAdmin.from('activity_logs').insert({
      action: 'Election Deleted',
      details: `Election "${election?.title}" was deleted`,
      performed_by: user.username || 'admin',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete election error:', error);
    return NextResponse.json({ error: 'Failed to delete election' }, { status: 500 });
  }
}
