import { Bill } from '../lib/supabase';
import { Pencil, Trash2, Check, XCircle } from 'lucide-react';

type BillCardProps = {
  bill: Bill;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onTogglePaid: (id: string, paid: boolean) => void;
  onDeleteInstallments?: (bill: Bill) => void;
};

export function BillCard({ 
  bill, 
  onEdit, 
  onDelete, 
  onTogglePaid, 
  onDeleteInstallments 
}: BillCardProps) {
  const { 
    id, 
    description, 
    amount, 
    due_date, 
    paid, 
    split, 
    bill_type, 
    is_installment, 
    installment_number, 
    total_installments 
  } = bill;
  
  // Formatação de data para o padrão brasileiro
  const formattedDate = new Date(due_date).toLocaleDateString('pt-BR');
  
  // Formatação de valor monetário
  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2
  }).format(amount);
  
  // Valor dividido se split for true
  const splitAmount = split 
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 2
      }).format(amount / 2)
    : null;

  // Verificar se a conta está vencida (se não estiver paga e a data de vencimento for anterior à data atual)
  const isOverdue = !paid && new Date(due_date) < new Date() && new Date(due_date).setHours(0,0,0,0) !== new Date().setHours(0,0,0,0);
  
  // Texto para parcelas
  const installmentText = is_installment && installment_number && total_installments
    ? `Parcela ${installment_number}/${total_installments}`
    : null;
    
  // Função para confirmar exclusão
  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      onDelete(id);
    }
  };
  
  // Função para confirmar exclusão de todas as parcelas
  const handleDeleteAllInstallments = () => {
    if (is_installment && installment_number && total_installments && onDeleteInstallments) {
      if (window.confirm(`Deseja excluir todas as parcelas desta compra? Isso excluirá esta e todas as parcelas restantes.`)) {
        onDeleteInstallments(bill);
      }
    }
  };
  
  return (
    <div 
      className={`card p-3 transition-all ${paid ? 'opacity-60' : ''} 
      ${isOverdue ? 'border-destructive dark:border-destructive/70' : ''}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-base sm:text-lg truncate">{description}</h3>
            {installmentText && (
              <span className="inline-flex bg-primary/10 dark:bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                {installmentText}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
            <div className="col-span-2 sm:col-span-1">
              <span className="text-muted-foreground mr-1">Valor:</span> 
              <span className="font-medium">{formattedAmount}</span>
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <span className="text-muted-foreground mr-1">Vencimento:</span>
              <span className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                {formattedDate}
              </span>
            </div>
            
            {split && (
              <div className="col-span-2 text-xs text-muted-foreground">
                Valor dividido: {splitAmount} (por pessoa)
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:flex-col self-end sm:self-start">
          <button 
            onClick={() => onTogglePaid(id, !paid)}
            className={`p-1.5 rounded-full ${
              paid 
                ? 'bg-success/20 dark:bg-success/30 text-success' 
                : 'bg-muted dark:bg-muted/50 text-muted-foreground'
            }`}
            title={paid ? 'Marcar como não pago' : 'Marcar como pago'}
            aria-label={paid ? 'Marcar como não pago' : 'Marcar como pago'}
          >
            {paid ? <Check size={18} /> : <XCircle size={18} />}
          </button>
          
          <button 
            onClick={() => onEdit(bill)}
            className="p-1.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary"
            title="Editar"
            aria-label="Editar conta"
          >
            <Pencil size={18} />
          </button>
          
          <button 
            onClick={handleDelete}
            className="p-1.5 rounded-full bg-destructive/10 dark:bg-destructive/20 text-destructive"
            title="Excluir"
            aria-label="Excluir conta"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="mt-3 flex items-center flex-wrap gap-2">
        <span className={`px-2 py-0.5 text-xs rounded-full ${
          paid 
            ? 'bg-success/20 text-success dark:bg-success/30 dark:text-success-foreground' 
            : isOverdue 
              ? 'bg-destructive/20 text-destructive dark:bg-destructive/30 dark:text-destructive-foreground' 
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        }`}>
          {paid ? 'Pago' : isOverdue ? 'Vencido' : 'Pendente'}
        </span>
        
        {split && (
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs rounded-full">
            Dividido
          </span>
        )}
        
        <span className={`px-2 py-0.5 text-xs rounded-full ${
          bill_type === 'fixed' 
            ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary' 
            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
        }`}>
          {bill_type === 'fixed' ? 'Fixa' : 'Variável'}
        </span>
        
        {is_installment && (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded-full">
            Parcelado
          </span>
        )}
      </div>
      
      {/* Botão para excluir todas as parcelas */}
      {is_installment && installment_number && total_installments && installment_number < total_installments && onDeleteInstallments && (
        <div className="mt-2 text-right">
          <button
            onClick={handleDeleteAllInstallments}
            className="text-xs text-destructive hover:underline hover:text-destructive/80"
          >
            Excluir todas as parcelas
          </button>
        </div>
      )}
    </div>
  );
} 