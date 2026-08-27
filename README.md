# 🏢 Sistem Pemilihan Kamar & E-Checkin Digital Ma'had
**UPT Ma'had Al-Jami'ah — UIN Siber Syekh Nurjati Cirebon (UIN SSC)**

Sistem digitalisasi terdistribusi untuk prapendaftaran mahasantri, pemilihan denah kamar & ranjang secara mandiri, penerbitan E-Tiket Barcode digital, dan scanner check-in desentralisasi per lorong/lantai guna mengeliminasi antrean kendaraan di gerbang dan area parkir.

---

## 🌟 Fitur Utama

1. **Pemilihan Kamar & Ranjang Visual (2D Interactive Room Map)**
   - Pilihan Lantai 1 s/d 5.
   - Denah Jajaran Belakang (Kamar 513–516) & Jajaran Depan (Kamar 509–512).
   - Real-time indicator 4 Bed per kamar (Kosong, Dipilih, Terisi).
2. **E-Tiket & Boarding Pass Digital**
   - QR Code unik dengan token verifikasi otomatis.
   - Opsi cetak / simpan sebagai PDF langsung dari browser.
   - Opsi bagikan tiket via WhatsApp.
3. **E-Checkin Scanner Kamera Pengurus (Hari-H)**
   - Scan QR Code langsung lewat kamera browser HP pengurus lantai.
   - Pencarian cepat manual jika layar HP mahasantri terkendala.
   - Checklist verifikasi barang bawaan (SOP Ma'had).
   - 1-Klik serah terima kunci & konfirmasi status `CHECKED_IN`.
4. **Dashboard Superadmin**
   - Monitoring okupansi kapasitas gedung dan statistik mahasantri masuk secara live.
   - Kontrol penguncian kamar / lantai (misal: Lantai 2 dikunci khusus Mahasiswa Internasional).
   - Ekspor rekap data kehadiran ke format spreadsheet CSV.

---

## 🚀 Cara Menjalankan Aplikasi di Lokal

1. Buka terminal di folder project:
   ```bash
   cd C:\Users\sufya\.gemini\antigravity\scratch\cekin-mahad
   ```

2. Jalankan development server:
   ```bash
   npm run dev
   ```

3. Buka di browser:
   - **Portal Mahasantri / Beranda**: [http://localhost:3000](http://localhost:3000)
   - **Formulir Pendaftaran & Pilih Kamar**: [http://localhost:3000/daftar](http://localhost:3000/daftar)
   - **Cek E-Tiket Mahasantri**: [http://localhost:3000/tiket](http://localhost:3000/tiket)
   - **Scanner Kamera Pengurus (Hari-H)**: [http://localhost:3000/scanner](http://localhost:3000/scanner)
   - **Dashboard Admin & Okupansi**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## ☁️ Panduan Deploy Gratis ke Vercel + GitHub (Rp 0)

1. Buat repositori baru di akun GitHub Anda (misal `cekin-mahad`).
2. Hubungkan folder project ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit sistem e-checkin mahad"
   git branch -M main
   git remote add origin https://github.com/USERNAME/cekin-mahad.git
   git push -u origin main
   ```
3. Buka [Vercel.com](https://vercel.com) $\rightarrow$ Login dengan akun GitHub.
4. Klik **Add New Project** $\rightarrow$ Pilih repository `cekin-mahad` $\rightarrow$ Klik **Deploy**.
5. Selesai! Website Anda sudah online dengan domain gratis seperti `https://cekin-mahad.vercel.app` atau bisa dihubungkan ke domain kampus.
