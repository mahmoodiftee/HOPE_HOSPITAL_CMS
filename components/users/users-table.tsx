"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SpinnerCustom } from "../ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface User {
  $id: string;
  name: string;
  age?: string;
  phone?: string;
  image?: string;
  $createdAt: string;
}

interface UsersTableProps {
  onEdit: (user: User) => void;
  onAddNew: () => void;
  refreshTrigger?: number;
}

export function UsersTable({
  onEdit,
  onAddNew,
  refreshTrigger,
}: UsersTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(5);

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });

  const { data, error, isLoading, mutate } = useSWR(
    `/api/users?${queryParams}`,
    (url) => fetch(url).then((res) => res.json()),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    mutate();
  }, [refreshTrigger, mutate]);

  useEffect(() => {
    if (error) {
      showToast.error("Failed to load users", "Please refresh the page");
    }
  }, [error]);

  const handleDelete = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.$id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      showToast.success(
        "User Deleted",
        `${user.name} has been removed from the system`
      );

      mutate();
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast.error(
        "Delete Failed",
        "Unable to delete user. Please try again."
      );
    }
  };

  const users = data?.documents || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium">Search</label>
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Button onClick={onAddNew}>Add User</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden md:table-cell">User</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="hidden md:table-cell">Created</TableHead>
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
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user: User) => (
              <TableRow key={user.$id}>
                <TableCell className="hidden md:table-cell">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.image} className="object-cover" />
                    <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.age}</TableCell>
                <TableCell>{user.phone || "-"}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(user.$createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(user)}
                      title="Edit user"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {user.name}? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(user)}
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
