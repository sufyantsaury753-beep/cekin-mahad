export type Gender = 'L' | 'P';

export type CheckInStatus = 'REGISTERED' | 'CHECKED_IN';

export type RoomCategory = 'UMUM' | 'INTERNASIONAL' | 'KHUSUS';

export type JajaranPosition = 'DEPAN' | 'BELAKANG' | 'PUTRA' | 'PUTRI_BARAT' | 'PUTRI_TIMUR';

export type GedungType = "Ma'had Jadid" | "Ma'had Qodim";

export type JenisPendaftaran = 'Calon Mahasantri Baru' | 'Perpanjangan' | 'Mahasantri Internasional';

export type UserRole = 'ADMIN' | 'PENGURUS' | 'MAHASANTRI';

export interface UserSession {
  role: UserRole;
  name: string;
  identifier: string; // Email, Username, or NIM/NISN
  floorAssigned?: number; // Khusus Pengurus (2 - 5)
  gedungAssigned?: GedungType;
  mahasantriData?: Mahasantri;
  skData?: SKMahasantri;
  pengurusData?: SKPengurus;
  token: string;
}

export interface PengurusAccount {
  id: string;
  username: string;
  nama: string;
  jenisKelamin: Gender;
  jabatan: string;
  lantai: number;
  gedung: GedungType;
  password: string;
  noWa: string;
}

export interface SKPengurus {
  id: string;
  nama: string;
  nim?: string;
  jenisKelamin: Gender;
  jabatan: 'Mudabbir' | 'Mudabbirah' | 'Ketua Pengurus' | 'Divisi Keamanan' | 'Divisi Kebersihan' | string;
  gedung: GedungType;
  lantai: number; // 2 - 5
  kamarKhusus?: string; // misal "209"
  noWa: string;
  password: string;
  isAktif: boolean;
  skNomor?: string;
}

export interface SKMahasantri {
  no: number;
  nimNisn: string; // Bisa NISN (Maba) atau NIM (Mahasantri Lama / Perpanjangan)
  nama: string;
  jenisKelamin: Gender;
  jenisPendaftaran: JenisPendaftaran;
  fakultas: string;
  jurusan: string;
  asalNegara?: string; // Khusus Internasional
  isInternasional: boolean;
  skNomor: string;
  // Security & Authentication
  pin?: string; // 6-digit Secret PIN dibuat saat aktivasi pertama
  noWaRegistered?: string; // No WA yang didaftarkan saat aktivasi
  activatedAt?: string;
}

export interface Bed {
  bedNumber: number; // 1, 2, 3, 4, 5, 6...
  isOccupied: boolean;
  mahasantriId?: string;
  mahasantriNimNisn?: string;
  mahasantriNama?: string;
}

export interface Kamar {
  id: string; // e.g. "JADID-209", "QODIM-201"
  nomor: string; // "209", "201"
  lantai: number; // 2 - 5
  jajaran: JajaranPosition;
  gedung: GedungType; // "Ma'had Jadid" (Putra 09-16, Putri 01-08 & 17-24) / "Ma'had Qodim" (Full Putri 01-24)
  gender: Gender; // 'L' (Putra) / 'P' (Putri)
  kategori: RoomCategory;
  isLocked: boolean;
  lockReason?: string; // e.g. "Kamar Mudabbir", "Kamar Tamu", "Perbaikan Fasilitas"
  kapasitas: number; // default 4 (bisa diubah admin jadi 2, 6, 8 dsb)
  beds: Bed[];
}

export interface Mahasantri {
  id: string;
  nama: string;
  nimNisn: string;
  jenisKelamin: Gender;
  jenisPendaftaran: JenisPendaftaran;
  fakultas: string;
  jurusan: string;
  asalNegara?: string;
  isInternasional: boolean;
  noWa: string;
  namaWali: string;
  noWaWali: string;
  pasFotoUrl?: string;
  // Alokasi Kamar
  gedung: GedungType;
  lantai: number;
  kamarId: string;
  nomorKamar: string;
  jajaran: JajaranPosition;
  bedNumber: number;
  // Status Check-In
  statusCheckIn: CheckInStatus;
  checkInTimestamp?: string;
  petugasCheckIn?: string;
  checkedInBy?: string;
  catatanBarangCheckIn?: string;
  catatanBarang?: string;
  // Security
  qrCodeToken: string;
  qrToken?: string;
  skNomor: string;
  createdAt: string;
  registeredAt?: string;
}

export interface CheckInLog {
  id: string;
  mahasantriId: string;
  mahasantriNimNisn: string;
  nimNisn?: string;
  nama: string;
  gedung: GedungType;
  nomorKamar: string;
  lantai: number;
  bedNumber: number;
  timestamp: string;
  petugas: string;
  catatanBarang: string;
}
