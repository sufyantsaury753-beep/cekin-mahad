-- ==============================================================================
-- SKEMA DATABASE REALTIME MA'HAD UIN SIBER SYEKH NURJATI CIREBON (SUPABASE)
-- ==============================================================================

-- 1. TABEL KAMAR (192 Kamar Jadid & Qodim Lantai 2-5)
CREATE TABLE IF NOT EXISTS public.kamar (
    id TEXT PRIMARY KEY,
    nomor TEXT NOT NULL,
    lantai INT NOT NULL,
    jajaran TEXT NOT NULL,
    gedung TEXT NOT NULL,
    gender TEXT NOT NULL,
    kategori TEXT NOT NULL DEFAULT 'UMUM',
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    lock_reason TEXT,
    kapasitas INT NOT NULL DEFAULT 4,
    beds JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL SK MAHASANTRI (Master Data 800+ Santri, PIN & WA)
CREATE TABLE IF NOT EXISTS public.sk_mahasantri (
    nim_nisn TEXT PRIMARY KEY,
    no INT,
    nama TEXT NOT NULL,
    jenis_kelamin TEXT NOT NULL,
    jenis_pendaftaran TEXT NOT NULL,
    fakultas TEXT NOT NULL,
    jurusan TEXT NOT NULL,
    is_internasional BOOLEAN DEFAULT FALSE,
    asal_negara TEXT,
    sk_nomor TEXT,
    pin TEXT,
    no_wa TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL MAHASANTRI (Santri Terdaftar, Boarding Pass, Kamar & Kasur)
CREATE TABLE IF NOT EXISTS public.mahasantri (
    id TEXT PRIMARY KEY,
    nim_nisn TEXT NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    jenis_kelamin TEXT NOT NULL,
    jenis_pendaftaran TEXT NOT NULL,
    fakultas TEXT NOT NULL,
    jurusan TEXT NOT NULL,
    kamar_id TEXT NOT NULL,
    gedung TEXT NOT NULL,
    lantai INT NOT NULL,
    nomor_kamar TEXT NOT NULL,
    bed_number INT NOT NULL,
    no_wa TEXT NOT NULL,
    nama_ortu TEXT,
    no_wa_ortu TEXT,
    foto_url TEXT,
    status TEXT NOT NULL DEFAULT 'BELUM_CHECKIN',
    token_tiket TEXT NOT NULL,
    waktu_daftar TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    waktu_checkin TIMESTAMP WITH TIME ZONE
);

-- 4. TABEL SK PENGURUS (Mudabbir & Mudabbirah Lantai)
CREATE TABLE IF NOT EXISTS public.sk_pengurus (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    nim TEXT,
    jenis_kelamin TEXT NOT NULL,
    jabatan TEXT NOT NULL,
    gedung TEXT NOT NULL,
    lantai INT NOT NULL,
    kamar_khusus TEXT,
    no_wa TEXT NOT NULL,
    password TEXT NOT NULL DEFAULT 'mahad2026',
    is_aktif BOOLEAN DEFAULT TRUE,
    sk_nomor TEXT DEFAULT 'SK-PENGURUS/2026'
);

-- 5. TABEL LOG CHECK-IN (Aktivitas Scan Barcode Mudabbir)
CREATE TABLE IF NOT EXISTS public.checkin_logs (
    id TEXT PRIMARY KEY,
    mahasantri_id TEXT NOT NULL,
    nama_mahasantri TEXT NOT NULL,
    nim_nisn TEXT NOT NULL,
    kamar TEXT NOT NULL,
    bed_number INT NOT NULL,
    petugas_nama TEXT NOT NULL,
    petugas_role TEXT NOT NULL,
    waktu TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    catatan_barang TEXT
);

-- AKTIFKAN ROW LEVEL SECURITY (RLS) & IZIN AKSES ANOMALOUS/PUBLIC
ALTER TABLE public.kamar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sk_mahasantri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mahasantri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sk_pengurus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Full Access Kamar" ON public.kamar FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access SK" ON public.sk_mahasantri FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access Mahasantri" ON public.mahasantri FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access Pengurus" ON public.sk_pengurus FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access Logs" ON public.checkin_logs FOR ALL USING (true) WITH CHECK (true);

-- AKTIFKAN SUPABASE REALTIME REPLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.kamar;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mahasantri;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sk_mahasantri;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sk_pengurus;
ALTER PUBLICATION supabase_realtime ADD TABLE public.checkin_logs;
