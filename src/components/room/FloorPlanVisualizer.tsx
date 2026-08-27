'use client';

import React, { useState } from 'react';
import { Kamar, Bed } from '@/lib/types';
import { BedDouble, Lock, CheckCircle2, Users, AlertCircle, Sparkles } from 'lucide-react';

interface FloorPlanVisualizerProps {
  rooms: Kamar[];
  selectedKamarId: string | null;
  selectedBedNumber: number | null;
  isInternasional?: boolean;
  onSelectBed: (kamar: Kamar, bedNumber: number) => void;
}

export default function FloorPlanVisualizer({
  rooms,
  selectedKamarId,
  selectedBedNumber,
  isInternasional = false,
  onSelectBed,
}: FloorPlanVisualizerProps) {
  const [activeFloor, setActiveFloor] = useState<number>(5);

  const floors = [1, 2, 3, 4, 5];

  // Filter rooms on current floor
  const floorRooms = rooms.filter((r) => r.lantai === activeFloor);
  const jajaranDepan = floorRooms.filter((r) => r.jajaran === 'DEPAN');
  const jajaranBelakang = floorRooms.filter((r) => r.jajaran === 'BELAKANG');

  const isCurrentFloorLocked = floorRooms.some((r) => r.isLocked && !isInternasional);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-6">
      
      {/* Floor Selector Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-uin-secondary"></span>
            Pilih Lantai Gedung
          </label>
          <span className="text-xs text-slate-500">Gedung Ma&apos;had Qodim (Putra)</span>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {floors.map((floor) => {
            const isFloor2 = floor === 2;
            const isSelected = activeFloor === floor;
            const roomsOnThisFloor = rooms.filter((r) => r.lantai === floor);
            const totalOccupied = roomsOnThisFloor.reduce(
              (acc, r) => acc + r.beds.filter((b) => b.isOccupied).length,
              0
            );
            const totalCapacity = roomsOnThisFloor.length * 4;
            const availableCount = totalCapacity - totalOccupied;

            return (
              <button
                key={floor}
                type="button"
                onClick={() => setActiveFloor(floor)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-uin-primary text-white border-uin-primary ring-2 ring-uin-primary/20 shadow-md scale-102'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="font-bold text-base sm:text-lg">Lt. {floor}</span>
                  {isFloor2 && <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'text-uin-accent' : 'text-amber-500'}`} />}
                </div>
                <span className={`text-[11px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {isFloor2 ? 'Khusus Int.' : `Sisa ${availableCount}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floor Notice if Locked / Special */}
      {activeFloor === 2 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Lantai 2: Alokasi Khusus Mahasiswa Internasional</span>
            Mahasantri reguler tidak dapat memilih kamar di lantai ini kecuali memiliki status mahasiswa asing/internasional yang telah diverifikasi admin.
          </div>
        </div>
      )}

      {/* Visual Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
        <span className="font-semibold text-slate-700">Keterangan:</span>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-emerald-500"></div>
          <span className="text-slate-600">Bed Tersedia</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-amber-500"></div>
          <span className="text-slate-600">Pilihan Anda</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-slate-300"></div>
          <span className="text-slate-600">Terisi (Penuh)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-rose-200 border border-rose-300 flex items-center justify-center">
            <Lock className="w-2.5 h-2.5 text-rose-600" />
          </div>
          <span className="text-slate-600">Dikunci Admin</span>
        </div>
      </div>

      {/* Denah Lorong Gedung */}
      <div className="space-y-6 bg-slate-100/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
        
        {/* Jajaran Belakang (513 - 516) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                Jajaran Belakang (Sisi Utara)
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">Kamar {activeFloor}13 - {activeFloor}16</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {jajaranBelakang.map((kamar) => (
              <RoomCard
                key={kamar.id}
                kamar={kamar}
                selectedKamarId={selectedKamarId}
                selectedBedNumber={selectedBedNumber}
                isInternasional={isInternasional}
                onSelectBed={onSelectBed}
              />
            ))}
          </div>
        </div>

        {/* Lorong Gedung / Corridor Visual */}
        <div className="relative py-2">
          <div className="border-t-2 border-dashed border-slate-300"></div>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-200 text-slate-600 text-[10px] uppercase font-bold tracking-widest px-4 py-0.5 rounded-full border border-slate-300">
            LORONG LANTAI {activeFloor}
          </span>
        </div>

        {/* Jajaran Depan (509 - 512) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                Jajaran Depan (Sisi Selatan)
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                Kamar {activeFloor}{activeFloor === 1 ? '09' : activeFloor === 2 ? '09' : activeFloor === 3 ? '09' : activeFloor === 4 ? '09' : '09'} - {activeFloor}12
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {jajaranDepan.map((kamar) => (
              <RoomCard
                key={kamar.id}
                kamar={kamar}
                selectedKamarId={selectedKamarId}
                selectedBedNumber={selectedBedNumber}
                isInternasional={isInternasional}
                onSelectBed={onSelectBed}
              />
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

interface RoomCardProps {
  kamar: Kamar;
  selectedKamarId: string | null;
  selectedBedNumber: number | null;
  isInternasional: boolean;
  onSelectBed: (kamar: Kamar, bedNumber: number) => void;
}

function RoomCard({
  kamar,
  selectedKamarId,
  selectedBedNumber,
  isInternasional,
  onSelectBed,
}: RoomCardProps) {
  const occupiedCount = kamar.beds.filter((b) => b.isOccupied).length;
  const availableBeds = kamar.kapasitas - occupiedCount;
  const isFull = availableBeds === 0;
  const isLockedForUser = kamar.isLocked && !isInternasional;

  return (
    <div
      className={`rounded-xl border p-3.5 transition-all bg-white flex flex-col justify-between ${
        isLockedForUser
          ? 'border-rose-200 bg-rose-50/40 opacity-80'
          : isFull
          ? 'border-slate-200 bg-slate-50/80'
          : selectedKamarId === kamar.id
          ? 'border-amber-400 ring-2 ring-amber-300 shadow-md bg-amber-50/20'
          : 'border-slate-200 hover:border-uin-secondary/60 hover:shadow'
      }`}
    >
      {/* Header Kamar */}
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-800 text-base">Kamar {kamar.nomor}</span>
        </div>

        {isLockedForUser ? (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
            <Lock className="w-3 h-3" /> Dikunci
          </span>
        ) : isFull ? (
          <span className="text-[11px] font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
            Penuh
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            Sisa {availableBeds} Bed
          </span>
        )}
      </div>

      {/* Grid 4 Ranjang / Beds */}
      <div className="grid grid-cols-2 gap-2 my-1">
        {kamar.beds.map((bed) => {
          const isSelected = selectedKamarId === kamar.id && selectedBedNumber === bed.bedNumber;
          const isDisabled = bed.isOccupied || isLockedForUser;

          return (
            <button
              key={bed.bedNumber}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectBed(kamar, bed.bedNumber)}
              className={`p-2 rounded-lg text-left transition-all border flex flex-col justify-between h-14 ${
                isSelected
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm ring-1 ring-amber-400'
                  : bed.isOccupied
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : isLockedForUser
                  ? 'bg-rose-50 text-rose-400 border-rose-200 cursor-not-allowed'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-600'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs">Bed {bed.bedNumber}</span>
                {isSelected ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                ) : bed.isOccupied ? (
                  <Users className="w-3 h-3 text-slate-400 shrink-0" />
                ) : isLockedForUser ? (
                  <Lock className="w-3 h-3 text-rose-400 shrink-0" />
                ) : (
                  <BedDouble className="w-3.5 h-3.5 opacity-70 shrink-0" />
                )}
              </div>

              <div className="text-[10px] truncate">
                {isSelected
                  ? 'Dipilih'
                  : bed.isOccupied
                  ? bed.mahasantriNama ? bed.mahasantriNama.split(' ')[0] : 'Terisi'
                  : isLockedForUser
                  ? 'Terkunci'
                  : 'Kosong'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-2 pt-2 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Kapasitas: 4 Orang</span>
        <span>{kamar.jajaran === 'BELAKANG' ? 'Jajaran Belakang' : 'Jajaran Depan'}</span>
      </div>
    </div>
  );
}
