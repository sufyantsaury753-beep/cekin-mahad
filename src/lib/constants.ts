import { Kamar, Mahasantri, SKMahasantri } from './types';

// Generate default rooms for Ma'had (Lantai 1 to 5)
// Jajaran Depan: XX9 - X12 (e.g. 509, 510, 511, 512)
// Jajaran Belakang: X13 - X16 (e.g. 513, 514, 515, 516)
export function generateInitialRooms(): Kamar[] {
  const rooms: Kamar[] = [];
  const floors = [1, 2, 3, 4, 5];

  floors.forEach((floor) => {
    // Jajaran Depan: 4 kamar (09 - 12)
    for (let i = 9; i <= 12; i++) {
      const roomNum = `${floor}${i < 10 ? '0' + i : i}`;
      const isLantai2 = floor === 2; // Lantai 2 is International by default
      rooms.push({
        id: `K-${roomNum}`,
        nomor: roomNum,
        lantai: floor,
        jajaran: 'DEPAN',
        gedung: "Ma'had Qodim",
        gender: 'L',
        kategori: isLantai2 ? 'INTERNASIONAL' : 'UMUM',
        isLocked: isLantai2,
        lockReason: isLantai2 ? 'Khusus Mahasiswa Internasional' : undefined,
        kapasitas: 4,
        beds: [
          { bedNumber: 1, isOccupied: false },
          { bedNumber: 2, isOccupied: false },
          { bedNumber: 3, isOccupied: false },
          { bedNumber: 4, isOccupied: false },
        ],
      });
    }

    // Jajaran Belakang: 4 kamar (13 - 16)
    for (let i = 13; i <= 16; i++) {
      const roomNum = `${floor}${i}`;
      const isLantai2 = floor === 2;
      rooms.push({
        id: `K-${roomNum}`,
        nomor: roomNum,
        lantai: floor,
        jajaran: 'BELAKANG',
        gedung: "Ma'had Qodim",
        gender: 'L',
        kategori: isLantai2 ? 'INTERNASIONAL' : 'UMUM',
        isLocked: isLantai2,
        lockReason: isLantai2 ? 'Khusus Mahasiswa Internasional' : undefined,
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

// Master Data SK Rektor (Whitelist Mahasantri yang berhak memilih kamar)
export const INITIAL_SK_LIST: SKMahasantri[] = [
  {
    nim: '2381010001',
    nama: 'Ahmad Faiz Al-Ghifari',
    fakultas: 'Fakultas Syariah & Hukum',
    prodi: 'Hukum Keluarga Islam',
    jenisKelamin: 'L',
    isInternasional: false,
    skNomor: 'SK-REKTOR/UINSSC/2026/089',
  },
  {
    nim: '2381020045',
    nama: 'Muhammad Rayhan Pratama',
    fakultas: 'Fakultas Tarbiyah & Keguruan',
    prodi: 'Pendidikan Agama Islam',
    jenisKelamin: 'L',
    isInternasional: false,
    skNomor: 'SK-REKTOR/UINSSC/2026/089',
  },
  {
    nim: '2381030089',
    nama: 'Tariq Mansoor Al-Kuwaiti',
    fakultas: 'Fakultas Ushuluddin & Adab',
    prodi: 'Ilmu Al-Qur`an & Tafsir',
    jenisKelamin: 'L',
    isInternasional: true,
    skNomor: 'SK-REKTOR/UINSSC/2026/089',
  },
  {
    nim: '2530311086',
    nama: 'Sufyan Hadi Al-Bantani',
    fakultas: 'Fakultas Sains & Teknologi Siber',
    prodi: 'Sistem Informasi',
    jenisKelamin: 'L',
    isInternasional: false,
    skNomor: 'SK-REKTOR/UINSSC/2026/089',
  },
  {
    nim: '2381040112',
    nama: 'Fajar Hidayatullah',
    fakultas: 'Fakultas Sains & Teknologi Siber',
    prodi: 'Teknik Informatika',
    jenisKelamin: 'L',
    isInternasional: false,
    skNomor: 'SK-REKTOR/UINSSC/2026/089',
  },
  {
    nim: '2381050144',
    nama: 'Zaidan Robbani',
    fakultas: 'Fakultas Ekonomi & Bisnis Islam',
    prodi: 'Perbankan Syariah',
    jenisKelamin: 'L',
    isInternasional: false,
    skNomor: 'SK-REKTOR/UINSSC/2026/089',
  },
  {
    nim: '2381060190',
    nama: 'Ilham Nur Ramadhan',
    fakultas: 'Fakultas Dakwah & Komunikasi Islam',
    prodi: 'Komunikasi Penyiaran Islam',
    jenisKelamin: 'L',
    isInternasional: false,
    skNomor: 'SK-REKTOR/UINSSC/2026/089',
  },
  {
    nim: '2381070210',
    nama: 'Bilal Ahmad Faruqi',
    fakultas: 'Fakultas Syariah & Hukum',
    prodi: 'Hukum Ekonomi Syariah',
    jenisKelamin: 'L',
    isInternasional: false,
    skNomor: 'SK-REKTOR/UINSSC/2026/089',
  },
  {
    nim: '2381080235',
    nama: 'Omar Khaled Al-Sudani',
    fakultas: 'Fakultas Ushuluddin & Adab',
    prodi: 'Bahasa & Sastra Arab',
    jenisKelamin: 'L',
    isInternasional: true,
    skNomor: 'SK-REKTOR/UINSSC/2026/089',
  },
  {
    nim: '2381090301',
    nama: 'Rizky Maulana Alamsyah',
    fakultas: 'Fakultas Tarbiyah & Keguruan',
    prodi: 'Pendidikan Bahasa Arab',
    jenisKelamin: 'L',
    isInternasional: false,
    skNomor: 'SK-REKTOR/UINSSC/2026/089',
  },
];

// Initial sample Mahasantri for testing
export const INITIAL_MAHASANTRI: Mahasantri[] = [
  {
    id: 'MHS-001',
    nim: '2381010001',
    nama: 'Ahmad Faiz Al-Ghifari',
    jenisKelamin: 'L',
    fakultas: 'Fakultas Syariah & Hukum',
    prodi: 'Hukum Keluarga Islam',
    noWa: '081234567890',
    namaWali: 'H. Sutisna',
    noWaWali: '081298765432',
    isInternasional: false,
    pasFotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    kamarId: 'K-513',
    nomorKamar: '513',
    lantai: 5,
    jajaran: 'BELAKANG',
    bedNumber: 1,
    statusCheckIn: 'CHECKED_IN',
    checkInTimestamp: '2026-08-27T10:15:00Z',
    checkedInBy: 'Ustadz Ridwan (Pengurus Lt.5)',
    catatanBarang: 'Barang aman, tidak membawa pemanas/rice cooker.',
    qrToken: 'QR-MAHAD-2381010001-513-1',
    registeredAt: '2026-08-25T08:30:00Z',
  },
  {
    id: 'MHS-002',
    nim: '2381020045',
    nama: 'Muhammad Rayhan Pratama',
    jenisKelamin: 'L',
    fakultas: 'Fakultas Tarbiyah & Keguruan',
    prodi: 'Pendidikan Agama Islam',
    noWa: '085712345678',
    namaWali: 'Drs. Bambang H.',
    noWaWali: '085787654321',
    isInternasional: false,
    pasFotoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    kamarId: 'K-513',
    nomorKamar: '513',
    lantai: 5,
    jajaran: 'BELAKANG',
    bedNumber: 2,
    statusCheckIn: 'REGISTERED',
    qrToken: 'QR-MAHAD-2381020045-513-2',
    registeredAt: '2026-08-26T14:20:00Z',
  },
  {
    id: 'MHS-003',
    nim: '2381030089',
    nama: 'Tariq Mansoor Al-Kuwaiti',
    jenisKelamin: 'L',
    fakultas: 'Fakultas Ushuluddin & Adab',
    prodi: 'Ilmu Al-Qur`an & Tafsir',
    noWa: '089912345678',
    namaWali: 'Mansoor Al-Kuwaiti',
    noWaWali: '+96599123456',
    isInternasional: true,
    pasFotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    kamarId: 'K-209',
    nomorKamar: '209',
    lantai: 2,
    jajaran: 'DEPAN',
    bedNumber: 1,
    statusCheckIn: 'REGISTERED',
    qrToken: 'QR-MAHAD-2381030089-209-1',
    registeredAt: '2026-08-26T09:00:00Z',
  }
];

export const FAKULTAS_LIST = [
  'Fakultas Syariah & Hukum',
  'Fakultas Tarbiyah & Keguruan',
  'Fakultas Ushuluddin & Adab',
  'Fakultas Dakwah & Komunikasi Islam',
  'Fakultas Ekonomi & Bisnis Islam',
  'Fakultas Sains & Teknologi Siber',
];

export const ATURAN_BARANG = [
  { item: 'Pemanas Air / Dispenser Listrik', allowed: false, desc: 'Dilarang di dalam kamar' },
  { item: 'Rice Cooker / Magic Com', allowed: false, desc: 'Dilarang (Kecuali di dapur umum)' },
  { item: 'Kompor Gas Portable / Spiritus', allowed: false, desc: 'Sangat dilarang demi keamanan kebakaran' },
  { item: 'Rokok / Vape / E-Cigarette', allowed: false, desc: 'Kawasan Bebas Asap Rokok 100%' },
  { item: 'Laptop, HP, Tablet, Powerbank', allowed: true, desc: 'Diizinkan untuk keperluan akademik' },
  { item: 'Kipas Angin Kecil / Portable', allowed: true, desc: 'Diizinkan' },
  { item: 'Obat-obatan Pribadi', allowed: true, desc: 'Wajib lapor jika memiliki riwayat penyakit khusus' },
];
