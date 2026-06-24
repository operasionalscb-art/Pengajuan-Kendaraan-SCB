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
  Bell
} from 'lucide-react';
import { AppRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentRole: AppRole;
  setCurrentRole: (role: AppRole) => void;
  pendingApprovalsCount: number;
  unreadNotificationsCount: number;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  currentRole,
  setCurrentRole,
  pendingApprovalsCount,
  unreadNotificationsCount
}: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
    { id: 'pengajuan', label: 'Buat Pengajuan', icon: PlusCircle },
    { id: 'riwayat', label: 'Riwayat Peminjaman', icon: History },
    { id: 'kendaraan', label: 'Master Kendaraan', icon: Car, adminOnly: true },
    { id: 'laporan', label: 'Laporan & Statistik', icon: BarChart2 },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
  };

  const toggleRole = () => {
    setCurrentRole(currentRole === 'Admin' ? 'Pemohon' : 'Admin');
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden h-16 bg-white border-b border-gray-200 text-gray-800 flex items-center justify-between px-4 z-40 sticky top-0 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-scb-green rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
            SC
          </div>
          <div className="text-left">
            <h1 className="font-extrabold text-sm tracking-wider text-gray-900 leading-none">SCB-GO</h1>
            <p className="text-[10px] text-gray-500 font-semibold mt-1">SEKOLAH CENDEKIA BAZNAS</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className="relative p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>
          <button 
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isOpen ? <X className="w-6 h-6 text-gray-650" /> : <Menu className="w-6 h-6 text-gray-650" />}
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
        w-72 bg-white border-r border-gray-200 text-gray-800
        flex flex-col h-full shadow-md lg:shadow-none transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Section */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-scb-green rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
            SC
          </div>
          <div className="text-left font-sans">
            <h1 className="font-bold text-gray-900 leading-none">SCB-GO</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">Sekolah Cendekia BAZNAS</p>
          </div>
        </div>

        {/* User Role Switcher Widget */}
        <div className="p-4 mx-4 mt-5 bg-gray-50 rounded-xl border border-gray-150 shadow-sm shrink-0">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Hak Akses Aktif</span>
            <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
              currentRole === 'Admin' ? 'bg-amber-100 text-amber-800' : 'bg-scb-light-green text-scb-green'
            }`}>
              {currentRole === 'Admin' ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              {currentRole}
            </span>
          </div>
          
          <button
            type="button"
            onClick={toggleRole}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white text-scb-green hover:bg-scb-light-green border border-gray-150 active:scale-[98%] font-semibold text-xs rounded-lg transition-all shadow-sm cursor-pointer"
          >
            Aktifkan {currentRole === 'Admin' ? 'Pemohon / Pegawai' : 'Admin Sarpras'}
          </button>
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
                    ? 'bg-scb-light-green text-scb-green font-semibold' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-scb-green' : 'text-gray-400 group-hover:text-gray-600'}`} />
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
        <div className="p-4 border-t border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-scb-green flex items-center justify-center text-white text-xs font-bold shrink-0">
              {currentRole === 'Admin' ? 'A' : 'P'}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-bold truncate text-gray-900">
                {currentRole === 'Admin' ? 'Admin Sarpras SCB' : 'Pegawai Cendekia'}
              </p>
              <p className="text-[10px] text-gray-500 truncate">
                {currentRole === 'Admin' ? 'admin@scbaznas.sch.id' : 'pegawai@baznas.sch.id'}
              </p>
            </div>
          </div>
          <div className="mt-2 text-center text-[10px] text-gray-400">
            <span>Kab. Bogor, Jawa Barat</span>
          </div>
        </div>
      </aside>
    </>
  );
}
