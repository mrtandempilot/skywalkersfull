"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, signOut } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial user
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold">
              Oludeniz Tours
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-blue-200 transition">
              Home
            </Link>
            <Link href="/tours" className="hover:text-blue-200 transition">
              Tours
            </Link>
            <Link href="/calendar" className="hover:text-blue-200 transition">
              Calendar
            </Link>
            {user && user.email === 'mrtandempilot@gmail.com' && (
              <Link href="/dashboard" className="hover:text-blue-200 transition">
                Dashboard
              </Link>
            )}
            <Link href="/about" className="hover:text-blue-200 transition">
              About
            </Link>
            <Link href="/contact" className="hover:text-blue-200 transition">
              Contact
            </Link>
            
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <Link href="/account" className="hover:text-blue-200 transition">
                      My Account
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition"
                  >
                    Login
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <Link
              href="/"
              className="block py-2 hover:text-blue-200 transition"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/tours"
              className="block py-2 hover:text-blue-200 transition"
              onClick={() => setIsOpen(false)}
            >
              Tours
            </Link>
            <Link
              href="/calendar"
              className="block py-2 hover:text-blue-200 transition"
              onClick={() => setIsOpen(false)}
            >
              Calendar
            </Link>
            {user && user.email === 'mrtandempilot@gmail.com' && (
              <Link
                href="/dashboard"
                className="block py-2 hover:text-blue-200 transition"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <Link
              href="/about"
              className="block py-2 hover:text-blue-200 transition"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block py-2 hover:text-blue-200 transition"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            
            {!loading && (
              <>
                {user ? (
                  <div className="pt-2 border-t border-blue-500 mt-2">
                    <Link
                      href="/account"
                      className="block py-2 hover:text-blue-200 transition"
                      onClick={() => setIsOpen(false)}
                    >
                      My Account
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="block w-full text-left py-2 hover:text-blue-200 transition"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="block py-2 hover:text-blue-200 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
