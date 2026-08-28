'use client';

import React, { useState, useEffect } from 'react';
import { Kamar, Bed, GedungType, Gender } from '@/lib/types';
import { BedDouble, Lock, CheckCircle2, Users, AlertCircle, Sparkles, Building2, ShieldAlert } from 'lucide-react';

interface FloorPlanVisualizerProps {
  rooms: Kamar[];
  selectedKamarId: string | null;
  selectedBedNumber: number | null;
  genderConstraint?: Gender; // 'L' (Putra) / 'P' (Putri)
  isInternasional?: boolean;
  onSelectBed: (kamar: Kamar, bedNumber: number) => void;
}

export default function FloorPlanVisualizer({
  rooms,
  selectedKamarId,
  selectedBedNumber,
  genderConstraint,
  isInternasional = false,
  onSelectBed,
}: FloorPlanVisualizerProps) {
  // Default selected building based on gender (Putra defaults to Jadid, Putri to Qodim or Jadid)
  const [activeGedung, setActiveGedung] = useState<GedungType>(() => {
    return genderConstraint === 'L' ? "Ma'had Jadid" : "Ma'had Qodim";
  });
  const [activeFloor, setActiveFloor] = useState<number>(2);

  // If gender is L (Putra), force activeGedung to Jadid because Qodim is full Putri
  useEffect(() => {
    if (genderConstraint === 'L' && activeGedung === "Ma'had Qodim") {
      setActiveGedung("Ma'had Jadid");
    }
  }, [genderConstraint]);

  const floors = [2, 3, 4, 5];

  // Filter rooms by Gedung and Floor
  const filteredRooms = rooms.filter((r) => r.gedung === activeGedung && r.lantai === activeFloor);

  // Sections depending on building
  // In Jadid: Putri Barat (01-08), Putra (09-16), Putri Timur (17-24)
  // In Qodim: Putri Depan (01-12), Putri Belakang (13-24)
  const isJadid = activeGedung === "Ma'had Jadid";

  const putriBaratRooms = isJadid ? filteredRooms.filter((r) => r.jajaran === 'PUTRI_BARAT') : [];
  const putraRooms = isJadid ? filteredRooms.filter((r) => r.jajaran === 'PUTRA') : [];
  const putriTimurRooms = isJadid ? filteredRooms.filter((r) => r.jajaran === 'PUTRI_TIMUR') : [];

  const qodimDepanRooms = !isJadid ? filteredRooms.filter((r) => r.jajaran === 'DEPAN' || parseInt(r.nomor.slice(-2)) <= 12) : [];
  const qodimBelakangRooms = !isJadid ? filteredRooms.filter((r) => r.jajaran === 'BELAKANG' || parseInt(r.nomor.slice(-2)) > 12) : [];

  const renderRoomCard = (kamar: Kamar) => {
    const isGenderMismatch = genderConstraint && kamar.gender !== genderConstraint;
    const isLocked = kamar.isLocked && !isInternasional;
    const isDisabled = isGenderMismatch || isLocked;
    const isSelectedKamar = selectedKamarId === kamar.id;
    const totalOccupied = kamar.beds.filter((b) => b.isOccupied).length;
    const isFull = totalOccupied >= kamar.kapasitas;

    return (
      <div
        key={kamar.id}
        className={`relative rounded-2xl p-3.5 sm:p-4 border transition-all ${
          isSelectedKamar
            ? 'border-uin-primary bg-emerald-50/70 ring-2 ring-uin-primary/30 shadow-md'
            : isLocked
            ? 'border-amber-200 bg-amber-50/40 opacity-90'
            : isGenderMismatch
            ? 'border-slate-200 bg-slate-100/60 opacity-60'
            : isFull
            ? 'border-slate-200 bg-slate-50/80'
            : 'border-slate-200 bg-white hover:border-uin-secondary/60 hover:shadow-sm'
        }`}
      >
        {/* Room Header */}
        <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 mb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-slate-800 font-mono">
                Kamar {kamar.nomor}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  kamar.gender === 'L'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-pink-100 text-pink-800'
                }`}
              >
                {kamar.gender === 'L' ? '👦 Putra' : '🧕 Putri'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {kamar.kapasitas} Kasur ({kamar.kapasitas - totalOccupied} Tersedia)
            </p>
          </div>

          {/* Status Badge */}
          {isLocked ? (
            <span className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold shrink-0">
              <Lock className="w-3 h-3" />
              {kamar.lockReason || 'Terkunci'}
            </span>
          ) : isGenderMismatch ? (
            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-semibold shrink-0">
              Khusus {kamar.gender === 'L' ? 'Putra' : 'Putri'}
            </span>
          ) : isFull ? (
            <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md font-bold shrink-0">
              Penuh
            </span>
          ) : (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold shrink-0">
              Tersedia
            </span>
          )}
        </div>

        {/* Locked / Disabled Notice */}
        {isLocked && (
          <div className="mb-2 p-2 bg-amber-100/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>{kamar.lockReason || 'Kamar dikunci untuk Mudabbir / Keperluan Khusus'}</span>
          </div>
        )}

        {isGenderMismatch && (
          <div className="mb-2 p-1.5 bg-slate-200/70 rounded-lg text-[10px] text-slate-600 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-slate-500 shrink-0" />
            <span>Tidak dapat dipilih oleh mahasantri {genderConstraint === 'L' ? 'Putra' : 'Putri'}</span>
          </div>
        )}

        {/* Beds Grid */}
        <div className={`grid gap-2 ${kamar.kapasitas <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {kamar.beds.map((bed) => {
            const isSelected = isSelectedKamar && selectedBedNumber === bed.bedNumber;
            const isOccupied = bed.isOccupied;

            return (
              <button
                key={bed.bedNumber}
                type="button"
                disabled={isDisabled || isOccupied}
                onClick={() => onSelectBed(kamar, bed.bedNumber)}
                className={`p-2 rounded-xl text-center text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-uin-primary text-white shadow-md ring-2 ring-uin-primary/40 scale-102'
                    : isOccupied
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60'
                    : isDisabled
                    ? 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200/60'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 hover:scale-102 shadow-xs cursor-pointer'
                }`}
              >
                <BedDouble className={`w-4 h-4 mb-0.5 ${isSelected ? 'text-uin-accent' : isOccupied ? 'text-slate-300' : 'text-uin-primary'}`} />
                <span className="font-bold">Bed {bed.bedNumber}</span>
                <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-emerald-200 font-medium' : isOccupied ? 'text-slate-400' : 'text-emerald-700'}`}>
                  {isOccupied ? 'Terisi' : isSelected ? 'Dipilih' : 'Kosong'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-6">
      
      {/* 1. Building Selector Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-uin-primary" />
          1. Pilih Gedung Asrama Ma&apos;had
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Gedung Jadid */}
          <button
            type="button"
            onClick={() => setActiveGedung("Ma'had Jadid")}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              activeGedung === "Ma'had Jadid"
                ? 'bg-gradient-to-br from-uin-primary to-emerald-900 text-white border-uin-primary shadow-lg ring-2 ring-uin-primary/30'
                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Asrama Ma&apos;had Jadid</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeGedung === "Ma'had Jadid" ? 'bg-emerald-800 text-uin-accent' : 'bg-slate-200 text-slate-700'
              }`}>
                Putra &amp; Putri
              </span>
            </div>
            <p className={`text-xs mt-1 ${activeGedung === "Ma'had Jadid" ? 'text-emerald-100' : 'text-slate-500'}`}>
              👦 Putra: Kamar 09-16 &bull; 🧕 Putri: Kamar 01-08 &amp; 17-24 (Lantai 2 - 5)
            </p>
          </button>

          {/* Gedung Qodim */}
          <button
            type="button"
            disabled={genderConstraint === 'L'}
            onClick={() => setActiveGedung("Ma'had Qodim")}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              activeGedung === "Ma'had Qodim"
                ? 'bg-gradient-to-br from-pink-700 to-rose-900 text-white border-pink-700 shadow-lg ring-2 ring-pink-700/30'
                : genderConstraint === 'L'
                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Asrama Ma&apos;had Qodim</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeGedung === "Ma'had Qodim" ? 'bg-pink-900 text-pink-200' : 'bg-pink-100 text-pink-800'
              }`}>
                🧕 Full Putri
              </span>
            </div>
            <p className={`text-xs mt-1 ${activeGedung === "Ma'had Qodim" ? 'text-pink-100' : 'text-slate-500'}`}>
              {genderConstraint === 'L'
                ? '⛔ Gedung Qodim Khusus Mahasantri Putri (Laki-laki tidak diizinkan)'
                : '🧕 Full Putri: Kamar 01-24 (Lantai 2 - 5)'}
            </p>
          </button>

        </div>
      </div>

      {/* 2. Floor Selector Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-uin-primary"></span>
            2. Pilih Lantai ({activeGedung})
          </label>
          <span className="text-xs text-slate-500">Lantai 2 s/d 5</span>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {floors.map((floor) => {
            const isSelected = activeFloor === floor;
            const roomsOnThisFloor = rooms.filter((r) => r.gedung === activeGedung && r.lantai === floor);
            const totalCapacity = roomsOnThisFloor.reduce((acc, r) => acc + r.kapasitas, 0);
            const totalOccupied = roomsOnThisFloor.reduce(
              (acc, r) => acc + r.beds.filter((b) => b.isOccupied).length,
              0
            );
            const availableCount = totalCapacity - totalOccupied;

            return (
              <button
                key={floor}
                type="button"
                onClick={() => setActiveFloor(floor)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'bg-uin-primary text-white border-uin-primary ring-2 ring-uin-primary/20 shadow-md scale-102'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="font-extrabold text-base sm:text-lg">Lantai {floor}</span>
                <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                  Sisa {availableCount} Bed
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Rooms Layout Breakdown */}
      <div className="space-y-6 pt-2">
        
        {isJadid ? (
          // MA'HAD JADID LAYOUT
          <>
            {/* Section 1: Blok Putri Barat (01 - 08) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-pink-100">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                <h4 className="text-xs sm:text-sm font-bold text-pink-900 uppercase tracking-wider">
                  Lorong Putri Barat &bull; Kamar {activeFloor}01 - {activeFloor}08 (8 Kamar)
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {putriBaratRooms.map(renderRoomCard)}
              </div>
            </div>

            {/* Section 2: Blok Putra Tengah (09 - 16) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-blue-100">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h4 className="text-xs sm:text-sm font-bold text-blue-900 uppercase tracking-wider">
                  Lorong Putra &bull; Kamar {activeFloor}09 - {activeFloor}16 (8 Kamar)
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {putraRooms.map(renderRoomCard)}
              </div>
            </div>

            {/* Section 3: Blok Putri Timur (17 - 24) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-pink-100">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                <h4 className="text-xs sm:text-sm font-bold text-pink-900 uppercase tracking-wider">
                  Lorong Putri Timur &bull; Kamar {activeFloor}17 - {activeFloor}24 (8 Kamar)
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {putriTimurRooms.map(renderRoomCard)}
              </div>
            </div>
          </>
        ) : (
          // MA'HAD QODIM LAYOUT (FULL PUTRI)
          <>
            {/* Section 1: Qodim Depan (01 - 12) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-pink-100">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-600"></span>
                <h4 className="text-xs sm:text-sm font-bold text-pink-900 uppercase tracking-wider">
                  Gedung Qodim (Lorong Depan) &bull; Kamar {activeFloor}01 - {activeFloor}12 (12 Kamar Putri)
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {qodimDepanRooms.map(renderRoomCard)}
              </div>
            </div>

            {/* Section 2: Qodim Belakang (13 - 24) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-pink-100">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-600"></span>
                <h4 className="text-xs sm:text-sm font-bold text-pink-900 uppercase tracking-wider">
                  Gedung Qodim (Lorong Belakang) &bull; Kamar {activeFloor}13 - {activeFloor}24 (12 Kamar Putri)
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {qodimBelakangRooms.map(renderRoomCard)}
              </div>
            </div>
          </>
        )}

      </div>

    </div>
  );
}
