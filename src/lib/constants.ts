import { Kamar, Mahasantri, SKMahasantri } from './types';

export const SK_INFO = {
  nomor: 'SK Penerimaan & Penempatan Resmi',
  judul: 'PENETAPAN NAMA-NAMA DAN JADWAL CEK IN MAHASANTRI PROGRAM MUKIM',
  instansi: 'UPT MA\'HAD AL-JAMI\'AH UIN SIBER SYEKH NURJATI CIREBON',
  jadwal: 'Sesuai Jadwal Resmi Kalender Akademik Ma\'had',
  contactPerson: '0858-6275-9619',
  mudir: 'Dr. Muhsin Riyadi, MA',
  lokasiPutra: 'Asrama Ma\'had Jadid (Lt. 2-5)',
  lokasiPutri: 'Asrama Ma\'had Qodim & Ma\'had Jadid',
};

// Generate rooms for Ma'had Jadid (Putra 09-16, Putri 01-08 & 17-24) and Ma'had Qodim (Full Putri 01-24) - Lantai 2 to 5
export function generateInitialRooms(): Kamar[] {
  const rooms: Kamar[] = [];
  const floors = [2, 3, 4, 5];

  floors.forEach((floor) => {
    // --- 1. GEDUNG MA'HAD JADID (Putra & Putri) ---
    // A. Putri Barat (Kamar 01 - 08)
    for (let i = 1; i <= 8; i++) {
      const roomNum = `${floor}${i < 10 ? '0' + i : i}`;
      rooms.push({
        id: `JADID-${roomNum}`,
        nomor: roomNum,
        lantai: floor,
        jajaran: 'PUTRI_BARAT',
        gedung: "Ma'had Jadid",
        gender: 'P',
        kategori: 'UMUM',
        isLocked: false,
        kapasitas: 4,
        beds: [
          { bedNumber: 1, isOccupied: false },
          { bedNumber: 2, isOccupied: false },
          { bedNumber: 3, isOccupied: false },
          { bedNumber: 4, isOccupied: false },
        ],
      });
    }

    // B. Putra (Kamar 09 - 16)
    for (let i = 9; i <= 16; i++) {
      const roomNum = `${floor}${i < 10 ? '0' + i : i}`;
      rooms.push({
        id: `JADID-${roomNum}`,
        nomor: roomNum,
        lantai: floor,
        jajaran: 'PUTRA',
        gedung: "Ma'had Jadid",
        gender: 'L',
        kategori: 'UMUM',
        isLocked: false,
        kapasitas: 4,
        beds: [
          { bedNumber: 1, isOccupied: false },
          { bedNumber: 2, isOccupied: false },
          { bedNumber: 3, isOccupied: false },
          { bedNumber: 4, isOccupied: false },
        ],
      });
    }

    // C. Putri Timur (Kamar 17 - 24)
    for (let i = 17; i <= 24; i++) {
      const roomNum = `${floor}${i}`;
      rooms.push({
        id: `JADID-${roomNum}`,
        nomor: roomNum,
        lantai: floor,
        jajaran: 'PUTRI_TIMUR',
        gedung: "Ma'had Jadid",
        gender: 'P',
        kategori: 'UMUM',
        isLocked: false,
        kapasitas: 4,
        beds: [
          { bedNumber: 1, isOccupied: false },
          { bedNumber: 2, isOccupied: false },
          { bedNumber: 3, isOccupied: false },
          { bedNumber: 4, isOccupied: false },
        ],
      });
    }

    // --- 2. GEDUNG MA'HAD QODIM (Full Putri Kamar 01 - 24) ---
    // A. Putri Jajaran Depan (Kamar 01 - 12)
    for (let i = 1; i <= 12; i++) {
      const roomNum = `${floor}${i < 10 ? '0' + i : i}`;
      rooms.push({
        id: `QODIM-${roomNum}`,
        nomor: roomNum,
        lantai: floor,
        jajaran: 'DEPAN',
        gedung: "Ma'had Qodim",
        gender: 'P',
        kategori: 'UMUM',
        isLocked: false,
        kapasitas: 4,
        beds: [
          { bedNumber: 1, isOccupied: false },
          { bedNumber: 2, isOccupied: false },
          { bedNumber: 3, isOccupied: false },
          { bedNumber: 4, isOccupied: false },
        ],
      });
    }

    // B. Putri Jajaran Belakang (Kamar 13 - 24)
    for (let i = 13; i <= 24; i++) {
      const roomNum = `${floor}${i}`;
      rooms.push({
        id: `QODIM-${roomNum}`,
        nomor: roomNum,
        lantai: floor,
        jajaran: 'BELAKANG',
        gedung: "Ma'had Qodim",
        gender: 'P',
        kategori: 'UMUM',
        isLocked: false,
        kapasitas: 4,
        beds: [
          { bedNumber: 1, isOccupied: false },
          { bedNumber: 2, isOccupied: false },
          { bedNumber: 3, isOccupied: false },
          { bedNumber: 4, isOccupied: false },
        ],
      });
    }
  });

  return rooms;
}

