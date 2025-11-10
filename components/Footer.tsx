import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Oludeniz Tours</h3>
            <p className="text-gray-300">
              Experience the thrill of paragliding over the stunning Blue Lagoon
              of Oludeniz. We offer unforgettable adventure tours in one of
              Turkey&apos;s most beautiful destinations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/tours" className="text-gray-300 hover:text-white transition">
                  Tours
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-300">
              <li>📍 Oludeniz, Fethiye, Turkey</li>
              <li>📞 +90 XXX XXX XX XX</li>
              <li>✉️ info@olubeniztours.com</li>
              <li>⏰ Open Daily: 8:00 AM - 8:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Oludeniz Tours. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
