'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MahadStore } from '@/lib/store';
import { Kamar, Gender, SKMahasantri, JenisPendaftaran } from '@/lib/types';
import { FAKULTAS_LIST, SK_INFO, getShortJurusan } from '@/lib/constants';
import FloorPlanVisualizer from '@/components/room/FloorPlanVisualizer';
import RoleGuard from '@/components/auth/RoleGuard';
import { MahadAuth } from '@/lib/store';
import {
  User,
  BedDouble,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  Building,
  ShieldCheck,
  Search,
  Lock,
  Camera,
  Upload,
  ImageIcon,
  RefreshCw,
} from 'lucide-react';

export default function DaftarPage() {
  return (
    <RoleGuard allowedRoles={['MAHASANTRI', 'ADMIN']} pageTitle="Formulir Pemilihan Kamar Mahasantri">
      <DaftarPageContent />
    </RoleGuard>
  );
}

function DaftarPageContent() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rooms, setRooms] = useState<Kamar[]>([]);

  // NIM / NISN & SK Verification State
  const [nimNisn, setNimNisn] = useState('');
  const [skVerified, setSkVerified] = useState<SKMahasantri | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Form State
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<Gender>('L');
  const [jenisPendaftaran, setJenisPendaftaran] = useState<JenisPendaftaran>('Calon Mahasantri Baru');
  const [fakultas, setFakultas] = useState(FAKULTAS_LIST[0]);
  const [jurusan, setJurusan] = useState('');
  const [asalNegara, setAsalNegara] = useState<string | undefined>(undefined);
  const [noWa, setNoWa] = useState('');
  const [namaWali, setNamaWali] = useState('');
  const [noWaWali, setNoWaWali] = useState('');
  const [isInternasional, setIsInternasional] = useState(false);
  const [pasFotoUrl, setPasFotoUrl] = useState(
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('File yang diunggah harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 320;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.8);
              setPasFotoUrl(compressed);
            } else {
              setPasFotoUrl(reader.result as string);
            }
          } catch (err) {
            setPasFotoUrl(reader.result as string);
          }
        };
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  // Room Selection State
  const [selectedKamar, setSelectedKamar] = useState<Kamar | null>(null);
  const [selectedBedNumber, setSelectedBedNumber] = useState<number | null>(null);

  // Submission State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    MahadStore.initSupabaseSync();
    setRooms(MahadStore.getRooms());
    const handleRoomUpdate = () => setRooms(MahadStore.getRooms());
    window.addEventListener('mahad_rooms_updated', handleRoomUpdate);

    // Auto verify if logged-in mahasantri
    const session = MahadAuth.getSession();
    if (session && session.role === 'MAHASANTRI' && session.skData) {
      setNimNisn(session.skData.nimNisn);
      setSkVerified(session.skData);
      setNama(session.skData.nama);
      setFakultas(session.skData.fakultas);
      setJurusan(session.skData.jurusan);
      setJenisKelamin(session.skData.jenisKelamin);
      setJenisPendaftaran(session.skData.jenisPendaftaran);
      setIsInternasional(session.skData.isInternasional);
      setAsalNegara(session.skData.asalNegara);
      if (session.skData.noWaRegistered) {
        setNoWa(session.skData.noWaRegistered);
      }
    }

    return () => window.removeEventListener('mahad_rooms_updated', handleRoomUpdate);
  }, []);

  // Handle Verify NIM / NISN with SK
  const handleVerifyNIMNISN = () => {
    setErrorMessage(null);
    setSkVerified(null);

    if (!nimNisn.trim()) {
      setErrorMessage('Silakan masukkan NIM atau NISN Anda terlebih dahulu.');
      return;
    }

    setIsVerifying(true);
    const check = MahadStore.checkSK(nimNisn.trim());
    setIsVerifying(false);

    if (!check.isAllowed || !check.data) {
      setErrorMessage(check.error || 'NIM / NISN tidak terdaftar dalam SK Pengumuman.');
      return;
    }

    if (check.alreadyRegistered) {
      setErrorMessage(
        `NIM/NISN ${nimNisn} (${check.alreadyRegistered.nama}) SUDAH memilih kamar sebelumnya (Kamar ${check.alreadyRegistered.nomorKamar} Bed ${check.alreadyRegistered.bedNumber}). Anda dapat langsung membuka E-Tiket Anda.`
      );
      return;
    }

    // Successfully verified in SK!
    setSkVerified(check.data);
    setNama(check.data.nama);
    setFakultas(check.data.fakultas);
    setJurusan(check.data.jurusan);
    setJenisKelamin(check.data.jenisKelamin);
    setJenisPendaftaran(check.data.jenisPendaftaran);
    setIsInternasional(check.data.isInternasional);
    setAsalNegara(check.data.asalNegara);
  };

  const handleSelectBed = (kamar: Kamar, bedNumber: number) => {
    setSelectedKamar(kamar);
    setSelectedBedNumber(bedNumber);
    setErrorMessage(null);
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!skVerified) {
      setErrorMessage('Silakan verifikasi NIM / NISN Anda di SK terlebih dahulu.');
      return;
    }

    if (!noWa.trim()) {
      setErrorMessage('Mohon lengkapi No. WhatsApp aktif.');
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextStep2 = () => {
    setErrorMessage(null);
    if (!selectedKamar || !selectedBedNumber) {
      setErrorMessage('Silakan pilih salah satu kamar dan nomor ranjang terlebih dahulu.');
      return;
    }
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitFinal = () => {
    if (!selectedKamar || !selectedBedNumber || !skVerified) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = MahadStore.bookRoom(
        {
          nimNisn: nimNisn.trim(),
          nama: nama.trim(),
          jenisKelamin,
          jenisPendaftaran,
          fakultas,
          jurusan,
          asalNegara,
          noWa: noWa.trim(),
          namaWali: namaWali.trim() || 'Wali Mahasantri',
          noWaWali: noWaWali.trim() || '-',
          isInternasional,
          pasFotoUrl,
        },
        selectedKamar.id,
        selectedBedNumber
      );

      setIsSubmitting(false);

      if (result.success && result.mahasantri) {
        window.location.href = `/tiket/${encodeURIComponent(result.mahasantri.nimNisn)}`;
      } else {
        setErrorMessage(result.error || 'Terjadi kesalahan saat memproses pendaftaran.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Terjadi kesalahan tidak terduga.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-uin-secondary flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-uin-primary" />
          Pendaftaran Resmi SK No. {SK_INFO.nomor}
        </span>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-800">
          Formulir Check-In Mahasantri Mandiri
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Gunakan <strong>NISN</strong> (untuk Calon Mahasantri Baru) atau <strong>NIM</strong> (untuk Perpanjangan) sesuai yang tercantum di Surat Keputusan.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="flex items-center justify-center max-w-lg mx-auto">
        <div className="flex items-center w-full">
          
          {/* Step 1 Indicator */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step >= 1 ? 'bg-uin-primary text-white ring-4 ring-uin-primary/20' : 'bg-slate-200 text-slate-500'
              }`}
            >
              1
            </div>
            <span className="text-[11px] font-semibold text-slate-600 mt-1">Cek NISN/NIM</span>
          </div>

          <div className={`flex-1 h-1 mx-2 transition-all ${step >= 2 ? 'bg-uin-primary' : 'bg-slate-200'}`}></div>

          {/* Step 2 Indicator */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step >= 2 ? 'bg-uin-primary text-white ring-4 ring-uin-primary/20' : 'bg-slate-200 text-slate-500'
              }`}
            >
              2
            </div>
            <span className="text-[11px] font-semibold text-slate-600 mt-1">Pilih Kamar</span>
          </div>

          <div className={`flex-1 h-1 mx-2 transition-all ${step >= 3 ? 'bg-uin-primary' : 'bg-slate-200'}`}></div>

          {/* Step 3 Indicator */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step >= 3 ? 'bg-uin-primary text-white ring-4 ring-uin-primary/20' : 'bg-slate-200 text-slate-500'
              }`}
            >
              3
            </div>
            <span className="text-[11px] font-semibold text-slate-600 mt-1">E-Tiket</span>
          </div>

        </div>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* STEP 1: Verifikasi SK & Form Data */}
      {step === 1 && (
        <form onSubmit={handleNextStep1} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
              <ShieldCheck className="w-5 h-5 text-uin-primary" />
              <span>Langkah 1: Verifikasi NIM / NISN di Lampiran SK</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">Gelombang 1 &bull; 2026/2027</span>
          </div>

          {/* NIM / NISN Verification Box */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Masukkan NIM atau NISN Anda Sesuai SK <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Contoh NISN: 0067999651 atau NIM: 2530311086"
                value={nimNisn}
                onChange={(e) => {
                  setNimNisn(e.target.value);
                  setSkVerified(null);
                }}
                className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-uin-primary/30 outline-none"
              />
              <button
                type="button"
                onClick={handleVerifyNIMNISN}
                disabled={isVerifying}
                className="px-6 py-3 bg-uin-primary hover:bg-uin-secondary text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>{isVerifying ? 'Memeriksa...' : 'Cek Status di SK'}</span>
              </button>
            </div>

            {/* Quick Demo NISN / NIM Hint */}
            <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 pt-1">
              <span>Contoh di SK Asli:</span>
              {[
                { label: '0067999651 (Maba NISN)', val: '0067999651' },
                { label: '0074324633 (Maba NISN)', val: '0074324633' },
                { label: '2530311086 (Perpanjangan NIM)', val: '2530311086' },
                { label: 'INT-PH-846 (Internasional Filipina)', val: 'INT-PH-846' },
              ].map((sample) => (
                <button
                  key={sample.val}
                  type="button"
                  onClick={() => {
                    setNimNisn(sample.val);
                    setSkVerified(null);
                  }}
                  className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-mono text-[10px]"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* If SK Verified: Auto-filled Official Data */}
          {skVerified ? (
            <div className="space-y-6 pt-2">
              
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 text-emerald-900">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-sm block">
                    NIM / NISN Terverifikasi Resmi di SK Mahad Al-Jami'ah!
                  </span>
                  <p className="text-xs text-emerald-800">
                    Jalur: <strong>{skVerified.jenisPendaftaran}</strong> &bull; Fakultas/Jurusan: <strong>{skVerified.jurusan} ({skVerified.fakultas})</strong>
                  </p>
                </div>
              </div>

              {/* Pas Foto Diri Upload Box */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <div className="relative group shrink-0">
                  <div className="w-24 h-32 rounded-2xl overflow-hidden bg-slate-200 border-2 border-uin-primary/40 shadow-sm flex items-center justify-center">
                    {pasFotoUrl ? (
                      <img src={pasFotoUrl} alt="Pas Foto" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 hover:bg-black/50 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
                  >
                    <Camera className="w-5 h-5 mb-1" />
                    <span>Ganti Foto</span>
                  </button>
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Pas Foto Diri (Formal / Rapi)
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Foto Terpasang
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Foto ini akan otomatis tercetak di <strong>E-Tiket Barcode</strong> dan diverifikasi oleh Mudabbir / Pengurus Lorong saat Hari-H kedatangan.
                  </p>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-300 hover:border-uin-primary text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition-all"
                  >
                    <Upload className="w-3.5 h-3.5 text-uin-primary" />
                    <span>Unggah / Ambil Foto Baru</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Nama Lengkap (Terkunci Sesuai SK)</span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </label>
                  <input
                    type="text"
                    disabled
                    value={nama}
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Jurusan &amp; Fakultas (Sesuai SK)</span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${getShortJurusan(jurusan, fakultas)} - ${fakultas}`}
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    No. WhatsApp Mahasantri (Aktif) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={noWa}
                    onChange={(e) => setNoWa(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-uin-primary/30 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Orang Tua / Wali
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Orang Tua / Wali"
                    value={namaWali}
                    onChange={(e) => setNamaWali(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-uin-primary/30 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    No. Telepon / WA Wali (Darurat)
                  </label>
                  <input
                    type="tel"
                    placeholder="Contoh: 081298765432"
                    value={noWaWali}
                    onChange={(e) => setNoWaWali(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-uin-primary/30 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">Kategori Pendaftaran</span>
                    <span className="text-[11px] text-slate-500">
                      {jenisPendaftaran} {asalNegara ? `(${asalNegara})` : ''}
                    </span>
                  </div>
                  {isInternasional && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                      Internasional
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3.5 bg-uin-primary text-white font-bold text-sm rounded-xl hover:bg-uin-secondary shadow-lg transition-all"
                >
                  <span>Lanjut ke Pemilihan Kamar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs space-y-2">
              <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Masukkan NISN atau NIM Anda di atas dan klik tombol <strong>"Cek Status di SK"</strong> untuk melanjutkan pendaftaran kamar.</p>
            </div>
          )}

        </form>
      )}

      {/* STEP 2: Pemilihan Kamar Visual Denah */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-uin-primary uppercase tracking-wider block">Langkah 2</span>
              <h2 className="text-xl font-bold text-slate-800">Pilih Kamar &amp; Ranjang (Bed)</h2>
              <p className="text-xs text-slate-500">
                Pilih salah satu ranjang (1, 2, 3, atau 4) yang berwarna hijau pada denah lantai di bawah.
              </p>
            </div>

            {selectedKamar && selectedBedNumber && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 px-4 text-xs font-bold text-amber-900 shadow-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-600" />
                <span>Pilihan: Kamar {selectedKamar.nomor} &bull; Bed {selectedBedNumber}</span>
              </div>
            )}
          </div>

          <FloorPlanVisualizer
            rooms={rooms}
            selectedKamarId={selectedKamar?.id || null}
            selectedBedNumber={selectedBedNumber}
            genderConstraint={jenisKelamin}
            isInternasional={isInternasional}
            onSelectBed={handleSelectBed}
          />

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-300 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep2}
              className="flex items-center gap-2 px-8 py-3.5 bg-uin-primary text-white font-bold text-sm rounded-xl hover:bg-uin-secondary shadow-lg transition-all"
            >
              <span>Konfirmasi &amp; Terbitkan Tiket</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Konfirmasi Final Sebelum Penerbitan */}
      {step === 3 && selectedKamar && selectedBedNumber && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 text-center space-y-1">
            <span className="text-xs font-bold text-uin-primary uppercase tracking-wider">Langkah 3: Konfirmasi Akhir</span>
            <h2 className="text-2xl font-bold text-slate-800">Tinjau Data Pendaftaran Anda</h2>
            <p className="text-xs text-slate-500">Pastikan data kamar dan identitas sudah benar sebelum E-Tiket diterbitkan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Box Identitas */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-uin-primary" /> Identitas Mahasantri (SK {SK_INFO.nomor})
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">NIM / NISN</span>
                  <span className="font-bold font-mono">{nimNisn}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Nama Lengkap</span>
                  <span className="font-bold">{nama}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Fakultas / Jurusan</span>
                  <span className="font-medium text-right">{jurusan} &bull; {fakultas}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Jenis Pendaftaran</span>
                  <span className="font-medium">{jenisPendaftaran}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">No. WhatsApp</span>
                  <span className="font-medium">{noWa}</span>
                </div>
              </div>
            </div>

            {/* Box Kamar yang Dipilih */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-200 space-y-3">
              <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-emerald-600" /> Alokasi Kamar Terpilih
              </h3>
              <div className="space-y-1.5 text-xs text-slate-800">
                <div className="flex justify-between py-1 border-b border-emerald-200/60">
                  <span className="text-emerald-700">Gedung</span>
                  <span className="font-bold">Ma&apos;had Qodim</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-200/60">
                  <span className="text-emerald-700">Lantai</span>
                  <span className="font-bold">Lantai {selectedKamar.lantai}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-200/60">
                  <span className="text-emerald-700">Nomor Kamar</span>
                  <span className="font-extrabold text-uin-primary text-base">Kamar {selectedKamar.nomor}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-200/60">
                  <span className="text-emerald-700">Nomor Ranjang</span>
                  <span className="font-extrabold text-amber-600 text-base">Bed {selectedBedNumber}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-emerald-700">Posisi Lorong</span>
                  <span className="font-medium">
                    {selectedKamar.jajaran === 'BELAKANG'
                      ? `Jajaran Belakang (Kamar ${selectedKamar.lantai}13 – ${selectedKamar.lantai}16)`
                      : `Jajaran Depan (Kamar ${selectedKamar.lantai}09 – ${selectedKamar.lantai}12)`}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Petunjuk Hari-H */}
          <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">Jadwal &amp; Alur Check-In Hari-H:</span>
            <p>Jadwal masuk: <strong className="text-slate-800">19 – 21 Agustus 2026 (08.00–16.00 WIB)</strong>. Pada Hari-H, Anda dapat langsung berjalan menuju <strong className="text-slate-800">Lantai {selectedKamar.lantai} Kamar {selectedKamar.nomor}</strong> tanpa antre di lobi bawah.</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-300 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ganti Kamar</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitFinal}
              className="flex items-center gap-2 px-8 py-3.5 bg-uin-accent text-slate-950 font-bold text-sm rounded-xl hover:bg-amber-300 shadow-xl transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Menerbitkan Tiket...' : 'Terbitkan E-Tiket Barcode Sekarang'}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
