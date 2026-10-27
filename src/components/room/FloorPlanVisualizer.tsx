'use client';

import React, { useState, useEffect } from 'react';
import { Kamar, Bed, GedungType, Gender } from '@/lib/types';
import { BedDouble, Lock, Users, AlertCircle, Building2, ShieldAlert, Check } from 'lucide-react';

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
        className={`relative rounded-lg p-3.5 border transition-colors ${
          isSelectedKamar
            ? 'border-uin-primary bg-emerald-50/40 ring-1 ring-uin-primary shadow-xs'
            : isLocked
            ? 'border-amber-200 bg-amber-50/30'
            : isGenderMismatch
            ? 'border-slate-200 bg-slate-100/60 opacity-60'
            : isFull
            ? 'border-slate-200 bg-slate-50'
            : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
        }`}
      >
        {/* Room Header */}
        <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 mb-2.5">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900 font-mono">
                Kamar {kamar.nomor}
              </span>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                  kamar.gender === 'L'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {kamar.gender === 'L' ? 'Putra' : 'Putri'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {kamar.kapasitas} Kasur ({kamar.kapasitas - totalOccupied} Tersedia)
            </p>
          </div>

          {/* Status Badge */}
          {isLocked ? (
            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-medium shrink-0">
              <Lock className="w-3 h-3 text-amber-600" />
              {kamar.lockReason || 'Terkunci'}
            </span>
          ) : isGenderMismatch ? (
            <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-medium shrink-0">
              Khusus {kamar.gender === 'L' ? 'Putra' : 'Putri'}
            </span>
          ) : isFull ? (
            <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-medium shrink-0">
              Penuh
            </span>
          ) : (
            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-medium shrink-0">
              Tersedia
            </span>
          )}
        </div>

        {/* Locked / Disabled Notice */}
        {isLocked && (
          <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-900 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">{kamar.lockReason || 'Kamar dikunci untuk Mudabbir / Keperluan Khusus'}</span>
          </div>
        )}

        {isGenderMismatch && (
          <div className="mb-2 p-1.5 bg-slate-100 rounded text-[10px] text-slate-600 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-slate-500 shrink-0" />
            <span>Khusus mahasantri {kamar.gender === 'L' ? 'Putra' : 'Putri'}</span>
          </div>
        )}

        {/* Beds Grid */}
        <div className={`grid gap-1.5 ${kamar.kapasitas <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {kamar.beds.map((bed) => {
            const isSelected = isSelectedKamar && selectedBedNumber === bed.bedNumber;
            const isOccupied = bed.isOccupied;

            return (
              <button
                key={bed.bedNumber}
                type="button"
                disabled={isDisabled || isOccupied}
                onClick={() => onSelectBed(kamar, bed.bedNumber)}
                className={`p-2 rounded-lg text-center text-xs font-medium flex flex-col items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-uin-primary text-white shadow-xs'
                    : isOccupied
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : isDisabled
                    ? 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200 cursor-pointer'
                }`}
              >
                <BedDouble className={`w-3.5 h-3.5 mb-0.5 ${isSelected ? 'text-white' : isOccupied ? 'text-slate-300' : 'text-uin-primary'}`} />
                <span className="font-semibold text-xs">Bed {bed.bedNumber}</span>
                <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-100' : isOccupied ? 'text-slate-400' : 'text-emerald-700 font-medium'}`}>
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
    <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-5">
      
      {/* 1. Building Selector Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-uin-primary" />
          <span>1. Pilih Gedung Asrama Ma&apos;had</span>
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Gedung Jadid */}
          <button
            type="button"
            onClick={() => setActiveGedung("Ma'had Jadid")}
            className={`p-3.5 rounded-lg border text-left transition-colors relative ${
              activeGedung === "Ma'had Jadid"
                ? 'bg-white border-uin-primary shadow-xs ring-1 ring-uin-primary'
                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-slate-900">Asrama Ma&apos;had Jadid</h3>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                activeGedung === "Ma'had Jadid"
                  ? 'bg-emerald-50 text-uin-primary border-emerald-200'
                  : 'bg-slate-200/80 text-slate-700 border-slate-300'
              }`}>
                Putra &amp; Putri
              </span>
            </div>
            <p className="text-xs mt-1 text-slate-500">
              Putra: Kamar 09-16 &bull; Putri: Kamar 01-08 &amp; 17-24 (Lantai 2 - 5)
            </p>
          </button>

          {/* Gedung Qodim */}
          <button
            type="button"
            disabled={genderConstraint === 'L'}
            onClick={() => setActiveGedung("Ma'had Qodim")}
            className={`p-3.5 rounded-lg border text-left transition-colors relative ${
              activeGedung === "Ma'had Qodim"
                ? 'bg-white border-uin-primary shadow-xs ring-1 ring-uin-primary'
                : genderConstraint === 'L'
                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-slate-900">Asrama Ma&apos;had Qodim</h3>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                activeGedung === "Ma'had Qodim"
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-200/80 text-slate-700 border-slate-300'
              }`}>
                Khusus Putri
              </span>
            </div>
            <p className="text-xs mt-1 text-slate-500">
              {genderConstraint === 'L'
                ? 'Gedung Qodim khusus mahasantri putri (tidak dapat dipilih santri putra)'
                : 'Khusus Mahasantri Putri: Kamar 01-24 (Lantai 2 - 5)'}
            </p>
          </button>

        </div>
      </div>

      {/* 2. Floor Selector Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-uin-primary"></span>
            <span>2. Pilih Lantai ({activeGedung})</span>
          </label>
          <span className="text-xs text-slate-500">Lantai 2 s/d 5</span>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
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
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-colors ${
                  isSelected
                    ? 'bg-uin-primary text-white border-uin-primary shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="font-bold text-sm sm:text-base">Lantai {floor}</span>
                <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {availableCount} Bed Tersedia
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Rooms Layout Breakdown */}
      <div className="space-y-5 pt-1">
        {isJadid ? (
          // MA'HAD JADID LAYOUT
          <>
            {/* Section 1: Blok Putri Barat (01 - 08) */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Lorong Putri Barat &bull; Kamar {activeFloor}01 - {activeFloor}08 (8 Kamar)
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {putriBaratRooms.map(renderRoomCard)}
              </div>
            </div>

            {/* Section 2: Blok Putra Tengah (09 - 16) */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Lorong Putra &bull; Kamar {activeFloor}09 - {activeFloor}16 (8 Kamar)
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {putraRooms.map(renderRoomCard)}
              </div>
            </div>

            {/* Section 3: Blok Putri Timur (17 - 24) */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Lorong Putri Timur &bull; Kamar {activeFloor}17 - {activeFloor}24 (8 Kamar)
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {putriTimurRooms.map(renderRoomCard)}
              </div>
            </div>
          </>
        ) : (
          // MA'HAD QODIM LAYOUT (FULL PUTRI)
          <>
            {/* Section 1: Qodim Depan (01 - 12) */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Gedung Qodim (Lorong Depan) &bull; Kamar {activeFloor}01 - {activeFloor}12 (12 Kamar Putri)
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {qodimDepanRooms.map(renderRoomCard)}
              </div>
            </div>

            {/* Section 2: Qodim Belakang (13 - 24) */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Gedung Qodim (Lorong Belakang) &bull; Kamar {activeFloor}13 - {activeFloor}24 (12 Kamar Putri)
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {qodimBelakangRooms.map(renderRoomCard)}
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
