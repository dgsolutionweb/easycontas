export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bills: {
        Row: {
          id: string
          description: string
          amount: number
          due_date: string
          paid: boolean
          split: boolean
          created_at: string
          bill_type: 'fixed' | 'variable'
          is_installment: boolean
          installment_number: number | null
          total_installments: number | null
          user_id: string | null
        }
        Insert: {
          id?: string
          description: string
          amount: number
          due_date: string
          paid?: boolean
          split?: boolean
          created_at?: string
          bill_type?: 'fixed' | 'variable'
          is_installment?: boolean
          installment_number?: number | null
          total_installments?: number | null
          user_id?: string | null
        }
        Update: {
          id?: string
          description?: string
          amount?: number
          due_date?: string
          paid?: boolean
          split?: boolean
          created_at?: string
          bill_type?: 'fixed' | 'variable'
          is_installment?: boolean
          installment_number?: number | null
          total_installments?: number | null
          user_id?: string | null
        }
      }
      budget: {
        Row: {
          id: string
          amount: number
          month: number
          year: number
          description: string | null
          type: 'income' | 'expense' | 'adjustment'
          created_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          amount: number
          month: number
          year: number
          description?: string | null
          type: 'income' | 'expense' | 'adjustment'
          created_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          amount?: number
          month?: number
          year?: number
          description?: string | null
          type?: 'income' | 'expense' | 'adjustment'
          created_at?: string
          user_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 