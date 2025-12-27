import { TrendingUp, TrendingDown, Pause, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SignalType } from "./SignalCard";

interface HistoryItem {
  id: number;
  signal: SignalType;
  time: string;
  reason: string;
}

interface SignalHistoryProps {
  history: HistoryItem[];
  className?: string;
}

const iconMap = {
  COMPRA: TrendingUp,
  VENDA: TrendingDown,
  AGUARDAR: Pause,
};

const colorMap = {
  COMPRA: "text-success bg-success/10",
  VENDA: "text-destructive bg-destructive/10",
  AGUARDAR: "text-muted-foreground bg-muted",
};

export function SignalHistory({ history, className }: SignalHistoryProps) {
  return (
    <div className={cn("glass rounded-xl p-6", className)}>
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Histórico de Sinais</h3>
      </div>

      {history.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Nenhum sinal registrado ainda
        </p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {history.map((item, index) => {
            const Icon = iconMap[item.signal];
            return (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50 animate-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    colorMap[item.signal]
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={cn(
                        "font-semibold text-sm",
                        item.signal === "COMPRA" && "text-success",
                        item.signal === "VENDA" && "text-destructive",
                        item.signal === "AGUARDAR" && "text-muted-foreground"
                      )}
                    >
                      {item.signal}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/70 truncate">{item.reason}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
