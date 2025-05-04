import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase, Bill, Budget, getCurrentMonthYear, getCurrentUser, AuthUser } from '../lib/supabase';
import { BillForm } from '../components/BillForm';
import { BillCard } from '../components/BillCard';
import { EmptyState } from '../components/EmptyState';
import { FilterControls } from '../components/FilterControls';
import { BudgetForm } from '../components/BudgetForm';
import { BudgetSummary } from '../components/BudgetSummary';
import { SimpleTabs, SimpleTabsList, SimpleTabsTrigger, SimpleTabsContent } from '../components/SimpleTabs';

type FilterStatus = 'all' | 'paid' | 'pending' | 'overdue';
type BillFormMode = 'add' | 'edit';

export function Home() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [budgetEntries, setBudgetEntries] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [billTypeFilter, setBillTypeFilter] = useState<'all' | 'fixed' | 'variable'>('all');
  const [showForm, setShowForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [formMode, setFormMode] = useState<BillFormMode>('add');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  
  // Obter o mês e ano atual
  const { month, year } = getCurrentMonthYear();

  // Função para carregar todos os dados do usuário
  const loadUserData = async (userId: string) => {
    console.log("loadUserData: Carregando dados para o usuário", userId);
    setIsLoading(true);
    
    try {
      await Promise.all([
        fetchBills(userId),
        fetchBudget(userId)
      ]);
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      toast.error("Falha ao carregar dados. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Primeiro useEffect: Verifica o usuário atual e carrega os dados iniciais
  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        console.log("Home: Verificando usuário atual...");
        const user = await getCurrentUser();
        
        if (user) {
          console.log("Home: Usuário encontrado:", user.id);
          setCurrentUser(user);
          setIsUserVerified(true);
          
          // Carregar dados imediatamente após encontrar o usuário
          await loadUserData(user.id);
        } else {
          console.log("Home: Nenhum usuário encontrado");
          setIsUserVerified(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Home: Erro ao verificar usuário:", error);
        setIsUserVerified(true);
        setIsLoading(false);
      }
    };
    
    fetchUserAndData();
  }, []);

  // Segundo useEffect: Observa mudanças na autenticação
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Home: Evento de autenticação:", event);
      
      if (session?.user) {
        const userAuth = session.user as AuthUser;
        console.log("Home: Usuário autenticado:", userAuth.id);
        
        setCurrentUser(userAuth);
        setIsUserVerified(true);
        
        // Recarregar dados quando o usuário fizer login
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          await loadUserData(userAuth.id);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("Home: Usuário desconectado");
        setCurrentUser(null);
        setBills([]);
        setBudgetEntries([]);
        setIsLoading(false);
      }
    });
    
    return () => {
      console.log("Home: Removendo listener de autenticação");
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchBills = async (userId?: string) => {
    const uid = userId || currentUser?.id;
    if (!uid) {
      console.log("fetchBills: Nenhum usuário disponível");
      return;
    }
    
    try {
      console.log("fetchBills: Buscando contas para usuário", uid);
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', uid)
        .order('due_date', { ascending: true });

      if (error) {
        console.error("fetchBills: Erro ao buscar contas:", error);
        throw error;
      }
      
      console.log(`fetchBills: ${data?.length || 0} contas encontradas`);
      setBills(data as Bill[]);
      return data;
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
      toast.error('Falha ao carregar contas');
      return [];
    }
  };

  const fetchBudget = async (userId?: string) => {
    const uid = userId || currentUser?.id;
    if (!uid) {
      console.log("fetchBudget: Nenhum usuário disponível");
      return;
    }
    
    try {
      console.log("fetchBudget: Buscando orçamento para usuário", uid);
      const { month, year } = getCurrentMonthYear();
      
      const { data, error } = await supabase
        .from('budget')
        .select('*')
        .eq('user_id', uid)
        .eq('month', month)
        .eq('year', year)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("fetchBudget: Erro ao buscar orçamento:", error);
        throw error;
      }
      
      console.log(`fetchBudget: ${data?.length || 0} entradas de orçamento encontradas`);
      setBudgetEntries(data as Budget[]);
      return data;
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
      toast.error('Falha ao carregar orçamento');
      return [];
    }
  };

  const handleAddNewBill = async (bill: Omit<Bill, 'id' | 'created_at'>) => {
    if (!currentUser) {
      toast.error("Você precisa estar logado para adicionar contas");
      return;
    }
    
    try {
      // Garantir que o user_id seja definido
      const billWithUserId = {
        ...bill,
        user_id: currentUser.id
      };
      
      // Verificar se é uma compra parcelada
      if (bill.is_installment && bill.total_installments && bill.total_installments > 1) {
        await createInstallments(billWithUserId);
        return;
      }
      
      // Caso não seja parcelado, criar normalmente
      const { data, error } = await supabase
        .from('bills')
        .insert([{ 
          ...billWithUserId, 
          created_at: new Date().toISOString() 
        }])
        .select();

      if (error) {
        console.error("handleAddNewBill: Erro ao inserir conta:", error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log("handleAddNewBill: Conta adicionada com sucesso:", data[0].id);
        setBills(prevBills => [...prevBills, data[0] as Bill]);
        setShowForm(false);
        toast.success("Conta adicionada com sucesso!");
      }
    } catch (error) {
      console.error('Erro ao adicionar conta:', error);
      toast.error('Falha ao adicionar conta');
      throw error;
    }
  };
  
  const createInstallments = async (bill: Omit<Bill, 'id' | 'created_at'>) => {
    if (!currentUser) {
      toast.error("Você precisa estar logado para adicionar contas");
      return;
    }
    
    try {
      if (!bill.total_installments || !bill.installment_number) {
        throw new Error('Informações de parcelas inválidas');
      }
      
      const baseDueDate = new Date(bill.due_date);
      const baseDescription = bill.description;
      const installmentsToCreate: Omit<Bill, 'id' | 'created_at'>[] = [];
      
      // Criar um array com todas as parcelas
      for (let i = 1; i <= bill.total_installments; i++) {
        // Calcular a data de vencimento para cada parcela
        const installmentDate = new Date(baseDueDate);
        
        // Se não for a primeira parcela, adicionar meses
        if (i > 1) {
          installmentDate.setMonth(baseDueDate.getMonth() + (i - 1));
        }
        
        // Determinar se a parcela atual já foi paga
        const isPaid = i < bill.installment_number;
        
        installmentsToCreate.push({
          description: `${baseDescription} (${i}/${bill.total_installments})`,
          amount: bill.amount,
          due_date: installmentDate.toISOString().split('T')[0],
          paid: i === bill.installment_number ? bill.paid : isPaid,
          split: bill.split,
          bill_type: bill.bill_type,
          is_installment: true,
          installment_number: i,
          total_installments: bill.total_installments,
          user_id: currentUser.id
        });
      }
      
      // Inserir todas as parcelas no banco de dados
      const { data, error } = await supabase
        .from('bills')
        .insert(installmentsToCreate.map(bill => ({ 
          ...bill, 
          created_at: new Date().toISOString() 
        })))
        .select();
      
      if (error) {
        console.error("createInstallments: Erro ao criar parcelas:", error);
        throw error;
      }
      
      // Atualizar estado
      if (data && data.length > 0) {
        console.log(`createInstallments: ${data.length} parcelas criadas com sucesso`);
        setBills(prevBills => [...prevBills, ...(data as Bill[])]);
        setShowForm(false);
        toast.success(`${bill.total_installments} parcelas criadas com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao criar parcelas:', error);
      toast.error('Falha ao criar parcelas');
      throw error;
    }
  };

  const handleUpdateBill = async (bill: Omit<Bill, 'id' | 'created_at'>) => {
    if (!selectedBill || !currentUser) {
      toast.error("Não foi possível atualizar a conta");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('bills')
        .update({
          ...bill,
          user_id: currentUser.id // Garantir que user_id seja mantido
        })
        .eq('id', selectedBill.id)
        .eq('user_id', currentUser.id); // Garantir que apenas o dono da conta possa atualizá-la

      if (error) {
        console.error("handleUpdateBill: Erro ao atualizar conta:", error);
        throw error;
      }

      // Atualizar a lista local de contas
      setBills(prevBills => 
        prevBills.map(b => b.id === selectedBill.id ? { ...b, ...bill, user_id: currentUser.id } : b)
      );
      
      setShowForm(false);
      setSelectedBill(null);
      toast.success("Conta atualizada com sucesso!");
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      toast.error('Falha ao atualizar conta');
      throw error;
    }
  };

  const handleDeleteBill = async (id: string) => {
    if (!currentUser) {
      toast.error("Você precisa estar logado para excluir contas");
      return;
    }
    
    // Verificar se a conta faz parte de uma compra parcelada
    const billToDelete = bills.find(bill => bill.id === id);
    if (billToDelete?.is_installment) {
      await handleDeleteInstallment(billToDelete);
      return;
    }
    
    // Caso não seja parcelado, excluir normalmente
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return;
    
    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id); // Garantir que apenas o dono da conta possa excluí-la

      if (error) {
        console.error("handleDeleteBill: Erro ao excluir conta:", error);
        throw error;
      }

      setBills(prevBills => prevBills.filter(bill => bill.id !== id));
      toast.success('Conta excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast.error('Falha ao excluir conta');
    }
  };
  
  const handleDeleteInstallment = async (bill: Bill) => {
    if (!currentUser) {
      toast.error("Você precisa estar logado para excluir contas");
      return;
    }
    
    // Verificar se o usuário deseja excluir apenas esta parcela ou todas as parcelas da compra
    const deleteOptions = [
      'Excluir apenas esta parcela',
      'Excluir esta e todas as parcelas futuras',
      'Excluir todas as parcelas desta compra',
      'Cancelar'
    ];
    
    const optionText = prompt(`Esta conta faz parte de uma compra parcelada. O que deseja fazer?
1. ${deleteOptions[0]}
2. ${deleteOptions[1]}
3. ${deleteOptions[2]}
4. ${deleteOptions[3]}

Digite o número da opção desejada:`);

    // Converter o texto para índice (ajustando -1 pois nosso array começa em 0)
    const optionIndex = optionText ? parseInt(optionText) - 1 : 3;
    
    // Se o usuário cancelou ou escolheu opção inválida
    if (optionIndex === 3 || optionIndex < 0 || optionIndex > 3) {
      console.log("Operação cancelada pelo usuário ou opção inválida");
      return;
    }
    
    try {
      console.log(`Executando opção ${optionIndex + 1}: ${deleteOptions[optionIndex]}`);
      
      // Extrair a descrição base da parcela (remover o sufixo "(X/Y)" se existir)
      const baseDescription = bill.description.split(' (')[0];
      console.log(`Descrição base: "${baseDescription}"`);
      
      // Opção 0: Excluir apenas esta parcela
      if (optionIndex === 0) {
        console.log(`Excluindo apenas a parcela de ID: ${bill.id}`);
        const { error } = await supabase
          .from('bills')
          .delete()
          .eq('id', bill.id);
          
        if (error) throw error;
      } 
      // Opção 1 ou 2: Usar a função especializada
      else {
        const { data, error } = await supabase
          .rpc('delete_installments', {
            p_user_id: currentUser.id,
            p_base_description: baseDescription,
            p_total_installments: bill.total_installments,
            p_installment_number: optionIndex === 1 ? bill.installment_number : null,
            p_delete_all: optionIndex === 2
          });
          
        if (error) throw error;
        
        console.log(`Parcelas excluídas: ${data?.[0]?.deleted_count || 0}`);
      }
      
      // Atualizar o estado recarregando as contas
      await fetchBills(currentUser.id);
      
      toast.success('Parcela(s) excluída(s) com sucesso');
    } catch (error) {
      console.error('Erro ao excluir parcela(s):', error);
      toast.error('Falha ao excluir parcela(s)');
    }
  };

  const handleTogglePaid = async (id: string, paid: boolean) => {
    if (!currentUser) {
      toast.error("Você precisa estar logado para atualizar contas");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('bills')
        .update({ paid })
        .eq('id', id)
        .eq('user_id', currentUser.id); // Garantir que apenas o dono da conta possa atualizá-la

      if (error) {
        console.error("handleTogglePaid: Erro ao alterar status da conta:", error);
        throw error;
      }

      setBills(prevBills => 
        prevBills.map(bill => bill.id === id ? { ...bill, paid } : bill)
      );
      
      toast.success(paid ? 'Conta marcada como paga' : 'Conta marcada como não paga');
    } catch (error) {
      console.error('Erro ao alterar status da conta:', error);
      toast.error('Falha ao alterar status');
    }
  };

  const handleAddBudgetEntry = async (budget: Omit<Budget, 'id' | 'created_at'>) => {
    if (!currentUser) {
      toast.error("Você precisa estar logado para adicionar ao orçamento");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('budget')
        .insert([{ 
          ...budget, 
          user_id: currentUser.id, // Garantir que user_id seja definido
          created_at: new Date().toISOString() 
        }])
        .select();

      if (error) {
        console.error("handleAddBudgetEntry: Erro ao adicionar orçamento:", error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log("handleAddBudgetEntry: Orçamento adicionado com sucesso:", data[0].id);
        setBudgetEntries(prevEntries => [...prevEntries, data[0] as Budget]);
        setShowBudgetForm(false);
        toast.success('Orçamento atualizado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao adicionar orçamento:', error);
      toast.error('Falha ao adicionar ao orçamento');
      throw error;
    }
  };

  const handleEditBill = (bill: Bill) => {
    setSelectedBill(bill);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleAddNewClick = () => {
    setSelectedBill(null);
    setFormMode('add');
    setShowForm(true);
  };

  // Adicionar função para mostrar o formulário de orçamento
  const handleShowBudgetForm = () => {
    console.log("Home: Exibindo formulário de orçamento");
    // Para evitar que o formulário de contas seja exibido ao mesmo tempo
    setShowForm(false);
    // Exibir o formulário de orçamento
    setShowBudgetForm(true);
  };

  // Adicionar função para fechar o formulário de orçamento
  const handleCloseBudgetForm = () => {
    console.log("Home: Fechando formulário de orçamento");
    setShowBudgetForm(false);
  };

  const filteredBills = bills.filter(bill => {
    // Filtro por texto de busca
    const matchesSearch = search === '' || 
      bill.description.toLowerCase().includes(search.toLowerCase());

    // Filtro por status
    let matchesStatus = true;
    if (statusFilter === 'paid') {
      matchesStatus = bill.paid;
    } else if (statusFilter === 'pending') {
      matchesStatus = !bill.paid && new Date(bill.due_date) >= new Date();
    } else if (statusFilter === 'overdue') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(bill.due_date);
      dueDate.setHours(0, 0, 0, 0);
      matchesStatus = !bill.paid && dueDate < today;
    }
    
    // Filtro por tipo de conta
    const matchesType = billTypeFilter === 'all' || bill.bill_type === billTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calcula o total e o total dividido
  const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);
  const totalSplitAmount = filteredBills
    .filter(bill => bill.split)
    .reduce((sum, bill) => sum + bill.amount / 2, 0) + 
    filteredBills
      .filter(bill => !bill.split)
      .reduce((sum, bill) => sum + bill.amount, 0);
      
  // Calcular o total pago (para o orçamento)
  const totalPaidAmount = bills
    .filter(bill => bill.paid)
    .reduce((sum, bill) => sum + bill.amount, 0);

  // Modificar o retorno do componente para verificar se o usuário está disponível
  if (!isUserVerified) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="py-20 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Verificando usuário...</p>
        </div>
      </div>
    );
  }

  // Renderizando o conteúdo principal
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <SimpleTabs defaultValue="bills" className="space-y-6">
        <SimpleTabsList>
          <SimpleTabsTrigger value="bills">Contas</SimpleTabsTrigger>
          <SimpleTabsTrigger value="budget">Orçamento</SimpleTabsTrigger>
        </SimpleTabsList>
        
        <SimpleTabsContent value="bills">
          <FilterControls 
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            billTypeFilter={billTypeFilter}
            setBillTypeFilter={setBillTypeFilter}
            onAddNew={handleAddNewClick}
          />
          
          {isLoading ? (
            <div className="py-20 text-center">
              <p>Carregando contas...</p>
            </div>
          ) : showForm ? (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {formMode === 'add' ? 'Adicionar Nova Conta' : 'Editar Conta'}
                </h2>
                <button 
                  onClick={() => {
                    setShowForm(false);
                    setSelectedBill(null);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancelar
                </button>
              </div>
              
              <div className="card">
                <BillForm 
                  onSubmit={formMode === 'add' ? handleAddNewBill : handleUpdateBill}
                  initialData={selectedBill || {}}
                  buttonText={formMode === 'add' ? 'Adicionar Conta' : 'Salvar Alterações'}
                />
              </div>
            </div>
          ) : bills.length === 0 ? (
            <EmptyState onAddNew={handleAddNewClick} />
          ) : (
            <>
              {filteredBills.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground">
                    Nenhuma conta encontrada com os filtros selecionados.
                  </p>
                  <button 
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('all');
                      setBillTypeFilter('all');
                    }}
                    className="mt-2 text-sm text-primary hover:underline"
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="card bg-blue-50">
                      <p className="text-sm text-blue-600 font-medium">Total de Contas</p>
                      <p className="text-2xl font-bold mt-1">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(totalAmount)}
                      </p>
                    </div>
                    
                    <div className="card bg-purple-50">
                      <p className="text-sm text-purple-600 font-medium">Total Dividido</p>
                      <p className="text-2xl font-bold mt-1">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(totalSplitAmount)}
                      </p>
                    </div>
                    
                    <div className="card bg-green-50">
                      <p className="text-sm text-green-600 font-medium">Total Pago</p>
                      <p className="text-2xl font-bold mt-1">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(totalPaidAmount)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {filteredBills.map(bill => (
                      <BillCard
                        key={bill.id}
                        bill={bill}
                        onEdit={handleEditBill}
                        onDelete={handleDeleteBill}
                        onTogglePaid={handleTogglePaid}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </SimpleTabsContent>
        
        <SimpleTabsContent value="budget">
          {isLoading ? (
            <div className="py-20 text-center">
              <p>Carregando orçamento...</p>
            </div>
          ) : showBudgetForm ? (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Adicionar Receita/Despesa</h2>
                <button 
                  onClick={handleCloseBudgetForm}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancelar
                </button>
              </div>
              
              <div className="card">
                <BudgetForm 
                  onSubmit={handleAddBudgetEntry}
                  onCancel={handleCloseBudgetForm}
                  buttonText="Adicionar ao Orçamento"
                />
              </div>
            </div>
          ) : (
            <BudgetSummary 
              budgetEntries={budgetEntries}
              billsTotalAmount={totalAmount}
              billsTotalPaid={totalPaidAmount}
              month={month}
              year={year}
              onAddEntry={handleShowBudgetForm}
            />
          )}
        </SimpleTabsContent>
      </SimpleTabs>
    </div>
  );
} 