import { NextRequest, NextResponse } from "next/server";
import { createTimeSlot, getTimeSlots } from "@/lib/appwrite-queries";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const doctorId = searchParams.get("doctorId") || undefined;

    const offset = (page - 1) * limit;

    const result = await getTimeSlots(limit, offset, doctorId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/time-slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch time slots" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { doctorId, availableDays, availableTimes } = body;

    if (!doctorId) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 }
      );
    }

    if (
      !availableDays ||
      !Array.isArray(availableDays) ||
      availableDays.length === 0
    ) {
      return NextResponse.json(
        { error: "Available days are required" },
        { status: 400 }
      );
    }

    if (
      !availableTimes ||
      !Array.isArray(availableTimes) ||
      availableTimes.length === 0
    ) {
      return NextResponse.json(
        { error: "Available times are required" },
        { status: 400 }
      );
    }

    const timeSlot = await createTimeSlot({
      doctorId,
      availableDays,
      availableTimes,
    });

    return NextResponse.json(timeSlot, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/time-slots:", error);
    return NextResponse.json(
      { error: "Failed to create time slot" },
      { status: 500 }
    );
  }
}
