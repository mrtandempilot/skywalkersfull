export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Your trusted partner for unforgettable adventures in Oludeniz
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded in 2010, Oludeniz Tours has been providing exceptional
                adventure experiences in one of Turkey&apos;s most beautiful
                destinations. Our passion for sharing the natural beauty of
                Oludeniz has made us one of the leading tour operators in the
                region.
              </p>
              <p className="text-gray-600 mb-4">
                What started as a small paragliding operation has grown into a
                full-service tour company offering a wide range of activities.
                We&apos;ve helped thousands of visitors create unforgettable memories
                while maintaining the highest safety standards and environmental
                responsibility.
              </p>
              <p className="text-gray-600">
                Our team consists of experienced, certified professionals who are
                not only experts in their fields but also passionate about
                showcasing the best of Oludeniz to our guests.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 h-96 rounded-lg"></div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-2xl font-bold mb-3">Safety First</h3>
              <p className="text-gray-600">
                Your safety is our top priority. All our equipment is regularly
                inspected and maintained to the highest standards, and our team
                is fully certified and trained.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-2xl font-bold mb-3">Environmental Care</h3>
              <p className="text-gray-600">
                We are committed to preserving the natural beauty of Oludeniz.
                All our tours follow eco-friendly practices and we actively
                participate in local conservation efforts.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-2xl font-bold mb-3">Customer Focus</h3>
              <p className="text-gray-600">
                We strive to exceed your expectations with personalized service,
                attention to detail, and a genuine desire to make your
                experience exceptional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-bold mb-1">Mehmet Yılmaz</h3>
              <p className="text-gray-600 mb-2">Founder & CEO</p>
              <p className="text-sm text-gray-500">
                15+ years of paragliding experience
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-bold mb-1">Ayşe Demir</h3>
              <p className="text-gray-600 mb-2">Operations Manager</p>
              <p className="text-sm text-gray-500">
                Expert in customer service
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-bold mb-1">Can Özdemir</h3>
              <p className="text-gray-600 mb-2">Lead Paragliding Pilot</p>
              <p className="text-sm text-gray-500">
                Certified APPI instructor
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-bold mb-1">Elif Kaya</h3>
              <p className="text-gray-600 mb-2">Tour Coordinator</p>
              <p className="text-sm text-gray-500">
                Multilingual guide & planner
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">15+</div>
              <p className="text-xl">Years of Experience</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50K+</div>
              <p className="text-xl">Happy Customers</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100%</div>
              <p className="text-xl">Safety Record</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">4.9★</div>
              <p className="text-xl">Average Rating</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
