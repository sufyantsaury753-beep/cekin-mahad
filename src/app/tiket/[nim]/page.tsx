'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MahadStore } from '@/lib/store';
import { Mahasantri } from '@/lib/types';
import BoardingPassCard from '@/components/ticket/BoardingPassCard';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, BedDouble } from 'lucide-react';

export default function DetailTiketPage() {
  const params = useParams();
  const router = useRouter();
  const nim = params?.nim as string;

  const [mahasantri, setMahasantri] = useState<Mahasantri | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (nim) {
      const data = MahadStore.getMahasantriByNim(decodeURIComponent(nim));
      setMahasantri(data || null);
      setLoading(false);
    }
  }, [nim]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-slate-500">
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
          Mahasantri dengan NIM <strong className="text-slate-700">{nim}</strong> belum terdaftar atau salah memasukkan NIM.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/tiket"
            className="px-5 py-2.5 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-900"
          >
            Cari Ulang NIM
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
      
      <div className="flex items-center justify-between no-print">
        <Link
          href="/tiket"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-uin-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cari Tiket Lain</span>
        </Link>

        <span className="text-xs text-slate-400">ID Tiket: {mahasantri.id}</span>
      </div>

      <BoardingPassCard mahasantri={mahasantri} />

    </div>
  );
}
