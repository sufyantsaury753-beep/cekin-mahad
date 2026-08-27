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
  Sparkles,
  LogIn,
  LogOut,
  User,
  KeyRound,
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

  // Base navigation links
  const navLinks = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/daftar', label: 'Pilih Kamar', icon: BedDouble },
    { href: '/tiket', label: 'E-Tiket', icon: QrCode },
    { href: '/scanner', label: 'Scanner Lorong', icon: QrCode, highlight: true },
    { href: '/admin', label: 'Admin SK', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 bg-uin-dark/95 backdrop-blur text-white border-b border-uin-primary/40 shadow-lg no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-uin-accent to-emerald-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-uin-dark rounded-[10px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-uin-accent group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-wide text-white font-serif">MA&apos;HAD AL-JAMI&apos;AH</span>
                <span className="bg-uin-accent/20 text-uin-accent text-[9px] font-semibold px-2 py-0.5 rounded-full border border-uin-accent/30 hidden sm:flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> UIN SSC
                </span>
              </div>
              <p className="text-[11px] text-emerald-300 font-medium">UIN Siber Syekh Nurjati Cirebon &bull; E-Check In</p>
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
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-uin-primary text-uin-accent shadow-inner'
                      : link.highlight
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/50'
                      : 'text-gray-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-uin-accent' : ''}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Auth State & Role Badge (Desktop) */}
          <div className="hidden sm:flex items-center gap-2.5">
            {session ? (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur pl-3 pr-1.5 py-1.5 rounded-xl border border-white/20">
                <div className="text-right">
                  <span className="text-xs font-bold text-white block max-w-[140px] truncate">
                    {session.name}
                  </span>
                  <span className="text-[9px] font-bold text-uin-accent uppercase tracking-wider block">
                    {session.role === 'ADMIN' && '👑 Superadmin'}
                    {session.role === 'PENGURUS' && `📋 Pengurus Lt. ${session.floorAssigned || ''}`}
                    {session.role === 'MAHASANTRI' && '🎓 Mahasantri SK'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout / Ganti Akun"
                  className="p-2 rounded-lg text-slate-300 hover:text-rose-300 hover:bg-rose-500/20 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-2 bg-uin-accent hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow transition-all"
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
              className="p-2 rounded-lg bg-white/10 text-uin-accent hover:bg-white/20"
              title="Portal Login"
            >
              <User className="w-5 h-5" />
            </Link>

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
          <div className="lg:hidden py-4 border-t border-uin-primary/40 space-y-2">
            
            {/* Logged in info on mobile */}
            {session ? (
              <div className="p-3 bg-white/10 rounded-xl flex items-center justify-between border border-white/15 mb-3">
                <div>
                  <span className="text-xs font-bold text-white block">{session.name}</span>
                  <span className="text-[10px] text-uin-accent font-bold">
                    {session.role === 'ADMIN' && '👑 Superadmin'}
                    {session.role === 'PENGURUS' && `📋 Pengurus Lantai ${session.floorAssigned}`}
                    {session.role === 'MAHASANTRI' && '🎓 Mahasantri SK'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-rose-600/30 text-rose-300 text-xs font-bold rounded-lg border border-rose-500/30 flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 p-3 bg-uin-accent text-slate-950 font-bold text-xs rounded-xl shadow mb-3"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Akun (Mahasantri / Pengurus / Admin)</span>
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
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-uin-primary text-uin-accent'
                      : link.highlight
                      ? 'bg-emerald-600/30 text-emerald-300'
                      : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
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
