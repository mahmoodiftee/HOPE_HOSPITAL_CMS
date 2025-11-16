'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const TIME_OPTIONS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
  '08:00 PM',
];

const STATUSES = ['available', 'not_available', 'busy'];

const timeSlotSchema = z.object({
  times: z.array(z.string()).min(1, 'Select at least one time slot'),
  available: z.boolean(),
  status: z.enum(['available', 'not_available', 'busy']),
  label: z.string().min(1, 'Label is required'),
  date: z.string().min(1, 'Date is required'),
});

type TimeSlotFormData = z.infer<typeof timeSlotSchema>;

interface TimeSlotFormProps {
  open: boolean;
  doctorId: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (slots: any[]) => Promise<void>;
  isLoading?: boolean;
}

export function TimeSlotForm({
  open,
  doctorId,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: TimeSlotFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<TimeSlotFormData>({
    resolver: zodResolver(timeSlotSchema),
    defaultValues: {
      times: [],
      available: false,
      status: 'not_available',
      label: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const handleSubmit = async (data: TimeSlotFormData) => {
    try {
      setSubmitting(true);
      const slots = data.times.map((time) => ({
        doctorId,
        time,
        available: data.available,
        status: data.status,
        label: data.label,
        date: data.date,
      }));
      await onSubmit(slots);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Time Slots</DialogTitle>
          <DialogDescription>
            Create availability slots for this doctor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Date */}
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...form.register('date')}
            />
            {form.formState.errors.date && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>

          {/* Time Selection */}
          <div>
            <Label>Select Times</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
              {TIME_OPTIONS.map((time) => (
                <div key={time} className="flex items-center space-x-2">
                  <Controller
                    control={form.control}
                    name="times"
                    render={({ field: { value, onChange } }) => (
                      <Checkbox
                        id={time}
                        checked={value.includes(time)}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...value, time]
                            : value.filter((t) => t !== time);
                          onChange(newValue);
                        }}
                      />
                    )}
                  />
                  <Label htmlFor={time} className="cursor-pointer">
                    {time}
                  </Label>
                </div>
              ))}
            </div>
            {form.formState.errors.times && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.times.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.watch('status')}
              onValueChange={(value) =>
                form.setValue('status', value as typeof STATUSES[number])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'not_available' ? 'Not Available' : status === 'available' ? 'Available' : 'Busy'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Available Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="available"
              checked={form.watch('available')}
              onCheckedChange={(checked) =>
                form.setValue('available', !!checked)
              }
            />
            <Label htmlFor="available" className="cursor-pointer">
              Mark as Available
            </Label>
          </div>

          {/* Label */}
          <div>
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              placeholder="e.g., Available, Not Available"
              {...form.register('label')}
            />
            {form.formState.errors.label && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.label.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || isLoading}>
              {submitting ? 'Creating...' : 'Create Slots'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
