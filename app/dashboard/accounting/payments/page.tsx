'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface Payment {
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  payment_method_detail: string;
  issue_date: string;
  status: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<'all' | 'cash' | 'card' | 'online'>('all');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      if (!user || user.email !== 'mrtandempilot@gmail.com') {
        router.push('/login');
        return;
      }
      await loadPayments();
      setLoading(false);
    } catch (error) {
      router.push('/login');
    }
  };

  const loadPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('invoice_number, customer_name, total_amount, payment_method_detail, issue_date, status')
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  // Always calculate total revenue from ALL paid invoices
  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.total_amount || 0), 0);

  const cashTotal = payments
    .filter(p => p.status === 'paid' && p.payment_method_detail?.toLowerCase() === 'cash')
    .reduce((sum, p) => sum + (p.total_amount || 0), 0);

  const cardTotal = payments
    .filter(p => p.status === 'paid' && p.payment_method_detail?.toLowerCase().includes('card'))
    .reduce((sum, p) => sum + (p.total_amount || 0), 0);

  const onlineTotal = payments
    .filter(p => p.status === 'paid' && p.payment_method_detail?.toLowerCase().includes('online'))
    .reduce((sum, p) => sum + (p.total_amount || 0), 0);

  // Filter for table display only
  const filteredPayments = payments.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'cash') return p.payment_method_detail?.toLowerCase() === 'cash';
    if (filter === 'card') return p.payment_method_detail?.toLowerCase().includes('card');
    if (filter === 'online') return p.payment_method_detail?.toLowerCase().includes('online');
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Payments & Income</h1>
          <p className="mt-2 text-gray-400">Track all incoming payments and revenue</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg shadow-lg p-6 border border-green-800/50">
            <p className="text-sm font-medium text-gray-400">Total Revenue</p>
            <p className="mt-2 text-3xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
            <p className="mt-1 text-sm text-green-400">All paid invoices</p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <p className="text-sm font-medium text-gray-400">Cash</p>
            <p className="mt-2 text-2xl font-bold text-white">${cashTotal.toFixed(2)}</p>
            <p className="mt-1 text-sm text-gray-500">Cash payments</p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <p className="text-sm font-medium text-gray-400">Card</p>
            <p className="mt-2 text-2xl font-bold text-white">${cardTotal.toFixed(2)}</p>
            <p className="mt-1 text-sm text-gray-500">Card payments</p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <p className="text-sm font-medium text-gray-400">Online</p>
            <p className="mt-2 text-2xl font-bold text-white">${onlineTotal.toFixed(2)}</p>
            <p className="mt-1 text-sm text-gray-500">Online payments</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All Payments
          </button>
          <button
            onClick={() => setFilter('cash')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'cash' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Cash
          </button>
          <button
            onClick={() => setFilter('card')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Card
          </button>
          <button
            onClick={() => setFilter('online')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'online' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Online
          </button>
        </div>

        {/* Payments Table */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <p className="text-lg font-semibold mb-2">No payments found</p>
                      <p className="text-sm">Create invoices and mark them as paid to track payments</p>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment, index) => (
                    <tr key={index} className="hover:bg-gray-700 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {new Date(payment.issue_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {payment.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {payment.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                        ${payment.total_amount?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 capitalize">
                        {payment.payment_method_detail || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          payment.status === 'paid' ? 'bg-green-900 text-green-300' :
                          payment.status === 'sent' ? 'bg-blue-900 text-blue-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
