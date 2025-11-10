'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    } catch (error) {
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Financial Reports</h1>
          <p className="mt-2 text-gray-400">Analyze your business performance</p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-xl font-bold text-white mb-2">Financial Analysis & Reports</h3>
          <p className="text-gray-400 max-w-2xl mx-auto mb-4">
            View comprehensive financial reports including profit/loss statements, revenue trends, expense breakdowns, and tax summaries with visual charts.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-6 text-left">
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-purple-400">✓ Profit & Loss</p>
              <p className="text-xs text-gray-500 mt-1">Monthly/Yearly</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-purple-400">✓ Revenue Trends</p>
              <p className="text-xs text-gray-500 mt-1">Charts & graphs</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-purple-400">✓ Expense Analysis</p>
              <p className="text-xs text-gray-500 mt-1">By category</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-purple-400">✓ Tax Summary</p>
              <p className="text-xs text-gray-500 mt-1">KDV/VAT reports</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-purple-400">✓ Cash Flow</p>
              <p className="text-xs text-gray-500 mt-1">Income vs expenses</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-purple-400">✓ Export PDF</p>
              <p className="text-xs text-gray-500 mt-1">Download reports</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
