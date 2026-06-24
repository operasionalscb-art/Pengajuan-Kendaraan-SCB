import React, { useState, useEffect } from 'react';
import { UserProfile, AppRole } from '../types';
import { subscribeUsers, addOrUpdateUser, deleteUserDoc } from '../lib/firebase';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Edit2, 
  Shield, 
  ShieldAlert, 
  Check, 
  X, 
  Mail, 
  User, 
  Briefcase, 
  Lock, 
  Key, 
  Search,
  CheckCircle2,
  Info
} from 'lucide-react';

interface AccountManagerProps {
  currentUser: UserProfile | null;
  onUpdateCurrentUser: (user: UserProfile) => void;
  pushNotification: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'alert') => void;
}

export default function AccountManager({ currentUser, onUpdateCurrentUser, pushNotification }: AccountManagerProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create / Edit states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<string | null>(null); // null = creating new
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formJabatan, setFormJabatan] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<AppRole>('Pemohon');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Real-time user loading from Firestore
  useEffect(() => {
    const unsubscribe = subscribeUsers((firestoreUsers) => {
      setUsers(firestoreUsers);
    });
    return () => unsubscribe();
  }, []);

  const openAddForm = () => {
    setEditingEmail(null);
    setFormName('');
    setFormEmail('');
    setFormJabatan('');
    setFormPassword('');
    setFormRole('Pemohon');
    setErrorMsg('');
    setSuccessMsg('');
    setIsFormOpen(true);
  };

  const openEditForm = (user: UserProfile) => {
    setEditingEmail(user.email);
    setFormName(user.nama);
    setFormEmail(user.email);
    setFormJabatan(user.jabatan);
    setFormPassword(user.password || 'pegawai123');
    setFormRole(user.role);
    setErrorMsg('');
    setSuccessMsg('');
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const nameClean = formName.trim();
    const emailClean = formEmail.trim().toLowerCase();
    const jabatanClean = formJabatan.trim();
    const passwordClean = formPassword.trim();

    if (!nameClean || !emailClean || !jabatanClean || !passwordClean) {
      setErrorMsg('Semua kolom wajib diisi.');
      return;
    }

    if (!emailClean.includes('@') || !emailClean.includes('.')) {
      setErrorMsg('Silakan masukkan format email yang valid.');
      return;
    }

    if (passwordClean.length < 6) {
      setErrorMsg('Sandi pengaman minimal harus 6 karakter.');
      return;
    }

    if (editingEmail === null) {
      // Create new user mode
      const alreadyExists = users.some(u => u.email.toLowerCase() === emailClean);
      if (alreadyExists) {
        setErrorMsg('Email ini sudah terdaftar. Gunakan alamat email lain.');
        return;
      }

      const newUser: UserProfile = {
        email: emailClean,
        nama: nameClean,
        jabatan: jabatanClean,
        role: formRole,
        password: passwordClean
      };

      addOrUpdateUser(newUser).then(() => {
        pushNotification(
          'Akun Baru Ditambahkan',
          `Akun ${newUser.nama} (${newUser.role}) berhasil ditambahkan ke database sistem.`,
          'success'
        );
        setSuccessMsg('Akun baru berhasil ditambahkan!');
      }).catch(e => {
        console.error(e);
        setErrorMsg('Gagal menambahkan akun ke database.');
      });
    } else {
      // Edit mode
      const existingUser = users.find(u => u.email.toLowerCase() === editingEmail.toLowerCase());
      if (!existingUser) {
        setErrorMsg('Akun yang diedit tidak ditemukan.');
        return;
      }

      // Check if email changed and is already taken
      if (editingEmail.toLowerCase() !== emailClean) {
        const alreadyExists = users.some(u => u.email.toLowerCase() === emailClean);
        if (alreadyExists) {
          setErrorMsg('Email baru ini sudah digunakan oleh akun lain.');
          return;
        }
        // Delete old email record if changed
        deleteUserDoc(editingEmail);
      }

      const updatedUser: UserProfile = {
        email: emailClean,
        nama: nameClean,
        jabatan: jabatanClean,
        role: formRole,
        password: passwordClean
      };

      addOrUpdateUser(updatedUser).then(() => {
        // If editing self, update the current active user session!
        if (currentUser && currentUser.email.toLowerCase() === editingEmail.toLowerCase()) {
          onUpdateCurrentUser(updatedUser);
        }

        pushNotification(
          'Akun Diperbarui',
          `Informasi profil dan hak akses akun ${updatedUser.nama} berhasil disimpan.`,
          'info'
        );
        setSuccessMsg('Informasi akun berhasil disimpan!');
      }).catch(e => {
        console.error(e);
        setErrorMsg('Gagal memperbarui akun di database.');
      });
    }

    setTimeout(() => {
      setIsFormOpen(false);
      setErrorMsg('');
      setSuccessMsg('');
    }, 1000);
  };

  const handleDeleteUser = (email: string, name: string) => {
    if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan saat ini!');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus akun ${name} (${email}) secara permanen? Sesi masuk akun tersebut akan dicabut.`)) {
      deleteUserDoc(email).then(() => {
        pushNotification(
          'Akun Dihapus',
          `Akun milik ${name} telah dibersihkan secara permanen dari sistem.`,
          'alert'
        );
      }).catch(e => {
        console.error(e);
        alert('Gagal menghapus akun.');
      });
    }
  };

  const handleToggleRoleDirect = (user: UserProfile) => {
    if (currentUser && currentUser.email.toLowerCase() === user.email.toLowerCase()) {
      alert('Anda tidak bisa mengubah hak akses akun Anda sendiri secara langsung untuk mencegah kehilangan akses Admin!');
      return;
    }

    const newRole: AppRole = user.role === 'Admin' ? 'Pemohon' : 'Admin';
    const updatedUser = { ...user, role: newRole };
    addOrUpdateUser(updatedUser).then(() => {
      pushNotification(
        'Hak Akses Diperbarui',
        `Hak akses untuk ${user.nama} berhasil diubah menjadi ${newRole === 'Admin' ? 'SUPER ADMIN' : 'PEMOHON (PEGAWAI)'}.`,
        'info'
      );
    }).catch(e => {
      console.error(e);
      alert('Gagal mengubah hak akses.');
    });
  };

  const filteredUsers = users.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    return (
      u.nama.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) ||
      u.jabatan.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 text-left">
      {/* Tab Header Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-neutral-100 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-scb-green" />
            Pengelolaan Akun & Hak Akses
          </h2>
          <p className="text-xs text-gray-500 dark:text-neutral-400 font-medium mt-1">
            Manajemen otentikasi kredensial, perizinan, dan penentuan hak akses pengguna sistem SCB-GO.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center gap-1.5 py-2.5 px-4 bg-scb-green hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer shrink-0"
          id="btn-add-new-account"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* Main layout container with lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Users Search & Table */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
          
          {/* Filter Bar */}
          <div className="p-4 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/50 flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Cari nama, email, atau jabatan pegawai..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-scb-green focus:border-scb-green text-gray-800 dark:text-neutral-200"
                id="search-accounts"
              />
            </div>
            <div className="text-[11px] font-bold text-gray-450 dark:text-neutral-400 shrink-0 bg-white dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-700">
              Total: {filteredUsers.length} Akun
            </div>
          </div>

          {/* Accounts List Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-neutral-850">
                  <th className="py-3 px-4">Nama Lengkap &amp; Email</th>
                  <th className="py-3 px-4">Jabatan</th>
                  <th className="py-3 px-4 text-center">Hak Akses</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-850 text-xs">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400 dark:text-neutral-500 font-medium">
                      Tidak ada akun pegawai yang cocok dengan kata pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelf = currentUser?.email.toLowerCase() === user.email.toLowerCase();
                    return (
                      <tr key={user.email} className="hover:bg-gray-55/60 dark:hover:bg-neutral-850/30 transition-colors">
                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800 dark:text-neutral-200">
                              {user.nama}
                            </span>
                            {isSelf && (
                              <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 text-[8px] font-black rounded uppercase tracking-wider">
                                Sesi Anda
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-mono block">
                            {user.email}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-neutral-350 font-semibold">
                          {user.jabatan}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleRoleDirect(user)}
                            disabled={isSelf}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all shadow-sm ${
                              isSelf ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'
                            } ${
                              user.role === 'Admin'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/40'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/40'
                            }`}
                            title={isSelf ? "Tidak bisa mengubah diri sendiri" : "Klik untuk toggle hak akses secara langsung"}
                            id={`toggle-role-${user.email.split('@')[0]}`}
                          >
                            <Shield className="w-3 h-3" />
                            <span>{user.role === 'Admin' ? 'Super Admin' : 'Pemohon'}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditForm(user)}
                              className="p-1.5 text-gray-500 hover:text-scb-green hover:bg-scb-light-green dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                              title="Edit Profil"
                              id={`btn-edit-user-${user.email.split('@')[0]}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={isSelf}
                              onClick={() => handleDeleteUser(user.email, user.nama)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isSelf 
                                  ? 'text-gray-200 dark:text-neutral-800 cursor-not-allowed' 
                                  : 'text-red-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-neutral-850 cursor-pointer'
                              }`}
                              title={isSelf ? "Tidak bisa menghapus akun sendiri" : "Hapus Akun"}
                              id={`btn-delete-user-${user.email.split('@')[0]}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-neutral-850 bg-gray-50/30 dark:bg-neutral-900/30 text-[11px] text-gray-550 dark:text-neutral-450 flex items-start gap-2">
            <Info className="w-4 h-4 text-scb-green shrink-0 mt-0.5" />
            <span>
              <strong>Keterangan Hak Akses:</strong> Akun berstatus <strong>Super Admin</strong> dapat melakukan verifikasi, memberi status disetujui/ditolak, serta mengatur parameter armada. Akun <strong>Pemohon</strong> dapat mengisi formulir pengajuan dan melacak progres. Klik lencana hak akses di atas untuk mengubah perizinan dengan cepat.
            </span>
          </div>

        </div>

        {/* Right Side: Quick Account Form Pane */}
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden p-6 text-left transition-colors">
          {isFormOpen ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
                <h3 className="font-bold text-sm text-gray-900 dark:text-neutral-100">
                  {editingEmail === null ? 'Tambah Akun Pegawai' : 'Sunting Detail Akun'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-700 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/30 text-red-700 dark:text-red-400 text-[11px] font-semibold rounded-xl flex items-start gap-2 animate-pulse">
                  <Info className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold rounded-xl flex items-start gap-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-3.5" id="form-account-editor">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block">Nama Lengkap</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Contoh: Ust. Hamdan, S.Th.I"
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-scb-green focus:border-scb-green text-gray-800 dark:text-neutral-200"
                      id="form-user-name"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block">Alamat Email Kerja</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="nama@baznas.sch.id"
                      disabled={editingEmail !== null}
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-scb-green focus:border-scb-green text-gray-800 dark:text-neutral-200 disabled:bg-gray-100 dark:disabled:bg-neutral-850 disabled:text-gray-400 dark:disabled:text-neutral-500"
                      id="form-user-email"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block">Jabatan / Bagian</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={formJabatan}
                      onChange={(e) => setFormJabatan(e.target.value)}
                      placeholder="Contoh: Pembina Boarding, Guru Tahfidz"
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-scb-green focus:border-scb-green text-gray-800 dark:text-neutral-200"
                      id="form-user-jabatan"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block">Password Pengaman</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Sandi login akun baru"
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-scb-green focus:border-scb-green text-gray-800 dark:text-neutral-200"
                      id="form-user-password"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block">Penentuan Hak Akses</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormRole('Pemohon')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        formRole === 'Pemohon'
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-250 dark:border-blue-800 shadow-sm'
                          : 'bg-white dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border-gray-200 dark:border-neutral-700 hover:bg-gray-50'
                      }`}
                      id="btn-select-pemohon-role"
                    >
                      <span>Pemohon</span>
                      {formRole === 'Pemohon' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormRole('Admin')}
                      disabled={currentUser?.email.toLowerCase() === formEmail.toLowerCase()}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        formRole === 'Admin'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-250 dark:border-amber-800 shadow-sm'
                          : 'bg-white dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border-gray-200 dark:border-neutral-700 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      id="btn-select-admin-role"
                    >
                      <span>Super Admin</span>
                      {formRole === 'Admin' && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-gray-650 dark:text-neutral-300 text-xs font-bold rounded-xl border border-gray-250 dark:border-neutral-700 transition-all cursor-pointer text-center"
                    id="btn-cancel-form"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-scb-green hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer text-center"
                    id="btn-save-form"
                  >
                    Simpan Akun
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="py-8 text-center space-y-4 animate-in fade-in duration-150">
              <div className="w-16 h-16 bg-scb-light-green dark:bg-emerald-950/40 text-scb-green dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="max-w-xs mx-auto space-y-1.5">
                <h3 className="font-bold text-sm text-gray-800 dark:text-neutral-200">Panel Interaksi Akun</h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400 leading-normal">
                  Pilih salah satu tombol edit (<Edit2 className="w-3 h-3 inline" />) di samping nama pegawai untuk menyunting, atau tekan tombol tambah di atas untuk mendaftarkan akun baru.
                </p>
              </div>
              <button
                type="button"
                onClick={openAddForm}
                className="py-2.5 px-4 bg-gray-50 dark:bg-neutral-850 hover:bg-scb-light-green dark:hover:bg-neutral-800 text-scb-green dark:text-emerald-400 text-xs font-bold rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 transition-all cursor-pointer"
                id="btn-pane-add-account"
              >
                + Tambah Akun Baru
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
