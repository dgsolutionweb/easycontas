import { Search, PlusCircle } from 'lucide-react';

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
  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold flex-1">Minhas Contas</h1>
        <button 
          onClick={onAddNew}
          className="btn btn-primary flex items-center gap-1"
        >
          <PlusCircle size={18} />
          <span>Nova Conta</span>
        </button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar contas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex">
            <FilterButton 
              active={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
              label="Todas"
            />
            <FilterButton 
              active={statusFilter === 'pending'}
              onClick={() => setStatusFilter('pending')}
              label="Pendentes"
            />
            <FilterButton 
              active={statusFilter === 'paid'}
              onClick={() => setStatusFilter('paid')}
              label="Pagas"
            />
            <FilterButton 
              active={statusFilter === 'overdue'}
              onClick={() => setStatusFilter('overdue')}
              label="Vencidas"
              isLast
            />
          </div>
          
          <div className="flex">
            <FilterButton 
              active={billTypeFilter === 'all'}
              onClick={() => setBillTypeFilter('all')}
              label="Todos Tipos"
            />
            <FilterButton 
              active={billTypeFilter === 'fixed'}
              onClick={() => setBillTypeFilter('fixed')}
              label="Fixas"
            />
            <FilterButton 
              active={billTypeFilter === 'variable'}
              onClick={() => setBillTypeFilter('variable')}
              label="Variáveis"
              isLast
            />
          </div>
        </div>
      </div>
    </div>
  );
}

type FilterButtonProps = {
  active: boolean;
  onClick: () => void;
  label: string;
  isLast?: boolean;
};

function FilterButton({ active, onClick, label, isLast }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-2 text-sm border-y border-l ${isLast ? 'border-r rounded-r-md' : ''}
        ${active
          ? 'bg-primary text-primary-foreground'
          : 'bg-white hover:bg-gray-50'
        }
        ${!isLast && !active ? 'border-r-0' : ''}
        ${!isLast && active ? 'border-r' : ''}
        ${isLast && !active ? 'rounded-r-md' : ''}
        ${active && isLast ? 'rounded-r-md' : ''}
        first:rounded-l-md
        transition-colors
      `}
    >
      {label}
    </button>
  );
} 