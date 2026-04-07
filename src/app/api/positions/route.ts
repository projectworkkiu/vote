import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import supabaseAdmin from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, electionId } = await request.json();

    if (!name || !electionId) {
      return NextResponse.json({ error: 'Name and election ID are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('positions')
      .insert({ name, election_id: electionId })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Create position error:', error);
    return NextResponse.json({ error: 'Failed to create position' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const electionId = searchParams.get('electionId');

    let query = supabaseAdmin
      .from('positions')
      .select('*, candidates(id, name, photo, bio)')
      .order('created_at', { ascending: true });

    if (electionId) {
      query = query.eq('election_id', electionId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get positions error:', error);
    return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 });
  }
}
