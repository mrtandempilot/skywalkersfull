'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface Booking {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  tour_name: string;
  booking_date: string;
  adults: number;
  children: number;
  total_amount: number;
  status: string;
  created_at: string;
  hotel_name?: string;
  notes?: string;
}

interface Customer {
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null);
  const [customersData, setCustomersData] = useState<Map<string, Customer>>(new Map());

  useEffect(() => {
    checkAuthAndLoadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [statusFilter, bookings]);

  const checkAuthAndLoadBookings = async () => {
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

      await loadBookings();
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  };

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false});

      if (error) throw error;
      
      setBookings(data || []);
      setFilteredBookings(data || []);

      // Load customer data
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('*');

      if (!customerError && customers) {
        const customerMap = new Map<string, Customer>();
        customers.forEach(customer => {
          customerMap.set(customer.email, {
            email: customer.email,
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
            country: customer.country
          });
        });
        setCustomersData(customerMap);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      // Reload bookings to reflect the change
      await loadBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
    }
  };

  const filterBookings = () => {
    if (statusFilter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.status === statusFilter));
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Bookings Management</h1>
          <p className="mt-2 text-gray-400">View and manage all tour bookings</p>
        </div>

        {/* Status Filter Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <button
            onClick={() => setStatusFilter('all')}
            className={`p-4 rounded-lg border transition ${
              statusFilter === 'all'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className="text-2xl font-bold">{statusCounts.all}</div>
            <div className="text-sm mt-1">All Bookings</div>
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={`p-4 rounded-lg border transition ${
              statusFilter === 'pending'
                ? 'bg-yellow-600 border-yellow-600 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className="text-2xl font-bold">{statusCounts.pending}</div>
            <div className="text-sm mt-1">Pending</div>
          </button>

          <button
            onClick={() => setStatusFilter('confirmed')}
            className={`p-4 rounded-lg border transition ${
              statusFilter === 'confirmed'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className="text-2xl font-bold">{statusCounts.confirmed}</div>
            <div className="text-sm mt-1">Confirmed</div>
          </button>

          <button
            onClick={() => setStatusFilter('completed')}
            className={`p-4 rounded-lg border transition ${
              statusFilter === 'completed'
                ? 'bg-green-600 border-green-600 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className="text-2xl font-bold">{statusCounts.completed}</div>
            <div className="text-sm mt-1">Completed</div>
          </button>

          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`p-4 rounded-lg border transition ${
              statusFilter === 'cancelled'
                ? 'bg-red-600 border-red-600 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className="text-2xl font-bold">{statusCounts.cancelled}</div>
            <div className="text-sm mt-1">Cancelled</div>
          </button>
        </div>

        {/* Bookings Table */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tour Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    People
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => {
                    const customerData = customersData.get(booking.customer_email);
                    const isExpanded = expandedBooking === booking.id;
                    
                    return (
                      <React.Fragment key={booking.id}>
                        <tr className="hover:bg-gray-700 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-start gap-2">
                              <button
                                onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                                className="text-gray-400 hover:text-white mt-1"
                              >
                                <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                              <div>
                                <div className="text-sm font-medium text-white">{booking.customer_name}</div>
                                <div className="text-sm text-gray-400">{booking.customer_email}</div>
                                {booking.customer_phone && (
                                  <div className="text-sm text-gray-400">{booking.customer_phone}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">{booking.tour_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">
                              {new Date(booking.booking_date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">
                              {booking.adults} {booking.adults === 1 ? 'adult' : 'adults'}
                              {booking.children > 0 && (
                                <span className="text-gray-400"> + {booking.children} {booking.children === 1 ? 'child' : 'children'}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-white">${booking.total_amount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={booking.status}
                              onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                        {isExpanded && customerData && (
                          <tr className="bg-gray-750">
                            <td colSpan={8} className="px-6 py-4">
                              <div className="bg-gray-900 rounded-lg p-4">
                                <h4 className="text-white font-semibold mb-3">Customer Details</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-400">Address:</span>
                                    <p className="text-white">{customerData.address || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">City:</span>
                                    <p className="text-white">{customerData.city || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Country:</span>
                                    <p className="text-white">{customerData.country || 'Not provided'}</p>
                                  </div>
                                  {booking.hotel_name && (
                                    <div>
                                      <span className="text-gray-400">Hotel:</span>
                                      <p className="text-white">{booking.hotel_name}</p>
                                    </div>
                                  )}
                                </div>
                                {booking.notes && (
                                  <div className="mt-3 pt-3 border-t border-gray-700">
                                    <span className="text-gray-400">Notes:</span>
                                    <p className="text-white mt-1">{booking.notes}</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
