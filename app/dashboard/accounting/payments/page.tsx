'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default function PaymentsPage() {
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
          <h1 className="text-3xl font-bold text-white">Payments</h1>
          <p className="mt-2 text-gray-400">Record and track income & payments</p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-xl font-bold text-white mb-2">Payment Tracking</h3>
          <p className="text-gray-400 max-w-2xl mx-auto mb-4">
            Track all income from completed tours, record payment methods (cash, card, transfer), and link payments to bookings and invoices.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-6 text-left">
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-green-400">✓ Cash payments</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-green-400">✓ Card payments</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-green-400">✓ Bank transfers</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-green-400">✓ Payment history</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
