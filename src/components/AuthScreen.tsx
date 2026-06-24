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
  ArrowRight,
  CheckCircle2,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  RefreshCw,
  LogOut,
  Settings
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

export default function AuthScreen({ onLoginSuccess, currentUser, onLogout }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  
  // Register states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regJabatan, setRegJabatan] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  
  // Change Password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showChangePass, setShowChangePass] = useState(false);

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
      label: 'Super Admin',
      password: 'admin123'
    },
    {
      email: 'kesiswaan.cendekia@baznas.sch.id',
      nama: 'Ust. Ahmad Fauzi',
      jabatan: 'Wakasek Kesiswaan',
      role: 'Pemohon' as AppRole,
      label: 'Wakasek Kesiswaan',
      password: 'pegawai123'
    },
    {
      email: 'humas.cendekia@baznas.sch.id',
      nama: 'Ustz. Rahma Wardani',
      jabatan: 'Koordinator Humas',
      role: 'Pemohon' as AppRole,
      label: 'Koordinator Humas',
      password: 'pegawai123'
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
      role: p.role,
      password: p.password
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
    if (!loginPassword) {
      setErrorMsg('Silakan masukkan password akun Anda.');
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
        role: 'Admin',
        password: 'admin123'
      };
      const updatedUsers = [...users, matchedUser];
      saveRegisteredUsers(updatedUsers);
    }

    if (matchedUser) {
      const correctPassword = matchedUser.password || (matchedUser.role === 'Admin' ? 'admin123' : 'pegawai123');
      if (correctPassword === loginPassword) {
        setSuccessMsg(`Selamat datang kembali, ${matchedUser.nama}!`);
        setTimeout(() => {
          onLoginSuccess(matchedUser!);
        }, 800);
      } else {
        setErrorMsg('Password yang Anda masukkan salah. Silakan coba lagi.');
      }
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

    if (!nameClean || !emailClean || !jabatanClean || !regPassword || !regPasswordConfirm) {
      setErrorMsg('Semua kolom pendaftaran wajib diisi.');
      return;
    }

    if (!emailClean.includes('@') || !emailClean.includes('.')) {
      setErrorMsg('Silakan masukkan format email yang valid.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password minimal harus terdiri dari 6 karakter.');
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      setErrorMsg('Konfirmasi password tidak cocok dengan password baru.');
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
      role: determinedRole,
      password: regPassword
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
    const exists = users.find(u => u.email.toLowerCase() === preset.email.toLowerCase());
    if (!exists) {
      const updated = [...users, {
        email: preset.email,
        nama: preset.nama,
        jabatan: preset.jabatan,
        role: preset.role,
        password: preset.password
      }];
      saveRegisteredUsers(updated);
    }

    setSuccessMsg(`Quick Login Berhasil: ${preset.nama}`);
    setTimeout(() => {
      onLoginSuccess({
        email: preset.email,
        nama: preset.nama,
        jabatan: preset.jabatan,
        role: preset.role,
        password: preset.password
      });
    }, 600);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentUser) return;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setErrorMsg('Semua kolom pengelolaan password wajib diisi.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password baru minimal terdiri dari 6 karakter.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Konfirmasi password baru tidak cocok.');
      return;
    }

    const users = getRegisteredUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());

    if (userIndex === -1) {
      // Create user if not exists
      const newUserRecord = {
        ...currentUser,
        password: newPassword
      };
      users.push(newUserRecord);
      saveRegisteredUsers(users);
    } else {
      const registeredUser = users[userIndex];
      const actualCurrentPassword = registeredUser.password || (registeredUser.role === 'Admin' ? 'admin123' : 'pegawai123');

      if (actualCurrentPassword !== oldPassword) {
        setErrorMsg('Password lama yang Anda masukkan salah.');
        return;
      }

      users[userIndex].password = newPassword;
      saveRegisteredUsers(users);
    }

    // Update active user in storage
    const updatedUserSession = { ...currentUser, password: newPassword };
    localStorage.setItem('scb_active_user', JSON.stringify(updatedUserSession));

    setSuccessMsg('Password berhasil diperbarui secara aman!');
    
    // Clear fields
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  // If already logged in, show user account profile & password management section!
  if (currentUser) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Header Summary */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm p-6 text-left space-y-4">
          <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div className="p-3 bg-scb-light-green dark:bg-emerald-950/40 text-scb-green dark:text-emerald-400 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-neutral-100">Profil Pengguna Aktif</h2>
              <p className="text-xs text-gray-500 dark:text-neutral-400">Informasi kredensial dan hak akses sesi Anda saat ini</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-gray-50 dark:bg-neutral-850 rounded-xl border border-gray-150 dark:border-neutral-850">
              <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase block mb-0.5">Nama Lengkap</span>
              <span className="font-bold text-gray-800 dark:text-neutral-200">{currentUser.nama}</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-neutral-850 rounded-xl border border-gray-150 dark:border-neutral-850">
              <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase block mb-0.5">Email</span>
              <span className="font-bold text-gray-800 dark:text-neutral-200">{currentUser.email}</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-neutral-850 rounded-xl border border-gray-150 dark:border-neutral-850">
              <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase block mb-0.5">Jabatan / Bagian</span>
              <span className="font-bold text-gray-800 dark:text-neutral-200">{currentUser.jabatan}</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-neutral-850 rounded-xl border border-gray-150 dark:border-neutral-850">
              <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase block mb-0.5">Hak Akses</span>
              <span className={`inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-bold uppercase ${
                currentUser.role === 'Admin' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400'
              }`}>
                {currentUser.role === 'Admin' ? 'Super Admin' : 'Pemohon (Pegawai)'}
              </span>
            </div>
          </div>

          {onLogout && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 py-2 px-4 bg-red-50 dark:bg-red-950/25 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-650 dark:text-red-400 font-bold text-xs rounded-xl border border-red-200 dark:border-red-900/40 transition-all cursor-pointer"
                id="btn-profile-logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Sesi</span>
              </button>
            </div>
          )}
        </div>

        {/* Change Password Panel */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm p-6 text-left space-y-4">
          <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div className="p-3 bg-orange-50 dark:bg-amber-950/40 text-orange-600 dark:text-amber-450 rounded-xl">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-neutral-100">Pengelolaan Sandi (Password)</h2>
              <p className="text-xs text-gray-500 dark:text-neutral-400">Perbarui kunci pengaman masuk akun Anda secara berkala</p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-xl flex items-start gap-2.5">
              <Info className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-start gap-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4" id="form-manage-password">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block">Password Lama</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-450">
                  <Lock className="w-4 h-4 text-gray-400" />
                </span>
                <input
                  type={showChangePass ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan password saat ini (Contoh: admin123)"
                  className="w-full text-xs pl-10 pr-10 py-3 border border-gray-300 dark:border-neutral-700 rounded-xl bg-transparent dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-scb-green focus:border-scb-green transition-all"
                  id="input-old-password"
                />
                <button
                  type="button"
                  onClick={() => setShowChangePass(!showChangePass)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-450 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300 cursor-pointer"
                >
                  {showChangePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block">Password Baru</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-450">
                    <KeyRound className="w-4 h-4 text-gray-400" />
                  </span>
                  <input
                    type={showChangePass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full text-xs pl-10 pr-3.5 py-3 border border-gray-300 dark:border-neutral-700 rounded-xl bg-transparent dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-scb-green focus:border-scb-green transition-all"
                    id="input-new-password"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block">Konfirmasi Password Baru</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-450">
                    <KeyRound className="w-4 h-4 text-gray-400" />
                  </span>
                  <input
                    type={showChangePass ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Ketik ulang password baru"
                    className="w-full text-xs pl-10 pr-3.5 py-3 border border-gray-300 dark:border-neutral-700 rounded-xl bg-transparent dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-scb-green focus:border-scb-green transition-all"
                    id="input-confirm-new-password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-scb-green hover:bg-emerald-700 active:scale-[99%] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer mt-2"
              id="btn-update-password"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span>Simpan Kunci Baru</span>
            </button>
          </form>
        </div>

      </div>
    );
  }

  // Not logged in: standard authorization with password protection
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-2 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-xl overflow-hidden transition-all">
        
        {/* Top Header Decorator */}
        <div className="bg-scb-green p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-white/10 rounded-full blur-xl" />
          
          <div className="mx-auto w-12 h-12 bg-white rounded-xl flex items-center justify-center text-scb-green font-black text-2xl shadow-md mb-3">
            SC
          </div>
          <h2 className="font-bold text-xl tracking-tight">Login Super Admin SCB-GO</h2>
          <p className="text-[11px] text-emerald-100 uppercase tracking-widest font-semibold mt-0.5">
            Sekolah Cendekia BAZNAS
          </p>
          <p className="text-xs text-emerald-50/80 mt-1.5 max-w-xs mx-auto">
            Halaman ini digunakan untuk verifikasi login Super Admin Sarpras guna mengelola armada & persetujuan ajuan.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-850/50">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3.5 text-center text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'login' 
                ? 'text-scb-green border-scb-green bg-white dark:bg-neutral-900 dark:text-emerald-400 dark:border-emerald-400' 
                : 'text-gray-400 border-transparent hover:text-gray-750 dark:hover:text-neutral-250'
            }`}
            id="tab-select-login"
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
                ? 'text-scb-green border-scb-green bg-white dark:bg-neutral-900 dark:text-emerald-400 dark:border-emerald-400' 
                : 'text-gray-400 border-transparent hover:text-gray-750 dark:hover:text-neutral-250'
            }`}
            id="tab-select-register"
          >
            <span className="flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" /> Daftar Akun
            </span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 md:p-8 space-y-6 bg-white dark:bg-neutral-900">
          
          {/* Notification Alert / Success Badge */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs font-semibold rounded-xl flex items-start gap-2.5 animate-pulse" id="alert-error-auth">
              <Info className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-start gap-2.5 animate-bounce" id="alert-success-auth">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Login */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4" id="form-login-auth">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block">Alamat Email Kerja</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-450">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </span>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@baznas.sch.id atau gmail"
                    className="w-full text-xs pl-10 pr-3.5 py-3 border border-gray-300 dark:border-neutral-700 rounded-xl bg-transparent dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-scb-green focus:border-scb-green transition-all"
                    id="input-login-email"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block">Password Pengaman</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-450">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </span>
                  <input
                    type={showLoginPass ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Sandi keamanan akun Anda"
                    className="w-full text-xs pl-10 pr-10 py-3 border border-gray-300 dark:border-neutral-700 rounded-xl bg-transparent dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-scb-green focus:border-scb-green transition-all"
                    id="input-login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-450 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300 cursor-pointer"
                    id="btn-toggle-login-pass"
                  >
                    {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-scb-green hover:bg-emerald-700 active:scale-[99%] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer mt-2"
                id="btn-submit-login"
              >
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Form Register */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4" id="form-register-auth">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block">Nama Lengkap</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <User className="w-4 h-4 text-gray-400" />
                  </span>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Ust. Ahmad, S.Pd"
                    className="w-full text-xs pl-10 pr-3.5 py-3 border border-gray-300 dark:border-neutral-700 rounded-xl bg-transparent dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-scb-green focus:border-scb-green transition-all"
                    id="input-register-name"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block">Alamat Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </span>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nama.pegawai@baznas.sch.id"
                    className="w-full text-xs pl-10 pr-3.5 py-3 border border-gray-300 dark:border-neutral-700 rounded-xl bg-transparent dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-scb-green focus:border-scb-green transition-all"
                    id="input-register-email"
                  />
                </div>
                <div className="p-2.5 bg-blue-50/80 dark:bg-blue-950/20 rounded-lg text-[10px] text-blue-700 dark:text-blue-400 font-semibold border border-blue-100 dark:border-blue-900/30 flex items-start gap-1.5 leading-normal mt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
                  <span>Daftarkan email <strong className="text-blue-805 dark:text-blue-300">operasional.scb@gmail.com</strong> sebagai <strong>Super Admin Sarpras</strong>.</span>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block">Jabatan / Bagian</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                  </span>
                  <input
                    type="text"
                    value={regJabatan}
                    onChange={(e) => setRegJabatan(e.target.value)}
                    placeholder="Contoh: Humas, Guru Tahfidz, Pembina OSIS"
                    className="w-full text-xs pl-10 pr-3.5 py-3 border border-gray-300 dark:border-neutral-700 rounded-xl bg-transparent dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-scb-green focus:border-scb-green transition-all"
                    id="input-register-jabatan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block">Sandi (Password)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </span>
                    <input
                      type={showRegPass ? "text" : "password"}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 karakter"
                      className="w-full text-xs pl-10 pr-10 py-3 border border-gray-300 dark:border-neutral-700 rounded-xl bg-transparent dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-scb-green focus:border-scb-green transition-all"
                      id="input-register-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPass(!showRegPass)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-450 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300 cursor-pointer"
                      id="btn-toggle-reg-pass"
                    >
                      {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block">Konfirmasi Sandi</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </span>
                    <input
                      type={showRegPass ? "text" : "password"}
                      value={regPasswordConfirm}
                      onChange={(e) => setRegPasswordConfirm(e.target.value)}
                      placeholder="Ulangi sandi"
                      className="w-full text-xs pl-10 pr-3.5 py-3 border border-gray-300 dark:border-neutral-700 rounded-xl bg-transparent dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-scb-green focus:border-scb-green transition-all"
                      id="input-register-password-confirm"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-scb-green hover:bg-emerald-700 active:scale-[99%] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer mt-2"
                id="btn-submit-register"
              >
                <span>Daftar &amp; Masuk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
