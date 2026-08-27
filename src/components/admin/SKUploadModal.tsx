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
  Sparkles,
  Users,
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

    MahadStore.importSKList(parsedData);
    setIsSuccess(true);
    setTimeout(() => {
      onSuccess(parsedData.length);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-slate-200 space-y-6 my-8">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-uin-primary/10 text-uin-primary flex items-center justify-center">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Unggah Dokumen SK Rektor / Pengumuman</h3>
              <p className="text-xs text-slate-500">
                Sistem akan membaca PDF dan otomatis mengekstrak seluruh tabel NISN/NIM mahasantri.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-uin-primary/40 hover:border-uin-primary bg-emerald-50/40 hover:bg-emerald-50/70 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.csv,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-14 h-14 bg-uin-primary text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Upload className="w-7 h-7" />
          </div>

          <div>
            <span className="font-bold text-sm text-slate-800 block">
              {file ? file.name : 'Klik untuk Pilih File PDF / CSV SK'}
            </span>
            <span className="text-xs text-slate-500">
              Mendukung PDF resmi lampiran SK Ma'had Al-Jami'ah atau file CSV/Excel
            </span>
          </div>

          {file && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-xs font-mono text-emerald-800 border border-emerald-200">
              <FileText className="w-3.5 h-3.5" />
              <span>{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          )}
        </div>

        {/* Parsing Loader */}
        {isParsing && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center gap-3 text-xs text-slate-600">
            <Loader2 className="w-4 h-4 animate-spin text-uin-primary" />
            <span>Membaca dan mengekstrak tabel mahasantri dari setiap halaman PDF...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Success Banner */}
        {isSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2.5 text-emerald-900 text-xs font-bold">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Berhasil mengimpor {parsedData.length} data mahasantri ke Master SK!</span>
          </div>
        )}

        {/* Parsed Preview Table */}
        {parsedData.length > 0 && !isSuccess && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Ditemukan {parsedData.length} Mahasantri dari Dokumen:
              </span>
              <span className="text-[11px] text-slate-500">
                {parsedData.filter((x) => x.isInternasional).length} Internasional &bull; {parsedData.filter((x) => !x.isInternasional).length} Nasional
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-[11px] text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[9px] sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-2">No</th>
                    <th className="p-2">NIM / NISN</th>
                    <th className="p-2">Nama</th>
                    <th className="p-2">Jenis</th>
                    <th className="p-2">Jurusan &amp; Fak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedData.slice(0, 100).map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 font-mono text-slate-400">{item.no || idx + 1}</td>
                      <td className="p-2 font-mono font-bold text-slate-800">{item.nimNisn}</td>
                      <td className="p-2 font-semibold text-slate-900">{item.nama}</td>
                      <td className="p-2 text-slate-500">{item.jenisPendaftaran}</td>
                      <td className="p-2 text-slate-500">{item.jurusan} ({item.fakultas})</td>
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
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
          >
            Tutup
          </button>

          {parsedData.length > 0 && !isSuccess && (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="flex items-center gap-2 px-6 py-2.5 bg-uin-primary hover:bg-uin-secondary text-white text-xs font-bold rounded-xl shadow-lg transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Simpan &amp; Impor {parsedData.length} Mahasantri ke SK</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
