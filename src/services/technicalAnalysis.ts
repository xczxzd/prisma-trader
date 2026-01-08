// Motor de Análise Técnica do Prisma IA
// Analisa tendência, confirmação de velas, S/R e CCI período 2

export interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp: number;
}

export interface AnalysisResult {
  signal: 'COMPRA' | 'VENDA' | 'AGUARDAR';
  confidence: number;
  reasons: string[];
  alerts: string[];
  trend: 'ALTA' | 'BAIXA' | 'LATERAL';
  cciSignal: 'CONFIRMADO' | 'REJEITADO' | 'NEUTRO';
}

interface TechnicalContext {
  trend: 'ALTA' | 'BAIXA' | 'LATERAL';
  trendStrength: number;
  consecutiveCandles: number;
  lastCandleColor: 'VERDE' | 'VERMELHA' | 'DOJI';
  hasConfirmation: boolean;
  nearSupport: boolean;
  nearResistance: boolean;
  cciValue: number;
  cciCrossed: boolean;
  cciReturned: boolean;
}

// Simula candles baseado no horário (para demonstração)
function generateSimulatedCandles(count: number): CandleData[] {
  const candles: CandleData[] = [];
  let price = 1.0850 + (Math.random() * 0.01);
  
  for (let i = 0; i < count; i++) {
    const volatility = 0.0003 + (Math.random() * 0.0005);
    const direction = Math.random() > 0.5 ? 1 : -1;
    const open = price;
    const change = volatility * direction;
    const close = open + change;
    const high = Math.max(open, close) + (Math.random() * volatility * 0.5);
    const low = Math.min(open, close) - (Math.random() * volatility * 0.5);
    
    candles.push({
      open,
      high,
      low,
      close,
      timestamp: Date.now() - ((count - i) * 60000)
    });
    
    price = close;
  }
  
  return candles;
}

// Calcula CCI (Commodity Channel Index) período 2
function calculateCCI(candles: CandleData[], period: number = 2): number[] {
  if (candles.length < period) return [];
  
  const cciValues: number[] = [];
  const constant = 0.015;
  
  for (let i = period - 1; i < candles.length; i++) {
    // Typical Price = (High + Low + Close) / 3
    const typicalPrices: number[] = [];
    for (let j = i - period + 1; j <= i; j++) {
      typicalPrices.push((candles[j].high + candles[j].low + candles[j].close) / 3);
    }
    
    // SMA do Typical Price
    const sma = typicalPrices.reduce((a, b) => a + b, 0) / period;
    
    // Mean Deviation
    const meanDeviation = typicalPrices.reduce((sum, tp) => sum + Math.abs(tp - sma), 0) / period;
    
    // CCI = (Typical Price - SMA) / (Constant * Mean Deviation)
    const currentTP = typicalPrices[typicalPrices.length - 1];
    const cci = meanDeviation !== 0 ? (currentTP - sma) / (constant * meanDeviation) : 0;
    
    cciValues.push(cci);
  }
  
  return cciValues;
}

// Analisa tendência das últimas N velas
function analyzeTrend(candles: CandleData[]): { trend: 'ALTA' | 'BAIXA' | 'LATERAL', strength: number } {
  if (candles.length < 3) return { trend: 'LATERAL', strength: 0 };
  
  let bullish = 0;
  let bearish = 0;
  
  for (const candle of candles.slice(-5)) {
    if (candle.close > candle.open) bullish++;
    else if (candle.close < candle.open) bearish++;
  }
  
  const total = bullish + bearish;
  if (total === 0) return { trend: 'LATERAL', strength: 0 };
  
  if (bullish >= 3) return { trend: 'ALTA', strength: bullish / total };
  if (bearish >= 3) return { trend: 'BAIXA', strength: bearish / total };
  
  return { trend: 'LATERAL', strength: 0.5 };
}

