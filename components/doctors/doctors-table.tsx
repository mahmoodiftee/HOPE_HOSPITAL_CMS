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
import { Edit2, Trash2, User } from "lucide-react";
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

  const doctors = data?.documents || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4 w-full">
      {/* Filters Section - Responsive */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Search</label>
          <Input
            placeholder="Search doctors..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full sm:w-40">
          <label className="text-sm font-medium mb-2 block">Specialty</label>
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
        <Button onClick={onAddNew} className="w-full sm:w-auto">
          Add Doctor
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Visiting Fees</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Specialties</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <SpinnerCustom className="text-primary" />
                </TableCell>
              </TableRow>
            ) : doctors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
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
                  <TableCell>{doctor.specialty}</TableCell>
                  <TableCell>৳{doctor.hourlyRate}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {doctor.experience || "-"}
                  </TableCell>
                  <TableCell>
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
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <SpinnerCustom className="text-primary" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No doctors found
          </div>
        ) : (
          doctors.map((doctor: Doctor) => (
            <div
              key={doctor.$id}
              className="border rounded-lg p-4 space-y-4 bg-card"
            >
              {/* Doctor Header */}
              <div className="flex items-start gap-3">
                <Avatar className="h-14 w-14 shrink-0">
                  <AvatarImage src={doctor.image} className="object-cover" />
                  <AvatarFallback>
                    <User />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base mb-1">
                    {doctor.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {doctor.specialty}
                  </p>
                </div>
              </div>

              {/* Doctor Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Visiting Fees:</span>
                  <span className="font-medium">৳{doctor.hourlyRate}</span>
                </div>

                {doctor.experience && (
                  <div className="flex flex-col justify-between items-start gap-2">
                    <span className="font-medium text-muted-foreground shrink-0">Experience:</span>
                    <span className="">{truncate(doctor.experience, 70)}</span>
                  </div>
                )}

                {doctor.specialties && doctor.specialties.length > 0 && (
                  <div>
                    <span className="font-medium text-muted-foreground block mb-2">
                      Specialties:
                    </span>
                    <div className="flex flex-wrap gap-1 text-xs">
                      {doctor.specialties.slice(0, 3).map((spec, i) => (
                        <span
                          key={i}
                          className=""
                        >
                          - {truncate(spec, 100)}
                        </span>
                      ))}
                      {doctor.specialties.length > 3 && (
                        <span className="inline-block px-2 py-1 text-xs text-muted-foreground">
                          +{doctor.specialties.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => onEdit(doctor)}
                  className="flex-1"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete {doctor.name} and all
                        associated time slots. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="w-full sm:w-auto">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(doctor)}
                        className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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