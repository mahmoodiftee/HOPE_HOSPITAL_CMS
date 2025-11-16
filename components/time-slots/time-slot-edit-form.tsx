'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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

const STATUSES = ['available', 'not_available', 'busy'];

const timeSlotEditSchema = z.object({
  available: z.boolean(),
  status: z.enum(['available', 'not_available', 'busy']),
  label: z.string().min(1, 'Label is required'),
});

type TimeSlotEditFormData = z.infer<typeof timeSlotEditSchema>;

interface TimeSlot {
  $id: string;
  time: string;
  date: string;
  available: boolean;
  status: string;
  label: string;
}

interface TimeSlotEditFormProps {
  open: boolean;
  slot?: TimeSlot;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TimeSlotEditFormData, id: string) => Promise<void>;
  isLoading?: boolean;
}

export function TimeSlotEditForm({
  open,
  slot,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: TimeSlotEditFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<TimeSlotEditFormData>({
    resolver: zodResolver(timeSlotEditSchema),
    defaultValues: {
      available: false,
      status: 'not_available',
      label: '',
    },
  });

  // Update form when slot changes
  useEffect(() => {
    if (slot) {
      form.reset({
        available: slot.available,
        status: slot.status as any,
        label: slot.label,
      });
    }
  }, [slot, form]);

  const handleSubmit = async (data: TimeSlotEditFormData) => {
    try {
      setSubmitting(true);
      if (slot?.$id) {
        await onSubmit(data, slot.$id);
      }
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
          <DialogTitle>Edit Time Slot</DialogTitle>
          <DialogDescription>
            Update time slot for {slot?.time} on {slot?.date}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Available Toggle */}
            <FormField
              control={form.control}
              name="available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel>Mark as Available</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Label */}
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Available, Not Available"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || isLoading}>
                {submitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
