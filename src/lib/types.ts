export type Gender = 'L' | 'P';

export type CheckInStatus = 'REGISTERED' | 'CHECKED_IN';

export type RoomCategory = 'UMUM' | 'INTERNASIONAL' | 'KHUSUS';

export type JajaranPosition = 'DEPAN' | 'BELAKANG';

export interface SKMahasantri {
  nim: string;
  nama: string;
  fakultas: string;
  prodi: string;
  jenisKelamin: Gender;
  isInternasional: boolean;
  skNomor?: string;
}

export interface Bed {
  bedNumber: number; // 1, 2, 3, 4
  isOccupied: boolean;
  mahasantriId?: string;
  mahasantriNim?: string;
  mahasantriNama?: string;
}

export interface Kamar {
  id: string; // e.g. "K-513"
  nomor: string; // "513"
  lantai: number; // 1 - 5
  jajaran: JajaranPosition;
  gedung: string; // "Ma'had Qodim"
  gender: Gender;
  kategori: RoomCategory;
  isLocked: boolean;
  lockReason?: string;
  kapasitas: number; // default 4
  beds: Bed[];
}

export interface Mahasantri {
  id: string;
  nim: string;
  nama: string;
  jenisKelamin: Gender;
  fakultas: string;
  prodi: string;
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
  nim: string;
  nama: string;
  nomorKamar: string;
  bedNumber: number;
  lantai: number;
  timestamp: string;
  petugas: string;
  catatanBarang?: string;
}
