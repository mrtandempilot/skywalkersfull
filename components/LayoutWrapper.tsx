'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import QuickActions from './QuickActions';
import Navbar from './Navbar';
import Footer from './Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function checkAdmin() {
      try {
        const user = await getCurrentUser();
        setIsAdmin(user?.email === 'mrtandempilot@gmail.com');
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [pathname]);

  if (loading) {
    return (
      <>
        <Navbar />
        {children}
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      {isAdmin ? (
        <div className="flex">
          <QuickActions />
          <div className="flex-1">
            {children}
          </div>
        </div>
      ) : (
        children
      )}
      <Footer />
    </>
  );
}
