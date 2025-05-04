import { Search, PlusCircle, Filter, X } from 'lucide-react';
import { useState } from 'react';

type FilterStatus = 'all' | 'paid' | 'pending' | 'overdue';

type FilterControlsProps = {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: FilterStatus;
  setStatusFilter: (status: FilterStatus) => void;
  billTypeFilter: 'all' | 'fixed' | 'variable';
  setBillTypeFilter: (type: 'all' | 'fixed' | 'variable') => void;
  onAddNew: () => void;
};

export function FilterControls({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  billTypeFilter,
  setBillTypeFilter,
  onAddNew
}: FilterControlsProps) {
  const [showFilters, setShowFilters] = useState(false);
  
  // Verificar se algum filtro está ativo (além do 'all')
  const hasActiveFilters = statusFilter !== 'all' || billTypeFilter !== 'all' || search.trim() !== '';
  
  return (
    <div className="space-y-3 mb-6" id="bills-section">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Minhas Contas</h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg border 
              ${hasActiveFilters 
                ? 'bg-primary/10 border-primary/30 text-primary' 
                : 'bg-accent border-card-border text-accent-foreground'}`}
            aria-label={showFilters ? 'Ocultar filtros' : 'Exibir filtros'}
          >
            <Filter size={18} />
            <span className="hidden xs:inline">{showFilters ? 'Ocultar Filtros' : 'Filtros'}</span>
            {hasActiveFilters && (
              <span className="flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full">!</span>
            )}
          </button>
          
          <button 
            onClick={onAddNew}
            className="btn btn-primary flex items-center gap-1"
            aria-label="Adicionar nova conta"
          >
            <PlusCircle size={18} />
            <span className="hidden xs:inline">Nova Conta</span>
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-accent rounded-lg p-3 border border-card-border space-y-3 animate-fadeIn">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Buscar contas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input w-full pl-10 pr-10"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-3 flex items-center"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Status:</p>
            <div className="flex flex-wrap gap-2">
              <MobileFilterButton 
                active={statusFilter === 'all'}
                onClick={() => setStatusFilter('all')}
                label="Todas"
              />
              <MobileFilterButton 
                active={statusFilter === 'pending'}
                onClick={() => setStatusFilter('pending')}
                label="Pendentes"
              />
              <MobileFilterButton 
                active={statusFilter === 'paid'}
                onClick={() => setStatusFilter('paid')}
                label="Pagas"
              />
              <MobileFilterButton 
                active={statusFilter === 'overdue'}
                onClick={() => setStatusFilter('overdue')}
                label="Vencidas"
              />
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Tipo:</p>
            <div className="flex flex-wrap gap-2">
              <MobileFilterButton 
                active={billTypeFilter === 'all'}
                onClick={() => setBillTypeFilter('all')}
                label="Todos"
              />
              <MobileFilterButton 
                active={billTypeFilter === 'fixed'}
                onClick={() => setBillTypeFilter('fixed')}
                label="Fixas"
              />
              <MobileFilterButton 
                active={billTypeFilter === 'variable'}
                onClick={() => setBillTypeFilter('variable')}
                label="Variáveis"
              />
            </div>
          </div>
          
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setBillTypeFilter('all');
                }}
                className="text-sm text-destructive hover:text-destructive/80 flex items-center gap-1"
              >
                <X size={14} />
                <span>Limpar todos os filtros</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type FilterButtonProps = {
  active: boolean;
  onClick: () => void;
  label: string;
  isLast?: boolean;
};

function MobileFilterButton({ active, onClick, label }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 text-sm rounded-full transition-colors
        ${active
          ? 'bg-primary text-primary-foreground'
          : 'bg-card border border-card-border hover:bg-accent'
        }
      `}
    >
      {label}
    </button>
  );
} 