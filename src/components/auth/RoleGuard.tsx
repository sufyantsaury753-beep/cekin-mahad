'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MahadAuth } from '@/lib/store';
import { UserRole, UserSession } from '@/lib/types';
import Link from 'next/link';
import { ShieldAlert, LogIn, ArrowLeft, KeyRound, User, QrCode } from 'lucide-react';

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
      <div className="max-w-xl mx-auto py-24 text-center text-slate-500 text-sm">
        Memeriksa hak akses akun...
      </div>
    );
  }

  // Not logged in at all
  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
          <KeyRound className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Diperlukan Login Akun</span>
          <h2 className="text-2xl font-bold text-slate-800">Akses Masuk Terbatas</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Untuk mengakses <strong>{pageTitle}</strong>, silakan masuk terlebih dahulu dengan akun resmi Anda (Mahasantri, Pengurus, atau Admin).
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 py-3 bg-uin-primary hover:bg-uin-secondary text-white font-bold text-xs rounded-xl shadow transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk ke Akun Sekarang</span>
          </Link>
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
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
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Akses Ditolak</span>
          <h2 className="text-2xl font-bold text-slate-800">Bukan Hak Akses Anda</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Halaman ini khusus untuk <strong>{allowedRoles.join(' / ')}</strong>. Akun Anda saat ini terdaftar sebagai <strong>{session.role} ({session.name})</strong>.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 text-left space-y-1">
          <div className="font-bold text-slate-800">Menu yang Sesuai untuk Anda:</div>
          {session.role === 'MAHASANTRI' && (
            <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
              <li>Pilih Kamar &amp; Ranjang Sesuai SK</li>
              <li>Unduh / Cetak E-Tiket Boarding Pass Barcode</li>
            </ul>
          )}
          {session.role === 'PENGURUS' && (
            <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
              <li>Scanner Barcode Mahasantri Lantai {session.floorAssigned || ''}</li>
              <li>Pemeriksaan Barang Bawaan &amp; Serah Terima Kunci</li>
            </ul>
          )}
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          {session.role === 'MAHASANTRI' && (
            <Link
              href="/daftar"
              className="py-3 bg-uin-primary hover:bg-uin-secondary text-white font-bold text-xs rounded-xl shadow"
            >
              Buka Portal Pemilihan Kamar
            </Link>
          )}

          {session.role === 'PENGURUS' && (
            <Link
              href="/scanner"
              className="py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow"
            >
              Buka Scanner Lorong Lantai
            </Link>
          )}

          <Link
            href="/login"
            className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200"
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
