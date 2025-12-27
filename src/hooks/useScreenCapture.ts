import { useState, useRef, useCallback } from 'react';
import { geminiService } from '@/services/geminiService';
import type { AnalysisResult, CaptureError } from '@/types';

export function useScreenCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [captureError, setCaptureError] = useState<CaptureError | null>(null);
  
  const getFrameRef = useRef<(() => string | null) | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCaptureStart = useCallback((getFrame: () => string | null) => {
    getFrameRef.current = getFrame;
    setIsCapturing(true);
    setCaptureError(null);
  }, []);

  const handleCaptureStop = useCallback(() => {
    setIsCapturing(false);
    setIsSynced(false);
    getFrameRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleSync = useCallback(() => {
    // Sincroniza com o início do próximo minuto
    const now = new Date();
    const secondsRemaining = 60 - now.getSeconds();
    setCountdown(secondsRemaining);
    setIsSynced(true);

    // Inicia o contador regressivo
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const analyzeFrame = useCallback(async (): Promise<AnalysisResult | null> => {
    if (!getFrameRef.current || isAnalyzing) return null;

    const frame = getFrameRef.current();
    if (!frame) {
      setCaptureError({
        id: 'no-frame',
        title: 'Erro de Captura',
        message: 'Não foi possível capturar o frame. Verifique se a tela está sendo compartilhada.',
      });
      return null;
    }

    setIsAnalyzing(true);
    setCaptureError(null);

    try {
      const result = await geminiService.analyzeImage(frame);
      return result;
    } catch (error: any) {
      setCaptureError({
        id: 'analysis-error',
        title: 'Erro na Análise',
        message: error.message || 'Erro desconhecido ao analisar a imagem.',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing]);

  return {
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
  };
}
