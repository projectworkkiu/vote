import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import pool from '@/lib/db';

// Seed the database with default admin
export async function POST() {
  try {
    const existingResult = await pool.query('SELECT id FROM admins WHERE username = $1', ['admin']);
    if (existingResult.rows.length > 0) {
      return NextResponse.json({ message: 'Admin already exists', seeded: false });
    }

    const hashedPassword = await hashPassword('admin123');

    await pool.query(
      'INSERT INTO admins (username, password, must_change_password) VALUES ($1, $2, $3)',
      ['admin', hashedPassword, true]
    );

    await pool.query(
      'INSERT INTO activity_logs (action, details, performed_by) VALUES ($1, $2, $3)',
      ['System Seeded', 'Default admin account created', 'system']
    );

    return NextResponse.json({ message: 'Default admin created successfully', seeded: true });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
