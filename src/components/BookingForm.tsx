import React, { useState, useEffect } from 'react';
import { Vehicle, Booking, BookingStatus, UserProfile } from '../types';
import { checkBookingConflict, parseDateTime } from '../utils/bookingUtils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  Clock, 
  User, 
  Users, 
  MapPin, 
  Info, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  CalendarCheck2,
  BookmarkCheck,
  Check
} from 'lucide-react';

interface BookingFormProps {
  vehicles: Vehicle[];
  bookings: Booking[];
  onSubmitBooking: (booking: Omit<Booking, 'id' | 'created_at'>, asStatus: BookingStatus) => { success: boolean; message: string };
  onSuccess: () => void;
  currentUser?: UserProfile | null;
}

export default function BookingForm({ vehicles, bookings, onSubmitBooking, onSuccess, currentUser }: BookingFormProps) {
  // Field values
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('17:00');
  
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [jabatan, setJabatan] = useState('');

  // Auto-prefill penanggungJawab and jabatan if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setPenanggungJawab(currentUser.nama);
      setJabatan(currentUser.jabatan);
    }
  }, [currentUser]);
  const [kegiatan, setKegiatan] = useState('');
  const [tujuan, setTujuan] = useState('');
  const [keteranganTambahan, setKeteranganTambahan] = useState('');
  
  const [jumlahPenumpang, setJumlahPenumpang] = useState<number>(1);
  const [daftarPenumpang, setDaftarPenumpang] = useState<string[]>(['']);

  // Error and warnings check state
  const [capacityError, setCapacityError] = useState('');
  const [conflictWarning, setConflictWarning] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Success Popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [submittedBookingData, setSubmittedBookingData] = useState<{
    kegiatan: string;
    kendaraan: string;
    tanggal: string;
    jam: string;
    status: string;
    penanggungJawab: string;
  } | null>(null);

  const handleClosePopup = () => {
    setShowSuccessPopup(false);
    setSubmittedBookingData(null);
    setSuccessMsg('');
    setSelectedVehicleId('');
    setTanggalMulai('');
    setTanggalSelesai('');
    if (currentUser) {
      setPenanggungJawab(currentUser.nama);
      setJabatan(currentUser.jabatan);
    } else {
      setPenanggungJawab('');
      setJabatan('');
    }
    setKegiatan('');
    setTujuan('');
    setKeteranganTambahan('');
    setJumlahPenumpang(1);
    setDaftarPenumpang(['']);
    onSuccess();
  };

  // Find currently selected vehicle
  const activeVehicle = vehicles.find(v => v.id === selectedVehicleId);

  // Auto-fill passengers row matching counting
  useEffect(() => {
    if (jumlahPenumpang < 1) return;
    setDaftarPenumpang(prev => {
      const currentRows = [...prev];
      if (currentRows.length < jumlahPenumpang) {
        // Expand
        while (currentRows.length < jumlahPenumpang) {
          currentRows.push('');
        }
      } else if (currentRows.length > jumlahPenumpang) {
        // Shrink safely
        currentRows.splice(jumlahPenumpang);
      }
      return currentRows;
    });
  }, [jumlahPenumpang]);

  // Real-time capacity validation
  useEffect(() => {
    if (activeVehicle && jumlahPenumpang > activeVehicle.kapasitas) {
      setCapacityError(
        `PERINGATAN: Jumlah penumpang (${jumlahPenumpang} orang) melebihi kapasitas maksimal kendaraan ${activeVehicle.nama_kendaraan} (${activeVehicle.kapasitas} orang). Pengajuan tidak dapat disimpan.`
      );
    } else {
      setCapacityError('');
    }
  }, [activeVehicle, jumlahPenumpang]);

  // Real-time conflict preview
  useEffect(() => {
    if (selectedVehicleId && tanggalMulai && tanggalSelesai && jamMulai && jamSelesai) {
      const conflict = checkBookingConflict(
        {
          kendaraan_id: selectedVehicleId,
          tanggal_mulai: tanggalMulai,
          tanggal_selesai: tanggalSelesai,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesai,
        },
        bookings
      );

      if (conflict) {
        setConflictWarning(
          `BENTROK JADWAL: Kendaraan sudah dipesan untuk kegiatan: "${conflict.kegiatan}" oleh ${conflict.penanggung_jawab} pada ${conflict.tanggal_mulai} (${conflict.jam_mulai} - ${conflict.jam_selesai}).`
        );
      } else {
        setConflictWarning('');
      }
    } else {
      setConflictWarning('');
    }
  }, [selectedVehicleId, tanggalMulai, tanggalSelesai, jamMulai, jamSelesai, bookings]);

  const handlePassengerNameChange = (index: number, value: string) => {
    setDaftarPenumpang(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddPassengerRow = () => {
    setJumlahPenumpang(prev => prev + 1);
  };

  const handleRemovePassengerRow = (index: number) => {
    if (jumlahPenumpang <= 1) return;
    setJumlahPenumpang(prev => prev - 1);
    setDaftarPenumpang(prev => prev.filter((_, idx) => idx !== index));
  };

  // Form Submission
  const handleSubmit = (asStatus: BookingStatus) => {
    setGeneralError('');
    setSuccessMsg('');

    // Field-level simple validation
    if (!selectedVehicleId) {
      setGeneralError('Silakan pilih kendaraan terlebih dahulu.');
      return;
    }
    if (!tanggalMulai || !tanggalSelesai || !jamMulai || !jamSelesai) {
      setGeneralError('Lengkapi seluruh tanggal dan jam penggunaan.');
      return;
    }
    
    // Check start vs end times Chrono Order
    const startTs = parseDateTime(tanggalMulai, jamMulai);
    const endTs = parseDateTime(tanggalSelesai, jamSelesai);
    if (startTs >= endTs) {
      setGeneralError('Waktu selesai harus setelah waktu mulai peminjaman.');
      return;
    }

    if (!penanggungJawab.trim()) {
      setGeneralError('Nama penanggung jawab wajib diisi.');
      return;
    }
    if (!kegiatan.trim()) {
      setGeneralError('Detail kegiatan wajib diisi.');
      return;
    }
    if (!tujuan.trim()) {
      setGeneralError('Tujuan perjalanan wajib diisi.');
      return;
    }

    // Capacity Block (Active vehicle check)
    if (activeVehicle && jumlahPenumpang > activeVehicle.kapasitas) {
      setGeneralError(`Jumlah penumpang melebihi kapasitas kendaraan (${activeVehicle.kapasitas} kursi).`);
      return;
    }

    // Conflict Block
    // If saving as Draft, we can let them save but with a big warning label, but for 'Menunggu Persetujuan' we strictly reject!
    const conflict = checkBookingConflict(
      {
        kendaraan_id: selectedVehicleId,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
      },
      bookings
    );

    if (conflict && asStatus !== 'Draft') {
      setGeneralError(
        "Jadwal kendaraan bentrok dengan peminjaman lain. Silakan pilih kendaraan atau waktu yang berbeda."
      );
      return;
    }

    // Clean up empty passenger names
    const filteredPassengers = daftarPenumpang.filter(p => p.trim() !== '');

    // Submit
    const result = onSubmitBooking({
      kendaraan_id: selectedVehicleId,
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      jam_mulai: jamMulai,
      jam_selesai: jamSelesai,
      penanggung_jawab: penanggungJawab.trim(),
      jabatan: jabatan.trim() || 'Pegawai SCB',
      kegiatan: kegiatan.trim(),
      tujuan: tujuan.trim(),
      jumlah_penumpang: jumlahPenumpang,
      daftar_penumpang: filteredPassengers.length > 0 ? filteredPassengers : [penanggungJawab.trim()],
      status: asStatus,
      keterangan_tambahan: keteranganTambahan.trim()
    }, asStatus);

    if (result.success) {
      setSubmittedBookingData({
        kegiatan: kegiatan.trim(),
        kendaraan: activeVehicle?.nama_kendaraan || 'Kendaraan Operasional',
        tanggal: tanggalMulai === tanggalSelesai ? tanggalMulai : `${tanggalMulai} - ${tanggalSelesai}`,
        jam: `${jamMulai} - ${jamSelesai} WIB`,
        status: asStatus === 'Draft' ? 'Draft' : 'Menunggu Persetujuan',
        penanggungJawab: penanggungJawab.trim()
      });
      setShowSuccessPopup(true);
    } else {
      setGeneralError(result.message);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm p-6">
        <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-6">
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">Form Pengajuan Peminjaman Kendaraan</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Lengkapi rincian berikut untuk mendaftarkan jadwal peminjaman kendaraan operasional Sekolah Cendekia BAZNAS (SCB).</p>
        </div>

        {/* Message Banner alerts */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl flex items-start gap-3 text-emerald-800 dark:text-emerald-300 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {generalError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start gap-3 text-red-800 dark:text-red-400 text-sm font-bold">
            <AlertTriangle className="w-5 h-5 text-red-650 dark:text-red-400 shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          
          {/* SECTOR 1: Data Kendaraan & Jadwal */}
          <div>
            <span className="inline-flex items-center gap-1 bg-[#0F8A5F]/10 text-[#0F8A5F] dark:bg-[#0F8A5F]/20 dark:text-emerald-400 px-2.5 py-1 rounded-full text-xs font-extrabold mb-4">
              <Car className="w-3.5 h-3.5" /> Bagian 1: Data Kendaraan & Jadwal
            </span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dropdown Kendaraan */}
              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">Pilih Kendaraan Operasional <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-800 dark:text-neutral-100 outline-none focus:border-[#0F8A5F] focus:ring-1 focus:ring-[#0F8A5F]/20 transition"
                  >
                    <option value="">-- Pilih Kendaraan --</option>
                    {vehicles.map((v) => (
                      <option 
                        key={v.id} 
                        value={v.id}
                        disabled={v.status === 'Nonaktif'}
                        className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100"
                      >
                        {v.nama_kendaraan} ({v.nomor_polisi}) - Kapasitas: {v.kapasitas} orang [{v.status}]
                      </option>
                    ))}
                  </select>
                </div>
                {activeVehicle && (
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-450 font-medium">
                    Jenis: <span className="font-bold text-neutral-700 dark:text-neutral-300">{activeVehicle.jenis}</span> • Kapasitas: <span className="font-bold text-neutral-700 dark:text-neutral-300">{activeVehicle.kapasitas} orang</span>
                  </p>
                )}
              </div>

              {/* Tanggal & Jam Mulai */}
              <div className="bg-neutral-50/50 dark:bg-neutral-850 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-3">
                <p className="text-xs font-bold text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" /> Keberangkatan (Mulai)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold block">Tanggal <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={tanggalMulai}
                      onChange={(e) => setTanggalMulai(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs outline-none focus:border-[#0F8A5F] text-neutral-800 dark:text-neutral-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold block">Jam Keberangkatan <span className="text-red-500">*</span></label>
                    <input
                      type="time"
                      value={jamMulai}
                      onChange={(e) => setJamMulai(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs outline-none focus:border-[#0F8A5F] text-neutral-800 dark:text-neutral-100"
                    />
                  </div>
                </div>
              </div>

              {/* Tanggal & Jam Selesai */}
              <div className="bg-neutral-50/50 dark:bg-neutral-850 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-3">
                <p className="text-xs font-bold text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" /> Kepulangan (Selesai)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold block">Tanggal <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={tanggalSelesai}
                      onChange={(e) => setTanggalSelesai(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs outline-none focus:border-[#0F8A5F] text-neutral-800 dark:text-neutral-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold block">Jam Kepulangan <span className="text-red-500">*</span></label>
                    <input
                      type="time"
                      value={jamSelesai}
                      onChange={(e) => setJamSelesai(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs outline-none focus:border-[#0F8A5F] text-neutral-800 dark:text-neutral-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Warn real-time collision */}
            {conflictWarning && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-xs text-red-900 dark:text-red-350 font-semibold flex items-start gap-2 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-red-650 dark:text-red-400 shrink-0 mt-0.5" />
                <span>{conflictWarning} <strong className="text-red-700 dark:text-red-450 block mt-1">Jadwal kendaraan bentrok dengan peminjaman lain. Silakan pilih kendaraan atau waktu yang berbeda.</strong></span>
              </div>
            )}
          </div>

          {/* SECTOR 2: Penanggung Jawab & Kegiatan */}
          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
            <span className="inline-flex items-center gap-1 bg-[#0F8A5F]/10 text-[#0F8A5F] dark:bg-[#0F8A5F]/20 dark:text-emerald-400 px-2.5 py-1 rounded-full text-xs font-extrabold mb-4">
              <FileText className="w-3.5 h-3.5" /> Bagian 2: Penanggung Jawab & Informasi Kegiatan
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">Nama Penanggung Jawab <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={penanggungJawab}
                    onChange={(e) => setPenanggungJawab(e.target.value)}
                    placeholder="Contoh: Siti Aminah, S.Pd."
                    className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm outline-none focus:border-[#0F8A5F] text-neutral-800 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">Jabatan <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Contoh: Wakasek Bidang Kesiswaan"
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm outline-none focus:border-[#0F8A5F] text-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">Nama / Deskripsi Kegiatan <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={kegiatan}
                  onChange={(e) => setKegiatan(e.target.value)}
                  placeholder="Contoh: Lomba Pramuka Penggalang Tingkat Kabupaten"
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm outline-none focus:border-[#0F8A5F] text-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">Tujuan Perjalanan / Lokasi Tujuan <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={tujuan}
                    onChange={(e) => setTujuan(e.target.value)}
                    placeholder="Contoh: Bumi Perkemahan Cimandala, Sukaraja, Bogor"
                    className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm outline-none focus:border-[#0F8A5F] text-neutral-800 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">Keterangan Tambahan / Catatan Khusus (Optional)</label>
                <textarea
                  rows={2}
                  value={keteranganTambahan}
                  onChange={(e) => setKeteranganTambahan(e.target.value)}
                  placeholder="Tuliskan jika butuh driver cadangan, kebutuhan membawa logistik tambahan, dsb."
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm outline-none focus:border-[#0F8A5F] text-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>
          </div>

          {/* SECTOR 3: Penumpang */}
          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1 bg-[#0F8A5F]/10 text-[#0F8A5F] dark:bg-[#0F8A5F]/20 dark:text-emerald-400 px-2.5 py-1 rounded-full text-xs font-extrabold">
                <Users className="w-3.5 h-3.5" /> Bagian 3: Daftar Rincian Penumpang
              </span>

              {/* Passenger warning capacity count */}
              {activeVehicle && (
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase">
                  Maksimal Kapasitas: {activeVehicle.kapasitas} Orang
                </span>
              )}
            </div>

            {/* Dynamic passenger counts input */}
            <div className="bg-neutral-50 dark:bg-neutral-850 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">Jumlah Penumpang Bersama Sopir</label>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">Batas maksimum disesuaikan dengan jenis kendaraan yang dipilih.</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={activeVehicle ? activeVehicle.kapasitas + 5 : 100} // Let them input to trigger validation warnings
                  value={jumlahPenumpang}
                  onChange={(e) => setJumlahPenumpang(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm font-bold text-center outline-none focus:border-[#0F8A5F] text-neutral-800 dark:text-neutral-100"
                />
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Orang</span>
              </div>
            </div>

            {/* Capacity Warning */}
            {capacityError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-xs text-red-900 dark:text-red-350 font-semibold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-650 dark:text-red-400 shrink-0 mt-0.5" />
                <span>{capacityError}</span>
              </div>
            )}

            {/* List names rows */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">Rincian Nama-Nama Penumpang ({daftarPenumpang.length} Baris)</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[180px] overflow-y-auto p-1 border border-neutral-150 dark:border-neutral-850 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50">
                {daftarPenumpang.map((passenger, index) => (
                  <div key={index} className="flex items-center gap-1 bg-white dark:bg-neutral-800 p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-2xs">
                    <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-700 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={passenger}
                      onChange={(e) => handlePassengerNameChange(index, e.target.value)}
                      placeholder={`Nama Penumpang ${index + 1}`}
                      className="flex-1 bg-transparent border-none outline-none text-xs text-neutral-700 dark:text-neutral-200 placeholder-neutral-300 dark:placeholder-neutral-500 font-semibold px-1 py-0.5"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePassengerRow(index)}
                      className="p-1 text-neutral-350 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition duration-100 cursor-pointer"
                      title="Hapus baris"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add dynamic rows */}
              <button
                type="button"
                onClick={handleAddPassengerRow}
                disabled={activeVehicle ? jumlahPenumpang >= activeVehicle.kapasitas : false}
                className="mt-2 flex items-center justify-center gap-2 py-1.5 px-3 bg-[#0F8A5F]/5 dark:bg-[#0F8A5F]/15 text-[#0F8A5F] dark:text-emerald-400 hover:bg-[#0F8A5F]/10 dark:hover:bg-[#0F8A5F]/25 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Penumpang (+1)
              </button>
            </div>
          </div>

          {/* Form Actions Footer buttons */}
          <div className="border-t border-neutral-150 dark:border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-end gap-3">
            {/* Save as Draft */}
            <button
              type="button"
              onClick={() => handleSubmit('Draft')}
              className="w-full sm:w-auto px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-750 dark:text-neutral-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 border border-neutral-200 dark:border-neutral-700"
            >
              Simpan ke Draft
            </button>

            {/* Submit directly */}
            <button
              type="button"
              onClick={() => handleSubmit('Menunggu Persetujuan')}
              disabled={!!capacityError || !!conflictWarning}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#0F8A5F] hover:bg-[#0a6344] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#0F8A5F]/20"
            >
              Kirim Pengajuan
            </button>
          </div>
        </form>
      </div>

      {/* SUCCESS OVERLAY POPUP NOTIFICATION */}
      <AnimatePresence>
        {showSuccessPopup && submittedBookingData && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-100 dark:border-neutral-800 p-6 sm:p-8 max-w-md w-full overflow-hidden text-center space-y-6 relative"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl -z-10" />

              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-[#0F8A5F] dark:text-emerald-450 rounded-full flex items-center justify-center shadow-inner relative">
                  <div className="absolute inset-0 bg-emerald-400/10 rounded-full animate-ping opacity-75" />
                  {submittedBookingData.status === 'Draft' ? (
                    <BookmarkCheck className="w-8 h-8 relative" />
                  ) : (
                    <CalendarCheck2 className="w-8 h-8 relative" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight">
                    {submittedBookingData.status === 'Draft' ? 'Draft Berhasil Disimpan!' : 'Pengajuan Berhasil Terkirim!'}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
                    {submittedBookingData.status === 'Draft' 
                      ? 'Draf pengajuan Anda berhasil dicatat dalam sistem.' 
                      : 'Permohonan peminjaman kendaraan Anda menunggu tinjauan admin.'}
                  </p>
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-850 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 text-left text-xs space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    submittedBookingData.status === 'Draft' 
                      ? 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300' 
                      : 'bg-yellow-100 text-yellow-850 dark:bg-yellow-950/30 dark:text-yellow-400'
                  }`}>
                    {submittedBookingData.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider block">Kegiatan</span>
                  <p className="font-extrabold text-neutral-800 dark:text-neutral-200 line-clamp-2 leading-tight">{submittedBookingData.kegiatan}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider block">Kendaraan</span>
                    <p className="font-bold text-neutral-700 dark:text-neutral-300 truncate">{submittedBookingData.kendaraan}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider block">P. Jawab</span>
                    <p className="font-bold text-neutral-700 dark:text-neutral-300 truncate">{submittedBookingData.penanggungJawab}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-neutral-500 dark:text-neutral-400 font-bold text-[10px]">
                  <span>{submittedBookingData.tanggal}</span>
                  <span>{submittedBookingData.jam}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClosePopup}
                  className="w-full py-3 bg-[#0F8A5F] hover:bg-[#0a6344] text-white font-extrabold text-sm rounded-2xl transition duration-150 shadow-lg shadow-[#0F8A5F]/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Oke, Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
