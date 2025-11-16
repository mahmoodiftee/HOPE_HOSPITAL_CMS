import { NextResponse } from 'next/server';
import { getSpecialties } from '@/lib/appwrite-queries';

export async function GET() {
  try {
    const specialties = await getSpecialties();
    return NextResponse.json(specialties);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specialties' },
      { status: 500 }
    );
  }
}
