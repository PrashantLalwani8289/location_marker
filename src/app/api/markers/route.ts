import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

export async function GET() {
  console.log('GET /api/markers - Fetching all markers');
  try {
    const markers = await db.getMarkers();
    console.log(`GET /api/markers - Successfully returned ${markers.length} markers`);
    return NextResponse.json(markers);
  } catch (error: unknown) {
    const errorDetails = {
      endpoint: 'GET /api/markers',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined,
    };
    console.error('API Error:', errorDetails);
    return NextResponse.json(
      { error: 'Failed to fetch markers', details: errorDetails },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log('POST /api/markers - Adding new marker');
  try {
    const body = await request.json();
    const { lat, lng, name } = body;

    if (typeof lat !== 'number' || typeof lng !== 'number' || typeof name !== 'string' || !name.trim()) {
      const validationError = {
        endpoint: 'POST /api/markers',
        message: 'Invalid marker data',
        receivedValues: { lat, lng, name },
        timestamp: new Date().toISOString(),
      };
      console.error('Validation Error:', validationError);
      return NextResponse.json(
        { error: 'Invalid marker data', details: validationError },
        { status: 400 }
      );
    }

    console.log('POST /api/markers - Validated data:', { lat, lng, name });
    const newMarker = await db.addMarker(lat, lng, name.trim());
    console.log('POST /api/markers - Successfully added marker:', newMarker);
    return NextResponse.json(newMarker);
  } catch (error: unknown) {
    const errorDetails = {
      endpoint: 'POST /api/markers',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined,
    };
    console.error('API Error:', errorDetails);
    return NextResponse.json(
      { error: 'Failed to add marker', details: errorDetails },
      { status: 500 }
    );
  }
}
