import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Essas variáveis de ambiente devem ser configuradas corretamente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Configurar o cliente Supabase com persistência de sessão
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Persistir sessão no localStorage
    autoRefreshToken: true, // Atualizar token automaticamente
    storageKey: 'gestor-contas-auth-storage' // Chave personalizada para o localStorage
  }
});

export type Bill = {
  id: string;
  description: string;
  base_description?: string;
  amount: number;
  due_date: string;
  paid: boolean;
  split: boolean;
  created_at: string;
  bill_type: 'fixed' | 'variable';
  is_installment: boolean;
  installment_number: number | null;
  total_installments: number | null;
  user_id: string | null;
}

export type Budget = {
  id: string;
  amount: number;
  month: number;
  year: number;
  description: string | null;
  type: 'income' | 'expense' | 'adjustment';
  created_at: string;
  user_id: string | null;
}

// Interface para usuário autenticado
export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

// Função para obter o usuário atual
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // Verificar a sessão atual no cliente
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erro ao obter sessão:', error);
      return null;
    }
    
    if (!session) {
      console.log('Nenhuma sessão encontrada');
      return null;
    }
    
    // Verificar se o usuário está disponível
    return session.user as AuthUser;
  } catch (error) {
    console.error('Erro ao verificar usuário atual:', error);
    return null;
  }
}

// Função para login com email e senha
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
}

// Função para cadastro de novo usuário
export async function signUp(email: string, password: string, fullName: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    throw error;
  }
}

// Função para logout
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
}

// Função para obter o mês e ano atual
export function getCurrentMonthYear() {
  const date = new Date();
  return {
    month: date.getMonth() + 1, // JavaScript usa meses 0-11
    year: date.getFullYear()
  };
}

// Função para formatar mês/ano
export function formatMonthYear(month: number, year: number) {
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
} 