// Accounting System Types

export interface Invoice {
  id: string;
  invoice_number: string;
  booking_id?: string;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  customer_address?: string;
  
  issue_date: string;
  due_date: string;
  
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  
  notes?: string;
  payment_terms?: string;
  
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Payment {
  id: string;
  booking_id?: string;
  invoice_id?: string;
  customer_id?: string;
  
  amount: number;
  currency: string;
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'stripe' | 'other';
  
  payment_date: string;
  reference_number?: string;
  
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Expense {
  id: string;
  
  expense_date: string;
  category: 'fuel' | 'equipment' | 'maintenance' | 'insurance' | 'salaries' | 
            'marketing' | 'rent' | 'utilities' | 'supplies' | 'licenses' | 
            'training' | 'food_beverage' | 'transportation' | 'other';
  
  description: string;
  amount: number;
  currency: string;
  
  vendor?: string;
  receipt_number?: string;
  payment_method?: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'other';
  
  is_recurring: boolean;
  is_tax_deductible: boolean;
  
  notes?: string;
  tags?: string[];
  
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface TaxRecord {
  id: string;
  
  period_start: string;
  period_end: string;
  
  total_revenue: number;
  total_expenses: number;
  taxable_income: number;
  
  vat_collected: number;
  vat_paid: number;
  vat_payable: number;
  
  income_tax: number;
  
  status: 'draft' | 'filed' | 'paid';
  filed_date?: string;
  
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface AccountingStats {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  
  unpaidInvoices: number;
  unpaidAmount: number;
  overdueInvoices: number;
  
  expensesByCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  
  recentPayments: Payment[];
  recentExpenses: Expense[];
}
