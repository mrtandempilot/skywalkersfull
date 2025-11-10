'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDashboardStats, getBookingPipeline } from '@/lib/crm';
import type { DashboardStats, BookingPipeline } from '@/types/crm';

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pipeline, setPipeline] = useState<BookingPipeline | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getCurrentUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        // Check if user is admin
        if (user.email !== 'mrtandempilot@gmail.com') {
          router.push('/');
          return;
        }

        const [dashboardStats, bookingPipeline] = await Promise.all([
          getDashboardStats(),
          getBookingPipeline()
        ]);

        setStats(dashboardStats);
        setPipeline(bookingPipeline);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading || !stats || !pipeline) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="mt-2 text-gray-600">Comprehensive business insights and metrics</p>
        </div>

        {/* Revenue Analytics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-2">Total Revenue</div>
              <div className="text-3xl font-bold text-blue-600">${stats.totalRevenue.toLocaleString()}</div>
              <div className={`mt-2 text-sm ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.revenueGrowth).toFixed(1)}% vs last month
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-2">This Month</div>
              <div className="text-3xl font-bold text-green-600">${stats.monthRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-2">{stats.monthBookings} bookings</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-2">This Week</div>
              <div className="text-3xl font-bold text-purple-600">${stats.weekRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-2">{stats.weekBookings} bookings</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-2">Today</div>
              <div className="text-3xl font-bold text-orange-600">${stats.todayRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-2">{stats.todayBookings} bookings</div>
            </div>
          </div>
        </div>

        {/* Booking Analytics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Performance</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Pipeline</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Pending</span>
                    <span className="text-sm font-semibold text-gray-900">{pipeline.pending}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-yellow-400 h-3 rounded-full" 
                      style={{ width: `${stats.totalBookings > 0 ? (pipeline.pending / stats.totalBookings) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Confirmed</span>
                    <span className="text-sm font-semibold text-gray-900">{pipeline.confirmed}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full" 
                      style={{ width: `${stats.totalBookings > 0 ? (pipeline.confirmed / stats.totalBookings) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Completed</span>
                    <span className="text-sm font-semibold text-gray-900">{pipeline.completed}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full" 
                      style={{ width: `${stats.totalBookings > 0 ? (pipeline.completed / stats.totalBookings) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Cancelled</span>
                    <span className="text-sm font-semibold text-gray-900">{pipeline.cancelled}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full" 
                      style={{ width: `${stats.totalBookings > 0 ? (pipeline.cancelled / stats.totalBookings) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Booking Value</span>
                  <span className="text-lg font-bold text-gray-900">${stats.averageBookingValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Bookings</span>
                  <span className="text-lg font-bold text-gray-900">{stats.totalBookings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Booking Growth</span>
                  <span className={`text-lg font-bold ${stats.bookingGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.bookingGrowth >= 0 ? '+' : ''}{stats.bookingGrowth.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="text-lg font-bold text-gray-900">
                    {stats.totalBookings > 0 ? ((pipeline.completed / stats.totalBookings) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Analytics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-2">Total Customers</div>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</div>
                  <div className={`mt-2 text-sm ${stats.customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.customerGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.customerGrowth).toFixed(1)}% growth
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-2">Active Customers</div>
                  <div className="text-3xl font-bold text-gray-900">{stats.activeCustomers}</div>
                  <div className="mt-2 text-sm text-gray-500">
                    {stats.totalCustomers > 0 ? ((stats.activeCustomers / stats.totalCustomers) * 100).toFixed(0) : 0}% of total
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-2">VIP Customers</div>
                  <div className="text-3xl font-bold text-gray-900">{stats.vipCustomers}</div>
                  <div className="mt-2 text-sm text-gray-500">
                    {stats.totalCustomers > 0 ? ((stats.vipCustomers / stats.totalCustomers) * 100).toFixed(0) : 0}% of total
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operations Analytics */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-2">Active Pilots</div>
              <div className="text-3xl font-bold text-indigo-600">{stats.activePilots}</div>
              <div className="text-sm text-gray-500 mt-2">Managing operations</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-2">Total Flights</div>
              <div className="text-3xl font-bold text-blue-600">{stats.totalFlights}</div>
              <div className="text-sm text-gray-500 mt-2">Across all pilots</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-2">Average Rating</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)} ⭐</div>
              <div className="text-sm text-gray-500 mt-2">{stats.pendingReviews} pending reviews</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
