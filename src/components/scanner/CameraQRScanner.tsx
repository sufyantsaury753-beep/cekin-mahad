'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { MahadStore } from '@/lib/store';
import { Mahasantri } from '@/lib/types';
import { ATURAN_BARANG, SK_INFO } from '@/lib/constants';
import confetti from 'canvas-confetti';
import {
  Camera,
  Search,
  CheckCircle,
  AlertTriangle,
  User,
  MapPin,
  ShieldCheck,
  Key,
  X,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export default function CameraQRScanner() {
  const [scannerActive, setScannerActive] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [scannedMahasantri, setScannedMahasantri] = useState<Mahasantri | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [petugasNama, setPetugasNama] = useState('Ustadz Pengurus Lantai');
  const [catatanBarang, setCatatanBarang] = useState('Pemeriksaan barang sesuai SOP Ma\'had.');
  const [isProcessing, setIsProcessing] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader-container';

  // Start Camera Scanner
  const startScanner = async () => {
    try {
      setErrorMessage(null);
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' }, // Back camera by default
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScannedData(decodedText);
        },
        (error) => {
          // ignore scan frame errors
        }
      );

      setScannerActive(true);
    } catch (err: any) {
      console.error('Camera error:', err);
      setErrorMessage(
        'Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan atau gunakan opsi pencarian manual NISN/NIM di bawah.'
      );
      setScannerActive(false);
    }
  };

  // Stop Camera Scanner
  const stopScanner = async () => {
    if (html5QrCodeRef.current && scannerActive) {
      try {
        await html5QrCodeRef.current.stop();
        setScannerActive(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Process Scanned Data (Token, NIM, or NISN)
  const handleScannedData = (text: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Try finding by QR token or NIM/NISN
    let mhs = MahadStore.getMahasantriByQr(text);
    if (!mhs) {
      mhs = MahadStore.getMahasantriByNimNisn(text);
    }

    // Also check if text has format QR-MAHAD-{nimNisn}-...
    if (!mhs && text.includes('QR-MAHAD-')) {
      const parts = text.split('-');
      if (parts.length >= 3) {
        const idQuery = parts[2];
        mhs = MahadStore.getMahasantriByNimNisn(idQuery);
      }
    }

    if (mhs) {
      setScannedMahasantri(mhs);
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(100);
      }
    } else {
      setErrorMessage(`Data QR / Barcode tidak dikenali: "${text}". Pastikan kode berasal dari sistem resmi Ma'had.`);
    }
  };

  // Handle Manual Search
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleScannedData(manualInput.trim());
  };

  // Confirm Check-In
  const handleConfirmCheckIn = () => {
    if (!scannedMahasantri) return;
    setIsProcessing(true);

    const result = MahadStore.confirmCheckIn(
      scannedMahasantri.nimNisn,
      petugasNama,
      catatanBarang
    );

    setIsProcessing(false);

    if (result.success && result.mahasantri) {
      setScannedMahasantri(result.mahasantri);
      setSuccessMessage(`Check-in Mahasantri ${result.mahasantri.nama} BERHASIL! Kunci Kamar ${result.mahasantri.nomorKamar} dapat diserahkan.`);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      setErrorMessage(result.error || 'Gagal melakukan check-in.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Scanner Control Panel */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Camera className="w-5 h-5 text-uin-primary" />
              Scanner Kamera E-Checkin Pengurus
            </h2>
            <p className="text-xs text-slate-500">
              Arahkan kamera HP ke E-Tiket Mahasantri saat tiba di lorong lantai Anda (Jadwal: {SK_INFO.jadwal}).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!scannerActive ? (
              <button
                type="button"
                onClick={startScanner}
                className="flex items-center gap-2 px-4 py-2 bg-uin-primary text-white font-semibold text-xs sm:text-sm rounded-xl hover:bg-uin-secondary shadow transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Buka Kamera Scanner</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopScanner}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white font-semibold text-xs sm:text-sm rounded-xl hover:bg-rose-700 shadow transition-all"
              >
                <X className="w-4 h-4" />
                <span>Tutup Kamera</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Camera Viewfinder Box */}
        <div
          id={scannerContainerId}
          className={`w-full max-w-sm mx-auto overflow-hidden rounded-2xl border-2 transition-all ${
            scannerActive ? 'border-uin-primary shadow-lg bg-black min-h-[300px]' : 'hidden'
          }`}
        ></div>

        {/* Manual NISN / NIM Search Fallback */}
        <div className="pt-2">
          <form onSubmit={handleManualSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Atau ketik NISN / NIM / Token Barcode manual..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-uin-primary/30 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl hover:bg-slate-900 transition-all shrink-0"
            >
              Cari Mahasantri
            </button>
          </form>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs sm:text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-800 text-xs sm:text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* Scanned Mahasantri Verification Detail Modal/Card */}
      {scannedMahasantri && (
        <div className="bg-white rounded-3xl p-6 border-2 border-uin-primary shadow-xl space-y-6">
          
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-uin-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-uin-primary uppercase tracking-wider">Hasil Verifikasi Barcode</span>
                <h3 className="font-bold text-lg text-slate-800">Detail Mahasantri</h3>
              </div>
            </div>

            <button
              onClick={() => setScannedMahasantri(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile & Kamar Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Mahasantri Identity */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 md:col-span-2">
              <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                {scannedMahasantri.pasFotoUrl ? (
                  <img
                    src={scannedMahasantri.pasFotoUrl}
                    alt={scannedMahasantri.nama}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-slate-400 m-auto mt-6" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-slate-900">{scannedMahasantri.nama}</h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    {scannedMahasantri.jenisPendaftaran}
                  </span>
                </div>
                <p className="text-xs font-mono font-bold text-emerald-800">NIM / NISN: {scannedMahasantri.nimNisn}</p>
                <p className="text-xs text-slate-600">{scannedMahasantri.jurusan} &bull; {scannedMahasantri.fakultas}</p>
                <p className="text-xs text-slate-500">WA: {scannedMahasantri.noWa} | Wali: {scannedMahasantri.namaWali} ({scannedMahasantri.noWaWali})</p>
              </div>
            </div>

            {/* Room Allocation Info */}
            <div className="bg-gradient-to-br from-uin-primary to-emerald-800 text-white p-4 rounded-2xl shadow-md text-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-uin-accent">Alokasi Kamar</span>
              <div className="text-2xl font-extrabold">Kamar {scannedMahasantri.nomorKamar}</div>
              <div className="text-sm font-semibold text-emerald-200">
                Lantai {scannedMahasantri.lantai} &bull; Bed {scannedMahasantri.bedNumber}
              </div>
              <div className="text-[11px] text-emerald-100 pt-1">
                {scannedMahasantri.jajaran === 'BELAKANG'
                  ? `Jajaran Belakang (${scannedMahasantri.lantai}13 - ${scannedMahasantri.lantai}16)`
                  : `Jajaran Depan (${scannedMahasantri.lantai}09 - ${scannedMahasantri.lantai}12)`}
              </div>
            </div>

          </div>

          {/* SOP Luggage Inspection Checklist */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Pemeriksaan Barang Bawaan Sesuai SK ({SK_INFO.nomor})
            </h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              {ATURAN_BARANG.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                  <span className={`w-2 h-2 rounded-full ${item.allowed ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  <span className="font-medium">{item.item}</span>
                  <span className="text-[10px] text-slate-400 ml-auto">{item.allowed ? 'Boleh' : 'Dilarang'}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Petugas Pengurus Lantai / Mudabbir:</label>
                <input
                  type="text"
                  value={petugasNama}
                  onChange={(e) => setPetugasNama(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-uin-primary/30 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Catatan Pengecekan Barang &amp; Berkas:</label>
                <input
                  type="text"
                  value={catatanBarang}
                  onChange={(e) => setCatatanBarang(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-uin-primary/30 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Confirmation Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            {scannedMahasantri.statusCheckIn === 'CHECKED_IN' ? (
              <div className="flex items-center gap-2 text-emerald-800 bg-emerald-100 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold w-full sm:w-auto">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Sudah Check-In ({new Date(scannedMahasantri.checkInTimestamp || '').toLocaleTimeString('id-ID')})</span>
              </div>
            ) : (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmCheckIn}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-uin-primary to-emerald-700 text-white font-bold text-sm rounded-xl hover:from-uin-secondary hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all"
              >
                <Key className="w-5 h-5 text-uin-accent" />
                <span>{isProcessing ? 'Memproses...' : 'Konfirmasi Check-In & Serahkan Kunci'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setScannedMahasantri(null);
                setSuccessMessage(null);
                setErrorMessage(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
            >
              Scan Mahasantri Lainnya
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
