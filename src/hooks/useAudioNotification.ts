import { useCallback, useRef } from 'react';

type SignalType = 'COMPRA' | 'VENDA' | 'AGUARDAR';

export function useAudioNotification() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.warn('Erro ao reproduzir som:', error);
    }
  }, [getAudioContext]);

  const playSignalSound = useCallback((signal: SignalType) => {
    switch (signal) {
      case 'COMPRA':
        // Som ascendente para COMPRA (positivo)
        playTone(440, 0.15, 'sine');
        setTimeout(() => playTone(554, 0.15, 'sine'), 150);
        setTimeout(() => playTone(659, 0.3, 'sine'), 300);
        break;
      
      case 'VENDA':
        // Som descendente para VENDA
        playTone(659, 0.15, 'sine');
        setTimeout(() => playTone(554, 0.15, 'sine'), 150);
        setTimeout(() => playTone(440, 0.3, 'sine'), 300);
        break;
      
      case 'AGUARDAR':
        // Som neutro para AGUARDAR
        playTone(440, 0.2, 'triangle');
        break;
    }
  }, [playTone]);

  const playAlertSound = useCallback(() => {
    // Som de alerta para início de análise
    playTone(880, 0.1, 'square');
    setTimeout(() => playTone(880, 0.1, 'square'), 150);
  }, [playTone]);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Cancela falas anteriores
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.1;
      utterance.pitch = 1;
      utterance.volume = 0.9;
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const announceSignal = useCallback((signal: SignalType, reason?: string) => {
    playSignalSound(signal);
    
    let announcement = '';
    switch (signal) {
      case 'COMPRA':
        announcement = 'Sinal de compra identificado!';
        break;
      case 'VENDA':
        announcement = 'Sinal de venda identificado!';
        break;
      case 'AGUARDAR':
        announcement = 'Aguardando. Sem padrão claro.';
        break;
    }
    
    setTimeout(() => speak(announcement), 500);
  }, [playSignalSound, speak]);

  return {
    playSignalSound,
    playAlertSound,
    speak,
    announceSignal,
  };
}
