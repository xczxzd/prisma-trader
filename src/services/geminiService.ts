import type { AnalysisResult } from '@/types';

// Prompt mestre para análise de gráficos
const SYSTEM_PROMPT = `Você é o Motor Prisma IA. Analise o gráfico em M1.
Sua missão é encontrar oportunidades de alta probabilidade.

FILTROS OBRIGATÓRIOS:
- Analise o contexto: Zonas de pavios anteriores e suporte/resistência.
- Analise a vela atual: Se for de "descanso" (pequena, sem pavios longos contra a tendência), confirme a continuação.
- Analise Reversão: Se o corpo travar em zona de pavio oposto, preveja reversão.
- Se houver dúvida ou lateralização, responda: AGUARDAR.

FORMATO DA RESPOSTA (responda EXATAMENTE neste formato):
SINAL: [COMPRA / VENDA / AGUARDAR]
ATIVO: [Nome do ativo visível no gráfico]
TIMEFRAME: [M1, M5, etc.]
CONFIANÇA: [Alta / Média / Baixa]
MOTIVO: [Explicação técnica rápida em português]`;

class GeminiService {
  private apiKeys: string[] = [];
  private currentKeyIndex: number = 0;
  private retryDelay: number = 1000;
  private maxRetries: number = 3;

  constructor() {
    this.loadKeys();
  }

  private loadKeys() {
    // Suporta múltiplas chaves separadas por vírgula
    const keysString = localStorage.getItem('GEMINI_API_KEYS') || '';
    this.apiKeys = keysString.split(',').map(k => k.trim()).filter(k => k.length > 0);
  }

  setApiKeys(keys: string) {
    localStorage.setItem('GEMINI_API_KEYS', keys);
    this.apiKeys = keys.split(',').map(k => k.trim()).filter(k => k.length > 0);
    this.currentKeyIndex = 0;
  }

  getApiKeys(): string {
    return localStorage.getItem('GEMINI_API_KEYS') || '';
  }

  hasKeys(): boolean {
    return this.apiKeys.length > 0;
  }

  private rotateKey(): boolean {
    if (this.apiKeys.length <= 1) return false;
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    console.log(`🔄 Rotacionando para chave ${this.currentKeyIndex + 1}/${this.apiKeys.length}`);
    return true;
  }

  private getCurrentKey(): string {
    return this.apiKeys[this.currentKeyIndex] || '';
  }

  private parseResponse(text: string): AnalysisResult {
    const lines = text.split('\n').filter(l => l.trim());
    
    let signal: 'COMPRA' | 'VENDA' | 'AGUARDAR' = 'AGUARDAR';
    let asset = '';
    let timeframe = 'M1';
    let confidence = 0;
    let reason = '';

    for (const line of lines) {
      const upper = line.toUpperCase();
      
      if (upper.includes('SINAL:')) {
        if (upper.includes('COMPRA')) signal = 'COMPRA';
        else if (upper.includes('VENDA')) signal = 'VENDA';
        else signal = 'AGUARDAR';
      }
      
      if (upper.includes('ATIVO:')) {
        asset = line.split(':')[1]?.trim() || '';
      }
      
      if (upper.includes('TIMEFRAME:')) {
        timeframe = line.split(':')[1]?.trim() || 'M1';
      }
      
      if (upper.includes('CONFIANÇA:') || upper.includes('CONFIANCA:')) {
        const conf = line.split(':')[1]?.trim().toUpperCase() || '';
        if (conf.includes('ALTA')) confidence = 90;
        else if (conf.includes('MÉDIA') || conf.includes('MEDIA')) confidence = 70;
        else confidence = 50;
      }
      
      if (upper.includes('MOTIVO:')) {
        reason = line.split(':').slice(1).join(':').trim();
      }
    }

    // Se não encontrou motivo separado, usa o texto restante
    if (!reason) {
      reason = lines.slice(-1)[0] || 'Análise concluída';
    }

    const now = new Date();
    const time = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return { signal, time, reason, asset, timeframe, confidence };
  }

  async analyzeImage(imageBase64: string): Promise<AnalysisResult> {
    if (!this.hasKeys()) {
      throw new Error('Nenhuma chave API configurada. Configure suas chaves Gemini.');
    }

    let lastError: Error | null = null;
    let attempts = 0;

    while (attempts < this.maxRetries * this.apiKeys.length) {
      const apiKey = this.getCurrentKey();
      
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: SYSTEM_PROMPT + '\n\nAnalise esta imagem do gráfico:' },
                    {
                      inline_data: {
                        mime_type: 'image/jpeg',
                        data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 500,
              },
            }),
          }
        );

        if (response.status === 429) {
          console.warn('⚠️ Limite de cota atingido (429). Tentando próxima chave...');
          if (!this.rotateKey()) {
            await new Promise(r => setTimeout(r, this.retryDelay));
          }
          attempts++;
          continue;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        if (!text) {
          throw new Error('Resposta vazia da API');
        }

        return this.parseResponse(text);

      } catch (error: any) {
        lastError = error;
        console.error(`Erro na tentativa ${attempts + 1}:`, error.message);
        
        // Rotaciona chave em caso de erro
        this.rotateKey();
        attempts++;
        
        // Pequena pausa entre tentativas
        await new Promise(r => setTimeout(r, 500));
      }
    }

    throw lastError || new Error('Falha após todas as tentativas');
  }
}

export const geminiService = new GeminiService();
