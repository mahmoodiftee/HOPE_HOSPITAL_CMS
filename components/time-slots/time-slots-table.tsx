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
import { Edit2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TimeSlot {
  $id: string;
  doctorId: string;
  time: string;
  available: boolean;
  status: string;
  label: string;
  date: string;
}

interface TimeSlotsTableProps {
  doctorId: string;
  doctorName: string;
  onEdit: (slot: TimeSlot) => void;
  onAddNew: () => void;
  refreshTrigger?: number;
}

export function TimeSlotsTable({
  doctorId,
  doctorName,
  onEdit,
  onAddNew,
  refreshTrigger,
}: TimeSlotsTableProps) {
  const [dateFilter, setDateFilter] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Fetch time slots
  const queryParams = new URLSearchParams({
    doctorId,
    ...(dateFilter && { date: dateFilter }),
  });

  const { data, error, isLoading, mutate } = useSWR(
    `/api/time-slots?${queryParams}`,
    (url) => fetch(url).then((res) => res.json()),
    { revalidateOnFocus: false }
  );

  // Refresh when trigger changes
  useEffect(() => {
    mutate();
  }, [refreshTrigger, mutate]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/time-slots/${id}`, { method: 'DELETE' });
      mutate();
    } catch (error) {
      console.error('Error deleting time slot:', error);
    }
  };

  const slots = data?.documents || [];

  const statusColors: Record<string, string> = {
    available: 'bg-green-50 text-green-700',
    not_available: 'bg-red-50 text-red-700',
    busy: 'bg-yellow-50 text-yellow-700',
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium">Filter by Date</label>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <Button onClick={onAddNew}>Add Time Slots</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Label</TableHead>
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
          ) : slots.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No time slots found
              </TableCell>
            </TableRow>
          ) : (
            slots.map((slot: TimeSlot) => (
              <TableRow key={slot.$id}>
                <TableCell className="font-medium">{slot.time}</TableCell>
                <TableCell>{slot.date}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[slot.status] || 'bg-gray-50'}`}>
                    {slot.status === 'not_available' ? 'Not Available' : slot.status === 'available' ? 'Available' : 'Busy'}
                  </span>
                </TableCell>
                <TableCell>{slot.label}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(slot)}
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
                        <AlertDialogTitle>Delete Time Slot</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this time slot ({slot.time})? This action cannot be undone.
                        </AlertDialogDescription>
                        <div className="flex gap-2 justify-end">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(slot.$id)}
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
    </div>
  );
}
