import { NextRequest, NextResponse } from 'next/server';
import { createMultipleTimeSlots, getTimeSlotsByDoctor } from '@/lib/appwrite-queries';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');

    if (!doctorId) {
      return NextResponse.json(
        { error: 'doctorId is required' },
        { status: 400 }
      );
    }

    const result = await getTimeSlotsByDoctor(doctorId, date || undefined);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time slots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if multiple slots
    if (Array.isArray(body)) {
      const result = await createMultipleTimeSlots(body);
      return NextResponse.json(result, { status: 201 });
    } else {
      const { createTimeSlot } = await import('@/lib/appwrite-queries');
      const result = await createTimeSlot(body);
      return NextResponse.json(result, { status: 201 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create time slots' },
      { status: 500 }
    );
  }
}
