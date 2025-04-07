import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/app/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('PATCH /api/markers/[id] - Updating marker position');
  try {
    const body = await request.json();
    const { lat, lng } = body;
    const { id } = params;

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

    console.log('PATCH /api/markers/[id] - Validated data:', { id, lat, lng });
    await db.updateMarkerPosition(id, lat, lng);
    console.log('PATCH /api/markers/[id] - Successfully updated marker position');
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('DELETE /api/markers/[id] - Deleting marker');
  try {
    const { id } = params;
    
    console.log('DELETE /api/markers/[id] - Attempting to delete marker:', id);
    await db.deleteMarker(id);
    console.log('DELETE /api/markers/[id] - Successfully deleted marker');
    
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
