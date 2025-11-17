import { NextResponse } from "next/server";
import { getDoctorsWithoutTimeSlots } from "@/lib/appwrite-queries";

export async function GET() {
  try {
    const doctors = await getDoctorsWithoutTimeSlots();
    return NextResponse.json(doctors);
  } catch (error) {
    console.error("Error in GET /api/availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch available doctors" },
      { status: 500 }
    );
  }
}
