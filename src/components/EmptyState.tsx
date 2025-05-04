import { Plus } from 'lucide-react';

type EmptyStateProps = {
  onAddNew: () => void;
  message?: string;
};

export function EmptyState({ onAddNew, message }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="bg-accent/70 inline-flex p-4 mb-4 rounded-full">
        <Plus className="h-6 w-6 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-medium mb-1">
        {message || "Nenhuma conta cadastrada"}
      </h3>
      <p className="text-muted-foreground mb-4">
        Cadastre sua primeira conta para começar a gerenciar suas finanças.
      </p>
      
      <button
        onClick={onAddNew}
        className="btn btn-primary"
      >
        Adicionar Conta
      </button>
    </div>
  );
} 