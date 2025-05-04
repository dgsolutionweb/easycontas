import { ReactNode, useState, createContext, useContext } from 'react';

// Criar um contexto para as tabs
interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType>({
  activeTab: '',
  setActiveTab: () => {}
});

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function SimpleTabs({ defaultValue, children, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  // Função para atualizar o tab ativo
  const handleTabChange = (tabValue: string) => {
    console.log("SimpleTabs: Trocando para tab", tabValue);
    setActiveTab(tabValue);
  };

  // Valor do contexto 
  const contextValue = {
    activeTab,
    setActiveTab: handleTabChange
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={`tabs-container ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function SimpleTabsList({ children, className = '' }: TabsListProps) {
  return (
    <div className={`tabs-list inline-flex rounded-md bg-accent p-1 ${className}`}>
      {children}
    </div>
  );
}

export function SimpleTabsTrigger({ 
  value, 
  children, 
  className = ''
}: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;
  
  const handleClick = () => {
    console.log(`SimpleTabsTrigger: Clicado em ${value}, ativo atualmente=${isActive}, vai mudar para ativo=true`);
    setActiveTab(value);
  };
  
  return (
    <button
      onClick={handleClick}
      className={`tabs-trigger px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-card text-primary shadow-sm'
          : 'text-muted-foreground hover:text-primary'
      } ${className}`}
      data-value={value}
      data-active={isActive}
      type="button"
    >
      {children}
    </button>
  );
}

export function SimpleTabsContent({ 
  value, 
  children, 
  className = ''
}: TabsContentProps) {
  const { activeTab } = useContext(TabsContext);
  const isVisible = activeTab === value;
  
  // Não renderizar se não estiver visível
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className={`tabs-content ${className}`} data-value={value}>
      {children}
    </div>
  );
}

// Adicionar displayName para debugging
SimpleTabs.displayName = 'SimpleTabs';
SimpleTabsList.displayName = 'SimpleTabsList';
SimpleTabsTrigger.displayName = 'SimpleTabsTrigger';
SimpleTabsContent.displayName = 'SimpleTabsContent'; 