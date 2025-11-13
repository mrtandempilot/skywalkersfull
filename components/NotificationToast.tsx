'use client';

import React, { useEffect, useState } from 'react';
import { useNotifications } from './NotificationProvider';

export function NotificationToast() {
  const { notifications, markAsRead, clearNotification } = useNotifications();
  const [visibleToasts, setVisibleToasts] = useState<string[]>([]);

  // Show only the most recent 3 notifications as toasts
  const recentNotifications = notifications.slice(0, 3);

  useEffect(() => {
    // Auto-show new notifications as toasts
    const newToastIds = recentNotifications
      .filter(n => !n.read && !visibleToasts.includes(n.id))
      .map(n => n.id);

    if (newToastIds.length > 0) {
      setVisibleToasts(prev => [...prev, ...newToastIds]);

      // Auto-hide toasts after 8 seconds
      newToastIds.forEach(id => {
        setTimeout(() => {
          setVisibleToasts(prev => prev.filter(toastId => toastId !== id));
          markAsRead(id); // Mark as read when auto-hiding
        }, 8000);
      });
    }
  }, [recentNotifications, visibleToasts, markAsRead]);

  const handleToastClick = (notification: any) => {
    markAsRead(notification.id);
    setVisibleToasts(prev => prev.filter(id => id !== notification.id));

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const dismissToast = (id: string) => {
    setVisibleToasts(prev => prev.filter(toastId => toastId !== id));
    markAsRead(id);
  };

  if (visibleToasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleToasts.map(toastId => {
        const notification = notifications.find(n => n.id === toastId);
        if (!notification) return null;

        return (
          <div
            key={toastId}
            className={`
              max-w-sm w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4
              transform transition-all duration-300 ease-in-out
              ${notification.priority === 'high' ? 'border-red-500 bg-red-900/20' :
                notification.priority === 'medium' ? 'border-yellow-500 bg-yellow-900/20' :
                'border-blue-500 bg-blue-900/20'}
              animate-in slide-in-from-right-2 fade-in duration-300
            `}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'booking' && (
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                )}
                {notification.type === 'payment' && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
                {notification.type === 'alert' && (
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-gray-300">
                  {notification.message}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>

              <div className="ml-4 flex-shrink-0 flex">
                {notification.actionUrl && (
                  <button
                    onClick={() => handleToastClick(notification)}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium mr-3"
                  >
                    View
                  </button>
                )}
                <button
                  onClick={() => dismissToast(notification.id)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Progress bar for auto-dismiss */}
            <div className="mt-3 bg-gray-700 rounded-full h-1">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-100 ease-linear"
                style={{
                  width: '100%',
                  animation: 'shrink 8s linear forwards'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Add CSS animation for the progress bar
const styles = `
@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
