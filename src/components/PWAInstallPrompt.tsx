import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PWAInstallPrompt() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Armazenar o evento para uso posterior
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // Verificar se já está instalado
    const checkAppInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setShowPrompt(false);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => setShowPrompt(false));
    
    checkAppInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => setShowPrompt(false));
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPromptEvent) return;

    try {
      await installPromptEvent.prompt();
      const choiceResult = await installPromptEvent.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuário aceitou a instalação do PWA');
      } else {
        console.log('Usuário recusou a instalação do PWA');
      }

      setInstallPromptEvent(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50 flex justify-between items-center border border-indigo-200">
      <div>
        <p className="font-medium text-indigo-800">Instale nosso aplicativo!</p>
        <p className="text-sm text-gray-600">Acesse o Gestor de Contas diretamente da sua tela inicial</p>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => setShowPrompt(false)} 
          className="px-3 py-1 border border-gray-300 rounded text-sm"
        >
          Depois
        </button>
        <button 
          onClick={handleInstallClick}
          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
        >
          Instalar
        </button>
      </div>
    </div>
  );
} 