import { NextRequest, NextResponse } from "next/server";
import {
  getTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
} from "@/lib/appwrite-queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const timeSlot = await getTimeSlot(id);
    return NextResponse.json(timeSlot);
  } catch (error) {
    console.error("Error in GET /api/time-slots/[id]:", error);
    return NextResponse.json(
      { error: "Failed to fetch time slot" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { availableDays, availableTimes } = body;

    if (
      availableDays &&
      (!Array.isArray(availableDays) || availableDays.length === 0)
    ) {
      return NextResponse.json(
        { error: "Available days must be a non-empty array" },
        { status: 400 }
      );
    }

    if (
      availableTimes &&
      (!Array.isArray(availableTimes) || availableTimes.length === 0)
    ) {
      return NextResponse.json(
        { error: "Available times must be a non-empty array" },
        { status: 400 }
      );
    }

    const timeSlot = await updateTimeSlot(id, body);

    return NextResponse.json(timeSlot);
  } catch (error) {
    console.error("Error in PUT /api/time-slots/[id]:", error);
    return NextResponse.json(
      { error: "Failed to update time slot" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteTimeSlot(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/time-slots/[id]:", error);
    return NextResponse.json(
      { error: "Failed to delete time slot" },
      { status: 500 }
    );
  }
}

// { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
