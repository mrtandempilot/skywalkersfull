'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';

export default function AccountingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      if (user.email !== 'mrtandempilot@gmail.com') {
        router.push('/');
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading accounting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Accounting & Finance</h1>
          <p className="mt-2 text-gray-400">Manage your income, expenses, invoices, and financial reports</p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href="/dashboard/accounting/expenses"
            className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 hover:border-blue-600 transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Expenses</p>
                <p className="mt-2 text-2xl font-bold text-white">Track</p>
              </div>
              <div className="p-3 bg-red-900/30 rounded-lg group-hover:bg-red-900/50 transition">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">Manage business expenses</p>
          </Link>

          <Link
            href="/dashboard/accounting/invoices"
            className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 hover:border-blue-600 transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Invoices</p>
                <p className="mt-2 text-2xl font-bold text-white">Create</p>
              </div>
              <div className="p-3 bg-blue-900/30 rounded-lg group-hover:bg-blue-900/50 transition">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">Generate & send invoices</p>
          </Link>

          <Link
            href="/dashboard/accounting/payments"
            className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 hover:border-blue-600 transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Payments</p>
                <p className="mt-2 text-2xl font-bold text-white">Record</p>
              </div>
              <div className="p-3 bg-green-900/30 rounded-lg group-hover:bg-green-900/50 transition">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">Track income & payments</p>
          </Link>

          <Link
            href="/dashboard/accounting/reports"
            className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 hover:border-blue-600 transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Reports</p>
                <p className="mt-2 text-2xl font-bold text-white">Analyze</p>
              </div>
              <div className="p-3 bg-purple-900/30 rounded-lg group-hover:bg-purple-900/50 transition">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">Financial reports & P/L</p>
          </Link>
        </div>

        {/* Coming Soon Message */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900/30 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Full Accounting System</h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Complete accounting features are being built including expense tracking, invoice generation, 
            payment management, tax calculations (KDV/VAT), and comprehensive financial reports.
          </p>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-left">
              <p className="text-sm font-semibold text-blue-400">✓ Income Tracking</p>
              <p className="text-xs text-gray-500 mt-1">From bookings</p>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-blue-400">✓ Expense Tracking</p>
              <p className="text-xs text-gray-500 mt-1">All categories</p>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-blue-400">✓ Invoices</p>
              <p className="text-xs text-gray-500 mt-1">PDF generation</p>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-blue-400">✓ Tax Reports</p>
              <p className="text-xs text-gray-500 mt-1">KDV/VAT ready</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
