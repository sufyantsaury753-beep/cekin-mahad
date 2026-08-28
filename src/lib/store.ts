import {
  Kamar,
  Mahasantri,
  CheckInLog,
  SKMahasantri,
  SKPengurus,
  UserSession,
  UserRole,
  Gender,
  JenisPendaftaran,
} from './types';
import {
  generateInitialRooms,
  INITIAL_MAHASANTRI,
  INITIAL_SK_LIST,
  DEFAULT_ADMIN,
  DEFAULT_PENGURUS_LIST,
  DEFAULT_SK_PENGURUS_LIST,
} from './constants';

const ROOMS_KEY = 'mahad_rooms_v3';
const MHS_KEY = 'mahad_mhs_v3';
const LOGS_KEY = 'mahad_logs_v3';
const SK_KEY = 'mahad_sk_v3';
const SK_PENGURUS_KEY = 'mahad_sk_pengurus_v3';
const SESSION_KEY = 'mahad_session_v3';

// Populate initial rooms with pre-existing mahasantri bookings
function buildInitialRooms(): Kamar[] {
  const rooms = generateInitialRooms();

  INITIAL_MAHASANTRI.forEach((mhs) => {
    const room = rooms.find((r) => r.nomor === mhs.nomorKamar && r.gedung === mhs.gedung);
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
        error: `⛔ AKSES DITOLAK: NIM / NISN "${query.trim()}" tidak terdaftar dalam SK Pengumuman Mahad. Hanya nama yang tercantum di SK yang berhak memilih kamar.`,
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
        error: `NIM/NISN ${query.trim()} (${existing.nama}) sudah terdaftar di ${existing.gedung} Kamar ${existing.nomorKamar} (Bed ${existing.bedNumber}).`,
      };
    }

    return {
      isAllowed: true,
      data: skData,
    };
  },

  // --- SK Pengurus / Mudabbir & Mudabbirah ---
  getSKPengurusList(): SKPengurus[] {
    if (typeof window === 'undefined') return DEFAULT_SK_PENGURUS_LIST;
    const stored = localStorage.getItem(SK_PENGURUS_KEY);
    if (!stored) {
      try {
        localStorage.setItem(SK_PENGURUS_KEY, JSON.stringify(DEFAULT_SK_PENGURUS_LIST));
      } catch (e) {}
      return DEFAULT_SK_PENGURUS_LIST;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_SK_PENGURUS_LIST;
    }
  },

  saveSKPengurusList(list: SKPengurus[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SK_PENGURUS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('saveSKPengurusList storage error:', e);
    }
    window.dispatchEvent(new CustomEvent('mahad_sk_pengurus_updated', { detail: list }));
  },

  addSKPengurus(pengurus: SKPengurus) {
    const list = this.getSKPengurusList();
    const idx = list.findIndex((p) => p.id === pengurus.id || p.nim === pengurus.nim);
    if (idx >= 0) {
      list[idx] = pengurus;
    } else {
      list.push(pengurus);
    }
    this.saveSKPengurusList(list);
  },

  deleteSKPengurus(id: string) {
    const list = this.getSKPengurusList().filter((p) => p.id !== id);
    this.saveSKPengurusList(list);
  },

  resetPengurusPassword(id: string, newPass: string) {
    const list = this.getSKPengurusList();
    const p = list.find((x) => x.id === id);
    if (p) {
      p.password = newPass;
      this.saveSKPengurusList(list);
      return true;
    }
    return false;
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
      const parsed: Kamar[] = JSON.parse(stored);
      // Validate that parsed rooms contain both Jadid and Qodim
      const hasJadid = parsed.some((r) => r.gedung === "Ma'had Jadid");
      const hasQodim = parsed.some((r) => r.gedung === "Ma'had Qodim");
      if (!hasJadid || !hasQodim || parsed.length < 100) {
        const init = buildInitialRooms();
        try {
          localStorage.setItem(ROOMS_KEY, JSON.stringify(init));
        } catch (e) {}
        return init;
      }
      return parsed;
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

  // Admin Feature: Toggle Lock Room (e.g. Kamar Mudabbir, Kamar Tamu, Perbaikan)
  toggleRoomLock(roomId: string, isLocked: boolean, reason?: string): { success: boolean; error?: string } {
    const rooms = this.getRooms();
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return { success: false, error: 'Kamar tidak ditemukan.' };

    room.isLocked = isLocked;
    room.lockReason = isLocked ? (reason || 'Kamar Dikunci Admin (Kamar Mudabbir/Khusus)') : undefined;
    this.saveRooms(rooms);
    return { success: true };
  },

  // Admin Feature: Update Bed Capacity (+ / - Beds per Room)
  updateRoomCapacity(roomId: string, newCapacity: number): { success: boolean; error?: string } {
    const rooms = this.getRooms();
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return { success: false, error: 'Kamar tidak ditemukan.' };

    if (newCapacity < 1 || newCapacity > 12) {
      return { success: false, error: 'Kapasitas kasur harus antara 1 sampai 12.' };
    }

    const currentOccupiedBeds = room.beds.filter((b) => b.isOccupied);
    if (newCapacity < currentOccupiedBeds.length) {
      return {
        success: false,
        error: `Tidak dapat mengurangi kapasitas menjadi ${newCapacity} kasur karena sudah ada ${currentOccupiedBeds.length} mahasantri yang menempati ranjang di kamar ini.`,
      };
    }

    // If increasing capacity
    if (newCapacity > room.beds.length) {
      for (let i = room.beds.length + 1; i <= newCapacity; i++) {
        room.beds.push({ bedNumber: i, isOccupied: false });
      }
    } else if (newCapacity < room.beds.length) {
      // If decreasing, remove unoccupied beds from the end
      let bedsToRemove = room.beds.length - newCapacity;
      for (let i = room.beds.length - 1; i >= 0 && bedsToRemove > 0; i--) {
        if (!room.beds[i].isOccupied) {
          room.beds.splice(i, 1);
          bedsToRemove--;
        }
      }
      // Re-index bed numbers
      room.beds.forEach((b, idx) => {
        b.bedNumber = idx + 1;
      });
    }

    room.kapasitas = newCapacity;
    this.saveRooms(rooms);
    return { success: true };
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
    return list.find(
      (m) =>
        (m.qrCodeToken && m.qrCodeToken.trim() === qrToken.trim()) ||
        (m.qrToken && m.qrToken.trim() === qrToken.trim())
    );
  },

  bookRoom(
    mhsData: {
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
    },
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
        error: `NIM/NISN ${mhsData.nimNisn} sudah memilih ${skCheck.alreadyRegistered.gedung} Kamar ${skCheck.alreadyRegistered.nomorKamar} (Bed ${skCheck.alreadyRegistered.bedNumber}).`,
        mahasantri: skCheck.alreadyRegistered,
      };
    }

    const rooms = this.getRooms();
    const mhsList = this.getMahasantriList();

    const room = rooms.find((r) => r.id === kamarId);
    if (!room) {
      return { success: false, error: 'Kamar tidak ditemukan.' };
    }

    // Gender Constraint Check
    if (mhsData.jenisKelamin && room.gender && mhsData.jenisKelamin !== room.gender) {
      return {
        success: false,
        error: `⛔ AKSES DITOLAK: Mahasantri ${
          mhsData.jenisKelamin === 'L' ? 'Putra (L)' : 'Putri (P)'
        } tidak dapat memilih kamar khusus ${room.gender === 'L' ? 'Putra' : 'Putri'} (${room.gedung} Kamar ${room.nomor}).`,
      };
    }

    if (room.isLocked && !mhsData.isInternasional) {
      return { success: false, error: `Kamar ${room.nomor} dikunci oleh admin: ${room.lockReason || 'Kamar Mudabbir / Khusus'}` };
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
      gedung: room.gedung,
      kamarId: room.id,
      nomorKamar: room.nomor,
      lantai: room.lantai,
      jajaran: room.jajaran,
      bedNumber,
      statusCheckIn: 'REGISTERED',
      qrCodeToken: qrToken,
      qrToken,
      skNomor: skCheck.data?.skNomor || 'SK-MAHAD-2026',
      createdAt: new Date().toISOString(),
      registeredAt: new Date().toISOString(),
    };

    // Update bed in room
    bed.isOccupied = true;
    bed.mahasantriId = newMhsId;
    bed.mahasantriNimNisn = newMahasantri.nimNisn;
    bed.mahasantriNama = newMahasantri.nama;

    // Save changes
    this.saveRooms(rooms);
    mhsList.push(newMahasantri);
    this.saveMahasantriList(mhsList);

    return { success: true, mahasantri: newMahasantri };
  },

  // --- Check-in Verification (Pengurus / Mudabbir) ---
  confirmCheckIn(
    nimNisn: string,
    petugas: string,
    catatanBarang: string
  ): { success: boolean; error?: string; mahasantri?: Mahasantri } {
    const mhsList = this.getMahasantriList();
    const mhs = mhsList.find((m) => m.nimNisn.trim().toLowerCase() === nimNisn.trim().toLowerCase());

    if (!mhs) {
      return { success: false, error: `Mahasantri dengan NIM/NISN ${nimNisn} tidak ditemukan.` };
    }

    if (mhs.statusCheckIn === 'CHECKED_IN') {
      return {
        success: true,
        mahasantri: mhs,
        error: `Mahasantri ${mhs.nama} sudah melakukan check-in sebelumnya pada ${new Date(
          mhs.checkInTimestamp || ''
        ).toLocaleString('id-ID')}.`,
      };
    }

    const timestamp = new Date().toISOString();
    mhs.statusCheckIn = 'CHECKED_IN';
    mhs.checkInTimestamp = timestamp;
    mhs.petugasCheckIn = petugas;
    mhs.catatanBarangCheckIn = catatanBarang;

    this.saveMahasantriList(mhsList);

    // Record check-in log
    const logs = this.getLogs();
    const newLog: CheckInLog = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      mahasantriId: mhs.id,
      mahasantriNimNisn: mhs.nimNisn,
      nama: mhs.nama,
      gedung: mhs.gedung,
      nomorKamar: mhs.nomorKamar,
      lantai: mhs.lantai,
      bedNumber: mhs.bedNumber,
      timestamp,
      petugas,
      catatanBarang,
    };
    logs.unshift(newLog);
    this.saveLogs(logs);

    return { success: true, mahasantri: mhs };
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

  saveLogs(logs: CheckInLog[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    } catch (e) {
      console.warn('localStorage saveLogs error:', e);
    }
    window.dispatchEvent(new CustomEvent('mahad_logs_updated', { detail: logs }));
  },

  // --- Reset All Data ---
  resetAllData() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ROOMS_KEY);
    localStorage.removeItem(MHS_KEY);
    localStorage.removeItem(LOGS_KEY);
    localStorage.removeItem(SK_KEY);
    localStorage.removeItem(SK_PENGURUS_KEY);
    localStorage.removeItem(SESSION_KEY);
    window.location.reload();
  },
};

