'use client';

import { useState } from 'react';
import { DoctorsTable } from '@/components/doctors/doctors-table';
import { DoctorForm } from '@/components/doctors/doctor-form';
import { TimeSlotForm } from '@/components/doctors/time-slot-form';

interface Doctor {
  $id: string;
  name: string;
  specialty: string;
  hourlyRate: number;
  image?: string;
  experience?: string;
  specialties?: any[];
}

export default function DoctorsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [timeSlotsOpen, setTimeSlotsOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | undefined>();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setFormOpen(true);
  };

  const handleTimeSlots = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setTimeSlotsOpen(true);
  };

  const handleAddNew = () => {
    setSelectedDoctor(undefined);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: any, id?: string) => {
    try {
      const url = id ? `/api/doctors/${id}` : '/api/doctors';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleTimeSlotSubmit = async (slots: any[]) => {
    try {
      const response = await fetch('/api/time-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slots),
      });

      if (response.ok) {
        // Refresh table or show success
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Doctors Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage doctors, their specialties, and availability
        </p>
      </div>

      <DoctorsTable
        onEdit={handleEdit}
        onTimeSlots={handleTimeSlots}
        onAddNew={handleAddNew}
        refreshTrigger={refreshTrigger}
      />

      <DoctorForm
        open={formOpen}
        doctor={selectedDoctor}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
      />

      <TimeSlotForm
        open={timeSlotsOpen}
        doctorId={selectedDoctorId}
        onOpenChange={setTimeSlotsOpen}
        onSubmit={handleTimeSlotSubmit}
      />
    </div>
  );
}