// Master Data SK Resmi dari Dokumen Pengumuman Mahad No. B-092/Un.30/P.IV/KP.07.06/06/2026
export const INITIAL_SK_LIST: SKMahasantri[] = [
  // --- MAHASANTRI PUTRA (CALON MAHASANTRI BARU BERBASIS NISN & PERPANJANGAN BERBASIS NIM) ---
  {
    no: 1,
    nimNisn: '2530104044',
    nama: 'Muhammad Indera Wiguna',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Perpanjangan',
    fakultas: 'FITK',
    jurusan: 'TIPS',
    isInternasional: false,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 4,
    nimNisn: '0067999651',
    nama: 'Abdullah Al Mu\'izi Mafas',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Calon Mahasantri Baru',
    fakultas: 'FASYA',
    jurusan: 'HUKUM KELUARGA ISLAM',
    isInternasional: false,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 5,
    nimNisn: '0074324633',
    nama: 'Abdullah Fasya',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Calon Mahasantri Baru',
    fakultas: 'FITK',
    jurusan: 'PAI',
    isInternasional: false,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 6,
    nimNisn: '0081064205',
    nama: 'Abdullah ma\'ruf',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Calon Mahasantri Baru',
    fakultas: 'FITK',
    jurusan: 'MPI',
    isInternasional: false,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 7,
    nimNisn: '0081139935',
    nama: 'Achmad Labib ’Afify',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Calon Mahasantri Baru',
    fakultas: 'FITK',
    jurusan: 'PIAUD',
    isInternasional: false,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 8,
    nimNisn: '0094524939',
    nama: 'Achmad Maher sirojulkaf',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Calon Mahasantri Baru',
    fakultas: 'FEBI',
    jurusan: 'BIOTEKNOLOGI',
    isInternasional: false,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 9,
    nimNisn: '0076281399',
    nama: 'ADAM ALFI WAHDA',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Calon Mahasantri Baru',
    fakultas: 'FITK',
    jurusan: 'TADRIS B. INGGRIS',
    isInternasional: false,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 10,
    nimNisn: '0074173366',
    nama: 'Adam Mansur',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Calon Mahasantri Baru',
    fakultas: 'FASYA',
    jurusan: 'HUKUM TATANEGARA',
    isInternasional: false,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 15,
    nimNisn: '0073338690',
    nama: 'Aditya',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Calon Mahasantri Baru',
    fakultas: 'FITK',
    jurusan: 'PAI',
    isInternasional: false,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 16,
    nimNisn: '0089221715',
    nama: 'Adli Ramadhani',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Calon Mahasantri Baru',
    fakultas: 'FDKI',
    jurusan: 'KOMUNIKASI PENYIARAN ISLAM',
    isInternasional: false,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 18,
    nimNisn: '0077252088',
    nama: 'Affan Nurali Hasan',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Calon Mahasantri Baru',
    fakultas: 'FDKI',
    jurusan: 'KOMUNIKASI PENYIARAN ISLAM',
    isInternasional: false,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 19,
    nimNisn: '0088131041',
    nama: 'Afif Fayyadh Ramadhan',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Calon Mahasantri Baru',
    fakultas: 'FASYA',
    jurusan: 'HUKUM KELUARGA ISLAM',
    isInternasional: false,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 28,
    nimNisn: '2530414009',
    nama: 'Ahmad Ardhi Hasan',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Perpanjangan',
    fakultas: 'FDKI',
    jurusan: 'SOSIOLOGI AGAMA',
    isInternasional: false,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 31,
    nimNisn: '2530801078',
    nama: 'Ahmad Zaky Rahul',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Perpanjangan',
    fakultas: 'FITK',
    jurusan: 'INFORMATIKA',
    isInternasional: false,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 719,
    nimNisn: '2530311086',
    nama: 'SUFYAN TSAURY',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Perpanjangan',
    fakultas: 'FASYA',
    jurusan: 'HUKUM KELUARGA ISLAM',
    isInternasional: false,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 742,
    nimNisn: '2530801002',
    nama: 'TAUFIK ARROKHMAN',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Perpanjangan',
    fakultas: 'FITK',
    jurusan: 'INFORMATIKA',
    isInternasional: false,
    skNomor: SK_INFO.nomor,
  },

  // --- MAHASANTRI INTERNASIONAL DARI SK RESMI (HALAMAN 33 - 35) ---
  {
    no: 846,
    nimNisn: 'INT-PH-846',
    nama: 'Aleanor L. Sharif',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Mahasantri Internasional',
    asalNegara: 'Filipina',
    fakultas: 'FITK',
    jurusan: 'PAI',
    isInternasional: true,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 847,
    nimNisn: 'INT-PH-847',
    nama: 'Prince Adzhar Salisipan Duran',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Mahasantri Internasional',
    asalNegara: 'Filipina',
    fakultas: 'FITK',
    jurusan: 'PAI',
    isInternasional: true,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 849,
    nimNisn: 'INT-TH-849',
    nama: 'Adam Saraeh',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Mahasantri Internasional',
    asalNegara: 'Thailand',
    fakultas: 'FUA',
    jurusan: 'Ilmu Al-Qur\'an & Tafsir (IAT)',
    isInternasional: true,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 853,
    nimNisn: 'INT-SD-853',
    nama: 'Khaled Eltayeb Abdalla Fagdalla',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Mahasantri Internasional',
    asalNegara: 'Sudan',
    fakultas: 'FUA',
    jurusan: 'Tasawuf & Psikoterapi (TAPSI)',
    isInternasional: true,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 863,
    nimNisn: 'INT-NG-863',
    nama: 'Muhammad Bello Abbas',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Mahasantri Internasional',
    asalNegara: 'Nigeria',
    fakultas: 'FEBI',
    jurusan: 'Akuntansi Syariah (AKSYAR)',
    isInternasional: true,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 868,
    nimNisn: 'INT-PK-868',
    nama: 'Aadil Ali',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Mahasantri Internasional',
    asalNegara: 'Pakistan',
    fakultas: 'FITK',
    jurusan: 'Tadris Bahasa Indonesia',
    isInternasional: true,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 873,
    nimNisn: 'INT-EG-873',
    nama: 'Mohamed Khaled Hassan',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Mahasantri Internasional',
    asalNegara: 'Mesir (Egypt)',
    fakultas: 'FITK',
    jurusan: 'Pendidikan Bahasa Arab (PBA)',
    isInternasional: true,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 875,
    nimNisn: 'INT-YE-875',
    nama: 'Mohammed Ali Mohammed Abdulwahid Rageh',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Mahasantri Internasional',
    asalNegara: 'Yaman',
    fakultas: 'FDKI',
    jurusan: 'Pengembangan Masyarakat Islam (PMI)',
    isInternasional: true,
    skNomor: SK_INFO.nomor,
  },

  // --- MAHASANTRI PUTRI (CONTOH DARI SK) ---
  {
    no: 1,
    nimNisn: '0082269226',
    nama: 'Aah Nurhasanah',
    jenisKelamin: 'P',
    jenisPendaftaran: 'Calon Mahasantri Baru',
    fakultas: 'FITK',
    jurusan: 'TADRIS B. INDONESIA',
    isInternasional: false,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 2,
    nimNisn: '0086571930',
    nama: 'Aas Asyipatul Hodijah',
    jenisKelamin: 'P',
    jenisPendaftaran: 'Calon Mahasantri Baru',
    fakultas: 'FITK',
    jurusan: 'PBA',
    isInternasional: false,
    skNomor: SK_INFO.nomor,
  },
  {
    no: 12,
    nimNisn: '2530411130',
    nama: 'Adinda Khoirun Nisa',
    jenisKelamin: 'P',
    jenisPendaftaran: 'Perpanjangan',
    fakultas: 'FDKI',
    jurusan: 'KOMUNIKASI PENYIARAN ISLAM',
    isInternasional: false,
    skNomor: SK_INFO.nomor,
  },
];

