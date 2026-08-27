import { SKMahasantri, Gender, JenisPendaftaran } from './types';
import { SK_INFO } from './constants';

// Client-side PDF Parser for SK documents
export async function parsePdfSK(file: File): Promise<{ success: boolean; data: SKMahasantri[]; error?: string }> {
  if (typeof window === 'undefined') {
    return { success: false, data: [], error: 'Hanya bisa dijalankan di browser.' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();

    // Dynamically import pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist');
    // Configure worker
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '3.11.174'}/build/pdf.worker.min.js`;
    }

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const extractedRecords: SKMahasantri[] = [];
    let fullTextAllPages = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items.map((item: any) => item.str);
      const pageText = pageStrings.join(' ');
      fullTextAllPages += '\n' + pageText;

      // Extract lines from items with vertical position sorting
      parsePageLines(textContent.items, extractedRecords);
    }

    if (extractedRecords.length === 0) {
      // Fallback text regex parser on full extracted text
      const fallbackRecords = parseTextRegex(fullTextAllPages);
      if (fallbackRecords.length > 0) {
        return { success: true, data: fallbackRecords };
      }
      return {
        success: false,
        data: [],
        error: 'Tidak ditemukan tabel data mahasantri di dalam PDF. Pastikan format tabel sesuai dengan lampiran SK Ma\'had.',
      };
    }

    return { success: true, data: extractedRecords };
  } catch (err: any) {
    console.error('PDF parse error:', err);
    return {
      success: false,
      data: [],
      error: err?.message || 'Gagal membaca file PDF. Pastikan file tidak terkunci password.',
    };
  }
}

// Group text items by Y position to reconstruct rows
function parsePageLines(items: any[], records: SKMahasantri[]) {
  const lineMap: Record<number, { str: string; x: number }[]> = {};

  items.forEach((item) => {
    if (!item.str || !item.str.trim()) return;
    const y = Math.round(item.transform[5]); // Y coordinate
    // find nearest line within 4px tolerance
    let matchedY = Object.keys(lineMap)
      .map(Number)
      .find((existingY) => Math.abs(existingY - y) <= 4);

    if (matchedY === undefined) {
      matchedY = y;
      lineMap[matchedY] = [];
    }

    lineMap[matchedY].push({
      str: item.str.trim(),
      x: item.transform[4],
    });
  });

  // Sort each line from left to right (X coordinate)
  const sortedYKeys = Object.keys(lineMap)
    .map(Number)
    .sort((a, b) => b - a); // Top to bottom

  sortedYKeys.forEach((y) => {
    const rowItems = lineMap[y].sort((a, b) => a.x - b.x);
    const rowText = rowItems.map((i) => i.str).join(' ');

    // Match row pattern: NO | Nama | JK | NIM/NISN | Jenis Pendaftaran | Fakultas | Jurusan
    // Examples: "4 Abdullah Al Mu'izi Mafas L 0067999651 Calon Mahasantri Baru FASYA HUKUM KELUARGA ISLAM"
    // Or: "846 Aleanor L. Sharif L Filipina Perpanjangan FITK PAI"
    const parsed = parseRowText(rowText);
    if (parsed) {
      // check if already exists
      const exists = records.some((r) => r.nimNisn.toLowerCase() === parsed.nimNisn.toLowerCase());
      if (!exists) {
        records.push(parsed);
      }
    }
  });
}

function parseRowText(text: string): SKMahasantri | null {
  const clean = text.replace(/\s+/g, ' ').trim();

  // Pattern 1: Standar Nasional (NISN/NIM)
  // Regex matches: NO, Nama, JK (L/P), NIM/NISN (6-16 digits or alphanumeric), Jenis, Fakultas, Jurusan
  const nationalRegex = /^(\d+)\s+([A-Za-z\s'\.]+?)\s+([LP])\s+([0-9]{6,16}|[A-Z0-9\/-]{6,20})\s+(Calon Mahasantri Baru|Perpanjangan|Calon Santri Mahad Baru)\s+([A-Z]{3,5})\s+(.+)$/i;
  const matchNat = clean.match(nationalRegex);

  if (matchNat) {
    const no = parseInt(matchNat[1], 10);
    const nama = matchNat[2].trim();
    const jk = matchNat[3].toUpperCase() as Gender;
    const nimNisn = matchNat[4].trim();
    const jenis = matchNat[5].includes('Perpanjangan')
      ? 'Perpanjangan'
      : 'Calon Mahasantri Baru';
    const fakultas = matchNat[6].toUpperCase().trim();
    const jurusan = matchNat[7].trim();

    return {
      no,
      nimNisn,
      nama,
      jenisKelamin: jk,
      jenisPendaftaran: jenis as JenisPendaftaran,
      fakultas,
      jurusan,
      isInternasional: false,
      skNomor: SK_INFO.nomor,
    };
  }

  // Pattern 2: Mahasantri Internasional
  // Format: NO | NAMA | JK | ASAL NEGARA | Jenis | Fakultas | Jurusan
  const intlRegex = /^(\d+)\s+([A-Za-z\s'\.]+?)\s+([LP])\s+([A-Za-z\s]+?)\s+(Perpanjangan|Calon Mahasantri)\s+([A-Z]{3,5})\s+(.+)$/i;
  const matchIntl = clean.match(intlRegex);

  if (matchIntl) {
    const no = parseInt(matchIntl[1], 10);
    const nama = matchIntl[2].trim();
    const jk = matchIntl[3].toUpperCase() as Gender;
    const asalNegara = matchIntl[4].trim();
    const fakultas = matchIntl[6].toUpperCase().trim();
    const jurusan = matchIntl[7].trim();
    const countryCode = asalNegara.slice(0, 2).toUpperCase();

    return {
      no,
      nimNisn: `INT-${countryCode}-${no}`,
      nama,
      jenisKelamin: jk,
      jenisPendaftaran: 'Mahasantri Internasional',
      asalNegara,
      fakultas,
      jurusan,
      isInternasional: true,
      skNomor: SK_INFO.nomor,
    };
  }

  return null;
}

function parseTextRegex(fullText: string): SKMahasantri[] {
  const lines = fullText.split('\n');
  const results: SKMahasantri[] = [];

  lines.forEach((line) => {
    const parsed = parseRowText(line);
    if (parsed) {
      if (!results.some((r) => r.nimNisn === parsed.nimNisn)) {
        results.push(parsed);
      }
    }
  });

  return results;
}

// CSV parser support
export function parseCsvSK(csvText: string): SKMahasantri[] {
  const lines = csvText.split('\n');
  const results: SKMahasantri[] = [];

  lines.forEach((line, idx) => {
    if (idx === 0 && (line.toLowerCase().includes('nim') || line.toLowerCase().includes('nama'))) return; // header
    const cols = line.split(/[,;\t]/).map((c) => c.replace(/^["']|["']$/g, '').trim());

    if (cols.length >= 5) {
      // Expected: No, Nama, JK, NIM/NISN, Jenis, Fakultas, Jurusan
      const no = parseInt(cols[0], 10) || idx;
      const nama = cols[1];
      const jk = (cols[2].toUpperCase().startsWith('P') ? 'P' : 'L') as Gender;
      const nimNisn = cols[3];
      const jenis = cols[4] || 'Calon Mahasantri Baru';
      const fakultas = cols[5] || 'FITK';
      const jurusan = cols[6] || 'PAI';
      const isInt = jenis.toLowerCase().includes('internasional') || Boolean(cols[7]);

      if (nimNisn && nama) {
        results.push({
          no,
          nimNisn,
          nama,
          jenisKelamin: jk,
          jenisPendaftaran: isInt
            ? 'Mahasantri Internasional'
            : jenis.includes('Perpanjangan')
            ? 'Perpanjangan'
            : 'Calon Mahasantri Baru',
          fakultas,
          jurusan,
          asalNegara: isInt ? cols[7] || 'Internasional' : undefined,
          isInternasional: isInt,
          skNomor: SK_INFO.nomor,
        });
      }
    }
  });

  return results;
}
