import { NextRequest, NextResponse } from "next/server";
import { createTimeSlot, getTimeSlotsWithDoctors } from "@/lib/appwrite-queries";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const offset = (page - 1) * limit;

    const result = await getTimeSlotsWithDoctors(limit, offset);

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

    const { docId, day, time } = body;

    if (!docId) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 }
      );
    }

    if (!day) {
      return NextResponse.json(
        { error: "Day is required" },
        { status: 400 }
      );
    }

    if (!time || !Array.isArray(time) || time.length === 0) {
      return NextResponse.json(
        { error: "Time slots are required" },
        { status: 400 }
      );
    }

    const timeSlot = await createTimeSlot({
      docId,
      day,
      time,
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