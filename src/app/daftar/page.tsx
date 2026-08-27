'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MahadStore } from '@/lib/store';
import { Kamar, Gender, SKMahasantri } from '@/lib/types';
import { FAKULTAS_LIST } from '@/lib/constants';
import FloorPlanVisualizer from '@/components/room/FloorPlanVisualizer';
import Link from 'next/link';
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
} from 'lucide-react';

export default function DaftarPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rooms, setRooms] = useState<Kamar[]>([]);

  // NIM & SK Verification State
  const [nim, setNim] = useState('');
  const [skVerified, setSkVerified] = useState<SKMahasantri | null>(null);
  const [isVerifyingNim, setIsVerifyingNim] = useState(false);

  // Form State
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<Gender>('L');
  const [fakultas, setFakultas] = useState(FAKULTAS_LIST[0]);
  const [prodi, setProdi] = useState('');
  const [noWa, setNoWa] = useState('');
  const [namaWali, setNamaWali] = useState('');
  const [noWaWali, setNoWaWali] = useState('');
  const [isInternasional, setIsInternasional] = useState(false);
  const [pasFotoUrl, setPasFotoUrl] = useState(
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  );

  // Room Selection State
  const [selectedKamar, setSelectedKamar] = useState<Kamar | null>(null);
  const [selectedBedNumber, setSelectedBedNumber] = useState<number | null>(null);

  // Submission State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setRooms(MahadStore.getRooms());
    const handleRoomUpdate = () => setRooms(MahadStore.getRooms());
    window.addEventListener('mahad_rooms_updated', handleRoomUpdate);
    return () => window.removeEventListener('mahad_rooms_updated', handleRoomUpdate);
  }, []);

  // Handle Verify NIM with SK
  const handleVerifyNIM = () => {
    setErrorMessage(null);
    setSkVerified(null);

    if (!nim.trim()) {
      setErrorMessage('Silakan masukkan NIM Anda terlebih dahulu.');
      return;
    }

    setIsVerifyingNim(true);

    const check = MahadStore.checkSK(nim.trim());
    setIsVerifyingNim(false);

    if (!check.isAllowed || !check.data) {
      setErrorMessage(check.error || 'NIM tidak terdaftar dalam SK Rektor.');
      return;
    }

    if (check.alreadyRegistered) {
      setErrorMessage(
        `NIM ${nim} (${check.alreadyRegistered.nama}) SUDAH memilih kamar sebelumnya (Kamar ${check.alreadyRegistered.nomorKamar} Bed ${check.alreadyRegistered.bedNumber}). Anda dapat langsung membuka E-Tiket Anda.`
      );
      return;
    }

    // Successfully verified in SK Rektor!
    setSkVerified(check.data);
    setNama(check.data.nama);
    setFakultas(check.data.fakultas);
    setProdi(check.data.prodi);
    setJenisKelamin(check.data.jenisKelamin);
    setIsInternasional(check.data.isInternasional);
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
      setErrorMessage('Silakan verifikasi NIM Anda di SK Rektor terlebih dahulu.');
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

    const result = MahadStore.bookRoom(
      {
        nim: nim.trim(),
        nama: nama.trim(),
        jenisKelamin,
        fakultas,
        prodi,
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
      router.push(`/tiket/${result.mahasantri.nim}`);
    } else {
      setErrorMessage(result.error || 'Terjadi kesalahan saat memproses pendaftaran.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-uin-secondary flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-uin-primary" />
          Pendaftaran Resmi Berbasis SK Rektor
        </span>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-800">
          Formulir Check-In Mahasantri Mandiri
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Hanya mahasantri yang tercantum dalam SK Penetapan Rektor yang dapat memilih kamar dan menerbitkan E-Tiket Barcode.
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
            <span className="text-[11px] font-semibold text-slate-600 mt-1">Cek SK &amp; Data</span>
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

      {/* STEP 1: Verifikasi SK Rektor & Form Data */}
      {step === 1 && (
        <form onSubmit={handleNextStep1} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
              <ShieldCheck className="w-5 h-5 text-uin-primary" />
              <span>Langkah 1: Verifikasi NIM di SK Rektor &amp; Data Kontak</span>
            </div>
            <span className="text-xs text-slate-400">Whitelist Gatekeeper</span>
          </div>

          {/* NIM Verification Box */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Nomor Induk Mahasiswa (NIM) Sesuai SK <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Contoh: 2530311086 / 2381010001"
                value={nim}
                onChange={(e) => {
                  setNim(e.target.value);
                  setSkVerified(null);
                }}
                className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-uin-primary/30 outline-none"
              />
              <button
                type="button"
                onClick={handleVerifyNIM}
                disabled={isVerifyingNim}
                className="px-6 py-3 bg-uin-primary hover:bg-uin-secondary text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>{isVerifyingNim ? 'Memeriksa...' : 'Cek SK Rektor'}</span>
              </button>
            </div>

            {/* Quick Demo NIM Hint */}
            <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 pt-1">
              <span>NIM Contoh di SK:</span>
              {['2530311086', '2381040112', '2381050144', '2381030089 (Int.)'].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    const clean = sample.split(' ')[0];
                    setNim(clean);
                    setSkVerified(null);
                  }}
                  className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-mono text-[10px]"
                >
                  {sample}
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
                    NIM Terverifikasi Resmi dalam SK Rektor!
                  </span>
                  <p className="text-xs text-emerald-800">
                    Data nama dan program studi otomatis ditarik dari Master SK Mahasantri. Silakan lengkapi kontak WhatsApp di bawah.
                  </p>
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
                    <span>Fakultas &amp; Program Studi (Sesuai SK)</span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${prodi} (${fakultas})`}
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
                    <span className="text-xs font-bold text-slate-800 block">Kategori Mahasantri</span>
                    <span className="text-[11px] text-slate-500">
                      {isInternasional ? 'Mahasiswa Asing / Internasional (Bisa akses Lantai 2)' : 'Mahasantri Reguler Nasional'}
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
              <p>Masukkan NIM Anda di atas dan klik tombol <strong>"Cek SK Rektor"</strong> untuk melanjutkan pendaftaran kamar.</p>
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
                <User className="w-4 h-4 text-uin-primary" /> Identitas Mahasantri (SK Rektor)
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">NIM</span>
                  <span className="font-bold font-mono">{nim}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Nama Lengkap</span>
                  <span className="font-bold">{nama}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Fakultas / Prodi</span>
                  <span className="font-medium text-right">{fakultas} &bull; {prodi}</span>
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
            <span className="font-bold text-slate-800 block">Informasi Alur Check-In Hari-H:</span>
            <p>Setelah menekan tombol di bawah, Anda akan memperoleh E-Tiket Digital ber-Barcode. Pada Hari-H, Anda dapat langsung berjalan menuju <strong className="text-slate-800">Lantai {selectedKamar.lantai} Kamar {selectedKamar.nomor}</strong> tanpa antre di lobi bawah.</p>
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
