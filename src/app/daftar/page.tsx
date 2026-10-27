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
  Phone,
  Building,
  ShieldCheck,
  Search,
  Lock,
  Camera,
  Upload,
  Ticket,
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
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
              setPasFotoUrl(compressedBase64);
              setErrorMessage(null);
            }
          } catch {
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

  // Status & Notification
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    MahadStore.initSupabaseSync();
    setRooms(MahadStore.getRooms());

    const session = MahadAuth.getSession();
    if (session && session.role === 'MAHASANTRI') {
      const existingMhs = session.mahasantriData || MahadStore.getMahasantriByNimNisn(session.identifier);
      if (existingMhs) {
        window.location.href = `/tiket/${encodeURIComponent(existingMhs.nimNisn)}`;
        return;
      }

      const mhsSK = session.skData || MahadStore.getSKByNimNisn(session.identifier);
      if (mhsSK) {
        setNimNisn(mhsSK.nimNisn);
        setNama(mhsSK.nama);
        setJenisKelamin(mhsSK.jenisKelamin);
        setJenisPendaftaran(mhsSK.jenisPendaftaran);
        setFakultas(mhsSK.fakultas);
        setJurusan(mhsSK.jurusan);
        setAsalNegara(mhsSK.asalNegara);
        setIsInternasional(mhsSK.isInternasional);
        setSkVerified(mhsSK);
        if (mhsSK.noWaRegistered) {
          setNoWa(mhsSK.noWaRegistered);
        }
      }
    }

    const handleRoomUpdate = () => setRooms(MahadStore.getRooms());
    window.addEventListener('mahad_rooms_updated', handleRoomUpdate);
    return () => window.removeEventListener('mahad_rooms_updated', handleRoomUpdate);
  }, []);

  // Handle Verify NIM/NISN in Master SK
  const handleVerifyNIMNISN = () => {
    setErrorMessage(null);
    const cleanNim = nimNisn.trim();

    if (!cleanNim) {
      setErrorMessage('Silakan masukkan nomor NIM atau NISN Anda.');
      return;
    }

    setIsVerifying(true);
    const foundSK = MahadStore.getSKByNimNisn(cleanNim);
    setIsVerifying(false);

    if (!foundSK) {
      setErrorMessage(
        `NIM/NISN "${cleanNim}" tidak ditemukan dalam Surat Keputusan Resmi Ma'had UIN SSC. Pastikan Anda memasukkan nomor yang sesuai dengan lampiran SK.`
      );
      setSkVerified(null);
      return;
    }

    const alreadyRegistered = MahadStore.getMahasantriByNimNisn(cleanNim);
    if (alreadyRegistered) {
      router.push(`/tiket/${encodeURIComponent(cleanNim)}`);
      return;
    }

    setSkVerified(foundSK);
    setNama(foundSK.nama);
    setJenisKelamin(foundSK.jenisKelamin);
    setJenisPendaftaran(foundSK.jenisPendaftaran);
    setFakultas(foundSK.fakultas);
    setJurusan(foundSK.jurusan);
    setAsalNegara(foundSK.asalNegara);
    setIsInternasional(foundSK.isInternasional);
    if (foundSK.noWaRegistered && !noWa) {
      setNoWa(foundSK.noWaRegistered);
    }
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!skVerified) {
      setErrorMessage('Anda wajib memverifikasi NIM/NISN Anda terlebih dahulu.');
      return;
    }

    if (!noWa.trim()) {
      setErrorMessage('Nomor WhatsApp wajib diisi.');
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBed = (kamar: Kamar, bedNumber: number) => {
    setSelectedKamar(kamar);
    setSelectedBedNumber(bedNumber);
    setErrorMessage(null);
  };

  const handleNextStep2 = () => {
    if (!selectedKamar || selectedBedNumber === null) {
      setErrorMessage('Silakan pilih salah satu ranjang (Bed) yang tersedia pada denah kamar di bawah.');
      return;
    }

    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitFinal = () => {
    if (!selectedKamar || selectedBedNumber === null) {
      setErrorMessage('Data kamar belum dipilih secara lengkap.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = MahadStore.registerMahasantri(
        {
          nama,
          nimNisn: nimNisn.trim(),
          jenisKelamin,
          jenisPendaftaran,
          fakultas,
          jurusan,
          asalNegara,
          noWa: noWa.trim(),
          namaWali: namaWali.trim() || '-',
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Title */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-uin-primary border border-emerald-100 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Pendaftaran &amp; Penempatan Kamar Resmi</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Formulir Pemilihan Kamar Mahasantri
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Gunakan <strong>NISN</strong> (untuk Santri Baru) atau <strong>NIM</strong> (untuk Perpanjangan) sesuai lampiran SK Ma&apos;had.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="flex items-center justify-center max-w-md mx-auto pt-1">
        <div className="flex items-center w-full">
          {/* Step 1 Indicator */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                step >= 1 ? 'bg-uin-primary text-white shadow-xs' : 'bg-slate-200 text-slate-500'
              }`}
            >
              1
            </div>
            <span className="text-[11px] font-semibold text-slate-700 mt-1">Identitas SK</span>
          </div>

          <div className={`flex-1 h-0.5 mx-2 transition-colors ${step >= 2 ? 'bg-uin-primary' : 'bg-slate-200'}`}></div>

          {/* Step 2 Indicator */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                step >= 2 ? 'bg-uin-primary text-white shadow-xs' : 'bg-slate-200 text-slate-500'
              }`}
            >
              2
            </div>
            <span className="text-[11px] font-semibold text-slate-700 mt-1">Pilih Kamar</span>
          </div>

          <div className={`flex-1 h-0.5 mx-2 transition-colors ${step >= 3 ? 'bg-uin-primary' : 'bg-slate-200'}`}></div>

          {/* Step 3 Indicator */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                step >= 3 ? 'bg-uin-primary text-white shadow-xs' : 'bg-slate-200 text-slate-500'
              }`}
            >
              3
            </div>
            <span className="text-[11px] font-semibold text-slate-700 mt-1">E-Tiket</span>
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* STEP 1: Verifikasi SK & Form Data */}
      {step === 1 && (
        <form onSubmit={handleNextStep1} className="bg-white rounded-xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <ShieldCheck className="w-4 h-4 text-uin-primary" />
              <span>Langkah 1: Verifikasi Identitas di SK Resmi</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">Tahun Ajaran 2026/2027</span>
          </div>

          {/* NIM / NISN Verification Box */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Masukkan NIM atau NISN Anda Sesuai SK <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Contoh: 0067999651 atau 2530311086"
                value={nimNisn}
                onChange={(e) => {
                  setNimNisn(e.target.value);
                  setSkVerified(null);
                }}
                className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-mono focus:border-uin-primary outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleVerifyNIMNISN}
                disabled={isVerifying}
                className="px-4 py-2 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isVerifying ? 'Memeriksa...' : 'Cek Status di SK'}</span>
              </button>
            </div>

            {/* Quick Demo NISN / NIM Hint */}
            <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 pt-0.5">
              <span>Contoh data SK:</span>
              {[
                { label: '0067999651 (Maba)', val: '0067999651' },
                { label: '0074324633 (Maba)', val: '0074324633' },
                { label: '2530311086 (Lama)', val: '2530311086' },
                { label: 'INT-PH-846 (Internasional)', val: 'INT-PH-846' },
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
            <div className="space-y-4 pt-1">
              
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <span className="font-semibold block">
                    NIM / NISN Terverifikasi Resmi di SK Ma&apos;had Al-Jami&apos;ah
                  </span>
                  <p className="text-emerald-800">
                    Jalur: <strong>{skVerified.jenisPendaftaran}</strong> &bull; Fakultas/Jurusan: <strong>{skVerified.jurusan} ({skVerified.fakultas})</strong>
                  </p>
                </div>
              </div>

              {/* Pas Foto Diri Upload Box */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <div className="relative group shrink-0">
                  <div className="w-20 h-24 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shadow-xs flex items-center justify-center">
                    {pasFotoUrl ? (
                      <img src={pasFotoUrl} alt="Pas Foto" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 hover:bg-black/60 text-white rounded-lg flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold"
                  >
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>Ganti</span>
                  </button>
                </div>

                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                      Pas Foto Formal Mahasantri
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium px-2 py-0.5 rounded">
                      Foto Terpasang
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Foto ini akan tercetak pada E-Tiket Barcode untuk verifikasi identitas di meja check-in lorong.
                  </p>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ganti Foto</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Nama Lengkap (Terkunci Sesuai SK)</span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </label>
                  <input
                    type="text"
                    disabled
                    value={nama}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Jurusan &amp; Fakultas (Sesuai SK)</span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${getShortJurusan(jurusan, fakultas)} - ${fakultas}`}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    No. WhatsApp Mahasantri (Aktif) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={noWa}
                    onChange={(e) => setNoWa(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:border-uin-primary outline-none transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Orang Tua / Wali
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Orang Tua / Wali"
                    value={namaWali}
                    onChange={(e) => setNamaWali(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:border-uin-primary outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    No. Telepon / WA Wali (Darurat)
                  </label>
                  <input
                    type="tel"
                    placeholder="Contoh: 081298765432"
                    value={noWaWali}
                    onChange={(e) => setNoWaWali(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:border-uin-primary outline-none transition-colors font-mono"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-800 block">Kategori Pendaftaran</span>
                    <span className="text-[11px] text-slate-500">
                      {jenisPendaftaran} {asalNegara ? `(${asalNegara})` : ''}
                    </span>
                  </div>
                  {isInternasional && (
                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-medium px-2 py-0.5 rounded">
                      Internasional
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
                >
                  <span>Lanjut ke Pemilihan Kamar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs space-y-1.5">
              <ShieldCheck className="w-6 h-6 text-slate-300 mx-auto" />
              <p>Masukkan nomor NIM atau NISN Anda di atas, lalu klik <strong>&quot;Cek Status di SK&quot;</strong> untuk melanjutkan.</p>
            </div>
          )}

        </form>
      )}

      {/* STEP 2: Pemilihan Kamar Visual Denah */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-uin-primary uppercase tracking-wider block">Langkah 2</span>
              <h2 className="text-lg font-bold text-slate-900">Pilih Kamar &amp; Ranjang (Bed)</h2>
              <p className="text-xs text-slate-500">
                Pilih salah satu ranjang (Bed 1, 2, 3, atau 4) yang berstatus kosong pada denah di bawah.
              </p>
            </div>

            {selectedKamar && selectedBedNumber && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 px-3.5 text-xs font-semibold text-emerald-900 shadow-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pilihan: {selectedKamar.gedung} &bull; Kamar {selectedKamar.nomor} &bull; Bed {selectedBedNumber}</span>
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

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep2}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
            >
              <span>Konfirmasi &amp; Terbitkan Tiket</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Konfirmasi Final Sebelum Penerbitan */}
      {step === 3 && selectedKamar && selectedBedNumber && (
        <div className="bg-white rounded-xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 text-center space-y-0.5">
            <span className="text-xs font-semibold text-uin-primary uppercase tracking-wider">Langkah 3: Konfirmasi Akhir</span>
            <h2 className="text-xl font-bold text-slate-900">Tinjau Data Pendaftaran Anda</h2>
            <p className="text-xs text-slate-500">Pastikan data kamar dan nomor ranjang sudah sesuai sebelum E-Tiket diterbitkan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box Identitas */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-uin-primary" /> Identitas Mahasantri
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">NIM / NISN</span>
                  <span className="font-semibold font-mono">{nimNisn}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Nama Lengkap</span>
                  <span className="font-semibold">{nama}</span>
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
                  <span className="font-medium font-mono">{noWa}</span>
                </div>
              </div>
            </div>

            {/* Box Kamar yang Dipilih */}
            <div className="bg-emerald-50/40 p-4 rounded-lg border border-emerald-200 space-y-2.5">
              <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-uin-primary" /> Alokasi Kamar Terpilih
              </h3>
              <div className="space-y-1.5 text-xs text-slate-800">
                <div className="flex justify-between py-1 border-b border-emerald-200/60">
                  <span className="text-slate-600">Gedung</span>
                  <span className="font-semibold">{selectedKamar.gedung}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-200/60">
                  <span className="text-slate-600">Lantai</span>
                  <span className="font-semibold">Lantai {selectedKamar.lantai}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-200/60">
                  <span className="text-slate-600">Nomor Kamar</span>
                  <span className="font-bold text-uin-primary text-sm">Kamar {selectedKamar.nomor}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-200/60">
                  <span className="text-slate-600">Nomor Ranjang</span>
                  <span className="font-bold text-emerald-800 text-sm">Bed {selectedBedNumber}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Posisi Lorong</span>
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
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800 block">Jadwal &amp; Alur Check-In Hari-H:</span>
            <p>Jadwal kedatangan: <strong className="text-slate-800 font-semibold">19 – 21 Agustus 2026 (08.00–16.00 WIB)</strong>. Pada Hari-H, Anda dapat langsung menuju ke <strong className="text-slate-800 font-semibold">{selectedKamar.gedung} Lantai {selectedKamar.lantai} Kamar {selectedKamar.nomor}</strong> tanpa antre di lobi bawah.</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ganti Kamar</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitFinal}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
            >
              <Ticket className="w-4 h-4" />
              <span>{isSubmitting ? 'Menerbitkan Tiket...' : 'Terbitkan E-Tiket Barcode'}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
