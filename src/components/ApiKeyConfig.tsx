import { useState } from 'react';
import { Settings, X, Key } from 'lucide-react';

interface ApiKeyConfigProps {
  apiKeys: string;
  onSave: (keys: string) => void;
  onClose: () => void;
}

export function ApiKeyConfig({ apiKeys, onSave, onClose }: ApiKeyConfigProps) {
  const [keys, setKeys] = useState(apiKeys);

  const handleSave = () => {
    onSave(keys.trim());
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass rounded-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Configurar API Gemini</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Insira suas chaves API do Google AI Studio. Para rotação automática em caso de limite (429), 
          separe múltiplas chaves por vírgula.
        </p>

        <textarea
          value={keys}
          onChange={(e) => setKeys(e.target.value)}
          placeholder="AIzaSy..., AIzaSy..., AIzaSy..."
          className="w-full h-24 bg-secondary border border-border rounded-lg p-3 text-foreground placeholder:text-muted-foreground text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            className="flex-1 bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-all"
          >
            Salvar
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-secondary text-secondary-foreground font-bold py-2 px-4 rounded-lg hover:bg-secondary/80 transition-all"
          >
            Cancelar
          </button>
        </div>

        <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
          <p className="text-xs text-warning">
            ⚠️ Dica: Obtenha chaves gratuitas em{' '}
            <a 
              href="https://aistudio.google.com/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-warning/80"
            >
              aistudio.google.com/apikey
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
