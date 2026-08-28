'use client';

import React, { useEffect, useState, useRef } from 'react';
import jsQR from 'jsqr';
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
  Video,
  SwitchCamera,
  Upload,
} from 'lucide-react';

export default function CameraQRScanner() {
  const [scannerActive, setScannerActive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [manualInput, setManualInput] = useState('');
  const [scannedMahasantri, setScannedMahasantri] = useState<Mahasantri | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [petugasNama, setPetugasNama] = useState('Ustadz Pengurus Lantai / Mudabbir');
  const [catatanBarang, setCatatanBarang] = useState('Pemeriksaan barang sesuai SOP Ma\'had.');
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const fileCameraInputRef = useRef<HTMLInputElement>(null);

  // Process Scanned Data (Token, NIM, or NISN)
  const handleScannedData = (text: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const clean = text.trim();

    // Try finding by QR token or NIM/NISN
    let mhs = MahadStore.getMahasantriByQr(clean);
    if (!mhs) {
      mhs = MahadStore.getMahasantriByNimNisn(clean);
    }

    // Also check if text has format QR-MAHAD-{nimNisn}-...
    if (!mhs && clean.includes('QR-MAHAD-')) {
      const parts = clean.split('-');
      if (parts.length >= 3) {
        const idQuery = parts[2];
        mhs = MahadStore.getMahasantriByNimNisn(idQuery);
      }
    }

    if (mhs) {
      setScannedMahasantri(mhs);
      stopScanner(); // Pause scanner when ticket is found
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(100);
      }
    } else {
      setErrorMessage(`Data Barcode "${clean}" tidak ditemukan di database. Pastikan mahasantri telah mendaftar kamar.`);
    }
  };

  // Start Camera with jsQR continuous frame scanning
  const startScanner = async (preferredMode: 'environment' | 'user' = facingMode) => {
    try {
      setErrorMessage(null);
      setIsStarting(true);

      // Stop any existing stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: preferredMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      setScannerActive(true);
      setIsStarting(false);

      // Connect stream to video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play().then(() => {
            startJsQRScanningLoop();
          }).catch((e) => console.warn('Video play error:', e));
        }
      }, 100);
    } catch (err: any) {
      console.error('Camera stream error:', err);
      setIsStarting(false);
      setScannerActive(false);
      setErrorMessage(
        'Tidak dapat menyalakan kamera. Pastikan izin kamera telah diberikan di browser atau gunakan tombol "Jepret Foto QR (HP)".'
      );
    }
  };

  // Continuous jsQR scanning loop using canvas
  const startJsQRScanningLoop = () => {
    const scan = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState < 2) {
        animFrameIdRef.current = requestAnimationFrame(scan);
        return;
      }

      const width = video.videoWidth;
      const height = video.videoHeight;

      if (width > 0 && height > 0) {
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);

          // Decode QR using jsQR
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data && code.data.trim()) {
            handleScannedData(code.data);
            return; // Exit loop on successful detection
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(scan);
    };

    animFrameIdRef.current = requestAnimationFrame(scan);
  };

  // Stop Camera Stream
  const stopScanner = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setScannerActive(false);
    setIsStarting(false);
  };

  // Switch between back and front cameras
  const switchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (scannerActive) {
      stopScanner();
      startScanner(nextMode);
    }
  };

  // Scan from Photo File / Direct Camera Snap
  const handleScanFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleScannedData(code.data);
          } else {
            setErrorMessage('Barcode tidak terdeteksi pada foto. Pastikan posisi QR Code tegak, terang, dan tidak buram.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

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
      setSuccessMessage(
        `Check-in Mahasantri ${result.mahasantri.nama} BERHASIL! Kunci ${result.mahasantri.gedung} Kamar ${result.mahasantri.nomorKamar} dapat diserahkan.`
      );
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
      
      {/* Hidden canvas for jsQR processing & hidden file camera input */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleScanFile}
        className="hidden"
      />

      {/* Scanner Control Panel */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <Camera className="w-5 h-5 text-uin-primary" />
              Scanner Barcode E-Checkin Mudabbir &amp; Pengurus
            </h2>
            <p className="text-xs text-slate-500">
              Arahkan kamera HP ke barcode E-Tiket Mahasantri saat tiba di pos lantai check-in.
            </p>
          </div>
        </div>

        {/* Action Buttons: Live Video Stream, Switch Camera, & Direct Snap */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {!scannerActive ? (
            <button
              type="button"
              disabled={isStarting}
              onClick={() => startScanner()}
              className="flex items-center justify-center gap-2 py-3.5 px-4 bg-uin-primary hover:bg-uin-secondary text-white font-bold text-sm rounded-2xl shadow-md transition-all sm:col-span-2"
            >
              <Video className="w-5 h-5 text-uin-accent" />
              <span>{isStarting ? 'Menyiapkan Kamera...' : 'Buka Live Video Scanner'}</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={stopScanner}
                className="flex items-center justify-center gap-2 py-3.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all"
              >
                <X className="w-5 h-5" />
                <span>Tutup Kamera</span>
              </button>

              <button
                type="button"
                onClick={switchCamera}
                className="flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm rounded-2xl border border-slate-700 shadow transition-all"
              >
                <SwitchCamera className="w-4 h-4 text-uin-accent" />
                <span>Ganti Kamera ({facingMode === 'environment' ? 'Belakang' : 'Depan'})</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => fileCameraInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm rounded-2xl border border-slate-700 shadow transition-all"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Jepret / Upload Foto QR</span>
          </button>

        </div>

        {/* Live Camera Viewfinder Box (Native Video Stream + jsQR) */}
        {scannerActive && (
          <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-3xl border-4 border-uin-primary shadow-2xl bg-black aspect-square my-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Animated Target Scanning Box Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-52 h-52 border-2 border-emerald-400/80 rounded-2xl relative shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-uin-accent -mt-1 -ml-1 rounded-tl"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-uin-accent -mt-1 -mr-1 rounded-tr"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-uin-accent -mb-1 -ml-1 rounded-bl"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-uin-accent -mb-1 -mr-1 rounded-br"></div>
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse absolute top-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </div>
        )}

        {/* Manual NISN / NIM Search Fallback */}
        <div className="pt-2 border-t border-slate-100">
          <form onSubmit={handleManualSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Atau ketik NISN / NIM Mahasantri..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-uin-primary/30 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-800 text-white font-semibold text-xs rounded-xl hover:bg-slate-900 transition-all shrink-0"
            >
              Cari Data
            </button>
          </form>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs sm:text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
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
        <div className="bg-white rounded-3xl p-6 border-2 border-uin-primary shadow-xl space-y-6 animate-fade-in">
          
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
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
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
            <div className="bg-gradient-to-br from-uin-primary to-emerald-800 text-white p-4 rounded-2xl shadow text-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-uin-accent">Alokasi Kamar</span>
              <div className="text-xl font-extrabold">{scannedMahasantri.gedung}</div>
              <div className="text-2xl font-black">Kamar {scannedMahasantri.nomorKamar}</div>
              <div className="text-xs font-semibold text-emerald-200">
                Lantai {scannedMahasantri.lantai} &bull; Bed {scannedMahasantri.bedNumber}
              </div>
            </div>

          </div>

          {/* SOP Luggage Inspection Checklist */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Pemeriksaan Barang Bawaan Sesuai SOP Ma&apos;had
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
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Petugas Pengurus / Mudabbir:</label>
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
                startScanner();
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
