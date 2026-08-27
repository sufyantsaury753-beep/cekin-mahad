'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MahadStore } from '@/lib/store';
import Link from 'next/link';
import { QrCode, Search, AlertCircle, ArrowRight, UserCheck, BedDouble, ShieldCheck } from 'lucide-react';
import { SK_INFO } from '@/lib/constants';

export default function SearchTiketPage() {
  const router = useRouter();
  const [inputQuery, setInputQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mhsList = typeof window !== 'undefined' ? MahadStore.getMahasantriList() : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!inputQuery.trim()) {
      setError('Masukkan NIM atau NISN Anda terlebih dahulu.');
      return;
    }

    const mhs = MahadStore.getMahasantriByNimNisn(inputQuery.trim());
    if (mhs) {
      router.push(`/tiket/${encodeURIComponent(mhs.nimNisn)}`);
    } else {
      setError(
        `E-Tiket untuk NIM/NISN "${inputQuery}" belum terdaftar. Pastikan Anda sudah mengisi formulir pendaftaran dan memilih kamar.`
      );
    }
  };

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
          Masukkan <strong>NISN</strong> (untuk Maba) atau <strong>NIM</strong> (untuk Perpanjangan) yang terdaftar di SK {SK_INFO.nomor}.
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
                placeholder="Ketik NISN / NIM Anda (Contoh: 2530311086 / 0067999651)..."
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
            <span>Tampilkan E-Tiket Saya</span>
          </button>
        </form>
      </div>

      {/* Quick Sample Selector for Demo */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            Data Mahasantri Terdaftar (Klik untuk Cek Tiket Cepat):
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {mhsList.slice(0, 3).map((mhs) => (
            <Link
              key={mhs.nimNisn}
              href={`/tiket/${encodeURIComponent(mhs.nimNisn)}`}
              className="p-3 rounded-xl bg-white border border-slate-200 hover:border-uin-secondary hover:shadow-sm transition-all text-left flex flex-col justify-between"
            >
              <div>
                <span className="font-bold text-xs text-slate-800 block truncate">{mhs.nama}</span>
                <span className="text-[11px] font-mono text-emerald-700">NIM/NISN: {mhs.nimNisn}</span>
              </div>
              <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Kamar {mhs.nomorKamar} (Bed {mhs.bedNumber})</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </div>
            </Link>
          ))}
        </div>

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

    </div>
  );
}
