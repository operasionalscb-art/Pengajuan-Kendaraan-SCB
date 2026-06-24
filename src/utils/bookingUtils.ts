import { Booking } from '../types';

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