// Initial pre-booked Mahasantri
export const INITIAL_MAHASANTRI: Mahasantri[] = [
  {
    id: 'MHS-001',
    nimNisn: '2530311086',
    nama: 'SUFYAN TSAURY',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Perpanjangan',
    fakultas: 'FASYA',
    jurusan: 'HUKUM KELUARGA ISLAM',
    noWa: '081234567890',
    namaWali: 'H. Sutisna',
    noWaWali: '081298765432',
    isInternasional: false,
    pasFotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    gedung: "Ma'had Jadid",
    kamarId: 'JADID-413',
    nomorKamar: '413',
    lantai: 4,
    jajaran: 'PUTRA',
    bedNumber: 1,
    statusCheckIn: 'CHECKED_IN',
    checkInTimestamp: '2026-08-19T08:30:00Z',
    petugasCheckIn: 'Ustadz Ridwan (Mudabbir Lt.4)',
    checkedInBy: 'Ustadz Ridwan (Mudabbir Lt.4)',
    catatanBarang: 'Barang aman sesuai ketentuan Ma\'had.',
    catatanBarangCheckIn: 'Barang aman sesuai ketentuan Ma\'had.',
    qrCodeToken: 'QR-MAHAD-2530311086-413-1',
    qrToken: 'QR-MAHAD-2530311086-413-1',
    skNomor: SK_INFO.nomor,
    createdAt: '2026-08-15T08:30:00Z',
    registeredAt: '2026-08-15T08:30:00Z',
  },
  {
    id: 'MHS-002',
    nimNisn: '0067999651',
    nama: 'Abdullah Al Mu\'izi Mafas',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Calon Mahasantri Baru',
    fakultas: 'FASYA',
    jurusan: 'HUKUM KELUARGA ISLAM',
    noWa: '085712345678',
    namaWali: 'Drs. H. Mahrus',
    noWaWali: '085787654321',
    isInternasional: false,
    pasFotoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    gedung: "Ma'had Jadid",
    kamarId: 'JADID-513',
    nomorKamar: '513',
    lantai: 5,
    jajaran: 'PUTRA',
    bedNumber: 2,
    statusCheckIn: 'REGISTERED',
    qrCodeToken: 'QR-MAHAD-0067999651-513-2',
    qrToken: 'QR-MAHAD-0067999651-513-2',
    skNomor: SK_INFO.nomor,
    createdAt: '2026-08-16T14:20:00Z',
    registeredAt: '2026-08-16T14:20:00Z',
  },
  {
    id: 'MHS-003',
    nimNisn: 'INT-PH-846',
    nama: 'Aleanor L. Sharif',
    jenisKelamin: 'L',
    jenisPendaftaran: 'Mahasantri Internasional',
    asalNegara: 'Filipina',
    fakultas: 'FITK',
    jurusan: 'PAI',
    noWa: '+63912345678',
    namaWali: 'Sharif Family',
    noWaWali: '+63998765432',
    isInternasional: true,
    pasFotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    gedung: "Ma'had Jadid",
    kamarId: 'JADID-209',
    nomorKamar: '209',
    lantai: 2,
    jajaran: 'PUTRA',
    bedNumber: 1,
    statusCheckIn: 'REGISTERED',
    qrCodeToken: 'QR-MAHAD-INT-PH-846-209-1',
    qrToken: 'QR-MAHAD-INT-PH-846-209-1',
    skNomor: SK_INFO.nomor,
    createdAt: '2026-08-17T09:00:00Z',
    registeredAt: '2026-08-17T09:00:00Z',
  },
];

