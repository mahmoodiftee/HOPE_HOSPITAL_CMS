"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { showToast } from "@/lib/toast";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
];

const availabilitySchema = z.object({
  docId: z.string().min(1, "Doctor is required"),
  day: z.string().min(1, "Day is required"),
  time: z.array(z.string()).min(1, "At least one time slot must be selected"),
});

type AvailabilityFormData = z.infer<typeof availabilitySchema>;

interface Doctor {
  $id: string;
  name: string;
  specialty: string;
  image?: string;
}

interface TimeSlot {
  $id: string;
  docId: string;
  day: string;
  time: string[];
  doctor?: Doctor;
}

interface AvailabilityFormProps {
  open: boolean;
  timeSlot?: TimeSlot;
  doctorId?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AvailabilityFormData, id?: string) => Promise<void>;
  isLoading?: boolean;
}

export function AvailabilityForm({
  open,
  timeSlot,
  doctorId,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: AvailabilityFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [occupiedDays, setOccupiedDays] = useState<string[]>([]);

  const form = useForm<AvailabilityFormData>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      docId: "",
      day: "",
      time: [],
    },
  });

  useEffect(() => {
    if (timeSlot) {
      form.reset({
        docId: timeSlot.docId,
        day: timeSlot.day,
        time: timeSlot.time || [],
      });

      if (timeSlot.doctor) {
        setDoctor(timeSlot.doctor);
      } else {
        fetch(`/api/doctors/${timeSlot.docId}`)
          .then((res) => res.json())
          .then((data) => setDoctor(data))
          .catch((err) => console.error("Error fetching doctor:", err));
      }

      // When editing, we don't need to fetch occupied days
      setOccupiedDays([]);
    } else if (doctorId) {
      form.reset({
        docId: doctorId,
        day: "",
        time: [],
      });

      // Fetch doctor info
      fetch(`/api/doctors/${doctorId}`)
        .then((res) => res.json())
        .then((data) => setDoctor(data))
        .catch((err) => console.error("Error fetching doctor:", err));

      // Fetch existing time slots for this doctor to get occupied days
      fetch(`/api/time-slots?doctorId=${doctorId}&limit=1000`)
        .then((res) => res.json())
        .then((data) => {
          const days = data.documents?.map((slot: any) => slot.day) || [];
          setOccupiedDays(days);
        })
        .catch((err) => {
          console.error("Error fetching doctor time slots:", err);
          setOccupiedDays([]);
        });
    } else {
      form.reset({
        docId: "",
        day: "",
        time: [],
      });
      setDoctor(null);
      setOccupiedDays([]);
    }
  }, [timeSlot, doctorId, form]);

  const handleSubmit = async (data: AvailabilityFormData) => {
    try {
      setSubmitting(true);
      await onSubmit(data, timeSlot?.$id);
      form.reset();
      setDoctor(null);
      setOccupiedDays([]);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const addTime = () => {
    if (selectedTime) {
      const current = form.getValues("time") || [];

      if (current.includes(selectedTime)) {
        showToast.warning("Duplicate Time", "This time has already been added");
        return;
      }

      form.setValue("time", [...current, selectedTime]);
      setSelectedTime("");
    }
  };

  const removeTime = (index: number) => {
    const current = form.getValues("time") || [];
    form.setValue(
      "time",
      current.filter((_, i) => i !== index)
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !submitting) {
      onOpenChange(newOpen);
    }
  };

  const availableTimesForSelection = TIME_SLOTS.filter(
    (time) => !form.watch("time")?.includes(time)
  );

  // Filter available days - when editing, show current day + unoccupied days
  // When adding new, only show unoccupied days
  const availableDays = DAYS_OF_WEEK.filter((day) => {
    if (timeSlot) {
      // When editing, allow the current day or unoccupied days
      return day === timeSlot.day || !occupiedDays.includes(day);
    }
    // When adding new, only show unoccupied days
    return !occupiedDays.includes(day);
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {timeSlot ? "Edit Availability" : "Add Availability"}
          </DialogTitle>
          <DialogDescription>
            {timeSlot
              ? "Update doctor availability schedule"
              : "Set availability schedule for the doctor"}
          </DialogDescription>
        </DialogHeader>

        {doctor && (
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={doctor.image} className="object-cover" />
              <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{doctor.name}</p>
              <p className="text-sm text-muted-foreground">
                {doctor.specialty}
              </p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!!timeSlot}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableDays.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground text-center">
                          All days already have time slots
                        </div>
                      ) : (
                        availableDays.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={() => (
                <FormItem>
                  <FormLabel>Available Times</FormLabel>
                  <div className="flex gap-2">
                    <Select
                      value={selectedTime}
                      onValueChange={setSelectedTime}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimesForSelection.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTime}
                      disabled={!selectedTime}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {form.watch("time") && form.watch("time")!.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch("time")!.map((time, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="gap-1"
                        >
                          {time}
                          <button
                            type="button"
                            onClick={() => removeTime(index)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

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