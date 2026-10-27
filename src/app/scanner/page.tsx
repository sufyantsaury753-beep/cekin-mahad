'use client';

import React, { useState, useEffect } from 'react';
import CameraQRScanner from '@/components/scanner/CameraQRScanner';
import { MahadStore } from '@/lib/store';
import { CheckInLog, Mahasantri } from '@/lib/types';
import RoleGuard from '@/components/auth/RoleGuard';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  Clock,
  QrCode,
} from 'lucide-react';

export default function ScannerPage() {
  return (
    <RoleGuard allowedRoles={['PENGURUS', 'ADMIN']} pageTitle="Portal Scanner Pengurus Lorong">
      <ScannerPageContent />
    </RoleGuard>
  );
}

function ScannerPageContent() {
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Station */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-uin-primary border border-emerald-100 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
                Pos Check-In Lantai
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded border border-slate-200">
                Hari-H
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Pemindaian E-Tiket &amp; Serah Terima Kunci
            </h1>
            <p className="text-xs text-slate-500">Pemeriksaan barcode santri dan validasi barang bawaan SOP Ma&apos;had.</p>
          </div>
        </div>

        <div className="bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 text-left sm:text-right shrink-0">
          <span className="text-[11px] uppercase text-slate-500 block font-medium">Progres Kehadiran</span>
          <span className="text-base font-bold font-mono text-slate-900">
            {totalCheckedIn} / {totalRegistered} <span className="text-xs font-normal text-slate-500">Santri</span>
          </span>
        </div>
      </div>

      {/* Main Scanner Section */}
      <CameraQRScanner />

      {/* Recent Check-in Logs */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Aktivitas Check-In Terbaru</span>
          </h3>
          <span className="text-xs text-slate-400">{logs.length} riwayat</span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 font-normal">
            Belum ada mahasantri yang melakukan check-in pada sesi ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">{log.nama}</span>
                    <span className="text-slate-500 font-mono text-[11px]">NIM/NISN: {log.mahasantriNimNisn || log.nimNisn}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-left sm:text-right">
                  <div>
                    <span className="font-semibold text-uin-primary block">Kamar {log.nomorKamar} (Bed {log.bedNumber})</span>
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
