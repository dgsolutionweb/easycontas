import { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

type LoginFormProps = {
  onSuccess: () => void;
  onRegisterClick: () => void;
};

export function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }
    
    console.log("LoginForm: Iniciando processo de login...");
    setIsLoading(true);
    
    try {
      // Fazer login diretamente com Supabase
      console.log("LoginForm: Tentando fazer login com Supabase...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("LoginForm: Erro retornado pelo Supabase:", error);
        throw error;
      }
      
      if (data?.user) {
        console.log("LoginForm: Login bem-sucedido, usuário:", data.user.id);
        toast.success('Login realizado com sucesso!');
        onSuccess();
      } else {
        console.error("LoginForm: Dados de usuário não encontrados na resposta");
        setLoginError('Erro desconhecido no login');
      }
    } catch (error: any) {
      console.error('LoginForm: Erro ao fazer login:', error);
      
      if (error.message.includes('Invalid login credentials')) {
        setLoginError('Email ou senha incorretos');
        toast.error('Email ou senha incorretos');
      } else if (error.message.includes('Email not confirmed')) {
        setLoginError('Por favor, confirme seu email antes de fazer login');
        toast.error('Por favor, confirme seu email antes de fazer login');
      } else {
        setLoginError(error.message || 'Falha ao fazer login');
        toast.error('Falha ao fazer login');
      }
    } finally {
      console.log("LoginForm: Finalizando processo de login");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto rounded-2xl shadow-lg bg-white p-8 border border-indigo-100 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold mb-2 text-center text-indigo-800">Bem-vindo de volta!</h2>
      <p className="text-gray-500 text-center mb-6">Entre com seus dados para acessar sua conta</p>
      
      {loginError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md text-red-700 text-sm animate-fadeIn">
          <p className="font-medium">Erro ao fazer login</p>
          <p>{loginError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="group">
          <label htmlFor="email" className="block mb-2 font-medium text-gray-700 group-focus-within:text-indigo-600 transition-colors">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all"
              placeholder="seu@email.com"
              required
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="group">
          <label htmlFor="password" className="block mb-2 font-medium text-gray-700 group-focus-within:text-indigo-600 transition-colors">
            Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all"
              placeholder="Sua senha"
              required
              disabled={isLoading}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-indigo-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Lembrar-me
            </label>
          </div>
          
          <div className="text-sm">
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              Esqueceu a senha?
            </a>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="w-full flex justify-center items-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Entrando...</span>
            </div>
          ) : 'Entrar'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Não tem uma conta?{' '}
          <button
            onClick={onRegisterClick}
            className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
            disabled={isLoading}
          >
            Cadastre-se agora
          </button>
        </p>
      </div>
    </div>
  );
} 