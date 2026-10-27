'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MahadAuth } from '@/lib/store';
import { UserRole, UserSession } from '@/lib/types';
import Link from 'next/link';
import { ShieldAlert, LogIn, KeyRound } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  pageTitle?: string;
}

export default function RoleGuard({ allowedRoles, children, pageTitle = 'Halaman Terproteksi' }: RoleGuardProps) {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentSession = MahadAuth.getSession();
    setSession(currentSession);
    setLoading(false);

    const handleAuthChange = () => {
      setSession(MahadAuth.getSession());
    };

    window.addEventListener('mahad_auth_changed', handleAuthChange);
    return () => window.removeEventListener('mahad_auth_changed', handleAuthChange);
  }, []);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center text-slate-400 text-sm">
        Memeriksa hak akses akun...
      </div>
    );
  }

  // Not logged in at all
  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
          <KeyRound className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 uppercase tracking-wider inline-block">
            Diperlukan Autentikasi
          </span>
          <h2 className="text-xl font-bold text-slate-900">Akses Terbatas</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Untuk mengakses <strong>{pageTitle}</strong>, silakan masuk terlebih dahulu menggunakan akun terverifikasi (Mahasantri, Pengurus, atau Admin).
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-medium text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk ke Akun Sekarang</span>
          </Link>
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-800 font-medium py-1"
          >
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // Logged in, but role is not allowed
  if (!allowedRoles.includes(session.role)) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-red-800 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-200 uppercase tracking-wider inline-block">
            Akses Ditolak
          </span>
          <h2 className="text-xl font-bold text-slate-900">Bukan Hak Akses Akun Anda</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Halaman ini khusus untuk peran <strong>{allowedRoles.join(' / ')}</strong>. Akun Anda saat ini terdaftar sebagai <strong>{session.role} ({session.name})</strong>.
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 text-left space-y-1.5 shadow-xs">
          <div className="font-semibold text-slate-800">Menu yang Tersedia Sesuai Peran Anda:</div>
          {session.role === 'MAHASANTRI' && (
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>Pilih Kamar &amp; Ranjang Sesuai SK Resmi</li>
              <li>Unduh / Cetak E-Tiket Boarding Pass Barcode</li>
            </ul>
          )}
          {session.role === 'PENGURUS' && (
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>Scanner Barcode Mahasantri Lantai {session.floorAssigned || ''}</li>
              <li>Pemeriksaan Bawaan &amp; Serah Terima Kunci Kamar</li>
            </ul>
          )}
        </div>

        <div className="pt-2 flex flex-col gap-2">
          {session.role === 'MAHASANTRI' && (
            <Link
              href="/daftar"
              className="py-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-medium text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
            >
              Buka Portal Pemilihan Kamar
            </Link>
          )}

          {session.role === 'PENGURUS' && (
            <Link
              href="/scanner"
              className="py-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-medium text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
            >
              Buka Scanner Lorong Lantai
            </Link>
          )}

          <Link
            href="/login"
            className="py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-300 transition-colors"
          >
            Ganti Akun Lain
          </Link>
        </div>
      </div>
    );
  }

  // Access Granted!
  return <>{children}</>;
}
