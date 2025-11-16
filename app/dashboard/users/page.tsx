'use client';

import { useState } from 'react';
import { UsersTable } from '@/components/users/users-table';
import { UserForm } from '@/components/users/user-form';

interface User {
  $id: string;
  email: string;
  name: string;
  role?: string;
  phone?: string;
  createdAt: string;
}

export default function UsersPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
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
    try {
      const url = id ? `/api/users/${id}` : '/api/users';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage system users and their roles
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
