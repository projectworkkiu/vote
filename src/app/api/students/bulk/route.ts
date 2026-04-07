import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import pool from '@/lib/db';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const text = await file.text();
    const { data: rows, errors } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim().toLowerCase(),
    });

    if (errors.length > 0) {
      return NextResponse.json({ error: 'CSV parsing error', details: errors }, { status: 400 });
    }

    let added = 0;
    let skipped = 0;
    const failures: string[] = [];

    for (const row of rows as any[]) {
      const studentId = row['studentid'] || row['student_id'] || row['id'];
      const name = row['name'] || row['fullname'] || row['full_name'];
      const className = row['class'] || row['grade'] || row['classname'];
      const password = row['password'] || studentId;

      if (!studentId || !name || !className) {
        skipped++;
        failures.push(`Missing fields for row: ${JSON.stringify(row)}`);
        continue;
      }

      const existingResult = await pool.query('SELECT id FROM students WHERE student_id = $1', [studentId.toString().trim()]);
      if (existingResult.rows.length > 0) {
        skipped++;
        continue;
      }

      const hashedPassword = await hashPassword(password.toString().trim());
      try {
        await pool.query(
          'INSERT INTO students (student_id, name, class, password) VALUES ($1, $2, $3, $4)',
          [studentId.toString().trim(), name.toString().trim(), className.toString().trim(), hashedPassword]
        );
        added++;
      } catch (insertError: any) {
        skipped++;
        failures.push(`Failed to insert ${studentId}: ${insertError.message || 'insert error'}`);
      }
    }

    await pool.query(
      'INSERT INTO activity_logs (action, details, performed_by) VALUES ($1, $2, $3)',
      ['Bulk Student Upload', `${added} students added, ${skipped} skipped via CSV upload`, user.username || 'admin']
    );

    return NextResponse.json({ success: true, added, skipped, failures });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ error: 'Failed to process CSV' }, { status: 500 });
  }
}
