"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import LegoButton from '../ui/LegoButton';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps



  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      router.push('/');
    }
  };



  return (
    <nav className="sticky top-0 z-50 bg-lego-blue border-b-8 border-blue-900 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center ml-2 md:ml-4">
          <div className="relative h-14 w-14 md:h-20 md:w-20 transition-transform hover:scale-105 active:scale-95">
            <Image
              src="/logo.png"
              alt="DevJourney Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6 font-pixel text-[10px]">
          <Link href="/challenges" className="text-white hover:text-lego-yellow transition-colors">CHALLENGES</Link>
          <Link href="/leaderboard" className="text-white hover:text-lego-yellow transition-colors">LEADERBOARD</Link>

          {mounted && (
            isAuthenticated ? (
              <div className="flex items-center space-x-6">
                <Link href="/dashboard" className="text-white hover:text-lego-yellow transition-colors">DASHBOARD</Link>
                <Link href="/profile" className="flex items-center space-x-2 bg-lego-dark border-4 border-black p-1 px-3">
                  <span className="text-white">{user?.username || 'BUILDER'}</span>
                </Link>
                <LegoButton variant="red" size="sm" onClick={handleLogout}>LOGOUT</LegoButton>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login">
                  <LegoButton variant="yellow" size="sm" className="!text-lego-green">LOGIN</LegoButton>
                </Link>
                <Link href="/auth/register">
                  <LegoButton variant="green" size="sm">REGISTER</LegoButton>
                </Link>
              </div>
            )
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-white p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-900 absolute top-full left-0 right-0 p-6 flex flex-col space-y-6 font-pixel text-xs border-b-8 border-blue-950 animate-brick">
          <Link href="/challenges" onClick={() => setIsOpen(false)} className="text-white">CHALLENGES</Link>
          <Link href="/leaderboard" onClick={() => setIsOpen(false)} className="text-white">LEADERBOARD</Link>

          {mounted && (
            isAuthenticated ? (
              <div className="flex flex-col space-y-4">
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-white">DASHBOARD</Link>
                <Link href="/profile" onClick={() => setIsOpen(false)} className="text-white">PROFILE</Link>
                <LegoButton variant="red" size="sm" onClick={() => { handleLogout(); setIsOpen(false); }}>LOGOUT</LegoButton>
              </div>
            ) : (

              <div className="flex flex-col space-y-4">
                <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                  <LegoButton variant="yellow" className="w-full !text-lego-green">LOGIN</LegoButton>
                </Link>
                <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                  <LegoButton variant="green" className="w-full">REGISTER</LegoButton>
                </Link>
              </div>
            )
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
