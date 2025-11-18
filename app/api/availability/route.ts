import { NextResponse } from "next/server";
import { getDoctorsAvailableForNewSlots } from "@/lib/appwrite-queries";

export async function GET() {
  try {
    const doctors = await getDoctorsAvailableForNewSlots();
    return NextResponse.json(doctors);
  } catch (error) {
    console.error("Error in GET /api/availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch available doctors" },
      { status: 500 }
    );
  }
}