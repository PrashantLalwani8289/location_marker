import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('PATCH /api/markers/[id] - Updating marker position');
  try {
    const body = await req.json();
    const { lat, lng } = body;
    const { id } = await params;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      const validationError = {
        endpoint: 'PATCH /api/markers/[id]',
        message: 'Invalid coordinates',
        receivedValues: { lat, lng },
        timestamp: new Date().toISOString(),
      };
      console.error('Validation Error:', validationError);
      return NextResponse.json(
        { error: 'Invalid coordinates', details: validationError },
        { status: 400 }
      );
    }

    console.log('Validated data:', { id, lat, lng });
    await db.updateMarkerPosition(id, lat, lng);
    console.log('Successfully updated marker position');
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorDetails = {
      endpoint: 'PATCH /api/markers/[id]',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined,
    };
    console.error('API Error:', errorDetails);
    return NextResponse.json(
      { error: 'Failed to update marker', details: errorDetails },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('DELETE /api/markers/[id] - Deleting marker');
  try {
    const { id } = await params;
    console.log('Attempting to delete marker:', id);
    await db.deleteMarker(id);
    console.log('Successfully deleted marker');
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorDetails = {
      endpoint: 'DELETE /api/markers/[id]',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined,
    };
    console.error('API Error:', errorDetails);
    return NextResponse.json(
      { error: 'Failed to delete marker', details: errorDetails },
      { status: 500 }
    );
  }
}
