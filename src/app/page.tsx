'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MahadStore } from '@/lib/store';
import { Kamar, Mahasantri } from '@/lib/types';
import {
  BedDouble,
  QrCode,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  Clock,
  MapPin,
  FileCheck,
} from 'lucide-react';

export default function HomePage() {
  const [rooms, setRooms] = useState<Kamar[]>([]);
  const [mhsList, setMhsList] = useState<Mahasantri[]>([]);

  useEffect(() => {
    setRooms(MahadStore.getRooms());
    setMhsList(MahadStore.getMahasantriList());

    const handleRoomUpdate = () => setRooms(MahadStore.getRooms());
    const handleMhsUpdate = () => setMhsList(MahadStore.getMahasantriList());

    window.addEventListener('mahad_rooms_updated', handleRoomUpdate);
    window.addEventListener('mahad_mhs_updated', handleMhsUpdate);

    return () => {
      window.removeEventListener('mahad_rooms_updated', handleRoomUpdate);
      window.removeEventListener('mahad_mhs_updated', handleMhsUpdate);
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
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-uin-dark via-uin-primary to-emerald-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-uin-accent/15 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold text-uin-accent">
            <Sparkles className="w-4 h-4" />
            <span>Sistem E-Checkin &amp; Pemilihan Kamar Digital Terdistribusi</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-serif text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            Check-In Mahasantri Cepat, Mandiri, &amp; <span className="text-uin-accent">Bebas Macet</span>
          </h1>

          <p className="text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Pilih kamar dan ranjang favoritmu dari rumah, dapatkan <strong>E-Tiket Barcode</strong>, dan langsung menuju ke kamar saat Hari-H tanpa perlu antre di lobi bawah.
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/daftar"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-uin-accent text-slate-950 font-bold text-base rounded-2xl hover:bg-amber-300 shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <BedDouble className="w-5 h-5" />
              <span>Pilih Kamar &amp; Daftar Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/tiket"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-base rounded-2xl border border-white/25 backdrop-blur transition-all"
            >
              <QrCode className="w-5 h-5 text-emerald-300" />
              <span>Cek E-Tiket Saya</span>
            </Link>
          </div>

          {/* Live Occupancy Metric Bar */}
          <div className="pt-8 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 sm:p-5 border border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <span className="text-xs text-emerald-200 block">Total Kamar</span>
                <span className="text-xl sm:text-2xl font-bold font-mono">{rooms.length} Kamar</span>
              </div>
              <div>
                <span className="text-xs text-emerald-200 block">Total Kapasitas</span>
                <span className="text-xl sm:text-2xl font-bold font-mono">{totalKapasitas} Bed</span>
              </div>
              <div>
                <span className="text-xs text-emerald-200 block">Sisa Bed Kosong</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-uin-accent">{sisaSlot} Bed</span>
              </div>
              <div>
                <span className="text-xs text-emerald-200 block">Sudah Masuk (Hari-H)</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-300">{totalCheckedIn} Mahasantri</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Alur Kerja Baru vs Masalah Lama */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-uin-secondary">Solusi Digital</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-800">
            Bagaimana Sistem Ini Menghilangkan Antrean?
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Beban kedatangan disebar ke seluruh lantai kamar sehingga tidak ada penumpukan kendaraan di gerbang ma&apos;had.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-uin-secondary transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-uin-primary flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="font-bold text-lg text-slate-800">Pilih Kamar dari Rumah</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Mahasantri mengisi identitas dan memilih lantai serta nomor ranjang (misal: Kamar 513 Bed 2 di Jajaran Belakang) secara mandiri.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-uin-secondary transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="font-bold text-lg text-slate-800">Dapatkan E-Tiket &amp; Barcode</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sistem langsung menerbitkan kartu check-in digital lengkap dengan QR Code terenkripsi yang dapat disimpan di galeri smartphone atau dicetak.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-uin-secondary transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="font-bold text-lg text-slate-800">Langsung ke Lantai &amp; Terima Kunci</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pada Hari-H, mahasantri langsung berjalan menuju kamarnya. Pengurus lorong lantai men-scan barcode dan menyerahkan kunci dalam 30 detik.
            </p>
          </div>

        </div>
      </section>

      {/* Info Periode 3 Hari & Lokasi */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-uin-dark text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-uin-accent flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Periode Check-In Fleksibel 3 Hari
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-snug">
                Datang Kapan Saja Sesuai Kenyamanan Perjalanan Anda
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Tidak ada batasan jam antrean kaku. Mahasantri dari luar kota dapat tiba kapan pun selama 3 hari periode check-in dibuka. Pengurus standby di lorong lantai masing-masing.
              </p>

              <div className="space-y-2 pt-2 text-xs sm:text-sm text-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-uin-accent shrink-0" />
                  <span>Kamar 513–516: Jajaran Belakang (Sisi Utara)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-uin-accent shrink-0" />
                  <span>Kamar 509–512: Jajaran Depan (Sisi Selatan)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-uin-accent shrink-0" />
                  <span>Lantai 2: Alokasi Khusus Mahasiswa Asing / Internasional</span>
                </div>
              </div>
            </div>

            {/* Quick Officer Access Box */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20 space-y-4 text-center">
              <ShieldCheck className="w-10 h-10 text-uin-accent mx-auto" />
              <h4 className="font-bold text-lg text-white">Petugas Pengurus Lantai?</h4>
              <p className="text-xs text-slate-300">
                Gunakan menu Scanner di HP untuk memindai QR E-Tiket mahasantri di lorong kamar Anda saat Hari-H.
              </p>
              <Link
                href="/scanner"
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow transition-all"
              >
                <QrCode className="w-4 h-4" />
                <span>Buka Scanner Kamera Hari-H</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
