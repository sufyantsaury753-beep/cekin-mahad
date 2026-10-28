'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MahadAuth, MahadStore } from '@/lib/store';
import { UserRole, SKMahasantri } from '@/lib/types';
import { DEFAULT_ADMIN, DEFAULT_PENGURUS_LIST, SK_INFO } from '@/lib/constants';
import Link from 'next/link';
import {
  ShieldCheck,
  User,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Building2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Phone,
  QrCode,
  Users,
  Info,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  // Role Tab: MAHASANTRI | PENGURUS | ADMIN
  const [activeRole, setActiveRole] = useState<UserRole>('MAHASANTRI');

  // Mahasantri Login State
  const [mhsNimNisn, setMhsNimNisn] = useState('');
  const [mhsStep, setMhsStep] = useState<'ENTER_NIM' | 'ENTER_PIN' | 'CREATE_PIN'>('ENTER_NIM');
  const [mhsVerifiedSK, setMhsVerifiedSK] = useState<SKMahasantri | null>(null);
  const [mhsPin, setMhsPin] = useState('');
  const [mhsConfirmPin, setMhsConfirmPin] = useState('');
  const [mhsNoWa, setMhsNoWa] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Pengurus Login State
  const [pengurusList, setPengurusList] = useState<Array<{ id: string; username: string; nama: string; gedung: string; lantai: number; jabatan?: string }>>([]);
  const [pgrUsername, setPgrUsername] = useState('');
  const [pgrPassword, setPgrPassword] = useState('');
  const [showPgrPassword, setShowPgrPassword] = useState(false);

  // Admin Login State
  const [admEmail, setAdmEmail] = useState('');
  const [admPassword, setAdmPassword] = useState('');
  const [showAdmPassword, setShowAdmPassword] = useState(false);

  // Common UI State
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load all dynamic and default Pengurus into dropdown list & init Supabase sync
  useEffect(() => {
    MahadStore.initSupabaseSync();

    const loadPengurus = () => {
      const dynamic = MahadStore.getSKPengurusList();
      const combined: Array<{ id: string; username: string; nama: string; gedung: string; lantai: number; jabatan?: string }> = [];

      dynamic.forEach((p) => {
        combined.push({
          id: p.id,
          username: p.id,
          nama: p.nama,
          gedung: p.gedung,
          lantai: p.lantai,
          jabatan: p.jabatan,
        });
      });

      setPengurusList(combined);
      if (combined.length > 0) {
        setPgrUsername(combined[0].username || combined[0].id);
      }
    };

    loadPengurus();
    window.addEventListener('mahad_sk_pengurus_updated', loadPengurus);
    return () => window.removeEventListener('mahad_sk_pengurus_updated', loadPengurus);
  }, []);

  // Handle Step 1: Check Mahasantri NISN / NIM in SK
  const handleCheckMahasantri = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanInput = mhsNimNisn.trim();
    if (!cleanInput) {
      setError('Masukkan NIM atau NISN Anda.');
      return;
    }

    setLoading(true);
    const mhsSK = MahadStore.getSKByNimNisn(cleanInput);
    setLoading(false);

    if (!mhsSK) {
      setError(
        `Nomor identitas "${cleanInput}" tidak ditemukan pada SK Penetapan Mahasantri. Pastikan nomor yang dimasukkan sesuai dengan lampiran SK resmi.`
      );
      return;
    }

    setMhsVerifiedSK(mhsSK);
    setMhsPin('');

    if (mhsSK.pin) {
      setMhsStep('ENTER_PIN');
    } else {
      setMhsStep('CREATE_PIN');
    }
  };

  // Handle Step 2A: Mahasantri create new PIN (First time)
  const handleActivateMahasantriPin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!mhsVerifiedSK) return;

    if (mhsPin.length < 6) {
      setError('PIN Keamanan minimal 6 digit angka.');
      return;
    }

    if (mhsPin !== mhsConfirmPin) {
      setError('Konfirmasi PIN tidak cocok dengan PIN yang dibuat.');
      return;
    }

    if (!mhsNoWa || mhsNoWa.length < 9) {
      setError('Masukkan nomor WhatsApp aktif Anda untuk pemulihan akun.');
      return;
    }

    setLoading(true);
    const res = MahadAuth.activateMahasantriPIN(mhsVerifiedSK.nimNisn, mhsPin, mhsNoWa);
    setLoading(false);

    if (res.success && res.session) {
      setSuccessMsg(`Selamat ${mhsVerifiedSK.nama}! Akun Anda berhasil diamankan dengan PIN.`);
      setTimeout(() => {
        router.push(redirectParam || '/daftar');
      }, 1200);
    } else {
      setError(res.error || 'Gagal membuat PIN.');
    }
  };

  // Handle Step 2B: Mahasantri login with existing PIN
  const handleLoginMahasantriPin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!mhsVerifiedSK) return;

    setLoading(true);
    const res = MahadAuth.loginMahasantri(mhsVerifiedSK.nimNisn, mhsPin);
    setLoading(false);

    if (res.success && res.session) {
      setSuccessMsg(`Selamat datang kembali, ${mhsVerifiedSK.nama}!`);
      setTimeout(() => {
        router.push(redirectParam || (res.session?.mahasantriData ? `/tiket/${encodeURIComponent(mhsVerifiedSK.nimNisn)}` : '/daftar'));
      }, 1000);
    } else {
      setError(res.error || 'PIN yang Anda masukkan salah.');
    }
  };

  // Handle Pengurus Login
  const handleLoginPengurus = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = MahadAuth.loginPengurus(pgrUsername, pgrPassword);
    setLoading(false);

    if (res.success && res.session) {
      setSuccessMsg(`Berhasil login sebagai ${res.session.name}.`);
      setTimeout(() => {
        router.push(redirectParam || '/scanner');
      }, 1000);
    } else {
      setError(res.error || 'Login pengurus gagal. Periksa kata sandi.');
    }
  };

  // Handle Admin Login
  const handleLoginAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = MahadAuth.loginAdmin(admPassword);
    setLoading(false);

    if (res.success && res.session) {
      setSuccessMsg('Berhasil login sebagai Superadmin Ma\'had.');
      setTimeout(() => {
        router.push(redirectParam || '/admin');
      }, 1000);
    } else {
      setError(res.error || 'Password Superadmin salah.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-10 px-4 bg-gradient-to-b from-emerald-50/50 via-slate-50/30 to-white relative overflow-hidden">
      {/* Soft Ambient Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-radial from-emerald-100/50 to-transparent blur-3xl pointer-events-none -z-0"></div>

      <div className="relative z-10 max-w-[440px] w-full space-y-5">
        
        {/* Main Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5 relative overflow-hidden">
          {/* Top Green Accent Stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-uin-primary via-emerald-600 to-teal-500 absolute top-0 left-0"></div>

          {/* Header Title */}
          <div className="text-center space-y-1.5 pt-1">
            <div className="w-12 h-12 bg-emerald-50 text-uin-primary border border-emerald-200/80 rounded-xl flex items-center justify-center mx-auto shadow-2xs">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Portal Masuk Sistem Ma&apos;had
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed font-normal">
              Pilih peran Anda untuk mengakses sistem check-in &amp; penempatan asrama resmi.
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-3 p-1 bg-slate-100/80 rounded-lg border border-slate-200 gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveRole('MAHASANTRI');
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md transition-all ${
                activeRole === 'MAHASANTRI'
                  ? 'bg-white text-uin-primary shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Mahasantri</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveRole('PENGURUS');
                setPgrPassword('');
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md transition-all ${
                activeRole === 'PENGURUS'
                  ? 'bg-white text-uin-primary shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Pengurus</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRole('ADMIN');
                setAdmEmail('');
                setAdmPassword('');
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md transition-all ${
                activeRole === 'ADMIN'
                  ? 'bg-white text-uin-primary shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-2.5 text-emerald-900 text-xs font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex-1">{successMsg}</div>
            </div>
          )}

        {/* TAB 1: MAHASANTRI LOGIN */}
        {activeRole === 'MAHASANTRI' && (
          <div>
            {/* Step 1: Input NISN / NIM */}
            {mhsStep === 'ENTER_NIM' && (
              <form onSubmit={handleCheckMahasantri} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nomor Identitas (NISN / NIM Sesuai SK)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 0067999651 atau 2530311086"
                      value={mhsNimNisn}
                      onChange={(e) => setMhsNimNisn(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono focus:bg-white focus:border-uin-primary outline-none transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Gunakan nomor identitas yang tercantum pada Surat Keputusan (SK) resmi.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
                >
                  <span>{loading ? 'Memeriksa SK...' : 'Lanjutkan Verifikasi'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Step 2A: Create PIN (First-time Activation) */}
            {mhsStep === 'CREATE_PIN' && mhsVerifiedSK && (
              <form onSubmit={handleActivateMahasantriPin} className="space-y-3.5">
                
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-0.5">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-semibold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Identitas Terdaftar di SK Resmi</span>
                  </div>
                  <p className="text-xs text-slate-800 font-semibold">{mhsVerifiedSK.nama}</p>
                  <p className="text-[11px] text-slate-500">{mhsVerifiedSK.jurusan} &bull; {mhsVerifiedSK.fakultas}</p>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <p>
                    <strong>Aktivasi Pertama Kali:</strong> Buat <strong>PIN Rahasia 6-Digit</strong> untuk mengamankan akun dan pemilihan kamar Anda.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Buat PIN Baru (6 Digit) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={6}
                      required
                      placeholder="Contoh: 123456"
                      value={mhsPin}
                      onChange={(e) => setMhsPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono focus:bg-white focus:border-uin-primary outline-none tracking-widest transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Konfirmasi Ulang PIN (6 Digit) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={6}
                      required
                      placeholder="Ulangi 6 digit PIN"
                      value={mhsConfirmPin}
                      onChange={(e) => setMhsConfirmPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono focus:bg-white focus:border-uin-primary outline-none tracking-widest transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="081234567890"
                      value={mhsNoWa}
                      onChange={(e) => setMhsNoWa(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:bg-white focus:border-uin-primary outline-none font-mono transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Digunakan untuk konfirmasi dan bantuan pemulihan PIN.</p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setMhsStep('ENTER_NIM');
                      setError(null);
                    }}
                    className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
                  >
                    Kembali
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{loading ? 'Menyimpan PIN...' : 'Simpan PIN & Lanjut'}</span>
                  </button>
                </div>

              </form>
            )}

            {/* Step 2B: Login with existing PIN */}
            {mhsStep === 'ENTER_PIN' && mhsVerifiedSK && (
              <form onSubmit={handleLoginMahasantriPin} className="space-y-3.5">
                
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Akun Mahasantri Terverifikasi</span>
                  <h3 className="text-sm font-semibold text-slate-900">{mhsVerifiedSK.nama}</h3>
                  <p className="text-[11px] text-slate-500">NIM/NISN: {mhsVerifiedSK.nimNisn} &bull; {mhsVerifiedSK.jurusan}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Masukkan PIN Rahasia Anda (6 Digit)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={6}
                      required
                      placeholder="Masukkan 6 Digit PIN"
                      value={mhsPin}
                      onChange={(e) => setMhsPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono focus:bg-white focus:border-uin-primary outline-none tracking-widest transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => {
                      setMhsStep('ENTER_NIM');
                      setMhsPin('');
                      setError(null);
                    }}
                    className="hover:underline text-slate-600 font-medium"
                  >
                    Ganti NISN / NIM
                  </button>

                  <a
                    href={`https://wa.me/${SK_INFO.contactPerson.replace(/\D/g, '')}?text=Halo%20Admin%20Mahad,%20saya%20lupa%20PIN%20Mahasantri%20atas%20nama%20${encodeURIComponent(mhsVerifiedSK.nama)}%20(NIM/NISN:%20${mhsVerifiedSK.nimNisn})`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-uin-primary hover:underline font-semibold"
                  >
                    Lupa PIN?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{loading ? 'Memverifikasi...' : 'Buka Portal Mahasantri'}</span>
                </button>

              </form>
            )}

          </div>
        )}

        {/* TAB 2: PENGURUS LORONG LANTAI LOGIN */}
        {activeRole === 'PENGURUS' && (
          <form onSubmit={handleLoginPengurus} className="space-y-3.5" autoComplete="off">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Pilih Nama Petugas Pengurus / Mudabbir
              </label>
              <select
                value={pgrUsername}
                onChange={(e) => {
                  setPgrUsername(e.target.value);
                  setPgrPassword('');
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-uin-primary outline-none transition-colors"
              >
                {pengurusList.map((p) => (
                  <option key={p.id || p.username} value={p.username || p.id}>
                    {p.nama} • {p.gedung} Lt.{p.lantai}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password Petugas Pengurus
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPgrPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Masukkan Password Pengurus"
                  value={pgrPassword}
                  onChange={(e) => setPgrPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono focus:bg-white focus:border-uin-primary outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPgrPassword(!showPgrPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPgrPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>{loading ? 'Masuk...' : 'Masuk ke Panel Scanner Lantai'}</span>
            </button>
          </form>
        )}

        {/* TAB 3: ADMIN LOGIN */}
        {activeRole === 'ADMIN' && (
          <form onSubmit={handleLoginAdmin} className="space-y-3.5" autoComplete="off">
            <input type="text" name="prevent_autofill_fake_user" style={{ display: 'none' }} tabIndex={-1} />
            <input type="password" name="prevent_autofill_fake_pass" style={{ display: 'none' }} tabIndex={-1} />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Superadmin
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="admin_login_auth_identity"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  required
                  placeholder="admin@mahad.uinssc.ac.id"
                  value={admEmail}
                  onChange={(e) => setAdmEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono focus:bg-white focus:border-uin-primary outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password Superadmin
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showAdmPassword ? 'text' : 'password'}
                  name="admin_login_auth_secret_key"
                  autoComplete="new-password"
                  required
                  placeholder="Masukkan Password Superadmin"
                  value={admPassword}
                  onChange={(e) => setAdmPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono focus:bg-white focus:border-uin-primary outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowAdmPassword(!showAdmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showAdmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Masuk...' : 'Masuk Dashboard Superadmin'}</span>
            </button>
          </form>
        )}

          {/* Security & Official Notice */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Enkripsi PIN &amp; Verifikasi SK Resmi UIN Siber Cirebon</span>
          </div>
        </div>

        {/* Info Helpdesk */}
        <div className="text-center text-xs text-slate-500 space-y-0.5">
          <p>Bantuan teknis atau kendala verifikasi identitas:</p>
          <p>Sekretariat Ma&apos;had: <strong className="text-slate-700 font-semibold">{SK_INFO.contactPerson}</strong></p>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="max-w-xl mx-auto py-20 text-center text-slate-500 text-sm">Memuat Portal Login...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
