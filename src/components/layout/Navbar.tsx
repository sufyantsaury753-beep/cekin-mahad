'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  BedDouble,
  QrCode,
  ShieldCheck,
  Home,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  ClipboardCheck,
  GraduationCap,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { MahadAuth } from '@/lib/store';
import { UserSession } from '@/lib/types';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    setSession(MahadAuth.getSession());

    const handleAuthChange = () => {
      setSession(MahadAuth.getSession());
    };

    window.addEventListener('mahad_auth_changed', handleAuthChange);
    return () => window.removeEventListener('mahad_auth_changed', handleAuthChange);
  }, []);

  const handleLogout = () => {
    MahadAuth.logout();
    setSession(null);
    router.push('/login');
  };

  // Determine navigation links based on user role
  const getNavLinks = () => {
    if (!session) {
      return [
        { href: '/', label: 'Beranda', icon: Home },
        { href: '/daftar', label: 'Pilih Kamar', icon: BedDouble },
        { href: '/tiket', label: 'Cek E-Tiket', icon: QrCode },
      ];
    }

    if (session.role === 'MAHASANTRI') {
      return [
        { href: '/', label: 'Beranda', icon: Home },
        { href: '/daftar', label: 'Pilih Kamar & Formulir', icon: BedDouble },
        { href: '/tiket', label: 'E-Tiket Saya', icon: QrCode },
      ];
    }

    if (session.role === 'PENGURUS') {
      return [
        { href: '/', label: 'Beranda', icon: Home },
        {
          href: '/scanner',
          label: `Scanner Lorong ${session.floorAssigned ? `(Lt. ${session.floorAssigned})` : ''}`,
          icon: QrCode,
          highlight: true,
        },
        { href: '/tiket', label: 'Pencarian E-Tiket', icon: QrCode },
      ];
    }

    if (session.role === 'ADMIN') {
      return [
        { href: '/', label: 'Beranda', icon: Home },
        { href: '/admin', label: 'Dashboard Admin SK', icon: ShieldCheck, highlight: true },
        { href: '/scanner', label: 'Scanner Lorong', icon: QrCode },
        { href: '/daftar', label: 'Formulir Kamar', icon: BedDouble },
        { href: '/tiket', label: 'Rekap E-Tiket', icon: QrCode },
      ];
    }

    return [{ href: '/', label: 'Beranda', icon: Home }];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-md overflow-hidden bg-white p-0.5 shadow-xs flex items-center justify-center shrink-0 border border-slate-700">
              <img
                src="/logo-mahad.png"
                alt="Logo Ma'had UINSSC"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-white">MA&apos;HAD AL-JAMI&apos;AH</span>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                  UIN SSC
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal leading-none mt-0.5">Sistem Manajemen &amp; E-Check In</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : link.highlight
                      ? 'text-emerald-300 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Auth State & Role Badge (Desktop) */}
          <div className="hidden sm:flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-2.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/80">
                <div className="text-right">
                  <span className="text-xs font-semibold text-white block max-w-[150px] truncate leading-tight">
                    {session.name}
                  </span>
                  <div className="flex items-center justify-end gap-1 text-[11px] text-slate-400 mt-0.5">
                    {session.role === 'ADMIN' && (
                      <>
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Superadmin</span>
                      </>
                    )}
                    {session.role === 'PENGURUS' && (
                      <>
                        <ClipboardCheck className="w-3 h-3 text-sky-400" />
                        <span className="text-sky-300 font-medium">Pengurus Lt. {session.floorAssigned || ''}</span>
                      </>
                    )}
                    {session.role === 'MAHASANTRI' && (
                      <>
                        <GraduationCap className="w-3 h-3 text-emerald-400" />
                        <span className="text-slate-300 font-medium">Mahasantri</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-700 ml-1"></div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout / Ganti Akun"
                  className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-uin-primary hover:bg-uin-secondary text-white font-medium text-xs rounded-lg transition-colors border border-emerald-700/60"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Akun</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <Link
              href="/login"
              className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
              title="Portal Login"
            >
              <User className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-800 space-y-1">
            {session ? (
              <div className="p-3 bg-slate-800/80 rounded-lg flex items-center justify-between border border-slate-700 mb-2">
                <div>
                  <span className="text-xs font-semibold text-white block">{session.name}</span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                    {session.role === 'ADMIN' && (
                      <>
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Superadmin</span>
                      </>
                    )}
                    {session.role === 'PENGURUS' && (
                      <>
                        <ClipboardCheck className="w-3 h-3 text-sky-400" />
                        <span className="text-sky-300 font-medium">Pengurus Lantai {session.floorAssigned}</span>
                      </>
                    )}
                    {session.role === 'MAHASANTRI' && (
                      <>
                        <GraduationCap className="w-3 h-3 text-emerald-400" />
                        <span className="text-slate-300 font-medium">Mahasantri SK</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium rounded border border-rose-500/20 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 p-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-medium text-xs rounded-lg mb-2 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Akun</span>
              </Link>
            )}

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
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
