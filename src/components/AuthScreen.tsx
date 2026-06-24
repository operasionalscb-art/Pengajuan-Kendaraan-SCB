import React, { useState } from 'react';
import { UserProfile, AppRole } from '../types';
import { 
  ShieldCheck, 
  UserPlus, 
  LogIn, 
  Mail, 
  User, 
  Briefcase, 
  Info, 
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  
  // Register states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regJabatan, setRegJabatan] = useState('');
  
  // Feedback states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Quick Account presets for testing
  const presets = [
    {
      email: 'operasional.scb@gmail.com',
      nama: 'Super Admin Sarpras',
      jabatan: 'Kepala Bagian Sarpras',
      role: 'Admin' as AppRole,
      label: 'Super Admin'
    },
    {
      email: 'kesiswaan.cendekia@baznas.sch.id',
      nama: 'Ust. Ahmad Fauzi',
      jabatan: 'Wakasek Kesiswaan',
      role: 'Pemohon' as AppRole,
      label: 'Wakasek Kesiswaan'
    },
    {
      email: 'humas.cendekia@baznas.sch.id',
      nama: 'Ustz. Rahma Wardani',
      jabatan: 'Koordinator Humas',
      role: 'Pemohon' as AppRole,
      label: 'Koordinator Humas'
    }
  ];

  // Load existing accounts from localStorage or initialize with presets
  const getRegisteredUsers = (): UserProfile[] => {
    const saved = localStorage.getItem('scb_registered_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Return presets as initial users
    return presets.map(p => ({
      email: p.email,
      nama: p.nama,
      jabatan: p.jabatan,
      role: p.role
    }));
  };

  const saveRegisteredUsers = (users: UserProfile[]) => {
    localStorage.setItem('scb_registered_users', JSON.stringify(users));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const emailClean = loginEmail.trim().toLowerCase();
    if (!emailClean) {
      setErrorMsg('Silakan masukkan alamat email Anda.');
      return;
    }

    const users = getRegisteredUsers();
    let matchedUser = users.find(u => u.email.toLowerCase() === emailClean);

    // If the email is the super admin and not registered yet, register it dynamically
    if (!matchedUser && emailClean === 'operasional.scb@gmail.com') {
      matchedUser = {
        email: 'operasional.scb@gmail.com',
        nama: 'Super Admin Sarpras',
        jabatan: 'Kepala Bagian Sarpras',
        role: 'Admin'
      };
      const updatedUsers = [...users, matchedUser];
      saveRegisteredUsers(updatedUsers);
    }

    if (matchedUser) {
      setSuccessMsg(`Selamat datang kembali, ${matchedUser.nama}!`);
      setTimeout(() => {
        onLoginSuccess(matchedUser!);
      }, 800);
    } else {
      setErrorMsg('Email belum terdaftar. Silakan pilih tab "Daftar Akun" untuk mendaftarkan email baru Anda.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const nameClean = regName.trim();
    const emailClean = regEmail.trim().toLowerCase();
    const jabatanClean = regJabatan.trim();

    if (!nameClean || !emailClean || !jabatanClean) {
      setErrorMsg('Semua kolom pendaftaran wajib diisi.');
      return;
    }

    if (!emailClean.includes('@') || !emailClean.includes('.')) {
      setErrorMsg('Silakan masukkan format email yang valid.');
      return;
    }

    const users = getRegisteredUsers();
    const alreadyExists = users.some(u => u.email.toLowerCase() === emailClean);

    if (alreadyExists) {
      setErrorMsg('Email ini sudah terdaftar. Silakan gunakan tab "Masuk" untuk login.');
      return;
    }

    // Determine role: operasional.scb@gmail.com is forced to Admin, others default to Pemohon
    const determinedRole: AppRole = emailClean === 'operasional.scb@gmail.com' ? 'Admin' : 'Pemohon';

    const newUser: UserProfile = {
      email: emailClean,
      nama: nameClean,
      jabatan: jabatanClean,
      role: determinedRole
    };

    const updatedUsers = [...users, newUser];
    saveRegisteredUsers(updatedUsers);

    setSuccessMsg(`Pendaftaran Berhasil! Masuk sebagai ${newUser.role === 'Admin' ? 'Super Admin' : 'Pemohon'}.`);
    
    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 1000);
  };

  const handleQuickLogin = (preset: typeof presets[0]) => {
    setErrorMsg('');
    setSuccessMsg('');
    
    // Ensure preset is registered
    const users = getRegisteredUsers();
    const exists = users.some(u => u.email.toLowerCase() === preset.email.toLowerCase());
    if (!exists) {
      const updated = [...users, {
        email: preset.email,
        nama: preset.nama,
        jabatan: preset.jabatan,
        role: preset.role
      }];
      saveRegisteredUsers(updated);
    }

    setSuccessMsg(`Quick Login Berhasil: ${preset.nama}`);
    setTimeout(() => {
      onLoginSuccess({
        email: preset.email,
        nama: preset.nama,
        jabatan: preset.jabatan,
        role: preset.role
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 md:p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden transition-all">
        
        {/* Top Header Decorator */}
        <div className="bg-scb-green p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-white/10 rounded-full blur-xl" />
          
          <div className="mx-auto w-12 h-12 bg-white rounded-xl flex items-center justify-center text-scb-green font-black text-2xl shadow-md mb-3">
            SC
          </div>
          <h2 className="font-bold text-xl tracking-tight">SCB-GO</h2>
          <p className="text-[11px] text-emerald-100 uppercase tracking-widest font-semibold mt-0.5">
            Sekolah Cendekia BAZNAS
          </p>
          <p className="text-xs text-emerald-50/80 mt-1.5 max-w-xs mx-auto">
            Sistem Manajemen Peminjaman Kendaraan Operasional Sekolah Bebas Bentrok Jadwal
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3.5 text-center text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'login' 
                ? 'text-scb-green border-scb-green bg-white' 
                : 'text-gray-400 border-transparent hover:text-gray-700'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <LogIn className="w-4 h-4" /> Masuk Akun
            </span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3.5 text-center text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'register' 
                ? 'text-scb-green border-scb-green bg-white' 
                : 'text-gray-400 border-transparent hover:text-gray-700'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" /> Daftar Akun
            </span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Notification Alert / Success Badge */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-start gap-2.5 animate-pulse">
              <Info className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-start gap-2.5 animate-bounce">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Login */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-700 block">Alamat Email Kerja</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-450">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </span>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@baznas.sch.id atau gmail"
                    className="w-full text-xs pl-10 pr-3.5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-scb-green focus:border-scb-green transition-all"
                  />
                </div>
                <p className="text-[10px] text-gray-400 leading-tight">
                  Masukkan email yang telah Anda daftarkan sebelumnya.
                </p>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-scb-green hover:bg-emerald-700 active:scale-[99%] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer mt-2"
              >
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Form Register */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-700 block">Nama Lengkap</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <User className="w-4 h-4 text-gray-400" />
                  </span>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Ust. Ahmad, S.Pd"
                    className="w-full text-xs pl-10 pr-3.5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-scb-green focus:border-scb-green transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-700 block">Alamat Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </span>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nama.pegawai@baznas.sch.id"
                    className="w-full text-xs pl-10 pr-3.5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-scb-green focus:border-scb-green transition-all"
                  />
                </div>
                <div className="p-2.5 bg-blue-50/80 rounded-lg text-[10px] text-blue-700 font-semibold border border-blue-100 flex items-start gap-1.5 leading-normal mt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Gunakan email <strong className="text-blue-800">operasional.scb@gmail.com</strong> untuk mendaftar sebagai <strong>Super Admin Sarpras</strong>.</span>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-700 block">Jabatan / Bagian</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                  </span>
                  <input
                    type="text"
                    value={regJabatan}
                    onChange={(e) => setRegJabatan(e.target.value)}
                    placeholder="Contoh: Humas, Guru Tahfidz, Pembina OSIS"
                    className="w-full text-xs pl-10 pr-3.5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-scb-green focus:border-scb-green transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-scb-green hover:bg-emerald-700 active:scale-[99%] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer mt-2"
              >
                <span>Daftar &amp; Masuk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Preset / Quick Login Section */}
          <div className="pt-5 border-t border-gray-100 space-y-3">
            <div className="flex items-center gap-2 text-gray-400">
              <span className="h-px bg-gray-200 flex-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Demo / Quick Login</span>
              <span className="h-px bg-gray-200 flex-1" />
            </div>

            <div className="grid grid-cols-1 gap-2">
              {presets.map((p) => (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => handleQuickLogin(p)}
                  className="w-full text-left p-2.5 bg-gray-50 hover:bg-scb-light-green border border-gray-200 rounded-xl hover:border-scb-green/40 transition-all flex items-center justify-between group cursor-pointer text-xs"
                >
                  <div className="overflow-hidden">
                    <p className="font-bold text-gray-800 leading-tight group-hover:text-scb-green transition-colors">
                      {p.nama}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">
                      {p.email} • {p.jabatan}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-tight uppercase shrink-0 ${
                    p.role === 'Admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
