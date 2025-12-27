import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";

interface StatusIndicatorProps {
  isActive: boolean;
  className?: string;
}

export function StatusIndicator({ isActive, className }: StatusIndicatorProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full glass",
        className
      )}
    >
      <div className="relative">
        <div
          className={cn(
            "w-2.5 h-2.5 rounded-full",
            isActive ? "bg-success" : "bg-muted-foreground"
          )}
        />
        {isActive && (
          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-success animate-ping" />
        )}
      </div>
      <Activity className={cn("w-4 h-4", isActive ? "text-success" : "text-muted-foreground")} />
      <span
        className={cn(
          "text-sm font-medium",
          isActive ? "text-success" : "text-muted-foreground"
        )}
      >
        {isActive ? "Monitorando" : "Inativo"}
      </span>
    </div>
  );
}
