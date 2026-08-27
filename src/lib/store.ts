import { Kamar, Mahasantri, CheckInLog, SKMahasantri, UserSession, UserRole } from './types';
import {
  generateInitialRooms,
  INITIAL_MAHASANTRI,
  INITIAL_SK_LIST,
  DEFAULT_ADMIN,
  DEFAULT_PENGURUS_LIST,
} from './constants';

const ROOMS_KEY = 'mahad_rooms_v2';
const MHS_KEY = 'mahad_mhs_v2';
const LOGS_KEY = 'mahad_logs_v2';
const SK_KEY = 'mahad_sk_v2';
const SESSION_KEY = 'mahad_session_v2';

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
        bed.mahasantriNimNisn = mhs.nimNisn;
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
      try {
        localStorage.setItem(SK_KEY, JSON.stringify(INITIAL_SK_LIST));
      } catch (e) {}
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
    try {
      localStorage.setItem(SK_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('saveSKList storage error:', e);
    }
    window.dispatchEvent(new CustomEvent('mahad_sk_updated', { detail: list }));
  },

  addSKMahasantri(mhs: SKMahasantri) {
    const list = this.getSKList();
    const existingIndex = list.findIndex(
      (item) => item.nimNisn.trim().toLowerCase() === mhs.nimNisn.trim().toLowerCase()
    );
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
      const idx = list.findIndex(
        (x) => x.nimNisn.trim().toLowerCase() === newItem.nimNisn.trim().toLowerCase()
      );
      if (idx >= 0) {
        list[idx] = newItem;
      } else {
        list.push(newItem);
      }
    });
    this.saveSKList(list);
  },

  // Reset PIN for a student (Helpdesk Admin tool)
  resetMahasantriPin(nimNisn: string) {
    const list = this.getSKList();
    const student = list.find((x) => x.nimNisn.toLowerCase() === nimNisn.trim().toLowerCase());
    if (student) {
      student.pin = undefined;
      student.noWaRegistered = undefined;
      this.saveSKList(list);
      return true;
    }
    return false;
  },

  checkSK(
    query: string
  ): { isAllowed: boolean; data?: SKMahasantri; alreadyRegistered?: Mahasantri; error?: string } {
    const clean = query.trim().toLowerCase();
    if (!clean) {
      return { isAllowed: false, error: 'Silakan masukkan NIM atau NISN Anda.' };
    }

    const skList = this.getSKList();
    const skData = skList.find((x) => x.nimNisn.toLowerCase() === clean);

    if (!skData) {
      return {
        isAllowed: false,
        error: `⛔ AKSES DITOLAK: NIM / NISN "${query.trim()}" tidak terdaftar dalam SK Pengumuman Mahad No. B-092/Un.30/P.IV/KP.07.06/06/2026. Hanya nama yang tercantum di SK yang berhak memilih kamar.`,
      };
    }

    // Check if already registered
    const mhsList = this.getMahasantriList();
    const existing = mhsList.find((x) => x.nimNisn.toLowerCase() === clean);
    if (existing) {
      return {
        isAllowed: true,
        data: skData,
        alreadyRegistered: existing,
        error: `NIM/NISN ${query.trim()} (${existing.nama}) sudah terdaftar di Kamar ${existing.nomorKamar} (Bed ${existing.bedNumber}).`,
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
      try {
        localStorage.setItem(ROOMS_KEY, JSON.stringify(init));
      } catch (e) {}
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
    try {
      localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
    } catch (e) {
      console.warn('localStorage saveRooms error:', e);
    }
    window.dispatchEvent(new CustomEvent('mahad_rooms_updated', { detail: rooms }));
  },

  // --- Mahasantri Booking ---
  getMahasantriList(): Mahasantri[] {
    if (typeof window === 'undefined') return INITIAL_MAHASANTRI;
    const stored = localStorage.getItem(MHS_KEY);
    if (!stored) {
      try {
        localStorage.setItem(MHS_KEY, JSON.stringify(INITIAL_MAHASANTRI));
      } catch (e) {}
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
    try {
      localStorage.setItem(MHS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('localStorage saveMahasantriList error:', e);
    }
    window.dispatchEvent(new CustomEvent('mahad_mhs_updated', { detail: list }));
  },

  getMahasantriByNimNisn(nimNisn: string): Mahasantri | undefined {
    const list = this.getMahasantriList();
    return list.find((m) => m.nimNisn.trim().toLowerCase() === nimNisn.trim().toLowerCase());
  },

  getMahasantriByQr(qrToken: string): Mahasantri | undefined {
    const list = this.getMahasantriList();
    return list.find((m) => m.qrToken.trim() === qrToken.trim());
  },

  bookRoom(
    mhsData: Omit<
      Mahasantri,
      'id' | 'kamarId' | 'nomorKamar' | 'lantai' | 'jajaran' | 'bedNumber' | 'statusCheckIn' | 'qrToken' | 'registeredAt'
    >,
    kamarId: string,
    bedNumber: number
  ): { success: boolean; error?: string; mahasantri?: Mahasantri } {
    const skCheck = this.checkSK(mhsData.nimNisn);
    if (!skCheck.isAllowed) {
      return { success: false, error: skCheck.error };
    }

    if (skCheck.alreadyRegistered) {
      return {
        success: false,
        error: `NIM/NISN ${mhsData.nimNisn} sudah memilih Kamar ${skCheck.alreadyRegistered.nomorKamar} (Bed ${skCheck.alreadyRegistered.bedNumber}).`,
        mahasantri: skCheck.alreadyRegistered,
      };
    }

    const rooms = this.getRooms();
    const mhsList = this.getMahasantriList();

    const room = rooms.find((r) => r.id === kamarId);
    if (!room) {
      return { success: false, error: 'Kamar tidak ditemukan.' };
    }

    if (room.isLocked && !mhsData.isInternasional) {
      return { success: false, error: `Kamar ${room.nomor} dikunci oleh admin: ${room.lockReason || 'Khusus'}` };
    }

    const bed = room.beds.find((b) => b.bedNumber === bedNumber);
    if (!bed) {
      return { success: false, error: 'Nomor ranjang tidak valid.' };
    }

    if (bed.isOccupied) {
      return {
        success: false,
        error: `Ranjang ${bedNumber} di Kamar ${room.nomor} baru saja dipilih orang lain. Silakan pilih ranjang lain.`,
      };
    }

    const newMhsId = `MHS-${Date.now().toString().slice(-6)}`;
    const qrToken = `QR-MAHAD-${mhsData.nimNisn}-${room.nomor}-${bedNumber}`;

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

    bed.isOccupied = true;
    bed.mahasantriId = newMhsId;
    bed.mahasantriNimNisn = mhsData.nimNisn;
    bed.mahasantriNama = mhsData.nama;

    this.saveRooms(rooms);
    mhsList.push(newMahasantri);
    this.saveMahasantriList(mhsList);

    return { success: true, mahasantri: newMahasantri };
  },

  confirmCheckIn(
    nimNisn: string,
    petugas: string,
    catatanBarang?: string
  ): { success: boolean; error?: string; mahasantri?: Mahasantri } {
    const mhsList = this.getMahasantriList();
    const mhs = mhsList.find((m) => m.nimNisn.toLowerCase() === nimNisn.toLowerCase());

    if (!mhs) {
      return { success: false, error: `Mahasantri dengan NIM/NISN ${nimNisn} tidak ditemukan.` };
    }

    if (mhs.statusCheckIn === 'CHECKED_IN') {
      return {
        success: false,
        error: `Mahasantri ${mhs.nama} sudah check-in pada ${new Date(mhs.checkInTimestamp || '').toLocaleTimeString('id-ID')}.`,
        mahasantri: mhs,
      };
    }

    const now = new Date().toISOString();
    mhs.statusCheckIn = 'CHECKED_IN';
    mhs.checkInTimestamp = now;
    mhs.checkedInBy = petugas;
    mhs.catatanBarang = catatanBarang || 'Sesuai SOP Barang';

    this.saveMahasantriList(mhsList);

    const log: CheckInLog = {
      id: `LOG-${Date.now()}`,
      nimNisn: mhs.nimNisn,
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
    try {
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    } catch (e) {}
  },

  resetToDefault() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ROOMS_KEY);
    localStorage.removeItem(MHS_KEY);
    localStorage.removeItem(LOGS_KEY);
    localStorage.removeItem(SK_KEY);
    localStorage.removeItem(SESSION_KEY);
    window.location.reload();
  },
};

// --- AUTHENTICATION & MULTI-ROLE ACCESS MANAGER ---
export const MahadAuth = {
  getSession(): UserSession | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  setSession(session: UserSession | null) {
    if (typeof window === 'undefined') return;
    if (!session) {
      localStorage.removeItem(SESSION_KEY);
    } else {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } catch (e) {}
    }
    window.dispatchEvent(new CustomEvent('mahad_auth_changed', { detail: session }));
  },

  logout() {
    this.setSession(null);
  },

  // Login Superadmin
  loginAdmin(email: string, pass: string): { success: boolean; session?: UserSession; error?: string } {
    if (email.trim().toLowerCase() === DEFAULT_ADMIN.email.toLowerCase() && pass === DEFAULT_ADMIN.password) {
      const session: UserSession = {
        role: 'ADMIN',
        name: DEFAULT_ADMIN.nama,
        identifier: DEFAULT_ADMIN.email,
        token: `AUTH-ADM-${Date.now()}`,
      };
      this.setSession(session);
      return { success: true, session };
    }
    return { success: false, error: 'Email atau password Admin tidak valid.' };
  },

  // Login Pengurus / Mudabbir Lantai
  loginPengurus(username: string, pass: string): { success: boolean; session?: UserSession; error?: string } {
    const pengurus = DEFAULT_PENGURUS_LIST.find(
      (p) => p.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!pengurus) {
      return { success: false, error: `Username pengurus "${username}" tidak ditemukan.` };
    }

    if (pengurus.password !== pass.trim()) {
      return { success: false, error: 'Password pengurus tidak sesuai.' };
    }

    const session: UserSession = {
      role: 'PENGURUS',
      name: pengurus.nama,
      identifier: pengurus.username,
      floorAssigned: pengurus.lantai,
      token: `AUTH-PGR-${pengurus.id}-${Date.now()}`,
    };
    this.setSession(session);
    return { success: true, session };
  },

  // Step 1 Mahasantri Login Check: Check if PIN exists or requires activation
  checkMahasantriLogin(nimNisn: string): {
    found: boolean;
    isPinSet: boolean;
    skData?: SKMahasantri;
    mhsData?: Mahasantri;
    error?: string;
  } {
    const clean = nimNisn.trim().toLowerCase();
    const skList = MahadStore.getSKList();
    const skData = skList.find((x) => x.nimNisn.toLowerCase() === clean);

    if (!skData) {
      return {
        found: false,
        isPinSet: false,
        error: `NIM / NISN "${nimNisn}" tidak ditemukan di Surat Keputusan (SK) resmi.`,
      };
    }

    const mhsData = MahadStore.getMahasantriByNimNisn(skData.nimNisn);
    const isPinSet = Boolean(skData.pin);

    return {
      found: true,
      isPinSet,
      skData,
      mhsData,
    };
  },

  // Setup / Register Secret 6-Digit PIN (First-time Activation)
  activateMahasantriPIN(
    nimNisn: string,
    pin: string,
    noWa: string
  ): { success: boolean; session?: UserSession; error?: string } {
    if (!pin || pin.length < 6) {
      return { success: false, error: 'PIN Keamanan harus terdiri dari minimal 6 digit angka.' };
    }

    if (!noWa || noWa.length < 9) {
      return { success: false, error: 'Nomor WhatsApp aktif wajib diisi untuk verifikasi pemilik sah.' };
    }

    const skList = MahadStore.getSKList();
    const skData = skList.find((x) => x.nimNisn.toLowerCase() === nimNisn.trim().toLowerCase());

    if (!skData) {
      return { success: false, error: 'Data mahasantri tidak ditemukan di SK.' };
    }

    // Save PIN to student SK record
    skData.pin = pin.trim();
    skData.noWaRegistered = noWa.trim();
    skData.activatedAt = new Date().toISOString();
    MahadStore.saveSKList(skList);

    const mhsData = MahadStore.getMahasantriByNimNisn(skData.nimNisn);

    const session: UserSession = {
      role: 'MAHASANTRI',
      name: skData.nama,
      identifier: skData.nimNisn,
      skData,
      mahasantriData: mhsData,
      token: `AUTH-MHS-${skData.nimNisn}-${Date.now()}`,
    };
    this.setSession(session);

    return { success: true, session };
  },

  // Login Mahasantri with existing PIN
  loginMahasantri(nimNisn: string, pin: string): { success: boolean; session?: UserSession; error?: string } {
    const skList = MahadStore.getSKList();
    const skData = skList.find((x) => x.nimNisn.toLowerCase() === nimNisn.trim().toLowerCase());

    if (!skData) {
      return { success: false, error: 'NIM / NISN tidak terdaftar di SK.' };
    }

    if (!skData.pin) {
      return {
        success: false,
        error: 'Akun Anda belum diaktivasi. Silakan buat PIN rahasia terlebih dahulu.',
      };
    }

    if (skData.pin !== pin.trim()) {
      return {
        success: false,
        error: '⛔ PIN Keamanan Salah! Pastikan memasukkan PIN yang Anda buat saat pertama kali mendaftar.',
      };
    }

    const mhsData = MahadStore.getMahasantriByNimNisn(skData.nimNisn);

    const session: UserSession = {
      role: 'MAHASANTRI',
      name: skData.nama,
      identifier: skData.nimNisn,
      skData,
      mahasantriData: mhsData,
      token: `AUTH-MHS-${skData.nimNisn}-${Date.now()}`,
    };
    this.setSession(session);

    return { success: true, session };
  },
};
