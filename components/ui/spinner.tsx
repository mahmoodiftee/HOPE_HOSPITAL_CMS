import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("h-8 w-8 animate-spin", className)}
      {...props}
    />
  );
}

interface SpinnerCustomProps {
  className?: string;
}

export function SpinnerCustom({ className }: SpinnerCustomProps) {
  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      <Spinner />
    </div>
  );
}
