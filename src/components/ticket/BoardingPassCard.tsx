'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Mahasantri } from '@/lib/types';
import { SK_INFO, getShortJurusan } from '@/lib/constants';
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
    <div className="space-y-4 max-w-2xl mx-auto page-break-avoid">
      
      {/* Boarding Pass Container */}
      <div
        ref={cardRef}
        className="bg-white rounded-3xl border-2 border-emerald-800/20 shadow-xl overflow-hidden print:shadow-none print:border print:border-emerald-800/30 print:rounded-2xl print:m-0 print:w-full page-break-avoid"
      >
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-uin-dark via-uin-primary to-emerald-800 text-white p-5 sm:p-6 print:p-3.5 print:py-3 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-uin-accent/10 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3 print:gap-2.5">
              <div className="w-12 h-12 print:w-10 print:h-10 rounded-full overflow-hidden bg-white p-0.5 border-2 border-white/40 shadow-sm shrink-0 flex items-center justify-center">
                <img
                  src="/logo-mahad.png"
                  alt="Logo Ma'had UINSSC"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-[10px] print:text-[8px] font-bold tracking-wider text-uin-accent uppercase block">
                  E-TIKET &amp; BOARDING PASS MA&apos;HAD
                </span>
                <h1 className="font-serif font-bold text-lg sm:text-xl print:text-base text-white leading-tight">
                  UPT MA&apos;HAD AL-JAMI&apos;AH
                </h1>
                <p className="text-xs print:text-[10px] text-emerald-200">UIN Siber Syekh Nurjati Cirebon &bull; SK {SK_INFO.nomor}</p>
              </div>
            </div>

            {/* Status Pill */}
            <div className="text-right shrink-0">
              {isCheckedIn ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 print:py-0.5 print:px-2 rounded-full text-xs print:text-[10px] font-bold bg-emerald-500 text-white shadow">
                  <CheckCircle className="w-3.5 h-3.5 print:w-3 print:h-3" /> CHECKED IN
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 print:py-0.5 print:px-2 rounded-full text-xs print:text-[10px] font-bold bg-amber-400 text-slate-900 shadow">
                  <Clock className="w-3.5 h-3.5 print:w-3 print:h-3" /> SIAP CHECK-IN
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Body Pass */}
        <div className="p-5 sm:p-7 print:p-4 print:space-y-3 space-y-5">
          
          {/* Identity Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 print:gap-3.5 pb-5 print:pb-3 border-b border-slate-100">
            <div className="w-24 h-28 print:w-16 print:h-20 rounded-2xl print:rounded-xl overflow-hidden bg-slate-100 border-2 border-emerald-700/20 shadow-sm shrink-0 flex items-center justify-center">
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

            <div className="flex-1 text-center sm:text-left space-y-1 print:space-y-0.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl print:text-base font-bold text-slate-800">{mahasantri.nama}</h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] print:text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  {mahasantri.jenisPendaftaran}
                </span>
                {mahasantri.isInternasional && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] print:text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {mahasantri.asalNegara || 'Internasional'}
                  </span>
                )}
              </div>
              
              <div className="text-xs print:text-[11px] font-mono font-bold text-emerald-800">
                NIM / NISN: <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-900">{mahasantri.nimNisn}</span>
              </div>
              <p className="text-xs print:text-[11px] text-slate-600 font-medium">
                {getShortJurusan(mahasantri.jurusan, mahasantri.fakultas)} &bull; {mahasantri.fakultas}
              </p>
              <div className="text-xs print:text-[10px] text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                <span>WhatsApp: {mahasantri.noWa}</span>
              </div>
            </div>
          </div>

          {/* Room Allocation Card */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 rounded-2xl print:rounded-xl p-4 sm:p-5 print:p-2.5 border border-emerald-200">
            <div className="text-xs print:text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-2.5 print:mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 print:w-3.5 print:h-3.5 text-emerald-600" />
              Alokasi Kamar &amp; Ranjang
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:gap-2 text-center">
              <div className="bg-white/90 p-2.5 print:p-1.5 rounded-xl border border-emerald-200/60 shadow-sm">
                <span className="text-[10px] print:text-[8px] text-slate-500 uppercase font-semibold block">Gedung</span>
                <span className="text-sm print:text-xs font-bold text-slate-800">{mahasantri.gedung || (mahasantri.jenisKelamin === 'L' ? "Ma'had Jadid" : "Ma'had Qodim")}</span>
              </div>
              <div className="bg-white/90 p-2.5 print:p-1.5 rounded-xl border border-emerald-200/60 shadow-sm">
                <span className="text-[10px] print:text-[8px] text-slate-500 uppercase font-semibold block">Lantai</span>
                <span className="text-base print:text-xs font-bold text-emerald-700">Lantai {mahasantri.lantai}</span>
              </div>
              <div className="bg-white/90 p-2.5 print:p-1.5 rounded-xl border border-emerald-200/60 shadow-sm">
                <span className="text-[10px] print:text-[8px] text-slate-500 uppercase font-semibold block">Nomor Kamar</span>
                <span className="text-xl print:text-sm font-extrabold text-uin-primary">Kamar {mahasantri.nomorKamar}</span>
              </div>
              <div className="bg-white/90 p-2.5 print:p-1.5 rounded-xl border border-emerald-200/60 shadow-sm">
                <span className="text-[10px] print:text-[8px] text-slate-500 uppercase font-semibold block">Nomor Ranjang</span>
                <span className="text-xl print:text-sm font-extrabold text-amber-600">Bed {mahasantri.bedNumber}</span>
              </div>
            </div>

            <div className="mt-2.5 print:mt-1.5 text-center text-xs print:text-[10px] font-medium text-emerald-900 bg-white/60 py-1.5 print:py-1 px-3 rounded-lg border border-emerald-200/50">
              Posisi: <span className="font-bold">
                {mahasantri.jajaran === 'BELAKANG'
                  ? `Jajaran Belakang (Kamar ${mahasantri.lantai}13 - ${mahasantri.lantai}16)`
                  : `Jajaran Depan (Kamar ${mahasantri.lantai}09 - ${mahasantri.lantai}12)`}
              </span>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:gap-3 p-3.5 print:p-2.5 rounded-2xl print:rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
              <span className="text-xs print:text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 print:w-3.5 print:h-3.5 text-emerald-600" />
                Barcode Check-in Mandiri (Hari-H)
              </span>
              <p className="text-xs print:text-[10px] text-slate-500 max-w-xs">
                Tunjukkan QR ini langsung ke Pengurus di <strong className="text-slate-700">Lantai {mahasantri.lantai} Lorong Kamar {mahasantri.nomorKamar}</strong> pada jadwal 19–21 Agustus 2026.
              </p>
              <span className="text-[10px] print:text-[8px] font-mono text-slate-400 pt-0.5">
                Token: {mahasantri.qrCodeToken || mahasantri.qrToken || `QR-MAHAD-${mahasantri.nimNisn}`}
              </span>
            </div>

            <div className="p-2.5 print:p-1.5 bg-white rounded-2xl print:rounded-xl border-2 border-slate-300 shadow-sm shrink-0 flex flex-col items-center">
              <QRCodeSVG
                value={mahasantri.qrCodeToken || mahasantri.qrToken || `QR-MAHAD-${mahasantri.nimNisn}`}
                size={110}
                level="H"
                includeMargin={false}
              />
              <span className="text-[9px] print:text-[8px] font-mono text-slate-500 mt-1 font-bold">SCAN DI LANTAI {mahasantri.lantai}</span>
            </div>
          </div>

          {/* If Checked In: Show Timestamp & Staff */}
          {isCheckedIn && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 print:p-2 text-xs print:text-[10px] text-emerald-900 space-y-0.5">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Telah Check-In &amp; Kunci Diserahkan
              </div>
              <p>Waktu: {new Date(mahasantri.checkInTimestamp || '').toLocaleString('id-ID')}</p>
              <p>Petugas: {mahasantri.petugasCheckIn || mahasantri.checkedInBy || 'Mudabbir / Pengurus'}</p>
              {(mahasantri.catatanBarangCheckIn || mahasantri.catatanBarang) && (
                <p>Catatan: {mahasantri.catatanBarangCheckIn || mahasantri.catatanBarang}</p>
              )}
            </div>
          )}

        </div>

        {/* Footer info inside card */}
        <div className="bg-slate-100 px-6 py-2.5 print:py-1.5 print:px-4 border-t border-slate-200 flex items-center justify-between text-[11px] print:text-[9px] text-slate-500 font-mono">
          <span>Tgl Terbit: {new Date(mahasantri.createdAt || mahasantri.registeredAt || Date.now()).toLocaleDateString('id-ID')}</span>
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
