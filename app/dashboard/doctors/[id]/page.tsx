"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TimeSlotsTable } from "@/components/time-slots/time-slots-table";
import { TimeSlotEditForm } from "@/components/time-slots/time-slot-edit-form";
import { showToast } from "@/lib/toast";

interface TimeSlot {
  $id: string;
  doctorId: string;
  time: string;
  available: boolean;
  status: string;
  label: string;
  date: string;
}

interface Doctor {
  $id: string;
  name: string;
  specialty: string;
  hourlyRate: number;
}

export default function DoctorTimeSlotsPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [editSlotOpen, setEditSlotOpen] = useState(false);
  const [addSlotsOpen, setAddSlotsOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) return;

    const fetchDoctor = async () => {
      try {
        const response = await fetch(`/api/doctors/${doctorId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch doctor");
        }

        const data = await response.json();
        setDoctor(data);
      } catch (error) {
        console.error("Error fetching doctor:", error);
        showToast.error(
          "Failed to Load Doctor",
          "Unable to fetch doctor information"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  const handleEditSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setEditSlotOpen(true);
  };

  const handleEditSubmit = async (data: any, id: string) => {
    try {
      const response = await fetch(`/api/time-slots/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update time slot");
      }

      showToast.success(
        "Time Slot Updated",
        "The time slot has been updated successfully"
      );

      setRefreshTrigger((prev) => prev + 1);
      setEditSlotOpen(false);
    } catch (error) {
      console.error("Error:", error);
      showToast.error(
        "Update Failed",
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="p-6">
        <p>Doctor not found</p>
        <Button
          variant="outline"
          onClick={() => router.push("/doctors")}
          className="mt-4"
        >
          Back to Doctors
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Time Slots - {doctor.name}</h1>
          <p className="text-muted-foreground mt-1">
            Manage availability for {doctor.specialty}
          </p>
        </div>
      </div>

      <TimeSlotsTable
        doctorId={doctorId}
        doctorName={doctor.name}
        onEdit={handleEditSlot}
        onAddNew={() => setAddSlotsOpen(true)}
        refreshTrigger={refreshTrigger}
      />

      <TimeSlotEditForm
        open={editSlotOpen}
        slot={selectedSlot}
        onOpenChange={setEditSlotOpen}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}