export const FAKULTAS_LIST = [
  'FITK (Fakultas Ilmu Tarbiyah & Keguruan)',
  'FASYA (Fakultas Syariah & Hukum)',
  'FEBI (Fakultas Ekonomi & Bisnis Islam)',
  'FDKI (Fakultas Dakwah & Komunikasi Islam)',
  'FUA (Fakultas Ushuluddin & Adab)',
];

export const ATURAN_BARANG = [
  { item: 'Pemanas Air / Dispenser Listrik / Setrika', allowed: false, desc: 'Dilarang (Bervoltase besar)' },
  { item: 'Rice Cooker / Magic Com', allowed: false, desc: 'Dilarang di kamar (Kecuali di dapur umum)' },
  { item: 'Kompor Gas Portable / Spiritus', allowed: false, desc: 'Sangat dilarang demi keselamatan' },
  { item: 'Rokok / Vape / E-Cigarette / Narkoba', allowed: false, desc: 'Kawasan Bebas Asap Rokok 100%' },
  { item: 'Handphone, Laptop, Tablet, Powerbank', allowed: true, desc: 'Diizinkan untuk perkuliahan' },
  { item: 'Perlengkapan Sholat & Mushaf Al-Qur\'an', allowed: true, desc: 'Wajib dibawa' },
  { item: 'Peralatan Mandi & Cuci Pakaian', allowed: true, desc: 'Ember, gayung, hanger, dll.' },
  { item: 'Obat-obatan Pribadi', allowed: true, desc: 'Wajib lapor jika ada riwayat sakit khusus' },
];

