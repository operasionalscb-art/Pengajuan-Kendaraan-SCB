import { EmailNotificationLog, Booking, UserProfile } from '../types';
import { addEmailLog } from './firebase';

export async function sendOperatorEmailNotification({
  recipientEmail,
  recipientName = 'Operator Sarpras',
  recipientRole = 'Operator',
  subject,
  body,
  triggerEvent,
  bookingId
}: {
  recipientEmail: string;
  recipientName?: string;
  recipientRole?: string;
  subject: string;
  body: string;
  triggerEvent: EmailNotificationLog['triggerEvent'];
  bookingId?: string;
}): Promise<EmailNotificationLog> {
  const d = new Date();
  const formattedTime = d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const newLog: EmailNotificationLog = {
    id: `MAIL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    recipientEmail,
    recipientName,
    recipientRole,
    subject,
    body,
    sentAt: formattedTime,
    triggerEvent,
    status: 'Terkirim',
    ...(bookingId ? { bookingId } : {})
  };

  try {
    await addEmailLog(newLog);
  } catch (err) {
    console.error('Gagal menyimpan log email ke Firestore:', err);
  }

  return newLog;
}

export function buildNewBookingEmailBody(booking: Booking, vehicleName?: string): { subject: string; body: string } {
  const subject = `[SCB-GO Alert] Pengajuan Peminjaman Baru: ${booking.kegiatan} (${booking.penanggung_jawab})`;
  
  const body = `Yth. Tim Operator / Sarpras Sekolah Cendekia BAZNAS,

Terdapat PENGAJUAN PEMINJAMAN KENDARAAN OPERASIONAL BARU yang membutuhkan persetujuan/peninjauan Anda:

--- DETAIL PENGAJUAN ---
• ID Peminjaman    : ${booking.id}
• Penanggung Jawab : ${booking.penanggung_jawab} (${booking.jabatan})
• Nama Kegiatan    : ${booking.kegiatan}
• Kendaraan        : ${vehicleName || 'Kendaraan Operasional'}
• Tanggal / Jam    : ${booking.tanggal_mulai} s.d ${booking.tanggal_selesai} | Pukul ${booking.jam_mulai} - ${booking.jam_selesai} WIB
• Tujuan Perjalanan: ${booking.tujuan}${booking.tujuan_kota_kabupaten ? `\n• Kota / Kabupaten : ${booking.tujuan_kota_kabupaten}` : ''}
• Jumlah Penumpang : ${booking.jumlah_penumpang} orang
• Catatan Tambahan : ${booking.keterangan_tambahan || '-'}

Silakan buka aplikasi SCB-GO untuk menyetujui atau menolak pengajuan ini.

--
Pusat Layanan Sarana & Prasarana
Sekolah Cendekia BAZNAS (SCB-GO)`;

  return { subject, body };
}

export function buildStatusChangeEmailBody(booking: Booking, newStatus: string, vehicleName?: string): { subject: string; body: string } {
  const subject = `[SCB-GO Info] Update Status Peminjaman ${newStatus.toUpperCase()}: ${booking.kegiatan}`;
  
  const body = `Yth. Bapak/Ibu ${booking.penanggung_jawab} & Tim Operator Sarpras,

Status peminjaman kendaraan operasional berikut telah diperbarui:

--- RINGKASAN STATUS ---
• ID Peminjaman     : ${booking.id}
• Kegiatan          : ${booking.kegiatan}
• Kendaraan         : ${vehicleName || 'Kendaraan Operasional'}
• Status Terbaru    : ${newStatus.toUpperCase()}
• Tanggal / Waktu   : ${booking.tanggal_mulai} (${booking.jam_mulai} WIB)
• Tujuan Perjalanan : ${booking.tujuan}${booking.tujuan_kota_kabupaten ? `\n• Kota / Kabupaten  : ${booking.tujuan_kota_kabupaten}` : ''}

Catatan:
${newStatus === 'Disetujui' 
  ? 'Pengajuan Anda telah DISETUJUI. Silakan koordinasi dengan Operator Sarpras untuk pengambilan kunci dan surat jalan.' 
  : newStatus === 'Ditolak' 
  ? 'Mohon maaf, pengajuan ini DITOLAK oleh Operator/Admin. Silakan periksa ketersediaan kendaraan pada jadwal lain.' 
  : 'Peminjaman telah diselesaikan. Terima kasih telah menjaga kebersihan dan kelengkapan armada.'}

--
Tim Sarana Prasarana Sekolah Cendekia BAZNAS`;

  return { subject, body };
}

export function buildNewUserRegistrationEmailBody(user: UserProfile): { subject: string; body: string } {
  const subject = `[SCB-GO Alert] Pendaftaran Akun Baru Menunggu Approval: ${user.nama}`;
  
  const body = `Yth. Super Admin / Operator Sarpras,

Pengguna baru telah mendaftar di sistem SCB-GO dan memerlukan verifikasi persetujuan (approval) Anda:

--- DETAIL PEGAWAI ---
• Nama Lengkap : ${user.nama}
• Jabatan / Staf: ${user.jabatan}
• Alamat Email  : ${user.email}
• Usulan Role   : ${user.role}
• Status Akun   : Menunggu Persetujuan

Silakan masuk ke menu 'Akses & Akun' pada aplikasi SCB-GO untuk menyetujui pendaftaran ini.

--
Sistem Notifikasi Akun SCB-GO`;

  return { subject, body };
}
