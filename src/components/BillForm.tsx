import { useState, FormEvent, useEffect } from 'react';
import { Bill } from '../lib/supabase';
import { toast } from 'react-hot-toast';

type BillFormProps = {
  onSubmit: (bill: Omit<Bill, 'id' | 'created_at'>) => Promise<void>;
  initialData?: Partial<Bill>;
  buttonText?: string;
};

export function BillForm({ onSubmit, initialData = {}, buttonText = 'Salvar' }: BillFormProps) {
  const [description, setDescription] = useState(initialData.description || '');
  const [amount, setAmount] = useState(initialData.amount?.toString() || '');
  const [dueDate, setDueDate] = useState(initialData.due_date || '');
  const [paid, setPaid] = useState(initialData.paid || false);
  const [split, setSplit] = useState(initialData.split || false);
  const [billType, setBillType] = useState<'fixed' | 'variable'>(initialData.bill_type || 'variable');
  const [isInstallment, setIsInstallment] = useState(initialData.is_installment || false);
  const [installmentNumber, setInstallmentNumber] = useState(initialData.installment_number?.toString() || '1');
  const [totalInstallments, setTotalInstallments] = useState(initialData.total_installments?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resetar campos de parcelas quando o tipo da conta muda
  useEffect(() => {
    if (billType !== 'fixed') {
      setIsInstallment(false);
    }
  }, [billType]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount || !dueDate) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Validar parcelas
    if (isInstallment && billType === 'fixed') {
      if (!totalInstallments || parseInt(totalInstallments) < 2) {
        toast.error('O número total de parcelas deve ser pelo menos 2');
        return;
      }
      
      if (!installmentNumber || parseInt(installmentNumber) < 1 || parseInt(installmentNumber) > parseInt(totalInstallments)) {
        toast.error('O número da parcela deve estar entre 1 e o total de parcelas');
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        description,
        amount: parseFloat(amount),
        due_date: dueDate,
        paid,
        split,
        bill_type: billType,
        is_installment: isInstallment && billType === 'fixed',
        installment_number: isInstallment && billType === 'fixed' ? parseInt(installmentNumber) : null,
        total_installments: isInstallment && billType === 'fixed' ? parseInt(totalInstallments) : null,
        user_id: null // Será preenchido na função de manipulação
      });
      
      toast.success('Conta salva com sucesso!');
      
      // Limpar formulário se não for edição
      if (!initialData.id) {
        setDescription('');
        setAmount('');
        setDueDate('');
        setPaid(false);
        setSplit(false);
        setBillType('variable');
        setIsInstallment(false);
        setInstallmentNumber('1');
        setTotalInstallments('');
      }
    } catch (error) {
      toast.error('Erro ao salvar conta');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="description" className="block mb-1 font-medium">
          Descrição
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input w-full"
          placeholder="Conta de luz, Internet, etc."
          required
        />
      </div>
      
      <div>
        <label htmlFor="amount" className="block mb-1 font-medium">
          Valor (R$)
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input w-full"
          placeholder="0,00"
          required
        />
      </div>
      
      <div>
        <label htmlFor="dueDate" className="block mb-1 font-medium">
          Data de Vencimento
        </label>
        <input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="input w-full"
          required
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <input
            id="paid"
            type="checkbox"
            checked={paid}
            onChange={(e) => setPaid(e.target.checked)}
            className="mr-2 h-4 w-4"
          />
          <label htmlFor="paid">Pago</label>
        </div>
        
        <div className="flex items-center">
          <input
            id="split"
            type="checkbox"
            checked={split}
            onChange={(e) => setSplit(e.target.checked)}
            className="mr-2 h-4 w-4"
          />
          <label htmlFor="split">Dividir em 2</label>
        </div>
      </div>
      
      <div>
        <label className="block mb-1 font-medium">Tipo de Conta</label>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <input
              id="typeFixed"
              type="radio"
              checked={billType === 'fixed'}
              onChange={() => setBillType('fixed')}
              className="mr-2 h-4 w-4"
              name="billType"
            />
            <label htmlFor="typeFixed">Fixa (Recorrente)</label>
          </div>
          <div className="flex items-center">
            <input
              id="typeVariable"
              type="radio"
              checked={billType === 'variable'}
              onChange={() => setBillType('variable')}
              className="mr-2 h-4 w-4"
              name="billType"
            />
            <label htmlFor="typeVariable">Variável</label>
          </div>
        </div>
      </div>
      
      {billType === 'fixed' && (
        <div className="p-3 border rounded-md bg-gray-50">
          <div className="flex items-center mb-3">
            <input
              id="isInstallment"
              type="checkbox"
              checked={isInstallment}
              onChange={(e) => setIsInstallment(e.target.checked)}
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="isInstallment" className="font-medium">
              Esta é uma compra parcelada
            </label>
          </div>
          
          {isInstallment && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="installmentNumber" className="block mb-1 text-sm font-medium">
                  Parcela Atual
                </label>
                <input
                  id="installmentNumber"
                  type="number"
                  min="1"
                  value={installmentNumber}
                  onChange={(e) => setInstallmentNumber(e.target.value)}
                  className="input w-full"
                  required={isInstallment}
                />
              </div>
              
              <div>
                <label htmlFor="totalInstallments" className="block mb-1 text-sm font-medium">
                  Total de Parcelas
                </label>
                <input
                  id="totalInstallments"
                  type="number"
                  min="2"
                  value={totalInstallments}
                  onChange={(e) => setTotalInstallments(e.target.value)}
                  className="input w-full"
                  required={isInstallment}
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      <div>
        <button 
          type="submit" 
          className="btn btn-primary w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando...' : buttonText}
        </button>
      </div>
    </form>
  );
} 