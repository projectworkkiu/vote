import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import supabaseAdmin from '@/lib/supabase';
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
      const password = row['password'] || studentId; // Default password = student ID

      if (!studentId || !name || !className) {
        skipped++;
        failures.push(`Missing fields for row: ${JSON.stringify(row)}`);
        continue;
      }

      // Check for existing
      const { data: existing } = await supabaseAdmin
        .from('students')
        .select('id')
        .eq('student_id', studentId.toString().trim())
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      const hashedPassword = await hashPassword(password.toString().trim());

      const { error } = await supabaseAdmin.from('students').insert({
        student_id: studentId.toString().trim(),
        name: name.toString().trim(),
        class: className.toString().trim(),
        password: hashedPassword,
      });

      if (error) {
        skipped++;
        failures.push(`Failed to insert ${studentId}: ${error.message}`);
      } else {
        added++;
      }
    }

    await supabaseAdmin.from('activity_logs').insert({
      action: 'Bulk Student Upload',
      details: `${added} students added, ${skipped} skipped via CSV upload`,
      performed_by: user.username || 'admin',
    });

    return NextResponse.json({ success: true, added, skipped, failures });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ error: 'Failed to process CSV' }, { status: 500 });
  }
}