export const DEFAULT_ADMIN = {
  email: 'admin@mahad.uinssc.ac.id',
  nama: 'Superadmin UPT Ma\'had',
  password: 'mahaduinssc@digital',
  role: 'ADMIN' as const,
};

export const DEFAULT_SK_PENGURUS_LIST: import('./types').SKPengurus[] = [
  // --- MUDABBIR PUTRA (GEDUNG JADID) ---
  {
    id: 'SKP-JD-01',
    nama: 'Ustadz Ahmad Fauzi, S.Pd.',
    nim: '1908102001',
    jenisKelamin: 'L',
    jabatan: 'Mudabbir Lantai 2 (Putra)',
    gedung: "Ma'had Jadid",
    lantai: 2,
    kamarKhusus: '209',
    noWa: '08123456721',
    password: 'mahad2026',
    isAktif: true,
    skNomor: 'SK-PENGURUS/01/2026',
  },
  {
    id: 'SKP-JD-02',
    nama: 'Ustadz Farhan Ramadhan, M.Ag.',
    nim: '1908102002',
    jenisKelamin: 'L',
    jabatan: 'Mudabbir Lantai 3 (Putra)',
    gedung: "Ma'had Jadid",
    lantai: 3,
    kamarKhusus: '309',
    noWa: '08123456722',
    password: 'mahad2026',
    isAktif: true,
    skNomor: 'SK-PENGURUS/01/2026',
  },
  {
    id: 'SKP-JD-03',
    nama: 'Ustadz Ridwan Al-Hafidz',
    nim: '1908102003',
    jenisKelamin: 'L',
    jabatan: 'Mudabbir Lantai 4 (Putra)',
    gedung: "Ma'had Jadid",
    lantai: 4,
    kamarKhusus: '409',
    noWa: '08123456723',
    password: 'mahad2026',
    isAktif: true,
    skNomor: 'SK-PENGURUS/01/2026',
  },
  {
    id: 'SKP-JD-04',
    nama: 'Ustadz Zaky Mubarak, S.Ag.',
    nim: '1908102004',
    jenisKelamin: 'L',
    jabatan: 'Mudabbir Lantai 5 (Putra)',
    gedung: "Ma'had Jadid",
    lantai: 5,
    kamarKhusus: '509',
    noWa: '08123456724',
    password: 'mahad2026',
    isAktif: true,
    skNomor: 'SK-PENGURUS/01/2026',
  },
  // --- MUDABBIRAH PUTRI (GEDUNG JADID) ---
  {
    id: 'SKP-JD-05',
    nama: 'Ustadzah Siti Aisyah, S.Pd.',
    nim: '1908103001',
    jenisKelamin: 'P',
    jabatan: 'Mudabbirah Lantai 2 (Putri)',
    gedung: "Ma'had Jadid",
    lantai: 2,
    kamarKhusus: '201',
    noWa: '08123456731',
    password: 'mahad2026',
    isAktif: true,
    skNomor: 'SK-PENGURUS/01/2026',
  },
  {
    id: 'SKP-JD-06',
    nama: 'Ustadzah Nurul Hidayah, M.Pd.',
    nim: '1908103002',
    jenisKelamin: 'P',
    jabatan: 'Mudabbirah Lantai 3 (Putri)',
    gedung: "Ma'had Jadid",
    lantai: 3,
    kamarKhusus: '301',
    noWa: '08123456732',
    password: 'mahad2026',
    isAktif: true,
    skNomor: 'SK-PENGURUS/01/2026',
  },
  // --- MUDABBIRAH PUTRI (GEDUNG QODIM) ---
  {
    id: 'SKP-QD-01',
    nama: 'Ustadzah Fatimah Zahra, S.Ag.',
    nim: '1908104001',
    jenisKelamin: 'P',
    jabatan: 'Mudabbirah Lantai 2 (Full Putri)',
    gedung: "Ma'had Qodim",
    lantai: 2,
    kamarKhusus: '201',
    noWa: '08123456741',
    password: 'mahad2026',
    isAktif: true,
    skNomor: 'SK-PENGURUS/01/2026',
  },
  {
    id: 'SKP-QD-02',
    nama: 'Ustadzah Khadijah Al-Kubro',
    nim: '1908104002',
    jenisKelamin: 'P',
    jabatan: 'Mudabbirah Lantai 3 (Full Putri)',
    gedung: "Ma'had Qodim",
    lantai: 3,
    kamarKhusus: '301',
    noWa: '08123456742',
    password: 'mahad2026',
    isAktif: true,
    skNomor: 'SK-PENGURUS/01/2026',
  },
];

