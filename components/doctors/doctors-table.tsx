'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit2, Trash2, Clock } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Doctor {
  $id: string;
  name: string;
  specialty: string;
  hourlyRate: number;
  image?: string;
  experience?: string;
}

interface DoctorsTableProps {
  onEdit: (doctor: Doctor) => void;
  onTimeSlots: (doctorId: string) => void;
  onAddNew: () => void;
  refreshTrigger?: number;
}

export function DoctorsTable({
  onEdit,
  onTimeSlots,
  onAddNew,
  refreshTrigger,
}: DoctorsTableProps) {
  const [page, setPage] = useState(1);
  const [specialty, setSpecialty] = useState<string>('');
  const [search, setSearch] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);

  const limit = 10;

  // Fetch doctors
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(specialty && { specialty }),
    ...(search && { search }),
  });

  const { data, error, isLoading, mutate } = useSWR(
    `/api/doctors?${queryParams}`,
    (url) => fetch(url).then((res) => res.json()),
    { revalidateOnFocus: false }
  );

  // Fetch specialties on mount
  useEffect(() => {
    fetch('/api/specialties')
      .then((res) => res.json())
      .then((data) => setSpecialties(data))
      .catch((err) => console.error('Error fetching specialties:', err));
  }, []);

  // Refresh when trigger changes
  useEffect(() => {
    mutate();
  }, [refreshTrigger, mutate]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/doctors/${id}`, { method: 'DELETE' });
      mutate();
    } catch (error) {
      console.error('Error deleting doctor:', error);
    }
  };

  const doctors = data?.documents || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium">Search by name</label>
          <Input
            placeholder="Search doctors..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-40">
          <label className="text-sm font-medium">Specialty</label>
          <Select value={specialty} onValueChange={(v) => {
            setSpecialty(v);
            setPage(1);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="All specialties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All specialties</SelectItem>
              {specialties.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAddNew}>Add Doctor</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Hourly Rate</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                Loading...
              </TableCell>
            </TableRow>
          ) : doctors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No doctors found
              </TableCell>
            </TableRow>
          ) : (
            doctors.map((doctor: Doctor) => (
              <TableRow key={doctor.$id}>
                <TableCell className="font-medium">{doctor.name}</TableCell>
                <TableCell>{doctor.specialty}</TableCell>
                <TableCell>${doctor.hourlyRate}</TableCell>
                <TableCell>{doctor.experience || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onTimeSlots(doctor.$id)}
                      title="Manage time slots"
                    >
                      <Clock className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(doctor)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Delete Doctor</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {doctor.name}? This action cannot be undone.
                        </AlertDialogDescription>
                        <div className="flex gap-2 justify-end">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(doctor.$id)}
                            className="bg-destructive"
                          >
                            Delete
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex gap-2 justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages} ({total} total)
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
