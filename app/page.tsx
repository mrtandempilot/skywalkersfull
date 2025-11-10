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

const categoryPriceColors: { [key: string]: string } = {
  Sky: "text-blue-600",
  Water: "text-cyan-600",
  Land: "text-green-600"
};

export default function Home() {
  const [featuredTours, setFeaturedTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedTours() {
      try {
        const { data, error } = await supabase
          .from('tours')
          .select('*')
          .eq('is_active', true)
          .limit(3);

        if (error) throw error;

        setFeaturedTours(data || []);
      } catch (err) {
        console.error('Error fetching featured tours:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedTours();
  }, []);

  const formatPrice = (tour: Tour) => {
    const price = tour.price_adult;
    const currency = tour.currency === 'TRY' ? '₺' : tour.currency === 'USD' ? '$' : '€';
    return `${currency}${price.toFixed(0)}`;
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-r from-blue-500 to-blue-700 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Soar Above Oludeniz
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Experience the breathtaking beauty of the Blue Lagoon from the sky.
              Book your paragliding adventure today!
            </p>
            <div className="flex gap-4">
              <Link
                href="/tours"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                View Tours
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tours Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Our Popular Tours
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">Loading tours...</p>
            </div>
          ) : featuredTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredTours.map((tour) => (
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
                    <h3 className="text-2xl font-bold mb-3">{tour.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{tour.short_description}</p>
                    <div className="flex justify-between items-center">
                      <span className={`text-2xl font-bold ${categoryPriceColors[tour.category] || 'text-blue-600'}`}>
                        {formatPrice(tour)}
                      </span>
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
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-4">
                Check out our amazing tour offerings!
              </p>
              <Link
                href="/tours"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-block"
              >
                View All Tours
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Choose Oludeniz Tours?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-2">Experienced Guides</h3>
              <p className="text-gray-600">
                Our professional team has years of experience ensuring your
                safety and enjoyment.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold mb-2">5-Star Reviews</h3>
              <p className="text-gray-600">
                Rated excellent by thousands of satisfied customers from around
                the world.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">Best Prices</h3>
              <p className="text-gray-600">
                Competitive rates with no hidden fees. Get the best value for
                your adventure.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
