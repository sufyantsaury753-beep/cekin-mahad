'use client';

import React, { useState, useEffect } from 'react';
import { MahadStore } from '@/lib/store';
import { Kamar, Mahasantri, CheckInLog, SKMahasantri, Gender, JenisPendaftaran } from '@/lib/types';
import { FAKULTAS_LIST, SK_INFO } from '@/lib/constants';
import SKUploadModal from '@/components/admin/SKUploadModal';
import {
  ShieldCheck,
  Building2,
  Users,
  Lock,
  Unlock,
  Download,
  RotateCcw,
  Search,
  CheckCircle,
  Clock,
  Sparkles,
  AlertCircle,
  FileSpreadsheet,
  Plus,
  UserCheck,
  FileText,
  FileUp,
} from 'lucide-react';

export default function AdminPage() {
  const [rooms, setRooms] = useState<Kamar[]>([]);
  const [mhsList, setMhsList] = useState<Mahasantri[]>([]);
  const [skList, setSkList] = useState<SKMahasantri[]>([]);
  const [logs, setLogs] = useState<CheckInLog[]>([]);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'MONITORING' | 'SK_MASTER'>('MONITORING');

  // Filters
  const [filterFloor, setFilterFloor] = useState<number | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'REGISTERED' | 'CHECKED_IN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // SK Master Data Search & Filters
  const [skSearchQuery, setSkSearchQuery] = useState('');
  const [skFilterBooking, setSkFilterBooking] = useState<'ALL' | 'BOOKED' | 'UNBOOKED'>('ALL');
  const [skFilterJenis, setSkFilterJenis] = useState<'ALL' | 'MABA' | 'PERPANJANGAN' | 'INTERNASIONAL'>('ALL');

  // Upload SK Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Add SK Form Modal/State
  const [newNimNisn, setNewNimNisn] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newJenis, setNewJenis] = useState<JenisPendaftaran>('Calon Mahasantri Baru');
  const [newFakultas, setNewFakultas] = useState('FITK');
  const [newJurusan, setNewJurusan] = useState('');
  const [newGender, setNewGender] = useState<Gender>('L');
  const [newIsInt, setNewIsInt] = useState(false);
  const [newNegara, setNewNegara] = useState('');
  const [showAddSkModal, setShowAddSkModal] = useState(false);

  const [notification, setNotification] = useState<string | null>(null);

  const loadData = () => {
    setRooms(MahadStore.getRooms());
    setMhsList(MahadStore.getMahasantriList());
    setSkList(MahadStore.getSKList());
    setLogs(MahadStore.getLogs());
  };

  useEffect(() => {
    loadData();

    const handleRoomUpdate = () => loadData();
    const handleMhsUpdate = () => loadData();
    const handleSkUpdate = () => loadData();

    window.addEventListener('mahad_rooms_updated', handleRoomUpdate);
    window.addEventListener('mahad_mhs_updated', handleMhsUpdate);
    window.addEventListener('mahad_sk_updated', handleSkUpdate);

    return () => {
      window.removeEventListener('mahad_rooms_updated', handleRoomUpdate);
      window.removeEventListener('mahad_mhs_updated', handleMhsUpdate);
      window.removeEventListener('mahad_sk_updated', handleSkUpdate);
    };
  }, []);

  // Filtered Mahasantri List
  const filteredMhs = mhsList.filter((m) => {
    const matchFloor = filterFloor === 'ALL' || m.lantai === filterFloor;
    const matchStatus = filterStatus === 'ALL' || m.statusCheckIn === filterStatus;
    const matchQuery =
      !searchQuery ||
      m.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nimNisn.includes(searchQuery) ||
      m.nomorKamar.includes(searchQuery);
    return matchFloor && matchStatus && matchQuery;
  });

  // Filtered SK Whitelist
  const filteredSkList = skList.filter((item) => {
    const booking = mhsList.find(
      (m) => m.nimNisn.trim().toLowerCase() === item.nimNisn.trim().toLowerCase()
    );

    const q = skSearchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      item.nama.toLowerCase().includes(q) ||
      item.nimNisn.toLowerCase().includes(q) ||
      item.jurusan.toLowerCase().includes(q) ||
      item.fakultas.toLowerCase().includes(q) ||
      (item.asalNegara && item.asalNegara.toLowerCase().includes(q));

    const matchBooking =
      skFilterBooking === 'ALL' ||
      (skFilterBooking === 'BOOKED' && Boolean(booking)) ||
      (skFilterBooking === 'UNBOOKED' && !booking);

    const matchJenis =
      skFilterJenis === 'ALL' ||
      (skFilterJenis === 'MABA' && item.jenisPendaftaran === 'Calon Mahasantri Baru') ||
      (skFilterJenis === 'PERPANJANGAN' && item.jenisPendaftaran === 'Perpanjangan') ||
      (skFilterJenis === 'INTERNASIONAL' && item.isInternasional);

    return matchQuery && matchBooking && matchJenis;
  });

  // Calculate Statistics
  const totalBeds = rooms.length * 4;
  const totalOccupied = rooms.reduce(
    (acc, r) => acc + r.beds.filter((b) => b.isOccupied).length,
    0
  );
  const totalCheckedIn = mhsList.filter((m) => m.statusCheckIn === 'CHECKED_IN').length;
  const totalRegistered = mhsList.length;

  // Toggle Floor Lock (e.g. Lantai 2 International)
  const handleToggleFloorLock = (floor: number, currentlyLocked: boolean) => {
    const nextState = !currentlyLocked;
    const reason = nextState ? (floor === 2 ? 'Khusus Mahasantri Internasional' : `Lantai ${floor} dikunci Admin`) : undefined;
    MahadStore.toggleFloorLock(floor, nextState, reason);
    setNotification(`Status kunci Lantai ${floor} berhasil diubah.`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Add Student to SK Whitelist
  const handleAddSk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNimNisn.trim() || !newNama.trim()) return;

    MahadStore.addSKMahasantri({
      no: skList.length + 1,
      nimNisn: newNimNisn.trim(),
      nama: newNama.trim(),
      jenisKelamin: newGender,
      jenisPendaftaran: newJenis,
      fakultas: newFakultas,
      jurusan: newJurusan.trim() || 'PAI',
      asalNegara: newIsInt ? (newNegara || 'Internasional') : undefined,
      isInternasional: newIsInt,
      skNomor: SK_INFO.nomor,
    });

    setNotification(`Mahasantri ${newNama} (NIM/NISN: ${newNimNisn}) berhasil ditambahkan ke SK.`);
    setNewNimNisn('');
    setNewNama('');
    setNewJurusan('');
    setNewNegara('');
    setShowAddSkModal(false);
    setTimeout(() => setNotification(null), 3500);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'NIM/NISN',
      'Nama Lengkap',
      'Jenis Pendaftaran',
      'Fakultas',
      'Jurusan',
      'No WA',
      'Kamar',
      'Lantai',
      'Jajaran',
      'Nomor Bed',
      'Internasional',
      'Status Checkin',
      'Waktu Checkin',
      'Petugas',
      'Catatan Barang',
    ];

    const rows = mhsList.map((m) => [
      `"${m.nimNisn}"`,
      `"${m.nama}"`,
      `"${m.jenisPendaftaran}"`,
      `"${m.fakultas}"`,
      `"${m.jurusan}"`,
      `"${m.noWa}"`,
      `"${m.nomorKamar}"`,
      m.lantai,
      `"${m.jajaran}"`,
      m.bedNumber,
      m.isInternasional ? `Ya (${m.asalNegara || '-'})` : 'Tidak',
      `"${m.statusCheckIn}"`,
      `"${m.checkInTimestamp || '-'}"`,
      `"${m.checkedInBy || '-'}"`,
      `"${m.catatanBarang || '-'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Checkin_Mahad_SK_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-uin-primary">Panel Superadmin</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              SK No: {SK_INFO.nomor}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-800">
            Dashboard Okupansi &amp; Manajemen SK Ma&apos;had
          </h1>
          <p className="text-xs text-slate-500">
            Kendali penuh alokasi kamar, verifikasi NISN/NIM SK Mahad, dan rekapitulasi kedatangan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Data (CSV)</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin mereset semua data simulasi ke data awal?')) {
                MahadStore.resetToDefault();
              }
            }}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('MONITORING')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all ${
            activeTab === 'MONITORING'
              ? 'border-uin-primary text-uin-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Monitoring Okupansi &amp; Check-In</span>
        </button>

        <button
          onClick={() => setActiveTab('SK_MASTER')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all ${
            activeTab === 'SK_MASTER'
              ? 'border-uin-primary text-uin-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Master Data SK Resmi (NISN/NIM Whitelist)</span>
          <span className="bg-uin-primary/10 text-uin-primary text-xs px-2 py-0.5 rounded-full font-mono">
            {skList.length} Nama
          </span>
        </button>
      </div>

      {activeTab === 'MONITORING' && (
        <div className="space-y-8">
          
          {/* Top Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-medium">Total Kapasitas Ma&apos;had</span>
              <div className="text-2xl font-bold text-slate-800 font-mono">{totalBeds} Bed</div>
              <span className="text-[11px] text-slate-400">5 Lantai &bull; 40 Kamar</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-medium">Mahasantri Memilih Kamar</span>
              <div className="text-2xl font-bold text-uin-primary font-mono">{totalRegistered} Orang</div>
              <span className="text-[11px] text-slate-400">{Math.round((totalRegistered / totalBeds) * 100)}% Okupansi Terisi</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-medium">Sudah Masuk di Lantai</span>
              <div className="text-2xl font-bold text-emerald-600 font-mono">{totalCheckedIn} Orang</div>
              <span className="text-[11px] text-emerald-700 font-medium">
                {totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0}% Mahasantri Hadir
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-medium">Sisa Ranjang Kosong</span>
              <div className="text-2xl font-bold text-amber-600 font-mono">{totalBeds - totalOccupied} Bed</div>
              <span className="text-[11px] text-slate-400">Siap dipilih mahasantri SK</span>
            </div>
          </div>

          {/* Kontrol & Manajemen Lantai (Lock / Unlock Lantai) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-uin-primary" />
                  Kontrol Akses Pemilihan Kamar Per Lantai
                </h2>
                <p className="text-xs text-slate-500">
                  Admin dapat mengunci atau membuka lantai tertentu (contoh: Lantai 2 dikhususkan untuk Mahasantri Internasional).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((floor) => {
                const floorRooms = rooms.filter((r) => r.lantai === floor);
                const isFloorLocked = floorRooms.some((r) => r.isLocked);
                const occupiedInFloor = floorRooms.reduce(
                  (acc, r) => acc + r.beds.filter((b) => b.isOccupied).length,
                  0
                );
                const capacityInFloor = floorRooms.length * 4;

                return (
                  <div
                    key={floor}
                    className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                      isFloorLocked ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-sm">Lantai {floor}</span>
                        {floor === 2 && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                            Internasional
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 block mt-1">
                        {occupiedInFloor} / {capacityInFloor} Bed Terisi
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFloorLock(floor, isFloorLocked)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        isFloorLocked
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {isFloorLocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Terkunci</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Terbuka Bebas</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabel Data Mahasantri & Status Check-In */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-uin-primary" />
                  Daftar Mahasantri yang Telah Memilih Kamar
                </h2>
                <p className="text-xs text-slate-500">
                  Menampilkan {filteredMhs.length} dari {mhsList.length} mahasantri terdaftar
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari Nama / NISN / Kamar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-uin-primary/30 outline-none w-48 font-mono"
                  />
                </div>

                <select
                  value={filterFloor}
                  onChange={(e) => setFilterFloor(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-uin-primary/30 outline-none"
                >
                  <option value="ALL">Semua Lantai</option>
                  <option value="1">Lantai 1</option>
                  <option value="2">Lantai 2 (Internasional)</option>
                  <option value="3">Lantai 3</option>
                  <option value="4">Lantai 4</option>
                  <option value="5">Lantai 5</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-uin-primary/30 outline-none"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="CHECKED_IN">Sudah Check-In</option>
                  <option value="REGISTERED">Belum Check-In</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-y border-slate-200">
                  <tr>
                    <th className="p-3">NIM / NISN</th>
                    <th className="p-3">Nama Mahasantri</th>
                    <th className="p-3">Jenis Pendaftaran</th>
                    <th className="p-3">Jurusan &amp; Fakultas</th>
                    <th className="p-3">Kamar &amp; Bed</th>
                    <th className="p-3">Posisi</th>
                    <th className="p-3">No. WhatsApp</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Waktu Masuk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMhs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        Tidak ada data mahasantri yang cocok dengan kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    filteredMhs.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-800">{m.nimNisn}</td>
                        <td className="p-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{m.nama}</span>
                            {m.isInternasional && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold">
                                {m.asalNegara || 'INT'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            {m.jenisPendaftaran}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-slate-700">{m.jurusan}</div>
                          <div className="text-[10px] text-slate-400">{m.fakultas}</div>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-uin-primary">Kamar {m.nomorKamar}</span>
                          <span className="text-amber-600 font-bold ml-1.5">(Bed {m.bedNumber})</span>
                        </td>
                        <td className="p-3 text-[11px]">
                          {m.jajaran === 'BELAKANG' ? `Jajaran Belakang (Lt. ${m.lantai})` : `Jajaran Depan (Lt. ${m.lantai})`}
                        </td>
                        <td className="p-3 font-mono text-slate-500">{m.noWa}</td>
                        <td className="p-3">
                          {m.statusCheckIn === 'CHECKED_IN' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle className="w-3 h-3" /> Checked In
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3" /> Belum Datang
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-[11px] text-slate-500 font-mono">
                          {m.checkInTimestamp ? new Date(m.checkInTimestamp).toLocaleString('id-ID') : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* Tab: Master Data SK (Whitelist NISN & NIM) */}
      {activeTab === 'SK_MASTER' && (
        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-uin-primary" />
                  Master Data Whitelist SK No. {SK_INFO.nomor}
                </h2>
                <p className="text-xs text-slate-500">
                  Data NISN (Mahasantri Baru) &amp; NIM (Perpanjangan) resmi yang diizinkan sistem untuk memilih kamar.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all shrink-0"
                >
                  <FileUp className="w-4 h-4" />
                  <span>Unggah PDF / File SK</span>
                </button>

                <button
                  onClick={() => setShowAddSkModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-uin-primary hover:bg-uin-secondary text-white font-bold text-xs rounded-xl shadow transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Manual</span>
                </button>
              </div>
            </div>

            {/* Search & Filter Toolbar for SK Master Data */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ketik Nama Mahasantri, NISN, NIM, atau Jurusan..."
                  value={skSearchQuery}
                  onChange={(e) => setSkSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-uin-primary/30 outline-none"
                />
                {skSearchQuery && (
                  <button
                    onClick={() => setSkSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={skFilterBooking}
                  onChange={(e) => setSkFilterBooking(e.target.value as any)}
                  className="px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-uin-primary/30 outline-none"
                >
                  <option value="ALL">Semua Status Kamar</option>
                  <option value="BOOKED">✅ Sudah Memilih Kamar</option>
                  <option value="UNBOOKED">⏳ Belum Memilih Kamar</option>
                </select>

                <select
                  value={skFilterJenis}
                  onChange={(e) => setSkFilterJenis(e.target.value as any)}
                  className="px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-uin-primary/30 outline-none"
                >
                  <option value="ALL">Semua Kategori</option>
                  <option value="MABA">Calon Maba (NISN)</option>
                  <option value="PERPANJANGAN">Perpanjangan (NIM)</option>
                  <option value="INTERNASIONAL">Internasional</option>
                </select>

                {(skSearchQuery || skFilterBooking !== 'ALL' || skFilterJenis !== 'ALL') && (
                  <button
                    onClick={() => {
                      setSkSearchQuery('');
                      setSkFilterBooking('ALL');
                      setSkFilterJenis('ALL');
                    }}
                    className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>

            {/* Counter Summary */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                Menampilkan <strong>{filteredSkList.length}</strong> dari <strong>{skList.length}</strong> mahasantri SK
              </span>
              <span className="text-[11px]">
                {filteredSkList.filter((item) => mhsList.some((m) => m.nimNisn === item.nimNisn)).length} telah booking &bull;{' '}
                {filteredSkList.filter((item) => !mhsList.some((m) => m.nimNisn === item.nimNisn)).length} belum booking
              </span>
            </div>

            {/* Table of SK Whitelist */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-y border-slate-200">
                  <tr>
                    <th className="p-3">No</th>
                    <th className="p-3">NIM / NISN</th>
                    <th className="p-3">Nama Lengkap</th>
                    <th className="p-3">Jenis Pendaftaran</th>
                    <th className="p-3">Fakultas &amp; Jurusan</th>
                    <th className="p-3">Status Pemilihan Kamar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSkList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Tidak ditemukan nama mahasantri dengan kata kunci "<strong>{skSearchQuery}</strong>".
                      </td>
                    </tr>
                  ) : (
                    filteredSkList.map((item, idx) => {
                      const booking = mhsList.find(
                        (m) => m.nimNisn.trim().toLowerCase() === item.nimNisn.trim().toLowerCase()
                      );
                      return (
                        <tr key={item.nimNisn + idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono text-slate-400">{item.no || idx + 1}</td>
                          <td className="p-3 font-mono font-bold text-slate-900">{item.nimNisn}</td>
                          <td className="p-3 font-bold text-slate-800">
                            <div className="flex items-center gap-1.5">
                              <span>{item.nama}</span>
                              {item.isInternasional && (
                                <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                                  {item.asalNegara || 'Internasional'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                              {item.jenisPendaftaran}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">
                            {item.jurusan} ({item.fakultas})
                          </td>
                          <td className="p-3">
                            {booking ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Kamar {booking.nomorKamar} (Bed {booking.bedNumber})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                                <Clock className="w-3.5 h-3.5" />
                                Belum Memilih Kamar
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* Modal Tambah Mahasantri ke SK */}
      {showAddSkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-uin-primary" />
                Tambah Mahasantri ke Lampiran SK
              </h3>
              <button onClick={() => setShowAddSkModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSk} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">NIM / NISN Mahasantri *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh NISN: 0089221715 atau NIM: 2530101001"
                  value={newNimNisn}
                  onChange={(e) => setNewNimNisn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono outline-none focus:ring-2 focus:ring-uin-primary/30"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap"
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-uin-primary/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Pendaftaran</label>
                  <select
                    value={newJenis}
                    onChange={(e) => setNewJenis(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-uin-primary/30"
                  >
                    <option value="Calon Mahasantri Baru">Calon Mahasantri Baru (NISN)</option>
                    <option value="Perpanjangan">Perpanjangan (NIM)</option>
                    <option value="Mahasantri Internasional">Mahasantri Internasional</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-uin-primary/30"
                  >
                    <option value="L">Laki-laki (Ma'had Qodim)</option>
                    <option value="P">Perempuan (Ma'had Jadid)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fakultas</label>
                  <select
                    value={newFakultas}
                    onChange={(e) => setNewFakultas(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-uin-primary/30"
                  >
                    <option value="FITK">FITK</option>
                    <option value="FASYA">FASYA</option>
                    <option value="FEBI">FEBI</option>
                    <option value="FDKI">FDKI</option>
                    <option value="FUA">FUA</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Program Studi / Jurusan</label>
                  <input
                    type="text"
                    placeholder="Contoh: PAI / HUKUM KELUARGA"
                    value={newJurusan}
                    onChange={(e) => setNewJurusan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-uin-primary/30"
                  />
                </div>
              </div>

              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Mahasantri Internasional?</span>
                  <input
                    type="checkbox"
                    checked={newIsInt}
                    onChange={(e) => setNewIsInt(e.target.checked)}
                    className="w-4 h-4 accent-uin-primary cursor-pointer"
                  />
                </div>
                {newIsInt && (
                  <input
                    type="text"
                    placeholder="Asal Negara (Filipina, Thailand, Nigeria, dll)"
                    value={newNegara}
                    onChange={(e) => setNewNegara(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSkModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-uin-primary hover:bg-uin-secondary text-white rounded-xl font-bold shadow"
                >
                  Simpan ke SK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Upload File SK PDF / CSV */}
      <SKUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={(count) => {
          setNotification(`Berhasil mengimpor ${count} data mahasantri dari dokumen SK!`);
          loadData();
          setTimeout(() => setNotification(null), 4000);
        }}
      />

    </div>
  );
}
