'use client';

import React, { useState, useEffect } from 'react';
import { MahadStore, MahadAuth } from '@/lib/store';
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
import { FAKULTAS_LIST, SK_INFO, getShortJurusan, getFullJurusanName } from '@/lib/constants';
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
  UserMinus,
  ArrowRightLeft,
  LogOut,
  Settings,
  X,
  User,
  Check,
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

  // Move & Evict Mahasantri Modal State
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedMhsForMove, setSelectedMhsForMove] = useState<Mahasantri | null>(null);
  const [moveTargetKamarId, setMoveTargetKamarId] = useState('');
  const [moveTargetBed, setMoveTargetBed] = useState<number>(1);

  // Change Admin Password State
  const [showChangeAdminPassModal, setShowChangeAdminPassModal] = useState(false);
  const [adminOldPass, setAdminOldPass] = useState('');
  const [adminNewPass, setAdminNewPass] = useState('');
  const [adminConfirmPass, setAdminConfirmPass] = useState('');
  const [adminPassError, setAdminPassError] = useState<string | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const loadData = () => {
    setRooms(MahadStore.getRooms());
    setMhsList(MahadStore.getMahasantriList());
    setSkList(MahadStore.getSKList());
    setSkPengurusList(MahadStore.getSKPengurusList());
    setLogs(MahadStore.getLogs());
  };

  useEffect(() => {
    MahadStore.initSupabaseSync();
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
      setNotification(`Status Kamar ${selectedRoomForLock.nomor} (${selectedRoomForLock.gedung}) berhasil diubah.`);
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
      setNotification(`Kapasitas Kamar ${selectedRoomForCapacity.nomor} berhasil diubah menjadi ${newCapacityInput} kasur.`);
      setSelectedRoomForCapacity(null);
    } else {
      alert(res.error || 'Gagal mengubah kapasitas kasur.');
    }
  };

  // Handle Add SK Mahasantri
  const handleAddSingleSK = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNimNisn.trim() || !newNama.trim()) {
      alert('NIM/NISN dan Nama Mahasantri wajib diisi.');
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
    setNotification(`Mahasantri ${newItem.nama} (${newItem.nimNisn}) berhasil ditambahkan ke SK resmi.`);
    setShowAddSkModal(false);
    setNewNimNisn('');
    setNewNama('');
    setNewJurusan('');
  };

  // Handle Add Mudabbir / SK Pengurus
  const handleAddPengurus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPgrNama.trim()) {
      alert('Nama Mudabbir / Pengurus wajib diisi.');
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

    setNotification(`Pengurus ${newPengurus.nama} berhasil ditambahkan.`);
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

  // Handle Batalkan Check-In Per Santri (Bisa di-scan ulang)
  const handleCancelCheckIn = (nimNisn: string, nama: string) => {
    if (
      confirm(
        `Batalkan status check-in untuk ${nama} (${nimNisn})?\n\nKamar dan ranjang tetap tersimpan, namun status kehadiran akan dikembalikan ke 'Belum Check-In' sehingga tiket dapat dipindai (di-scan) ulang oleh petugas.`
      )
    ) {
      const res = MahadStore.cancelCheckIn(nimNisn);
      if (res.success) {
        setNotification(`Status check-in ${nama} (${nimNisn}) berhasil dibatalkan. Barcode tiket kini siap dipindai ulang.`);
      } else {
        alert(res.error || 'Gagal membatalkan check-in.');
      }
    }
  };

  // Handle Reset/Nol-kan SEMUA Check-In Sekaligus
  const handleResetAllCheckIns = () => {
    const checkedCount = mhsList.filter((m) => m.statusCheckIn === 'CHECKED_IN').length;
    if (checkedCount === 0) {
      alert('Belum ada mahasantri yang berstatus Checked-In saat ini.');
      return;
    }

    if (
      confirm(
        `PERINGATAN: Apakah Anda yakin ingin me-reset status check-in seluruh ${checkedCount} mahasantri?\n\nSemua nomor kamar & ranjang santri TETAP UTUH, namun status kehadiran akan di-nol-kan kembali ke 0 santri untuk simulasi atau hari-H.`
      )
    ) {
      const res = MahadStore.resetAllCheckIns();
      if (res.success) {
        setNotification(`Berhasil me-reset status check-in ${res.count} mahasantri kembali ke 0. Seluruh tiket siap untuk check-in ulang.`);
      }
    }
  };

  // Handle Keluarkan Mahasantri dari Kamar (Bebaskan ranjang agar santri bisa pilih ulang)
  const handleEvictMahasantri = (nimNisn: string, nama: string, nomorKamar: string, bedNumber: number) => {
    if (
      confirm(
        `KONFIRMASI PENGELUARAN DARI KAMAR:\n\nApakah Anda yakin ingin mengeluarkan ${nama} (${nimNisn}) dari Kamar ${nomorKamar} (Bed ${bedNumber})?\n\n• Ranjang ${nomorKamar} Bed ${bedNumber} akan langsung kosong kembali.\n• Santri bersangkutan dapat memilih kamar baru secara mandiri di formulir pendaftaran.`
      )
    ) {
      const res = MahadStore.evictMahasantriRoom(nimNisn);
      if (res.success) {
        setNotification(`Mahasantri ${nama} (${nimNisn}) berhasil dikeluarkan dari Kamar ${nomorKamar} Bed ${bedNumber}. Ranjang kini siap dipilih kembali.`);
        setShowMoveModal(false);
        setSelectedMhsForMove(null);
      } else {
        alert(res.error || 'Gagal mengeluarkan mahasantri.');
      }
    }
  };

  // Handle Pindah Kamar Langsung oleh Admin
  const handleDirectMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMhsForMove) return;

    const targetRoom = rooms.find((r) => r.id === moveTargetKamarId);
    if (!targetRoom) {
      alert('Pilih kamar tujuan yang valid.');
      return;
    }

    const targetBed = targetRoom.beds.find((b) => b.bedNumber === moveTargetBed);
    if (targetBed && targetBed.isOccupied && targetBed.mahasantriNimNisn !== selectedMhsForMove.nimNisn) {
      alert(`Kasur Bed ${moveTargetBed} di Kamar ${targetRoom.nomor} sudah terisi oleh santri lain.`);
      return;
    }

    const res = MahadStore.moveMahasantriDirectly(selectedMhsForMove.nimNisn, targetRoom, moveTargetBed);
    if (res.success) {
      setNotification(
        `Berhasil memindahkan ${selectedMhsForMove.nama} ke ${targetRoom.gedung} Kamar ${targetRoom.nomor} (Bed ${moveTargetBed}).`
      );
      setShowMoveModal(false);
      setSelectedMhsForMove(null);
    } else {
      alert(res.error || 'Gagal memindahkan kamar mahasantri.');
    }
  };

  // Handle Ubah Password Admin Sendiri
  const handleChangeAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPassError(null);

    if (!adminOldPass) {
      setAdminPassError('Masukkan password lama.');
      return;
    }
    if (adminNewPass.length < 6) {
      setAdminPassError('Password baru minimal 6 karakter.');
      return;
    }
    if (adminNewPass !== adminConfirmPass) {
      setAdminPassError('Konfirmasi password baru tidak cocok.');
      return;
    }

    const res = MahadAuth.changeAdminPassword(adminOldPass, adminNewPass);
    if (res.success) {
      setNotification('Password Superadmin berhasil diperbarui.');
      setShowChangeAdminPassModal(false);
      setAdminOldPass('');
      setAdminNewPass('');
      setAdminConfirmPass('');
    } else {
      setAdminPassError(res.error || 'Gagal mengubah password Superadmin.');
    }
  };

  // Export Data to CSV
  const handleExportCSV = () => {
    const headers = [
      'No',
      'NIM / NISN',
      'Nama Lengkap Mahasantri',
      'Jenis Kelamin',
      'Jalur Pendaftaran',
      'Fakultas',
      'Jurusan / Prodi',
      'Gedung Asrama',
      'Lantai',
      'Nomor Kamar',
      'Nomor Bed',
      'Status Kehadiran',
      'Waktu Check-In',
      'Petugas Verifikasi',
      'Catatan Barang Bawaan',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = mhsList.map((m, idx) => {
      let formattedTime = '-';
      if (m.checkInTimestamp) {
        try {
          const dt = new Date(m.checkInTimestamp);
          formattedTime = dt
            .toLocaleString('id-ID', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
            .replace(/\./g, ':');
        } catch {
          formattedTime = m.checkInTimestamp;
        }
      }

      const genderText = m.jenisKelamin === 'L' ? 'Laki-laki (Putra)' : 'Perempuan (Putri)';
      const statusText = m.statusCheckIn === 'CHECKED_IN' ? 'Sudah Check-In (Hadir)' : 'Belum Check-In (Booking)';

      return [
        idx + 1,
        `\t${m.nimNisn}`,
        escapeCsv(m.nama),
        escapeCsv(genderText),
        escapeCsv(m.jenisPendaftaran),
        escapeCsv(m.fakultas),
        escapeCsv(m.jurusan),
        escapeCsv(m.gedung),
        m.lantai,
        escapeCsv(m.nomorKamar),
        m.bedNumber,
        escapeCsv(statusText),
        escapeCsv(formattedTime),
        escapeCsv(m.petugasCheckIn || '-'),
        escapeCsv(m.catatanBarangCheckIn || '-'),
      ].join(',');
    });

    const csvContent = '\uFEFFsep=,\r\n' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rekap_CheckIn_Mahad_UINSSC_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Institutional Dashboard Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Dashboard</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 font-semibold">Administrasi Ma&apos;had</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Pusat Kendali &amp; Manajemen Kamar Ma&apos;had
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Pengelolaan 2 gedung asrama (Jadid &amp; Qodim), kapasitas kasur, alokasi santri, dan status hunian.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-uin-primary hover:bg-uin-secondary text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAdminPassError(null);
              setAdminOldPass('');
              setAdminNewPass('');
              setAdminConfirmPass('');
              setShowChangeAdminPassModal(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 shadow-xs transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Pengaturan</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center justify-between text-xs sm:text-sm font-medium animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4 p-0.5"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Total Kamar</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight tabular-nums">{totalRoomsCount}</div>
          <span className="text-xs text-slate-400 mt-1">Jadid &amp; Qodim (Lt 2-5)</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Kapasitas Kasur</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight tabular-nums">{totalCapacity}</div>
          <span className="text-xs text-emerald-600 font-medium mt-1">{totalCapacity - totalBooked} Tersedia</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Santri Terdaftar</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight tabular-nums">{totalBooked}</div>
          <span className="text-xs text-slate-400 mt-1">Dari {totalSkCount} di SK</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Sudah Check-In</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1 tracking-tight tabular-nums">{totalCheckedIn}</div>
          <span className="text-xs text-slate-400 mt-1">Kunci diserahkan</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Kamar Terkunci</span>
          <div className="text-2xl font-bold text-amber-700 mt-1 tracking-tight tabular-nums">{totalLockedRooms}</div>
          <span className="text-xs text-amber-700 font-medium mt-1">Khusus / Mudabbir</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Pengurus Lantai</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight tabular-nums">{skPengurusList.length}</div>
          <span className="text-xs text-slate-400 mt-1">Mudabbir &amp; Mudabbirah</span>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1 sm:gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('MONITORING')}
          className={`pb-3 px-1 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors shrink-0 ${
            activeTab === 'MONITORING'
              ? 'border-uin-primary text-uin-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Monitoring Kehadiran ({mhsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ROOMS')}
          className={`pb-3 px-1 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors shrink-0 ${
            activeTab === 'ROOMS'
              ? 'border-uin-primary text-uin-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Manajemen Kamar &amp; Kasur ({rooms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SK_MASTER')}
          className={`pb-3 px-1 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors shrink-0 ${
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
          className={`pb-3 px-1 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors shrink-0 ${
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
        <div className="space-y-4">
          
          {/* Data Toolbar / Filters */}
          <div className="bg-white p-3.5 sm:p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Nama, NIM/NISN, atau Kamar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:bg-white focus:border-uin-primary focus:ring-1 focus:ring-uin-primary outline-none transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Gedung Filter */}
              <select
                value={filterGedung}
                onChange={(e) => setFilterGedung(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:bg-white focus:border-uin-primary transition-colors"
              >
                <option value="ALL">Semua Gedung</option>
                <option value="Ma'had Jadid">Ma&apos;had Jadid (Putra &amp; Putri)</option>
                <option value="Ma'had Qodim">Ma&apos;had Qodim (Full Putri)</option>
              </select>

              {/* Floor Filter */}
              <select
                value={filterFloor}
                onChange={(e) => setFilterFloor(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:bg-white focus:border-uin-primary transition-colors"
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
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:bg-white focus:border-uin-primary transition-colors"
              >
                <option value="ALL">Semua Status</option>
                <option value="REGISTERED">Booking Kamar</option>
                <option value="CHECKED_IN">Checked-In</option>
              </select>

              {/* Reset Check-In Button */}
              {totalCheckedIn > 0 && (
                <button
                  type="button"
                  onClick={handleResetAllCheckIns}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium transition-colors"
                  title="Nol-kan status check-in seluruh santri"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Nol-kan Check-In ({totalCheckedIn})</span>
                </button>
              )}
            </div>
          </div>

          {/* Table Mahasantri */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                  <tr>
                    <th className="py-3 px-4">Mahasantri</th>
                    <th className="py-3 px-4">Gender &amp; Jalur</th>
                    <th className="py-3 px-4">Lokasi Kamar</th>
                    <th className="py-3 px-4">Status &amp; Waktu</th>
                    <th className="py-3 px-4">Petugas / Catatan</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMhs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-normal">
                        Tidak ada data mahasantri yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredMhs.map((mhs) => (
                      <tr key={mhs.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 text-xs sm:text-sm">{mhs.nama}</div>
                          <div className="font-mono text-slate-500 text-[11px]">{mhs.nimNisn}</div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            <span
                              title={`Jurusan: ${getFullJurusanName(mhs.jurusan, mhs.fakultas)}`}
                              className="cursor-help underline decoration-dotted decoration-slate-300 hover:text-slate-900"
                            >
                              {getShortJurusan(mhs.jurusan, mhs.fakultas)}
                            </span>{' '}
                            &bull; {mhs.fakultas}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                            mhs.jenisKelamin === 'L'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {mhs.jenisKelamin === 'L' ? 'Putra' : 'Putri'}
                          </span>
                          <div className="text-slate-500 text-[11px] mt-1">{mhs.jenisPendaftaran}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{mhs.gedung}</div>
                          <div className="text-uin-primary font-bold text-xs">
                            Kamar {mhs.nomorKamar} (Bed {mhs.bedNumber})
                          </div>
                          <div className="text-slate-400 text-[11px]">Lantai {mhs.lantai}</div>
                        </td>

                        <td className="py-3 px-4">
                          {mhs.statusCheckIn === 'CHECKED_IN' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Checked-In
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-medium">
                              <Clock className="w-3 h-3 text-slate-500" />
                              Booking Kamar
                            </span>
                          )}
                          {mhs.checkInTimestamp && (
                            <div className="text-[11px] text-slate-400 mt-1">
                              {new Date(mhs.checkInTimestamp).toLocaleString('id-ID')}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-[11px] text-slate-600 max-w-xs">
                          <div className="font-medium text-slate-700">{mhs.petugasCheckIn || '-'}</div>
                          <div className="text-[11px] text-slate-500 truncate">{mhs.catatanBarangCheckIn || '-'}</div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                            <a
                              href={`/tiket/${encodeURIComponent(mhs.nimNisn)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              E-Tiket
                            </a>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMhsForMove(mhs);
                                const availableRooms = rooms.filter(
                                  (r) => !r.isLocked && (r.gender === mhs.jenisKelamin || !r.gender)
                                );
                                if (availableRooms.length > 0) {
                                  setMoveTargetKamarId(availableRooms[0].id);
                                  const emptyBed = availableRooms[0].beds.find((b) => !b.isOccupied);
                                  setMoveTargetBed(emptyBed ? emptyBed.bedNumber : 1);
                                }
                                setShowMoveModal(true);
                              }}
                              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors"
                              title="Pindahkan ke kamar lain atau bebaskan ranjang"
                            >
                              <ArrowRightLeft className="w-3 h-3 text-slate-500" />
                              <span>Pindah</span>
                            </button>

                            {mhs.statusCheckIn === 'CHECKED_IN' && (
                              <button
                                type="button"
                                onClick={() => handleCancelCheckIn(mhs.nimNisn, mhs.nama)}
                                className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors"
                                title="Batalkan status check-in santri ini"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Batal</span>
                              </button>
                            )}
                          </div>
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
      {/* TAB 2: MANAJEMEN KAMAR & KASUR                            */}
      {/* ========================================================= */}
      {activeTab === 'ROOMS' && (
        <div className="space-y-4">
          
          {/* Room Filter Controls */}
          <div className="bg-white p-3.5 sm:p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setRoomFilterGedung("Ma'had Jadid")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  roomFilterGedung === "Ma'had Jadid"
                    ? 'bg-uin-primary text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Gedung Jadid (Putra &amp; Putri)
              </button>

              <button
                type="button"
                onClick={() => setRoomFilterGedung("Ma'had Qodim")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  roomFilterGedung === "Ma'had Qodim"
                    ? 'bg-uin-primary text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Gedung Qodim (Khusus Putri)
              </button>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                {[2, 3, 4, 5].map((fl) => (
                  <button
                    key={fl}
                    type="button"
                    onClick={() => setRoomFilterFloor(fl)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
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
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-uin-primary outline-none w-36 transition-colors"
              />
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredRoomsList.map((kamar) => {
              const occupiedCount = kamar.beds.filter((b) => b.isOccupied).length;

              return (
                <div
                  key={kamar.id}
                  className={`bg-white rounded-lg p-4 border transition-colors space-y-3 ${
                    kamar.isLocked
                      ? 'border-amber-300 bg-amber-50/20 shadow-xs'
                      : occupiedCount >= kamar.kapasitas
                      ? 'border-slate-200 bg-slate-50/60'
                      : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Room Card Top */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-mono font-bold text-base text-slate-900">
                          Kamar {kamar.nomor}
                        </h3>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                          kamar.gender === 'L'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {kamar.gender === 'L' ? 'Putra' : 'Putri'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{kamar.gedung} &bull; Lantai {kamar.lantai}</p>
                    </div>

                    {kamar.isLocked ? (
                      <span className="p-1 bg-amber-100 text-amber-800 rounded-md">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1 bg-slate-100 text-slate-600 rounded-md">
                        <Unlock className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {/* Lock Reason if locked */}
                  {kamar.isLocked && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-900 font-medium flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-amber-700 shrink-0" />
                      <span className="truncate">{kamar.lockReason || 'Kamar Dikunci Admin'}</span>
                    </div>
                  )}

                  {/* Bed Capacity Indicator */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5 text-slate-500" />
                        Kapasitas: {kamar.kapasitas} Kasur
                      </span>
                      <span className={occupiedCount >= kamar.kapasitas ? 'text-rose-700 font-medium' : 'text-emerald-700 font-medium'}>
                        {occupiedCount} / {kamar.kapasitas} Terisi
                      </span>
                    </div>
                    
                    {/* Visual Bed Slots */}
                    <div className="grid grid-cols-4 gap-1 pt-1">
                      {kamar.beds.map((b) => (
                        <div
                          key={b.bedNumber}
                          className={`py-1 px-1 text-center text-[10px] font-semibold rounded ${
                            b.isOccupied
                              ? 'bg-slate-200 text-slate-600'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
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
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRoomForLock(kamar);
                        setLockReasonInput(kamar.lockReason || 'Kamar Mudabbir');
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
                        kamar.isLocked
                          ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      {kamar.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{kamar.isLocked ? 'Buka Kunci' : 'Kunci'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRoomForCapacity(kamar);
                        setNewCapacityInput(kamar.kapasitas);
                      }}
                      className="py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <BedDouble className="w-3.5 h-3.5 text-slate-500" />
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
        <div className="space-y-4">
          
          {/* Search, Filter & Per Page Controls */}
          <div className="bg-white p-3.5 sm:p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Nama, NIM/NISN, Prodi, atau Fakultas..."
                value={skSearchQuery}
                onChange={(e) => {
                  setSkSearchQuery(e.target.value);
                  setSkPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:bg-white focus:border-uin-primary outline-none transition-colors"
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
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:bg-white focus:border-uin-primary transition-colors"
              >
                <option value="ALL">Semua Gender</option>
                <option value="L">Putra (L)</option>
                <option value="P">Putri (P)</option>
              </select>

              {/* Rows Per Page */}
              <select
                value={skPerPage === 'ALL' ? 'ALL' : String(skPerPage)}
                onChange={(e) => {
                  setSkPerPage(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value));
                  setSkPage(1);
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:bg-white focus:border-uin-primary transition-colors"
              >
                <option value="50">50 per hal</option>
                <option value="100">100 per hal</option>
                <option value="250">250 per hal</option>
                <option value="500">500 per hal</option>
                <option value="ALL">Semua ({skList.length} Data)</option>
              </select>

              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-uin-primary hover:bg-uin-secondary text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>Upload SK (PDF)</span>
              </button>

              <button
                onClick={() => setShowAddSkModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
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
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-slate-500">
                  <div>
                    Menampilkan <span className="text-slate-900 font-semibold">{totalFiltered > 0 ? startIdx + 1 : 0} - {endIdx}</span> dari total <span className="text-slate-900 font-semibold">{totalFiltered} Mahasantri</span> di SK resmi (Total Master: {skList.length})
                  </div>
                  {totalPages > 1 && (
                    <div className="text-slate-500">
                      Halaman <span className="text-slate-900 font-semibold">{currentPage}</span> dari {totalPages}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                        <tr>
                          <th className="py-3 px-4">No</th>
                          <th className="py-3 px-4">Identitas Mahasantri</th>
                          <th className="py-3 px-4">Gender &amp; Jalur</th>
                          <th className="py-3 px-4">Fakultas / Prodi</th>
                          <th className="py-3 px-4">Status Akun PIN</th>
                          <th className="py-3 px-4 text-right">Aksi Helpdesk</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {displayedSkList.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400 font-normal">
                              Tidak ada data mahasantri yang cocok dengan pencarian.
                            </td>
                          </tr>
                        ) : (
                          displayedSkList.map((item, idx) => (
                            <tr key={item.nimNisn} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3 px-4 font-mono text-slate-400">{startIdx + idx + 1}</td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-900 text-xs sm:text-sm">{item.nama}</div>
                                <div className="font-mono text-slate-500 text-[11px]">NIM/NISN: {item.nimNisn}</div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                                  item.jenisKelamin === 'L'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  {item.jenisKelamin === 'L' ? 'Putra' : 'Putri'}
                                </span>
                                <div className="text-[11px] text-slate-500 mt-0.5">{item.jenisPendaftaran}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div>
                                  <span
                                    title={`Program Studi: ${getFullJurusanName(item.jurusan, item.fakultas)}`}
                                    className="font-medium text-slate-800 text-xs cursor-help underline decoration-dotted decoration-slate-300 hover:text-slate-900"
                                  >
                                    {getShortJurusan(item.jurusan, item.fakultas)}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">{item.fakultas}</div>
                              </td>
                              <td className="py-3 px-4">
                                {item.pin ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    PIN Aktif
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-medium">
                                    Belum Aktivasi
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {item.pin && (
                                  <button
                                    onClick={() => handleResetPin(item.nimNisn, item.nama)}
                                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium transition-colors"
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
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="text-xs text-slate-500">
                      Halaman {currentPage} dari {totalPages}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => setSkPage(1)}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                      >
                        &laquo; Pertama
                      </button>

                      <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => setSkPage((p) => Math.max(1, p - 1))}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                      >
                        &lsaquo; Prev
                      </button>

                      <div className="flex items-center gap-1 px-1">
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
                              className={`w-7 h-7 rounded-md text-xs font-semibold transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-uin-primary text-white'
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
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                      >
                        Next &rsaquo;
                      </button>

                      <button
                        type="button"
                        disabled={currentPage >= totalPages}
                        onClick={() => setSkPage(totalPages)}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
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
        <div className="space-y-4">
          
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Master Data SK Mudabbir &amp; Mudabbirah</h2>
              <p className="text-xs text-slate-500">Pengurus lorong berwenang melakukan pemindaian barcode check-in mahasantri per lantai.</p>
            </div>

            <button
              onClick={() => setShowAddPengurusModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-uin-primary hover:bg-uin-secondary text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pengurus Baru</span>
            </button>
          </div>

          {/* Table SK Pengurus */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                  <tr>
                    <th className="py-3 px-4">Nama Pengurus</th>
                    <th className="py-3 px-4">Kredensial Login</th>
                    <th className="py-3 px-4">Jabatan &amp; Gender</th>
                    <th className="py-3 px-4">Penugasan Gedung &amp; Lantai</th>
                    <th className="py-3 px-4">Kamar Khusus</th>
                    <th className="py-3 px-4">No. WhatsApp</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {skPengurusList.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">{p.nama}</div>
                        <div className="text-[11px] text-slate-400 font-mono">ID: {p.id} {p.nim ? `| NIM: ${p.nim}` : ''}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-700 text-xs font-semibold">User: {p.id}</div>
                        <div className="font-mono text-slate-500 text-[11px] mt-0.5">
                          Pass: <span className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">{p.password || 'mahad2026'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                          p.jenisKelamin === 'L'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {p.jenisKelamin === 'L' ? 'Mudabbir (Putra)' : 'Mudabbirah (Putri)'}
                        </span>
                        <div className="text-slate-600 font-medium text-xs mt-0.5">{p.jabatan}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{p.gedung}</div>
                        <div className="text-uin-primary font-bold text-xs">Lantai {p.lantai}</div>
                      </td>

                      <td className="py-3 px-4">
                        {p.kamarKhusus ? (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-mono font-semibold text-xs">
                            Kamar {p.kamarKhusus}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600 text-xs">
                        {p.noWa}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Hapus pengurus ${p.nama}?`)) {
                              MahadStore.deleteSKPengurus(p.id);
                              setNotification(`Pengurus ${p.nama} berhasil dihapus.`);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-5 sm:p-6 max-w-md w-full shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {selectedRoomForLock.isLocked ? 'Buka Kunci Kamar' : 'Kunci Kamar Khusus'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedRoomForLock.gedung} &bull; Kamar {selectedRoomForLock.nomor}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRoomForLock(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!selectedRoomForLock.isLocked ? (
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Alasan Kamar Dikunci (Agar tidak dipilih santri):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kamar Mudabbir, Kamar Tamu, Perbaikan AC..."
                  value={lockReasonInput}
                  onChange={(e) => setLockReasonInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:bg-white focus:border-uin-primary outline-none transition-colors"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Kamar Mudabbir', 'Kamar Mudabbirah', 'Kamar Tamu / Transit', 'Perbaikan Fasilitas'].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setLockReasonInput(sug)}
                      className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium transition-colors"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin membuka kunci <strong>Kamar {selectedRoomForLock.nomor}</strong>? Mahasantri akan dapat kembali memilih kasur di kamar ini.
              </p>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedRoomForLock(null)}
                className="flex-1 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleToggleLock}
                className="flex-1 py-2 bg-uin-primary hover:bg-uin-secondary text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                {selectedRoomForLock.isLocked ? 'Buka Kunci' : 'Kunci Kamar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: UBAH KAPASITAS KASUR                             */}
      {/* ========================================================= */}
      {selectedRoomForCapacity && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-5 sm:p-6 max-w-md w-full shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-uin-primary rounded-lg border border-emerald-100">
                  <BedDouble className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Ubah Kapasitas Kasur</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedRoomForCapacity.gedung} &bull; Kamar {selectedRoomForCapacity.nomor}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRoomForCapacity(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Jumlah Kasur di Kamar Ini:
              </label>

              <div className="flex items-center justify-center gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setNewCapacityInput((prev) => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-md bg-white border border-slate-300 hover:bg-slate-100 font-bold text-base flex items-center justify-center text-slate-700 shadow-xs"
                >
                  -
                </button>
                <div className="text-2xl font-bold text-slate-900 font-mono w-14 text-center">
                  {newCapacityInput}
                </div>
                <button
                  type="button"
                  onClick={() => setNewCapacityInput((prev) => Math.min(12, prev + 1))}
                  className="w-8 h-8 rounded-md bg-white border border-slate-300 hover:bg-slate-100 font-bold text-base flex items-center justify-center text-slate-700 shadow-xs"
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
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      newCapacityInput === num
                        ? 'bg-uin-primary text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {num} Kasur
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                Standar bawaan Ma&apos;had adalah 4 kasur per kamar.
              </p>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedRoomForCapacity(null)}
                className="flex-1 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveCapacity}
                className="flex-1 py-2 bg-uin-primary hover:bg-uin-secondary text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-5 sm:p-6 max-w-lg w-full shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-uin-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Tambah SK Mudabbir / Pengurus</h3>
                  <p className="text-xs text-slate-500">Daftarkan mudabbir lantai dan buat akses login scanner.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddPengurusModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPengurus} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Pengurus:</label>
                <input
                  type="text"
                  required
                  placeholder="Ust. M. Raihan S.Pd atau Siti Aisyah"
                  value={newPgrNama}
                  onChange={(e) => setNewPgrNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-uin-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin:</label>
                  <select
                    value={newPgrGender}
                    onChange={(e) => setNewPgrGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-uin-primary transition-colors"
                  >
                    <option value="L">Laki-laki (Mudabbir)</option>
                    <option value="P">Perempuan (Mudabbirah)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIM / NIDN (Opsional):</label>
                  <input
                    type="text"
                    placeholder="1908102001"
                    value={newPgrNim}
                    onChange={(e) => setNewPgrNim(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-uin-primary transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Penugasan Gedung:</label>
                  <select
                    value={newPgrGedung}
                    onChange={(e) => setNewPgrGedung(e.target.value as GedungType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-uin-primary transition-colors"
                  >
                    <option value="Ma'had Jadid">Ma&apos;had Jadid</option>
                    <option value="Ma'had Qodim">Ma&apos;had Qodim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Penugasan Lantai:</label>
                  <select
                    value={newPgrLantai}
                    onChange={(e) => setNewPgrLantai(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-uin-primary transition-colors"
                  >
                    <option value={2}>Lantai 2</option>
                    <option value={3}>Lantai 3</option>
                    <option value={4}>Lantai 4</option>
                    <option value={5}>Lantai 5</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan Struktural:</label>
                  <input
                    type="text"
                    placeholder="Mudabbir Lantai 2"
                    value={newPgrJabatan}
                    onChange={(e) => setNewPgrJabatan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-uin-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kamar Khusus (Opsional):</label>
                  <input
                    type="text"
                    placeholder="Contoh: 209 (Otomatis dikunci)"
                    value={newPgrKamar}
                    onChange={(e) => setNewPgrKamar(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-uin-primary transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp Aktif:</label>
                  <input
                    type="tel"
                    required
                    placeholder="08123456789"
                    value={newPgrWa}
                    onChange={(e) => setNewPgrWa(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-uin-primary transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password Login Scanner:</label>
                  <input
                    type="text"
                    required
                    placeholder="Default: mahad2026"
                    value={newPgrPassword}
                    onChange={(e) => setNewPgrPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-uin-primary transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPengurusModal(false)}
                  className="flex-1 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-uin-primary hover:bg-uin-secondary text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  Simpan SK Pengurus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: TAMBAH SK MAHASANTRI MANUAL                      */}
      {/* ========================================================= */}
      {showAddSkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-5 sm:p-6 max-w-lg w-full shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                  <Plus className="w-4 h-4 text-uin-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Tambah Mahasantri ke SK Resmi</h3>
                  <p className="text-xs text-slate-500">Input manual mahasantri yang lulus SK susulan.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddSkModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSingleSK} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIM / NISN Sesuai SK:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0067999651"
                    value={newNimNisn}
                    onChange={(e) => setNewNimNisn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-uin-primary transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Santri:</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap sesuai ijazah"
                    value={newNama}
                    onChange={(e) => setNewNama(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-uin-primary transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin:</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-uin-primary transition-colors"
                  >
                    <option value="L">Laki-laki (Putra)</option>
                    <option value="P">Perempuan (Putri)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Pendaftaran:</label>
                  <select
                    value={newJenis}
                    onChange={(e) => setNewJenis(e.target.value as JenisPendaftaran)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-uin-primary transition-colors"
                  >
                    <option value="Calon Mahasantri Baru">Calon Mahasantri Baru</option>
                    <option value="Perpanjangan">Perpanjangan (Mahasantri Lama)</option>
                    <option value="Mahasantri Internasional">Mahasantri Internasional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fakultas:</label>
                  <select
                    value={newFakultas}
                    onChange={(e) => setNewFakultas(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-uin-primary transition-colors"
                  >
                    {FAKULTAS_LIST.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Program Studi / Jurusan:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Tadris Biologi"
                    value={newJurusan}
                    onChange={(e) => setNewJurusan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-uin-primary transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsInt}
                    onChange={(e) => setNewIsInt(e.target.checked)}
                    className="rounded text-uin-primary focus:ring-uin-primary"
                  />
                  <span className="text-xs text-slate-700 font-medium">Santri Internasional (Luar Negeri)</span>
                </label>
              </div>

              {newIsInt && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Asal Negara:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Malaysia, Thailand, Mesir"
                    value={newNegara}
                    onChange={(e) => setNewNegara(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-uin-primary transition-colors"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSkModal(false)}
                  className="flex-1 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-uin-primary hover:bg-uin-secondary text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  Simpan Mahasantri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: PINDAH / KELUARKAN MAHASANTRI                    */}
      {/* ========================================================= */}
      {showMoveModal && selectedMhsForMove && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-5 sm:p-6 max-w-lg w-full shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                  <ArrowRightLeft className="w-4 h-4 text-uin-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Pindah / Bebaskan Ranjang Mahasantri</h3>
                  <p className="text-xs text-slate-500">Relokasi kamar atau bebaskan ranjang santri.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowMoveModal(false);
                  setSelectedMhsForMove(null);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Mahasantri Saat Ini */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-slate-900 text-xs sm:text-sm">{selectedMhsForMove.nama}</div>
                  <div className="font-mono text-slate-500 text-xs">{selectedMhsForMove.nimNisn}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{selectedMhsForMove.fakultas} &bull; {selectedMhsForMove.jurusan}</div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                  selectedMhsForMove.jenisKelamin === 'L'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {selectedMhsForMove.jenisKelamin === 'L' ? 'Putra' : 'Putri'}
                </span>
              </div>
              
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">Posisi Saat Ini:</span>
                <span className="font-semibold text-uin-primary bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                  {selectedMhsForMove.gedung} &bull; Kamar {selectedMhsForMove.nomorKamar} (Bed {selectedMhsForMove.bedNumber})
                </span>
              </div>
            </div>

            {/* OPSI 1: PINDAH KE KAMAR LAIN OLEH ADMIN */}
            <form onSubmit={handleDirectMove} className="space-y-3 bg-white p-3.5 rounded-lg border border-slate-200">
              <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-uin-primary" />
                <span>Opsi 1: Pindahkan Langsung ke Kamar Baru</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Pilih kamar dan nomor ranjang tujuan yang masih tersedia untuk santri ini.
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kamar Tujuan:</label>
                  <select
                    value={moveTargetKamarId}
                    onChange={(e) => {
                      setMoveTargetKamarId(e.target.value);
                      const target = rooms.find((r) => r.id === e.target.value);
                      if (target) {
                        const emptyBed = target.beds.find((b) => !b.isOccupied);
                        setMoveTargetBed(emptyBed ? emptyBed.bedNumber : 1);
                      }
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none font-medium focus:bg-white focus:border-uin-primary transition-colors"
                  >
                    {rooms
                      .filter((r) => !r.isLocked && (r.gender === selectedMhsForMove.jenisKelamin || !r.gender))
                      .map((r) => {
                        const emptyBedsCount = r.beds.filter((b) => !b.isOccupied).length;
                        return (
                          <option key={r.id} value={r.id}>
                            {r.gedung.replace("Ma'had ", "")} - Kamar {r.nomor} ({emptyBedsCount} kosong)
                          </option>
                        );
                      })}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nomor Ranjang:</label>
                  <select
                    value={moveTargetBed}
                    onChange={(e) => setMoveTargetBed(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none font-medium focus:bg-white focus:border-uin-primary transition-colors"
                  >
                    {(() => {
                      const curRoom = rooms.find((r) => r.id === moveTargetKamarId);
                      if (!curRoom) return <option value={1}>Bed 1</option>;
                      return curRoom.beds.map((b) => (
                        <option key={b.bedNumber} value={b.bedNumber} disabled={b.isOccupied && b.mahasantriNimNisn !== selectedMhsForMove.nimNisn}>
                          Bed {b.bedNumber} {b.isOccupied ? (b.mahasantriNimNisn === selectedMhsForMove.nimNisn ? '(Ranjang Ini)' : '(Penuh)') : '(Tersedia)'}
                        </option>
                      ));
                    })()}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Simpan Pemindahan Kamar</span>
              </button>
            </form>

            {/* OPSI 2: KELUARKAN SANTRI / BEBASKAN RANJANG */}
            <div className="space-y-2 bg-rose-50/40 p-3.5 rounded-lg border border-rose-200">
              <div className="font-semibold text-xs text-rose-950 flex items-center gap-1.5">
                <UserMinus className="w-4 h-4 text-rose-600" />
                <span>Opsi 2: Bebaskan Ranjang Santri Ini</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Ranjang <strong>Kamar {selectedMhsForMove.nomorKamar} (Bed {selectedMhsForMove.bedNumber})</strong> akan langsung dikosongkan. Santri tetap terdaftar di SK dan dapat memilih kamar baru secara mandiri.
              </p>

              <button
                type="button"
                onClick={() =>
                  handleEvictMahasantri(
                    selectedMhsForMove.nimNisn,
                    selectedMhsForMove.nama,
                    selectedMhsForMove.nomorKamar,
                    selectedMhsForMove.bedNumber
                  )
                }
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluarkan &amp; Bebaskan Ranjang</span>
              </button>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowMoveModal(false);
                  setSelectedMhsForMove(null);
                }}
                className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: PENGATURAN SISTEM & KEAMANAN                     */}
      {/* ========================================================= */}
      {showChangeAdminPassModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-5 sm:p-6 max-w-lg w-full shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                  <Settings className="w-4 h-4 text-uin-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Pengaturan Sistem</h3>
                  <p className="text-xs text-slate-500">Konfigurasi kata sandi Superadmin &amp; berkas laporan Ma&apos;had.</p>
                </div>
              </div>
              <button
                onClick={() => setShowChangeAdminPassModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SECTION 1: GANTI PASSWORD SUPERADMIN */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <Key className="w-4 h-4 text-uin-primary" />
                <span>Ganti Password Superadmin</span>
              </div>

              <form onSubmit={handleChangeAdminPassword} className="space-y-3 pt-1">
                {adminPassError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-800 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{adminPassError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Password Lama:</label>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan password lama saat ini"
                    value={adminOldPass}
                    onChange={(e) => setAdminOldPass(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-uin-primary font-mono transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Password Baru:</label>
                    <input
                      type="password"
                      required
                      placeholder="Min. 6 karakter"
                      value={adminNewPass}
                      onChange={(e) => setAdminNewPass(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-uin-primary font-mono transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ulangi Password:</label>
                    <input
                      type="password"
                      required
                      placeholder="Konfirmasi password"
                      value={adminConfirmPass}
                      onChange={(e) => setAdminConfirmPass(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-uin-primary font-mono transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-uin-primary hover:bg-uin-secondary text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Simpan Password Baru</span>
                </button>
              </form>
            </div>

            {/* SECTION 2: UTILITAS LAPORAN */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Template Laporan Excel 4-Sheet</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                File Excel (.xlsx) dengan 4 sheet laporan (Data Master, Rekap Lantai, Buku Induk Kamar, &amp; Demografi Fakultas).
              </p>
              <a
                href="/Template_Laporan_Pivot_Cekin_Mahad_UINSSC.xlsx"
                download="Template_Laporan_Pivot_Cekin_Mahad_UINSSC.xlsx"
                className="inline-flex items-center justify-center gap-2 w-full py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Unduh Template Laporan (.xlsx)</span>
              </a>
            </div>

            {/* CLOSE BUTTON */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowChangeAdminPassModal(false)}
                className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
              >
                Tutup Pengaturan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SK Upload Modal */}
      <SKUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={(count) => {
          setNotification(`Berhasil mengimpor ${count} data Mahasantri dari SK.`);
          setShowUploadModal(false);
        }}
      />

    </div>
  );
}
