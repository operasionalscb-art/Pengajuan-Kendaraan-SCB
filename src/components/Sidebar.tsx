import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  PlusCircle, 
  History, 
  Car, 
  BarChart2, 
  ShieldAlert, 
  Users, 
  User,
  Menu,
  X,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { AppRole, UserProfile } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentRole: AppRole;
  setCurrentRole: (role: AppRole) => void;
  pendingApprovalsCount: number;
  unreadNotificationsCount: number;
  currentUser: UserProfile | null;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  currentRole,
  setCurrentRole,
  pendingApprovalsCount,
  unreadNotificationsCount,
  currentUser,
  onLogout,
  isDarkMode,
  onToggleDarkMode
}: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
    { id: 'pengajuan', label: 'Buat Pengajuan', icon: PlusCircle },
    { id: 'riwayat', label: 'Riwayat Peminjaman', icon: History },
    { id: 'kendaraan', label: 'Master Kendaraan', icon: Car, adminOnly: true },
    { id: 'pengguna', label: 'Akses & Akun', icon: Users, adminOnly: true },
    { id: 'laporan', label: 'Laporan & Statistik', icon: BarChart2 },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
  };

  const toggleRole = () => {
    if (currentUser && currentUser.role === 'Admin') {
      setCurrentRole(currentRole === 'Admin' ? 'Pemohon' : 'Admin');
    } else {
      setCurrentTab('login');
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden h-16 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 text-gray-850 dark:text-neutral-100 flex items-center justify-between px-4 z-40 sticky top-0 shadow-sm transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-scb-green rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
            SC
          </div>
          <div className="text-left font-sans">
            <h1 className="font-extrabold text-sm tracking-wider text-gray-900 dark:text-neutral-100 leading-none">SCB-GO</h1>
            <p className="text-[10px] text-gray-500 dark:text-neutral-400 font-semibold mt-1">SEKOLAH CENDEKIA BAZNAS</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          {/* Mobile Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer text-gray-600 dark:text-neutral-300"
            title={isDarkMode ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
            id="btn-toggle-dark-mode-mobile"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          <button 
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className="relative p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-gray-650 dark:text-neutral-300"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>
          <button 
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-gray-650 dark:text-neutral-300"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar background overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Navigation Drawer/Sidebar */}
      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-50
        w-72 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 text-gray-850 dark:text-neutral-100
        flex flex-col h-full shadow-md lg:shadow-none transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Section */}
        <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-scb-green rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
            SC
          </div>
          <div className="text-left font-sans">
            <h1 className="font-bold text-gray-900 dark:text-neutral-100 leading-none">SCB-GO</h1>
            <p className="text-[10px] text-gray-500 dark:text-neutral-400 uppercase tracking-wider font-semibold mt-1">Sekolah Cendekia BAZNAS</p>
          </div>
        </div>



        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-thin">
          {menuItems.map((item) => {
            // Check if item is adminOnly and currently not admin
            if (item.adminOnly && currentRole !== 'Admin') {
              return null;
            }

            const IconComponent = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer text-left
                  ${isActive 
                    ? 'bg-scb-light-green dark:bg-emerald-950/40 text-scb-green dark:text-emerald-400 font-semibold' 
                    : 'text-gray-650 dark:text-neutral-350 hover:bg-gray-50 dark:hover:bg-neutral-800'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-scb-green dark:text-emerald-400' : 'text-gray-400 group-hover:text-gray-650 dark:group-hover:text-neutral-200'}`} />
                  <span>{item.label}</span>
                </div>

                {/* Badges */}
                {item.id === 'dashboard' && pendingApprovalsCount > 0 && currentRole === 'Admin' && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Account Profile Area */}
        <div className="p-4 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-neutral-850 p-3 rounded-xl overflow-hidden mb-2.5 border border-transparent dark:border-neutral-850">
            <div className="w-8 h-8 rounded-full bg-scb-green flex items-center justify-center text-white text-xs font-bold shrink-0">
              {currentUser ? currentUser.nama.charAt(0).toUpperCase() : 'T'}
            </div>
            <div className="overflow-hidden text-left flex-1">
              <p className="text-xs font-bold truncate text-gray-900 dark:text-neutral-100">
                {currentUser ? currentUser.nama : 'Pegawai Cendekia (Tamu)'}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-neutral-400 truncate font-mono">
                {currentUser ? currentUser.email : 'guest@baznas.sch.id'}
              </p>
            </div>
          </div>
          
          {currentUser ? (
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/45 text-red-650 dark:text-red-400 hover:text-red-750 active:scale-[98%] font-semibold text-xs rounded-lg transition-all cursor-pointer border border-red-200 dark:border-red-900/40"
            >
              Log Out / Keluar Akun
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentTab('login')}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-scb-light-green dark:bg-emerald-950/30 hover:bg-scb-green hover:text-white dark:hover:bg-scb-green dark:hover:text-neutral-100 text-scb-green dark:text-emerald-400 active:scale-[98%] font-semibold text-xs rounded-lg transition-all cursor-pointer border border-emerald-250 dark:border-emerald-900/40"
            >
              Masuk Super Admin
            </button>
          )}
          
          <div className="mt-2 text-center text-[10px] text-gray-400">
            <span>Kab. Bogor, Jawa Barat</span>
          </div>
        </div>
      </aside>
    </>
  );
}
