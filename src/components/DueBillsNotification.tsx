import { useState, useEffect } from 'react';
import { BellRing, X, AlertCircle } from 'lucide-react';
import { Bill } from '../lib/supabase';

type DueBillsNotificationProps = {
  bills: Bill[];
  daysThreshold?: number;
  onBillClick?: (billId: string) => void;
};

export function DueBillsNotification({
  bills,
  daysThreshold = 5,
  onBillClick
}: DueBillsNotificationProps) {
  const [show, setShow] = useState(false);
  const [dueBills, setDueBills] = useState<Bill[]>([]);
  const [overdueBills, setOverdueBills] = useState<Bill[]>([]);
  
  // Verificar contas próximas do vencimento e vencidas
  useEffect(() => {
    if (!bills || bills.length === 0) return;
    
    const now = new Date();
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Encontrar contas vencidas (não pagas e data de vencimento no passado)
    const overdueList = bills.filter(bill => {
      if (bill.paid) return false;
      const dueDate = new Date(bill.due_date);
      return dueDate < currentDate;
    });
    
    // Encontrar contas próximas ao vencimento (não pagas e dentro do limite de dias)
    const dueList = bills.filter(bill => {
      if (bill.paid) return false;
      
      const dueDate = new Date(bill.due_date);
      
      // Pular contas já vencidas (para evitar duplicatas)
      if (dueDate < currentDate) return false;
      
      // Calcular diferença em dias
      const diffTime = dueDate.getTime() - currentDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays <= daysThreshold;
    });
    
    setOverdueBills(overdueList);
    setDueBills(dueList);
    
    // Mostrar notificação se existirem contas vencidas ou próximas do vencimento
    if (overdueList.length > 0 || dueList.length > 0) {
      setShow(true);
    }
  }, [bills, daysThreshold]);
  
  // Se não tiver contas para alertar, não mostra nada
  if (!show || (dueBills.length === 0 && overdueBills.length === 0)) {
    return null;
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm animate-fadeIn">
      <div className="bg-card border border-card-border rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between bg-primary text-primary-foreground p-3">
          <div className="flex items-center gap-2">
            <BellRing size={20} />
            <span className="font-medium">Alertas de Vencimento</span>
          </div>
          <button 
            onClick={() => setShow(false)}
            className="p-1 rounded-full hover:bg-accent/20 transition-colors"
            aria-label="Fechar notificação"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-3 max-h-[300px] overflow-y-auto">
          {/* Contas vencidas */}
          {overdueBills.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2 text-destructive">
                <AlertCircle size={16} />
                <h3 className="font-medium">Contas Vencidas</h3>
              </div>
              <ul className="space-y-2">
                {overdueBills.map(bill => (
                  <li 
                    key={bill.id}
                    onClick={() => onBillClick?.(bill.id)}
                    className="px-3 py-2 bg-destructive/10 rounded border border-destructive/20 
                      hover:bg-destructive/20 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium truncate">{bill.description}</span>
                      <span className="text-destructive">{formatCurrency(bill.amount)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Venceu em: {formatDate(bill.due_date)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Contas próximas ao vencimento */}
          {dueBills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-primary">
                <BellRing size={16} />
                <h3 className="font-medium">A Vencer</h3>
              </div>
              <ul className="space-y-2">
                {dueBills.map(bill => (
                  <li 
                    key={bill.id}
                    onClick={() => onBillClick?.(bill.id)}
                    className="px-3 py-2 bg-primary/10 rounded border border-primary/20 
                      hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium truncate">{bill.description}</span>
                      <span>{formatCurrency(bill.amount)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Vence em: {formatDate(bill.due_date)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Formatação de valores monetários
function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
} 