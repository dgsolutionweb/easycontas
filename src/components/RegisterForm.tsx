import { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, AlertCircle } from 'lucide-react';

type RegisterFormProps = {
  onSuccess: () => void;
  onLoginClick: () => void;
};

export function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Verificações de senha em tempo real
  const passwordHasMinLength = password.length >= 6;
  const passwordHasNumber = /\d/.test(password);
  const passwordHasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword && password !== '';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    
    if (!fullName || !email || !password || !confirmPassword) {
      setRegisterError('Preencha todos os campos');
      toast.error('Preencha todos os campos');
      return;
    }
    
    if (password !== confirmPassword) {
      setRegisterError('As senhas não coincidem');
      toast.error('As senhas não coincidem');
      return;
    }
    
    if (password.length < 6) {
      setRegisterError('A senha deve ter pelo menos 6 caracteres');
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Cadastrar usuário diretamente com Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      
      if (error) throw error;
      
      if (data?.user) {
        toast.success('Conta criada com sucesso! Verifique seu email para confirmar o cadastro.');
        onSuccess();
      } else {
        setRegisterError('Erro ao criar conta');
      }
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      
      if (error.message.includes('already registered')) {
        setRegisterError('Este email já está cadastrado');
        toast.error('Este email já está cadastrado');
      } else {
        setRegisterError(error.message || 'Falha ao criar conta');
        toast.error('Falha ao criar conta');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto rounded-2xl shadow-lg bg-white p-8 border border-indigo-100 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold mb-2 text-center text-indigo-800">Crie sua conta</h2>
      <p className="text-gray-500 text-center mb-6">Cadastre-se para gerenciar suas contas</p>
      
      {registerError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md text-red-700 text-sm animate-fadeIn">
          <p className="font-medium">Erro ao criar conta</p>
          <p>{registerError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="group">
          <label htmlFor="fullName" className="block mb-2 font-medium text-gray-700 group-focus-within:text-indigo-600 transition-colors">
            Nome Completo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <User size={18} />
            </div>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all"
              placeholder="Seu nome completo"
              required
              disabled={isLoading}
            />
          </div>
        </div>
        
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
              placeholder="Crie uma senha forte"
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
          
          {password && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className={`flex items-center text-sm ${passwordHasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordHasMinLength ? <CheckCircle size={14} className="mr-1" /> : <AlertCircle size={14} className="mr-1" />}
                Mínimo 6 caracteres
              </div>
              <div className={`flex items-center text-sm ${passwordHasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordHasNumber ? <CheckCircle size={14} className="mr-1" /> : <AlertCircle size={14} className="mr-1" />}
                Inclui números
              </div>
              <div className={`flex items-center text-sm ${passwordHasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordHasSpecial ? <CheckCircle size={14} className="mr-1" /> : <AlertCircle size={14} className="mr-1" />}
                Caractere especial
              </div>
            </div>
          )}
        </div>
        
        <div className="group">
          <label htmlFor="confirmPassword" className="block mb-2 font-medium text-gray-700 group-focus-within:text-indigo-600 transition-colors">
            Confirmar Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`input w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all ${
                confirmPassword 
                  ? (passwordsMatch ? 'border-green-500' : 'border-red-500')
                  : 'border-gray-300'
              }`}
              placeholder="Confirme sua senha"
              required
              disabled={isLoading}
            />
            <button 
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-indigo-600"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            
            {confirmPassword && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                {passwordsMatch ? 
                  <CheckCircle size={18} className="text-green-500" /> : 
                  <AlertCircle size={18} className="text-red-500" />
                }
              </div>
            )}
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="mt-1 text-sm text-red-600">As senhas não coincidem</p>
          )}
        </div>
        
        <div className="flex items-center mt-4">
          <input
            id="terms"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            required
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            Concordo com os <a href="#" className="text-indigo-600 hover:underline">Termos de Uso</a> e <a href="#" className="text-indigo-600 hover:underline">Política de Privacidade</a>
          </label>
        </div>
        
        <button 
          type="submit" 
          className="w-full flex justify-center items-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Criando conta...</span>
            </div>
          ) : 'Cadastrar'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Já tem uma conta?{' '}
          <button
            onClick={onLoginClick}
            className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
            disabled={isLoading}
          >
            Faça login aqui
          </button>
        </p>
      </div>
    </div>
  );
} 