export const DEFAULT_PENGURUS_LIST = [
  {
    id: 'PGR-JD-LT2-L',
    username: 'mudabbir.jadid.lt2',
    nama: 'Ustadz Ahmad Fauzi (Mudabbir Jadid Lt.2 Putra)',
    jenisKelamin: 'L' as const,
    jabatan: 'Mudabbir Lantai 2',
    lantai: 2,
    gedung: "Ma'had Jadid" as const,
    password: 'mahad2026',
    noWa: '08123456721',
  },
  {
    id: 'PGR-JD-LT3-L',
    username: 'mudabbir.jadid.lt3',
    nama: 'Ustadz Farhan (Mudabbir Jadid Lt.3 Putra)',
    jenisKelamin: 'L' as const,
    jabatan: 'Mudabbir Lantai 3',
    lantai: 3,
    gedung: "Ma'had Jadid" as const,
    password: 'mahad2026',
    noWa: '08123456722',
  },
  {
    id: 'PGR-QD-LT2-P',
    username: 'mudabbirah.qodim.lt2',
    nama: 'Ustadzah Fatimah (Mudabbirah Qodim Lt.2 Putri)',
    jenisKelamin: 'P' as const,
    jabatan: 'Mudabbirah Lantai 2',
    lantai: 2,
    gedung: "Ma'had Qodim" as const,
    password: 'mahad2026',
    noWa: '08123456741',
  },
  {
    id: 'PGR-QD-LT3-P',
    username: 'mudabbirah.qodim.lt3',
    nama: 'Ustadzah Khadijah (Mudabbirah Qodim Lt.3 Putri)',
    jenisKelamin: 'P' as const,
    jabatan: 'Mudabbirah Lantai 3',
    lantai: 3,
    gedung: "Ma'had Qodim" as const,
    password: 'mahad2026',
    noWa: '08123456742',
  },
];

