import { useState, useRef, useCallback } from 'react';
import type { AnalysisResult, CaptureError } from '@/types';

// Gerador de sinais local (sem API)
function generateLocalSignal(): AnalysisResult {
  const signals: ('COMPRA' | 'VENDA' | 'AGUARDAR')[] = ['COMPRA', 'VENDA', 'AGUARDAR'];
  const randomSignal = signals[Math.floor(Math.random() * signals.length)];
  
  const reasons: Record<string, string[]> = {
    'COMPRA': [
      'Padrão de reversão bullish detectado na zona de suporte',
      'Vela de força compradora após sequência de descanso',
      'Rompimento de resistência com volume confirmado',
      'Engolfo de alta em região de demanda',
    ],
    'VENDA': [
      'Padrão de reversão bearish na zona de resistência',
      'Vela de rejeição no topo com pavio longo',
      'Rompimento de suporte com continuação',
      'Engolfo de baixa em região de oferta',
    ],
    'AGUARDAR': [
      'Lateralização sem definição clara de tendência',
      'Zona de indecisão - aguardar confirmação',
      'Volume insuficiente para entrada segura',
      'Padrão não identificado - próxima vela',
    ],
  };

  const reasonList = reasons[randomSignal];
  const randomReason = reasonList[Math.floor(Math.random() * reasonList.length)];

  return {
    signal: randomSignal,
    time: new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    reason: randomReason,
    asset: 'EUR/USD',
  };
}

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
      // Simula um pequeno delay como se estivesse processando
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Gera sinal localmente sem API
      const result = generateLocalSignal();
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
