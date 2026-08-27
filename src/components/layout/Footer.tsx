import { Building2, MapPin, Mail, Phone, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Col 1: Instansi */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-serif font-bold text-lg">
              <Building2 className="w-5 h-5 text-uin-accent" />
              <span>UPT MA&apos;HAD AL-JAMI&apos;AH</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Universitas Islam Negeri Siber Syekh Nurjati Cirebon (UIN SSC).
              Sistem Layanan Prapendaftaran, Pemilihan Kamar Mandiri, dan E-Checkin Terdistribusi.
            </p>
            <div className="pt-2 text-xs text-uin-accent font-mono">
              معـهـدي جنـتـي &bull; Ma&apos;hadi Jannati
            </div>
          </div>

          {/* Col 2: Info & Kontak */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Sekretariat Ma&apos;had</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Jl. Perjuangan By Pass Sunyaragi, Kota Cirebon, Jawa Barat 45132</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>mahad_aljamiah@syekhnurjati.ac.id</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Helpdesk Ma&apos;had: +62 812-3456-7890</span>
              </li>
            </ul>
          </div>

          {/* Col 3: SOP Checkin */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Ketentuan Hari-H</h4>
            <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Alur Check-in Mandiri</span>
              </div>
              <p>1. Tunjukkan E-Tiket Barcode ke Pengurus Lantai masing-masing.</p>
              <p>2. Pemeriksaan barang bawaan dilakukan langsung di depan kamar.</p>
              <p>3. Kunci diserahkan setelah scan status berhasil.</p>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} UPT Ma&apos;had Al-Jami&apos;ah UIN Siber Syekh Nurjati Cirebon. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
