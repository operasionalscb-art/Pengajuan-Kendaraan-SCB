import React, { useState, useEffect } from 'react';
import { EmailNotificationLog, EmailSettings, AppRole, UserProfile } from '../types';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Eye, 
  Copy, 
  ExternalLink, 
  Settings2, 
  RefreshCw, 
  Filter, 
  Search, 
  X,
  SlidersHorizontal,
  Check,
  Bell,
  Sparkles,
  Inbox
} from 'lucide-react';
import { sendOperatorEmailNotification } from '../lib/emailNotifier';

interface EmailNotificationManagerProps {
  emailLogs: EmailNotificationLog[];
  emailSettings: EmailSettings;
  onSaveSettings: (settings: EmailSettings) => void;
  onDeleteLog: (logId: string) => void;
  currentUser: UserProfile | null;
  currentRole: AppRole;
}

export default function EmailNotificationManager({
  emailLogs,
  emailSettings,
  onSaveSettings,
  onDeleteLog,
  currentUser,
  currentRole
}: EmailNotificationManagerProps) {
  // Local state for settings edit
  const [operatorEmailInput, setOperatorEmailInput] = useState(emailSettings.operatorEmail || 'operasional.scb@gmail.com, operator.scb@gmail.com');
  const [notifyNewBooking, setNotifyNewBooking] = useState(emailSettings.notifyNewBooking ?? true);
  const [notifyStatusChange, setNotifyStatusChange] = useState(emailSettings.notifyStatusChange ?? true);
  const [notifyUserRegistration, setNotifyUserRegistration] = useState(emailSettings.notifyUserRegistration ?? true);
  const [enableDirectMailto, setEnableDirectMailto] = useState(emailSettings.enableDirectMailto ?? true);

  useEffect(() => {
    setOperatorEmailInput(emailSettings.operatorEmail || 'operasional.scb@gmail.com, operator.scb@gmail.com');
    setNotifyNewBooking(emailSettings.notifyNewBooking ?? true);
    setNotifyStatusChange(emailSettings.notifyStatusChange ?? true);
    setNotifyUserRegistration(emailSettings.notifyUserRegistration ?? true);
    setEnableDirectMailto(emailSettings.enableDirectMailto ?? true);
  }, [emailSettings]);

  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Preview Modal state
  const [previewLog, setPreviewLog] = useState<EmailNotificationLog | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Test Email Modal state
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState(operatorEmailInput.split(',')[0].trim() || 'operasional.scb@gmail.com');
  const [testSubject, setTestSubject] = useState('[SCB-GO Tes] Pengujian Sistem Notifikasi Email Operator');
  const [testBody, setTestBody] = useState('Halo Operator Sarpras,\n\nIni adalah pesan email uji coba dari sistem manajemen armada Sekolah Cendekia BAZNAS (SCB-GO).\nSistem notifikasi email siap mengirimkan laporan peminjaman kendaraan secara otomatis.\n\nSalam,\nTim Pengembang SCB-GO');
  const [testSending, setTestSending] = useState(false);
  const [testSuccessMsg, setTestSuccessMsg] = useState('');

  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    
    const newSettings: EmailSettings = {
      operatorEmail: operatorEmailInput,
      notifyNewBooking,
      notifyStatusChange,
      notifyUserRegistration,
      enableDirectMailto
    };

    onSaveSettings(newSettings);
    setTimeout(() => {
      setIsSavingSettings(false);
      setSettingsSavedMsg('Pengaturan notifikasi email operator berhasil diperbarui!');
      setTimeout(() => setSettingsSavedMsg(''), 3000);
    }, 400);
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestSending(true);
    setTestSuccessMsg('');

    try {
      await sendOperatorEmailNotification({
        recipientEmail: testRecipient,
        recipientName: 'Operator Sarpras (Uji Coba)',
        recipientRole: 'Operator',
        subject: testSubject,
        body: testBody,
        triggerEvent: 'Tes Notifikasi'
      });

      setTestSending(false);
      setTestSuccessMsg('Email notifikasi uji coba berhasil diproses & tercatat di log outbox!');
      setTimeout(() => {
        setIsTestModalOpen(false);
        setTestSuccessMsg('');
      }, 2000);
    } catch (err) {
      console.error(err);
      setTestSending(false);
      alert('Gagal mengirim email uji coba.');
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handleOpenGmailCompose = (recipient: string, subject: string, body: string) => {
    const encodedTo = encodeURIComponent(recipient);
    const encodedSub = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedTo}&su=${encodedSub}&body=${encodedBody}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenNativeMailto = (recipient: string, subject: string, body: string) => {
    const encodedTo = encodeURIComponent(recipient);
    const encodedSub = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    window.location.href = `mailto:${encodedTo}?subject=${encodedSub}&body=${encodedBody}`;
  };

  // Filtering
  const filteredLogs = emailLogs.filter((log) => {
    const matchesSearch = 
      log.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.body.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && log.triggerEvent === selectedFilter;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-[#0F8A5F] to-emerald-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4 pointer-events-none">
          <Mail className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              Sistem Notifikasi Email Operator SCB-GO
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              Pusat Notifikasi Email Operator
            </h2>
            <p className="text-xs text-emerald-100/90 max-w-xl">
              Pengiriman notifikasi email otomatis ke akun operator untuk pengajuan kendaraan baru, status approval, dan pendaftaran pengguna.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsTestModalOpen(true)}
              className="px-4 py-2 bg-white hover:bg-emerald-50 active:scale-95 text-emerald-900 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-emerald-700" />
              Tes Kirim Email
            </button>
          </div>
        </div>
      </div>

      {/* Settings Box & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-1 bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-lg">
                <Settings2 className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-neutral-100">
                Pengaturan Email Operator
              </h3>
            </div>
          </div>

          {settingsSavedMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl border border-emerald-200/50 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{settingsSavedMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettingsSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block">
                Email Operator Tujuan
              </label>
              <p className="text-[10px] text-gray-500 dark:text-neutral-400">
                Gunakan koma untuk beberapa email (contoh: operasional.scb@gmail.com, operator.scb@gmail.com)
              </p>
              <input
                type="text"
                value={operatorEmailInput}
                onChange={(e) => setOperatorEmailInput(e.target.value)}
                placeholder="operasional.scb@gmail.com"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-neutral-800">
              <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block">
                Pemicu Notifikasi Otomatis
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                <span className="text-gray-700 dark:text-neutral-300 font-medium">Pengajuan Peminjaman Baru</span>
                <input
                  type="checkbox"
                  checked={notifyNewBooking}
                  onChange={(e) => setNotifyNewBooking(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                <span className="text-gray-700 dark:text-neutral-300 font-medium">Pendaftaran Pegawai Baru</span>
                <input
                  type="checkbox"
                  checked={notifyUserRegistration}
                  onChange={(e) => setNotifyUserRegistration(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                <span className="text-gray-700 dark:text-neutral-300 font-medium">Update Status Approval Peminjaman</span>
                <input
                  type="checkbox"
                  checked={notifyStatusChange}
                  onChange={(e) => setNotifyStatusChange(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                <span className="text-gray-700 dark:text-neutral-300 font-medium">Tautan Langsung Aplikasi Email (`mailto:`)</span>
                <input
                  type="checkbox"
                  checked={enableDirectMailto}
                  onChange={(e) => setEnableDirectMailto(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSavingSettings}
              className="w-full py-2.5 bg-[#0F8A5F] hover:bg-[#0D7752] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSavingSettings ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Simpan Pengaturan Email
                </>
              )}
            </button>
          </form>
        </div>

        {/* Stats Cards & Outbox Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 mb-2">
                <span className="text-xs font-semibold">Total Email Outbox</span>
                <Mail className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-neutral-100">
                {emailLogs.length}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1">Tercatat di Sistem</span>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 mb-2">
                <span className="text-xs font-semibold">Pengajuan Baru</span>
                <Bell className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-neutral-100">
                {emailLogs.filter(l => l.triggerEvent === 'Pengajuan Baru').length}
              </p>
              <span className="text-[10px] text-amber-600 font-semibold mt-1">Notifikasi Operator</span>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 mb-2">
                <span className="text-xs font-semibold">Approval & Akun</span>
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-neutral-100">
                {emailLogs.filter(l => l.triggerEvent === 'Perubahan Status Peminjaman' || l.triggerEvent === 'Pendaftaran Akun Baru').length}
              </p>
              <span className="text-[10px] text-blue-600 font-semibold mt-1">Status & Registrasi</span>
            </div>
          </div>

          {/* Target Email Info Card */}
          <div className="bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Inbox className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Email Operator Aktif Penerima Notifikasi</span>
              </div>
              <p className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 truncate">
                {operatorEmailInput}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenGmailCompose(operatorEmailInput.split(',')[0].trim(), '[SCB-GO] Pesan Internal Operator', 'Halo Operator Sarpras,\n\n')}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-lg transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Buka Gmail
            </button>
          </div>
        </div>
      </div>

      {/* Outbox Email Log Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-gray-900 dark:text-neutral-100">
              Log Riwayat Email Notifikasi
            </h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              Daftar seluruh pesan notifikasi email yang berhasil dibuat dan dikirimkan ke akun operator / pemohon.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari email, subjek, nama..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44 md:w-56"
              />
            </div>

            {/* Filter Dropdown */}
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
            >
              <option value="all">Semua Pemicu</option>
              <option value="Pengajuan Baru">Pengajuan Baru</option>
              <option value="Perubahan Status Peminjaman">Status Peminjaman</option>
              <option value="Pendaftaran Akun Baru">Pendaftaran Akun</option>
              <option value="Tes Notifikasi">Tes Notifikasi</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-neutral-850">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-neutral-850">
                <th className="py-3 px-4">Waktu Kirim</th>
                <th className="py-3 px-4">Penerima</th>
                <th className="py-3 px-4">Kategori Event</th>
                <th className="py-3 px-4">Subjek Email</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-850 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 dark:text-neutral-500 font-medium">
                    Belum ada log email notifikasi yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70 dark:hover:bg-neutral-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-500 dark:text-neutral-400 whitespace-nowrap">
                      {log.sentAt}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-gray-800 dark:text-neutral-200">
                        {log.recipientName || 'Operator'}
                      </div>
                      <div className="text-[10px] font-mono text-gray-500 dark:text-neutral-400">
                        {log.recipientEmail}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                        log.triggerEvent === 'Pengajuan Baru'
                          ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/40'
                          : log.triggerEvent === 'Perubahan Status Peminjaman'
                          ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/40'
                          : log.triggerEvent === 'Pendaftaran Akun Baru'
                          ? 'bg-purple-50 text-purple-800 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-200/40'
                          : 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}>
                        {log.triggerEvent}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate font-medium text-gray-800 dark:text-neutral-200">
                      {log.subject}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/30">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Terkirim
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewLog(log)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-300 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Pratinjau Teks Email"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenGmailCompose(log.recipientEmail, log.subject, log.body)}
                          className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                          title="Buka di Webmail Gmail"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteLog(log.id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Log Email Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Preview Modal */}
      {previewLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-gray-100 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-xl">
                  <Mail className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-neutral-100">
                    Pratinjau Pesan Email Notifikasi
                  </h3>
                  <span className="text-[10px] text-gray-500 font-mono">{previewLog.id} • {previewLog.sentAt}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewLog(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 dark:bg-neutral-800/80 p-3 rounded-xl space-y-1.5 font-mono text-[11px] border border-gray-100 dark:border-neutral-750">
                <div className="flex"><span className="w-20 font-bold text-gray-500">Penerima:</span> <span className="font-bold text-emerald-700 dark:text-emerald-400">{previewLog.recipientEmail} ({previewLog.recipientName})</span></div>
                <div className="flex"><span className="w-20 font-bold text-gray-500">Subjek:</span> <span className="font-bold text-gray-900 dark:text-neutral-100">{previewLog.subject}</span></div>
                <div className="flex"><span className="w-20 font-bold text-gray-500">Kategori:</span> <span>{previewLog.triggerEvent}</span></div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600 dark:text-neutral-400">Isi Pesan Email:</label>
                <div className="bg-gray-900 text-gray-100 dark:bg-black p-4 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto border border-gray-800">
                  {previewLog.body}
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => handleCopyText(previewLog.body)}
                className="px-3 py-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-800 dark:text-neutral-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedSuccess ? 'Berhasil Disalin!' : 'Salin Teks Email'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenNativeMailto(previewLog.recipientEmail, previewLog.subject, previewLog.body)}
                  className="px-3 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-bold text-xs rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  App Email (`mailto:`)
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenGmailCompose(previewLog.recipientEmail, previewLog.subject, previewLog.body)}
                  className="px-4 py-2 bg-[#0F8A5F] hover:bg-[#0D7752] text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka di Gmail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-xl">
                  <Send className="w-5 h-5" />
                </span>
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-neutral-100">
                  Uji Coba Kirim Email Notifikasi
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {testSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl border border-emerald-200/50 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{testSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSendTestEmail} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-neutral-300 block">Email Penerima</label>
                <input
                  type="email"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  required
                  placeholder="operasional.scb@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-neutral-300 block">Subjek Email</label>
                <input
                  type="text"
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-neutral-300 block">Isi Pesan Email</label>
                <textarea
                  rows={5}
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 text-gray-700 dark:text-neutral-300 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={testSending}
                  className="px-5 py-2 bg-[#0F8A5F] hover:bg-[#0D7752] text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {testSending ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Proses...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Kirim Email Uji Coba
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
