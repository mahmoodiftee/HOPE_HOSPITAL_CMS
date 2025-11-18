"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FixedSizeList } from "react-window";

interface Doctor {
    $id: string;
    name: string;
    specialty: string;
    image?: string;
}

interface DoctorSelectorProps {
    doctors: Doctor[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function DoctorSelector({
    doctors,
    value,
    onChange,
    disabled = false,
}: DoctorSelectorProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");

    const selectedDoctor = doctors.find((doctor) => doctor.$id === value);

    const filteredDoctors = React.useMemo(() => {
        if (!search) return doctors;
        const searchLower = search.toLowerCase();
        return doctors.filter(
            (doctor) =>
                doctor.name.toLowerCase().includes(searchLower) ||
                doctor.specialty.toLowerCase().includes(searchLower)
        );
    }, [doctors, search]);

    const Row = React.useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
        const doctor = filteredDoctors[index];
        const isSelected = value === doctor.$id;

        return (
            <div
                style={style}
                className={cn(
                    "flex items-center justify-between px-2 py-2 cursor-pointer hover:bg-accent rounded-sm transition-colors",
                    isSelected && "bg-accent"
                )}
                onClick={() => {
                    onChange(doctor.$id);
                    setOpen(false);
                    setSearch("");
                }}
            >
                <div className="flex items-start gap-2 flex-1 min-w-0">
                    <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={doctor.image} className="object-cover" />
                        <AvatarFallback className="text-xs">
                            {doctor.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                        <span className="font-medium text-sm truncate">{doctor.name}</span>
                        <span className="text-xs text-muted-foreground truncate">
                            {doctor.specialty}
                        </span>
                    </div>
                </div>
                <Check
                    className={cn(
                        "h-4 w-4 shrink-0 ml-2",
                        isSelected ? "opacity-100" : "opacity-0"
                    )}
                />
            </div>
        );
    }, [filteredDoctors, value, onChange]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={disabled}
                >
                    {selectedDoctor ? (
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Avatar className="h-6 w-6 shrink-0">
                                <AvatarImage
                                    src={selectedDoctor.image}
                                    className="object-cover"
                                />
                                <AvatarFallback className="text-xs">
                                    {selectedDoctor.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-sm sm:text-base">
                                {selectedDoctor.name}
                            </span>
                            <span className="hidden sm:inline text-xs text-muted-foreground shrink-0">
                                ({selectedDoctor.specialty})
                            </span>
                        </div>
                    ) : (
                        <span className="text-sm sm:text-base">Choose a doctor</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] max-w-[95vw] sm:w-[400px] p-0"
                align="start"
                side="bottom"
                sideOffset={4}
            >
                <div className="flex flex-col">
                    <div className="flex items-center justify-between gap-2 py-1 border-b px-3">
                        <Input
                            placeholder="Search doctors..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                        />
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    </div>

                    {filteredDoctors.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground px-4">
                            {doctors.length === 0
                                ? "No doctors found without time slots"
                                : "No doctor found"}
                        </div>
                    ) : (
                        <FixedSizeList
                            height={Math.min(300, filteredDoctors.length * 60)}
                            itemCount={filteredDoctors.length}
                            itemSize={60}
                            width="100%"
                            overscanCount={3}
                        >
                            {Row}
                        </FixedSizeList>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}