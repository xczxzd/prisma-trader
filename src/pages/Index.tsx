import { useState, useEffect, useCallback } from "react";
import { SignalCard, SignalType } from "@/components/SignalCard";
import { StatusIndicator } from "@/components/StatusIndicator";
import { SignalHistory } from "@/components/SignalHistory";
import { PrismaLogo } from "@/components/PrismaLogo";
import { StatsCard } from "@/components/StatsCard";
import { ScreenCaptureControl } from "@/components/ScreenCaptureControl";
import { BarChart3, Target, Zap, Clock, Volume2, VolumeX } from "lucide-react";
import { useScreenCapture } from "@/hooks/useScreenCapture";
import { useAudioNotification } from "@/hooks/useAudioNotification";
import type { SignalHistoryItem } from "@/types";

export default function Index() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentSignal, setCurrentSignal] = useState<{
    signal: SignalType;
    time: string;
    reason: string;
    asset?: string;
  } | null>(null);
  const [history, setHistory] = useState<SignalHistoryItem[]>([]);
  const [stats, setStats] = useState({
    signalsToday: 0,
    winRate: 0,
    lastSignal: '-',
    activeTime: '0m',
  });

  const {
    isCapturing,
    isSynced,
    isAnalyzing,
    countdown,
    captureError,
    setCaptureError,
    handleCaptureStart,
    handleCaptureStop,
    handleSync,
    analyzeFrame,
  } = useScreenCapture();

  const { speak, announceSignal, playAlertSound } = useAudioNotification();

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tempo ativo
  useEffect(() => {
    if (!isCapturing) {
      setStats(prev => ({ ...prev, activeTime: '0m' }));
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const minutes = Math.floor(elapsed / 60000);
      const hours = Math.floor(minutes / 60);
      if (hours > 0) {
        setStats(prev => ({ ...prev, activeTime: `${hours}h ${minutes % 60}m` }));
      } else {
        setStats(prev => ({ ...prev, activeTime: `${minutes}m` }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isCapturing]);

  const handleAnalyzeNow = useCallback(async () => {
    if (soundEnabled) {
      playAlertSound();
    }

    const result = await analyzeFrame();
    
    if (result) {
      setCurrentSignal({
        signal: result.signal,
        time: result.time,
        reason: result.reason,
        asset: result.asset,
      });

      // Adiciona ao histórico
      setHistory(prev => [{
        id: Date.now(),
        signal: result.signal,
        time: result.time,
        reason: result.reason,
        asset: result.asset,
      }, ...prev.slice(0, 19)]);

      // Atualiza stats
      setStats(prev => ({
        ...prev,
        signalsToday: prev.signalsToday + 1,
        lastSignal: 'agora',
      }));

      // Notificação sonora
      if (soundEnabled) {
        announceSignal(result.signal, result.reason);
      }
    }
  }, [soundEnabled, analyzeFrame, playAlertSound, announceSignal]);

  const handleSpeak = useCallback((text: string) => {
    if (soundEnabled) {
      speak(text);
    }
  }, [soundEnabled, speak]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
<div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Image - Circuit Board */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url('/images/bg-circuit.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
      {/* Neon glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="glass p-2 rounded-lg hover:bg-secondary transition-colors"
              title={soundEnabled ? 'Desativar som' : 'Ativar som'}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-primary" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            <StatusIndicator isActive={isCapturing} />
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
            value={stats.signalsToday} 
            trend={stats.signalsToday > 0 ? "up" : "neutral"} 
          />
          <StatsCard 
            icon={BarChart3} 
            label="Taxa de Acerto" 
            value={stats.winRate > 0 ? `${stats.winRate}%` : '-'} 
            trend="neutral" 
          />
          <StatsCard 
            icon={Zap} 
            label="Último Sinal" 
            value={stats.lastSignal} 
            trend="neutral" 
          />
          <StatsCard 
            icon={Clock} 
            label="Tempo Ativo" 
            value={stats.activeTime} 
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Screen Capture */}
          <div className="lg:col-span-1">
            <ScreenCaptureControl
              isCapturing={isCapturing}
              onCaptureStart={handleCaptureStart}
              onCaptureStop={handleCaptureStop}
              captureError={captureError}
              setCaptureError={setCaptureError}
              isAnalyzing={isAnalyzing}
              onAnalyzeNow={handleAnalyzeNow}
              onSync={handleSync}
              isSynced={isSynced}
              countdown={countdown}
              onSpeak={handleSpeak}
            />
          </div>

          {/* Current Signal */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <h2 className="text-lg font-semibold text-foreground">Sinal Atual</h2>
            </div>
            {currentSignal ? (
              <SignalCard
                signal={currentSignal.signal}
                time={currentSignal.time}
                reason={currentSignal.reason}
              />
            ) : (
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-muted-foreground">
                  Aguardando primeira análise...
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Conecte ao gráfico e sincronize o timer
                </p>
              </div>
            )}

            {/* Filtros Ativos */}
            <div className="mt-4 glass rounded-xl p-4">
              <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                Filtros Ativos
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-xs">Análise de Contexto</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-xs">Detecção de Pavios</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-xs">Velas de Descanso</span>
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="lg:col-span-1">
            <SignalHistory history={history.length > 0 ? history : []} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            Motor de Análise <span className="text-primary font-medium">Prisma IA</span> • 
            Análise automática nos segundos finais de cada minuto
          </p>
        </footer>
      </div>
    </div>
  );
}