// --- AUTHENTICATION & MULTI-ROLE SESSION STORE ---
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

  setSession(session: UserSession) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('setSession storage error:', e);
    }
    window.dispatchEvent(new CustomEvent('mahad_auth_changed', { detail: session }));
  },

  clearSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new CustomEvent('mahad_auth_changed', { detail: null }));
  },

  // Login Superadmin
  loginAdmin(password: string): { success: boolean; session?: UserSession; error?: string } {
    if (password.trim() === DEFAULT_ADMIN.password) {
      const session: UserSession = {
        role: 'ADMIN',
        name: DEFAULT_ADMIN.nama,
        identifier: DEFAULT_ADMIN.email,
        token: `AUTH-ADMIN-${Date.now()}`,
      };
      this.setSession(session);
      return { success: true, session };
    }
    return { success: false, error: 'Password Superadmin salah! Silakan coba lagi.' };
  },

  // Login Pengurus / Mudabbir & Mudabbirah
  loginPengurus(
    usernameOrId: string,
    password: string
  ): { success: boolean; session?: UserSession; error?: string } {
    const cleanUser = usernameOrId.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser) {
      return { success: false, error: 'Masukkan Nama, ID SK, NIM, atau No. WA Pengurus!' };
    }

    // Check dynamic SK Pengurus list first
    const skPengurusList = MahadStore.getSKPengurusList();
    const skPengurus = skPengurusList.find((p) => {
      const matchId = p.id.toLowerCase() === cleanUser;
      const matchNim = p.nim && p.nim.toLowerCase() === cleanUser;
      const matchNama =
        p.nama.toLowerCase() === cleanUser ||
        p.nama.toLowerCase().includes(cleanUser) ||
        cleanUser.includes(p.nama.toLowerCase());
      const matchWa = p.noWa && p.noWa.replace(/\D/g, '') === cleanUser.replace(/\D/g, '');
      return matchId || matchNim || matchNama || matchWa;
    });

    if (skPengurus) {
      const expectedPass = (skPengurus.password || 'mahad2026').trim();
      if (cleanPass === expectedPass) {
        const session: UserSession = {
          role: 'PENGURUS',
          name: skPengurus.nama,
          identifier: skPengurus.id,
          floorAssigned: skPengurus.lantai,
          gedungAssigned: skPengurus.gedung,
          pengurusData: skPengurus,
          token: `AUTH-PGR-${skPengurus.id}-${Date.now()}`,
        };
        this.setSession(session);
        return { success: true, session };
      } else {
        return { success: false, error: `Password salah untuk pengurus "${skPengurus.nama}"!` };
      }
    }

    // Fallback: check DEFAULT_PENGURUS_LIST
    const defaultAcc = DEFAULT_PENGURUS_LIST.find((p) => {
      const matchUsername = p.username.toLowerCase() === cleanUser;
      const matchId = p.id.toLowerCase() === cleanUser;
      const matchNama =
        p.nama.toLowerCase() === cleanUser ||
        p.nama.toLowerCase().includes(cleanUser) ||
        cleanUser.includes(p.nama.toLowerCase());
      return matchUsername || matchId || matchNama;
    });

    if (defaultAcc) {
      const expectedPass = (defaultAcc.password || 'mahad2026').trim();
      if (cleanPass === expectedPass) {
        const session: UserSession = {
          role: 'PENGURUS',
          name: defaultAcc.nama,
          identifier: defaultAcc.username,
          floorAssigned: defaultAcc.lantai,
          gedungAssigned: defaultAcc.gedung,
          token: `AUTH-PGR-${defaultAcc.id}-${Date.now()}`,
        };
        this.setSession(session);
        return { success: true, session };
      } else {
        return { success: false, error: `Password salah untuk pengurus "${defaultAcc.nama}"!` };
      }
    }

    return {
      success: false,
      error: `Akun "${usernameOrId}" tidak ditemukan. Anda dapat login dengan mengetik Nama (misal: "Raihan"), NIM, ID SK, atau No. WhatsApp.`,
    };
  },

  // Check if Mahasantri PIN is created
  checkMahasantriLogin(nimNisn: string) {
    return this.checkMahasantriAccount(nimNisn);
  },

  checkMahasantriAccount(nimNisn: string): {
    found: boolean;
    isPinSet: boolean;
    skData?: SKMahasantri;
    mhsData?: Mahasantri;
    error?: string;
  } {
    const skList = MahadStore.getSKList();
    const skData = skList.find((x) => x.nimNisn.toLowerCase() === nimNisn.trim().toLowerCase());

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

  logout() {
    this.clearSession();
  },
};
