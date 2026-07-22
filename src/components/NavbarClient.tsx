'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, LogIn, LayoutDashboard } from 'lucide-react';

interface NavbarClientProps {
  user: any;
  role: string | undefined;
}

export default function NavbarClient({ user, role }: NavbarClientProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check immediately on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = pathname === '/' && !isScrolled;

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Find Jobs', href: '/jobs' },
    { label: 'Employers', href: '/employers' },
    { label: 'Contact Us', href: '/contact' },
  ];

  const getDashboardLink = () => {
    if (role === 'employer') return '/dashboard/employer';
    if (role === 'admin') return '/admin';
    return '/dashboard/candidate';
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${
      isTransparent
        ? 'bg-transparent border-white/5 shadow-none'
        : 'bg-white/70 backdrop-blur-2xl border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] after:absolute after:inset-x-0 after:bottom-0 after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-blue-500/15 after:to-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand Title */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-16 h-16 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm shrink-0">
              <Image
                src="/logo.png"
                alt="Sidra Talent Bridge Logo"
                fill
                className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-[15px] tracking-tight transition-colors ${
                isTransparent ? 'text-white group-hover:text-blue-400' : 'text-slate-800 group-hover:text-blue-600'
              }`}>
                Sidra Talent Bridge
              </span>
              <span className={`text-[8px] font-bold tracking-widest uppercase transition-colors ${
                isTransparent ? 'text-blue-300/80' : 'text-slate-400'
              }`}>
                Bridging Talent. Building Success.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 group/nav">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-300 ${
                    isTransparent
                      ? active
                        ? 'text-white bg-white/15 shadow-sm font-semibold'
                        : 'text-slate-200 hover:text-white hover:bg-white/10 group-hover/nav:opacity-75 hover:!opacity-100'
                      : active
                        ? 'text-blue-600 font-semibold bg-blue-50/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 group-hover/nav:opacity-75 hover:!opacity-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth Call-to-action */}
          <div className="hidden md:flex items-center">
            {user ? (
              <Link
                href={getDashboardLink()}
                className="bg-gradient-to-r from-blue-700 to-indigo-900 hover:from-blue-800 hover:to-indigo-950 active:scale-95 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-1.5 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-1.5 transform hover:-translate-y-0.5 cursor-pointer active:scale-95 ${
                  isTransparent
                    ? 'bg-white hover:bg-slate-100 text-slate-950'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <LogIn size={14} />
                Login / Register
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2.5 rounded-xl transition-all ${
                isTransparent
                  ? 'text-white hover:bg-white/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className={`md:hidden border-t px-4 py-4 space-y-3 shadow-inner ${
          isTransparent
            ? 'bg-slate-950/95 border-white/5 text-white'
            : 'bg-white/95 border-slate-100 text-slate-800'
        }`}>
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                    active
                      ? isTransparent
                        ? 'text-white bg-white/10'
                        : 'text-blue-600 bg-blue-50/50'
                      : isTransparent
                        ? 'text-slate-300 hover:text-white hover:bg-white/5'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className={`pt-4 border-t flex flex-col gap-3 ${isTransparent ? 'border-white/5' : 'border-slate-100'}`}>
            {user ? (
              <Link
                href={getDashboardLink()}
                onClick={() => setIsOpen(false)}
                className="w-full bg-gradient-to-r from-blue-700 to-indigo-900 hover:from-blue-800 hover:to-indigo-950 text-white text-center py-3 rounded-xl text-base font-bold shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
              >
                <LayoutDashboard size={18} />
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className={`w-full text-center py-3 rounded-xl text-base font-bold flex items-center justify-center gap-2 ${
                  isTransparent
                    ? 'bg-white hover:bg-slate-100 text-slate-950'
                    : 'bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white'
                }`}
              >
                <LogIn size={18} />
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
