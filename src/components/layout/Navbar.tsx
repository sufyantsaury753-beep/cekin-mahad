'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, BedDouble, QrCode, ShieldCheck, Home, Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/daftar', label: 'Pilih Kamar & Daftar', icon: BedDouble },
    { href: '/tiket', label: 'Cek E-Tiket', icon: QrCode },
    { href: '/scanner', label: 'Scanner Pengurus (Hari-H)', icon: QrCode, highlight: true },
    { href: '/admin', label: 'Dashboard Admin', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 bg-uin-dark/95 backdrop-blur text-white border-b border-uin-primary/40 shadow-lg no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-uin-accent to-emerald-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-uin-dark rounded-[10px] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-uin-accent group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-wide text-white font-serif">MA&apos;HAD AL-JAMI&apos;AH</span>
                <span className="bg-uin-accent/20 text-uin-accent text-[10px] font-semibold px-2 py-0.5 rounded-full border border-uin-accent/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> UIN SSC
                </span>
              </div>
              <p className="text-xs text-emerald-300 font-medium">UIN Siber Syekh Nurjati Cirebon &bull; E-Check In</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-uin-primary text-uin-accent shadow-inner'
                      : link.highlight
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/50'
                      : 'text-gray-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-uin-accent' : ''}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-uin-primary/50 text-white hover:bg-uin-primary focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-uin-primary/40 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium ${
                    isActive
                      ? 'bg-uin-primary text-uin-accent'
                      : link.highlight
                      ? 'bg-emerald-600/30 text-emerald-300'
                      : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
