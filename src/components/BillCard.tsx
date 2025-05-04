import { Bill } from '../lib/supabase';
import { Pencil, Trash2, Check, XCircle } from 'lucide-react';

type BillCardProps = {
  bill: Bill;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onTogglePaid: (id: string, paid: boolean) => void;
};

export function BillCard({ bill, onEdit, onDelete, onTogglePaid }: BillCardProps) {
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
    currency: 'BRL'
  }).format(amount);
  
  // Valor dividido se split for true
  const splitAmount = split 
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(amount / 2)
    : null;

  // Verificar se a conta está vencida (se não estiver paga e a data de vencimento for anterior à data atual)
  const isOverdue = !paid && new Date(due_date) < new Date() && new Date(due_date).setHours(0,0,0,0) !== new Date().setHours(0,0,0,0);
  
  // Texto para parcelas
  const installmentText = is_installment && installment_number && total_installments
    ? `Parcela ${installment_number}/${total_installments}`
    : null;
  
  return (
    <div className={`card transition-all ${paid ? 'opacity-70' : ''} ${isOverdue ? 'border-red-500' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{description}</h3>
            {installmentText && (
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">
                {installmentText}
              </span>
            )}
          </div>
          
          <div className="mt-1 text-sm">
            <p className="flex gap-1">
              <span className="text-gray-500">Valor:</span> 
              <span className="font-medium">{formattedAmount}</span>
            </p>
            
            {split && (
              <p className="text-xs text-gray-600">
                Valor dividido: {splitAmount} (por pessoa)
              </p>
            )}
            
            <p className="flex gap-1 mt-1">
              <span className="text-gray-500">Vencimento:</span>
              <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                {formattedDate}
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <button 
            onClick={() => onTogglePaid(id, !paid)}
            className={`p-1.5 rounded-full ${
              paid ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
            }`}
            title={paid ? 'Marcar como não pago' : 'Marcar como pago'}
          >
            {paid ? <Check size={16} /> : <XCircle size={16} />}
          </button>
          
          <button 
            onClick={() => onEdit(bill)}
            className="p-1.5 rounded-full bg-blue-100 text-blue-600"
            title="Editar"
          >
            <Pencil size={16} />
          </button>
          
          <button 
            onClick={() => onDelete(id)}
            className="p-1.5 rounded-full bg-red-100 text-red-600"
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="mt-3 flex items-center flex-wrap gap-2">
        <span className={`px-2 py-0.5 text-xs rounded-full ${
          paid ? 'bg-green-100 text-green-700' : isOverdue ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {paid ? 'Pago' : isOverdue ? 'Vencido' : 'Pendente'}
        </span>
        
        {split && (
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
            Dividido
          </span>
        )}
        
        <span className={`px-2 py-0.5 text-xs rounded-full ${
          bill_type === 'fixed' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {bill_type === 'fixed' ? 'Fixa' : 'Variável'}
        </span>
        
        {is_installment && (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
            Parcelado
          </span>
        )}
      </div>
    </div>
  );
} 