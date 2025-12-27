import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatsCard({ label, value, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <div className={cn("glass rounded-xl p-5", className)}>
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-5 h-5 text-primary" />
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              trend === "up" && "bg-success/20 text-success",
              trend === "down" && "bg-destructive/20 text-destructive",
              trend === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground font-mono">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