// Conta velas consecutivas da mesma cor
function countConsecutiveCandles(candles: CandleData[]): { count: number, color: 'VERDE' | 'VERMELHA' | 'DOJI' } {
  if (candles.length === 0) return { count: 0, color: 'DOJI' };
  
  const lastCandle = candles[candles.length - 1];
  let color: 'VERDE' | 'VERMELHA' | 'DOJI';
  
  if (lastCandle.close > lastCandle.open) color = 'VERDE';
  else if (lastCandle.close < lastCandle.open) color = 'VERMELHA';
  else color = 'DOJI';
  
  let count = 1;
  for (let i = candles.length - 2; i >= 0; i--) {
    const candle = candles[i];
    const candleColor = candle.close > candle.open ? 'VERDE' : 
                        candle.close < candle.open ? 'VERMELHA' : 'DOJI';
    
    if (candleColor === color) count++;
    else break;
  }
  
  return { count, color };
}

// Identifica zonas de suporte e resistência
function findSupportResistance(candles: CandleData[]): { supports: number[], resistances: number[] } {
  if (candles.length < 5) return { supports: [], resistances: [] };
  
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  
  const resistances: number[] = [];
  const supports: number[] = [];
  
  // Encontra picos e vales
  for (let i = 2; i < candles.length - 2; i++) {
    // Resistência: ponto mais alto local
    if (highs[i] > highs[i-1] && highs[i] > highs[i-2] && 
        highs[i] > highs[i+1] && highs[i] > highs[i+2]) {
      resistances.push(highs[i]);
    }
    
    // Suporte: ponto mais baixo local
    if (lows[i] < lows[i-1] && lows[i] < lows[i-2] && 
        lows[i] < lows[i+1] && lows[i] < lows[i+2]) {
      supports.push(lows[i]);
    }
  }
  
  return { supports, resistances };
}

// Verifica se preço está próximo de S/R
function isNearLevel(price: number, levels: number[], threshold: number = 0.0005): boolean {
  return levels.some(level => Math.abs(price - level) < threshold);
}

// Analisa CCI período 2 para confirmação de tendência
function analyzeCCI(cciValues: number[]): { crossed: boolean, returned: boolean, lastValue: number } {
  if (cciValues.length < 3) return { crossed: false, returned: false, lastValue: 0 };
  
  const last = cciValues[cciValues.length - 1];
  const prev = cciValues[cciValues.length - 2];
  const prevPrev = cciValues[cciValues.length - 3];
  
  // CCI saiu de +100 ou -100 e voltou
  const wasAbove100 = prevPrev > 100;
  const wasBelow100 = prevPrev < -100;
  const crossedDown = wasAbove100 && prev < 100;
  const crossedUp = wasBelow100 && prev > -100;
  
  // Confirmação: CCI volta para dentro da faixa -100 a +100
  const returned = (crossedDown && last < 100 && last > 0) || (crossedUp && last > -100 && last < 0);
  
  return { 
    crossed: crossedDown || crossedUp, 
    returned,
    lastValue: last 
  };
}

