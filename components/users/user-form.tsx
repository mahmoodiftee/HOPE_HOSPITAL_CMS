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

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.coerce.number().int("Age must be a whole number").min(1, "Age must be at least 1").max(150, "Age must be realistic"),
  phone: z.string()
    .regex(/^01[1-9]\d{8}$/, "Phone must be 11 digits starting with 01-019 (e.g., 01700000000)")
    .length(11, "Phone must be exactly 11 digits"),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  open: boolean;
  user?: { $id: string; name: string; age?: number; phone?: string };
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData, id?: string) => Promise<void>;
  isLoading?: boolean;
}

export function UserForm({
  open,
  user,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: UserFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      age: undefined,
      phone: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        age: user.age || undefined,
        phone: user.phone || "",
      });
    } else {
      form.reset({
        name: "",
        age: undefined,
        phone: "",
      });
    }
  }, [user, form]);

  const handleSubmit = async (data: UserFormData) => {
    try {
      setSubmitting(true);
      await onSubmit(data, user?.$id);
      form.reset();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !submitting) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add User"}</DialogTitle>
          <DialogDescription>
            {user ? "Update user information" : "Add a new user to the system"}
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
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="e.g., 25" 
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel"
                      placeholder="01700000000" 
                      maxLength={11}
                      {...field} 
                    />
                  </FormControl>
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