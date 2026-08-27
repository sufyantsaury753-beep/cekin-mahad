export type Gender = 'L' | 'P';

export type CheckInStatus = 'REGISTERED' | 'CHECKED_IN';

export type RoomCategory = 'UMUM' | 'INTERNASIONAL' | 'KHUSUS';

export type JajaranPosition = 'DEPAN' | 'BELAKANG';

export type JenisPendaftaran = 'Calon Mahasantri Baru' | 'Perpanjangan' | 'Mahasantri Internasional';

export interface SKMahasantri {
  no: number;
  nimNisn: string; // Bisa NISN (Maba) atau NIM (Mahasantri Lama / Perpanjangan)
  nama: string;
  jenisKelamin: Gender;
  jenisPendaftaran: JenisPendaftaran;
  fakultas: string;
  jurusan: string;
  asalNegara?: string; // Khusus Internasional (Thailand, Filipina, Sudan, Nigeria, Pakistan, Mesir, dll)
  isInternasional: boolean;
  skNomor: string;
}

export interface Bed {
  bedNumber: number; // 1, 2, 3, 4
  isOccupied: boolean;
  mahasantriId?: string;
  mahasantriNimNisn?: string;
  mahasantriNama?: string;
}

export interface Kamar {
  id: string; // e.g. "K-513"
  nomor: string; // "513"
  lantai: number; // 1 - 5
  jajaran: JajaranPosition;
  gedung: string; // "Ma'had Qodim" (Putra) / "Ma'had Jadid" (Putri)
  gender: Gender;
  kategori: RoomCategory;
  isLocked: boolean;
  lockReason?: string;
  kapasitas: number; // default 4
  beds: Bed[];
}

export interface Mahasantri {
  id: string;
  nimNisn: string; // NIM atau NISN
  nama: string;
  jenisKelamin: Gender;
  jenisPendaftaran: JenisPendaftaran;
  fakultas: string;
  jurusan: string;
  asalNegara?: string;
  noWa: string;
  namaWali: string;
  noWaWali: string;
  isInternasional: boolean;
  pasFotoUrl: string;
  buktiBerkasUrl?: string;
  kamarId: string;
  nomorKamar: string;
  lantai: number;
  jajaran: JajaranPosition;
  bedNumber: number;
  statusCheckIn: CheckInStatus;
  checkInTimestamp?: string;
  checkedInBy?: string;
  catatanBarang?: string;
  qrToken: string;
  registeredAt: string;
}

export interface CheckInLog {
  id: string;
  nimNisn: string;
  nama: string;
  nomorKamar: string;
  bedNumber: number;
  lantai: number;
  timestamp: string;
  petugas: string;
  catatanBarang?: string;
}
