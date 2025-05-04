import { useState, FormEvent } from 'react';
import { Budget, getCurrentMonthYear } from '../lib/supabase';
import { toast } from 'react-hot-toast';

type BudgetFormProps = {
  onSubmit: (budget: Omit<Budget, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<Budget>;
  buttonText?: string;
};

export function BudgetForm({ 
  onSubmit, 
  onCancel, 
  initialData = {}, 
  buttonText = 'Salvar' 
}: BudgetFormProps) {
  const currentDate = getCurrentMonthYear();
  
  const [amount, setAmount] = useState(initialData.amount?.toString() || '');
  const [month, setMonth] = useState(initialData.month || currentDate.month);
  const [year, setYear] = useState(initialData.year || currentDate.year);
  const [description, setDescription] = useState(initialData.description || '');
  const [type, setType] = useState<'income' | 'expense' | 'adjustment'>(initialData.type || 'income');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Informe um valor válido');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        amount: parseFloat(amount),
        month,
        year,
        description,
        type,
        user_id: null // Será preenchido na função de manipulação
      });
      
      toast.success('Orçamento salvo com sucesso!');
      
      // Limpar formulário se não for edição
      if (!initialData.id) {
        setAmount('');
        setDescription('');
        setType('income');
      }
    } catch (error) {
      toast.error('Erro ao salvar orçamento');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="type" className="block mb-1 font-medium">
          Tipo
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as 'income' | 'expense' | 'adjustment')}
          className="input w-full"
          required
        >
          <option value="income">Receita (Salário, Renda Extra)</option>
          <option value="expense">Despesa (Gastos não listados)</option>
          <option value="adjustment">Ajuste (Correções no saldo)</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="amount" className="block mb-1 font-medium">
          Valor (R$)
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input w-full"
          placeholder="0,00"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block mb-1 font-medium">
          Descrição
        </label>
        <input
          id="description"
          type="text"
          value={description || ''}
          onChange={(e) => setDescription(e.target.value)}
          className="input w-full"
          placeholder="Salário, Freelance, etc."
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="month" className="block mb-1 font-medium">
            Mês
          </label>
          <select
            id="month"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="input w-full"
          >
            <option value="1">Janeiro</option>
            <option value="2">Fevereiro</option>
            <option value="3">Março</option>
            <option value="4">Abril</option>
            <option value="5">Maio</option>
            <option value="6">Junho</option>
            <option value="7">Julho</option>
            <option value="8">Agosto</option>
            <option value="9">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="year" className="block mb-1 font-medium">
            Ano
          </label>
          <input
            id="year"
            type="number"
            min="2000"
            max="2100"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="input w-full"
          />
        </div>
      </div>
      
      <div className="flex space-x-2 pt-2">
        <button 
          type="submit" 
          className="btn btn-primary flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando...' : buttonText}
        </button>
        
        <button 
          type="button"
          onClick={onCancel} 
          className="btn border border-card-border bg-accent/50 hover:bg-accent/70 text-accent-foreground flex-1 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
} 