// Motor principal de análise
export function analyzeMarket(): AnalysisResult {
  const reasons: string[] = [];
  const alerts: string[] = [];
  let confidence = 0;
  
  // Gera dados simulados (em produção, viria da captura de tela)
  const candles = generateSimulatedCandles(20);
  const currentPrice = candles[candles.length - 1].close;
  
  // 1. Análise de Tendência
  const { trend, strength } = analyzeTrend(candles);
  if (strength > 0.6) {
    confidence += 20;
    reasons.push(`📈 Tendência ${trend} forte (${Math.round(strength * 100)}%)`);
  }
  
  // 2. Confirmação de Velas
  const { count: consecutiveCount, color: lastColor } = countConsecutiveCandles(candles);
  const hasConfirmation = 
    (trend === 'ALTA' && lastColor === 'VERDE') ||
    (trend === 'BAIXA' && lastColor === 'VERMELHA');
  
  if (hasConfirmation && consecutiveCount >= 1) {
    confidence += 25;
    reasons.push(`✅ Vela de confirmação: ${consecutiveCount}x ${lastColor}`);
  } else if (!hasConfirmation && trend !== 'LATERAL') {
    alerts.push(`⚠️ Sem confirmação: última vela ${lastColor} contra tendência`);
  }
  
  // 3. Zonas de Suporte/Resistência
  const { supports, resistances } = findSupportResistance(candles);
  const nearSupport = isNearLevel(currentPrice, supports);
  const nearResistance = isNearLevel(currentPrice, resistances);
  
  if (nearResistance && trend === 'ALTA') {
    confidence -= 20;
    alerts.push('🛡️ Zona de resistência próxima - possível pullback');
  }
  if (nearSupport && trend === 'BAIXA') {
    confidence -= 20;
    alerts.push('🛡️ Zona de suporte próxima - possível pullback');
  }
  
  // 4. CCI Período 2 - Confirmação de Continuação
  const cciValues = calculateCCI(candles, 2);
  const cciAnalysis = analyzeCCI(cciValues);
  
  let cciSignal: 'CONFIRMADO' | 'REJEITADO' | 'NEUTRO' = 'NEUTRO';
  
  if (cciAnalysis.returned) {
    // CCI voltou para dentro da faixa = continuação de tendência
    if ((trend === 'ALTA' && cciAnalysis.lastValue > 0) ||
        (trend === 'BAIXA' && cciAnalysis.lastValue < 0)) {
      confidence += 30;
      cciSignal = 'CONFIRMADO';
      reasons.push(`📊 CCI(2) confirmou continuação: ${cciAnalysis.lastValue.toFixed(1)}`);
    } else {
      cciSignal = 'REJEITADO';
      alerts.push(`📊 CCI(2) divergente: ${cciAnalysis.lastValue.toFixed(1)}`);
    }
  }
  
  // 5. Verificação de Exaustão
  if (consecutiveCount >= 4) {
    confidence -= 15;
    alerts.push(`⚠️ ${consecutiveCount} velas consecutivas - possível exaustão`);
  }
  
  // 6. Decisão Final
  let signal: 'COMPRA' | 'VENDA' | 'AGUARDAR' = 'AGUARDAR';
  
  // Só gera sinal se:
  // - Confiança >= 50%
  // - Tendência clara
  // - Confirmação de vela
  // - Sem bloqueio de S/R
  
  const isTrendValid = trend === 'ALTA' || trend === 'BAIXA';
  const canTrade = confidence >= 50 && hasConfirmation && isTrendValid;
  const noBlockingLevel = 
    !(nearResistance && trend === 'ALTA') && 
    !(nearSupport && trend === 'BAIXA');
  
  if (canTrade && noBlockingLevel) {
    if (trend === 'ALTA') {
      signal = 'COMPRA';
      reasons.unshift('🟢 ENTRADA CALL - Tendência confirmada');
    } else if (trend === 'BAIXA') {
      signal = 'VENDA';
      reasons.unshift('🔴 ENTRADA PUT - Tendência confirmada');
    }
  } else {
    reasons.unshift('⏳ AGUARDANDO - Condições não atendidas');
    if (!hasConfirmation) reasons.push('❌ Falta confirmação de vela');
    if (!noBlockingLevel) reasons.push('❌ Zona de S/R bloqueando');
    if (confidence < 50) reasons.push(`❌ Confiança baixa: ${confidence}%`);
  }
  
  return {
    signal,
    confidence: Math.max(0, Math.min(100, confidence)),
    reasons,
    alerts,
    trend,
    cciSignal
  };
}

// Formata resultado para exibição
export function formatAnalysisResult(result: AnalysisResult): {
  signal: 'COMPRA' | 'VENDA' | 'AGUARDAR';
  time: string;
  reason: string;
  asset: string;
  confidence: number;
  details: string[];
  alerts: string[];
} {
  return {
    signal: result.signal,
    time: new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    reason: result.reasons[0] || 'Análise em andamento...',
    asset: 'EUR/USD',
    confidence: result.confidence,
    details: result.reasons.slice(1),
    alerts: result.alerts
  };
}
