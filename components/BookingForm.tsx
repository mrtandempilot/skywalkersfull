'use client';

import { useState, useEffect } from 'react';
import { createBooking } from '@/lib/bookings-client';
import { CreateBookingInput } from '@/types/booking';
import { supabase } from '@/lib/supabase';
import { Tour } from '@/types/tour';

interface BookingFormProps {
  onSuccess?: () => void;
  tourId?: string | null;
}

export default function BookingForm({ onSuccess, tourId }: BookingFormProps) {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [loadingTour, setLoadingTour] = useState(!!tourId);
  const [formData, setFormData] = useState<CreateBookingInput>({
    tour_name: 'Paragliding Tandem Flight',
    booking_date: '',
    tour_start_time: '10:00',
    duration: 120,
    adults: 1,
    children: 0,
    total_amount: 100,
    notes: '',
    hotel_name: '',
  });
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch tour data if tourId is provided
  useEffect(() => {
    async function fetchTourData() {
      if (!tourId) {
        setLoadingTour(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('tours')
          .select('*')
          .eq('id', tourId)
          .single();

        if (error) throw error;

        if (data) {
          setSelectedTour(data);
          setFormData(prev => ({
            ...prev,
            tour_name: data.name,
            duration: data.duration_minutes || 120,
            total_amount: data.price_adult,
          }));
        }
      } catch (err) {
        console.error('Error fetching tour:', err);
      } finally {
        setLoadingTour(false);
      }
    }

    fetchTourData();
  }, [tourId]);

  const tourTypes = [
    { name: 'Paragliding Tandem Flight', duration: 120, price: 100 },
    { name: 'Paragliding Course - Beginner', duration: 240, price: 300 },
    { name: 'Paragliding Course - Advanced', duration: 240, price: 400 },
    { name: 'Boat Tour', duration: 180, price: 75 },
    { name: 'Island Hopping', duration: 360, price: 150 },
    { name: 'Scuba Diving', duration: 180, price: 120 },
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleTourTypeChange = (tourName: string) => {
    const tour = tourTypes.find(t => t.name === tourName);
    if (tour) {
      const totalParticipants = formData.adults + (formData.children || 0);
      setFormData(prev => ({
        ...prev,
        tour_name: tourName,
        duration: tour.duration,
        total_amount: tour.price * totalParticipants,
      }));
    }
  };

  const handleParticipantsChange = (adults: number, children: number) => {
    // Ensure we have valid numbers
    const validAdults = isNaN(adults) || adults < 1 ? 1 : adults;
    const validChildren = isNaN(children) || children < 0 ? 0 : children;
    
    let totalAmount = 0;
    
    // If we have a selected tour from the database, use its pricing
    if (selectedTour) {
      totalAmount = (selectedTour.price_adult * validAdults) + 
                   (selectedTour.price_child && validChildren ? selectedTour.price_child * validChildren : 0);
    } else {
      // Otherwise use the hardcoded tour types
      const tour = tourTypes.find(t => t.name === formData.tour_name);
      if (tour) {
        const totalParticipants = validAdults + validChildren;
        totalAmount = tour.price * totalParticipants;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      adults: validAdults,
      children: validChildren,
      total_amount: totalAmount,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await createBooking(formData);
      setSuccess(true);
      
      // Reset form
      setFormData({
        tour_name: 'Paragliding Tandem Flight',
        booking_date: '',
        tour_start_time: '10:00',
        duration: 120,
        adults: 1,
        children: 0,
        total_amount: 100,
        notes: '',
        hotel_name: '',
      });

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Book Your Tour</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tour Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tour Type
          </label>
          {selectedTour ? (
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
              <span className="font-semibold">{selectedTour.name}</span>
              <p className="text-sm text-gray-600 mt-1">{selectedTour.short_description}</p>
            </div>
          ) : (
          <select
            value={formData.tour_name}
            onChange={(e) => handleTourTypeChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
            required
          >
              {tourTypes.map((tour) => (
                <option key={tour.name} value={tour.name}>
                  {tour.name} - ${tour.price}/person
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={formData.booking_date}
            onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
            required
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time
          </label>
          <select
            value={formData.tour_start_time}
            onChange={(e) => setFormData({ ...formData, tour_start_time: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
            required
          >
            {timeSlots.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        {/* Adults */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Adults
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.adults}
            onChange={(e) => handleParticipantsChange(parseInt(e.target.value) || 1, formData.children || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
            required
          />
        </div>

        {/* Children */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Children (Optional)
          </label>
          <input
            type="number"
            min="0"
            max="10"
            value={formData.children || 0}
            onChange={(e) => handleParticipantsChange(formData.adults, parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
          />
        </div>

        {/* Hotel Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hotel Name / Pickup Location (Optional)
          </label>
          <input
            type="text"
            value={formData.hotel_name || ''}
            onChange={(e) => setFormData({ ...formData, hotel_name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
            placeholder="Enter your hotel name or pickup location"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-900 bg-white"
            placeholder="Any special requests or requirements..."
          />
        </div>

        {/* Total Price */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-800">Total Price:</span>
            <span className="text-2xl font-bold text-blue-600">${formData.total_amount}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {formData.adults} adult{formData.adults > 1 ? 's' : ''}{formData.children ? ` + ${formData.children} child${formData.children > 1 ? 'ren' : ''}` : ''}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            Booking created successfully! A calendar event has been added to your Google Calendar.
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            'Confirm Booking'
          )}
        </button>
      </form>
    </div>
  );
}
