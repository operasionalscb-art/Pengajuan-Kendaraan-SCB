import React, { useState } from 'react';
import { Booking, Vehicle } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  BarChart3, 
  Download, 
  Printer, 
  TrendingUp, 
  Award, 
  Calendar, 
  FileText,
  Car,
  Clock,
  Briefcase
} from 'lucide-react';

interface ReportsViewProps {
  bookings: Booking[];
  vehicles: Vehicle[];
}

export default function ReportsView({ bookings, vehicles }: ReportsViewProps) {
  const [reportYear, setReportYear] = useState(2026);

  // Filter approved/completed bookings for reports to avoid including drafts or rejected runs
  const activeReportBookings = bookings.filter(
    b => b.status === 'Disetujui' || b.status === 'Selesai'
  );

  // 1. Total usage count
  const totalUsageCount = activeReportBookings.length;

  // 2. Count per vehicle
  const vehicleDistribution = vehicles.map(v => {
    const usageCount = activeReportBookings.filter(b => b.kendaraan_id === v.id).length;
    return {
      id: v.id,
      name: v.nama_kendaraan,
      plat: v.nomor_polisi,
      count: usageCount
    };
  }).sort((a,b) => b.count - a.count);

  const topVehicle = vehicleDistribution[0]?.count > 0 ? vehicleDistribution[0] : null;

  // 3. Count per month (for selected year)
  const indonesianMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const monthlyDistribution = indonesianMonths.map((mName, index) => {
    const monthNum = String(index + 1).padStart(2, '0');
    const matchCount = activeReportBookings.filter(b => {
      // Extract year & month from tanggal_mulai: YYYY-MM-DD
      const bYear = b.tanggal_mulai.split('-')[0];
      const bMonth = b.tanggal_mulai.split('-')[1];
      return Number(bYear) === reportYear && bMonth === monthNum;
    }).length;

    return {
      name: mName,
      'Jumlah Penggunaan': matchCount
    };
  });

  // Color palette for charts cells
  const COLORS = ['#0F8A5F', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#6B7280'];

  // Export to Excel / CSV client-side
  const downloadCSVReport = () => {
    // Build CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID Booking,Kendaraan,Nomor Polisi,Penanggung Jawab,Jabatan,Kegiatan,Tujuan,Tanggal Mulai,Jam Mulai,Tanggal Selesai,Jam Selesai,Jumlah Penumpang,Status\r\n";
    
    activeReportBookings.forEach((b) => {
      const v = vehicles.find(item => item.id === b.kendaraan_id);
      const row = [
        `="${b.id}"`, // format ID as text for Excel compat
        `"${v?.nama_kendaraan || 'Dihapus'}"`,
        `"${v?.nomor_polisi || ''}"`,
        `"${b.penanggung_jawab}"`,
        `"${b.jabatan}"`,
        `"${b.kegiatan.replace(/"/g, '""')}"`,
        `"${b.tujuan.replace(/"/g, '""')}"`,
        b.tanggal_mulai,
        b.jam_mulai,
        b.tanggal_selesai,
        b.jam_selesai,
        b.jumlah_penumpang,
        b.status
      ].join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SCB-GO_Laporan_Peminjaman_${reportYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable View mimicking PDF print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total usage hours or count */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider block">Total Penggunaan Disetujui</span>
            <p className="text-3xl font-black text-neutral-800 dark:text-neutral-100">{totalUsageCount} <span className="text-lg font-bold text-neutral-500 dark:text-neutral-450">Sesi</span></p>
            <p className="text-[10px] text-[#0F8A5F] dark:text-emerald-400 font-bold">Terhitung dari booking yang disetujui / selesai</p>
          </div>
          <div className="bg-green-50 dark:bg-emerald-950/20 p-3.5 rounded-2xl text-[#0F8A5F] dark:text-emerald-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Most Used Vehicle */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm p-5 flex items-center justify-between col-span-1 sm:col-span-1 lg:col-span-2">
          <div className="space-y-1.5 flex-1 min-w-0">
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider block">Kendaraan Paling Sering Digunakan</span>
            {topVehicle ? (
              <div>
                <p className="text-lg font-extrabold text-neutral-850 dark:text-neutral-200 truncate">{topVehicle.name}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold">{topVehicle.plat} • <span className="text-[#0F8A5F] dark:text-emerald-400 font-bold">{topVehicle.count} kali peminjaman</span></p>
              </div>
            ) : (
              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium italic">Belum ada catatan penggunaan.</p>
            )}
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3.5 rounded-2xl text-yellow-600 dark:text-yellow-400 shrink-0 select-none">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Selected Year stats filter */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider block">Tahun Laporan</span>
            <select
              value={reportYear}
              onChange={(e) => setReportYear(Number(e.target.value))}
              className="mt-1 font-bold text-lg text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 border-none outline-none cursor-pointer px-3 py-1.5 rounded-lg"
            >
              <option value={2025} className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">Tahun 2025</option>
              <option value={2026} className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">Tahun 2026</option>
              <option value={2027} className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">Tahun 2027</option>
              <option value={2028} className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">Tahun 2028</option>
            </select>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3.5 rounded-2xl text-blue-600 dark:text-blue-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="reports-print-section">
        {/* Monthly utilization chart */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-100">Tren Peminjaman Per Bulan</h3>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Total sebaran pemakaian kendaraan pada tahun {reportYear}</p>
            </div>
            <BarChart3 className="w-4 h-4 text-[#0F8A5F] dark:text-emerald-400" />
          </div>

          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-neutral-800" />
                <XAxis dataKey="name" fontSize={11} stroke="#9CA3AF" tickLine={false} />
                <YAxis fontSize={11} stroke="#9CA3AF" tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '11px' }} 
                  cursor={{ fill: 'rgba(15, 138, 95, 0.05)' }} 
                />
                <Bar dataKey="Jumlah Penggunaan" fill="#0F8A5F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle distribution circle chart */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-100">Rasio Penggunaan Per Kendaraan</h3>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">Bandingan intensitas peminjaman masing-masing armada</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-5 h-52 flex items-center justify-center">
              {totalUsageCount > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleDistribution.filter(v => v.count > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {vehicleDistribution.filter(v => v.count > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-[10px] text-neutral-400 dark:text-neutral-500 italic">No data</div>
              )}
            </div>

            {/* List labels */}
            <div className="sm:col-span-7 flex flex-col justify-center space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300 font-medium">
              {vehicleDistribution.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between gap-1 border-b border-neutral-50 dark:border-neutral-800 pb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                    />
                    <span className="truncate" title={item.name}>{item.name}</span>
                  </div>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 shrink-0 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-[10px]">
                    {item.count} Sesi
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Export operations cards */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-150 dark:border-neutral-800 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-100 block">Ekspor Dokumen Laporan Peminjaman</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-1">Unduh seluruh berkas data history peminjaman kendaraan operasional secara instan.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          {/* Download CSV button */}
          <button
            type="button"
            onClick={downloadCSVReport}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-50 dark:bg-[#0F8A5F]/15 hover:bg-emerald-100 dark:hover:bg-[#0F8A5F]/25 text-[#0F8A5F] dark:text-emerald-450 border border-[#0F8A5F]/20 dark:border-emerald-800/30 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Ekspor ke Excel (CSV)
          </button>

          {/* Trigger Print block for PDF layout print style */}
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Cetak Laporan / PDF
          </button>
        </div>
      </div>

      {/* Print-only CSS layout definitions stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #reports-print-section, #reports-print-section * {
            visibility: visible;
          }
          #reports-print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
