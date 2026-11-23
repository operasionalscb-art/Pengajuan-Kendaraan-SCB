import React, { useMemo, useState } from 'react';
import { Booking, Vehicle } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
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
  MapPin,
  Briefcase
} from 'lucide-react';

interface ReportsViewProps {
  bookings: Booking[];
  vehicles: Vehicle[];
}

interface CustomTooltipPayloadItem {
  name?: string;
  value?: number;
  payload?: {
    name?: string;
    fullName?: string;
    count?: number;
    passengers?: number;
    percentage?: number;
    'Jumlah Penggunaan'?: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayloadItem[];
  label?: string;
  unitLabel?: string;
}

const ChartTooltip = ({ active, payload, label, unitLabel = 'Sesi' }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  const data = item.payload;
  const title = data?.fullName || data?.name || label || '';
  const value = item.value ?? data?.count ?? data?.['Jumlah Penggunaan'] ?? 0;

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 shadow-lg text-xs max-w-[240px]">
      <p className="font-bold text-neutral-800 dark:text-neutral-100 leading-snug mb-1">{title}</p>
      <div className="flex items-center justify-between gap-4 text-neutral-600 dark:text-neutral-300 tabular-nums">
        <span>Total Penggunaan:</span>
        <span className="font-extrabold text-[#0F8A5F] dark:text-emerald-400">
          {value} {unitLabel}
        </span>
      </div>
      {typeof data?.passengers === 'number' && (
        <div className="flex items-center justify-between gap-4 text-neutral-500 dark:text-neutral-400 tabular-nums mt-0.5">
          <span>Total Penumpang:</span>
          <span className="font-semibold">{data.passengers} Orang</span>
        </div>
      )}
      {typeof data?.percentage === 'number' && (
        <div className="flex items-center justify-between gap-4 text-neutral-500 dark:text-neutral-400 tabular-nums mt-0.5">
          <span>Persentase:</span>
          <span className="font-semibold">{data.percentage.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
};

function extractWilayah(tujuan: string): string {
  const cleaned = (tujuan || '').trim();
  if (!cleaned) return 'Tidak Diketahui';

  const parts = cleaned
    .split(',')
    .map(p => p.trim())
    .filter(Boolean);

  const rawRegion = parts.length > 1 ? parts[parts.length - 1] : cleaned;
  // Remove trailing postal codes like "13140" or "16710"
  const withoutPostal = rawRegion.replace(/\b\d{5}\b/g, '').trim();
  return withoutPostal || rawRegion;
}

function categorizeTujuanPenggunaan(kegiatan: string): string {
  const text = (kegiatan || '').toLowerCase();
  if (!text.trim()) return 'Operasional Lainnya';

  if (/(lomba|pramuka|siswa|santri|ekskul|ekstrakurikuler|tanding|olimpiade|wisuda|kemah|outing|study\s?tour|ujian|pmb|ppdb|asrama)/.test(text)) {
    return 'Kesiswaan & Lomba';
  }
  if (/(donasi|logistik|barang|berkas|dokumen|sembako|buku|antar|pengantaran|jemput|penjemputan|ambil|pengambilan|kirim|pengiriman|sarpras|belanja|perlengkapan|inventaris)/.test(text)) {
    return 'Logistik & Pengantaran';
  }
  if (/(rapat|koordinasi|rakor|rakornas|meeting|musyawarah|briefing|evaluasi|audit|keuangan|kurikulum)/.test(text)) {
    return 'Rapat & Koordinasi';
  }
  if (/(dinas|kunjungan|silaturahmi|baznas|kementerian|tamu|undangan|sosialisasi|pelatihan|workshop|seminar|pusdiklat|monitoring|survei|survey)/.test(text)) {
    return 'Kedinasan & Kunjungan';
  }
  return 'Operasional Lainnya';
}

function truncateLabel(text: string, maxLength = 24): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export default function ReportsView({ bookings, vehicles }: ReportsViewProps) {
  const [reportYear, setReportYear] = useState(2026);
  const [periodScope, setPeriodScope] = useState<'all' | 'year'>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [locationMode, setLocationMode] = useState<'lokasi' | 'wilayah'>('lokasi');
  const [purposeMode, setPurposeMode] = useState<'kategori' | 'kegiatan'>('kategori');

  // Filter approved/completed bookings for reports to avoid including drafts or rejected runs
  const activeReportBookings = useMemo(
    () => bookings.filter(b => b.status === 'Disetujui' || b.status === 'Selesai'),
    [bookings]
  );

  // 1. Total usage count
  const totalUsageCount = activeReportBookings.length;

  // 2. Count per vehicle
  const vehicleDistribution = useMemo(() => {
    return vehicles.map(v => {
      const usageCount = activeReportBookings.filter(b => b.kendaraan_id === v.id).length;
      return {
        id: v.id,
        name: v.nama_kendaraan,
        plat: v.nomor_polisi,
        count: usageCount
      };
    }).sort((a, b) => b.count - a.count);
  }, [vehicles, activeReportBookings]);

  const topVehicle = vehicleDistribution[0]?.count > 0 ? vehicleDistribution[0] : null;

  // 3. Count per month (for selected year)
  const indonesianMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const monthlyDistribution = useMemo(() => {
    return indonesianMonths.map((mName, index) => {
      const monthNum = String(index + 1).padStart(2, '0');
      const matchCount = activeReportBookings.filter(b => {
        const bYear = b.tanggal_mulai.split('-')[0];
        const bMonth = b.tanggal_mulai.split('-')[1];
        return Number(bYear) === reportYear && bMonth === monthNum;
      }).length;

      return {
        name: mName,
        'Jumlah Penggunaan': matchCount
      };
    });
  }, [activeReportBookings, reportYear]);

  // 4. Filtered dataset for Location & Purpose Analytics
  const analyticsBookings = useMemo(() => {
    return activeReportBookings.filter(b => {
      const matchYear = periodScope === 'all' || Number(b.tanggal_mulai.split('-')[0]) === reportYear;
      const matchVehicle = vehicleFilter === 'all' || b.kendaraan_id === vehicleFilter;
      return matchYear && matchVehicle;
    });
  }, [activeReportBookings, periodScope, reportYear, vehicleFilter]);

  // 5. Location (tujuan) aggregation
  const locationDistribution = useMemo(() => {
    const map = new Map<string, { fullName: string; count: number; passengers: number }>();

    analyticsBookings.forEach(b => {
      const raw =
        locationMode === 'wilayah'
          ? (b.tujuan_kota_kabupaten || '').trim() || extractWilayah(b.tujuan)
          : (b.tujuan || '').trim() || 'Tidak Diketahui';
      const key = raw.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        existing.passengers += b.jumlah_penumpang || 0;
      } else {
        map.set(key, {
          fullName: raw,
          count: 1,
          passengers: b.jumlah_penumpang || 0
        });
      }
    });

    const total = analyticsBookings.length || 1;
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count || b.passengers - a.passengers)
      .map(item => ({
        name: truncateLabel(item.fullName, 22),
        fullName: item.fullName,
        count: item.count,
        passengers: item.passengers,
        percentage: (item.count / total) * 100
      }));
  }, [analyticsBookings, locationMode]);

  // 6. Purpose (tujuan penggunaan / kegiatan) aggregation
  const purposeDistribution = useMemo(() => {
    const map = new Map<string, { fullName: string; count: number; passengers: number }>();

    analyticsBookings.forEach(b => {
      const raw =
        purposeMode === 'kategori'
          ? categorizeTujuanPenggunaan(b.kegiatan)
          : (b.kegiatan || '').trim() || 'Tidak Diketahui';
      const key = raw.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        existing.passengers += b.jumlah_penumpang || 0;
      } else {
        map.set(key, {
          fullName: raw,
          count: 1,
          passengers: b.jumlah_penumpang || 0
        });
      }
    });

    const total = analyticsBookings.length || 1;
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count || b.passengers - a.passengers)
      .map(item => ({
        name: truncateLabel(item.fullName, 26),
        fullName: item.fullName,
        count: item.count,
        passengers: item.passengers,
        percentage: (item.count / total) * 100
      }));
  }, [analyticsBookings, purposeMode]);

