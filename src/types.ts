export type VehicleType = 'Mobil Operasional' | 'Minibus' | 'Bus' | 'Pickup' | 'Lainnya';
export type VehicleStatus = 'Tersedia' | 'Dalam Perbaikan' | 'Nonaktif';

export interface Vehicle {
  id: string;
  nama_kendaraan: string;
  nomor_polisi: string;
  jenis: VehicleType;
  kapasitas: number;
  status: VehicleStatus;
}

export type BookingStatus = 'Draft' | 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak' | 'Selesai';

export interface Booking {
  id: string;
  kendaraan_id: string;
  tanggal_mulai: string; // YYYY-MM-DD
  tanggal_selesai: string; // YYYY-MM-DD
  jam_mulai: string; // HH:MM
  jam_selesai: string; // HH:MM
  penanggung_jawab: string;
  jabatan: string;
  kegiatan: string;
  tujuan: string;
  jumlah_penumpang: number;
  daftar_penumpang: string[];
  status: BookingStatus;
  created_at: string;
  keterangan_tambahan?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
}

export type AppRole = 'Pemohon' | 'Admin';
