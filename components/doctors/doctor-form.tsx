'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Plus, X } from 'lucide-react';

const doctorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  specialty: z.string().min(1, 'Specialty is required'),
  hourlyRate: z.coerce.number().min(0, 'Hourly rate must be positive'),
  image: z.string().optional(),
  experience: z.string().optional(),
  specialties: z.array(
    z.object({
      value: z.string().min(1, 'Specialty value is required'),
    })
  ),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

interface DoctorFormProps {
  open: boolean;
  doctor?: DoctorFormData & { $id: string };
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DoctorFormData, id?: string) => Promise<void>;
  isLoading?: boolean;
}

export function DoctorForm({
  open,
  doctor,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: DoctorFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: '',
      specialty: '',
      hourlyRate: 0,
      image: '',
      experience: '',
      specialties: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'specialties',
  });

  // Update form when doctor changes
  useEffect(() => {
    if (doctor) {
      form.reset({
        name: doctor.name,
        specialty: doctor.specialty,
        hourlyRate: doctor.hourlyRate,
        image: doctor.image || '',
        experience: doctor.experience || '',
        specialties: doctor.specialties || [],
      });
    } else {
      form.reset({
        name: '',
        specialty: '',
        hourlyRate: 0,
        image: '',
        experience: '',
        specialties: [],
      });
    }
  }, [doctor, form]);

  const handleSubmit = async (data: DoctorFormData) => {
    try {
      setSubmitting(true);
      await onSubmit(data, doctor?.$id);
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
          <DialogTitle>{doctor ? 'Edit Doctor' : 'Add Doctor'}</DialogTitle>
          <DialogDescription>
            {doctor ? 'Update doctor information' : 'Add a new doctor to the system'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialty</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cardiology" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hourlyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hourly Rate ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience (years)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 10 years" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dynamic Specialties */}
            <div className="space-y-2">
              <FormLabel>Additional Specialties</FormLabel>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`specialties.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="e.g., Surgery"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ value: '' })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Specialty
              </Button>
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
                {submitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
