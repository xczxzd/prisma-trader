export interface CaptureError {
  id: string;
  title: string;
  message: string;
}

export interface AnalysisResult {
  signal: 'COMPRA' | 'VENDA' | 'AGUARDAR';
  time: string;
  reason: string;
  asset?: string;
  timeframe?: string;
  confidence?: number;
}

export interface GeminiConfig {
  apiKeys: string[];
  currentKeyIndex: number;
  retryDelay: number;
  maxRetries: number;
}

export interface SignalHistoryItem {
  id: number;
  signal: 'COMPRA' | 'VENDA' | 'AGUARDAR';
  time: string;
  reason: string;
  asset?: string;
}
