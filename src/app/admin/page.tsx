'use client';

import React, { useState, useEffect } from 'react';
import { MahadStore } from '@/lib/store';
import {
  Kamar,
  Mahasantri,
  CheckInLog,
  SKMahasantri,
  SKPengurus,
  Gender,
  JenisPendaftaran,
  GedungType,
} from '@/lib/types';
import { FAKULTAS_LIST, SK_INFO, getShortJurusan } from '@/lib/constants';
import SKUploadModal from '@/components/admin/SKUploadModal';
import RoleGuard from '@/components/auth/RoleGuard';
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
  BedDouble,
  SlidersHorizontal,
  Key,
  Trash2,
  X,
} from 'lucide-react';

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={['ADMIN']} pageTitle="Dashboard Superadmin SK">
      <AdminDashboardContent />
    </RoleGuard>
  );
}

function AdminDashboardContent() {
  const [rooms, setRooms] = useState<Kamar[]>(() => (typeof window !== 'undefined' ? MahadStore.getRooms() : []));
  const [mhsList, setMhsList] = useState<Mahasantri[]>(() => (typeof window !== 'undefined' ? MahadStore.getMahasantriList() : []));
  const [skList, setSkList] = useState<SKMahasantri[]>(() => (typeof window !== 'undefined' ? MahadStore.getSKList() : []));
  const [skPengurusList, setSkPengurusList] = useState<SKPengurus[]>(() => (typeof window !== 'undefined' ? MahadStore.getSKPengurusList() : []));
  const [logs, setLogs] = useState<CheckInLog[]>(() => (typeof window !== 'undefined' ? MahadStore.getLogs() : []));

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'MONITORING' | 'ROOMS' | 'SK_MASTER' | 'SK_PENGURUS'>('MONITORING');

  // Monitoring Filters
  const [filterGedung, setFilterGedung] = useState<GedungType | 'ALL'>('ALL');
  const [filterFloor, setFilterFloor] = useState<number | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'REGISTERED' | 'CHECKED_IN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Room Management Filters & Modals
  const [roomFilterGedung, setRoomFilterGedung] = useState<GedungType>("Ma'had Jadid");
  const [roomFilterFloor, setRoomFilterFloor] = useState<number>(2);
  const [roomSearch, setRoomSearch] = useState('');
  const [selectedRoomForLock, setSelectedRoomForLock] = useState<Kamar | null>(null);
  const [lockReasonInput, setLockReasonInput] = useState('');
  const [selectedRoomForCapacity, setSelectedRoomForCapacity] = useState<Kamar | null>(null);
  const [newCapacityInput, setNewCapacityInput] = useState<number>(4);

  // SK Master Data Search, Filters & Pagination
  const [skSearchQuery, setSkSearchQuery] = useState('');
  const [skFilterBooking, setSkFilterBooking] = useState<'ALL' | 'BOOKED' | 'UNBOOKED'>('ALL');
  const [skFilterJenis, setSkFilterJenis] = useState<'ALL' | 'MABA' | 'PERPANJANGAN' | 'INTERNASIONAL'>('ALL');
  const [skGenderFilter, setSkGenderFilter] = useState<'ALL' | 'L' | 'P'>('ALL');
  const [skPage, setSkPage] = useState(1);
  const [skPerPage, setSkPerPage] = useState<number | 'ALL'>(100);

  // SK Mudabbir/Pengurus Form & Modal
  const [showAddPengurusModal, setShowAddPengurusModal] = useState(false);
  const [newPgrNama, setNewPgrNama] = useState('');
  const [newPgrNim, setNewPgrNim] = useState('');
  const [newPgrGender, setNewPgrGender] = useState<Gender>('L');
  const [newPgrJabatan, setNewPgrJabatan] = useState('Mudabbir Lantai');
  const [newPgrGedung, setNewPgrGedung] = useState<GedungType>("Ma'had Jadid");
  const [newPgrLantai, setNewPgrLantai] = useState<number>(2);
  const [newPgrKamar, setNewPgrKamar] = useState('');
  const [newPgrWa, setNewPgrWa] = useState('');
  const [newPgrPassword, setNewPgrPassword] = useState('mahad2026');

  // Upload SK Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Add SK Mahasantri Modal
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
    setSkPengurusList(MahadStore.getSKPengurusList());
    setLogs(MahadStore.getLogs());
  };

  useEffect(() => {
    loadData();

    const handleRoomUpdate = () => loadData();
    const handleMhsUpdate = () => loadData();
    const handleSkUpdate = () => loadData();
    const handleSkPengurusUpdate = () => loadData();

    window.addEventListener('mahad_rooms_updated', handleRoomUpdate);
    window.addEventListener('mahad_mhs_updated', handleMhsUpdate);
    window.addEventListener('mahad_sk_updated', handleSkUpdate);
    window.addEventListener('mahad_sk_pengurus_updated', handleSkPengurusUpdate);

    return () => {
      window.removeEventListener('mahad_rooms_updated', handleRoomUpdate);
      window.removeEventListener('mahad_mhs_updated', handleMhsUpdate);
      window.removeEventListener('mahad_sk_updated', handleSkUpdate);
      window.removeEventListener('mahad_sk_pengurus_updated', handleSkPengurusUpdate);
    };
  }, []);

  // Filtered Mahasantri List
  const filteredMhs = mhsList.filter((m) => {
    const matchGedung = filterGedung === 'ALL' || m.gedung === filterGedung;
    const matchFloor = filterFloor === 'ALL' || m.lantai === filterFloor;
    const matchStatus = filterStatus === 'ALL' || m.statusCheckIn === filterStatus;
    const matchQuery =
      !searchQuery ||
      m.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nimNisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nomorKamar.toLowerCase().includes(searchQuery.toLowerCase());

    return matchGedung && matchFloor && matchStatus && matchQuery;
  });

  // Filtered Rooms for Room Management
  const filteredRoomsList = rooms.filter((r) => {
    const matchGedung = r.gedung === roomFilterGedung;
    const matchFloor = r.lantai === roomFilterFloor;
    const matchSearch =
      !roomSearch ||
      r.nomor.includes(roomSearch) ||
      (r.lockReason && r.lockReason.toLowerCase().includes(roomSearch.toLowerCase()));
    return matchGedung && matchFloor && matchSearch;
  });

  // Statistics
  const totalRoomsCount = rooms.length;
  const totalCapacity = rooms.reduce((acc, r) => acc + r.kapasitas, 0);
  const totalBooked = mhsList.length;
  const totalCheckedIn = mhsList.filter((m) => m.statusCheckIn === 'CHECKED_IN').length;
  const totalSkCount = skList.length;
  const totalLockedRooms = rooms.filter((r) => r.isLocked).length;

  // Handle Lock / Unlock Room
  const handleToggleLock = () => {
    if (!selectedRoomForLock) return;
    const newLockState = !selectedRoomForLock.isLocked;
    const res = MahadStore.toggleRoomLock(selectedRoomForLock.id, newLockState, lockReasonInput);
    if (res.success) {
      setNotification(`Status Kamar ${selectedRoomForLock.nomor} (${selectedRoomForLock.gedung}) berhasil diubah!`);
      setSelectedRoomForLock(null);
      setLockReasonInput('');
    } else {
      alert(res.error || 'Gagal mengubah status kamar.');
    }
  };

  // Handle Update Capacity
  const handleSaveCapacity = () => {
    if (!selectedRoomForCapacity) return;
    const res = MahadStore.updateRoomCapacity(selectedRoomForCapacity.id, newCapacityInput);
    if (res.success) {
      setNotification(`Kapasitas Kamar ${selectedRoomForCapacity.nomor} berhasil diubah menjadi ${newCapacityInput} kasur!`);
      setSelectedRoomForCapacity(null);
    } else {
      alert(res.error || 'Gagal mengubah kapasitas kasur.');
    }
  };

  // Handle Add SK Mahasantri
  const handleAddSingleSK = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNimNisn.trim() || !newNama.trim()) {
      alert('NIM/NISN dan Nama Mahasantri wajib diisi!');
      return;
    }

    const newItem: SKMahasantri = {
      no: skList.length + 1,
      nimNisn: newNimNisn.trim(),
      nama: newNama.trim(),
      jenisKelamin: newGender,
      jenisPendaftaran: newJenis,
      fakultas: newFakultas,
      jurusan: newJurusan.trim() || 'Umum',
      isInternasional: newIsInt,
      asalNegara: newIsInt ? newNegara.trim() : undefined,
      skNomor: SK_INFO.nomor,
    };

    MahadStore.addSKMahasantri(newItem);
    setNotification(`Mahasantri ${newItem.nama} (${newItem.nimNisn}) berhasil ditambahkan ke SK resmi!`);
    setShowAddSkModal(false);
    setNewNimNisn('');
    setNewNama('');
    setNewJurusan('');
  };

  // Handle Add Mudabbir / SK Pengurus
  const handleAddPengurus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPgrNama.trim()) {
      alert('Nama Mudabbir / Pengurus wajib diisi!');
      return;
    }

    const newId = `SKP-${newPgrGedung === "Ma'had Jadid" ? 'JD' : 'QD'}-${Date.now().toString().slice(-4)}`;
    const newPengurus: SKPengurus = {
      id: newId,
      nama: newPgrNama.trim(),
      nim: newPgrNim.trim() || undefined,
      jenisKelamin: newPgrGender,
      jabatan: newPgrJabatan.trim(),
      gedung: newPgrGedung,
      lantai: newPgrLantai,
      kamarKhusus: newPgrKamar.trim() || undefined,
      noWa: newPgrWa.trim(),
      password: newPgrPassword.trim() || 'mahad2026',
      isAktif: true,
      skNomor: 'SK-PENGURUS/2026',
    };

    MahadStore.addSKPengurus(newPengurus);

    // Auto lock kamar mudabbir if specified
    if (newPgrKamar.trim()) {
      const roomTarget = rooms.find((r) => r.gedung === newPgrGedung && r.nomor === newPgrKamar.trim());
      if (roomTarget) {
        MahadStore.toggleRoomLock(roomTarget.id, true, `Kamar Mudabbir (${newPengurus.nama})`);
      }
    }

    setNotification(`Mudabbir / Pengurus ${newPengurus.nama} berhasil ditambahkan!`);
    setShowAddPengurusModal(false);
    setNewPgrNama('');
    setNewPgrNim('');
    setNewPgrWa('');
  };

  // Handle Reset Mahasantri PIN
  const handleResetPin = (nimNisn: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin me-reset PIN keamanan mahasantri ${nama} (${nimNisn})? Mahasantri harus membuat PIN baru saat login.`)) {
      const ok = MahadStore.resetMahasantriPin(nimNisn);
      if (ok) {
        setNotification(`PIN keamanan untuk ${nama} (${nimNisn}) berhasil di-reset.`);
      }
    }
  };

  // Export Data to CSV
  const handleExportCSV = () => {
    const headers = [
      'No',
      'NIM/NISN',
      'Nama Lengkap',
      'Jenis Kelamin',
      'Jenis Pendaftaran',
      'Fakultas',
      'Jurusan',
      'Gedung',
      'Lantai',
      'Kamar',
      'Nomor Bed',
      'Status CheckIn',
      'Waktu CheckIn',
      'Petugas',
    ];

    const rows = mhsList.map((m, idx) => [
      idx + 1,
      `'${m.nimNisn}`,
      `"${m.nama}"`,
      m.jenisKelamin,
      `"${m.jenisPendaftaran}"`,
      `"${m.fakultas}"`,
      `"${m.jurusan}"`,
      `"${m.gedung}"`,
      m.lantai,
      m.nomorKamar,
      m.bedNumber,
      m.statusCheckIn,
      m.checkInTimestamp || '-',
      `"${m.petugasCheckIn || '-'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_CheckIn_Mahad_UINSSC_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-uin-primary to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-uin-accent/20 text-uin-accent text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-uin-accent/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Portal Superadmin Resmi
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">
            Pusat Kendali &amp; Manajemen Kamar Ma&apos;had
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl">
            Pengelolaan 2 Gedung (Jadid &amp; Qodim), Kontrol Kunci Kamar Mudabbir, Kapasitas Kasur, SK Mahasantri, dan SK Mudabbir/Mudabbirah.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-medium animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-900 font-bold ml-4">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Gedung &amp; Kamar</span>
          <div className="text-xl font-extrabold text-slate-800 mt-1">2 Gedung &bull; {totalRoomsCount}</div>
          <span className="text-[10px] text-slate-500">Jadid &amp; Qodim (Lt 2-5)</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Kapasitas Ranjang</span>
          <div className="text-xl font-extrabold text-uin-primary mt-1">{totalCapacity} Kasur</div>
          <span className="text-[10px] text-emerald-600 font-semibold">{totalCapacity - totalBooked} Tersedia</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Mahasantri Memilih</span>
          <div className="text-xl font-extrabold text-blue-600 mt-1">{totalBooked} Santri</div>
          <span className="text-[10px] text-slate-500">Dari {totalSkCount} di SK</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Sudah Check-In H-H</span>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">{totalCheckedIn} Santri</div>
          <span className="text-[10px] text-slate-500">Kunci telah diserahkan</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Kamar Terkunci</span>
          <div className="text-xl font-extrabold text-amber-600 mt-1">{totalLockedRooms} Kamar</div>
          <span className="text-[10px] text-amber-700 font-semibold">Mudabbir / Khusus</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Mudabbir / Pengurus</span>
          <div className="text-xl font-extrabold text-purple-700 mt-1">{skPengurusList.length} Orang</div>
          <span className="text-[10px] text-slate-500">Mudabbir &amp; Mudabbirah</span>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto">
        
        <button
          onClick={() => setActiveTab('MONITORING')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'MONITORING'
              ? 'border-uin-primary text-uin-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Monitoring Check-In Santri ({mhsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ROOMS')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'ROOMS'
              ? 'border-uin-primary text-uin-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Manajemen Kamar &amp; Kasur ({rooms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SK_MASTER')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'SK_MASTER'
              ? 'border-uin-primary text-uin-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Master SK Mahasantri ({skList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SK_PENGURUS')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'SK_PENGURUS'
              ? 'border-uin-primary text-uin-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>SK Mudabbir &amp; Pengurus ({skPengurusList.length})</span>
        </button>

      </div>

      {/* ========================================================= */}
      {/* TAB 1: MONITORING MAHASANTRI & CHECK-IN                   */}
      {/* ========================================================= */}
      {activeTab === 'MONITORING' && (
        <div className="space-y-6">
          
          {/* Filters Bar */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Nama, NIM/NISN, atau Kamar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-uin-primary/20 outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              
              {/* Gedung Filter */}
              <select
                value={filterGedung}
                onChange={(e) => setFilterGedung(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="ALL">Semua Gedung</option>
                <option value="Ma'had Jadid">Ma&apos;had Jadid (Putra &amp; Putri)</option>
                <option value="Ma'had Qodim">Ma&apos;had Qodim (Full Putri)</option>
              </select>

              {/* Floor Filter */}
              <select
                value={filterFloor}
                onChange={(e) => setFilterFloor(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="ALL">Semua Lantai</option>
                <option value="2">Lantai 2</option>
                <option value="3">Lantai 3</option>
                <option value="4">Lantai 4</option>
                <option value="5">Lantai 5</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="REGISTERED">Sudah Pilih Kamar</option>
                <option value="CHECKED_IN">Sudah Check-In H-H</option>
              </select>

            </div>
          </div>

          {/* Table Mahasantri */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Mahasantri</th>
                    <th className="py-3.5 px-4">Gender &amp; Jalur</th>
                    <th className="py-3.5 px-4">Lokasi Kamar</th>
                    <th className="py-3.5 px-4">Status &amp; Waktu</th>
                    <th className="py-3.5 px-4">Petugas / Catatan</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMhs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        Tidak ada data mahasantri yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredMhs.map((mhs) => (
                      <tr key={mhs.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">{mhs.nama}</div>
                          <div className="font-mono text-emerald-800 text-[11px]">{mhs.nimNisn}</div>
                          <div className="text-slate-500 text-[10px] font-medium">{getShortJurusan(mhs.jurusan, mhs.fakultas)} &bull; {mhs.fakultas}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            mhs.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                          }`}>
                            {mhs.jenisKelamin === 'L' ? '👦 Putra' : '🧕 Putri'}
                          </span>
                          <div className="text-slate-600 text-[10px] mt-1">{mhs.jenisPendaftaran}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{mhs.gedung}</div>
                          <div className="text-uin-primary font-extrabold text-xs">
                            Kamar {mhs.nomorKamar} (Bed {mhs.bedNumber})
                          </div>
                          <div className="text-slate-400 text-[10px]">Lantai {mhs.lantai}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          {mhs.statusCheckIn === 'CHECKED_IN' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold text-[10px]">
                              <CheckCircle className="w-3 h-3" />
                              Checked-In
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-bold text-[10px]">
                              <Clock className="w-3 h-3" />
                              Booking Kamar
                            </span>
                          )}
                          {mhs.checkInTimestamp && (
                            <div className="text-[10px] text-slate-400 mt-1">
                              {new Date(mhs.checkInTimestamp).toLocaleString('id-ID')}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-[11px] text-slate-600 max-w-xs">
                          <div className="font-semibold text-slate-700">{mhs.petugasCheckIn || '-'}</div>
                          <div className="text-[10px] text-slate-500 truncate">{mhs.catatanBarangCheckIn || '-'}</div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <a
                            href={`/tiket/${encodeURIComponent(mhs.nimNisn)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block px-3 py-1.5 bg-slate-800 text-white rounded-lg text-[11px] font-semibold hover:bg-slate-900"
                          >
                            Buka E-Tiket
                          </a>
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

      {/* ========================================================= */}
      {/* TAB 2: MANAJEMEN KAMAR & KASUR (LOCK & +/- BEDS)          */}
      {/* ========================================================= */}
      {activeTab === 'ROOMS' && (
        <div className="space-y-6">
          
          {/* Room Filter Controls */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Gedung Switcher */}
              <button
                type="button"
                onClick={() => setRoomFilterGedung("Ma'had Jadid")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  roomFilterGedung === "Ma'had Jadid"
                    ? 'bg-uin-primary text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Gedung Ma&apos;had Jadid (Putra &amp; Putri)
              </button>

              <button
                type="button"
                onClick={() => setRoomFilterGedung("Ma'had Qodim")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  roomFilterGedung === "Ma'had Qodim"
                    ? 'bg-pink-700 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Gedung Ma&apos;had Qodim (Full Putri)
              </button>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Floor Switcher */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {[2, 3, 4, 5].map((fl) => (
                  <button
                    key={fl}
                    type="button"
                    onClick={() => setRoomFilterFloor(fl)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      roomFilterFloor === fl
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Lt. {fl}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Cari No. Kamar..."
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-uin-primary/20 outline-none w-32"
              />
            </div>

          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRoomsList.map((kamar) => {
              const occupiedCount = kamar.beds.filter((b) => b.isOccupied).length;

              return (
                <div
                  key={kamar.id}
                  className={`bg-white rounded-3xl p-5 border transition-all space-y-4 ${
                    kamar.isLocked
                      ? 'border-amber-300 bg-amber-50/30 shadow-xs'
                      : occupiedCount >= kamar.kapasitas
                      ? 'border-slate-200 bg-slate-50'
                      : 'border-slate-200 hover:border-uin-primary/50 shadow-sm'
                  }`}
                >
                  {/* Room Card Top */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-mono font-extrabold text-lg text-slate-800">
                          Kamar {kamar.nomor}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          kamar.gender === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {kamar.gender === 'L' ? 'Putra' : 'Putri'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{kamar.gedung} &bull; Lantai {kamar.lantai}</p>
                    </div>

                    {kamar.isLocked ? (
                      <span className="p-1.5 bg-amber-100 text-amber-800 rounded-xl">
                        <Lock className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-xl">
                        <Unlock className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  {/* Lock Reason if locked */}
                  {kamar.isLocked && (
                    <div className="p-2 bg-amber-100/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-semibold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{kamar.lockReason || 'Kamar Dikunci Admin'}</span>
                    </div>
                  )}

                  {/* Bed Capacity Indicator */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5 text-uin-primary" />
                        Kapasitas: {kamar.kapasitas} Kasur
                      </span>
                      <span className={occupiedCount >= kamar.kapasitas ? 'text-rose-600' : 'text-emerald-700'}>
                        {occupiedCount} / {kamar.kapasitas} Terisi
                      </span>
                    </div>
                    
                    {/* Visual Bed Slots */}
                    <div className="grid grid-cols-4 gap-1 pt-1">
                      {kamar.beds.map((b) => (
                        <div
                          key={b.bedNumber}
                          className={`py-1 px-1.5 text-center text-[10px] font-bold rounded-lg ${
                            b.isOccupied
                              ? 'bg-slate-200 text-slate-600'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                          title={b.isOccupied ? `Bed ${b.bedNumber}: ${b.mahasantriNama}` : `Bed ${b.bedNumber}: Kosong`}
                        >
                          B{b.bedNumber}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admin Control Actions */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                    
                    {/* Toggle Lock Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRoomForLock(kamar);
                        setLockReasonInput(kamar.lockReason || 'Kamar Mudabbir');
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        kamar.isLocked
                          ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      {kamar.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{kamar.isLocked ? 'Buka Kunci' : 'Kunci Kamar'}</span>
                    </button>

                    {/* Change Bed Capacity Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRoomForCapacity(kamar);
                        setNewCapacityInput(kamar.kapasitas);
                      }}
                      className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <BedDouble className="w-3.5 h-3.5 text-uin-primary" />
                      <span>Ubah Kasur</span>
                    </button>

                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: MASTER DATA SK MAHASANTRI                          */}
      {/* ========================================================= */}
      {activeTab === 'SK_MASTER' && (
        <div className="space-y-6">
          
          {/* Search, Filter & Per Page Controls */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Nama, NIM/NISN, Prodi, atau Fakultas..."
                value={skSearchQuery}
                onChange={(e) => {
                  setSkSearchQuery(e.target.value);
                  setSkPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-uin-primary/20 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              
              {/* Gender Filter */}
              <select
                value={skGenderFilter}
                onChange={(e) => {
                  setSkGenderFilter(e.target.value as any);
                  setSkPage(1);
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="ALL">Semua Gender</option>
                <option value="L">👦 Khusus Putra (L)</option>
                <option value="P">🧕 Khusus Putri (P)</option>
              </select>

              {/* Rows Per Page */}
              <select
                value={skPerPage === 'ALL' ? 'ALL' : String(skPerPage)}
                onChange={(e) => {
                  setSkPerPage(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value));
                  setSkPage(1);
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="50">50 per hal</option>
                <option value="100">100 per hal</option>
                <option value="250">250 per hal</option>
                <option value="500">500 per hal</option>
                <option value="ALL">Tampilkan Semua ({skList.length} Data)</option>
              </select>

              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-uin-primary hover:bg-uin-secondary text-white rounded-xl text-xs font-bold shadow transition-all"
              >
                <FileUp className="w-4 h-4" />
                <span>Upload SK (PDF)</span>
              </button>

              <button
                onClick={() => setShowAddSkModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Manual</span>
              </button>
            </div>

          </div>

          {/* Table SK Mahasantri */}
          {(() => {
            const filteredSkList = skList.filter((s) => {
              const matchQuery =
                !skSearchQuery ||
                s.nama.toLowerCase().includes(skSearchQuery.toLowerCase()) ||
                s.nimNisn.toLowerCase().includes(skSearchQuery.toLowerCase()) ||
                s.jurusan.toLowerCase().includes(skSearchQuery.toLowerCase()) ||
                s.fakultas.toLowerCase().includes(skSearchQuery.toLowerCase());
              const matchGender = skGenderFilter === 'ALL' || s.jenisKelamin === skGenderFilter;
              return matchQuery && matchGender;
            });

            const totalFiltered = filteredSkList.length;
            const perPageNum = skPerPage === 'ALL' ? totalFiltered : skPerPage;
            const totalPages = skPerPage === 'ALL' ? 1 : Math.max(1, Math.ceil(totalFiltered / perPageNum));
            const currentPage = Math.min(Math.max(1, skPage), totalPages);
            const startIdx = (currentPage - 1) * perPageNum;
            const endIdx = skPerPage === 'ALL' ? totalFiltered : Math.min(startIdx + perPageNum, totalFiltered);
            const displayedSkList = filteredSkList.slice(startIdx, endIdx);

            return (
              <div className="space-y-4">
                
                {/* Information Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-1 text-xs text-slate-600 font-medium">
                  <div>
                    Menampilkan <strong className="text-slate-900 font-bold">{totalFiltered > 0 ? startIdx + 1 : 0} - {endIdx}</strong> dari total <strong className="text-uin-primary font-bold">{totalFiltered} Mahasantri</strong> di SK resmi (Total Master: {skList.length})
                  </div>
                  {totalPages > 1 && (
                    <div className="text-slate-500 font-semibold">
                      Halaman <span className="text-slate-900 font-bold">{currentPage}</span> dari {totalPages}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4">No</th>
                          <th className="py-3.5 px-4">Identitas Mahasantri</th>
                          <th className="py-3.5 px-4">Gender &amp; Jalur</th>
                          <th className="py-3.5 px-4">Fakultas / Prodi</th>
                          <th className="py-3.5 px-4">Status Akun PIN</th>
                          <th className="py-3.5 px-4 text-center">Aksi Helpdesk</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {displayedSkList.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                              Tidak ada data mahasantri yang cocok dengan pencarian.
                            </td>
                          </tr>
                        ) : (
                          displayedSkList.map((item, idx) => (
                            <tr key={item.nimNisn} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-slate-400">{startIdx + idx + 1}</td>
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-slate-900 text-sm">{item.nama}</div>
                                <div className="font-mono text-emerald-800 text-[11px]">NIM/NISN: {item.nimNisn}</div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  item.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                                }`}>
                                  {item.jenisKelamin === 'L' ? '👦 Putra' : '🧕 Putri'}
                                </span>
                                <div className="text-[10px] text-slate-500 mt-0.5">{item.jenisPendaftaran}</div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-800" title={item.jurusan}>
                                  {getShortJurusan(item.jurusan, item.fakultas)}
                                </div>
                                <div className="text-[10px] text-slate-400">{item.fakultas}</div>
                              </td>
                              <td className="py-3.5 px-4">
                                {item.pin ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                    <ShieldCheck className="w-3 h-3" />
                                    PIN Aktif
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                                    Belum Aktivasi
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                {item.pin && (
                                  <button
                                    onClick={() => handleResetPin(item.nimNisn, item.nama)}
                                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold transition-all"
                                  >
                                    Reset PIN
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-slate-500 font-medium">
                      Halaman {currentPage} dari {totalPages}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => setSkPage(1)}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                      >
                        &laquo; Pertama
                      </button>

                      <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => setSkPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                      >
                        &lsaquo; Sebelumnya
                      </button>

                      <div className="flex items-center gap-1 px-2">
                        {(() => {
                          const maxVisible = 5;
                          let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                          let end = start + maxVisible - 1;
                          if (end > totalPages) {
                            end = totalPages;
                            start = Math.max(1, end - maxVisible + 1);
                          }
                          const pageNumbers: number[] = [];
                          for (let i = start; i <= end; i++) {
                            pageNumbers.push(i);
                          }

                          return pageNumbers.map((pageNum) => (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => setSkPage(pageNum)}
                              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                                currentPage === pageNum
                                  ? 'bg-uin-primary text-white shadow-sm'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          ));
                        })()}
                      </div>

                      <button
                        type="button"
                        disabled={currentPage >= totalPages}
                        onClick={() => setSkPage((p) => Math.min(totalPages, p + 1))}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                      >
                        Berikutnya &rsaquo;
                      </button>

                      <button
                        type="button"
                        disabled={currentPage >= totalPages}
                        onClick={() => setSkPage(totalPages)}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                      >
                        Terakhir &raquo;
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })()}

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SK MUDABBIR & PENGURUS                             */}
      {/* ========================================================= */}
      {activeTab === 'SK_PENGURUS' && (
        <div className="space-y-6">
          
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <h2 className="text-base font-bold text-slate-800">Master Data SK Mudabbir &amp; Mudabbirah</h2>
              <p className="text-xs text-slate-500">Pengurus lorong berwenang melakukan pemindaian barcode check-in mahasantri.</p>
            </div>

            <button
              onClick={() => setShowAddPengurusModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-uin-primary hover:bg-uin-secondary text-white rounded-xl text-xs font-bold shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Mudabbir / Pengurus Baru</span>
            </button>
          </div>

          {/* Table SK Pengurus */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Nama Pengurus / Mudabbir</th>
                    <th className="py-3.5 px-4">Jabatan &amp; Gender</th>
                    <th className="py-3.5 px-4">Penugasan Gedung &amp; Lantai</th>
                    <th className="py-3.5 px-4">Kamar Khusus Mudabbir</th>
                    <th className="py-3.5 px-4">No. WhatsApp</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {skPengurusList.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{p.nama}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {p.id} {p.nim ? `| NIM: ${p.nim}` : ''}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {p.jenisKelamin === 'L' ? '👦 Mudabbir (Putra)' : '🧕 Mudabbirah (Putri)'}
                        </span>
                        <div className="text-slate-700 font-semibold text-[11px] mt-0.5">{p.jabatan}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{p.gedung}</div>
                        <div className="text-uin-primary font-bold text-xs">Lantai {p.lantai}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {p.kamarKhusus ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md font-mono font-bold text-xs">
                            Kamar {p.kamarKhusus}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {p.noWa}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`Hapus pengurus ${p.nama}?`)) {
                              MahadStore.deleteSKPengurus(p.id);
                              setNotification(`Pengurus ${p.nama} berhasil dihapus.`);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Hapus Pengurus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: KUNCI / BUKA KAMAR                               */}
      {/* ========================================================= */}
      {selectedRoomForLock && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">
                    {selectedRoomForLock.isLocked ? 'Buka Kunci Kamar' : 'Kunci Kamar Khusus'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedRoomForLock.gedung} &bull; Kamar {selectedRoomForLock.nomor}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedRoomForLock(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!selectedRoomForLock.isLocked ? (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Alasan Kamar Dikunci (Agar tidak dipilih santri):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kamar Mudabbir, Kamar Tamu, Perbaikan AC..."
                  value={lockReasonInput}
                  onChange={(e) => setLockReasonInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-uin-primary/20 outline-none"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Kamar Mudabbir', 'Kamar Mudabbirah', 'Kamar Tamu / Transit', 'Perbaikan Fasilitas'].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setLockReasonInput(sug)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md font-medium"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                Apakah Anda yakin ingin membuka kunci <strong>Kamar {selectedRoomForLock.nomor}</strong>? Mahasantri akan dapat kembali memilih kasur di kamar ini.
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRoomForLock(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleToggleLock}
                className="flex-1 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white rounded-xl text-xs font-bold shadow"
              >
                {selectedRoomForLock.isLocked ? 'Buka Kunci Sekarang' : 'Kunci Kamar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: UBAH KAPASITAS KASUR (+ / - BEDS)                */}
      {/* ========================================================= */}
      {selectedRoomForCapacity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-uin-primary rounded-xl">
                  <BedDouble className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">Ubah Kapasitas Kasur Kamar</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedRoomForCapacity.gedung} &bull; Kamar {selectedRoomForCapacity.nomor}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedRoomForCapacity(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Jumlah Kasur / Ranjang di Kamar Ini:
              </label>

              <div className="flex items-center justify-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setNewCapacityInput((prev) => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-200 hover:bg-slate-300 font-black text-lg flex items-center justify-center text-slate-700"
                >
                  -
                </button>
                <div className="text-3xl font-black text-uin-primary font-mono w-16 text-center">
                  {newCapacityInput}
                </div>
                <button
                  type="button"
                  onClick={() => setNewCapacityInput((prev) => Math.min(12, prev + 1))}
                  className="w-10 h-10 rounded-xl bg-slate-200 hover:bg-slate-300 font-black text-lg flex items-center justify-center text-slate-700"
                >
                  +
                </button>
              </div>

              <div className="flex justify-center gap-2">
                {[2, 4, 6, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNewCapacityInput(num)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      newCapacityInput === num
                        ? 'bg-uin-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {num} Kasur
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                Default standar Ma&apos;had adalah 4 kasur. Anda dapat mengubah menjadi 6 kasur atau lainnya sesuai kebutuhan lantai.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRoomForCapacity(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveCapacity}
                className="flex-1 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white rounded-xl text-xs font-bold shadow"
              >
                Simpan Kapasitas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: TAMBAH MUDABBIR / SK PENGURUS                    */}
      {/* ========================================================= */}
      {showAddPengurusModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">Tambah SK Mudabbir / Pengurus</h3>
                  <p className="text-xs text-slate-500">Daftarkan mudabbir lantai dan buat akses login scanner.</p>
                </div>
              </div>
              <button onClick={() => setShowAddPengurusModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPengurus} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap &amp; Gelar:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ustadz Ahmad Fauzi, S.Pd."
                  value={newPgrNama}
                  onChange={(e) => setNewPgrNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-uin-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin:</label>
                  <select
                    value={newPgrGender}
                    onChange={(e) => setNewPgrGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    <option value="L">👦 Laki-laki (Mudabbir)</option>
                    <option value="P">🧕 Perempuan (Mudabbirah)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIM / NIDN (Opsional):</label>
                  <input
                    type="text"
                    placeholder="1908102001"
                    value={newPgrNim}
                    onChange={(e) => setNewPgrNim(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Penugasan Gedung:</label>
                  <select
                    value={newPgrGedung}
                    onChange={(e) => setNewPgrGedung(e.target.value as GedungType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    <option value="Ma'had Jadid">Ma&apos;had Jadid</option>
                    <option value="Ma'had Qodim">Ma&apos;had Qodim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lantai Penugasan:</label>
                  <select
                    value={newPgrLantai}
                    onChange={(e) => setNewPgrLantai(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    {[2, 3, 4, 5].map((fl) => (
                      <option key={fl} value={fl}>Lantai {fl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kamar Khusus Mudabbir:</label>
                  <input
                    type="text"
                    placeholder="Contoh: 209"
                    value={newPgrKamar}
                    onChange={(e) => setNewPgrKamar(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp Aktif:</label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={newPgrWa}
                    onChange={(e) => setNewPgrWa(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password Login Pengurus:</label>
                <input
                  type="text"
                  value={newPgrPassword}
                  onChange={(e) => setNewPgrPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddPengurusModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-uin-primary text-white font-bold text-xs rounded-xl shadow"
                >
                  Simpan SK Mudabbir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: TAMBAH MANUAL SK MAHASANTRI                      */}
      {/* ========================================================= */}
      {showAddSkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">Tambah Mahasantri ke SK Resmi</h3>
                  <p className="text-xs text-slate-500">Mendaftarkan identitas santri agar berhak memilih kamar.</p>
                </div>
              </div>
              <button onClick={() => setShowAddSkModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSingleSK} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NIM / NISN:</label>
                <input
                  type="text"
                  required
                  placeholder="0081234567"
                  value={newNimNisn}
                  onChange={(e) => setNewNimNisn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Mahasantri:</label>
                <input
                  type="text"
                  required
                  placeholder="Nama sesuai berkas pendaftaran"
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin:</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    <option value="L">👦 Laki-laki (Putra)</option>
                    <option value="P">🧕 Perempuan (Putri)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Pendaftaran:</label>
                  <select
                    value={newJenis}
                    onChange={(e) => setNewJenis(e.target.value as JenisPendaftaran)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    <option value="Calon Mahasantri Baru">Calon Mahasantri Baru</option>
                    <option value="Perpanjangan">Perpanjangan (Santri Lama)</option>
                    <option value="Mahasantri Internasional">Mahasantri Internasional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fakultas:</label>
                  <select
                    value={newFakultas}
                    onChange={(e) => setNewFakultas(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    {FAKULTAS_LIST.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jurusan / Program Studi:</label>
                  <input
                    type="text"
                    placeholder="Contoh: PAI, HKI, ESy..."
                    value={newJurusan}
                    onChange={(e) => setNewJurusan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSkModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-uin-primary text-white font-bold text-xs rounded-xl shadow"
                >
                  Simpan Mahasantri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SK Upload Modal */}
      <SKUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={(count) => {
          setNotification(`Berhasil mengimpor ${count} data Mahasantri dari SK!`);
          setShowUploadModal(false);
        }}
      />

    </div>
  );
}
