import { Building2, MapPin, Mail, Phone, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 mt-auto no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Col 1: Instansi */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-white font-extrabold text-sm sm:text-base">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white p-0.5 shrink-0 flex items-center justify-center border border-slate-700 shadow-2xs">
                <img src="/logo-mahad.png" alt="Logo Ma'had" className="w-full h-full object-contain" />
              </div>
              <span className="tracking-tight">UPT MA&apos;HAD AL-JAMI&apos;AH</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Universitas Islam Negeri Siber Syekh Nurjati Cirebon (UIN SSC).
              Sistem Layanan Prapendaftaran, Pemilihan Kamar Mandiri, dan E-Checkin Terdistribusi.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs">
              <span className="text-emerald-400 font-semibold tracking-wide" dir="rtl">معهدي جنتي</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-slate-400 italic">Ma&apos;hadi Jannati</span>
            </div>
          </div>

          {/* Col 2: Info & Kontak */}
          <div className="space-y-3">
            <h4 className="text-slate-200 font-bold text-xs uppercase tracking-wider">Sekretariat Ma&apos;had</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Jl. Perjuangan By Pass Sunyaragi, Kota Cirebon, Jawa Barat 45132</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>mahad_aljamiah@syekhnurjati.ac.id</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Helpdesk Ma&apos;had: +62 812-3456-7890</span>
              </li>
            </ul>
          </div>

          {/* Col 3: SOP Checkin */}
          <div className="space-y-3">
            <h4 className="text-slate-200 font-bold text-xs uppercase tracking-wider">Ketentuan Pelaksanaan</h4>
            <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800/80 text-xs text-slate-300 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Alur Check-in Terdistribusi</span>
              </div>
              <p className="text-[11px] text-slate-400">1. Mahasantri menunjukkan E-Tiket Barcode ke Pengurus Lantai.</p>
              <p className="text-[11px] text-slate-400">2. Pemeriksaan barang bawaan sesuai SOP Ma&apos;had.</p>
              <p className="text-[11px] text-slate-400">3. Serah terima kunci fisik setelah verifikasi QR berhasil.</p>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>&copy; {new Date().getFullYear()} UPT Ma&apos;had Al-Jami&apos;ah UIN Siber Syekh Nurjati Cirebon.</span>
          <span className="text-[11px] text-slate-400">Sistem Administrasi Asrama Terpadu</span>
        </div>
      </div>
    </footer>
  );
}
