'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MahadStore, MahadAuth } from '@/lib/store';
import { Kamar, Mahasantri, UserSession } from '@/lib/types';
import { SK_INFO } from '@/lib/constants';
import {
  BedDouble,
  QrCode,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  Clock,
  MapPin,
  FileCheck,
  Phone,
  LogIn,
  KeyRound,
  FileText,
} from 'lucide-react';

export default function HomePage() {
  const [rooms, setRooms] = useState<Kamar[]>([]);
  const [mhsList, setMhsList] = useState<Mahasantri[]>([]);
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    setRooms(MahadStore.getRooms());
    setMhsList(MahadStore.getMahasantriList());
    setSession(MahadAuth.getSession());

    const handleRoomUpdate = () => setRooms(MahadStore.getRooms());
    const handleMhsUpdate = () => setMhsList(MahadStore.getMahasantriList());
    const handleAuthUpdate = () => setSession(MahadAuth.getSession());

    window.addEventListener('mahad_rooms_updated', handleRoomUpdate);
    window.addEventListener('mahad_mhs_updated', handleMhsUpdate);
    window.addEventListener('mahad_auth_changed', handleAuthUpdate);

    return () => {
      window.removeEventListener('mahad_rooms_updated', handleRoomUpdate);
      window.removeEventListener('mahad_mhs_updated', handleMhsUpdate);
      window.removeEventListener('mahad_auth_changed', handleAuthUpdate);
    };
  }, []);

  const totalKapasitas = rooms.length * 4;
  const totalTerisi = rooms.reduce(
    (acc, r) => acc + r.beds.filter((b) => b.isOccupied).length,
    0
  );
  const totalCheckedIn = mhsList.filter((m) => m.statusCheckIn === 'CHECKED_IN').length;
  const sisaSlot = totalKapasitas - totalTerisi;

  return (
    <div className="space-y-12 pb-16">
      
      {/* ======================================================== */}
      {/* 1. Academic Elite Canvas Hero                            */}
      {/* ======================================================== */}
      <section className="bg-gradient-to-b from-emerald-50/70 via-slate-50/40 to-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/70 relative overflow-hidden">
        {/* Soft Ambient Light Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-radial from-emerald-100/50 via-teal-50/20 to-transparent blur-3xl pointer-events-none -z-0"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-emerald-200/90 shadow-2xs text-xs font-semibold text-emerald-900 backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-uin-primary" />
            <span>Pengumuman Resmi SK Rektor No: {SK_INFO.nomor}</span>
          </div>

          {/* Main Punchy Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-3xl mx-auto leading-[1.12]">
            Sistem Layanan Mandiri &amp; <span className="text-uin-primary">E-Check In</span> Mahasantri
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Mahasantri Baru (berbasis <strong>NISN</strong>), Perpanjangan (berbasis <strong>NIM</strong>), dan Internasional yang lulus SK dapat memilih kamar secara mandiri dan mengunduh <strong>E-Tiket Barcode</strong>.
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            
            {/* 1. Pengurus View */}
            {session?.role === 'PENGURUS' && (
              <>
                <Link
                  href="/scanner"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-uin-primary hover:bg-uin-secondary text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Buka Scanner Kamera Lt. {session.floorAssigned || ''}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/tiket"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs sm:text-sm rounded-lg shadow-2xs hover:shadow-xs transition-all"
                >
                  <span>Cari Data E-Tiket</span>
                </Link>
              </>
            )}

            {/* 2. Admin View */}
            {session?.role === 'ADMIN' && (
              <>
                <Link
                  href="/admin"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-uin-primary hover:bg-uin-secondary text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Dashboard Superadmin</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/scanner"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs sm:text-sm rounded-lg shadow-2xs hover:shadow-xs transition-all"
                >
                  <QrCode className="w-4 h-4 text-uin-primary" />
                  <span>Scanner Lorong</span>
                </Link>
              </>
            )}

            {/* 3. Mahasantri View */}
            {session?.role === 'MAHASANTRI' && (
              <>
                <Link
                  href="/daftar"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-uin-primary hover:bg-uin-secondary text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <BedDouble className="w-4 h-4" />
                  <span>Pilih Kamar &amp; Ranjang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/tiket"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs sm:text-sm rounded-lg shadow-2xs hover:shadow-xs transition-all"
                >
                  <QrCode className="w-4 h-4 text-uin-primary" />
                  <span>Lihat E-Tiket Saya</span>
                </Link>
              </>
            )}

            {/* 4. Guest / Belum Login View */}
            {!session && (
              <>
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-uin-primary hover:bg-uin-secondary text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Akun / Aktivasi PIN</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/daftar"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs sm:text-sm rounded-lg shadow-2xs hover:shadow-xs transition-all"
                >
                  <BedDouble className="w-4 h-4 text-uin-primary" />
                  <span>Pilih Kamar</span>
                </Link>
              </>
            )}

          </div>

          {/* Elevated Live Occupancy Metric Bar */}
          <div className="pt-4 max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-0 sm:divide-x divide-slate-100 text-center">
              <div className="px-2 py-1">
                <span className="text-xs text-slate-500 font-medium block">Total Kamar</span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">{rooms.length}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Jadid &amp; Qodim</span>
              </div>
              <div className="px-2 py-1">
                <span className="text-xs text-slate-500 font-medium block">Total Kapasitas</span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">{totalKapasitas}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Kasur Asrama</span>
              </div>
              <div className="px-2 py-1">
                <span className="text-xs text-slate-500 font-medium block">Sisa Tersedia</span>
                <span className="text-xl sm:text-2xl font-extrabold text-uin-primary tabular-nums">{sisaSlot}</span>
                <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">Kasur Kosong</span>
              </div>
              <div className="px-2 py-1">
                <span className="text-xs text-slate-500 font-medium block">Sudah Check-In</span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-800 tabular-nums">{totalCheckedIn}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Santri Tiba</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. Alur Pelaksanaan Tahapan Check-In                     */}
      {/* ======================================================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-uin-primary bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80 inline-block">
            Alur Pelaksanaan
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tahapan Check-In Digital Mahasantri
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-normal">
            Seluruh tahapan dilakukan secara mandiri dan desentralisasi per lorong kamar lantai.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-uin-primary border border-emerald-100 flex items-center justify-center font-extrabold text-sm">
              1
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Verifikasi &amp; Pilih Kamar</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Mahasantri mengamankan akun dengan PIN 6 digit, lalu memilih posisi kamar dan kasur pada denah lantai secara visual interaktif.
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-uin-primary border border-emerald-100 flex items-center justify-center font-extrabold text-sm">
              2
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Penerbitan E-Tiket Barcode</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Sistem menerbitkan kartu check-in digital dengan QR Code unik, nomor kasur, dan identitas resmi untuk disimpan di ponsel santri.
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-uin-primary border border-emerald-100 flex items-center justify-center font-extrabold text-sm">
              3
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Verifikasi Hari-H &amp; Kunci</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Pada hari kedatangan (19–21 Agustus 2026), santri langsung menuju lorong lantai masing-masing untuk pemindaian barcode oleh pengurus.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. Ketentuan Kedatangan Resmi Berdasarkan SK              */}
      {/* ======================================================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-950/40 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            <div className="space-y-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Jadwal Kedatangan: {SK_INFO.jadwal}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Ketentuan Kedatangan Resmi Ma&apos;had
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Check-in dibuka pada tanggal <strong>19 – 21 Agustus 2026</strong>. Santri dengan domisili luar provinsi atau keperluan khusus dapat berkoordinasi langsung dengan Helpdesk ({SK_INFO.contactPerson}).
              </p>

              <div className="space-y-2 pt-1 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Gedung Jadid: Alokasi Putra (Kamar 09-16) &bull; Putri (Kamar 01-08 &amp; 17-24)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Gedung Qodim: Alokasi Khusus Mahasantri Putri (Kamar 01-24)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Lantai 2: Alokasi Khusus Mahasantri Internasional</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sekretariat Ma&apos;had: {SK_INFO.contactPerson}</span>
                </div>
              </div>
            </div>

            {/* Quick Access Portal Box */}
            <div className="bg-slate-800/70 backdrop-blur-xs rounded-xl p-6 border border-slate-700/80 space-y-3.5 text-center shadow-xs">
              {session?.role === 'PENGURUS' ? (
                <>
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base text-white">Scanner Pengurus Lantai {session.floorAssigned}</h4>
                  <p className="text-xs text-slate-300 font-normal">
                    Gunakan kamera ponsel untuk memindai E-Tiket mahasantri di meja lorong lantai Anda.
                  </p>
                  <Link
                    href="/scanner"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Buka Scanner Kamera</span>
                  </Link>
                </>
              ) : session?.role === 'ADMIN' ? (
                <>
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base text-white">Panel Kontrol Superadmin</h4>
                  <p className="text-xs text-slate-300 font-normal">
                    Kelola data SK Mahasantri, upload PDF lampiran, dan konfigurasi kamar asrama.
                  </p>
                  <Link
                    href="/admin"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Buka Dashboard Superadmin</span>
                  </Link>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base text-white">Portal Masuk Petugas &amp; Admin</h4>
                  <p className="text-xs text-slate-300 font-normal">
                    Pengurus lorong lantai dan pengelola asrama dapat masuk menggunakan kredensial resmi.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Masuk Portal Petugas / Admin</span>
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
