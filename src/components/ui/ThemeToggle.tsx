import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Obter tema salvo no localStorage, ou usar preferência do sistema
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    return savedTheme || 'system';
  });

  useEffect(() => {
    // Função para aplicar o tema baseado na preferência
    const applyTheme = (newTheme: Theme) => {
      const root = window.document.documentElement;
      
      // Remover classes existentes
      root.classList.remove('light', 'dark');
      
      // Se tema for sistema, verificar preferência do usuário
      if (newTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        // Aplicar tema escolhido
        root.classList.add(newTheme);
      }
    };
    
    // Salvar tema no localStorage
    localStorage.setItem('theme', theme);
    
    // Aplicar tema
    applyTheme(theme);
    
    // Monitorar mudanças na preferência do sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  // Alternar entre temas
  const toggleTheme = () => {
    setTheme(prevTheme => {
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return 'system';
      return 'light';
    });
  };
  
  // Determinar qual ícone mostrar
  const getIcon = () => {
    if (theme === 'system') {
      // Verificar preferência do sistema para o ícone
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return systemPreference ? <Moon size={18} /> : <Sun size={18} />;
    }
    
    return theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />;
  };
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md bg-card/50 border border-card-border hover:bg-accent transition-colors"
      title={`Tema atual: ${theme}. Clique para alternar.`}
      aria-label="Alternar tema"
    >
      {getIcon()}
    </button>
  );
} 