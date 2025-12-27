import { TrendingUp, TrendingDown, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

export type SignalType = "COMPRA" | "VENDA" | "AGUARDAR";

interface SignalCardProps {
  signal: SignalType;
  time: string;
  reason: string;
  className?: string;
}

const signalConfig = {
  COMPRA: {
    icon: TrendingUp,
    label: "COMPRA",
    bgClass: "bg-success/10 border-success/30",
    textClass: "text-success",
    glowClass: "glow-success",
  },
  VENDA: {
    icon: TrendingDown,
    label: "VENDA",
    bgClass: "bg-destructive/10 border-destructive/30",
    textClass: "text-destructive",
    glowClass: "glow-destructive",
  },
  AGUARDAR: {
    icon: Pause,
    label: "AGUARDAR",
    bgClass: "bg-muted/50 border-border",
    textClass: "text-muted-foreground",
    glowClass: "",
  },
};

export function SignalCard({ signal, time, reason, className }: SignalCardProps) {
  const config = signalConfig[signal];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "glass rounded-xl p-6 border-2 transition-all duration-500 animate-fade-in",
        config.bgClass,
        config.glowClass,
        className
      )}
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className={cn(
            "w-16 h-16 rounded-xl flex items-center justify-center",
            signal === "COMPRA" && "bg-success/20",
            signal === "VENDA" && "bg-destructive/20",
            signal === "AGUARDAR" && "bg-muted"
          )}
        >
          <Icon className={cn("w-8 h-8", config.textClass)} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-mono">SINAL DETECTADO</p>
          <h2 className={cn("text-3xl font-bold tracking-tight", config.textClass)}>
            {config.label}
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <span className="text-sm text-muted-foreground">Horário</span>
          <span className="font-mono text-foreground">{time}</span>
        </div>
        <div className="pt-2">
          <p className="text-sm text-muted-foreground mb-1">Motivo</p>
          <p className="text-foreground/90 leading-relaxed">{reason}</p>
        </div>
      </div>
    </div>
  );
}
