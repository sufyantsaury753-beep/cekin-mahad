'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MahadStore, MahadAuth } from '@/lib/store';
import { UserSession, Mahasantri } from '@/lib/types';
import BoardingPassCard from '@/components/ticket/BoardingPassCard';
import Link from 'next/link';
import { QrCode, Search, AlertCircle, ArrowRight, BedDouble, ShieldCheck, User } from 'lucide-react';

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

  const mhsList = typeof window !== 'undefined' ? MahadStore.getMahasantriList() : [];

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
        Memuat E-Tiket...
      </div>
    );
  }

  // 1. TAMPILAN KHUSUS MAHASANTRI YANG SUDAH LOGIN
  if (session && session.role === 'MAHASANTRI') {
    if (personalTiket) {
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="text-center space-y-1 no-print">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-uin-primary bg-uin-primary/10 px-3 py-1 rounded-full inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> E-Tiket Resmi Mahasantri
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-800">
              E-Tiket &amp; Kartu Penempatan Kamar
            </h1>
            <p className="text-xs text-slate-500">
              Tunjukkan barcode ini kepada Mudabbir / Pengurus saat tiba di asrama Ma&apos;had.
            </p>
          </div>

          <BoardingPassCard mahasantri={personalTiket} />
        </div>
      );
    }

    // Jika mahasantri login tapi belum memilih kamar
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
          <BedDouble className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-bold text-slate-800">Belum Memilih Kamar</h2>
          <p className="text-sm text-slate-600">
            Halo, <strong>{session.name}</strong> ({session.identifier})! Anda belum memilih kamar &amp; ranjang asrama.
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Silakan pilih kamar mandiri terlebih dahulu untuk mengaktifkan E-Tiket dan Barcode Check-In Anda.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/daftar"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-uin-primary hover:bg-uin-secondary text-white font-bold text-sm rounded-xl shadow-md transition-all"
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-uin-primary/10 rounded-2xl flex items-center justify-center text-uin-primary mx-auto">
          <QrCode className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-800">
          Cari &amp; Buka E-Tiket Mahasantri
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Masukkan <strong>NISN</strong> (untuk Mahasantri Baru) atau <strong>NIM</strong> (untuk Perpanjangan) yang terdaftar di Surat Keputusan (SK) Resmi Ma&apos;had.
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nomor Induk Mahasiswa (NIM) atau NISN
            </label>
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ketik NISN / NIM Mahasantri..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:ring-2 focus:ring-uin-primary/30 outline-none font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-uin-primary hover:bg-uin-secondary text-white font-bold text-sm rounded-xl shadow-md transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Tampilkan E-Tiket</span>
          </button>
        </form>
      </div>

      {/* Tautan ke Formulir Pemilihan Kamar */}
      <div className="text-center pt-2">
        <Link
          href="/daftar"
          className="text-xs text-uin-primary hover:underline font-semibold inline-flex items-center gap-1"
        >
          <BedDouble className="w-3.5 h-3.5" />
          <span>Belum memilih kamar? Klik di sini untuk memilih kamar</span>
        </Link>
      </div>

    </div>
  );
}
