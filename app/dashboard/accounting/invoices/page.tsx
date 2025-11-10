'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default function InvoicesPage() {
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
          <h1 className="text-3xl font-bold text-white">Invoices</h1>
          <p className="mt-2 text-gray-400">Create and manage customer invoices</p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-bold text-white mb-2">Invoice Management</h3>
          <p className="text-gray-400 max-w-2xl mx-auto mb-4">
            This page will allow you to create professional invoices with tax calculations, send them to customers, and track payment status.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-6 text-left">
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-blue-400">✓ Auto-fill from bookings</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-blue-400">✓ KDV/VAT calculation</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-blue-400">✓ PDF export</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-blue-400">✓ Payment tracking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
