import React, { useRef, useCallback, useEffect } from 'react';
import { VideoCameraIcon, SparklesIcon, TimerResetIcon } from './icons';
import type { CaptureError } from '@/types';

interface ScreenCaptureControlProps {
  isCapturing: boolean;
  onCaptureStart: (getFrame: () => string | null) => void;
  onCaptureStop: () => void;
  captureError: CaptureError | null;
  setCaptureError: (error: CaptureError | null) => void;
  isAnalyzing: boolean;
  onAnalyzeNow: () => void;
  onSync: () => void;
  isSynced: boolean;
  countdown: number;
  onSpeak: (text: string) => void;
}

export const ScreenCaptureControl = ({
  isCapturing,
  onCaptureStart,
  onCaptureStop,
  captureError,
  setCaptureError,
  isAnalyzing,
  onAnalyzeNow,
  onSync,
  isSynced,
  countdown,
  onSpeak,
}: ScreenCaptureControlProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const getFrameAsDataUrl = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState >= 2) {
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.9);
      }
    }
    return null;
  }, []);

  // Disparo automático no segundo 57 ou quando countdown = 2
  useEffect(() => {
    if (isSynced && countdown === 2 && !isAnalyzing) {
      onSpeak("Prisma analisando fechamento...");
      onAnalyzeNow();
    }
  }, [countdown, isSynced, isAnalyzing, onAnalyzeNow, onSpeak]);

  const handleStartCapture = async () => {
    setCaptureError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          frameRate: 15,
        } as any,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      stream.getVideoTracks()[0].addEventListener('ended', () => {
        onCaptureStop();
      });

      onCaptureStart(getFrameAsDataUrl);
      onSpeak("Sensor Visual Prisma Conectado. Sincronize o timer.");
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        setCaptureError({ id: 'err', title: "Erro", message: err.message });
      }
    }
  };

  const handleStopCapture = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    streamRef.current = null;
    onCaptureStop();
    onSpeak("Sistema desconectado.");
  }, [onCaptureStop, onSpeak]);

  return (
    <div className="glass p-5 rounded-2xl flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground uppercase">Prisma Vision</h2>
            <div className="text-[10px] text-primary animate-pulse">MODO TREINAMENTO IA ATIVO</div>
          </div>
        </div>
        {isCapturing && (
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground font-mono">PRÓXIMA ANÁLISE</div>
            <div className="text-xl font-bold text-foreground font-mono">{countdown}s</div>
          </div>
        )}
      </div>

      {/* Viewport */}
      <div className="aspect-video bg-background rounded-lg overflow-hidden relative border-2 border-primary/20">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-contain" />
        {!isCapturing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Clique em "Conectar ao Gráfico" para iniciar</p>
          </div>
        )}
        {isCapturing && (
          <div className="absolute top-2 left-2 flex gap-2">
            <div className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded animate-pulse">
              AO VIVO
            </div>
            {isSynced && (
              <div className="bg-success text-success-foreground text-[10px] font-bold px-2 py-1 rounded">
                TIMER SINCRONIZADO
              </div>
            )}
          </div>
        )}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-primary text-sm font-medium">Analisando...</span>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Error display */}
      {captureError && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
          <p className="text-destructive text-sm font-medium">{captureError.title}</p>
          <p className="text-destructive/80 text-xs">{captureError.message}</p>
        </div>
      )}

      {/* Controls */}
      <div className="mt-auto space-y-3">
        {isCapturing ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={onSync}
              className="w-full flex items-center justify-center gap-2 bg-secondary border border-success/50 text-success font-bold py-3 rounded-lg hover:bg-success/10 transition-all"
            >
              <TimerResetIcon className="w-4 h-4" />
              {isSynced ? "TIMER SINCRONIZADO ✓" : "SINCRONIZAR VELA (M1)"}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onAnalyzeNow}
                disabled={isAnalyzing}
                className="bg-primary text-primary-foreground font-bold py-3 rounded-lg shadow-lg hover:opacity-80 disabled:opacity-50 transition-all"
              >
                {isAnalyzing ? "ANALISANDO..." : "FORÇAR SCAN"}
              </button>
              <button
                onClick={handleStopCapture}
                className="bg-destructive/10 text-destructive border border-destructive/30 font-bold py-3 rounded-lg hover:bg-destructive/20 transition-all"
              >
                DESCONECTAR
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleStartCapture}
            className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-bold py-4 rounded-lg hover:opacity-90 transition-all glow-primary"
          >
            <VideoCameraIcon className="w-5 h-5" />
            CONECTAR AO GRÁFICO
          </button>
        )}
      </div>
    </div>
  );
};