  // Color palette for charts cells
  const COLORS = ['#0F8A5F', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#6B7280'];
  const PURPOSE_COLORS = ['#0F8A5F', '#2563EB', '#D97706', '#7C3AED', '#64748B', '#059669', '#DB2777'];

  // Export to Excel / CSV client-side
  const downloadCSVReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID Booking,Kendaraan,Nomor Polisi,Penanggung Jawab,Jabatan,Kegiatan,Tujuan,Kota/Kabupaten,Tanggal Mulai,Jam Mulai,Tanggal Selesai,Jam Selesai,Jumlah Penumpang,Status\r\n";
    
    activeReportBookings.forEach((b) => {
      const v = vehicles.find(item => item.id === b.kendaraan_id);
      const row = [
        `="${b.id}"`,
        `"${v?.nama_kendaraan || 'Dihapus'}"`,
        `"${v?.nomor_polisi || ''}"`,
        `"${b.penanggung_jawab}"`,
        `"${b.jabatan}"`,
        `"${b.kegiatan.replace(/"/g, '""')}"`,
        `"${b.tujuan.replace(/"/g, '""')}"`,
        `"${(b.tujuan_kota_kabupaten || extractWilayah(b.tujuan)).replace(/"/g, '""')}"`,
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

  const topLocationsChartData = locationDistribution.slice(0, 8);
  const topPurposeChartData = purposeDistribution.slice(0, 7);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total usage count */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider block">Total Penggunaan Disetujui</span>
            <p className="text-3xl font-black text-neutral-800 dark:text-neutral-100 tabular-nums">{totalUsageCount} <span className="text-lg font-bold text-neutral-500 dark:text-neutral-450">Sesi</span></p>
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
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold tabular-nums">{topVehicle.plat} • <span className="text-[#0F8A5F] dark:text-emerald-400 font-bold">{topVehicle.count} kali peminjaman</span></p>
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

      {/* Graphs Print Section */}
      <div className="space-y-6" id="reports-print-section">
        {/* Row 1: Monthly & Vehicle Utilization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    content={<ChartTooltip unitLabel="Sesi" />}
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
                      <Tooltip content={<ChartTooltip unitLabel="Sesi" />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-[10px] text-neutral-400 dark:text-neutral-500 italic">Belum ada data</div>
                )}
              </div>

              {/* List labels */}
              <div className="sm:col-span-7 flex flex-col justify-center space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300 font-medium">
                {vehicleDistribution.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 border-b border-neutral-50 dark:border-neutral-800 pb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                      />
                      <span className="truncate" title={item.name}>{item.name}</span>
                    </div>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 shrink-0 tabular-nums text-[11px]">
                      {item.count} Sesi
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 Toolbar: Filter for Location & Usage Purpose Analytics */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-100">
              Analisis Lokasi &amp; Tujuan Penggunaan Kendaraan
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 tabular-nums mt-0.5">
              {analyticsBookings.length} Sesi perjalanan · {locationDistribution.length} {locationMode === 'wilayah' ? 'Wilayah' : 'Lokasi tujuan'} · {purposeDistribution.length} {purposeMode === 'kategori' ? 'Kategori kegiatan' : 'Jenis kegiatan'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 print:hidden">
            {/* Period scope segmented control */}
            <div className="inline-flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
              <button
                type="button"
                onClick={() => setPeriodScope('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  periodScope === 'all'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                Semua Periode
              </button>
              <button
                type="button"
                onClick={() => setPeriodScope('year')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  periodScope === 'year'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                Tahun {reportYear}
              </button>
            </div>

            {/* Vehicle selector */}
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              aria-label="Filter kendaraan untuk grafik lokasi dan tujuan"
              className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-semibold rounded-xl border border-transparent focus:border-[#0F8A5F] outline-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-neutral-800">Semua Armada</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id} className="bg-white dark:bg-neutral-800">
                  {v.nama_kendaraan}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Location & Usage Purpose Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 3: Grafik Lokasi Tujuan */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm p-6 flex flex-col justify-between space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-[#0F8A5F] dark:text-emerald-400 shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-100">Grafik Lokasi Tujuan</h3>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    Distribusi destinasi perjalanan kendaraan terbanyak
                  </p>
                </div>
              </div>

              {/* Mode toggle: Lokasi Spesifik vs Wilayah */}
              <div className="inline-flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg self-start shrink-0 print:hidden">
                <button
                  type="button"
                  onClick={() => setLocationMode('lokasi')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    locationMode === 'lokasi'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  Lokasi Spesifik
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode('wilayah')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    locationMode === 'wilayah'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  Wilayah / Kota
                </button>
              </div>
            </div>

            {topLocationsChartData.length > 0 ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topLocationsChartData}
                      layout="vertical"
                      margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" className="dark:stroke-neutral-800" />
                      <XAxis type="number" fontSize={11} stroke="#9CA3AF" tickLine={false} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={130}
                        fontSize={11}
                        stroke="#6B7280"
                        tickLine={false}
                      />
                      <Tooltip
                        content={<ChartTooltip unitLabel="Sesi" />}
                        cursor={{ fill: 'rgba(15, 138, 95, 0.06)' }}
                      />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                        {topLocationsChartData.map((_, index) => (
                          <Cell key={`loc-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Detailed Location List */}
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-2 max-h-44 overflow-y-auto scrollbar-thin pr-1">
                  {locationDistribution.map((item, idx) => (
                    <div key={`${item.fullName}-${idx}`} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 w-5 shrink-0 tabular-nums">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        <span className="truncate font-medium text-neutral-700 dark:text-neutral-200" title={item.fullName}>
                          {item.fullName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 tabular-nums text-[11px]">
                        <span className="text-neutral-400 dark:text-neutral-500">{item.percentage.toFixed(0)}%</span>
                        <span className="font-bold text-neutral-800 dark:text-neutral-100">{item.count} Sesi</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center px-4 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                <MapPin className="w-7 h-7 text-neutral-300 dark:text-neutral-600 mb-2" />
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Belum ada data lokasi perjalanan</p>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                  Data akan muncul setelah ada peminjaman berstatus Disetujui atau Selesai pada filter yang dipilih.
                </p>
              </div>
            )}
          </div>

          {/* Chart 4: Grafik Tujuan Penggunaan Kendaraan */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm p-6 flex flex-col justify-between space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-100">Grafik Tujuan Penggunaan Kendaraan</h3>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    Proporsi peruntukan dan jenis kegiatan operasional
                  </p>
                </div>
              </div>

              {/* Mode toggle: Kategori Penggunaan vs Detail Kegiatan */}
              <div className="inline-flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg self-start shrink-0 print:hidden">
                <button
                  type="button"
                  onClick={() => setPurposeMode('kategori')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    purposeMode === 'kategori'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  Kategori
                </button>
                <button
                  type="button"
                  onClick={() => setPurposeMode('kegiatan')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    purposeMode === 'kegiatan'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  Detail Kegiatan
                </button>
              </div>
            </div>

            {topPurposeChartData.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-5 h-56 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topPurposeChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={78}
                          paddingAngle={3}
                          dataKey="count"
                        >
                          {topPurposeChartData.map((_, index) => (
                            <Cell key={`purpose-cell-${index}`} fill={PURPOSE_COLORS[index % PURPOSE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip unitLabel="Sesi" />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-lg font-black text-neutral-800 dark:text-neutral-100 tabular-nums leading-none">
                        {analyticsBookings.length}
                      </span>
                      <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 mt-1">
                        Total Sesi
                      </span>
                    </div>
                  </div>

                  {/* Purpose Breakdown with Progress Bars */}
                  <div className="sm:col-span-7 space-y-3 max-h-56 overflow-y-auto scrollbar-thin pr-1">
                    {purposeDistribution.map((item, index) => {
                      const barColor = PURPOSE_COLORS[index % PURPOSE_COLORS.length];
                      return (
                        <div key={`${item.fullName}-${idxKey(index)}`} className="space-y-1">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: barColor }}
                              />
                              <span className="truncate font-semibold text-neutral-700 dark:text-neutral-200" title={item.fullName}>
                                {item.fullName}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-100 shrink-0 tabular-nums">
                              {item.count} Sesi · {item.percentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.max(item.percentage, 4)}%`, backgroundColor: barColor }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer summary metadata */}
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 tabular-nums">
                  <span>
                    Dominan: <strong className="text-neutral-800 dark:text-neutral-200">{purposeDistribution[0]?.fullName}</strong>
                  </span>
                  <span>
                    {analyticsBookings.reduce((sum, b) => sum + (b.jumlah_penumpang || 0), 0)} Total Penumpang
                  </span>
                </div>
              </>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center px-4 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                <Briefcase className="w-7 h-7 text-neutral-300 dark:text-neutral-600 mb-2" />
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Belum ada data tujuan penggunaan</p>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                  Data akan muncul setelah ada peminjaman berstatus Disetujui atau Selesai pada filter yang dipilih.
                </p>
              </div>
            )}
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
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-50 dark:bg-[#0F8A5F]/15 hover:bg-emerald-100 dark:hover:bg-[#0F8A5F]/25 text-[#0F8A5F] dark:text-emerald-450 border border-[#0F8A5F]/20 dark:border-emerald-800/30 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" /> Ekspor ke Excel (CSV)
          </button>

          {/* Trigger Print block for PDF layout print style */}
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
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

function idxKey(index: number): string {
  return String(index);
}

