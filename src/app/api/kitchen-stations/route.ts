import { NextResponse } from 'next/server';
import { getKitchenStations, saveKitchenStation, deleteKitchenStation } from '@/lib/database';

export async function GET() {
  try {
    const stations = getKitchenStations();
    return NextResponse.json({ stations });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch kitchen stations';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Station name is required' }, { status: 400 });
    }

    const station = saveKitchenStation(body);
    return NextResponse.json({ success: true, station }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to save kitchen station';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Station id is required' }, { status: 400 });
    }

    const deleted = deleteKitchenStation(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Station not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete kitchen station';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
