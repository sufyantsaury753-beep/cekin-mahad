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
  ShieldCheck,
  User,
  Share2,
  Globe,
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
        className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden print:shadow-none print:border print:border-slate-300 print:rounded-lg print:m-0 print:w-full page-break-avoid"
      >
        
        {/* Header Bar */}
        <div className="bg-slate-900 border-b border-slate-800 text-white p-5 sm:p-6 print:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-white p-1 border border-slate-700 shrink-0 flex items-center justify-center">
                <img
                  src="/logo-mahad.png"
                  alt="Logo Ma'had UINSSC"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase block">
                  E-TIKET &amp; BOARDING PASS MA&apos;HAD
                </span>
                <h1 className="font-bold text-base sm:text-lg text-white leading-tight">
                  UPT MA&apos;HAD AL-JAMI&apos;AH
                </h1>
                <p className="text-xs text-slate-300">
                  UIN Siber Syekh Nurjati Cirebon &bull; {mahasantri.skNomor || 'SK Penerimaan Mahasantri'}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="shrink-0">
              {isCheckedIn ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CHECKED IN</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-700/60">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>SIAP CHECK-IN</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Body Pass */}
        <div className="p-5 sm:p-6 print:p-5 space-y-4 sm:space-y-5">
          
          {/* Identity Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 pb-4 border-b border-slate-200">
            <div className="w-20 h-24 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 shrink-0 flex items-center justify-center">
              {mahasantri.pasFotoUrl ? (
                <img
                  src={mahasantri.pasFotoUrl}
                  alt={mahasantri.nama}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-9 h-9 text-slate-400" />
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-lg font-bold text-slate-900">{mahasantri.nama}</h2>
                <span className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md border border-slate-200">
                  {mahasantri.jenisPendaftaran}
                </span>
                {mahasantri.isInternasional && (
                  <span className="bg-blue-50 text-blue-700 text-[11px] font-medium px-2 py-0.5 rounded-md border border-blue-200 inline-flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    <span>{mahasantri.asalNegara || 'Internasional'}</span>
                  </span>
                )}
              </div>
              
              <div className="text-xs font-mono font-medium text-slate-700">
                NIM / NISN: <span className="bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-900 border border-slate-200">{mahasantri.nimNisn}</span>
              </div>
              <p className="text-xs text-slate-600">
                {getShortJurusan(mahasantri.jurusan, mahasantri.fakultas)} &bull; {mahasantri.fakultas}
              </p>
              <div className="text-xs text-slate-500 pt-0.5">
                <span>WhatsApp: {mahasantri.noWa}</span>
              </div>
            </div>
          </div>

          {/* Room Allocation Box */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-uin-primary" />
              <span>Alokasi Kamar &amp; Ranjang Asrama</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="bg-white p-3 rounded-md border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gedung</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 truncate block">
                  {mahasantri.gedung || (mahasantri.jenisKelamin === 'L' ? "Ma'had Jadid" : "Ma'had Qodim")}
                </span>
              </div>
              <div className="bg-white p-3 rounded-md border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Lantai</span>
                <span className="text-xs sm:text-sm font-bold text-uin-primary block">
                  Lantai {mahasantri.lantai}
                </span>
              </div>
              <div className="bg-white p-3 rounded-md border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Kamar</span>
                <span className="text-base sm:text-lg font-bold font-mono text-slate-900 block">
                  {mahasantri.nomorKamar}
                </span>
              </div>
              <div className="bg-white p-3 rounded-md border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ranjang</span>
                <span className="text-base sm:text-lg font-bold font-mono text-uin-primary block">
                  Bed {mahasantri.bedNumber}
                </span>
              </div>
            </div>

            <div className="text-center text-xs text-slate-600 bg-white py-1.5 px-3 rounded-md border border-slate-200">
              Posisi Kamar: <span className="font-semibold text-slate-900">
                {mahasantri.jajaran === 'BELAKANG'
                  ? `Jajaran Belakang (Kamar ${mahasantri.lantai}13 - ${mahasantri.lantai}16)`
                  : `Jajaran Depan (Kamar ${mahasantri.lantai}09 - ${mahasantri.lantai}12)`}
              </span>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-white border border-slate-200">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-uin-primary" />
                <span>Barcode Check-In Mandiri (Hari-H)</span>
              </span>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Tunjukkan barcode ini langsung kepada Petugas/Pengurus di <strong className="text-slate-800 font-semibold">Lantai {mahasantri.lantai} Lorong Kamar {mahasantri.nomorKamar}</strong> pada jadwal kedatangan resmi.
              </p>
              <span className="text-[11px] font-mono text-slate-400 pt-0.5">
                Token: {mahasantri.qrCodeToken || mahasantri.qrToken || `QR-MAHAD-${mahasantri.nimNisn}`}
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 shrink-0 flex flex-col items-center">
              <QRCodeSVG
                value={mahasantri.qrCodeToken || mahasantri.qrToken || `QR-MAHAD-${mahasantri.nimNisn}`}
                size={112}
                level="H"
                includeMargin={false}
              />
              <span className="text-[10px] font-mono text-slate-600 mt-1.5 font-bold uppercase tracking-wider">
                Lt. {mahasantri.lantai} Lorong
              </span>
            </div>
          </div>

          {/* If Checked In: Show Timestamp & Staff */}
          {isCheckedIn && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 text-xs text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Telah Check-In &amp; Kunci Kamar Diserahkan</span>
              </div>
              <p>Waktu: {new Date(mahasantri.checkInTimestamp || '').toLocaleString('id-ID')}</p>
              <p>Petugas Verifikator: {mahasantri.petugasCheckIn || mahasantri.checkedInBy || 'Mudabbir / Pengurus'}</p>
              {(mahasantri.catatanBarangCheckIn || mahasantri.catatanBarang) && (
                <p>Catatan Bawaan: {mahasantri.catatanBarangCheckIn || mahasantri.catatanBarang}</p>
              )}
            </div>
          )}

        </div>

        {/* Footer info inside card */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Tgl Terbit: {new Date(mahasantri.createdAt || mahasantri.registeredAt || Date.now()).toLocaleDateString('id-ID')}</span>
          <span>معـهـدي جنـتـي &bull; {SK_INFO.mudir}</span>
        </div>

      </div>

      {/* Action Buttons (Hidden when printing) */}
      <div className="flex flex-wrap items-center justify-center gap-3 no-print pt-2">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-medium text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Simpan PDF</span>
        </button>

        <button
          onClick={handleShareWa}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-medium text-xs sm:text-sm rounded-lg transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Bagikan ke WhatsApp</span>
        </button>
      </div>

    </div>
  );
}
