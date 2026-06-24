import React, { useState } from 'react';
import { Booking, Vehicle } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, User, MapPin, Briefcase, Info, X } from 'lucide-react';

interface CalendarViewProps {
  bookings: Booking[];
  vehicles: Vehicle[];
}

export default function CalendarView({ bookings, vehicles }: CalendarViewProps) {
  const currentRealDate = new Date();
  
  // Default to June 2026 to fit mock data perfectly, or current date if out of range.
  // Setting default month to June (index 5) and year to 2026.
  const [currentMonth, setCurrentMonth] = useState(5); // 0-indexed (June)
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const years = [2025, 2026, 2027, 2028];

  // Get vehicle styling colors helpers
  const getVehicleColorClasses = (vId: string) => {
    switch (vId) {
      case 'V001':
        return { bg: 'bg-emerald-50 hover:bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-800', bullet: 'bg-emerald-500' };
      case 'V002':
        return { bg: 'bg-indigo-50 hover:bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800', bullet: 'bg-indigo-500' };
      case 'V003':
        return { bg: 'bg-amber-50 hover:bg-amber-100', border: 'border-amber-300', text: 'text-amber-800', bullet: 'bg-amber-500' };
      case 'V004':
        return { bg: 'bg-purple-50 hover:bg-purple-100', border: 'border-purple-300', text: 'text-purple-800', bullet: 'bg-purple-500' };
      case 'V005':
        return { bg: 'bg-blue-50 hover:bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', bullet: 'bg-blue-500' };
      default:
        return { bg: 'bg-slate-50 hover:bg-slate-100', border: 'border-slate-300', text: 'text-slate-800', bullet: 'bg-slate-500' };
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Days calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday, 1 is Monday...

  const calendarDays: (number | null)[] = [];
  
  // Fill initial blanks leading to the first of the month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  
  // Fill actual date numbers
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  // Check bookings scheduled on a specific date (takes multi-day spans into consideration)
  const getBookingsOnDate = (dayNum: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    const checkDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

    return bookings.filter(b => {
      // Exclude rejected ones and drafts
      if (b.status === 'Ditolak' || b.status === 'Draft') return false;
      
      // Filter by vehicle if set
      if (selectedVehicleFilter !== 'all' && b.kendaraan_id !== selectedVehicleFilter) return false;

      // Spanning dates:
      // checkDateStr lies between b.tanggal_mulai and b.tanggal_selesai
      return checkDateStr >= b.tanggal_mulai && checkDateStr <= b.tanggal_selesai;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6" id="calendar-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-green-50 text-[#0F8A5F] p-2.5 rounded-xl">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-neutral-800">Kalender Jadwal Kendaraan</h3>
            <p className="text-xs text-neutral-500">Visualisasi penggunaan kendaraan operasional bulanan</p>
          </div>
        </div>

        {/* Filters and Navigators */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Vehicle Selector Filter */}
          <select
            value={selectedVehicleFilter}
            onChange={(e) => setSelectedVehicleFilter(e.target.value)}
            className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-700 rounded-lg outline-none focus:border-[#0F8A5F]"
          >
            <option value="all">Semua Kendaraan</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nama_kendaraan} ({v.nomor_polisi})
              </option>
            ))}
          </select>

          {/* Month selector */}
          <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-lg py-1 px-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-neutral-200 rounded-md transition"
            >
              <ChevronLeft className="w-4 h-4 text-neutral-600" />
            </button>
            
            <div className="flex items-center gap-1.5 px-2">
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="bg-transparent border-none text-xs font-bold text-neutral-700 outline-none cursor-pointer"
              >
                {months.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="bg-transparent border-none text-xs font-bold text-neutral-700 outline-none cursor-pointer"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-neutral-200 rounded-md transition"
            >
              <ChevronRight className="w-4 h-4 text-neutral-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-neutral-400 border-b border-neutral-100 pb-2 mb-1">
        <div>MG</div>
        <div>SN</div>
        <div>SL</div>
        <div>RB</div>
        <div>KM</div>
        <div>JM</div>
        <div>SB</div>
      </div>

      {/* Calendar Days Matrix */}
      <div className="grid grid-cols-7 gap-1 bg-neutral-50 rounded-xl p-1 min-h-[360px]">
        {calendarDays.map((val, idx) => {
          if (val === null) {
            return (
              <div 
                key={`empty-${idx}`} 
                className="bg-white/40 rounded-lg min-h-[80px]" 
              />
            );
          }

          const bookingsOnDay = getBookingsOnDate(val);
          const isToday = 
            currentRealDate.getDate() === val && 
            currentRealDate.getMonth() === currentMonth && 
            currentRealDate.getFullYear() === currentYear;

          return (
            <div 
              key={`day-${val}`} 
              className={`bg-white rounded-lg p-1.5 min-h-[82px] border flex flex-col justify-between transition group hover:shadow-sm ${
                isToday ? 'border-[#0F8A5F] ring-1 ring-[#0F8A5F]/20' : 'border-neutral-100'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-bold ${
                  isToday 
                    ? 'bg-[#0F8A5F] text-white w-5 h-5 rounded-full flex items-center justify-center font-extrabold shadow-sm' 
                    : 'text-neutral-700'
                }`}>
                  {val}
                </span>
                
                {bookingsOnDay.length > 0 && (
                  <span className="text-[9px] font-semibold text-[#0F8A5F] bg-green-50 px-1 rounded">
                    {bookingsOnDay.length} Booking
                  </span>
                )}
              </div>

              {/* Day Agenda List */}
              <div className="flex-1 overflow-y-auto space-y-1 max-h-[64px] scrollbar-thin">
                {bookingsOnDay.slice(0, 3).map((b) => {
                  const s = getVehicleColorClasses(b.kendaraan_id);
                  const vehicle = vehicles.find(v => v.id === b.kendaraan_id);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBooking(b)}
                      className={`
                        w-full text-left truncate text-[10px] font-semibold px-1 rounded border leading-tight block py-0.5 cursor-pointer transition-all
                        ${s.bg} ${s.border} ${s.text}
                      `}
                      title={`${b.kegiatan} (${b.jam_mulai} - ${b.jam_selesai})`}
                    >
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.bullet}`} />
                        <span className="truncate">{b.kegiatan}</span>
                      </div>
                    </button>
                  );
                })}
                {bookingsOnDay.length > 3 && (
                  <div className="text-[8px] text-neutral-500 text-center font-medium">
                    +{bookingsOnDay.length - 3} lainnya
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Colors Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
        <span className="font-bold text-neutral-500">Legend:</span>
        {vehicles.slice(0, 5).map((v) => {
          const s = getVehicleColorClasses(v.id);
          return (
            <div key={v.id} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${s.bullet}`} />
              <span className="text-neutral-600 font-medium">{v.nama_kendaraan}</span>
            </div>
          );
        })}
      </div>

      {/* Booking Details Modal Popup */}
      {selectedBooking && (() => {
        const matchingVehicle = vehicles.find(v => v.id === selectedBooking.kendaraan_id);
        const style = getVehicleColorClasses(selectedBooking.kendaraan_id);
        
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55">
            <div className="bg-white rounded-2xl w-full max-w-lg border border-neutral-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className={`p-6 border-b border-neutral-100 flex items-start justify-between bg-gradient-to-r from-neutral-50 to-white`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wide ${
                      selectedBooking.status === 'Disetujui' ? 'bg-green-100 text-green-800' :
                      selectedBooking.status === 'Menunggu Persetujuan' ? 'bg-yellow-100 text-yellow-800' :
                      selectedBooking.status === 'Selesai' ? 'bg-blue-100 text-blue-800' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {selectedBooking.status}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono font-medium">{selectedBooking.id}</span>
                  </div>
                  <h4 className="font-bold text-lg text-neutral-800 tracking-tight leading-snug">{selectedBooking.kegiatan}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contents */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Vehicle details */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${style.bg} ${style.border}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <CalendarIcon className={`w-5 h-5 ${style.text}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-500 leading-none">Pilihan Kendaraan</p>
                      <p className="font-bold text-neutral-800 mt-1">{matchingVehicle?.nama_kendaraan || "Kendaraan Tidak Ditemukan"}</p>
                      <p className="text-xs text-neutral-500 font-mono mt-0.5">{matchingVehicle?.nomor_polisi} • Kapasitas {matchingVehicle?.kapasitas} Penumpang</p>
                    </div>
                  </div>
                </div>

                {/* Date & Time info */}
                <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Mulai</span>
                    <span className="text-sm font-bold text-neutral-800 block mt-1">{selectedBooking.tanggal_mulai}</span>
                    <span className="text-xs font-medium text-neutral-500 font-mono mt-0.5">{selectedBooking.jam_mulai} WIB</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Selesai</span>
                    <span className="text-sm font-bold text-neutral-800 block mt-1">{selectedBooking.tanggal_selesai}</span>
                    <span className="text-xs font-medium text-neutral-500 font-mono mt-0.5">{selectedBooking.jam_selesai} WIB</span>
                  </div>
                </div>

                {/* Responsible Person */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <User className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-neutral-400">Penanggung Jawab:</span>
                      <p className="text-sm font-bold text-neutral-800">{selectedBooking.penanggung_jawab}</p>
                      <p className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" /> {selectedBooking.jabatan}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-neutral-400">Rute / Lokasi Tujuan:</span>
                      <p className="text-sm font-bold text-neutral-800">{selectedBooking.tujuan}</p>
                    </div>
                  </div>
                </div>

                {/* Passenger list */}
                <div className="border-t border-neutral-150 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-700">Daftar Penumpang ({selectedBooking.jumlah_penumpang})</span>
                    <span className="text-[10px] text-neutral-400 font-bold">Kapasitas Maks: {matchingVehicle?.kapasitas}</span>
                  </div>

                  {selectedBooking.daftar_penumpang && selectedBooking.daftar_penumpang.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto p-1 bg-neutral-50 rounded-lg">
                      {selectedBooking.daftar_penumpang.map((name, index) => (
                        <span 
                          key={`${name}-${index}`} 
                          className="text-xs bg-white text-neutral-700 px-2 py-1 rounded-md border border-neutral-200 font-medium inline-block"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-neutral-400">Tidak ada rincian nama penumpang.</p>
                  )}
                </div>

                {/* Extra Notes */}
                {selectedBooking.keterangan_tambahan && (
                  <div className="bg-yellow-50/70 border border-yellow-200 p-3 rounded-lg text-xs flex gap-2">
                    <Info className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-yellow-800">Catatan Tambahan:</span>
                      <p className="text-yellow-900 mt-0.5 font-medium">{selectedBooking.keterangan_tambahan}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button footer */}
              <div className="bg-neutral-50 px-6 py-4 flex justify-end border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 active:scale-95 font-bold text-neutral-700 transition text-xs rounded-xl cursor-pointer"
                >
                  Tutup Rincian
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
