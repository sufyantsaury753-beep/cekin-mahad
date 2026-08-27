'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Mahasantri } from '@/lib/types';
import { SK_INFO } from '@/lib/constants';
import {
  Building2,
  Printer,
  CheckCircle,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  User,
  Share2,
} from 'lucide-react';

interface BoardingPassCardProps {
  mahasantri: Mahasantri;
}

export default function BoardingPassCard({ mahasantri }: BoardingPassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const isCheckedIn = mahasantri.statusCheckIn === 'CHECKED_IN';

  const handlePrint = () => {
    window.print();
  };

  const handleShareWa = () => {
    const text = `*KARTU CHECK-IN DIGITAL MA'HAD UIN SIBER SYEKH NURJATI*\nNama: ${mahasantri.nama}\nNIM/NISN: ${mahasantri.nimNisn} (${mahasantri.jenisPendaftaran})\nKamar: ${mahasantri.nomorKamar} (Lt. ${mahasantri.lantai})\nBed: No. ${mahasantri.bedNumber}\nStatus: ${isCheckedIn ? 'SUDAH CHECK-IN' : 'SIAP CHECK-IN'}\n\nLihat Tiket Online: ${window.location.origin}/tiket/${mahasantri.nimNisn}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      
      {/* Boarding Pass Container */}
      <div
        ref={cardRef}
        className="bg-white rounded-3xl border-2 border-emerald-800/20 shadow-xl overflow-hidden print:shadow-none print:border print:m-0"
      >
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-uin-dark via-uin-primary to-emerald-800 text-white p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-uin-accent/10 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur border border-white/20 p-2 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-uin-accent" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider text-uin-accent uppercase block">
                  E-TIKET &amp; BOARDING PASS MA&apos;HAD
                </span>
                <h1 className="font-serif font-bold text-lg sm:text-xl text-white">
                  UPT MA&apos;HAD AL-JAMI&apos;AH
                </h1>
                <p className="text-xs text-emerald-200">UIN Siber Syekh Nurjati Cirebon &bull; SK {SK_INFO.nomor}</p>
              </div>
            </div>

            {/* Status Pill */}
            <div className="text-right">
              {isCheckedIn ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow">
                  <CheckCircle className="w-3.5 h-3.5" /> CHECKED IN
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-900 shadow">
                  <Clock className="w-3.5 h-3.5" /> SIAP CHECK-IN
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Body Pass */}
        <div className="p-5 sm:p-7 space-y-6">
          
          {/* Identity Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100">
            <div className="w-24 h-28 rounded-2xl overflow-hidden bg-slate-100 border-2 border-emerald-700/20 shadow-sm shrink-0 flex items-center justify-center">
              {mahasantri.pasFotoUrl ? (
                <img
                  src={mahasantri.pasFotoUrl}
                  alt={mahasantri.nama}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold text-slate-800">{mahasantri.nama}</h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  {mahasantri.jenisPendaftaran}
                </span>
                {mahasantri.isInternasional && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {mahasantri.asalNegara || 'Internasional'}
                  </span>
                )}
              </div>
              
              <div className="text-xs font-mono font-bold text-emerald-800">
                NIM / NISN: <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-900">{mahasantri.nimNisn}</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {mahasantri.jurusan} &bull; {mahasantri.fakultas}
              </p>
              <div className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                <span>WhatsApp: {mahasantri.noWa}</span>
              </div>
            </div>
          </div>

          {/* Large Room Allocation Card */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 rounded-2xl p-4 sm:p-5 border border-emerald-200">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Alokasi Kamar &amp; Ranjang
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200/60 shadow-sm">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Gedung</span>
                <span className="text-sm font-bold text-slate-800">{mahasantri.jenisKelamin === 'L' ? 'Ma\'had Qodim' : 'Ma\'had Jadid'}</span>
              </div>
              <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200/60 shadow-sm">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Lantai</span>
                <span className="text-base font-bold text-emerald-700">Lantai {mahasantri.lantai}</span>
              </div>
              <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200/60 shadow-sm">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Nomor Kamar</span>
                <span className="text-xl font-extrabold text-uin-primary">Kamar {mahasantri.nomorKamar}</span>
              </div>
              <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200/60 shadow-sm">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Nomor Ranjang</span>
                <span className="text-xl font-extrabold text-amber-600">Bed {mahasantri.bedNumber}</span>
              </div>
            </div>

            <div className="mt-3 text-center text-xs font-medium text-emerald-900 bg-white/60 py-1.5 px-3 rounded-lg border border-emerald-200/50">
              Posisi: <span className="font-bold">
                {mahasantri.jajaran === 'BELAKANG'
                  ? `Jajaran Belakang (Kamar ${mahasantri.lantai}13 - ${mahasantri.lantai}16)`
                  : `Jajaran Depan (Kamar ${mahasantri.lantai}09 - ${mahasantri.lantai}12)`}
              </span>
            </div>
          </div>

          {/* QR Code Section (Desentralisasi Checkin) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Barcode Check-in Mandiri (Hari-H)
              </span>
              <p className="text-xs text-slate-500 max-w-xs">
                Tunjukkan QR ini langsung ke Pengurus di <strong className="text-slate-700">Lantai {mahasantri.lantai} Lorong Kamar {mahasantri.nomorKamar}</strong> pada jadwal 19–21 Agustus 2026.
              </p>
              <span className="text-[10px] font-mono text-slate-400 pt-1">
                Token: {mahasantri.qrToken}
              </span>
            </div>

            <div className="p-3 bg-white rounded-2xl border-2 border-slate-300 shadow-sm shrink-0 flex flex-col items-center">
              <QRCodeSVG
                value={mahasantri.qrToken}
                size={130}
                level="H"
                includeMargin={false}
              />
              <span className="text-[9px] font-mono text-slate-500 mt-1.5 font-bold">SCAN DI LANTAI {mahasantri.lantai}</span>
            </div>
          </div>

          {/* If Checked In: Show Timestamp & Staff */}
          {isCheckedIn && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Telah Check-In &amp; Kunci Diserahkan
              </div>
              <p>Waktu: {new Date(mahasantri.checkInTimestamp || '').toLocaleString('id-ID')}</p>
              <p>Petugas Lantai: {mahasantri.checkedInBy || 'Pengurus Kamar'}</p>
              {mahasantri.catatanBarang && <p>Catatan: {mahasantri.catatanBarang}</p>}
            </div>
          )}

        </div>

        {/* Footer info inside card */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Tgl Terbit: {new Date(mahasantri.registeredAt).toLocaleDateString('id-ID')}</span>
          <span>معـهـدي جنـتـي &bull; {SK_INFO.mudir}</span>
        </div>

      </div>

      {/* Action Buttons (Hidden when printing) */}
      <div className="flex flex-wrap items-center justify-center gap-3 no-print pt-2">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-uin-primary text-white font-semibold text-sm rounded-xl hover:bg-uin-secondary shadow-md transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Simpan PDF</span>
        </button>

        <button
          onClick={handleShareWa}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold text-sm rounded-xl hover:bg-emerald-700 shadow-md transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>Bagikan ke WhatsApp</span>
        </button>
      </div>

    </div>
  );
}
