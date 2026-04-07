import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import supabaseAdmin from '@/lib/supabase';

// GET all students
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = supabaseAdmin
      .from('students')
      .select('id, student_id, name, class, is_active, created_at')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,student_id.ilike.%${search}%,class.ilike.%${search}%`);
    }

    const { data: students, error } = await query;
    if (error) throw error;

    return NextResponse.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

// POST create student
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentId, name, className, password } = await request.json();

    if (!studentId || !name || !className || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Check for duplicate
    const { data: existing } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('student_id', studentId)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Student ID already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const { data: student, error } = await supabaseAdmin
      .from('students')
      .insert({
        student_id: studentId,
        name,
        class: className,
        password: hashedPassword,
      })
      .select('id, student_id, name, class, is_active, created_at')
      .single();

    if (error) throw error;

    await supabaseAdmin.from('activity_logs').insert({
      action: 'Student Added',
      details: `Student "${name}" (${studentId}) was added`,
      performed_by: user.username || 'admin',
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
