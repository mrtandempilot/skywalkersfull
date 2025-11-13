'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface NotificationSettings {
  // Browser notifications
  browserNotifications: boolean;

  // Email notifications
  emailNotifications: boolean;
  emailAddress: string;

  // WhatsApp notifications
  whatsappNotifications: boolean;
  whatsappNumber: string;

  // SMS notifications
  smsNotifications: boolean;
  smsNumber: string;

  // Event triggers
  notifyOnBooking: boolean;
  notifyOnPayment: boolean;
  notifyOnCancellation: boolean;
  notifyOnReview: boolean;

  // Sound settings
  playSound: boolean;
  soundVolume: number;

  // Schedule settings
  quietHoursStart: string;
  quietHoursEnd: string;
  weekendNotifications: boolean;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    browserNotifications: true,
    emailNotifications: false,
    emailAddress: '',
    whatsappNotifications: false,
    whatsappNumber: '',
    smsNotifications: false,
    smsNumber: '',
    notifyOnBooking: true,
    notifyOnPayment: true,
    notifyOnCancellation: true,
    notifyOnReview: false,
    playSound: true,
    soundVolume: 50,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    weekendNotifications: true,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getCurrentUser();

        if (!user) {
          router.push('/login');
          return;
        }

        // Check if user is admin
        if (user.email !== 'mrtandempilot@gmail.com' && user.email !== 'faralyaworks@gmail.com') {
          router.push('/');
          return;
        }

        // Load saved settings (would come from database in real implementation)
        const savedSettings = localStorage.getItem('notification-settings');
        if (savedSettings) {
          setSettings({ ...settings, ...JSON.parse(savedSettings) });
        } else {
          // First time setup - enable notifications for admin
          if (user.email === 'mrtandempilot@gmail.com' || user.email === 'faralyaworks@gmail.com') {
            setSettings(prev => ({
              ...prev,
              browserNotifications: true,
              emailNotifications: true,
              notifyOnBooking: true,
              notifyOnPayment: true,
              notifyOnCancellation: true
            }));
          }
        }

        // Set default email to user's email
        if (user.email && !settings.emailAddress) {
          setSettings(prev => ({ ...prev, emailAddress: user.email! }));
        }

      } catch (error) {
        console.error('Error loading notifications page:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage (would be database in real implementation)
      localStorage.setItem('notification-settings', JSON.stringify(settings));
      alert('Notification settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const testNotification = async (type: string) => {
    const testData = {
      booking: {
        customer_name: 'Test Customer',
        tour_name: 'Test Tour',
        total_amount: 150,
        booking_date: new Date().toISOString(),
        customer_email: 'test@example.com',
        customer_phone: '+1234567890'
      },
      payment: {
        customer_name: 'John Doe',
        amount: 200,
        payment_method: 'Credit Card',
        booking_reference: 'BK-001'
      },
      cancellation: {
        customer_name: 'Jane Smith',
        tour_name: 'Paragliding',
        cancellation_reason: 'Customer request',
        refund_amount: 150
      },
      review: { customer_name: 'Bob Wilson', rating: 5, tour_name: 'Boat Tour' }
    };

    try {
      // Get auth token from the centralized Supabase client
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert('Please log in to test email notifications');
        return;
      }

      // Test email notification
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type,
          emailAddress: settings.emailAddress || 'test@example.com',
          test: false,
          data: testData[type as keyof typeof testData]
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} email sent successfully! Check your inbox.`);
      } else {
        alert(`❌ Failed to send ${type} email: ${result.message}`);
      }
    } catch (error) {
      console.error('Test notification error:', error);
      alert('Error testing notification. Check console for details.');
    }
  };

  const testEmailConfiguration = async () => {
    if (!settings.emailAddress) {
      alert('Please enter an email address first');
      return;
    }

    try {
      // Get auth token from the centralized Supabase client
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert('Please log in to test email configuration');
        return;
      }

      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          test: true,
          emailAddress: settings.emailAddress,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Email configuration test successful! Check your inbox for the test message.');
      } else {
        alert(`❌ Email configuration test failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Email test error:', error);
      alert('Error testing email configuration. Check console for details.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading notification settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Notification Settings</h1>
          <p className="mt-2 text-gray-400">Configure how and when you receive notifications</p>

          {/* Debug Info */}
          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-600 rounded-lg">
            <h3 className="text-blue-400 font-medium mb-2">Current Settings Status:</h3>
            <div className="text-sm text-blue-300 space-y-1">
              <p><strong>Email Notifications:</strong> {settings.emailNotifications ? '✅ Enabled' : '❌ Disabled'}</p>
              <p><strong>Email Address:</strong> {settings.emailAddress || 'Not set'}</p>
              <p><strong>Booking Notifications:</strong> {settings.notifyOnBooking ? '✅ Enabled' : '❌ Disabled'}</p>
              <p><strong>Browser Notifications:</strong> {settings.browserNotifications ? '✅ Enabled' : '❌ Disabled'}</p>
            </div>
            <button
              onClick={() => {
                console.log('📧 Current notification settings:', settings);
                alert(`Settings logged to console. Email enabled: ${settings.emailNotifications}, Address: ${settings.emailAddress}`);
              }}
              className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Debug Settings
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Browser Notifications */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Browser Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Enable Browser Notifications</label>
                  <p className="text-sm text-gray-500">Show pop-up notifications in your browser</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.browserNotifications}
                    onChange={(e) => setSettings({ ...settings, browserNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Enable Email Notifications</label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              {settings.emailNotifications && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={settings.emailAddress}
                    onChange={(e) => setSettings({ ...settings, emailAddress: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                    placeholder="your-email@example.com"
                  />
                </div>
              )}
              <button
                onClick={testEmailConfiguration}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
              >
                Test Email Configuration
              </button>
            </div>
          </div>

          {/* WhatsApp Notifications */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              WhatsApp Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Enable WhatsApp Notifications</label>
                  <p className="text-sm text-gray-500">Receive notifications via WhatsApp</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.whatsappNotifications}
                    onChange={(e) => setSettings({ ...settings, whatsappNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              {settings.whatsappNotifications && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                    placeholder="+1234567890"
                  />
                  <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +1 for US)</p>
                </div>
              )}
              <button
                onClick={() => testNotification('booking')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
              >
                Test WhatsApp Notification
              </button>
            </div>
          </div>

          {/* SMS Notifications */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              SMS Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Enable SMS Notifications</label>
                  <p className="text-sm text-gray-500">Receive notifications via text message</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {settings.smsNotifications && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">SMS Number</label>
                  <input
                    type="tel"
                    value={settings.smsNumber}
                    onChange={(e) => setSettings({ ...settings, smsNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="+1234567890"
                  />
                  <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +1 for US)</p>
                </div>
              )}
              <button
                onClick={() => testNotification('booking')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Test SMS Notification
              </button>
            </div>
          </div>

          {/* Event Triggers */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Notification Triggers
            </h2>
            <p className="text-sm text-gray-400 mb-4">Choose which events should trigger notifications</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">New Bookings</label>
                  <p className="text-xs text-gray-500">When someone books a tour</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyOnBooking}
                  onChange={(e) => setSettings({ ...settings, notifyOnBooking: e.target.checked })}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Payments</label>
                  <p className="text-xs text-gray-500">When payments are received</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyOnPayment}
                  onChange={(e) => setSettings({ ...settings, notifyOnPayment: e.target.checked })}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Cancellations</label>
                  <p className="text-xs text-gray-500">When bookings are cancelled</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyOnCancellation}
                  onChange={(e) => setSettings({ ...settings, notifyOnCancellation: e.target.checked })}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Reviews</label>
                  <p className="text-xs text-gray-500">When customers leave reviews</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyOnReview}
                  onChange={(e) => setSettings({ ...settings, notifyOnReview: e.target.checked })}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Sound Settings */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              Sound Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Play Notification Sound</label>
                  <p className="text-sm text-gray-500">Play a sound when notifications arrive</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.playSound}
                  onChange={(e) => setSettings({ ...settings, playSound: e.target.checked })}
                  className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                />
              </div>
              {settings.playSound && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sound Volume: {settings.soundVolume}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.soundVolume}
                    onChange={(e) => setSettings({ ...settings, soundVolume: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Quiet Hours & Schedule
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Quiet Hours Start</label>
                  <input
                    type="time"
                    value={settings.quietHoursStart}
                    onChange={(e) => setSettings({ ...settings, quietHoursStart: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Quiet Hours End</label>
                  <input
                    type="time"
                    value={settings.quietHoursEnd}
                    onChange={(e) => setSettings({ ...settings, quietHoursEnd: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Weekend Notifications</label>
                  <p className="text-sm text-gray-500">Receive notifications on weekends</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.weekendNotifications}
                  onChange={(e) => setSettings({ ...settings, weekendNotifications: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
