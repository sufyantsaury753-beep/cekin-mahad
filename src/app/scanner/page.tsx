'use client';

import React, { useState, useEffect } from 'react';
import CameraQRScanner from '@/components/scanner/CameraQRScanner';
import { MahadStore } from '@/lib/store';
import { CheckInLog, Mahasantri } from '@/lib/types';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  Users,
  Clock,
  Key,
  HelpCircle,
} from 'lucide-react';

export default function ScannerPage() {
  const [logs, setLogs] = useState<CheckInLog[]>([]);
  const [mhsList, setMhsList] = useState<Mahasantri[]>([]);

  useEffect(() => {
    setLogs(MahadStore.getLogs());
    setMhsList(MahadStore.getMahasantriList());

    const handleUpdate = () => {
      setLogs(MahadStore.getLogs());
      setMhsList(MahadStore.getMahasantriList());
    };

    window.addEventListener('mahad_mhs_updated', handleUpdate);
    return () => window.removeEventListener('mahad_mhs_updated', handleUpdate);
  }, []);

  const totalCheckedIn = mhsList.filter((m) => m.statusCheckIn === 'CHECKED_IN').length;
  const totalRegistered = mhsList.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Station */}
      <div className="bg-gradient-to-r from-uin-dark via-uin-primary to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-uin-accent">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-uin-accent block">
                PORTAL PENGURUS LANTAI / LORONG KAMAR
              </span>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Pos E-Checkin &amp; Serah Terima Kunci
              </h1>
              <p className="text-xs text-emerald-200">Gedung Ma&apos;had Qodim &bull; Hari-H Kedatangan</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-xl border border-white/15 text-center">
            <span className="text-[10px] uppercase text-emerald-200 block font-semibold">Progres Check-In</span>
            <span className="text-lg font-bold font-mono text-uin-accent">
              {totalCheckedIn} / {totalRegistered} Mahasantri
            </span>
          </div>
        </div>
      </div>

      {/* Main Scanner Section */}
      <CameraQRScanner />

      {/* Recent Check-in Logs */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            Aktivitas Check-In Terbaru
          </h3>
          <span className="text-xs text-slate-400">{logs.length} riwayat</span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Belum ada mahasantri yang melakukan check-in pada sesi ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">{log.nama}</span>
                    <span className="text-slate-500 font-mono">NIM: {log.nim}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div className="text-left sm:text-right">
                    <span className="font-bold text-uin-primary block">Kamar {log.nomorKamar} (Bed {log.bedNumber})</span>
                    <span className="text-[11px] text-slate-400">Petugas: {log.petugas}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
