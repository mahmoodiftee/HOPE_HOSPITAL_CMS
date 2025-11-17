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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit2, Trash2, User, Plus } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/lib/toast";

interface TimeSlot {
  $id: string;
  doctorId: string;
  availableDays: string[];
  availableTimes: string[];
}

interface Doctor {
  $id: string;
  name: string;
  specialty: string;
  image?: string;
}

interface AvailabilityTableProps {
  onEdit: (timeSlot: TimeSlot & { doctor?: Doctor }) => void;
  onAddNew: (doctorId: string) => void;
  refreshTrigger?: number;
}

export function AvailabilityTable({
  onEdit,
  onAddNew,
  refreshTrigger,
}: AvailabilityTableProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [doctors, setDoctors] = useState<Record<string, Doctor>>({});
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const { data, error, isLoading, mutate } = useSWR(
    `/api/time-slots?${queryParams}`,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response");
      }
      return res.json();
    },
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    fetch("/api/availability")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch available doctors");
        }
        return res.json();
      })
      .then((data) => setAvailableDoctors(data))
      .catch((err) => {
        console.error("Error fetching available doctors:", err);
        showToast.error("Failed to load available doctors");
      });
  }, [refreshTrigger]);

  useEffect(() => {
    mutate();
  }, [refreshTrigger, mutate]);

  useEffect(() => {
    if (data?.documents) {
      const doctorIds = [
        ...new Set(data.documents.map((slot: TimeSlot) => slot.doctorId)),
      ];

      Promise.all(
        doctorIds.map((id) =>
          fetch(`/api/doctors/${id}`).then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch doctor ${id}`);
            return res.json();
          })
        )
      )
        .then((fetchedDoctors) => {
          const doctorMap: Record<string, Doctor> = {};
          fetchedDoctors.forEach((doc) => {
            doctorMap[doc.$id] = doc;
          });
          setDoctors(doctorMap);
        })
        .catch((err) => {
          console.error("Error fetching doctors:", err);
        });
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      showToast.error(
        "Failed to load availability data",
        "Please refresh the page"
      );
    }
  }, [error]);

  const handleDelete = async (timeSlot: TimeSlot) => {
    try {
      const response = await fetch(`/api/time-slots/${timeSlot.$id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete time slot");
      }

      const doctor = doctors[timeSlot.doctorId];
      showToast.success(
        "Availability Deleted",
        `Availability for ${doctor?.name || "doctor"} has been removed`
      );

      mutate();
      fetch("/api/availability")
        .then((res) => res.json())
        .then((data) => setAvailableDoctors(data));
    } catch (error) {
      console.error("Error deleting time slot:", error);
      showToast.error(
        "Delete Failed",
        "Unable to delete availability. Please try again."
      );
    }
  };

  const handleAddNewClick = () => {
    if (selectedDoctorId) {
      onAddNew(selectedDoctorId);
      setSelectedDoctorId("");
    } else {
      showToast.warning("No Doctor Selected", "Please select a doctor first");
    }
  };

  const timeSlots = data?.documents || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4 overflow-auto">
      <div className="flex gap-4 items-end justify-between">
        <div className="flex gap-4 items-end flex-1">
          <div className="flex-1 max-w-md">
            <label className="text-sm font-medium">Select Doctor</label>
            <Select
              value={selectedDoctorId}
              onValueChange={setSelectedDoctorId}
            >
              <SelectTrigger suppressHydrationWarning>
                <SelectValue placeholder="Choose a doctor without time slots" />
              </SelectTrigger>
              <SelectContent>
                {availableDoctors.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground text-center">
                    No doctors found <br />
                    without time slots
                  </div>
                ) : (
                  availableDoctors.map((doctor) => (
                    <SelectItem key={doctor.$id} value={doctor.$id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={doctor.image}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-xs">
                            {doctor.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{doctor.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({doctor.specialty})
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleAddNewClick} disabled={!selectedDoctorId}>
          <Plus className="w-4 h-4 mr-2" />
          Add Availability
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Doctor</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Specialty</TableHead>
            <TableHead>Available Days</TableHead>
            <TableHead>Available Times</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <SpinnerCustom className="text-primary" />
              </TableCell>
            </TableRow>
          ) : timeSlots.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No availability data found
              </TableCell>
            </TableRow>
          ) : (
            timeSlots.map((timeSlot: TimeSlot) => {
              const doctor = doctors[timeSlot.doctorId];
              return (
                <TableRow key={timeSlot.$id}>
                  <TableCell>
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={doctor?.image}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {doctor?.name || "Loading..."}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {doctor?.specialty || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {timeSlot.availableDays?.slice(0, 3).map((day, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {day}
                        </Badge>
                      ))}
                      {timeSlot.availableDays?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{timeSlot.availableDays.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {timeSlot.availableTimes?.slice(0, 3).map((time, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {time}
                        </Badge>
                      ))}
                      {timeSlot.availableTimes?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{timeSlot.availableTimes.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit({ ...timeSlot, doctor })}
                        title="Edit availability"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            title="Delete availability"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the availability for{" "}
                              {doctor?.name}. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(timeSlot)}
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
              );
            })
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
            <SelectTrigger className="w-20">
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
