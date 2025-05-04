-- Criação da tabela de contas
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  due_date DATE NOT NULL,
  paid BOOLEAN DEFAULT false,
  split BOOLEAN DEFAULT false,
  bill_type TEXT DEFAULT 'variable' CHECK (bill_type IN ('fixed', 'variable')),
  is_installment BOOLEAN DEFAULT false,
  installment_number INTEGER,
  total_installments INTEGER,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentários nas colunas
COMMENT ON TABLE public.bills IS 'Tabela para armazenar as contas';
COMMENT ON COLUMN public.bills.id IS 'ID único da conta';
COMMENT ON COLUMN public.bills.description IS 'Descrição da conta';
COMMENT ON COLUMN public.bills.amount IS 'Valor da conta';
COMMENT ON COLUMN public.bills.due_date IS 'Data de vencimento';
COMMENT ON COLUMN public.bills.paid IS 'Indica se a conta foi paga';
COMMENT ON COLUMN public.bills.split IS 'Indica se a conta deve ser dividida em 2';
COMMENT ON COLUMN public.bills.bill_type IS 'Tipo de conta (fixa ou variável)';
COMMENT ON COLUMN public.bills.is_installment IS 'Indica se é uma compra parcelada';
COMMENT ON COLUMN public.bills.installment_number IS 'Número da parcela atual';
COMMENT ON COLUMN public.bills.total_installments IS 'Número total de parcelas';
COMMENT ON COLUMN public.bills.user_id IS 'ID do usuário proprietário';
COMMENT ON COLUMN public.bills.created_at IS 'Data de criação do registro';

-- Criação da tabela de orçamento
CREATE TABLE IF NOT EXISTS public.budget (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC(10, 2) NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'adjustment')),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentários nas colunas
COMMENT ON TABLE public.budget IS 'Tabela para armazenar o orçamento';
COMMENT ON COLUMN public.budget.id IS 'ID único do registro';
COMMENT ON COLUMN public.budget.amount IS 'Valor do registro';
COMMENT ON COLUMN public.budget.month IS 'Mês do registro (1-12)';
COMMENT ON COLUMN public.budget.year IS 'Ano do registro';
COMMENT ON COLUMN public.budget.description IS 'Descrição do registro';
COMMENT ON COLUMN public.budget.type IS 'Tipo do registro (receita, despesa ou ajuste)';
COMMENT ON COLUMN public.budget.user_id IS 'ID do usuário proprietário';
COMMENT ON COLUMN public.budget.created_at IS 'Data de criação do registro';

-- Políticas de segurança RLS (Row Level Security)
-- Ativar RLS para as tabelas
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que podem estar causando conflitos
DROP POLICY IF EXISTS "Allow SELECT for authenticated users" ON public.bills;
DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON public.bills;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON public.bills;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users" ON public.bills;
DROP POLICY IF EXISTS "Allow anon access for demo" ON public.bills;

-- Políticas para a tabela bills
-- Permitir SELECT apenas para o proprietário dos registros
CREATE POLICY "Users can view own bills" 
  ON public.bills 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Permitir INSERT para o próprio usuário
CREATE POLICY "Users can insert own bills" 
  ON public.bills 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Permitir UPDATE apenas para o proprietário dos registros
CREATE POLICY "Users can update own bills" 
  ON public.bills 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Permitir DELETE apenas para o proprietário dos registros
CREATE POLICY "Users can delete own bills" 
  ON public.bills 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para a tabela budget
-- Permitir SELECT apenas para o proprietário dos registros
CREATE POLICY "Users can view own budget" 
  ON public.budget 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Permitir INSERT para o próprio usuário
CREATE POLICY "Users can insert own budget" 
  ON public.budget 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Permitir UPDATE apenas para o proprietário dos registros
CREATE POLICY "Users can update own budget" 
  ON public.budget 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Permitir DELETE apenas para o proprietário dos registros
CREATE POLICY "Users can delete own budget" 
  ON public.budget 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Dados de exemplo
INSERT INTO public.bills (description, amount, due_date, paid, split)
VALUES 
  ('Aluguel', 1500.00, (CURRENT_DATE + INTERVAL '5 days'), false, true),
  ('Energia Elétrica', 250.00, (CURRENT_DATE + INTERVAL '10 days'), false, true),
  ('Internet', 120.00, (CURRENT_DATE - INTERVAL '2 days'), true, false),
  ('Água', 80.00, (CURRENT_DATE + INTERVAL '15 days'), false, true),
  ('Streaming', 45.99, (CURRENT_DATE - INTERVAL '5 days'), false, false); 