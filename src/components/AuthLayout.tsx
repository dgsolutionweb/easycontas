import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase, signOut, AuthUser } from '../lib/supabase';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import logoImg from '../assets/logo.png';

type AuthLayoutProps = {
  children: React.ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Verificar usuário ao carregar a página
  useEffect(() => {
    // Função para verificar a sessão atual
    const checkSession = async () => {
      setIsLoading(true);
      setAuthError(null);
      
      try {
        console.log("AuthLayout: Verificando sessão atual...");
        // Verificar sessão atual
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data.session) {
          console.log("AuthLayout: Sessão encontrada:", data.session.user.id);
          setUser(data.session.user as AuthUser);
        } else {
          console.log("AuthLayout: Nenhuma sessão encontrada");
          setUser(null);
        }
      } catch (error) {
        console.error('AuthLayout: Erro ao verificar sessão:', error);
        setAuthError('Falha ao verificar autenticação. Tente novamente.');
      } finally {
        // Pequeno atraso para garantir que o state seja atualizado
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
      }
    };
    
    // Verificar sessão imediatamente
    checkSession();
    
    // Adicionar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthLayout: Estado de autenticação alterado:", event);
        
        setIsLoading(true);
        if (session) {
          console.log("AuthLayout: Usuário autenticado:", session.user.id);
          // Atualizar o estado com o usuário da sessão
          setUser(session.user as AuthUser);
        } else {
          console.log("AuthLayout: Usuário desconectado");
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Limpeza do listener ao desmontar o componente
    return () => {
      console.log("AuthLayout: Removendo listener de autenticação");
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      setUser(null);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Falha ao fazer logout');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Exibir estado de carregamento
  if (isLoading) {
    console.log("AuthLayout: Exibindo estado de carregamento");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <img src={logoImg} alt="Logo EasyContas" className="h-20 mx-auto mb-4" />
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Carregando...</p>
          {authError && (
            <p className="mt-2 text-sm text-red-600">{authError}</p>
          )}
        </div>
      </div>
    );
  }

  // Exibir formulários de login/registro
  if (!user) {
    console.log("AuthLayout: Exibindo formulários de login/registro");
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <img src={logoImg} alt="Logo EasyContas" className="h-24 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-primary">EasyContas</h1>
            <p className="text-gray-600 mt-2">Gerencie suas contas de forma simples e eficiente</p>
          </div>
          
          {authView === 'login' ? (
            <LoginForm 
              onSuccess={() => {
                console.log("Login success callback");
                // Não precisamos mais verificar o usuário manualmente
                // A verificação será feita pelo listener onAuthStateChange
              }} 
              onRegisterClick={() => setAuthView('register')} 
            />
          ) : (
            <RegisterForm 
              onSuccess={() => setAuthView('login')}
              onLoginClick={() => setAuthView('login')}
            />
          )}
        </div>
      </div>
    );
  }

  // Exibir aplicação principal
  console.log("AuthLayout: Renderizando aplicação principal com usuário:", user?.id);
  return (
    <div>
      <div className="bg-primary text-white px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <img src={logoImg} alt="Logo" className="h-8 mr-2" />
          <h1 className="font-bold text-xl">EasyContas</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm">
            {user.user_metadata?.full_name || user.email}
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 text-sm bg-white/20 rounded hover:bg-white/30 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
      
      {children}
    </div>
  );
} 