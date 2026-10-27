'use client';

import React, { useState, useRef } from 'react';
import { parsePdfSK, parseCsvSK } from '@/lib/pdfParser';
import { SKMahasantri } from '@/lib/types';
import { MahadStore } from '@/lib/store';
import {
  FileUp,
  FileText,
  CheckCircle,
  AlertTriangle,
  Upload,
  X,
  Loader2,
  FileCheck,
  Check,
} from 'lucide-react';

interface SKUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export default function SKUploadModal({ isOpen, onClose, onSuccess }: SKUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<SKMahasantri[]>([]);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError(null);
    setParsedData([]);
    setIsParsing(true);

    try {
      if (selected.type === 'application/pdf' || selected.name.endsWith('.pdf')) {
        const result = await parsePdfSK(selected);
        if (result.success && result.data.length > 0) {
          setParsedData(result.data);
        } else {
          setError(result.error || 'Gagal mengekstrak data dari PDF.');
        }
      } else if (selected.name.endsWith('.csv') || selected.name.endsWith('.txt')) {
        const text = await selected.text();
        const data = parseCsvSK(text);
        if (data.length > 0) {
          setParsedData(data);
        } else {
          setError('Format CSV tidak sesuai. Pastikan kolom: No, Nama, JK, NIM/NISN, Jenis, Fakultas, Jurusan.');
        }
      } else {
        setError('Format file harus PDF atau CSV.');
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat membaca file.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedData.length === 0) return;

    MahadStore.importSKList(parsedData, importMode === 'replace');
    setIsSuccess(true);
    setTimeout(() => {
      onSuccess(parsedData.length);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl p-5 sm:p-6 max-w-3xl w-full shadow-xl border border-slate-200 space-y-5 my-8">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-uin-primary border border-emerald-100 flex items-center justify-center">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Unggah Dokumen SK Penetapan Mahasantri</h3>
              <p className="text-xs text-slate-500">
                Sistem membaca dokumen PDF/CSV dan mengekstrak tabel identitas NISN/NIM mahasantri secara otomatis.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-uin-primary bg-slate-50/60 hover:bg-slate-50 rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-colors space-y-2.5"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.csv,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-10 h-10 bg-uin-primary/10 text-uin-primary rounded-lg flex items-center justify-center mx-auto">
            <Upload className="w-5 h-5" />
          </div>

          <div>
            <span className="font-semibold text-xs sm:text-sm text-slate-800 block">
              {file ? file.name : 'Klik untuk memilih file PDF atau CSV SK'}
            </span>
            <span className="text-[11px] text-slate-500">
              Format didukung: PDF resmi lampiran SK Ma&apos;had Al-Jami&apos;ah atau file CSV
            </span>
          </div>

          {file && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-md text-[11px] font-mono text-emerald-800 border border-slate-200">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          )}
        </div>

        {/* Parsing Loader */}
        {isParsing && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center gap-2.5 text-xs text-slate-600">
            <Loader2 className="w-4 h-4 animate-spin text-uin-primary" />
            <span>Membaca dan memproses tabel mahasantri dari dokumen PDF...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Success Banner */}
        {isSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-2 text-emerald-900 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Berhasil mengimpor {parsedData.length} data mahasantri ke Master SK.</span>
          </div>
        )}

        {/* Parsed Preview Table */}
        {parsedData.length > 0 && !isSuccess && (
          <div className="space-y-3">
            {/* Import Mode Selector */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="text-xs font-semibold text-slate-700 block">Metode Penyimpanan SK:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${importMode === 'replace' ? 'bg-white border-uin-primary text-slate-900 shadow-xs' : 'bg-white border-slate-200 text-slate-600'}`}>
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="mt-0.5 text-uin-primary"
                  />
                  <div>
                    <span className="block font-semibold">Ganti Total SK (Terbaru)</span>
                    <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                      Menghapus data lama agar tidak dobel. PIN santri yang sudah aktivasi tetap aman.
                    </span>
                  </div>
                </label>

                <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${importMode === 'merge' ? 'bg-white border-uin-primary text-slate-900 shadow-xs' : 'bg-white border-slate-200 text-slate-600'}`}>
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                    className="mt-0.5 text-uin-primary"
                  />
                  <div>
                    <span className="block font-semibold">Gabungkan / Tambah Baru</span>
                    <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                      Memperbarui data yang cocok dan menambahkan santri baru ke daftar SK yang ada.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Terdeteksi {parsedData.length} Mahasantri dari Dokumen:
              </span>
              <span className="text-[11px] text-slate-500">
                {parsedData.filter((x) => x.isInternasional).length} Internasional &bull; {parsedData.filter((x) => !x.isInternasional).length} Nasional
              </span>
            </div>

            <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">No</th>
                    <th className="py-2 px-3">NIM / NISN</th>
                    <th className="py-2 px-3">Nama</th>
                    <th className="py-2 px-3">Jenis</th>
                    <th className="py-2 px-3">Jurusan &amp; Fak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {parsedData.slice(0, 100).map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 font-mono text-slate-400">{item.no || idx + 1}</td>
                      <td className="py-1.5 px-3 font-mono font-semibold text-slate-800">{item.nimNisn}</td>
                      <td className="py-1.5 px-3 font-medium text-slate-900">{item.nama}</td>
                      <td className="py-1.5 px-3 text-slate-500">{item.jenisPendaftaran}</td>
                      <td className="py-1.5 px-3 text-slate-500">{item.jurusan} ({item.fakultas})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {parsedData.length > 100 && (
              <p className="text-[10px] text-slate-400 text-center">
                Menampilkan 100 dari {parsedData.length} data yang siap diimpor.
              </p>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Tutup
          </button>

          {parsedData.length > 0 && !isSuccess && (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="flex items-center gap-1.5 px-4 py-2 bg-uin-primary hover:bg-uin-secondary text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Simpan &amp; Impor {parsedData.length} Mahasantri</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
