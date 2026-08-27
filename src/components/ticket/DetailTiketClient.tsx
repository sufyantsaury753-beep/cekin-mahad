'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MahadStore } from '@/lib/store';
import { Mahasantri } from '@/lib/types';
import BoardingPassCard from '@/components/ticket/BoardingPassCard';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-slate-500 text-sm">
        Memuat E-Tiket Mahasantri...
      </div>
    );
  }

  if (!mahasantri) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">E-Tiket Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">
          Mahasantri dengan NIM/NISN <strong className="text-slate-700">{decodeURIComponent(nimNisn)}</strong> belum memilih kamar atau salah memasukkan identitas.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/tiket"
            className="px-5 py-2.5 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-900"
          >
            Cari Ulang NIM / NISN
          </Link>
          <Link
            href="/daftar"
            className="px-5 py-2.5 bg-uin-primary text-white text-xs font-semibold rounded-xl hover:bg-uin-secondary"
          >
            Pilih Kamar &amp; Daftar Baru
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back Button */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          <Link
            href="/tiket"
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
          >
            Cari E-Tiket Lain
          </Link>
        </div>
      </div>

      {/* Boarding Pass Ticket Card */}
      <BoardingPassCard mahasantri={mahasantri} />

    </div>
  );
}
