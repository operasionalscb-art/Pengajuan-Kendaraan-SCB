import { Vehicle, Booking } from './types';

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: "V001",
    nama_kendaraan: "Toyota Avanza Silver SCB",
    nomor_polisi: "B 1412 SCB",
    jenis: "Mobil Operasional",
    kapasitas: 7,
    status: "Tersedia"
  },
  {
    id: "V002",
    nama_kendaraan: "Isuzu Elf Long Pariwisata",
    nomor_polisi: "B 7120 BZ",
    jenis: "Minibus",
    kapasitas: 19,
    status: "Tersedia"
  },
  {
    id: "V003",
    nama_kendaraan: "Bus Sekolah Medium Hino",
    nomor_polisi: "B 9001 SCB",
    jenis: "Bus",
    kapasitas: 35,
    status: "Tersedia"
  },
  {
    id: "V004",
    nama_kendaraan: "Mitsubishi L300 Cargo",
    nomor_polisi: "F 8231 BZ",
    jenis: "Pickup",
    kapasitas: 3,
    status: "Tersedia"
  },
  {
    id: "V005",
    nama_kendaraan: "Toyota Innova Zenix Hybrid",
    nomor_polisi: "B 1099 SCB",
    jenis: "Mobil Operasional",
    kapasitas: 7,
    status: "Dalam Perbaikan"
  },
  {
    id: "V006",
    nama_kendaraan: "Suzuki Carry Pick-Up Utility",
    nomor_polisi: "F 9109 SCV",
    jenis: "Lainnya",
    kapasitas: 2,
    status: "Nonaktif"
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "B-20260601",
    kendaraan_id: "V001",
    tanggal_mulai: "2026-06-10",
    tanggal_selesai: "2026-06-10",
    jam_mulai: "08:00",
    jam_selesai: "12:00",
    penanggung_jawab: "Ustadz Ahmad Fauzi",
    jabatan: "Guru Aqidah Akhlak / Humas SCB",
    kegiatan: "Pengantaran Berkas Kurikulum ke Kantor Pusat BAZNAS",
    tujuan: "Kantor BAZNAS RI, Matraman, Jakarta Timur",
    jumlah_penumpang: 3,
    daftar_penumpang: ["Ustadz Ahmad Fauzi", "Ustadz Ridwan", "Ibu Linda"],
    status: "Selesai",
    created_at: "2026-06-09T09:15:00Z",
    keterangan_tambahan: "Selesai tepat waktu, mobil dikembalikan dalam kondisi bersih."
  },
  {
    id: "B-20260602",
    kendaraan_id: "V002",
    tanggal_mulai: "2026-06-12",
    tanggal_selesai: "2026-06-12",
    jam_mulai: "07:00",
    jam_selesai: "17:00",
    penanggung_jawab: "Siti Aminah, S.Pd.",
    jabatan: "Wakil Kepala Sekolah Kesiswaan",
    kegiatan: "Lomba Pramuka Penggalang Tingkat Kabupaten",
    tujuan: "Bumi Perkemahan Cimandala, Bogor",
    jumlah_penumpang: 15,
    daftar_penumpang: [
      "Siti Aminah, S.Pd.",
      "Kak Junaedi (Pembina)",
      "Farhan (Siswa Kelas VIII)",
      "Rizky (Siswa Kelas VIII)",
      "Zuhdi (Siswa Kelas VIII)",
      "Fatih (Siswa Kelas VIII)",
      "Syamil (Siswa Kelas VII)",
      "Rayhan (Siswa Kelas VII)",
      "Akmal (Siswa Kelas VIII)",
      "Andika (Siswa Kelas VII)",
      "Haikal (Siswa Kelas VIII)",
      "Gibran (Siswa Kelas VII)",
      "Yusuf (Siswa Kelas VII)",
      "Naufal (Siswa Kelas VIII)",
      "Rafi (Siswa Kelas VIII)"
    ],
    status: "Disetujui",
    created_at: "2026-06-10T14:30:00Z",
    keterangan_tambahan: "Konsumsi dikoordinasikan oleh kesiswaan."
  },
  {
    id: "B-20260603",
    kendaraan_id: "V001",
    tanggal_mulai: "2026-06-13",
    tanggal_selesai: "2026-06-14",
    jam_mulai: "13:00",
    jam_selesai: "17:00",
    penanggung_jawab: "Dr. H. M. Yusuf",
    jabatan: "Kepala Sekolah Sekolah Cendekia BAZNAS",
    kegiatan: "Rapat Koordinasi Nasional Pendidikan BAZNAS",
    tujuan: "Pusdiklat BAZNAS, Caringin, Bogor",
    jumlah_penumpang: 4,
    daftar_penumpang: ["Dr. H. M. Yusuf", "Ibu Ratna (Kurikulum)", "Ustadz Anas", "Sopir (Pak Eko)"],
    status: "Menunggu Persetujuan",
    created_at: "2026-06-11T10:00:00Z",
    keterangan_tambahan: "Mohon diprioritaskan untuk kedinasan kepala sekolah."
  },
  {
    id: "B-20260604",
    kendaraan_id: "V004",
    tanggal_mulai: "2026-06-15",
    tanggal_selesai: "2026-06-15",
    jam_mulai: "09:00",
    jam_selesai: "14:00",
    penanggung_jawab: "Bambang Hermawan",
    jabatan: "Staf Sarana dan Prasarana (Sarpras)",
    kegiatan: "Pengambilan Donasi Hibah Buku Perpustakaan dan Sembako",
    tujuan: "Gudang Logistik Yayasan Amal Terang, Depok",
    jumlah_penumpang: 2,
    daftar_penumpang: ["Bambang Hermawan", "Pak Mamat (Helper)"],
    status: "Disetujui",
    created_at: "2026-06-11T08:22:00Z",
    keterangan_tambahan: "Butuh tali pengikat cadangan dan terpal pelindung hujan."
  },
  {
    id: "B-20260605",
    kendaraan_id: "V003",
    tanggal_mulai: "2026-06-08",
    tanggal_selesai: "2026-06-08",
    jam_mulai: "08:00",
    jam_selesai: "16:00",
    penanggung_jawab: "Ustadz Rahman Kurnia",
    jabatan: "Pembina Ekstrakurikuler Panahan",
    kegiatan: "Uji Tanding Persahabatan Antar Boarding School",
    tujuan: "Al-Kahfi Boarding School, Lido, Bogor",
    jumlah_penumpang: 30,
    daftar_penumpang: ["Ustadz Rahman Kurnia", "Siswa Tim Panahan SCB"],
    status: "Ditolak",
    created_at: "2026-06-06T11:05:00Z",
    keterangan_tambahan: "Ditolak karena Bus Sedang dalam perawatan berkala pada tanggal tersebut."
  },
  {
    id: "B-20260606",
    kendaraan_id: "V002",
    tanggal_mulai: "2026-06-19",
    tanggal_selesai: "2026-06-19",
    jam_mulai: "08:00",
    jam_selesai: "16:00",
    penanggung_jawab: "Hendra Wijaya, S.E.",
    jabatan: "Bendahara Sekolah & Keuangan",
    kegiatan: "Audit Keuangan Syariah Tahunan",
    tujuan: "Kantor Wilayah BAZNAS Provinsi Jawa Barat, Bandung",
    jumlah_penumpang: 5,
    daftar_penumpang: ["Hendra Wijaya, S.E.", "Ibu Nurhayati", "Ustadz Thariq", "Ibu Rini", "Pak Sopir"],
    status: "Menunggu Persetujuan",
    created_at: "2026-06-11T16:40:00Z",
    keterangan_tambahan: "Membawa boks dokumen keuangan penting."
  }
];
