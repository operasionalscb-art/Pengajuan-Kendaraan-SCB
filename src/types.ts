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

export type TravelClassification =
  | 'Lomba'
  | 'Berobat / Kesehatan'
  | 'Dinas / Kunjungan'
  | 'Rapat / Koordinasi'
  | 'Logistik / Pengantaran'
  | 'Kegiatan Siswa / Outing'
  | 'Lainnya';

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
  klasifikasi_tujuan?: TravelClassification;
  tujuan: string;
  tujuan_kota_kabupaten?: string;
  jumlah_penumpang: number;
  daftar_penumpang: string[];
  status: BookingStatus;
  created_at: string;
  keterangan_tambahan?: string;
  tujuan_place_id?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
}

export type AppRole = 'Pemohon' | 'Operator' | 'Super Admin';

export interface UserProfile {
  email: string;
  nama: string;
  jabatan: string;
  role: AppRole;
  password?: string;
  status?: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak';
  permissions?: string[];
}

export interface EmailNotificationLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  recipientRole: string;
  subject: string;
  body: string;
  sentAt: string;
  triggerEvent: 'Pengajuan Baru' | 'Perubahan Status Peminjaman' | 'Pendaftaran Akun Baru' | 'Tes Notifikasi';
  status: 'Terkirim' | 'Gagal' | 'Pending';
  bookingId?: string;
}

export interface EmailSettings {
  operatorEmail: string;
  notifyNewBooking: boolean;
  notifyStatusChange: boolean;
  notifyUserRegistration: boolean;
  enableDirectMailto: boolean;
}
