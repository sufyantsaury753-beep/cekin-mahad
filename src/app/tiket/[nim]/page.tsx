import React, { Suspense } from 'react';
import DetailTiketClient from '@/components/ticket/DetailTiketClient';

interface PageProps {
  params: Promise<{ nim: string }>;
}

export default async function DetailTiketPage({ params }: PageProps) {
  const resolvedParams = await params;
  const nimNisn = resolvedParams?.nim || '';

  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto py-20 text-center text-slate-500 text-sm">Memuat E-Tiket Mahasantri...</div>}>
      <DetailTiketClient nimNisn={nimNisn} />
    </Suspense>
  );
}
