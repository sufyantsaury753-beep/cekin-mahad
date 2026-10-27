'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MahadStore, MahadAuth } from '@/lib/store';
import { Mahasantri } from '@/lib/types';
import BoardingPassCard from '@/components/ticket/BoardingPassCard';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, ShieldAlert } from 'lucide-react';

interface DetailTiketClientProps {
  nimNisn: string;
}

export default function DetailTiketClient({ nimNisn }: DetailTiketClientProps) {
  const router = useRouter();
  const [mahasantri, setMahasantri] = useState<Mahasantri | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (nimNisn) {
      const data = MahadStore.getMahasantriByNimNisn(decodeURIComponent(nimNisn));
      setMahasantri(data || null);
      setLoading(false);
    }
  }, [nimNisn]);

  const session = typeof window !== 'undefined' ? MahadAuth.getSession() : null;
  const isMahasantriSession = session && session.role === 'MAHASANTRI';
  const isViewingSelf = isMahasantriSession && session.identifier.toLowerCase() === decodeURIComponent(nimNisn).toLowerCase();

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-slate-400 text-sm">
        Memuat data E-Tiket Mahasantri...
      </div>
    );
  }

  // Jika mahasantri mencoba membuka tiket santri lain
  if (isMahasantriSession && !isViewingSelf) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Akses Tiket Dibatasi</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Demi privasi dan keamanan data, Anda hanya memiliki hak akses untuk melihat E-Tiket atas nama Anda sendiri (<strong className="text-slate-800">{session.name}</strong>).
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/tiket"
            className="inline-flex items-center gap-2 px-4 py-2 bg-uin-primary text-white text-xs font-medium rounded-lg hover:bg-uin-secondary shadow-xs transition-colors"
          >
            <span>Buka E-Tiket Saya</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!mahasantri) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">E-Tiket Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500">
            Mahasantri dengan NIM/NISN <strong className="text-slate-800">{decodeURIComponent(nimNisn)}</strong> belum memilih kamar atau belum terdaftar dalam sistem.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link
            href="/tiket"
            className="w-full sm:w-auto px-4 py-2 bg-white text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 border border-slate-300 transition-colors"
          >
            Kembali ke Pencarian
          </Link>
          <Link
            href="/daftar"
            className="w-full sm:w-auto px-4 py-2 bg-uin-primary text-white text-xs font-medium rounded-lg hover:bg-uin-secondary shadow-xs transition-colors"
          >
            Pilih Kamar &amp; Daftar Baru
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back Toolbar (Only for Admin/Pengurus/Guest) */}
      {!isMahasantriSession && (
        <div className="flex items-center justify-between no-print">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>

          <Link
            href="/tiket"
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            Cari E-Tiket Lain
          </Link>
        </div>
      )}

      {/* Boarding Pass Ticket Card */}
      <BoardingPassCard mahasantri={mahasantri} />

    </div>
  );
}
