"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SpinnerCustom } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit2, Trash2, User, Calendar } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { showToast } from "@/lib/toast";

interface Doctor {
  $id: string;
  name: string;
  specialty: string;
  hourlyRate: number;
  image?: string;
  experience?: string;
  specialties?: string[];
}

interface TimeSlot {
  $id: string;
  doctorId: string;
  availableDays?: string[];
  availableTimes?: string[];
}

interface DoctorsTableProps {
  onEdit: (doctor: Doctor) => void;
  onAddNew: () => void;
  refreshTrigger?: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function DoctorsTable({
  onEdit,
  onAddNew,
  refreshTrigger,
}: DoctorsTableProps) {
  const [page, setPage] = useState(1);
  const [specialty, setSpecialty] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [limit, setLimit] = useState(5);
  const [doctorTimeSlots, setDoctorTimeSlots] = useState<
    Record<string, TimeSlot[]>
  >({});
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(specialty && specialty !== "all" && { specialty }),
    ...(search && { search }),
  });

  const { data, error, isLoading, mutate } = useSWR(
    `/api/doctors?${queryParams}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    fetch("/api/specialties")
      .then((res) => res.json())
      .then((data) => setSpecialties(data))
      .catch((err) => console.error("Error fetching specialties:", err));
  }, []);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!data?.documents?.length) return;

      setLoadingTimeSlots(true);
      const slots: Record<string, TimeSlot[]> = {};

      try {
        await Promise.all(
          data.documents.map(async (doctor: Doctor) => {
            try {
              const response = await fetch(
                `/api/time-slots?doctorId=${doctor.$id}`
              );
              if (response.ok) {
                const timeSlots = await response.json();
                slots[doctor.$id] = Array.isArray(timeSlots)
                  ? timeSlots
                  : timeSlots?.documents || [];
              } else {
                slots[doctor.$id] = [];
              }
            } catch {
              slots[doctor.$id] = [];
            }
          })
        );
        setDoctorTimeSlots(slots);
      } finally {
        setLoadingTimeSlots(false);
      }
    };

    fetchTimeSlots();
  }, [data]);

  useEffect(() => {
    mutate();
  }, [refreshTrigger, mutate]);

  useEffect(() => {
    if (error) {
      showToast.error("Failed to load doctors", "Please refresh the page");
    }
  }, [error]);

  const handleDelete = async (doctor: Doctor) => {
    try {
      const response = await fetch(`/api/doctors/${doctor.$id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete doctor");

      showToast.success("Doctor Deleted", `${doctor.name} has been removed`);
      mutate();
    } catch (error) {
      showToast.error(
        "Delete Failed",
        "Unable to delete doctor. Please try again."
      );
    }
  };

  const truncate = (text: string, maxLength: number) =>
    text.length <= maxLength ? text : text.slice(0, maxLength) + "...";

  const getDayAbbreviation = (day: string) => {
    const abbreviations: Record<string, string> = {
      Monday: "Mon",
      Tuesday: "Tue",
      Wednesday: "Wed",
      Thursday: "Thu",
      Friday: "Fri",
      Saturday: "Sat",
      Sunday: "Sun",
    };
    return abbreviations[day] || day;
  };

  const renderTimeSlots = (doctorId: string) => {
    const slots = doctorTimeSlots[doctorId];

    if (loadingTimeSlots) {
      return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <SpinnerCustom className="h-3 w-3" />
          <span>Loading...</span>
        </div>
      );
    }

    if (!slots?.length) {
      return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>No schedule</span>
        </div>
      );
    }

    const scheduleData = slots[0];
    const { availableDays = [], availableTimes = [] } = scheduleData;

    if (!availableDays.length || !availableTimes.length) {
      return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>No schedule</span>
        </div>
      );
    }

    const dayOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const sortedDays = [...availableDays].sort(
      (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
    );

    const sortedTimes = [...availableTimes].sort((a, b) => {
      const timeToMinutes = (time: string) => {
        const [timePart, period] = time.split(" ");
        const [hours, minutes] = timePart.split(":").map(Number);
        let hour24 = hours;
        if (period === "PM" && hours !== 12) hour24 += 12;
        if (period === "AM" && hours === 12) hour24 = 0;
        return hour24 * 60 + minutes;
      };
      return timeToMinutes(a) - timeToMinutes(b);
    });

    const displayDays = sortedDays.slice(0, 2);
    const remainingDays = sortedDays.slice(2);
    const timeRange = `${sortedTimes[0]} - ${
      sortedTimes[sortedTimes.length - 1]
    }`;

    return (
      <div className="flex flex-col gap-1">
        {displayDays.map((day) => (
          <div key={day} className="flex items-center gap-2 text-xs">
            <span className="font-medium text-muted-foreground min-w-[35px]">
              {getDayAbbreviation(day)}:
            </span>
            <span className="text-foreground">{timeRange}</span>
          </div>
        ))}

        {remainingDays.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-xs text-primary hover:underline text-left">
                  +{remainingDays.length} more day
                  {remainingDays.length > 1 ? "s" : ""}
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <div className="flex flex-col gap-1">
                  {remainingDays.map((day) => (
                    <div key={day} className="flex items-center gap-2 text-xs">
                      <span className="font-medium min-w-[35px]">
                        {getDayAbbreviation(day)}:
                      </span>
                      <span>{timeRange}</span>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  const doctors = data?.documents || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4 overflow-auto">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium">Search</label>
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
          <Select
            value={specialty}
            onValueChange={(v) => {
              setSpecialty(v);
              setPage(1);
            }}
          >
            <SelectTrigger suppressHydrationWarning>
              <SelectValue placeholder="All specialties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All specialties</SelectItem>
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
            <TableHead>Doctor</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Department</TableHead>
            <TableHead className="hidden md:table-cell">
              Visiting Fees
            </TableHead>
            <TableHead className="hidden lg:table-cell">Experience</TableHead>
            <TableHead className="hidden xl:table-cell">Specialties</TableHead>
            <TableHead className="hidden lg:table-cell">Schedule</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <SpinnerCustom className="text-primary" />
              </TableCell>
            </TableRow>
          ) : doctors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                No doctors found
              </TableCell>
            </TableRow>
          ) : (
            doctors.map((doctor: Doctor) => (
              <TableRow key={doctor.$id}>
                <TableCell>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={doctor.image} className="object-cover" />
                    <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-semibold">{doctor.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {doctor.specialty}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  ${doctor.hourlyRate}
                </TableCell>
                <TableCell className="hidden lg:table-cell max-w-[200px] truncate">
                  {doctor.experience || "-"}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="flex flex-col gap-1 items-start">
                    {doctor.specialties?.length ? (
                      <>
                        {doctor.specialties.slice(0, 2).map((spec, i) => (
                          <span
                            key={i}
                            className="inline-block px-2 py-0.5 text-xs rounded-md bg-muted"
                          >
                            {truncate(spec, 70)}
                          </span>
                        ))}
                        {doctor.specialties.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{doctor.specialties.length - 2} more
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {renderTimeSlots(doctor.$id)}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(doctor)}
                      title="Edit doctor"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          title="Delete doctor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete {doctor.name} and all
                            associated time slots. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(doctor)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex gap-2 justify-between items-center py-2">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages} ({total} total)
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-sm">Rows per page:</span>
          <Select
            value={limit.toString()}
            onValueChange={(value) => {
              setPage(1);
              setLimit(Number(value));
            }}
          >
            <SelectTrigger className="w-20" suppressHydrationWarning>
              <SelectValue placeholder={limit.toString()} />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
