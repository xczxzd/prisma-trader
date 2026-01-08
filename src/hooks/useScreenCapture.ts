import { useState, useRef, useCallback } from 'react';
import type { CaptureError } from '@/types';
import { analyzeMarket, formatAnalysisResult } from '@/services/technicalAnalysis';

// Controle para evitar múltiplos sinais na mesma vela
let lastSignalMinute: number = -1;
let lastSignalType: 'COMPRA' | 'VENDA' | 'AGUARDAR' | null = null;

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

  const analyzeFrame = useCallback(async () => {
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

    // Verifica se já gerou sinal para este minuto
    const currentMinute = new Date().getMinutes();
    
    setIsAnalyzing(true);
    setCaptureError(null);

    try {
      // Simula processamento da imagem
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Executa análise técnica inteligente
      const analysis = analyzeMarket();
      const result = formatAnalysisResult(analysis);
      
      // Só gera novo sinal se:
      // 1. É um minuto diferente do último sinal
      // 2. OU é um sinal diferente (COMPRA/VENDA mudou)
      // 3. E não é AGUARDAR repetido
      
      const isNewMinute = currentMinute !== lastSignalMinute;
      const isDifferentSignal = result.signal !== lastSignalType;
      const isActionableSignal = result.signal !== 'AGUARDAR';
      
      if (isActionableSignal && (isNewMinute || isDifferentSignal)) {
        lastSignalMinute = currentMinute;
        lastSignalType = result.signal;
        
        return {
          signal: result.signal,
          time: result.time,
          reason: result.reason,
          asset: result.asset,
          confidence: result.confidence,
          details: result.details,
          alerts: result.alerts
        };
      } else if (result.signal === 'AGUARDAR') {
        // Retorna AGUARDAR mas não atualiza o lastSignal
        // para permitir que o próximo sinal seja gerado
        return {
          signal: result.signal,
          time: result.time,
          reason: result.reason,
          asset: result.asset,
          confidence: result.confidence,
          details: result.details,
          alerts: result.alerts
        };
      }
      
      // Se já gerou sinal para este minuto, retorna null
      return null;
    } catch (error: any) {
      setCaptureError({
        id: 'analysis-error',
        title: 'Erro na Análise',
        message: error.message || 'Erro desconhecido ao analisar.',
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
