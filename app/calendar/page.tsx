'use client';

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Calendar</h1>
          <p className="mt-2 text-gray-400">View and manage your bookings schedule</p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <div className="w-full" style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}>
            <iframe
              src="https://calendar.google.com/calendar/embed?src=16fd11edf8eff8e70a23274eee57e601f8c8c08e956280397ce56a206a0fbe31%40group.calendar.google.com&ctz=Europe%2FIstanbul"
              style={{ border: 0 }}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              className="rounded"
            ></iframe>
          </div>
          
          <div className="mt-4 text-sm text-gray-400">
            <p>💡 Tip: You can adjust your Google Calendar settings to customize the view and add your booking calendar.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
