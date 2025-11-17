// components/providers/toaster-provider.tsx
"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function ToasterProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme as "light" | "dark" | "system"}
      position="top-center"
      richColors
      closeButton
      expand={false}
      duration={3000}
      toastOptions={{
        classNames: {
          error: "border-destructive",
          success: "border-green-500",
          warning: "border-yellow-500",
          info: "border-blue-500",
        },
      }}
    />
  );
}
