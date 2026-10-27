'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MahadStore, MahadAuth } from '@/lib/store';
import { UserSession, Mahasantri } from '@/lib/types';
import BoardingPassCard from '@/components/ticket/BoardingPassCard';
import Link from 'next/link';
import { QrCode, Search, AlertCircle, BedDouble, ShieldCheck } from 'lucide-react';

export default function SearchTiketPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [personalTiket, setPersonalTiket] = useState<Mahasantri | null>(null);
  const [inputQuery, setInputQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentSession = MahadAuth.getSession();
    setSession(currentSession);

    if (currentSession && currentSession.role === 'MAHASANTRI') {
      const myTiket = MahadStore.getMahasantriByNimNisn(currentSession.identifier);
      setPersonalTiket(myTiket || null);
    }
    setLoading(false);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!inputQuery.trim()) {
      setError('Masukkan NIM atau NISN terlebih dahulu.');
      return;
    }

    const mhs = MahadStore.getMahasantriByNimNisn(inputQuery.trim());
    if (mhs) {
      router.push(`/tiket/${encodeURIComponent(mhs.nimNisn)}`);
    } else {
      setError(
        `E-Tiket untuk NIM/NISN "${inputQuery}" belum terdaftar. Pastikan mahasantri sudah mengisi formulir pendaftaran dan memilih kamar.`
      );
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-slate-400 text-sm">
        Memuat data E-Tiket...
      </div>
    );
  }

  // 1. TAMPILAN KHUSUS MAHASANTRI YANG SUDAH LOGIN
  if (session && session.role === 'MAHASANTRI') {
    if (personalTiket) {
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="text-center space-y-1.5 no-print">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-uin-primary" />
              <span>E-Tiket Resmi Mahasantri</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              E-Tiket &amp; Kartu Penempatan Kamar
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tunjukkan barcode ini kepada Mudabbir / Pengurus saat tiba di asrama Ma&apos;had.
            </p>
          </div>

          <BoardingPassCard mahasantri={personalTiket} />
        </div>
      );
    }

    // Jika mahasantri login tapi belum memilih kamar
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
          <BedDouble className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900">Belum Memilih Kamar</h2>
          <p className="text-xs text-slate-600">
            Halo, <strong className="text-slate-800">{session.name}</strong> ({session.identifier}). Anda belum memilih kamar &amp; ranjang asrama.
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Silakan pilih kamar mandiri terlebih dahulu untuk mengaktifkan E-Tiket dan Barcode Check-In Anda.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/daftar"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-medium text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
          >
            <BedDouble className="w-4 h-4" />
            <span>Pilih Kamar &amp; Ranjang Sekarang</span>
          </Link>
        </div>
      </div>
    );
  }

  // 2. TAMPILAN ADMIN / PENGURUS / UMUM
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-50 text-uin-primary border border-emerald-100 rounded-lg flex items-center justify-center mx-auto">
          <QrCode className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Cari &amp; Buka E-Tiket Mahasantri
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Masukkan <strong>NISN</strong> (Mahasantri Baru) atau <strong>NIM</strong> (Perpanjangan) yang terdaftar di Surat Keputusan (SK) Resmi Ma&apos;had.
        </p>
      </div>

      {/* Search Box Card */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nomor Induk Mahasiswa (NIM) atau NISN
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ketik NISN / NIM Mahasantri..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-uin-primary focus:border-uin-primary font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-medium text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Tampilkan E-Tiket</span>
          </button>
        </form>
      </div>

      {/* Tautan ke Formulir Pemilihan Kamar */}
      <div className="text-center pt-1">
        <Link
          href="/daftar"
          className="text-xs text-uin-primary hover:underline font-medium inline-flex items-center gap-1.5"
        >
          <BedDouble className="w-3.5 h-3.5" />
          <span>Belum memilih kamar? Klik di sini untuk memilih kamar</span>
        </Link>
      </div>

    </div>
  );
}
