import React, { useState, useEffect } from 'react';
import { Vehicle, Booking, AppNotification, AppRole, BookingStatus, UserProfile } from './types';
import { INITIAL_VEHICLES, INITIAL_BOOKINGS } from './mockData';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import BookingForm from './components/BookingForm';
import BookingHistory from './components/BookingHistory';
import VehicleManager from './components/VehicleManager';
import ReportsView from './components/ReportsView';
import CalendarView from './components/CalendarView';
import AuthScreen from './components/AuthScreen';
import AccountManager from './components/AccountManager';

import { 
  seedInitialData,
  subscribeVehicles,
  subscribeBookings,
  subscribeNotifications,
  addOrUpdateVehicle,
  deleteVehicleDoc,
  addOrUpdateBooking,
  deleteBookingDoc,
  addOrUpdateNotification,
  deleteNotificationDoc
} from './lib/firebase';

import { 
  Bell, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Info, 
  LogOut, 
  Activity,
  Menu,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';

export default function App() {
  // 1. Core State Managers (Populated via real-time Firestore sync)
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Seed database and set up subscriptions
  useEffect(() => {
    seedInitialData().then(() => {
      const unsubVehicles = subscribeVehicles((data) => {
        setVehicles(data);
      });
      const unsubBookings = subscribeBookings((data) => {
        setBookings(data);
      });
      const unsubNotifs = subscribeNotifications((data) => {
        setNotifications(data);
      });

      return () => {
        unsubVehicles();
        unsubBookings();
        unsubNotifs();
      };
    }).catch((err) => {
      console.error('Error seeding/subscribing to Firestore:', err);
    });
  }, []);

  // User session state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('scb_active_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return null;
  });

  // Role management state -> Default to Pemohon/Pegawai but allows direct switching to Admin in sidebar
  const [currentRole, setCurrentRole] = useState<AppRole>(() => {
    const saved = localStorage.getItem('scb_role');
    return (saved as AppRole) || 'Pemohon';
  });

  // Sync currentRole with currentUser's role when it changes
  useEffect(() => {
    if (currentUser) {
      setCurrentRole(currentUser.role);
    }
  }, [currentUser]);

  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Dark mode state backed by LocalStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('scb_dark_mode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('scb_dark_mode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // H-1 booking reminder trigger
  // Since today is 2026-06-12, tomorrow is 2026-06-13.
  // Look for any approved bookings on 2026-06-13 to trigger H-1 reminder.
  useEffect(() => {
    if (bookings.length === 0) return;
    
    const tomorrowStr = "2026-06-13";
    const tomorrowBooking = bookings.find(b => b.tanggal_mulai === tomorrowStr && b.status === 'Disetujui');
    
    // Check if reminder already exists to avoid spamming
    const reminderId = `REMIND-${tomorrowStr}`;
    const alreadyExists = notifications.some(n => n.id === reminderId);

    if (tomorrowBooking && !alreadyExists) {
      const v = vehicles.find(car => car.id === tomorrowBooking.kendaraan_id);
      
      const newReminder: AppNotification = {
        id: reminderId,
        title: 'Pengingat H-1 Keberangkatan',
        message: `PERINGATAN H-1: Peminjaman ${v?.nama_kendaraan || 'Kendaraan'} untuk kegiatan "${tomorrowBooking.kegiatan}" akan dimulai besok (${tomorrowBooking.tanggal_mulai}). Mohon koordinasi kelengkapan surat jalan.`,
        timestamp: '12-06 08:00',
        isRead: false,
        type: 'warning'
      };

      addOrUpdateNotification(newReminder).catch(console.error);
    }
  }, [bookings, vehicles, notifications]);

  useEffect(() => {
    localStorage.setItem('scb_role', currentRole);
  }, [currentRole]);

  // Handle addition of standard notification utilities
  const pushNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert') => {
    const timestampStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const formattedDate = new Date().toLocaleDateString('id-ID', { month: '2-digit', day: '2-digit' }).replace('/', '-');

    const nw: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title,
      message,
      timestamp: `${formattedDate} ${timestampStr}`,
      isRead: false,
      type
    };

    addOrUpdateNotification(nw).catch(console.error);
  };

  const handleClearNotifications = () => {
    notifications.forEach((n) => {
      deleteNotificationDoc(n.id).catch(console.error);
    });
  };

  const handleMarkNotificationRead = (id: string) => {
    const target = notifications.find(n => n.id === id);
    if (target) {
      addOrUpdateNotification({ ...target, isRead: true }).catch(console.error);
    }
  };


  // 2. Booking CRUD handlers
  const handleAddBooking = (
    newBooking: Omit<Booking, 'id' | 'created_at'>, 
    asStatus: BookingStatus
  ): { success: boolean; message: string } => {
    const generatedId = `B-${Date.now()}`;
    const fullBooking: Booking = {
      ...newBooking,
      id: generatedId,
      created_at: new Date().toISOString()
    };

    addOrUpdateBooking(fullBooking).then(() => {
      // Send visual notification card
      const targetVehicle = vehicles.find(v => v.id === newBooking.kendaraan_id);
      if (asStatus === 'Draft') {
        pushNotification(
          'Pengajuan Disimpan ke Draft',
          `Peminjaman armada ${targetVehicle?.nama_kendaraan || 'sekolah'} disimpan sebagai draft sementara.`,
          'info'
        );
      } else {
        pushNotification(
          'Pengajuan Baru Terdaftar',
          `Pengajuan oleh ${newBooking.penanggung_jawab} untuk kegiatan "${newBooking.kegiatan}" terdaftar & menunggu peninjauan Sarpras.`,
          'warning'
        );
      }
    }).catch(console.error);

    return { success: true, message: 'Booking successfully added!' };
  };

  // Update administrative booking status
  const handleUpdateBookingStatus = (bookingId: string, newStatus: BookingStatus) => {
    const b = bookings.find(item => item.id === bookingId);
    if (b) {
      const titleText = `Status Pengajuan Diperbarui`;
      const v = vehicles.find(car => car.id === b.kendaraan_id);
      
      let messageText = `Pengajuan kegiatan "${b.kegiatan}" diubah statusnya menjadi ${newStatus}.`;
      let notifType: 'info' | 'success' | 'warning' | 'alert' = 'info';

      if (newStatus === 'Disetujui') {
        messageText = `Peminjaman ${v?.nama_kendaraan || 'Kendaraan'} untuk kegiatan "${b.kegiatan}" telah DISETUJUI oleh Admin Sarpras.`;
        notifType = 'success';
      } else if (newStatus === 'Ditolak') {
        messageText = `Pengajuan kendaraan untuk kegiatan "${b.kegiatan}" DITOLAK oleh Admin Sarpras karena waktu bentrok/keperluan lain.`;
        notifType = 'alert';
      } else if (newStatus === 'Selesai') {
        messageText = `Perjalanan armada ${v?.nama_kendaraan || 'Kendaraan'} selesai. Kunci kontak serta STNK telah diserahterimakan kembali.`;
        notifType = 'info';
      }

      pushNotification(titleText, messageText, notifType);
      addOrUpdateBooking({ ...b, status: newStatus }).catch(console.error);
    }
  };

  // Delete/Cancel booking
  const handleDeleteBooking = (bookingId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus atau membatalkan pengajuan peminjaman ini?')) {
      const bToDelete = bookings.find(b => b.id === bookingId);
      if (bToDelete) {
        deleteBookingDoc(bookingId).then(() => {
          pushNotification(
            'Pengajuan Dihapus',
            `Catatan peminjaman "${bToDelete.kegiatan || 'Peminjaman'}" telah dihapus secara permanen dari basis data.`,
            'alert'
          );
        }).catch(console.error);
      }
    }
  };

  // Shift/reschedule booking timeline
  const handleUpdateBookingTime = (
    bookingId: string, 
    tanggalMulai: string, 
    jamMulai: string, 
    tanggalSelesai: string, 
    jamSelesai: string
  ): { success: boolean; message: string } => {
    const b = bookings.find(item => item.id === bookingId);
    if (b) {
      const updated = {
        ...b,
        tanggal_mulai: tanggalMulai,
        jam_mulai: jamMulai,
        tanggal_selesai: tanggalSelesai,
        jam_selesai: jamSelesai
      };
      addOrUpdateBooking(updated).then(() => {
        pushNotification(
          'Jadwal Penyesuaian Sukses',
          `Jadwal untuk kegiatan "${b.kegiatan}" disesuaikan ke tanggal ${tanggalMulai} pukul ${jamMulai} WIB.`,
          'info'
        );
      }).catch(console.error);
    }

    return { success: true, message: 'Booking time successfully rescheduled!' };
  };


  // 3. Vehicle Master data handler modifiers (Admin-Only functions)
  const handleAddVehicle = (newVehicle: Omit<Vehicle, 'id'>) => {
    const generatedId = `V00${vehicles.length + 1}`;
    const fullVehicle: Vehicle = {
      ...newVehicle,
      id: generatedId
    };

    addOrUpdateVehicle(fullVehicle).then(() => {
      pushNotification(
        'Armada Sekolah Ditambahkan',
        `Mobil ${newVehicle.nama_kendaraan} siap dijadwalkan dalam aplikasi SCB-GO.`,
        'success'
      );
    }).catch(console.error);
  };

  const handleUpdateVehicle = (updatedVehicle: Vehicle) => {
    addOrUpdateVehicle(updatedVehicle).then(() => {
      pushNotification(
        'Armada Diperbarui',
        `Informasi spesifikasi armada ${updatedVehicle.nama_kendaraan} berhasil diselaraskan.`,
        'info'
      );
    }).catch(console.error);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    // Check if any booking is scheduled for this vehicle
    const activeAttachedBookings = bookings.filter(b => b.kendaraan_id === vehicleId && b.status !== 'Selesai' && b.status !== 'Ditolak');

    if (activeAttachedBookings.length > 0) {
      alert(`KENDARAAN SEDANG DIGUNAKAN: Mobil ini masih memiliki ${activeAttachedBookings.length} jadwal pemesanan aktif. Mohon batalkan/selesaikan jadwal sebelum menghapus.`);
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus data kendaraan ini secara permanen dari sistem?')) {
      const vToDelete = vehicles.find(v => v.id === vehicleId);
      if (vToDelete) {
        deleteVehicleDoc(vehicleId).then(() => {
          pushNotification(
            'Armada Dihapus',
            `Data mobil ${vToDelete.nama_kendaraan || 'Kendaraan'} telah dibersihkan dari database Sarpras.`,
            'alert'
          );
        }).catch(console.error);
      }
    }
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('scb_active_user', JSON.stringify(user));
    setCurrentRole(user.role);
    setCurrentTab('dashboard');
    pushNotification(
      'Masuk Berhasil',
      `Selamat datang, ${user.nama} (${user.jabatan}).`,
      'success'
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('scb_active_user');
    setCurrentUser(null);
    setCurrentRole('Pemohon');
    setCurrentTab('dashboard');
    pushNotification(
      'Keluar Akun',
      'Anda telah keluar dari akun Super Admin. Mode akses kembali menjadi Pemohon.',
      'info'
    );
  };


  // Count variables to inject inside Sidebar badges
  const pendingApprovalsCount = bookings.filter(b => b.status === 'Menunggu Persetujuan').length;
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const activeUser: UserProfile = currentUser || {
    email: 'guest@baznas.sch.id',
    nama: 'Pegawai Cendekia (Tamu)',
    jabatan: 'Pegawai Sekolah',
    role: 'Pemohon'
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-neutral-950 flex flex-col lg:flex-row antialiased font-sans text-neutral-800 dark:text-neutral-100 transition-colors duration-200">
      
      {/* Sidebar navigation system */}
      <Sidebar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        pendingApprovalsCount={pendingApprovalsCount}
        unreadNotificationsCount={unreadNotificationsCount}
        currentUser={currentUser}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Content Workspace viewport */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Desktop Top Nav Header */}
        <header className="hidden lg:flex items-center justify-between h-20 bg-white dark:bg-neutral-900 px-8 border-b border-neutral-150 dark:border-neutral-800 shrink-0 select-none transition-colors duration-200">
          <div>
            <h1 className="text-xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#0F8A5F] rounded-full inline-block" />
              SCB-GO <span className="text-xs text-[#0F8A5F] dark:text-[#E7F3EF] bg-green-50 dark:bg-[#0F8A5F]/25 px-2 py-0.5 rounded-full font-extrabold tracking-normal">Sekolah Cendekia BAZNAS</span>
            </h1>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">Sistem Pembeda & Manajemen Peminjaman Operasional Sekolah anti Bentrok</p>
          </div>

          {/* User profile, Dark Mode toggle, & Role status widget */}
          <div className="flex items-center gap-6">
            
            {/* Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-650 dark:text-neutral-300 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center border border-gray-200 dark:border-neutral-700"
              title={isDarkMode ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
              id="btn-toggle-dark-mode-desktop"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
            </button>

            <div className="text-right">
              <p className="text-xs font-bold text-neutral-700 dark:text-neutral-200">{activeUser.nama}</p>
              <p className="text-[10px] text-neutral-450 dark:text-neutral-400 font-semibold">{activeUser.email} ({activeUser.jabatan})</p>
            </div>
            
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#0F8A5F] to-emerald-400 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              {currentRole === 'Admin' ? 'ADM' : 'PEM'}
            </div>
          </div>
        </header>



        {/* Dynamic Inner Tab Router */}
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          
          {currentTab === 'login' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <AuthScreen 
                onLoginSuccess={handleLoginSuccess} 
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            </div>
          )}

          {currentTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-150">
              <Dashboard 
                vehicles={vehicles}
                bookings={bookings}
                notifications={notifications}
                currentRole={currentRole}
                onClearNotifications={handleClearNotifications}
                onMarkNotificationRead={handleMarkNotificationRead}
                onNavigateToTab={setCurrentTab}
              />
              
              {/* Embed Calendar directly in Dashboard so users get both the statistical insight and real-time calendaring immediately */}
              <CalendarView 
                bookings={bookings} 
                vehicles={vehicles} 
              />
            </div>
          )}

          {currentTab === 'pengajuan' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <BookingForm 
                vehicles={vehicles}
                bookings={bookings}
                onSubmitBooking={handleAddBooking}
                onSuccess={() => setCurrentTab('riwayat')}
                currentUser={currentUser}
              />
            </div>
          )}

          {currentTab === 'riwayat' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <BookingHistory 
                bookings={bookings}
                vehicles={vehicles}
                currentRole={currentRole}
                onUpdateStatus={handleUpdateBookingStatus}
                onDeleteBooking={handleDeleteBooking}
                onUpdateBookingTime={handleUpdateBookingTime}
              />
            </div>
          )}

          {currentTab === 'kendaraan' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <VehicleManager 
                vehicles={vehicles}
                onAddVehicle={handleAddVehicle}
                onUpdateVehicle={handleUpdateVehicle}
                onDeleteVehicle={handleDeleteVehicle}
              />
            </div>
          )}

          {currentTab === 'pengguna' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <AccountManager 
                currentUser={currentUser}
                onUpdateCurrentUser={setCurrentUser}
                pushNotification={pushNotification}
              />
            </div>
          )}

          {currentTab === 'laporan' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <ReportsView 
                bookings={bookings}
                vehicles={vehicles}
              />
            </div>
          )}

        </div>

      </main>

    </div>
  );
}
