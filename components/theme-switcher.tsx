"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Moon, Sun, Monitor } from "lucide-react";
import { useState, useEffect } from "react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { theme, setTheme } = useTheme();

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" title="Toggle theme">
          {theme === "dark" ? (
            <Moon className="w-5 h-5" />
          ) : theme === "light" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Monitor className="w-5 h-5" />
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Choose Theme</DrawerTitle>
          <DrawerDescription>
            Select your preferred color scheme
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-6 space-y-3">
          <button
            onClick={() => setTheme("light")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
              theme === "light"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Sun className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium text-foreground">Light</p>
              <p className="text-xs text-muted-foreground">
                Claude Light Theme
              </p>
            </div>
            {theme === "light" && (
              <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
            )}
          </button>

          <button
            onClick={() => setTheme("dark")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
              theme === "dark"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Moon className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium text-foreground">Dark</p>
              <p className="text-xs text-muted-foreground">Claude Dark Theme</p>
            </div>
            {theme === "dark" && (
              <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
            )}
          </button>

          <button
            onClick={() => setTheme("system")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
              theme === "system"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Monitor className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium text-foreground">System</p>
              <p className="text-xs text-muted-foreground">
                Use system preferences
              </p>
            </div>
            {theme === "system" && (
              <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}