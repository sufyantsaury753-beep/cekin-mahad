import { Building2, MapPin, Mail, Phone, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Col 1: Instansi */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <div className="w-7 h-7 rounded-md overflow-hidden bg-white p-0.5 shrink-0 flex items-center justify-center">
                <img src="/logo-mahad.png" alt="Logo Ma'had" className="w-full h-full object-contain" />
              </div>
              <span className="tracking-tight">UPT MA&apos;HAD AL-JAMI&apos;AH</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Universitas Islam Negeri Siber Syekh Nurjati Cirebon (UIN SSC).
              Sistem Layanan Prapendaftaran, Pemilihan Kamar Mandiri, dan E-Checkin Terdistribusi.
            </p>
            <div className="pt-1 text-[11px] text-emerald-400 font-mono">
              معـهـدي جنـتـي &bull; Ma&apos;hadi Jannati
            </div>
          </div>

          {/* Col 2: Info & Kontak */}
          <div className="space-y-2.5">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Sekretariat Ma&apos;had</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Jl. Perjuangan By Pass Sunyaragi, Kota Cirebon, Jawa Barat 45132</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>mahad_aljamiah@syekhnurjati.ac.id</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Helpdesk Ma&apos;had: +62 812-3456-7890</span>
              </li>
            </ul>
          </div>

          {/* Col 3: SOP Checkin */}
          <div className="space-y-2.5">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Ketentuan Pelaksanaan</h4>
            <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/80 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Alur Check-in Terdistribusi</span>
              </div>
              <p className="text-[11px] text-slate-400">1. Mahasantri menunjukkan E-Tiket Barcode ke Pengurus Lantai.</p>
              <p className="text-[11px] text-slate-400">2. Pemeriksaan barang bawaan sesuai SOP Ma&apos;had.</p>
              <p className="text-[11px] text-slate-400">3. Serah terima kunci fisik setelah verifikasi QR berhasil.</p>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>&copy; {new Date().getFullYear()} UPT Ma&apos;had Al-Jami&apos;ah UIN Siber Syekh Nurjati Cirebon.</span>
          <span className="text-[11px] text-slate-400">Sistem Administrasi Asrama Terpadu</span>
        </div>
      </div>
    </footer>
  );
}
