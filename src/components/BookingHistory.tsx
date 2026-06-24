import React, { useState } from 'react';
import { Booking, Vehicle, BookingStatus, AppRole } from '../types';
import { 
  History, 
  Search, 
  Filter, 
  Trash2, 
  Check, 
  X, 
  Calendar, 
  Eye, 
  Clock, 
  User, 
  Briefcase, 
  MapPin, 
  CheckCircle2, 
  RefreshCcw, 
  Download,
  AlertTriangle
} from 'lucide-react';
import { checkBookingConflict } from '../utils/bookingUtils';

interface BookingHistoryProps {
  bookings: Booking[];
  vehicles: Vehicle[];
  currentRole: AppRole;
  onUpdateStatus: (bookingId: string, newStatus: BookingStatus) => void;
  onDeleteBooking: (bookingId: string) => void;
  onUpdateBookingTime: (bookingId: string, tanggalMulai: string, jamMulai: string, tanggalSelesai: string, jamSelesai: string) => { success: boolean; message: string };
}

export default function BookingHistory({
  bookings,
  vehicles,
  currentRole,
  onUpdateStatus,
  onDeleteBooking,
  onUpdateBookingTime
}: BookingHistoryProps) {
  // Filter variables
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected details or Edit time dialog modals
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editTanggalMulai, setEditTanggalMulai] = useState('');
  const [editJamMulai, setEditJamMulai] = useState('');
  const [editTanggalSelesai, setEditTanggalSelesai] = useState('');
  const [editJamSelesai, setEditJamSelesai] = useState('');
  const [editConflictErr, setEditConflictErr] = useState('');

  // Clear filters
  const resetFilters = () => {
    setSearchQuery('');
    setFilterVehicle('all');
    setFilterStatus('all');
    setFilterStartDate('');
    setFilterEndDate('');
    setCurrentPage(1);
  };

  // Safe checks & Filtering
  const filteredBookings = bookings.filter((b) => {
    const vehicle = vehicles.find((v) => v.id === b.kendaraan_id);
    
    // Search by vehicle name, plate, penanggung jawab, or kegiatan
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      b.penanggung_jawab.toLowerCase().includes(query) ||
      b.kegiatan.toLowerCase().includes(query) ||
      b.tujuan.toLowerCase().includes(query) ||
      vehicle?.nama_kendaraan.toLowerCase().includes(query) ||
      vehicle?.nomor_polisi.toLowerCase().includes(query);

    // Filter by vehicle dropdown
    const matchesVehicle = filterVehicle === 'all' || b.kendaraan_id === filterVehicle;

    // Filter by status dropdown
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;

    // Filter by date ranges
    const matchesDateRange = (!filterStartDate || b.tanggal_mulai >= filterStartDate) &&
                             (!filterEndDate || b.tanggal_selesai <= filterEndDate);

    return matchesSearch && matchesVehicle && matchesStatus && matchesDateRange;
  });

  // Paginated elements
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'Draft':
        return <span className="text-[10px] bg-neutral-100 text-neutral-600 font-bold uppercase py-1 px-2.5 rounded-full border border-neutral-300">Draft</span>;
      case 'Menunggu Persetujuan':
        return <span className="text-[10px] bg-yellow-50 text-yellow-700 font-extrabold uppercase py-1 px-2.5 rounded-full border border-yellow-200 animate-pulse">Menunggu Persetujuan</span>;
      case 'Disetujui':
        return <span className="text-[10px] bg-green-50 text-[#0F8A5F] font-bold uppercase py-1 px-2.5 rounded-full border border-green-200">Disetujui</span>;
      case 'Ditolak':
        return <span className="text-[10px] bg-red-50 text-red-700 font-bold uppercase py-1 px-2.5 rounded-full border border-red-200">Ditolak</span>;
      case 'Selesai':
        return <span className="text-[10px] bg-blue-50 text-blue-700 font-bold uppercase py-1 px-2.5 rounded-full border border-blue-200">Selesai</span>;
      default:
        return <span className="text-[10px] bg-slate-100 text-slate-600 font-bold uppercase py-1 px-2.5 rounded-full">{status}</span>;
    }
  };

  const handleOpenEdit = (b: Booking) => {
    setEditingBooking(b);
    setEditTanggalMulai(b.tanggal_mulai);
    setEditJamMulai(b.jam_mulai);
    setEditTanggalSelesai(b.tanggal_selesai);
    setEditJamSelesai(b.jam_selesai);
    setEditConflictErr('');
  };

  const handleSaveEditTime = () => {
    if (!editingBooking) return;
    setEditConflictErr('');

    // Check conflict
    const conflict = checkBookingConflict({
      id: editingBooking.id,
      kendaraan_id: editingBooking.kendaraan_id,
      tanggal_mulai: editTanggalMulai,
      tanggal_selesai: editTanggalSelesai,
      jam_mulai: editJamMulai,
      jam_selesai: editJamSelesai
    }, bookings);

    if (conflict) {
      setEditConflictErr(
        `Jadwal kendaraan bentrok dengan peminjaman lain. Silakan pilih kendaraan atau waktu yang berbeda.`
      );
      return;
    }

    const res = onUpdateBookingTime(
      editingBooking.id,
      editTanggalMulai,
      editJamMulai,
      editTanggalSelesai,
      editJamSelesai
    );

    if (res.success) {
      setEditingBooking(null);
    } else {
      setEditConflictErr(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters panel */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm p-6" id="filters-container">
        <div className="flex items-center justify-between border-b border-neutral-150 dark:border-neutral-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#0F8A5F] dark:text-emerald-400" />
            <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-100">Cari & Filter Riwayat Peminjaman</h3>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-[#0F8A5F] dark:hover:text-emerald-400 hover:underline font-bold"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="space-y-1 sm:col-span-1 md:col-span-2">
            <label className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase">Cari (Penanggung Jawab, Kegiatan, No. Polisi)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Ketik kata kunci pencarian..."
                className="w-full text-xs pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:border-[#0F8A5F] text-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Vehicle Dropdown */}
          <div className="space-y-1 col-span-1">
            <label className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase">Pilih Kendaraan</label>
            <select
              value={filterVehicle}
              onChange={(e) => { setFilterVehicle(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:border-[#0F8A5F] text-neutral-800 dark:text-neutral-100"
            >
              <option value="all" className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">Semua Kendaraan</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id} className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">{v.nama_kendaraan}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="space-y-1 col-span-1">
            <label className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase">Status Pengajuan</label>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:border-[#0F8A5F] text-neutral-800 dark:text-neutral-100"
            >
              <option value="all" className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">Semua Status</option>
              <option value="Draft" className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">Draft</option>
              <option value="Menunggu Persetujuan" className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">Menunggu Persetujuan</option>
              <option value="Disetujui" className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">Disetujui</option>
              <option value="Ditolak" className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">Ditolak</option>
              <option value="Selesai" className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">Selesai</option>
            </select>
          </div>

          {/* Date range start */}
          <div className="space-y-1 col-span-1 border-t border-neutral-100 dark:border-neutral-800 sm:border-0 pt-2 sm:pt-0">
            <label className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase">Rentang Dari Tanggal</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => { setFilterStartDate(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:border-[#0F8A5F] text-neutral-800 dark:text-neutral-100"
            />
          </div>

          {/* Date range end */}
          <div className="space-y-1 col-span-1 pt-2 sm:pt-0">
            <label className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase">Rentang Sampai Tanggal</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => { setFilterEndDate(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:border-[#0F8A5F] text-neutral-800 dark:text-neutral-100"
            />
          </div>
        </div>
      </div>

      {/* Bookings Display Area */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden p-6">
        <div className="flex items-center justify-between border-b border-neutral-150 dark:border-neutral-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#0F8A5F] dark:text-emerald-400" />
            <div>
              <h3 className="font-bold text-base text-neutral-800 dark:text-neutral-100">Daftar Reservasi Log</h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-400">Ditemukan {totalItems} pengajuan yang sesuai filter</p>
            </div>
          </div>
        </div>

        {visibleBookings.length === 0 ? (
          <div className="text-center py-12 px-4 whitespace-normal">
            <div className="bg-neutral-50 dark:bg-neutral-850 text-neutral-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-neutral-500 dark:text-neutral-350 font-bold text-sm">Tidak ditemukan data peminjaman.</p>
            <p className="text-neutral-400 dark:text-neutral-500 text-xs mt-1">Ubah atau bersihkan kata kunci filter pencarian Anda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-850 text-[10px] font-extrabold uppercase text-neutral-400 dark:text-neutral-500 tracking-wider text-left border-b border-neutral-200 dark:border-neutral-800">
                    <th className="py-3 px-4">Detail Pengajuan</th>
                    <th className="py-3 px-4">Kendaraan</th>
                    <th className="py-3 px-4">Tanggal Penggunaan</th>
                    <th className="py-3 px-4">Penanggung Jawab</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Opsi Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {visibleBookings.map((b) => {
                    const vehicle = vehicles.find((v) => v.id === b.kendaraan_id);
                    return (
                      <tr key={b.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition">
                        {/* Detail */}
                        <td className="py-4 px-4 max-w-[200px]">
                          <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate" title={b.kegiatan}>{b.kegiatan}</p>
                          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono mt-0.5">{b.id} • {b.jumlah_penumpang} penumpang</p>
                        </td>

                        {/* Vehicle details */}
                        <td className="py-4 px-4">
                          <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{vehicle?.nama_kendaraan || "Dihapus"}</p>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-450 font-mono mt-0.5">{vehicle?.nomor_polisi}</p>
                        </td>

                        {/* Schedule times */}
                        <td className="py-4 px-4">
                          <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{b.tanggal_mulai}</p>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-450 mt-0.5">{b.jam_mulai} - {b.jam_selesai} WIB</p>
                        </td>

                        {/* Supervisor name and sub */}
                        <td className="py-4 px-4">
                          <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{b.penanggung_jawab}</p>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-450 truncate max-w-[120px]">{b.jabatan}</p>
                        </td>

                        {/* Status tag */}
                        <td className="py-4 px-4">
                          {getStatusBadge(b.status)}
                        </td>

                        {/* Administrative action handles */}
                        <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {/* Viewer Details */}
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(b)}
                            className="p-1 px-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer border border-neutral-200 dark:border-neutral-700"
                            title="Rincian"
                          >
                            <Eye className="w-3.5 h-3.5" /> Lihat
                          </button>

                          {/* Admin actions: Approve / Reject / Complete */}
                          {currentRole === 'Admin' && (
                            <>
                              {b.status === 'Draft' && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateStatus(b.id, 'Menunggu Persetujuan')}
                                  className="p-1 px-2.5 bg-yellow-100 hover:bg-yellow-250 dark:bg-yellow-950/20 dark:hover:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                                  title="Ajukan Persetujuan"
                                >
                                  Ajukan
                                </button>
                              )}

                              {b.status === 'Menunggu Persetujuan' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onUpdateStatus(b.id, 'Disetujui')}
                                    className="p-1 px-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                                    title="Setujui Pengajuan"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Setujui
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onUpdateStatus(b.id, 'Ditolak')}
                                    className="p-1 px-2 bg-red-100 hover:bg-red-200 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                                    title="Tolak Pengajuan"
                                  >
                                    <X className="w-3.5 h-3.5" /> Tolak
                                  </button>
                                </>
                              )}

                              {b.status === 'Disetujui' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onUpdateStatus(b.id, 'Selesai')}
                                    className="p-1 px-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/20 dark:hover:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                                    title="Selesaikan Perjalanan"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(b)}
                                    className="p-1 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer border border-neutral-200 dark:border-neutral-700"
                                    title="Ubah Jadwal"
                                  >
                                    Ubah Waktu
                                  </button>
                                </>
                              )}

                              <button
                                type="button"
                                onClick={() => onDeleteBooking(b.id)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 dark:bg-red-950/20 dark:hover:bg-red-900/30 dark:text-red-400 rounded-lg transition inline-flex items-center cursor-pointer"
                                title="Hapus Pengajuan"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Responsive View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
              {visibleBookings.map((b) => {
                const vehicle = vehicles.find((v) => v.id === b.kendaraan_id);
                return (
                  <div key={b.id} className="bg-neutral-50 dark:bg-neutral-850 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 space-y-3">
                    <div className="flex items-start justify-between gap-1">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 leading-tight">{b.kegiatan}</p>
                        <p className="text-[10px] text-neutral-450 dark:text-neutral-500 font-mono">{b.id}</p>
                      </div>
                      <div className="shrink-0">
                        {getStatusBadge(b.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] p-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-150 dark:border-neutral-750">
                      <div>
                        <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold block uppercase">Kendaraan</span>
                        <span className="font-bold text-neutral-700 dark:text-neutral-200 block">{vehicle?.nama_kendaraan || "Dihapus"}</span>
                        <span className="text-neutral-550 dark:text-neutral-400 font-mono">{vehicle?.nomor_polisi}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold block uppercase">Waktu</span>
                        <span className="font-bold text-neutral-700 dark:text-neutral-200 block">{b.tanggal_mulai}</span>
                        <span className="text-neutral-550 dark:text-neutral-400 font-semibold">{b.jam_mulai} - {b.jam_selesai} WIB</span>
                      </div>
                    </div>

                    <div className="text-[11px] space-y-1">
                      <p className="font-semibold text-neutral-600 dark:text-neutral-300"><span className="text-neutral-400 dark:text-neutral-500">PJ:</span> {b.penanggung_jawab} ({b.jabatan})</p>
                      <p className="font-medium text-neutral-500 dark:text-neutral-450"><span className="text-neutral-400 dark:text-neutral-500">Tujuan:</span> {b.tujuan}</p>
                    </div>

                    {/* Actions button blocks on Mobile */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 dark:border-neutral-750 pt-3">
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(b)}
                        className="p-1 px-2.5 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-200 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer border border-neutral-350 dark:border-neutral-700"
                      >
                        <Eye className="w-3.5 h-3.5" /> Detail
                      </button>

                      {currentRole === 'Admin' && (
                        <div className="flex items-center gap-1">
                          {b.status === 'Draft' && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(b.id, 'Menunggu Persetujuan')}
                              className="text-xs bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-1 px-2.5 rounded-lg transition"
                            >
                              Ajukan
                            </button>
                          )}

                          {b.status === 'Menunggu Persetujuan' && (
                            <>
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(b.id, 'Disetujui')}
                                className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1 px-2 rounded-lg transition"
                                title="Approve"
                              >
                                Setujui
                              </button>
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(b.id, 'Ditolak')}
                                className="text-xs bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded-lg transition"
                                title="Reject"
                              >
                                Tolak
                              </button>
                            </>
                          )}

                          {b.status === 'Disetujui' && (
                            <>
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(b.id, 'Selesai')}
                                className="text-xs bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2.5 rounded-lg transition"
                              >
                                Selesai
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(b)}
                                className="text-xs bg-slate-200 hover:bg-slate-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-700 dark:text-neutral-200 font-bold py-1 px-2 rounded-lg transition"
                              >
                                Ubah
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => onDeleteBooking(b.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-550 dark:bg-red-950/20 dark:hover:bg-red-900/30 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-4 mt-4 text-xs font-bold text-neutral-500 dark:text-neutral-400">
              <span className="text-neutral-400 dark:text-neutral-500 font-semibold">Tampil {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} dari {totalItems}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-md disabled:opacity-40 select-none cursor-pointer text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
                >
                  Prev
                </button>
                <span className="text-neutral-750 dark:text-neutral-200 font-black px-2">{currentPage} / {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-md disabled:opacity-40 select-none cursor-pointer text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Detail Viewer Modal */}
      {selectedBooking && (() => {
        const matchingVehicle = vehicles.find(v => v.id === selectedBooking.kendaraan_id);
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg border border-neutral-100 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-850 dark:to-neutral-900">
                <div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedBooking.status)}
                    <span className="text-xs text-neutral-400 dark:text-neutral-500 font-mono font-medium">{selectedBooking.id}</span>
                  </div>
                  <h4 className="font-bold text-lg text-neutral-800 dark:text-neutral-100 tracking-tight leading-snug mt-1.5">{selectedBooking.kegiatan}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-400 dark:text-neutral-500 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Vehicle info block */}
                <div className="p-4 rounded-xl border border-neutral-150 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white dark:bg-neutral-800 rounded-lg flex items-center justify-center text-[#0F8A5F] dark:text-emerald-400 shadow-inner font-extrabold text-sm shrink-0 border border-neutral-200 dark:border-neutral-700">
                    SCB
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-extrabold uppercase">Kendaraan Terpilih</span>
                    <p className="font-bold text-sm text-neutral-850 dark:text-neutral-200 mt-0.5">{matchingVehicle?.nama_kendaraan}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-450 font-mono font-semibold">{matchingVehicle?.nomor_polisi} • Kapasitas {matchingVehicle?.kapasitas} Penumpang</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-2 gap-4 bg-neutral-50 dark:bg-neutral-850 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
                  <div>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider block">Mulai</span>
                    <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 block mt-1">{selectedBooking.tanggal_mulai}</span>
                    <span className="text-xs font-semibold text-neutral-550 dark:text-neutral-400 font-mono mt-0.5">{selectedBooking.jam_mulai} WIB</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider block">Selesai</span>
                    <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 block mt-1">{selectedBooking.tanggal_selesai}</span>
                    <span className="text-xs font-semibold text-neutral-550 dark:text-neutral-400 font-mono mt-0.5">{selectedBooking.jam_selesai} WIB</span>
                  </div>
                </div>

                {/* Supervisor details */}
                <div className="space-y-4 pt-1">
                  <div className="flex items-start gap-2.5">
                    <User className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 block">Penanggung Jawab</span>
                      <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 leading-snug mt-0.5">{selectedBooking.penanggung_jawab}</p>
                      <p className="text-xs text-[#0F8A5F] dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3.5 h-3.5" /> {selectedBooking.jabatan}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 block">Lokasi Tujuan / Perjalanan</span>
                      <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 leading-snug mt-0.5">{selectedBooking.tujuan}</p>
                    </div>
                  </div>
                </div>

                {/* Passengers details list */}
                <div className="border-t border-neutral-150 dark:border-neutral-800 pt-4">
                  <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">Daftar Rincian Penumpang ({selectedBooking.jumlah_penumpang} Orang)</p>
                  
                  {selectedBooking.daftar_penumpang && selectedBooking.daftar_penumpang.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-neutral-50 dark:bg-neutral-850 rounded-xl max-h-[110px] overflow-y-auto">
                      {selectedBooking.daftar_penumpang.map((name, index) => (
                        <span 
                          key={`${name}-${index}`}
                          className="bg-white dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-200 px-3 py-1 font-semibold border border-neutral-150 dark:border-neutral-700 rounded-lg inline-block"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-neutral-400 italic">Tidak ada daftar nama penumpang yang diisi.</p>
                  )}
                </div>

                {/* Keterangan tambahan notes if present */}
                {selectedBooking.keterangan_tambahan && (
                  <div className="bg-yellow-50/50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 p-3.5 rounded-xl text-xs space-y-1">
                    <span className="font-extrabold text-yellow-800 dark:text-yellow-400 uppercase text-[9px] tracking-wider block">Catatan Tambahan Kepada Driver/Urusan Sarpras</span>
                    <p className="text-yellow-950 dark:text-yellow-300 font-medium leading-relaxed">{selectedBooking.keterangan_tambahan}</p>
                  </div>
                )}
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-950 px-6 py-4 flex justify-end border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-5 py-2.5 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-750 font-bold text-neutral-700 dark:text-neutral-200 text-xs rounded-xl transition cursor-pointer border border-neutral-300 dark:border-neutral-700"
                >
                  Tutup Rincian
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit schedule timing modal Dialog */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md border border-neutral-100 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-850 dark:to-neutral-900">
              <div>
                <h4 className="font-bold text-md text-neutral-800 dark:text-neutral-100">Ubah Penjadwalan Waktu</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-450 mt-1">Ubah atau koordinasikan waktu keberangkatan dan kepulangan kendaraan agar terhindar dari bentrokan jadwal.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-400 dark:text-neutral-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {editConflictErr && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-xs text-red-900 dark:text-red-450 font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-650 dark:text-red-400 shrink-0 mt-0.5" />
                  <span>{editConflictErr}</span>
                </div>
              )}

              {/* Start info */}
              <div className="space-y-3 p-4 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-100 dark:border-neutral-800">
                <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Waktu Mulai Baru</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-450 dark:text-neutral-500 font-bold block">Tanggal</label>
                    <input
                      type="date"
                      value={editTanggalMulai}
                      onChange={(e) => setEditTanggalMulai(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs outline-none text-neutral-850 dark:text-neutral-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-450 dark:text-neutral-500 font-bold block">Jam Keberangkatan</label>
                    <input
                      type="time"
                      value={editJamMulai}
                      onChange={(e) => setEditJamMulai(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs outline-none text-neutral-850 dark:text-neutral-100"
                    />
                  </div>
                </div>
              </div>

              {/* End info */}
              <div className="space-y-3 p-4 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-100 dark:border-neutral-800">
                <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Waktu Selesai Baru</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-450 dark:text-neutral-500 font-bold block">Tanggal</label>
                    <input
                      type="date"
                      value={editTanggalSelesai}
                      onChange={(e) => setEditTanggalSelesai(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs outline-none text-neutral-850 dark:text-neutral-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-450 dark:text-neutral-500 font-bold block">Jam Kepulangan</label>
                    <input
                      type="time"
                      value={editJamSelesai}
                      onChange={(e) => setEditJamSelesai(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs outline-none text-neutral-850 dark:text-neutral-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-950 px-6 py-4 flex justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="px-4 py-2 bg-neutral-250 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-750 font-bold text-neutral-600 dark:text-neutral-300 text-xs rounded-xl transition cursor-pointer border border-neutral-300 dark:border-neutral-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEditTime}
                className="px-4 py-2 bg-[#0F8A5F] hover:bg-[#0a6344] text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md shadow-[#0F8A5F]/20"
              >
                Simpan Jadwal Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
