"use client";

import { useState } from "react";
import { showToast } from "@/lib/toast";
import { AvailabilityTable } from "@/components/time-slots/time-slots-table";
import { AvailabilityForm } from "@/components/time-slots/time-slot-edit-form";

interface Doctor {
  $id: string;
  name: string;
  specialty: string;
  image?: string;
}

interface TimeSlot {
  $id: string;
  doctorId: string;
  availableDays: string[];
  availableTimes: string[];
  doctor?: Doctor;
}

export default function AvailabilityPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<
    TimeSlot | undefined
  >();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setSelectedDoctorId("");
    setFormOpen(true);
  };

  const handleAddNew = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setSelectedTimeSlot(undefined);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: any, id?: string) => {
    const isEdit = !!id;
    const url = id ? `/api/time-slots/${id}` : "/api/time-slots";
    const method = id ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save availability");
      }

      showToast.success(
        isEdit ? "Availability Updated" : "Availability Created",
        isEdit
          ? "Doctor availability has been updated successfully"
          : "Doctor availability has been added to the system"
      );

      setRefreshTrigger((prev) => prev + 1);
      setFormOpen(false);
      setSelectedTimeSlot(undefined);
      setSelectedDoctorId("");
    } catch (error) {
      console.error("Error:", error);
      showToast.error(
        isEdit ? "Update Failed" : "Creation Failed",
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      throw error;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Doctor Availability</h1>
        <p className="text-muted-foreground mt-1">
          Manage doctor availability schedules and time slots
        </p>
      </div>

      <AvailabilityTable
        onEdit={handleEdit}
        onAddNew={handleAddNew}
        refreshTrigger={refreshTrigger}
      />

      <AvailabilityForm
        open={formOpen}
        timeSlot={selectedTimeSlot}
        doctorId={selectedDoctorId}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
