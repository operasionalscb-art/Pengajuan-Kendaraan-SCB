import { Booking, TravelClassification } from '../types';

export const TRAVEL_CLASSIFICATIONS: TravelClassification[] = [
  'Lomba',
  'Berobat / Kesehatan',
  'Dinas / Kunjungan',
  'Rapat / Koordinasi',
  'Logistik / Pengantaran',
  'Kegiatan Siswa / Outing',
  'Lainnya',
];

export const TRAVEL_CLASSIFICATION_COLORS: Record<TravelClassification, string> = {
  'Lomba': '#0F8A5F',
  'Berobat / Kesehatan': '#E11D48',
  'Dinas / Kunjungan': '#2563EB',
  'Rapat / Koordinasi': '#7C3AED',
  'Logistik / Pengantaran': '#D97706',
  'Kegiatan Siswa / Outing': '#0D9488',
  'Lainnya': '#64748B',
};

export function detectTravelClassification(kegiatan: string): TravelClassification {
  const text = (kegiatan || '').toLowerCase();
  if (!text.trim()) return 'Lainnya';

  if (/\b(berobat|sakit|rs|rsud|rsu|klinik|puskesmas|dokter|igd|ugd|kesehatan|medis|periksa|kontrol|gigi|mata|apotek|rawat|cek\s?kesehatan)\b/.test(text)) {
    return 'Berobat / Kesehatan';
  }
  if (/\b(lomba|olimpiade|kompetisi|kejuaraan|turnamen|tanding|perlombaan|festival|piala|juara|osn|o2sn|fls2n|ksm|mtq|pospeda)\b/.test(text)) {
    return 'Lomba';
  }
  if (/\b(rapat|koordinasi|rakor|rakornas|meeting|musyawarah|briefing|evaluasi|audit|keuangan|kurikulum)\b/.test(text)) {
    return 'Rapat / Koordinasi';
  }
  if (/\b(donasi|logistik|barang|berkas|dokumen|sembako|buku|antar|pengantaran|jemput|penjemputan|ambil|pengambilan|kirim|pengiriman|sarpras|belanja|perlengkapan|inventaris)\b/.test(text)) {
    return 'Logistik / Pengantaran';
  }
  if (/\b(dinas|kunjungan|silaturahmi|baznas|kementerian|tamu|undangan|sosialisasi|pelatihan|workshop|seminar|pusdiklat|monitoring|survei|survey|studi\s?banding)\b/.test(text)) {
    return 'Dinas / Kunjungan';
  }
  if (/\b(pramuka|siswa|santri|ekskul|ekstrakurikuler|wisuda|kemah|outing|study\s?tour|ujian|pmb|ppdb|asrama|pesantren|tasmi|munaqosyah)\b/.test(text)) {
    return 'Kegiatan Siswa / Outing';
  }
  return 'Lainnya';
}

export function classifyTravelPurpose(
  kegiatan: string,
  explicitClassification?: string
): TravelClassification {
  const cleaned = (explicitClassification || '').trim() as TravelClassification;
  if (TRAVEL_CLASSIFICATIONS.includes(cleaned)) {
    return cleaned;
  }
  return detectTravelClassification(kegiatan);
}

/**
 * Converts a date and time string into a millisecond timestamp
 * @param dateStr Format: YYYY-MM-DD
 * @param timeStr Format: HH:MM
 */
export function parseDateTime(dateStr: string, timeStr: string): number {
  // Safe parsing
  const cleanDate = dateStr.trim();
  const cleanTime = timeStr.trim() || "00:00";
  return new Date(`${cleanDate}T${cleanTime}`).getTime();
}

/**
 * Checks if two datetime ranges overlap
 */
export function isOverlapping(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  // Overlap occurs if start1 < end2 AND start2 < end1
  return start1 < end2 && start2 < end1;
}

/**
 * Verifies if a proposed booking overlaps with any existing active bookings of the same vehicle.
 * @param proposed proposed booking data (ignoring its own ID if editing)
 * @param existingBookings current list of all bookings in the system
 * @returns The conflicting booking if an overlap is found, or null
 */
export function checkBookingConflict(
  proposed: {
    id?: string;
    kendaraan_id: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    jam_mulai: string;
    jam_selesai: string;
  },
  existingBookings: Booking[]
): Booking | null {
  const pStart = parseDateTime(proposed.tanggal_mulai, proposed.jam_mulai);
  const pEnd = parseDateTime(proposed.tanggal_selesai, proposed.jam_selesai);

  // Validate start is before end
  if (pStart >= pEnd) {
    return null; // Form validation should capture this first, but return null for conflict purposes
  }

  for (const ext of existingBookings) {
    // If it's the exact same booking being updated, or is Draft/Ditolak/Selesai, skip checking
    if (ext.id === proposed.id) continue;
    if (ext.status === 'Ditolak' || ext.status === 'Draft' || ext.status === 'Selesai') continue;

    // Check if the vehicles are the same
    if (ext.kendaraan_id === proposed.kendaraan_id) {
      const extStart = parseDateTime(ext.tanggal_mulai, ext.jam_mulai);
      const extEnd = parseDateTime(ext.tanggal_selesai, ext.jam_selesai);

      if (isOverlapping(pStart, pEnd, extStart, extEnd)) {
        return ext;
      }
    }
  }

  return null;
}

/**
 * Returns the Indonesian day name for a YYYY-MM-DD date string.
 * If start and end dates are provided and different, returns a range e.g. "Senin - Rabu".
 */
export function getHariIndonesian(tanggalMulai: string, tanggalSelesai?: string): string {
  const parseHari = (str: string) => {
    if (!str) return '';
    const parts = str.trim().split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      return days[date.getDay()] || '';
    }
    return '';
  };

  const hariMulai = parseHari(tanggalMulai);
  if (!tanggalSelesai || tanggalSelesai === tanggalMulai) {
    return hariMulai || '-';
  }
  const hariSelesai = parseHari(tanggalSelesai);
  if (hariSelesai && hariSelesai !== hariMulai) {
    return `${hariMulai} - ${hariSelesai}`;
  }
  return hariMulai || '-';
}