// Helper: Convert full Major name to standard recognized abbreviation / singkatan
export function getShortJurusan(jurusan?: string, fakultas?: string): string {
  if (!jurusan) return '-';
  const clean = jurusan.trim().toUpperCase();

  // If already a recognized short acronym (e.g. PAI, HKI, KPI, BKI, AFI, SPI, ESY, TBI, MPI, PIAUD)
  if (clean.length <= 6 && !clean.includes(' ')) {
    return clean;
  }

  // Handle broken "ISLAM" artifact from PDF line-wraps
  if (clean === 'ISLAM') {
    if (fakultas && (fakultas.includes('FDKI') || fakultas.includes('DAKWAH'))) return 'BKI / KPI';
    if (fakultas && (fakultas.includes('FASYA') || fakultas.includes('SYARIAH'))) return 'HKI';
    if (fakultas && (fakultas.includes('FUA') || fakultas.includes('USHULUDDIN'))) return 'SPI / AFI';
    return 'PAI';
  }

  // Exact & Fuzzy Mapping for UIN Siber Syekh Nurjati Cirebon Majors
  if (clean.includes('SEJARAH PERADABAN ISLAM') || clean === 'SPI') return 'SPI';
  if ((clean.includes('KOMUNIKASI') && clean.includes('PENYIARAN')) || clean === 'KPI') return 'KPI';
  if ((clean.includes('BIMBINGAN') && clean.includes('KONSELING')) || clean === 'BKI') return 'BKI';
  if (clean.includes('PENGEMBANGAN MASYARAKAT') || clean === 'PMI') return 'PMI';
  if (clean.includes('MANAJEMEN DAKWAH') || clean === 'MD') return 'MD';
  
  if (clean.includes('PENDIDIKAN AGAMA ISLAM') || clean === 'PAI') return 'PAI';
  if (clean.includes('PENDIDIKAN BAHASA ARAB') || clean === 'PBA') return 'PBA';
  if (clean.includes('MANAJEMEN PENDIDIKAN ISLAM') || clean === 'MPI') return 'MPI';
  if (clean.includes('GURU MADRASAH IBTIDAIYAH') || clean.includes('PGMI')) return 'PGMI';
  if (clean.includes('ANAK USIA DINI') || clean.includes('PIAUD')) return 'PIAUD';
  
  // Tadris (Keguruan) vs Sains Murni
  if (clean.includes('TADRIS MATEMATIKA') || clean.includes('T.MATEMATIKA') || clean.includes('T. MATEMATIKA') || clean.includes('T.MTK') || clean.includes('T. MTK') || clean === 'T-MTK' || clean === 'TMATH') return 'T-MTK';
  if (clean.includes('MATEMATIKA') || clean === 'MTK') return 'MTK';

  if (clean.includes('TADRIS BIOLOGI') || clean.includes('TADRIS IPA') || clean.includes('T.BIOLOGI') || clean.includes('T. BIO') || clean === 'T-BIO' || clean === 'TBIO') return 'T-BIO';
  if (clean.includes('BIOTEKNOLOGI')) return 'BIOTEK';
  if (clean.includes('BIOLOGI') || clean === 'BIO') return 'BIO';

  if (clean.includes('TADRIS FISIKA') || clean.includes('T.FISIKA') || clean.includes('T. FIS') || clean === 'T-FIS' || clean === 'TFIS') return 'T-FIS';
  if (clean.includes('FISIKA') || clean === 'FIS') return 'FIS';

  if (clean.includes('TADRIS KIMIA') || clean.includes('T.KIMIA') || clean.includes('T. KIM') || clean === 'T-KIM' || clean === 'TKIM') return 'T-KIM';
  if (clean.includes('KIMIA') || clean === 'KIM') return 'KIM';

  if (clean.includes('TADRIS BAHASA INGGRIS') || clean.includes('T.INGGRIS') || clean.includes('TBI') || clean.includes('BAHASA INGGRIS')) return 'TBI';
  if (clean.includes('TADRIS BAHASA INDONESIA') || clean.includes('T.INDONESIA') || clean.includes('TBIND') || clean.includes('BAHASA INDONESIA')) return 'TBIND';
  if (clean.includes('TADRIS IPS') || clean === 'TIPS') return 'TIPS';

  if (clean.includes('HUKUM KELUARGA') || clean.includes('AHWAL')) return 'HKI';
  if (clean.includes('HUKUM EKONOMI') || clean.includes('MUAMALAH') || clean === 'HES') return 'HES';
  if (clean.includes('HUKUM TATA NEGARA') || clean.includes('SIYASAH') || clean === 'HTN') return 'HTN';
  if (clean.includes('ILMU FALAK')) return 'IF';

  if (clean.includes('QUR\'AN') || clean.includes('QURAN') || clean.includes('TAFSIR') || clean === 'IAT') return 'IAT';
  if (clean.includes('HADIS') || clean.includes('HADITH') || clean === 'ILHA') return 'ILHA';
  if (clean.includes('AQIDAH') || clean.includes('AKIDAH') || clean.includes('FILSAFAT') || clean === 'AFI') return 'AFI';
  if (clean.includes('SASTRA ARAB') || clean === 'BSA') return 'BSA';
  if (clean.includes('TASAWUF') || clean.includes('PSIKOTERAPI') || clean === 'TAPSI') return 'TAPSI';
  if (clean.includes('STUDI AGAMA') || clean === 'SAA') return 'SAA';

  if (clean.includes('EKONOMI SYARIAH') || clean === 'ESY') return 'ESY';
  if (clean.includes('PERBANKAN SYARIAH') || clean === 'PBS') return 'PBS';
  if (clean.includes('AKUNTANSI SYARIAH') || clean === 'AKSYAR') return 'AKSYAR';
  if (clean.includes('ZAKAT') || clean.includes('WAKAF') || clean === 'MAZAWA') return 'MAZAWA';
  if (clean.includes('PARIWISATA') || clean === 'PARSYAR') return 'PARSYAR';

  if (clean.includes('INFORMATIKA') || clean === 'TI') return 'TI';
  if (clean.includes('SISTEM INFORMASI') || clean === 'SI') return 'SI';

  return clean;
}

