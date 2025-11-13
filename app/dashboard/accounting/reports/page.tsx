'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface FinancialData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  invoiceCount: number;
  expenseCount: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FinancialData>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    invoiceCount: 0,
    expenseCount: 0,
  });
  const [period, setPeriod] = useState<'all' | 'month' | 'year'>('all');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadFinancialData();
    }
  }, [period, loading]);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      if (!user || user.email !== 'mrtandempilot@gmail.com') {
        router.push('/login');
        return;
      }
      await loadFinancialData();
      setLoading(false);
    } catch (error) {
      router.push('/login');
    }
  };

  const loadFinancialData = async () => {
    try {
      // Get invoices (revenue)
      let invoicesQuery = supabase
        .from('invoices')
        .select('total_amount, status, issue_date')
        .eq('status', 'paid');

      // Get expenses
      let expensesQuery = supabase
        .from('expenses')
        .select('amount, expense_date');

      // Apply date filters
      const now = new Date();
      if (period === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        invoicesQuery = invoicesQuery.gte('issue_date', startOfMonth);
        expensesQuery = expensesQuery.gte('expense_date', startOfMonth);
      } else if (period === 'year') {
        const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
        invoicesQuery = invoicesQuery.gte('issue_date', startOfYear);
        expensesQuery = expensesQuery.gte('expense_date', startOfYear);
      }

      const [invoicesResult, expensesResult] = await Promise.all([
        invoicesQuery,
        expensesQuery
      ]);

      const totalRevenue = (invoicesResult.data || []).reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const totalExpenses = (expensesResult.data || []).reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      setData({
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        invoiceCount: invoicesResult.data?.length || 0,
        expenseCount: expensesResult.data?.length || 0,
      });
    } catch (error) {
      console.error('Error loading financial data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Financial Reports</h1>
            <p className="mt-2 text-gray-400">Profit & Loss Analysis</p>
          </div>

          {/* Period Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('all')}
              className={`px-4 py-2 rounded-lg transition ${
                period === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-4 py-2 rounded-lg transition ${
                period === 'year' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              This Year
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-lg transition ${
                period === 'month' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* P&L Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg shadow-lg p-6 border border-green-800/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-400">Total Revenue</p>
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">${data.totalRevenue.toFixed(2)}</p>
            <p className="mt-1 text-sm text-green-400">{data.invoiceCount} paid invoices</p>
          </div>

          <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-lg shadow-lg p-6 border border-red-800/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-400">Total Expenses</p>
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">${data.totalExpenses.toFixed(2)}</p>
            <p className="mt-1 text-sm text-red-400">{data.expenseCount} expenses</p>
          </div>

          <div className={`bg-gradient-to-r ${
            data.netProfit >= 0 
              ? 'from-blue-900/30 to-cyan-900/30 border-blue-800/50' 
              : 'from-red-900/30 to-pink-900/30 border-red-800/50'
          } rounded-lg shadow-lg p-6 border`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-400">Net Profit/Loss</p>
              <svg className={`w-5 h-5 ${data.netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className={`text-3xl font-bold ${data.netProfit >= 0 ? 'text-white' : 'text-red-400'}`}>
              ${Math.abs(data.netProfit).toFixed(2)}
            </p>
            <p className={`mt-1 text-sm ${data.netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {data.netProfit >= 0 ? 'Profit' : 'Loss'}
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-400">Profit Margin</p>
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{data.profitMargin.toFixed(1)}%</p>
            <p className="mt-1 text-sm text-gray-500">Performance metric</p>
          </div>
        </div>

        {/* Detailed P&L Statement */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Profit & Loss Statement</h2>
          
          <div className="space-y-4">
            {/* Revenue Section */}
            <div>
              <div className="flex justify-between items-center py-3 border-b border-gray-700">
                <span className="text-lg font-semibold text-green-400">Revenue</span>
                <span className="text-lg font-bold text-white">${data.totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 pl-6 text-gray-400">
                <span>Paid Invoices ({data.invoiceCount})</span>
                <span>${data.totalRevenue.toFixed(2)}</span>
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <div className="flex justify-between items-center py-3 border-b border-gray-700">
                <span className="text-lg font-semibold text-red-400">Expenses</span>
                <span className="text-lg font-bold text-white">${data.totalExpenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 pl-6 text-gray-400">
                <span>Total Expenses ({data.expenseCount})</span>
                <span>${data.totalExpenses.toFixed(2)}</span>
              </div>
            </div>

            {/* Net Profit */}
            <div className={`flex justify-between items-center py-4 border-t-2 ${
              data.netProfit >= 0 ? 'border-green-600' : 'border-red-600'
            }`}>
              <span className="text-xl font-bold text-white">
                Net {data.netProfit >= 0 ? 'Profit' : 'Loss'}
              </span>
              <span className={`text-xl font-bold ${
                data.netProfit >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${Math.abs(data.netProfit).toFixed(2)}
              </span>
            </div>

            {/* Performance Metrics */}
            <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-gray-700">
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Gross Profit Margin</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">{data.profitMargin.toFixed(1)}%</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Expense Ratio</p>
                <p className="text-2xl font-bold text-orange-400 mt-1">
                  {data.totalRevenue > 0 ? ((data.totalExpenses / data.totalRevenue) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Financial Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">💰 Revenue Status</p>
              <p className="text-white">
                {data.totalRevenue === 0 
                  ? 'No revenue recorded yet. Create and mark invoices as paid.'
                  : `You've generated $${data.totalRevenue.toFixed(2)} in revenue.`}
              </p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">📊 Expense Control</p>
              <p className="text-white">
                {data.totalExpenses === 0
                  ? 'No expenses tracked yet. Add expenses to monitor costs.'
                  : data.totalRevenue > 0 && (data.totalExpenses / data.totalRevenue) > 0.7
                  ? 'High expense ratio. Consider cost optimization.'
                  : 'Expenses are well managed.'}
              </p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">🎯 Profitability</p>
              <p className="text-white">
                {data.netProfit > 0
                  ? `Business is profitable with ${data.profitMargin.toFixed(1)}% margin.`
                  : data.netProfit < 0
                  ? 'Operating at a loss. Review expenses and revenue.'
                  : 'Break-even point. Focus on growth.'}
              </p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">📈 Period Analysis</p>
              <p className="text-white">
                {period === 'all' ? 'Viewing all-time statistics' : 
                 period === 'year' ? 'Viewing current year performance' :
                 'Viewing current month performance'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
