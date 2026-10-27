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
    <div className="space-y-10 pb-12">
      
      {/* Institutional Hero Section */}
      <section className="bg-slate-900 border-b border-slate-800 text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-800/80 border border-slate-700 text-xs font-medium text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pengumuman Resmi SK Rektor No: {SK_INFO.nomor}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-[1.15]">
            Sistem Layanan Mandiri &amp; E-Check In Mahasantri
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Mahasantri Baru (berbasis <strong>NISN</strong>), Perpanjangan (berbasis <strong>NIM</strong>), dan Internasional yang lulus SK dapat memilih kamar secara mandiri dan mengunduh <strong>E-Tiket Barcode</strong>.
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            
            {/* 1. Pengurus View */}
            {session?.role === 'PENGURUS' && (
              <>
                <Link
                  href="/scanner"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Buka Scanner Kamera Lt. {session.floorAssigned || ''}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/tiket"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-medium text-xs sm:text-sm rounded-lg transition-colors"
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Dashboard Superadmin</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/scanner"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-medium text-xs sm:text-sm rounded-lg transition-colors"
                >
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>Scanner Lorong</span>
                </Link>
              </>
            )}

            {/* 3. Mahasantri View */}
            {session?.role === 'MAHASANTRI' && (
              <>
                <Link
                  href="/daftar"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
                >
                  <BedDouble className="w-4 h-4" />
                  <span>Pilih Kamar &amp; Ranjang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/tiket"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-medium text-xs sm:text-sm rounded-lg transition-colors"
                >
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>Lihat E-Tiket Saya</span>
                </Link>
              </>
            )}

            {/* 4. Guest / Belum Login View */}
            {!session && (
              <>
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Akun / Aktivasi PIN</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/daftar"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-medium text-xs sm:text-sm rounded-lg transition-colors"
                >
                  <BedDouble className="w-4 h-4 text-emerald-400" />
                  <span>Pilih Kamar</span>
                </Link>
              </>
            )}

          </div>

          {/* Live Occupancy Metric Bar */}
          <div className="pt-6 max-w-3xl mx-auto">
            <div className="bg-slate-800/80 rounded-lg p-3.5 sm:p-4 border border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <span className="text-[11px] text-slate-400 block uppercase font-medium">Total Kamar</span>
                <span className="text-lg sm:text-xl font-bold font-mono text-white">{rooms.length}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block uppercase font-medium">Total Kapasitas</span>
                <span className="text-lg sm:text-xl font-bold font-mono text-white">{totalKapasitas} Bed</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block uppercase font-medium">Sisa Tersedia</span>
                <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400">{sisaSlot} Bed</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block uppercase font-medium">Sudah Check-In</span>
                <span className="text-lg sm:text-xl font-bold font-mono text-slate-200">{totalCheckedIn} Santri</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Alur Kerja Check-In */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-uin-secondary">Alur Pelaksanaan</span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Tahapan Check-In Digital Mahasantri
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Seluruh tahapan dilakukan secara mandiri dan desentralisasi per lorong kamar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-uin-primary border border-emerald-100 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-semibold text-sm text-slate-900">Verifikasi &amp; Pilih Kamar</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mahasantri mengamankan akun dengan PIN 6 digit, lalu memilih posisi kamar dan kasur pada denah lantai secara visual.
            </p>
          </div>

          <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-2.5">
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-semibold text-sm text-slate-900">Penerbitan E-Tiket Barcode</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sistem menerbitkan kartu check-in digital dengan QR Code unik, nomor kasur, dan identitas resmi untuk disimpan di HP.
            </p>
          </div>

          <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-2.5">
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-semibold text-sm text-slate-900">Verifikasi Hari-H &amp; Kunci</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pada hari kedatangan (19–21 Agustus 2026), santri langsung menuju kamar lantai masing-masing untuk pemindaian barcode pengurus.
            </p>
          </div>
        </div>
      </section>

      {/* Ketentuan Kedatangan Berdasarkan SK */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-xl p-5 sm:p-7 border border-slate-800 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            
            <div className="space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Jadwal Kedatangan: {SK_INFO.jadwal}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Ketentuan Kedatangan Resmi Ma&apos;had
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Check-in dibuka pada tanggal <strong>19 – 21 Agustus 2026</strong>. Santri dengan domisili luar provinsi atau keperluan khusus dapat berkoordinasi dengan Helpdesk ({SK_INFO.contactPerson}).
              </p>

              <div className="space-y-1.5 pt-1 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Gedung Jadid: Alokasi Putra (Kamar 09-16) &bull; Putri (Kamar 01-08 &amp; 17-24)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Gedung Qodim: Alokasi Khusus Mahasantri Putri (Kamar 01-24)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Lantai 2: Alokasi Khusus Mahasantri Internasional</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Sekretariat Ma&apos;had: {SK_INFO.contactPerson}</span>
                </div>
              </div>
            </div>

            {/* Quick Access Box */}
            <div className="bg-slate-800/80 rounded-lg p-5 border border-slate-700 space-y-3 text-center">
              {session?.role === 'PENGURUS' ? (
                <>
                  <QrCode className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="font-semibold text-sm text-white">Scanner Pengurus Lantai {session.floorAssigned}</h4>
                  <p className="text-xs text-slate-400">
                    Gunakan kamera HP untuk memindai E-Tiket mahasantri di meja lorong lantai Anda.
                  </p>
                  <Link
                    href="/scanner"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Buka Scanner Kamera</span>
                  </Link>
                </>
              ) : session?.role === 'ADMIN' ? (
                <>
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="font-semibold text-sm text-white">Panel Kontrol Superadmin</h4>
                  <p className="text-xs text-slate-400">
                    Kelola data SK Mahasantri, upload PDF lampiran, dan konfigurasi kamar asrama.
                  </p>
                  <Link
                    href="/admin"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Buka Dashboard Superadmin</span>
                  </Link>
                </>
              ) : (
                <>
                  <KeyRound className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="font-semibold text-sm text-white">Portal Masuk Petugas &amp; Admin</h4>
                  <p className="text-xs text-slate-400">
                    Pengurus lorong lantai dan pengelola asrama dapat masuk menggunakan kredensial resmi.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
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
