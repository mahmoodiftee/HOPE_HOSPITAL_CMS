"use client";

import { useState } from "react";
import { UsersTable } from "@/components/users/users-table";
import { UserForm } from "@/components/users/user-form";
import { showToast } from "@/lib/toast";

interface User {
  $id: string;
  name: string;
  age?: string;
  phone?: string;
  image?: string;
  $createdAt?: string;
}

export default function UsersPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | any>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedUser(undefined);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: any, id?: string) => {
    const isEdit = !!id;
    const url = id ? `/api/users/${id}` : "/api/users";
    const method = id ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save user");
      }

      showToast.success(
        isEdit ? "User Updated" : "User Created",
        isEdit
          ? `${data.name} has been updated successfully`
          : `${data.name} has been added to the system`
      );

      setRefreshTrigger((prev) => prev + 1);
      setFormOpen(false);
    } catch (error) {
      console.error("Error:", error);
      showToast.error(
        isEdit ? "Update Failed" : "Creation Failed",
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Users</h1>
        <p className="text-muted-foreground mt-1">
          Manage system users and their status.
        </p>
      </div>

      <UsersTable
        onEdit={handleEdit}
        onAddNew={handleAddNew}
        refreshTrigger={refreshTrigger}
      />

      <UserForm
        open={formOpen}
        user={selectedUser}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
