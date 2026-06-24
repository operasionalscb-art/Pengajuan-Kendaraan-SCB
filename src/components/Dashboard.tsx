import React, { useState } from 'react';
import { Booking, Vehicle, AppNotification, AppRole } from '../types';
import { 
  Car, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Bell, 
  ShieldAlert, 
  Calendar, 
  TrendingUp, 
  Award,
  Users,
  ChevronRight,
  Info,
  Check,
  Zap
} from 'lucide-react';

interface DashboardProps {
  vehicles: Vehicle[];
  bookings: Booking[];
  notifications: AppNotification[];
  currentRole: AppRole;
  onClearNotifications: () => void;
  onMarkNotificationRead: (id: string) => void;
  onNavigateToTab: (tabId: string) => void;
}

export default function Dashboard({
  vehicles,
  bookings,
  notifications,
  currentRole,
  onClearNotifications,
  onMarkNotificationRead,
  onNavigateToTab
}: DashboardProps) {
  // Today's date is locked to 2026-06-12 as parsed from local timestamp metadata
  const TODAY_STR = "2026-06-12";

  // Calculations for Ringkasan cards:
  // 1. Total available vehicles (Status is 'Tersedia' OR actually ready)
  const totalAvailableVehicles = vehicles.filter(v => v.status === 'Tersedia').length;

  // 2. Vehicles currently in use (Approved booking scheduled for today)
  const activeBookingsToday = bookings.filter(b => {
    return b.status === 'Disetujui' && 
           TODAY_STR >= b.tanggal_mulai && 
           TODAY_STR <= b.tanggal_selesai;
  });
  
  const vehiclesInUseCount = new Set(activeBookingsToday.map(b => b.kendaraan_id)).size;

  // 3. Pending approvals
  const pendingApprovalsCount = bookings.filter(b => b.status === 'Menunggu Persetujuan').length;

  // 4. Today's agenda list
  const todayAgenda = bookings.filter(b => {
    return TODAY_STR >= b.tanggal_mulai && TODAY_STR <= b.tanggal_selesai && b.status !== 'Draft' && b.status !== 'Ditolak';
  });

  // Calculate some simple usage indicators
  const draftBookingsCount = bookings.filter(b => b.status === 'Draft').length;

  // Separate notifications based on role for clean display
  // e.g. Admin sees admin-centric audit alerts, Pemohon sees scheduling approval confirmations
  const visibleNotifications = notifications.slice(0, 5); // Limit to top 5 recent announcements

  return (
    <div className="space-y-6">
      
      {/* Visual BAZNAS Brand Mascot Card */}
      <div className="bg-gradient-to-r from-[#0F8A5F] via-[#0D7752] to-[#0A5339] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-15 translate-x-8 translate-y-8 select-none">
          <Car className="w-64 h-64 text-white" />
        </div>
        
        <div className="relative z-10 space-y-2 max-w-xl">
          <span className="inline-flex items-center gap-1.5 bg-green-700/40 border border-green-500/45 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-green-100">
            <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" /> Selamat Datang di SCB-GO
          </span>
          <h2 className="text-2xl font-black tracking-tight">Portal Manajemen Armada & Peminjaman Kendaraan</h2>
          <p className="text-xs text-green-100 leading-relaxed font-medium">Sekolah Cendekia BAZNAS (SCB). Pastikan untuk mengecek ketersediaan kendaraan pada kalender dan lakukan pengajuan bebas hambatan serta tertib operasional.</p>
          
          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onNavigateToTab('pengajuan')}
              className="py-1.5 px-4 bg-white text-[#0F8A5F] hover:bg-neutral-50 active:scale-95 font-bold text-xs rounded-xl transition duration-150 shadow-md cursor-pointer"
            >
              Ajukan Peminjaman
            </button>
            <button
              type="button"
              onClick={() => {
                const cal = document.getElementById('calendar-section');
                if (cal) cal.scrollIntoView({ behavior: 'smooth' });
              }}
              className="py-1.5 px-4 bg-green-700 hover:bg-green-750 text-white font-bold text-xs rounded-xl border border-green-600 transition"
            >
              Lihat Kalender Kerja
            </button>
          </div>
        </div>
      </div>

      {/* Ringkasan Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Available Vehicles */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5 shadow-sm flex items-center justify-between transition-all hover:scale-[101%] duration-150">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-extrabold uppercase tracking-wide">Tersedia</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-neutral-100">{totalAvailableVehicles} <span className="text-sm text-gray-400 dark:text-neutral-500 font-normal">Unit</span></p>
            <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-medium">Dari total {vehicles.length} armada sekolah</p>
          </div>
          <div className="bg-[#E7F3EF] dark:bg-[#0F8A5F]/20 text-scb-green dark:text-emerald-400 p-4 rounded-xl shrink-0">
            <Car className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Vehicles currently in use */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5 shadow-sm flex items-center justify-between transition-all hover:scale-[101%] duration-150">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-extrabold uppercase tracking-wide">Digunakan</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-neutral-100">{vehiclesInUseCount} <span className="text-sm text-gray-400 dark:text-neutral-500 font-normal">Unit</span></p>
            <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-medium">Terjadwal aktif hari ini ({TODAY_STR})</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 p-4 rounded-xl shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Pending approvals */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5 shadow-sm flex items-center justify-between transition-all hover:scale-[101%] duration-150">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-extrabold uppercase tracking-wide">Pending</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-neutral-100">{pendingApprovalsCount} <span className="text-sm text-gray-400 dark:text-neutral-500 font-normal">Antrean</span></p>
            <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-medium">Butuh approval segera oleh admin</p>
          </div>
          <div className="bg-orange-50 dark:bg-amber-950/40 text-orange-600 dark:text-amber-400 p-4 rounded-xl shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Draft bookings */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5 shadow-sm flex items-center justify-between transition-all hover:scale-[101%] duration-150">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-extrabold uppercase tracking-wide">Hari Ini</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-neutral-100">{todayAgenda.length} <span className="text-sm text-gray-400 dark:text-neutral-500 font-normal">Kegiatan</span></p>
            <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-medium">Draft tersimpan: {draftBookingsCount} item</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 p-4 rounded-xl shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main split sections: Today schedule & Notification hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Jadwal Hari Ini (Today's Scheduled Runs) */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm p-6 lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0F8A5F] dark:text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-100">Jadwal Penggunaan Hari Ini</h3>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Dua arah perjalanan aktif pada tanggal {TODAY_STR}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('riwayat')}
              className="text-xs font-bold text-[#0F8A5F] dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayAgenda.length === 0 ? (
            <div className="py-12 text-center text-neutral-450 space-y-2 whitespace-normal">
              <div className="bg-neutral-50 dark:bg-neutral-850 p-3 rounded-full w-10 h-10 flex items-center justify-center mx-auto text-neutral-450 dark:text-neutral-500">
                <Info className="w-5 h-5" />
              </div>
              <p className="font-bold text-xs text-neutral-500 dark:text-neutral-300">Tidak ada peminjaman kendaraan hari ini.</p>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Seluruh armada sekolah terparkir dalam kondisi aman.</p>
            </div>
          ) : (
            <div className="relative border-l border-neutral-200 dark:border-neutral-800 pl-4 ml-2 space-y-6">
              {todayAgenda.map((item) => {
                const v = vehicles.find(car => car.id === item.kendaraan_id);
                const isApproved = item.status === 'Disetujui' || item.status === 'Selesai';
                
                return (
                  <div key={item.id} className="relative group space-y-1">
                    {/* Circle marker timeline style */}
                    <span className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-neutral-900 ring-1 ${
                      item.status === 'Selesai' ? 'bg-blue-500 ring-blue-300' : 'bg-emerald-500 ring-emerald-300'
                    }`} />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-tight">
                        {item.jam_mulai} - {item.jam_selesai} WIB
                      </span>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        item.status === 'Selesai' 
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300' 
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-[#0F8A5F] dark:text-emerald-450'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-neutral-800 dark:text-neutral-100 mt-1">{item.kegiatan}</h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" /> Ke: {item.tujuan}
                    </p>
                    
                    <div className="p-2 bg-neutral-50 dark:bg-neutral-850 rounded-lg text-[10px] border border-neutral-150 dark:border-neutral-800 leading-relaxed font-semibold text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
                      <span>Mobil: <strong className="text-neutral-700 dark:text-neutral-200">{v?.nama_kendaraan} ({v?.nomor_polisi})</strong></span>
                      <span className="text-neutral-400 dark:text-neutral-500 uppercase">PJ: {item.penanggung_jawab.split(',')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Real-Time In-App System Notifications Center */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm p-6 lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3.5">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#0F8A5F] dark:text-emerald-400 animate-swing" />
              <div>
                <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-100">Notifikasi Sistem</h3>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Dengar kabar pengajuan & memo aktivitas</p>
              </div>
            </div>
            
            {visibleNotifications.length > 0 && (
              <button
                type="button"
                onClick={onClearNotifications}
                className="text-xs font-bold text-red-500 dark:text-red-400 hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {visibleNotifications.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 space-y-2 whitespace-normal">
              <div className="bg-neutral-50 dark:bg-neutral-850 p-3 rounded-full w-10 h-10 flex items-center justify-center mx-auto text-neutral-300 dark:text-neutral-600">
                <Bell className="w-5 h-5" />
              </div>
              <p className="font-bold text-xs text-neutral-500 dark:text-neutral-300">Belum ada notifikasi baru.</p>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Seluruh status pengajuan Anda termonitor dengan baik.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {visibleNotifications.map((n) => {
                // Color tags based on type
                const styleType = () => {
                  switch (n.type) {
                    case 'success':
                      return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-400 border-emerald-150 dark:border-emerald-900/30';
                    case 'warning':
                      return 'bg-yellow-50 dark:bg-amber-950/20 text-yellow-900 dark:text-amber-400 border-yellow-150 dark:border-yellow-900/30';
                    case 'alert':
                      return 'bg-red-50 dark:bg-red-950/20 text-red-950 dark:text-red-400 border-red-150 dark:border-red-900/30';
                    default:
                      return 'bg-neutral-50 dark:bg-neutral-850 text-neutral-850 dark:text-neutral-300 border-neutral-150 dark:border-neutral-800';
                  }
                };

                return (
                  <div 
                    key={n.id} 
                    onClick={() => onMarkNotificationRead(n.id)}
                    className={`p-3 rounded-xl border flex gap-2 w-full transition text-left cursor-pointer hover:shadow-xs relative ${
                      !n.isRead ? 'ring-1 ring-[#0F8A5F]/20 dark:ring-emerald-400/20' : 'opacity-70'
                    } ${styleType()}`}
                  >
                    {!n.isRead && (
                      <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#0F8A5F] dark:bg-emerald-400 rounded-full" />
                    )}

                    <div className="space-y-0.5 flex-1 select-none">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-[11px] tracking-tight">{n.title}</h4>
                        <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-mono leading-none">{n.timestamp}</span>
                      </div>
                      <p className="text-[10px] font-semibold leading-relaxed text-slate-800 dark:text-neutral-300">{n.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
