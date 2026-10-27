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
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-uin-primary" />
              <span>Pemindai E-Tiket Barcode Mahasantri</span>
            </h2>
            <p className="text-xs text-slate-500">
              Arahkan kamera ke barcode E-Tiket mahasantri saat tiba di meja pos lantai.
            </p>
          </div>
        </div>

        {/* Action Buttons: Live Video Stream, Switch Camera, & Direct Snap */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {!scannerActive ? (
            <button
              type="button"
              disabled={isStarting}
              onClick={() => startScanner()}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors sm:col-span-2"
            >
              <Video className="w-4 h-4" />
              <span>{isStarting ? 'Menyiapkan Kamera...' : 'Aktifkan Kamera Pemindai'}</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={stopScanner}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Tutup Kamera</span>
              </button>

              <button
                type="button"
                onClick={switchCamera}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
              >
                <SwitchCamera className="w-4 h-4 text-slate-500" />
                <span>Ganti Kamera ({facingMode === 'environment' ? 'Belakang' : 'Depan'})</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => fileCameraInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
          >
            <Camera className="w-4 h-4 text-slate-500" />
            <span>Pindai dari Foto / Berkas</span>
          </button>
        </div>

        {/* Live Camera Viewfinder Box */}
        {scannerActive && (
          <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-xl border border-slate-800 bg-black aspect-square my-3 shadow-md">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Target Scanning Box Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border border-emerald-400/60 rounded-lg relative shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400 -mt-0.5 -ml-0.5 rounded-tl"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400 -mt-0.5 -mr-0.5 rounded-tr"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400 -mb-0.5 -ml-0.5 rounded-bl"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400 -mb-0.5 -mr-0.5 rounded-br"></div>
                <div className="w-full h-px bg-emerald-400/80 animate-pulse absolute top-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </div>
        )}

        {/* Manual NISN / NIM Search Fallback */}
        <div className="pt-2 border-t border-slate-100">
          <form onSubmit={handleManualSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Atau masukkan nomor NISN / NIM Mahasantri..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:bg-white focus:border-uin-primary outline-none font-mono transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors shrink-0"
            >
              Cari Data
            </button>
          </form>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-emerald-800 text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* Scanned Mahasantri Verification Detail Card */}
      {scannedMahasantri && (
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5 animate-fade-in">
          
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-uin-primary border border-emerald-100 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Hasil Pemindaian Barcode</span>
                <h3 className="font-bold text-base text-slate-900">Verifikasi Mahasantri</h3>
              </div>
            </div>

            <button
              onClick={() => setScannedMahasantri(null)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile & Kamar Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {/* Mahasantri Identity */}
            <div className="flex items-center gap-3.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200 md:col-span-2">
              <div className="w-14 h-18 rounded-md overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                {scannedMahasantri.pasFotoUrl ? (
                  <img
                    src={scannedMahasantri.pasFotoUrl}
                    alt={scannedMahasantri.nama}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-slate-400 m-auto mt-6" />
                )}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-slate-900">{scannedMahasantri.nama}</h4>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium border border-slate-200">
                    {scannedMahasantri.jenisPendaftaran}
                  </span>
                </div>
                <p className="text-xs font-mono font-semibold text-slate-700">NIM/NISN: {scannedMahasantri.nimNisn}</p>
                <p className="text-xs text-slate-500">{scannedMahasantri.jurusan} &bull; {scannedMahasantri.fakultas}</p>
                <p className="text-[11px] text-slate-400">WA: {scannedMahasantri.noWa} | Wali: {scannedMahasantri.namaWali} ({scannedMahasantri.noWaWali})</p>
              </div>
            </div>

            {/* Room Allocation Info */}
            <div className="bg-emerald-50/50 border border-emerald-200 text-slate-900 p-3.5 rounded-lg text-center space-y-0.5">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">Alokasi Kamar</span>
              <div className="text-sm font-semibold text-slate-800">{scannedMahasantri.gedung}</div>
              <div className="text-xl font-bold text-uin-primary">Kamar {scannedMahasantri.nomorKamar}</div>
              <div className="text-xs font-semibold text-emerald-800">
                Lantai {scannedMahasantri.lantai} &bull; Bed {scannedMahasantri.bedNumber}
              </div>
            </div>
          </div>

          {/* SOP Luggage Inspection Checklist */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5">
            <h5 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Pemeriksaan Barang Bawaan Sesuai SOP Ma&apos;had</span>
            </h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
              {ATURAN_BARANG.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-md border border-slate-200">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.allowed ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  <span className="font-medium text-xs text-slate-700">{item.item}</span>
                  <span className="text-[10px] text-slate-400 ml-auto">{item.allowed ? 'Boleh' : 'Dilarang'}</span>
                </div>
              ))}
            </div>

            <div className="pt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nama Petugas Pengurus:</label>
                <input
                  type="text"
                  value={petugasNama}
                  onChange={(e) => setPetugasNama(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-uin-primary outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Catatan Pengecekan Barang &amp; Berkas:</label>
                <input
                  type="text"
                  value={catatanBarang}
                  onChange={(e) => setCatatanBarang(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-uin-primary outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Action Confirmation Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            {scannedMahasantri.statusCheckIn === 'CHECKED_IN' ? (
              <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-lg text-xs font-semibold w-full sm:w-auto">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Sudah Check-In ({new Date(scannedMahasantri.checkInTimestamp || '').toLocaleTimeString('id-ID')})</span>
              </div>
            ) : (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmCheckIn}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
              >
                <Key className="w-4 h-4" />
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
