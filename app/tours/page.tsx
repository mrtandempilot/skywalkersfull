"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Tour } from "@/types/tour";
import Image from "next/image";

const categoryColors: { [key: string]: string } = {
  Sky: "from-blue-400 to-blue-600",
  Water: "from-cyan-400 to-cyan-600",
  Land: "from-green-400 to-green-600"
};

const categoryButtonColors: { [key: string]: string } = {
  Sky: "bg-blue-600 hover:bg-blue-700",
  Water: "bg-cyan-600 hover:bg-cyan-700",
  Land: "bg-green-600 hover:bg-green-700"
};

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTours() {
      try {
        const { data, error } = await supabase
          .from('tours')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (error) throw error;

        setTours(data || []);
      } catch (err) {
        console.error('Error fetching tours:', err);
        setError('Failed to load tours. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchTours();
  }, []);

  const formatPrice = (tour: Tour) => {
    const price = tour.price_adult;
    const currency = tour.currency === 'TRY' ? '₺' : tour.currency === 'USD' ? '$' : '€';
    return `${currency}${price.toFixed(0)}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-4">Our Tours</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Loading tours...
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen">
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-4">Our Tours</h1>
            <p className="text-xl max-w-3xl mx-auto text-red-200">
              {error}
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Our Tours</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Choose from our wide selection of exciting tours and activities in
            beautiful Oludeniz. Each adventure is designed to create
            unforgettable memories.
          </p>
        </div>
      </section>

      {/* Tours Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour) => (
              <div
                key={tour.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                {tour.image_url ? (
                  <div className="relative h-48">
                    <Image
                      src={tour.image_url}
                      alt={tour.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className={`h-48 bg-gradient-to-r ${categoryColors[tour.category] || 'from-blue-400 to-blue-600'}`}></div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-500 uppercase">
                      {tour.category}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{tour.name}</h3>
                  <p className="text-gray-500 mb-4">
                    Duration: {tour.duration}
                  </p>
                  <p className="text-gray-600 mb-4 line-clamp-3">{tour.short_description}</p>
                  
                  {tour.included && tour.included.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Includes:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {tour.included.slice(0, 4).map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                        {tour.included.length > 4 && (
                          <li className="text-gray-500 italic text-xs">
                            +{tour.included.length - 4} more...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <span className="text-3xl font-bold text-gray-800">
                        {formatPrice(tour)}
                      </span>
                      {tour.price_child && (
                        <p className="text-sm text-gray-500">per adult</p>
                      )}
                    </div>
                    <Link
                      href={`/book?tour=${tour.id}`}
                      className={`${categoryButtonColors[tour.category] || 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-2 rounded-lg transition`}
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {tours.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">
                No tours available at the moment. Please check back later!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready for Your Adventure?
          </h2>
          <p className="text-xl mb-8">
            Contact us today to book your tour or if you have any questions.
            Our friendly team is here to help!
          </p>
          <Link
            href="/contact"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
