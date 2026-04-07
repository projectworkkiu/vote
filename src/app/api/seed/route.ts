import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import supabaseAdmin from '@/lib/supabase';

// Seed the database with default admin
export async function POST() {
  try {
    // Check if admin already exists
    const { data: existing } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('username', 'admin')
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Admin already exists', seeded: false });
    }

    const hashedPassword = await hashPassword('admin123');

    const { error } = await supabaseAdmin.from('admins').insert({
      username: 'admin',
      password: hashedPassword,
      must_change_password: true,
    });

    if (error) throw error;

    await supabaseAdmin.from('activity_logs').insert({
      action: 'System Seeded',
      details: 'Default admin account created',
      performed_by: 'system',
    });

    return NextResponse.json({ message: 'Default admin created successfully', seeded: true });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
