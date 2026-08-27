import { Kamar, Mahasantri, CheckInLog, SKMahasantri } from './types';
import { generateInitialRooms, INITIAL_MAHASANTRI, INITIAL_SK_LIST } from './constants';

const ROOMS_KEY = 'mahad_rooms_v1';
const MHS_KEY = 'mahad_mhs_v1';
const LOGS_KEY = 'mahad_logs_v1';
const SK_KEY = 'mahad_sk_v1';

// Populate initial rooms with pre-existing mahasantri bookings
function buildInitialRooms(): Kamar[] {
  const rooms = generateInitialRooms();

  INITIAL_MAHASANTRI.forEach((mhs) => {
    const room = rooms.find((r) => r.id === mhs.kamarId);
    if (room) {
      const bed = room.beds.find((b) => b.bedNumber === mhs.bedNumber);
      if (bed) {
        bed.isOccupied = true;
        bed.mahasantriId = mhs.id;
        bed.mahasantriNim = mhs.nim;
        bed.mahasantriNama = mhs.nama;
      }
    }
  });

  return rooms;
}

export const MahadStore = {
  // --- SK Rektor Whitelist ---
  getSKList(): SKMahasantri[] {
    if (typeof window === 'undefined') return INITIAL_SK_LIST;
    const stored = localStorage.getItem(SK_KEY);
    if (!stored) {
      localStorage.setItem(SK_KEY, JSON.stringify(INITIAL_SK_LIST));
      return INITIAL_SK_LIST;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_SK_LIST;
    }
  },

  saveSKList(list: SKMahasantri[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SK_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('mahad_sk_updated', { detail: list }));
  },

  addSKMahasantri(mhs: SKMahasantri) {
    const list = this.getSKList();
    const existingIndex = list.findIndex((item) => item.nim.trim() === mhs.nim.trim());
    if (existingIndex >= 0) {
      list[existingIndex] = mhs;
    } else {
      list.push(mhs);
    }
    this.saveSKList(list);
  },

  importSKList(newList: SKMahasantri[]) {
    const list = this.getSKList();
    newList.forEach((newItem) => {
      const idx = list.findIndex((x) => x.nim.trim() === newItem.nim.trim());
      if (idx >= 0) {
        list[idx] = newItem;
      } else {
        list.push(newItem);
      }
    });
    this.saveSKList(list);
  },

  checkSK(nim: string): { isAllowed: boolean; data?: SKMahasantri; alreadyRegistered?: Mahasantri; error?: string } {
    const cleanNim = nim.trim();
    if (!cleanNim) {
      return { isAllowed: false, error: 'Silakan masukkan NIM Anda.' };
    }

    const skList = this.getSKList();
    const skData = skList.find((x) => x.nim.toLowerCase() === cleanNim.toLowerCase());

    if (!skData) {
      return {
        isAllowed: false,
        error: `⛔ AKSES DITOLAK: NIM "${cleanNim}" tidak terdaftar dalam SK Kelulusan/Penetapan Mahasantri Ma'had dari Rektor. Hanya mahasantri yang tercantum di SK yang berhak memilih kamar.`,
      };
    }

    // Check if already registered
    const mhsList = this.getMahasantriList();
    const existing = mhsList.find((x) => x.nim.toLowerCase() === cleanNim.toLowerCase());
    if (existing) {
      return {
        isAllowed: true,
        data: skData,
        alreadyRegistered: existing,
        error: `NIM ${cleanNim} (${existing.nama}) sudah terdaftar di Kamar ${existing.nomorKamar} (Bed ${existing.bedNumber}).`,
      };
    }

    return {
      isAllowed: true,
      data: skData,
    };
  },

  // --- Rooms Management ---
  getRooms(): Kamar[] {
    if (typeof window === 'undefined') return buildInitialRooms();
    const stored = localStorage.getItem(ROOMS_KEY);
    if (!stored) {
      const init = buildInitialRooms();
      localStorage.setItem(ROOMS_KEY, JSON.stringify(init));
      return init;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return buildInitialRooms();
    }
  },

  saveRooms(rooms: Kamar[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
    window.dispatchEvent(new CustomEvent('mahad_rooms_updated', { detail: rooms }));
  },

  // --- Mahasantri Booking ---
  getMahasantriList(): Mahasantri[] {
    if (typeof window === 'undefined') return INITIAL_MAHASANTRI;
    const stored = localStorage.getItem(MHS_KEY);
    if (!stored) {
      localStorage.setItem(MHS_KEY, JSON.stringify(INITIAL_MAHASANTRI));
      return INITIAL_MAHASANTRI;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_MAHASANTRI;
    }
  },

  saveMahasantriList(list: Mahasantri[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(MHS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('mahad_mhs_updated', { detail: list }));
  },

  getMahasantriByNim(nim: string): Mahasantri | undefined {
    const list = this.getMahasantriList();
    return list.find((m) => m.nim.trim().toLowerCase() === nim.trim().toLowerCase());
  },

  getMahasantriByQr(qrToken: string): Mahasantri | undefined {
    const list = this.getMahasantriList();
    return list.find((m) => m.qrToken.trim() === qrToken.trim());
  },

  bookRoom(
    mhsData: Omit<Mahasantri, 'id' | 'kamarId' | 'nomorKamar' | 'lantai' | 'jajaran' | 'bedNumber' | 'statusCheckIn' | 'qrToken' | 'registeredAt'>,
    kamarId: string,
    bedNumber: number
  ): { success: boolean; error?: string; mahasantri?: Mahasantri } {
    // 1. Double check SK validation
    const skCheck = this.checkSK(mhsData.nim);
    if (!skCheck.isAllowed) {
      return { success: false, error: skCheck.error };
    }

    if (skCheck.alreadyRegistered) {
      return {
        success: false,
        error: `NIM ${mhsData.nim} sudah memilih Kamar ${skCheck.alreadyRegistered.nomorKamar} (Bed ${skCheck.alreadyRegistered.bedNumber}).`,
        mahasantri: skCheck.alreadyRegistered,
      };
    }

    const rooms = this.getRooms();
    const mhsList = this.getMahasantriList();

    // Find room
    const room = rooms.find((r) => r.id === kamarId);
    if (!room) {
      return { success: false, error: 'Kamar tidak ditemukan.' };
    }

    // Check if room locked and student not international
    if (room.isLocked && !mhsData.isInternasional) {
      return { success: false, error: `Kamar ${room.nomor} dikunci oleh admin: ${room.lockReason || 'Khusus'}` };
    }

    // Find bed
    const bed = room.beds.find((b) => b.bedNumber === bedNumber);
    if (!bed) {
      return { success: false, error: 'Nomor ranjang tidak valid.' };
    }

    if (bed.isOccupied) {
      return { success: false, error: `Ranjang ${bedNumber} di Kamar ${room.nomor} baru saja dipilih orang lain. Silakan pilih ranjang lain.` };
    }

    const newMhsId = `MHS-${Date.now().toString().slice(-6)}`;
    const qrToken = `QR-MAHAD-${mhsData.nim}-${room.nomor}-${bedNumber}`;

    const newMahasantri: Mahasantri = {
      ...mhsData,
      id: newMhsId,
      kamarId: room.id,
      nomorKamar: room.nomor,
      lantai: room.lantai,
      jajaran: room.jajaran,
      bedNumber,
      statusCheckIn: 'REGISTERED',
      qrToken,
      registeredAt: new Date().toISOString(),
    };

    // Update bed
    bed.isOccupied = true;
    bed.mahasantriId = newMhsId;
    bed.mahasantriNim = mhsData.nim;
    bed.mahasantriNama = mhsData.nama;

    // Save changes
    this.saveRooms(rooms);
    mhsList.push(newMahasantri);
    this.saveMahasantriList(mhsList);

    return { success: true, mahasantri: newMahasantri };
  },

  confirmCheckIn(
    nim: string,
    petugas: string,
    catatanBarang?: string
  ): { success: boolean; error?: string; mahasantri?: Mahasantri } {
    const mhsList = this.getMahasantriList();
    const mhsIndex = mhsList.findIndex((m) => m.nim.trim().toLowerCase() === nim.trim().toLowerCase());

    if (mhsIndex === -1) {
      return { success: false, error: `Mahasantri dengan NIM ${nim} tidak ditemukan.` };
    }

    const mhs = mhsList[mhsIndex];
    if (mhs.statusCheckIn === 'CHECKED_IN') {
      return {
        success: false,
        error: `Mahasantri ${mhs.nama} (${mhs.nim}) SUDAH melakukan check-in sebelumnya pada ${new Date(mhs.checkInTimestamp || '').toLocaleString('id-ID')} oleh ${mhs.checkedInBy}.`,
        mahasantri: mhs,
      };
    }

    const now = new Date().toISOString();
    mhs.statusCheckIn = 'CHECKED_IN';
    mhs.checkInTimestamp = now;
    mhs.checkedInBy = petugas;
    mhs.catatanBarang = catatanBarang || 'Pemeriksaan barang sesuai SOP Ma`had.';

    this.saveMahasantriList(mhsList);

    // Save log
    const log: CheckInLog = {
      id: `LOG-${Date.now()}`,
      nim: mhs.nim,
      nama: mhs.nama,
      nomorKamar: mhs.nomorKamar,
      bedNumber: mhs.bedNumber,
      lantai: mhs.lantai,
      timestamp: now,
      petugas,
      catatanBarang: mhs.catatanBarang,
    };
    this.addLog(log);

    return { success: true, mahasantri: mhs };
  },

  toggleRoomLock(kamarId: string, isLocked: boolean, reason?: string) {
    const rooms = this.getRooms();
    const room = rooms.find((r) => r.id === kamarId);
    if (room) {
      room.isLocked = isLocked;
      room.lockReason = isLocked ? (reason || 'Dikunci oleh Admin') : undefined;
      this.saveRooms(rooms);
    }
  },

  toggleFloorLock(lantai: number, isLocked: boolean, reason?: string) {
    const rooms = this.getRooms();
    rooms.forEach((r) => {
      if (r.lantai === lantai) {
        r.isLocked = isLocked;
        r.lockReason = isLocked ? (reason || `Lantai ${lantai} dikunci oleh Admin`) : undefined;
      }
    });
    this.saveRooms(rooms);
  },

  getLogs(): CheckInLog[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(LOGS_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  addLog(log: CheckInLog) {
    if (typeof window === 'undefined') return;
    const logs = this.getLogs();
    logs.unshift(log);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  },

  resetToDefault() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ROOMS_KEY);
    localStorage.removeItem(MHS_KEY);
    localStorage.removeItem(LOGS_KEY);
    localStorage.removeItem(SK_KEY);
    window.location.reload();
  },
};
