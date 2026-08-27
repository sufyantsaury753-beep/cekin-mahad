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
  Sparkles,
  QrCode,
  Users,
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
  const [pgrUsername, setPgrUsername] = useState('pengurus.lt5');
  const [pgrPassword, setPgrPassword] = useState('mahad2026');
  const [showPgrPassword, setShowPgrPassword] = useState(false);

  // Admin Login State
  const [admEmail, setAdmEmail] = useState(DEFAULT_ADMIN.email);
  const [admPassword, setAdmPassword] = useState(DEFAULT_ADMIN.password);
  const [showAdmPassword, setShowAdmPassword] = useState(false);

  // Common UI State
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const session = MahadAuth.getSession();
    if (session) {
      if (redirectParam) {
        router.push(redirectParam);
      }
    }
  }, [router, redirectParam]);

  // Handle Step 1: Mahasantri checks NISN
  const handleCheckMahasantri = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!mhsNimNisn.trim()) {
      setError('Masukkan NIM atau NISN Anda terlebih dahulu.');
      return;
    }

    setLoading(true);
    const check = MahadAuth.checkMahasantriLogin(mhsNimNisn.trim());
    setLoading(false);

    if (!check.found || !check.skData) {
      setError(check.error || 'NIM / NISN tidak terdaftar di SK.');
      return;
    }

    setMhsVerifiedSK(check.skData);

    if (check.isPinSet) {
      // Already has PIN -> Enter PIN
      setMhsStep('ENTER_PIN');
    } else {
      // First time -> Create PIN
      setMhsStep('CREATE_PIN');
      if (check.skData.noWaRegistered) {
        setMhsNoWa(check.skData.noWaRegistered);
      }
    }
  };

  // Handle Step 2A: Mahasantri sets up new PIN
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
      setSuccessMsg(`Berhasil login sebagai ${res.session.name}!`);
      setTimeout(() => {
        router.push(redirectParam || '/scanner');
      }, 1000);
    } else {
      setError(res.error || 'Login pengurus gagal.');
    }
  };

  // Handle Admin Login
  const handleLoginAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = MahadAuth.loginAdmin(admEmail, admPassword);
    setLoading(false);

    if (res.success && res.session) {
      setSuccessMsg('Berhasil login sebagai Superadmin Ma\'had!');
      setTimeout(() => {
        router.push(redirectParam || '/admin');
      }, 1000);
    } else {
      setError(res.error || 'Login admin gagal.');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-8">
      
      {/* Header Title */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-uin-primary/10 rounded-2xl flex items-center justify-center text-uin-primary mx-auto shadow-sm">
          <KeyRound className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-800">
          Portal Masuk Sistem Ma&apos;had
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Pilih jenis akun Anda untuk mengakses sistem check-in &amp; manajemen asrama UIN Siber Syekh Nurjati Cirebon.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 gap-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setActiveRole('MAHASANTRI');
            setError(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all ${
            activeRole === 'MAHASANTRI'
              ? 'bg-white text-uin-primary shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Mahasantri</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveRole('PENGURUS');
            setError(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all ${
            activeRole === 'PENGURUS'
              ? 'bg-white text-uin-primary shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Pengurus Lorong</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveRole('ADMIN');
            setError(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all ${
            activeRole === 'ADMIN'
              ? 'bg-white text-uin-primary shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Admin</span>
        </button>
      </div>

      {/* Main Login Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2.5 text-emerald-900 text-xs font-bold">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex-1">{successMsg}</div>
          </div>
        )}

        {/* TAB 1: MAHASANTRI LOGIN */}
        {activeRole === 'MAHASANTRI' && (
          <div>
            
            {/* Step 1: Input NISN / NIM */}
            {mhsStep === 'ENTER_NIM' && (
              <form onSubmit={handleCheckMahasantri} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nomor Induk Siswa Nasional (NISN) atau NIM Sesuai SK
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh NISN: 0067999651 atau NIM: 2530311086"
                      value={mhsNimNisn}
                      onChange={(e) => setMhsNimNisn(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-uin-primary/30 outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Gunakan nomor identitas yang tercantum di SK Pengumuman No: {SK_INFO.nomor}.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-uin-primary hover:bg-uin-secondary text-white font-bold text-sm rounded-xl shadow-md transition-all"
                >
                  <span>{loading ? 'Memeriksa SK...' : 'Lanjutkan Verifikasi Identitas'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Step 2A: Create PIN (First-time Activation) */}
            {mhsStep === 'CREATE_PIN' && mhsVerifiedSK && (
              <form onSubmit={handleActivateMahasantriPin} className="space-y-4">
                
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Identitas Terdaftar di SK Resmi!</span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold">{mhsVerifiedSK.nama}</p>
                  <p className="text-[11px] text-slate-500">{mhsVerifiedSK.jurusan} &bull; {mhsVerifiedSK.fakultas}</p>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Aktivasi Pertama Kali:</strong> Buat <strong>PIN Rahasia 6-Digit</strong> agar akun Anda tidak bisa diakses atau disalahgunakan oleh teman/orang lain.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Buat PIN Rahasia 6-Digit <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={6}
                      required
                      placeholder="Contoh: 123456"
                      value={mhsPin}
                      onChange={(e) => setMhsPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-uin-primary/30 outline-none tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Konfirmasi Ulang PIN 6-Digit <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={6}
                      required
                      placeholder="Ketik ulang PIN yang sama"
                      value={mhsConfirmPin}
                      onChange={(e) => setMhsConfirmPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-uin-primary/30 outline-none tracking-widest"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp Aktif Mahasantri <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={mhsNoWa}
                      onChange={(e) => setMhsNoWa(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-uin-primary/30 outline-none font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Digunakan untuk konfirmasi dan bantuan pemulihan PIN jika lupa.</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMhsStep('ENTER_NIM');
                      setError(null);
                    }}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                  >
                    Kembali
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-uin-primary hover:bg-uin-secondary text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{loading ? 'Menyimpan PIN...' : 'Simpan PIN & Lanjut Masuk'}</span>
                  </button>
                </div>

              </form>
            )}

            {/* Step 2B: Login with existing PIN */}
            {mhsStep === 'ENTER_PIN' && mhsVerifiedSK && (
              <form onSubmit={handleLoginMahasantriPin} className="space-y-4">
                
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-uin-primary">Akun Mahasantri Terverifikasi</span>
                  <h3 className="text-base font-bold text-slate-800">{mhsVerifiedSK.nama}</h3>
                  <p className="text-xs text-slate-500">NIM/NISN: {mhsVerifiedSK.nimNisn} &bull; {mhsVerifiedSK.jurusan}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Masukkan PIN Rahasia Anda (6 Digit)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={6}
                      required
                      placeholder="Masukkan 6 Digit PIN"
                      value={mhsPin}
                      onChange={(e) => setMhsPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-uin-primary/30 outline-none tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
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
                    className="text-uin-primary hover:underline font-bold"
                  >
                    Lupa PIN?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-uin-primary hover:bg-uin-secondary text-white font-bold text-sm rounded-xl shadow-md transition-all"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? 'Memverifikasi...' : 'Buka Portal Mahasantri'}</span>
                </button>

              </form>
            )}

          </div>
        )}

        {/* TAB 2: PENGURUS LORONG LANTAI LOGIN */}
        {activeRole === 'PENGURUS' && (
          <form onSubmit={handleLoginPengurus} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pilih Akun Petugas Pengurus Lantai
              </label>
              <select
                value={pgrUsername}
                onChange={(e) => {
                  setPgrUsername(e.target.value);
                  setPgrPassword('mahad2026');
                }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-uin-primary/30 outline-none"
              >
                {DEFAULT_PENGURUS_LIST.map((p) => (
                  <option key={p.id} value={p.username}>
                    {p.nama} &bull; {p.username}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password / PIN Pengurus
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPgrPassword ? 'text' : 'password'}
                  required
                  value={pgrPassword}
                  onChange={(e) => setPgrPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-uin-primary/30 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPgrPassword(!showPgrPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPgrPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Default Demo: Password <code>mahad2026</code></p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>{loading ? 'Masuk...' : 'Masuk ke Panel Scanner Lantai'}</span>
            </button>

          </form>
        )}

        {/* TAB 3: ADMIN LOGIN */}
        {activeRole === 'ADMIN' && (
          <form onSubmit={handleLoginAdmin} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Superadmin
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={admEmail}
                  onChange={(e) => setAdmEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-uin-primary/30 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password Superadmin
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showAdmPassword ? 'text' : 'password'}
                  required
                  value={admPassword}
                  onChange={(e) => setAdmPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-uin-primary/30 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowAdmPassword(!showAdmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showAdmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Default Demo: Password <code>adminmahad2026</code></p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-md transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{loading ? 'Masuk...' : 'Masuk Dashboard Superadmin'}</span>
            </button>

          </form>
        )}

      </div>

      {/* Info Helpdesk */}
      <div className="text-center text-xs text-slate-500 space-y-1">
        <p>Butuh bantuan atau kendala login?</p>
        <p>Hubungi Helpdesk Ma&apos;had: <strong className="text-slate-700">{SK_INFO.contactPerson}</strong></p>
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
