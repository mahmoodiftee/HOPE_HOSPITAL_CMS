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
import { DoctorSelector } from "./doctor-selector";

interface TimeSlot {
  $id: string;
  day: string;
  time: string[];
  $createdAt: string;
}

interface Doctor {
  $id: string;
  name: string;
  specialty: string;
  image?: string;
}

interface DoctorWithTimeSlots {
  doctorId: string;
  doctor: Doctor;
  timeSlots: TimeSlot[];
}

interface AvailabilityTableProps {
  onEdit: (timeSlot: TimeSlot & { doctor?: Doctor; docId: string }) => void;
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
    if (error) {
      showToast.error(
        "Failed to load availability data",
        "Please refresh the page"
      );
    }
  }, [error]);

  const handleDelete = async (timeSlotId: string, day: string, doctorName: string) => {
    try {
      const response = await fetch(`/api/time-slots/${timeSlotId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete time slot");
      }

      showToast.success(
        "Availability Deleted",
        `Availability for ${doctorName} on ${day} has been removed`
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

  const doctorsWithTimeSlots: DoctorWithTimeSlots[] = data?.documents || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4 w-full">
      {/* Header Section - Responsive */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end sm:justify-between">
        <div className="flex-1 w-full sm:max-w-md">
          <label className="text-sm font-medium mb-2 block">Select Doctor</label>
          <DoctorSelector
            doctors={availableDoctors}
            value={selectedDoctorId}
            onChange={setSelectedDoctorId}
          />
        </div>
        <Button
          onClick={handleAddNewClick}
          disabled={!selectedDoctorId}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Availability
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead className="min-w-[400px]">Schedule</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <SpinnerCustom className="text-primary" />
                </TableCell>
              </TableRow>
            ) : doctorsWithTimeSlots.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No availability data found
                </TableCell>
              </TableRow>
            ) : (
              doctorsWithTimeSlots.map((item) => (
                <TableRow key={item.doctorId}>
                  <TableCell>
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={item.doctor?.image}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {item.doctor?.name || "Loading..."}
                  </TableCell>
                  <TableCell>
                    {item.doctor?.specialty || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {item.timeSlots.map((slot) => (
                        <div
                          key={slot.$id}
                          className="flex items-center justify-between gap-4 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <Badge variant="secondary" className="shrink-0 mt-0.5">
                              {slot.day}
                            </Badge>
                            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                              {slot.time.map((time, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {time}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                onEdit({
                                  ...slot,
                                  doctor: item.doctor,
                                  docId: item.doctorId,
                                })
                              }
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
                                  <AlertDialogTitle>
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the availability
                                    for {item.doctor?.name} on {slot.day}. This
                                    action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDelete(
                                        slot.$id,
                                        slot.day,
                                        item.doctor?.name
                                      )
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <SpinnerCustom className="text-primary" />
          </div>
        ) : doctorsWithTimeSlots.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No availability data found
          </div>
        ) : (
          doctorsWithTimeSlots.map((item) => (
            <div
              key={item.doctorId}
              className="border rounded-lg p-4 space-y-4 bg-card"
            >
              {/* Doctor Info */}
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage
                    src={item.doctor?.image}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    <User />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base">
                    {item.doctor?.name || "Loading..."}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.doctor?.specialty || "-"}
                  </p>
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                {item.timeSlots.map((slot) => (
                  <div
                    key={slot.$id}
                    className="p-3 rounded-lg bg-muted/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{slot.day}</Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onEdit({
                              ...slot,
                              doctor: item.doctor,
                              docId: item.doctorId,
                            })
                          }
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the availability for{" "}
                                {item.doctor?.name} on {slot.day}. This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                              <AlertDialogCancel className="w-full sm:w-auto">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDelete(
                                    slot.$id,
                                    slot.day,
                                    item.doctor?.name
                                  )
                                }
                                className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {slot.time.map((time, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination - Responsive */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-between sm:items-center py-2">
        <div className="text-sm text-muted-foreground text-center sm:text-left">
          Page {page} of {totalPages} ({total} total)
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex items-center justify-center sm:justify-start gap-2">
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
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex-1 sm:flex-none"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
              disabled={page >= totalPages}
              className="flex-1 sm:flex-none"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}