import { ArrowDown, ArrowUp, PlusCircle } from 'lucide-react';
import { Budget, formatMonthYear } from '../lib/supabase';

type BudgetSummaryProps = {
  budgetEntries: Budget[];
  billsTotalAmount: number;
  billsTotalPaid: number;
  month: number;
  year: number;
  onAddEntry: () => void;
};

export function BudgetSummary({
  budgetEntries,
  billsTotalAmount,
  billsTotalPaid,
  month,
  year,
  onAddEntry
}: BudgetSummaryProps) {
  // Calcular totais por tipo
  const totalIncome = budgetEntries
    .filter(entry => entry.type === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalExpenses = budgetEntries
    .filter(entry => entry.type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0);
    
  const totalAdjustments = budgetEntries
    .filter(entry => entry.type === 'adjustment')
    .reduce((sum, entry) => sum + entry.amount, 0);

  // Calcular saldo final
  // Receitas + Ajustes - Despesas - Contas
  const finalBalance = totalIncome + totalAdjustments - totalExpenses - billsTotalPaid;
  
  // Calcular quanto ainda será gasto (contas pendentes)
  const pendingAmount = billsTotalAmount - billsTotalPaid;

  // Calcular saldo previsto (após pagar todas as contas)
  const expectedBalance = finalBalance - pendingAmount;

  // Formatação de valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para chamar onAddEntry com log para debug
  const handleAddClick = () => {
    console.log("BudgetSummary: Botão Adicionar clicado");
    onAddEntry();
  };

  return (
    <div className="space-y-4" data-testid="budget-summary">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          Orçamento: {formatMonthYear(month, year)}
        </h2>
        <button 
          onClick={handleAddClick}
          type="button"
          className="budget-action-button"
        >
          <PlusCircle size={16} />
          <span>Adicionar</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="card bg-blue-50">
          <div className="flex items-center gap-2">
            <ArrowUp className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-600 font-medium">Receitas</p>
          </div>
          <p className="text-2xl font-bold mt-1 text-green-700">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        
        <div className="card bg-red-50">
          <div className="flex items-center gap-2">
            <ArrowDown className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-600 font-medium">Despesas + Contas Pagas</p>
          </div>
          <p className="text-2xl font-bold mt-1 text-red-700">
            {formatCurrency(totalExpenses + billsTotalPaid)}
          </p>
        </div>
      </div>
      
      <div className="card bg-gray-50">
        <h3 className="font-medium text-gray-700">Resumo</h3>
        
        <div className="mt-2 space-y-2 text-sm">
          <div className="flex justify-between border-b pb-1">
            <span>Receitas Totais:</span>
            <span className="font-medium">{formatCurrency(totalIncome)}</span>
          </div>
          
          <div className="flex justify-between border-b pb-1">
            <span>Despesas Adicionais:</span>
            <span className="font-medium text-red-600">- {formatCurrency(totalExpenses)}</span>
          </div>
          
          <div className="flex justify-between border-b pb-1">
            <span>Contas Pagas:</span>
            <span className="font-medium text-red-600">- {formatCurrency(billsTotalPaid)}</span>
          </div>
          
          <div className="flex justify-between border-b pb-1">
            <span>Ajustes:</span>
            <span className="font-medium">{formatCurrency(totalAdjustments)}</span>
          </div>
          
          <div className="flex justify-between border-b pb-1">
            <span>Contas Pendentes:</span>
            <span className="font-medium text-yellow-600">{formatCurrency(pendingAmount)}</span>
          </div>
          
          <div className="flex justify-between pt-1">
            <span className="font-semibold">Saldo Atual:</span>
            <span className={`font-bold ${finalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(finalBalance)}
            </span>
          </div>
          
          <div className="flex justify-between pt-1">
            <span className="font-semibold">Saldo Previsto:</span>
            <span className={`font-bold ${expectedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(expectedBalance)}
            </span>
          </div>
        </div>
      </div>
      
      {budgetEntries.length > 0 && (
        <div className="card">
          <h3 className="font-medium text-gray-700 mb-2">Detalhes do Orçamento</h3>
          
          <div className="space-y-2">
            {budgetEntries.map(entry => (
              <div 
                key={entry.id} 
                className="flex justify-between items-center py-2 border-b last:border-b-0"
              >
                <div>
                  <div className="flex items-center gap-2">
                    {entry.type === 'income' && <ArrowUp className="h-4 w-4 text-green-600" />}
                    {entry.type === 'expense' && <ArrowDown className="h-4 w-4 text-red-600" />}
                    {entry.type === 'adjustment' && <span className="text-blue-600">±</span>}
                    
                    <span className="font-medium">
                      {entry.description || (
                        entry.type === 'income' ? 'Receita' : 
                        entry.type === 'expense' ? 'Despesa' : 'Ajuste'
                      )}
                    </span>
                  </div>
                </div>
                
                <span className={`font-medium ${
                  entry.type === 'income' ? 'text-green-600' : 
                  entry.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {entry.type === 'expense' ? '- ' : ''}{formatCurrency(entry.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 