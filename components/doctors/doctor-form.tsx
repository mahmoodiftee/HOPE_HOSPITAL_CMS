"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/lib/toast";
import { ImageUpload } from "@/components/ui/image-upload";

const doctorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  specialty: z.string().min(1, "Specialty is required"),
  hourlyRate: z.coerce.number().min(0, "Hourly rate must be positive"),
  image: z.string().optional(),
  experience: z.string().optional(),
  specialties: z.array(z.string()).optional(),
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
  const [newSpecialty, setNewSpecialty] = useState("");

  const form = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: "",
      specialty: "",
      hourlyRate: 0,
      image: "",
      experience: "",
      specialties: [],
    },
  });

  useEffect(() => {
    if (doctor) {
      form.reset({
        name: doctor.name,
        specialty: doctor.specialty,
        hourlyRate: doctor.hourlyRate,
        image: doctor.image || "",
        experience: doctor.experience || "",
        specialties: doctor.specialties || [],
      });
    } else {
      form.reset({
        name: "",
        specialty: "",
        hourlyRate: 0,
        image: "",
        experience: "",
        specialties: [],
      });
    }
  }, [doctor, form]);

  const handleSubmit = async (data: DoctorFormData) => {
    try {
      setSubmitting(true);
      await onSubmit(data, doctor?.$id);
      form.reset();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      const current = form.getValues("specialties") || [];

      if (current.includes(newSpecialty.trim())) {
        showToast.warning(
          "Duplicate Specialty",
          "This specialty has already been added"
        );
        return;
      }

      form.setValue("specialties", [...current, newSpecialty.trim()]);
      setNewSpecialty("");
      showToast.success("Specialty Added");
    }
  };

  const removeSpecialty = (index: number) => {
    const current = form.getValues("specialties") || [];
    form.setValue(
      "specialties",
      current.filter((_, i) => i !== index)
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !submitting) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{doctor ? "Edit Doctor" : "Add Doctor"}</DialogTitle>
          <DialogDescription>
            {doctor
              ? "Update doctor information"
              : "Add a new doctor to the system"}
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
                  <FormLabel>Primary Specialty</FormLabel>
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
                    <Input type="number" placeholder="100" {...field} />
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
                  <FormLabel>Experience</FormLabel>
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
                  <FormLabel>Profile Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      onClear={() => field.onChange("")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Additional Specialties</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add specialty"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSpecialty();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSpecialty}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {form.watch("specialties") &&
                form.watch("specialties")!.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.watch("specialties")!.map((spec, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="gap-1 max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap"
                        title={spec}
                      >
                        <span className="truncate">{spec}</span>
                        <button
                          type="button"
                          onClick={() => removeSpecialty(index)}
                          className="ml-1 hover:text-destructive shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || isLoading}>
                {submitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}