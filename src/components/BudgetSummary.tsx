import { ArrowDown, ArrowUp, PlusCircle, Pencil, Trash2, Filter, X, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { Budget, formatMonthYear } from '../lib/supabase';
import { useState } from 'react';

type BudgetSummaryProps = {
  budgetEntries: Budget[];
  billsTotalAmount: number;
  billsTotalPaid: number;
  month: number;
  year: number;
  onAddEntry: () => void;
  onEditEntry?: (entry: Budget) => void;
  onDeleteEntry?: (id: string) => void;
};

type EntryTypeFilter = 'all' | 'income' | 'expense' | 'adjustment';

export function BudgetSummary({
  budgetEntries,
  billsTotalAmount,
  billsTotalPaid,
  month,
  year,
  onAddEntry,
  onEditEntry,
  onDeleteEntry
}: BudgetSummaryProps) {
  const [filterType, setFilterType] = useState<EntryTypeFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  // Aplicar filtros às entradas
  const filteredEntries = budgetEntries.filter(entry => 
    filterType === 'all' || entry.type === filterType
  );
  
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
      currency: 'BRL',
      maximumFractionDigits: 2
    }).format(value);
  };

  // Função para chamar onAddEntry com log para debug
  const handleAddClick = () => {
    console.log("BudgetSummary: Botão Adicionar clicado");
    onAddEntry();
  };

  // Função para editar uma entrada
  const handleEditEntry = (entry: Budget) => {
    console.log("BudgetSummary: Editar entrada", entry.id);
    if (onEditEntry) {
      onEditEntry(entry);
    }
  };

  // Função para excluir uma entrada
  const handleDeleteEntry = (id: string) => {
    console.log("BudgetSummary: Excluir entrada", id);
    if (onDeleteEntry && confirm('Tem certeza que deseja excluir esta entrada?')) {
      onDeleteEntry(id);
    }
  };

  // Verificar se tem filtros ativos
  const hasActiveFilters = filterType !== 'all';

  return (
    <div className="space-y-4" data-testid="budget-summary">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold truncate">
            <span className="hidden xs:inline">Orçamento:</span> 
            <span className="inline xs:hidden">Orç:</span> 
            <span className="ml-1 flex items-center gap-1">
              <Calendar size={16} className="text-muted-foreground" />
              {formatMonthYear(month, year)}
            </span>
          </h2>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            type="button"
            className={`budget-action-button bg-accent text-accent-foreground hover:bg-accent/90
              ${hasActiveFilters ? '!bg-primary/20 !border-primary/30 !text-primary' : ''}`}
          >
            <Filter size={16} />
            <span className="hidden xs:inline">{showFilters ? 'Ocultar Filtros' : 'Filtros'}</span>
            {hasActiveFilters && (
              <span className="flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full">!</span>
            )}
          </button>
          
          <button 
            onClick={handleAddClick}
            type="button"
            className="budget-action-button"
          >
            <PlusCircle size={16} />
            <span className="hidden xs:inline">Adicionar</span>
          </button>
        </div>
      </div>
      
      {/* Área de filtros */}
      {showFilters && (
        <div className="p-3 bg-accent/80 rounded-lg border border-card-border shadow-sm animate-fadeIn dark:bg-accent/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Filtrar por tipo:</span>
            {hasActiveFilters && (
              <button
                onClick={() => setFilterType('all')} 
                className="text-xs text-destructive flex items-center gap-1"
              >
                <X size={14} />
                <span>Limpar</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-sm rounded-full ${
                filterType === 'all' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card text-card-foreground hover:bg-card/70'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 text-sm rounded-full flex items-center gap-1 ${
                filterType === 'income' 
                  ? 'bg-success text-success-foreground' 
                  : 'bg-success/10 text-success hover:bg-success/20'
              }`}
            >
              <ArrowUp size={14} />
              Receitas
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 text-sm rounded-full flex items-center gap-1 ${
                filterType === 'expense' 
                  ? 'bg-destructive text-destructive-foreground' 
                  : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
              }`}
            >
              <ArrowDown size={14} />
              Despesas
            </button>
            <button
              onClick={() => setFilterType('adjustment')}
              className={`px-3 py-1.5 text-sm rounded-full flex items-center gap-1 ${
                filterType === 'adjustment' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              <span className="text-[10px] font-bold">±</span>
              Ajustes
            </button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <div className="card bg-gradient-to-br from-success/15 to-success/5 border-success/20 dark:from-success/20 dark:to-success/10 dark:border-success/30 shadow-md p-3">
          <div className="flex items-center gap-2">
            <ArrowUp className="h-5 w-5 text-success" />
            <p className="text-xs sm:text-sm font-medium">Receitas</p>
          </div>
          <p className="text-lg sm:text-2xl font-bold mt-1 text-success truncate dark:text-success">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        
        <div className="card bg-gradient-to-br from-destructive/15 to-destructive/5 border-destructive/20 dark:from-destructive/20 dark:to-destructive/10 dark:border-destructive/30 shadow-md p-3">
          <div className="flex items-center gap-2">
            <ArrowDown className="h-5 w-5 text-destructive" />
            <p className="text-xs sm:text-sm font-medium">Despesas + Contas Pagas</p>
          </div>
          <p className="text-lg sm:text-2xl font-bold mt-1 text-destructive truncate dark:text-destructive">
            {formatCurrency(totalExpenses + billsTotalPaid)}
          </p>
        </div>
      </div>
      
      <div className="card bg-accent/50 dark:bg-accent/30 dark:border-accent/40 shadow-md p-3">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
          <h3 className="font-medium">Resumo</h3>
          <button className="text-accent-foreground" aria-label={showDetails ? "Ocultar detalhes" : "Mostrar detalhes"}>
            {showDetails ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
        
        {showDetails && (
          <div className="mt-2 space-y-2 text-sm animate-fadeIn">
            <div className="flex justify-between border-b border-card-border pb-1">
              <span>Receitas Totais:</span>
              <span className="font-medium">{formatCurrency(totalIncome)}</span>
            </div>
            
            <div className="flex justify-between border-b border-card-border pb-1">
              <span>Despesas Adicionais:</span>
              <span className="font-medium text-destructive">- {formatCurrency(totalExpenses)}</span>
            </div>
            
            <div className="flex justify-between border-b border-card-border pb-1">
              <span>Contas Pagas:</span>
              <span className="font-medium text-destructive">- {formatCurrency(billsTotalPaid)}</span>
            </div>
            
            <div className="flex justify-between border-b border-card-border pb-1">
              <span>Ajustes:</span>
              <span className="font-medium">{formatCurrency(totalAdjustments)}</span>
            </div>
            
            <div className="flex justify-between border-b border-card-border pb-1">
              <span>Contas Pendentes:</span>
              <span className="font-medium text-amber-500 dark:text-amber-400">{formatCurrency(pendingAmount)}</span>
            </div>
            
            <div className="flex justify-between pt-1">
              <span className="font-semibold">Saldo Atual:</span>
              <span className={`font-bold ${finalBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(finalBalance)}
              </span>
            </div>
            
            <div className="flex justify-between pt-1">
              <span className="font-semibold">Saldo Previsto:</span>
              <span className={`font-bold ${expectedBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(expectedBalance)}
              </span>
            </div>
          </div>
        )}
      </div>
      
      {filteredEntries.length > 0 ? (
        <div className="card bg-card dark:bg-card/60 shadow-md p-3">
          <h3 className="font-medium mb-2 flex items-center justify-between">
            <span>
              Detalhes do Orçamento 
              {filterType !== 'all' && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (Filtrado: {
                    filterType === 'income' ? 'Receitas' : 
                    filterType === 'expense' ? 'Despesas' : 'Ajustes'
                  })
                </span>
              )}
            </span>
            <span className="text-xs text-muted-foreground">{filteredEntries.length} itens</span>
          </h3>
          
          <div className="space-y-1">
            {filteredEntries.map(entry => (
              <div 
                key={entry.id} 
                className="flex justify-between items-center py-2 border-b last:border-b-0 border-card-border hover:bg-accent/50 hover:dark:bg-accent/30 rounded-md px-2 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {entry.type === 'income' && <ArrowUp className="h-4 w-4 text-success shrink-0" />}
                    {entry.type === 'expense' && <ArrowDown className="h-4 w-4 text-destructive shrink-0" />}
                    {entry.type === 'adjustment' && <span className="text-primary w-4 h-4 flex items-center justify-center shrink-0 font-bold">±</span>}
                    
                    <span className="font-medium truncate">
                      {entry.description || (
                        entry.type === 'income' ? 'Receita' : 
                        entry.type === 'expense' ? 'Despesa' : 'Ajuste'
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-3">
                  <span className={`font-medium whitespace-nowrap ${
                    entry.type === 'income' ? 'text-success' : 
                    entry.type === 'expense' ? 'text-destructive' : 'text-primary'
                  }`}>
                    {entry.type === 'expense' ? '- ' : ''}{formatCurrency(entry.amount)}
                  </span>
                  
                  <div className="flex shrink-0">
                    {onEditEntry && (
                      <button 
                        onClick={() => handleEditEntry(entry)}
                        className="p-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        title="Editar"
                        aria-label="Editar entrada"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    
                    {onDeleteEntry && (
                      <button 
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-1 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors ml-1"
                        title="Excluir"
                        aria-label="Excluir entrada"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : budgetEntries.length > 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Nenhuma entrada encontrada com o filtro selecionado.</p>
          <button 
            onClick={() => setFilterType('all')}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Mostrar todas as entradas
          </button>
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Nenhuma entrada de orçamento encontrada.</p>
          <p className="text-muted-foreground text-sm mt-1">Clique em "Adicionar" para criar a primeira entrada.</p>
        </div>
      )}
    </div>
  );
} 