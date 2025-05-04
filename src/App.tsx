import { useEffect, useState } from 'react';
import { Home } from './pages/Home';
import { AuthLayout } from './components/AuthLayout';
import { Toaster } from 'react-hot-toast';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { Bill } from './lib/supabase';
import { DueBillsNotification } from './components/DueBillsNotification';
import './index.css';

function App() {
  const [bills, setBills] = useState<Bill[]>([]);
  
  // Função para receber as contas da página Home
  const handleBillsLoaded = (loadedBills: Bill[]) => {
    setBills(loadedBills);
  };
  
  // Inicializar o tema baseado na preferência salva ou do sistema
  useEffect(() => {
    // Obter tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme');
    const root = window.document.documentElement;
    
    // Remover classes existentes
    root.classList.remove('light', 'dark');
    
    // Aplicar tema baseado na preferência salva ou do sistema
    if (savedTheme === 'dark') {
      root.classList.add('dark');
    } else if (savedTheme === 'light') {
      root.classList.add('light');
    } else {
      // Se não tiver preferência salva, usar a preferência do sistema
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    }
  }, []);
  
  // Função para navegar até uma conta específica quando clicada na notificação
  const handleBillClick = (billId: string) => {
    // Rolar até a seção de contas
    const billsSection = document.getElementById('bills-section');
    if (billsSection) {
      billsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Destacar a conta clicada
    setTimeout(() => {
      const billElement = document.getElementById(`bill-${billId}`);
      if (billElement) {
        billElement.classList.add('highlight-bill');
        
        // Remover highlight após alguns segundos
        setTimeout(() => {
          billElement.classList.remove('highlight-bill');
        }, 3000);
      }
    }, 500);
  };
  
  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            border: '1px solid var(--card-border)'
          }
        }}
      />
      <AuthLayout>
        <Home onBillsLoaded={handleBillsLoaded} />
      </AuthLayout>
      <DueBillsNotification 
        bills={bills} 
        daysThreshold={5}
        onBillClick={handleBillClick}
      />
      <PWAInstallPrompt />
    </>
  );
}

export default App;
