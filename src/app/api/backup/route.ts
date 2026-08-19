import { NextResponse } from 'next/server';
import { createDatabaseBackup, listDatabaseBackups } from '@/lib/backup';

export async function GET() {
  try {
    const backups = listDatabaseBackups();
    return NextResponse.json({ backups });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to list database backups';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST() {
  try {
    const backup = createDatabaseBackup();
    return NextResponse.json({ success: true, backup }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create database snapshot';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
