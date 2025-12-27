import { useState, useEffect } from "react";
import { SignalCard, SignalType } from "@/components/SignalCard";
import { StatusIndicator } from "@/components/StatusIndicator";
import { SignalHistory } from "@/components/SignalHistory";
import { PrismaLogo } from "@/components/PrismaLogo";
import { StatsCard } from "@/components/StatsCard";
import { BarChart3, Target, Zap, Clock } from "lucide-react";

const mockSignals = [
  {
    id: 1,
    signal: "COMPRA" as SignalType,
    time: "14:57:00",
    reason: "Formação de candle de reversão em zona de suporte. Pavio inferior longo indicando rejeição de preço baixo.",
  },
  {
    id: 2,
    signal: "AGUARDAR" as SignalType,
    time: "14:56:00",
    reason: "Mercado em consolidação lateral. Sem padrão claro identificado.",
  },
  {
    id: 3,
    signal: "VENDA" as SignalType,
    time: "14:55:00",
    reason: "Corpo travou em zona de pavio superior. Resistência forte identificada.",
  },
];

export default function Index() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isActive, setIsActive] = useState(true);
  const [currentSignal, setCurrentSignal] = useState({
    signal: "COMPRA" as SignalType,
    time: "14:57:00",
    reason: "Formação de candle de reversão em zona de suporte. Pavio inferior longo indicando rejeição de preço baixo.",
  });
  const [history, setHistory] = useState(mockSignals);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background grid effect */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <PrismaLogo className="w-16 h-16 float" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="text-gradient">PRISMA</span>
                <span className="text-foreground"> IA</span>
              </h1>
              <p className="text-muted-foreground text-sm">Motor de Análise Técnica M1</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <StatusIndicator isActive={isActive} />
            <div className="glass rounded-xl px-4 py-2 font-mono text-lg">
              <span className="text-muted-foreground text-sm mr-2">Horário</span>
              <span className="text-primary">{formatTime(currentTime)}</span>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            icon={Target} 
            label="Sinais Hoje" 
            value={12} 
            trend="up" 
          />
          <StatsCard 
            icon={BarChart3} 
            label="Taxa de Acerto" 
            value="73%" 
            trend="up" 
          />
          <StatsCard 
            icon={Zap} 
            label="Último Sinal" 
            value="2min" 
            trend="neutral" 
          />
          <StatsCard 
            icon={Clock} 
            label="Tempo Ativo" 
            value="4h 32m" 
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Current Signal - Takes more space */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <h2 className="text-lg font-semibold text-foreground">Sinal Atual</h2>
            </div>
            <SignalCard
              signal={currentSignal.signal}
              time={currentSignal.time}
              reason={currentSignal.reason}
            />

            {/* Info Panel */}
            <div className="mt-6 glass rounded-xl p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                Filtros Ativos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-sm">Análise de Contexto</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-sm">Detecção de Pavios</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-sm">Velas de Descanso</span>
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="lg:col-span-2">
            <SignalHistory history={history} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            Powered by <span className="text-primary font-medium">Gemini 1.5 Flash</span> • 
            Análise automática nos segundos finais de cada minuto
          </p>
        </footer>
      </div>
    </div>
  );
}