// Dictionary: Mapping Standard Acronym to Official Full Major Name
export const JURUSAN_FULL_NAMES: Record<string, string> = {
  'PAI': 'Pendidikan Agama Islam',
  'PBA': 'Pendidikan Bahasa Arab',
  'MPI': 'Manajemen Pendidikan Islam',
  'PGMI': 'Pendidikan Guru Madrasah Ibtidaiyah',
  'PIAUD': 'Pendidikan Islam Anak Usia Dini',
  'TBI': 'Tadris Bahasa Inggris',
  'TBIND': 'Tadris Bahasa Indonesia',
  'TIPS': 'Tadris Ilmu Pengetahuan Sosial (IPS)',
  
  // Tadris vs Sains
  'T-MTK': 'Tadris Matematika',
  'MTK': 'Matematika',
  'T-BIO': 'Tadris IPA Biologi',
  'BIO': 'Biologi',
  'T-FIS': 'Tadris Fisika',
  'FIS': 'Fisika',
  'T-KIM': 'Tadris Kimia',
  'KIM': 'Kimia',

  'HKI': 'Hukum Keluarga Islam (Ahwal Syakhsiyyah)',
  'HES': 'Hukum Ekonomi Syariah (Muamalah)',
  'HTN': 'Hukum Tata Negara (Siyasah)',
  'IF': 'Ilmu Falak',

  'IAT': 'Ilmu Al-Qur\'an dan Tafsir',
  'ILHA': 'Ilmu Hadis',
  'AFI': 'Akidah dan Filsafat Islam',
  'SPI': 'Sejarah Peradaban Islam',
  'BSA': 'Bahasa dan Sastra Arab',
  'TAPSI': 'Tasawuf dan Psikoterapi',
  'SAA': 'Studi Agama-Agama',

  'KPI': 'Komunikasi dan Penyiaran Islam',
  'BKI': 'Bimbingan dan Konseling Islam',
  'PMI': 'Pengembangan Masyarakat Islam',
  'MD': 'Manajemen Dakwah',
  'SA': 'Sosiologi Agama',

  'ESY': 'Ekonomi Syariah',
  'PBS': 'Perbankan Syariah',
  'AKSYAR': 'Akuntansi Syariah',
  'MAZAWA': 'Manajemen Zakat dan Wakaf',
  'PARSYAR': 'Pariwisata Syariah',

  'TI': 'Teknik Informatika',
  'SI': 'Sistem Informasi',
  'BIOTEK': 'Bioteknologi',
};

// Helper: Convert short or long Major name to Official Full Name (for Tooltips / Hover)
export function getFullJurusanName(jurusan?: string, fakultas?: string): string {
  if (!jurusan) return '-';
  const short = getShortJurusan(jurusan, fakultas);
  if (JURUSAN_FULL_NAMES[short]) {
    return JURUSAN_FULL_NAMES[short];
  }
  return jurusan.trim();
}


