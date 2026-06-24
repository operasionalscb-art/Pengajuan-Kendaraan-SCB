import React, { useState } from 'react';
import { Vehicle, VehicleType, VehicleStatus } from '../types';
import { 
  Car, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Users, 
  AlertCircle, 
  Info,
  Layers,
  Wrench,
  Ban,
  CheckCircle2
} from 'lucide-react';

interface VehicleManagerProps {
  vehicles: Vehicle[];
  onAddVehicle: (newVehicle: Omit<Vehicle, 'id'>) => Promise<boolean>;
  onUpdateVehicle: (updatedVehicle: Vehicle) => Promise<boolean>;
  onDeleteVehicle: (vehicleId: string) => Promise<boolean>;
}

export default function VehicleManager({
  vehicles,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle
}: VehicleManagerProps) {
  // Local state for adding/editing vehicles
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [namaKendaraan, setNamaKendaraan] = useState('');
  const [nomorPolisi, setNomorPolisi] = useState('');
  const [jenis, setJenis] = useState<VehicleType>('Mobil Operasional');
  const [kapasitas, setKapasitas] = useState(7);
  const [status, setStatus] = useState<VehicleStatus>('Tersedia');

  const [formError, setFormError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');

  const resetForm = () => {
    setNamaKendaraan('');
    setNomorPolisi('');
    setJenis('Mobil Operasional');
    setKapasitas(7);
    setStatus('Tersedia');
    setFormError('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!namaKendaraan.trim()) {
      setFormError('Nama kendaraan wajib diisi.');
      return;
    }
    if (!nomorPolisi.trim()) {
      setFormError('Nomor polisi / plat nomor wajib diisi.');
      return;
    }
    if (kapasitas < 1) {
      setFormError('Kapasitas minimal harus 1 kursi.');
      return;
    }

    try {
      const success = await onAddVehicle({
        nama_kendaraan: namaKendaraan.trim(),
        nomor_polisi: nomorPolisi.trim().toUpperCase(),
        jenis,
        kapasitas,
        status
      });

      if (success) {
        setSuccessInfo('Kendaraan baru berhasil ditambahkan ke database!');
        resetForm();
        setIsAdding(false);
        setTimeout(() => setSuccessInfo(''), 2000);
      } else {
        setFormError('Gagal menyimpan kendaraan ke database server. Pastikan Anda memiliki hak akses.');
      }
    } catch (err: any) {
      console.error(err);
      setFormError(`Terjadi kesalahan: ${err.message || err}`);
    }
  };

  const handleStartEdit = (v: Vehicle) => {
    setEditingId(v.id);
    setNamaKendaraan(v.nama_kendaraan);
    setNomorPolisi(v.nomor_polisi);
    setJenis(v.jenis);
    setKapasitas(v.kapasitas);
    setStatus(v.status);
    setFormError('');
  };

  const handleSaveEdit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setFormError('');

    if (!namaKendaraan.trim()) {
      setFormError('Nama kendaraan tidak boleh kosong.');
      return;
    }
    if (!nomorPolisi.trim()) {
      setFormError('Nomor polisi tidak boleh kosong.');
      return;
    }

    try {
      const success = await onUpdateVehicle({
        id,
        nama_kendaraan: namaKendaraan.trim(),
        nomor_polisi: nomorPolisi.trim().toUpperCase(),
        jenis,
        kapasitas,
        status
      });

      if (success) {
        setSuccessInfo('Data kendaraan berhasil diperbarui.');
        setEditingId(null);
        resetForm();
        setTimeout(() => setSuccessInfo(''), 2000);
      } else {
        setFormError('Gagal memperbarui kendaraan di database server. Pastikan Anda memiliki hak akses.');
      }
    } catch (err: any) {
      console.error(err);
      setFormError(`Terjadi kesalahan: ${err.message || err}`);
    }
  };

  const statusIcons = (s: VehicleStatus) => {
    switch (s) {
      case 'Tersedia':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Dalam Perbaikan':
        return <Wrench className="w-3.5 h-3.5 text-yellow-600" />;
      case 'Nonaktif':
        return <Ban className="w-3.5 h-3.5 text-red-650" />;
    }
  };

  const statusClasses = (s: VehicleStatus) => {
    switch (s) {
      case 'Tersedia':
        return 'bg-emerald-50 dark:bg-emerald-950/25 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30';
      case 'Dalam Perbaikan':
        return 'bg-yellow-50 dark:bg-yellow-950/25 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30';
      case 'Nonaktif':
        return 'bg-red-50 dark:bg-red-950/25 text-red-800 dark:text-red-400 border-red-200 dark:border-red-900/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-850 dark:text-neutral-100">Daftar Inventaris Kendaraan</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Kelola data seluruh armada transportasi operasional Sekolah Cendekia BAZNAS (SCB) di sini.</p>
        </div>

        {!isAdding && !editingId && (
          <button
            type="button"
            onClick={() => { resetForm(); setIsAdding(true); }}
            className="self-start sm:self-center flex items-center justify-center gap-2 py-2 px-4 bg-[#0F8A5F] hover:bg-[#0a6344] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Armada Baru
          </button>
        )}
      </div>

      {successInfo && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-650" />
          <span>{successInfo}</span>
        </div>
      )}

      {/* FORM: Add Vehicle Form */}
      {isAdding && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-150 dark:border-neutral-800 p-6 shadow-sm max-w-xl">
          <div className="flex items-center justify-between border-b dark:border-neutral-800 pb-3 mb-4">
            <h3 className="font-extrabold text-sm text-[#0F8A5F] dark:text-emerald-400 flex items-center gap-2">
              <Car className="w-4 h-4" /> Registrasi Kendaraan Baru
            </h3>
            <button
              type="button"
              onClick={() => { setIsAdding(false); resetForm(); }}
              className="text-xs font-bold text-neutral-450 dark:text-neutral-500 hover:text-red-500 cursor-pointer"
            >
              Batal
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4 text-xs font-bold text-neutral-600 dark:text-neutral-400">
            <div className="space-y-1">
              <label className="text-neutral-500 dark:text-neutral-400">Nama Kendaraan / Hub</label>
              <input
                type="text"
                placeholder="Contoh: Toyota Hiace Commuter"
                value={namaKendaraan}
                onChange={(e) => setNamaKendaraan(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-250 dark:border-neutral-700 rounded-lg outline-none font-medium text-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-neutral-500 dark:text-neutral-400">Nomor Polisi (Plat No.)</label>
                <input
                  type="text"
                  placeholder="Contoh: B 7891 SCB"
                  value={nomorPolisi}
                  onChange={(e) => setNomorPolisi(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-250 dark:border-neutral-700 rounded-lg outline-none font-medium text-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-500 dark:text-neutral-400">Kapasitas Kursi Penumpang</label>
                <input
                  type="number"
                  min={1}
                  value={kapasitas}
                  onChange={(e) => setKapasitas(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-250 dark:border-neutral-700 rounded-lg outline-none font-medium text-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-neutral-500 dark:text-neutral-400">Kategori Jenis Kendaraan</label>
                <select
                  value={jenis}
                  onChange={(e) => setJenis(e.target.value as VehicleType)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-250 dark:border-neutral-700 rounded-lg outline-none font-medium text-neutral-800 dark:text-neutral-100"
                >
                  <option value="Mobil Operasional">Mobil Operasional</option>
                  <option value="Minibus">Minibus</option>
                  <option value="Bus">Bus</option>
                  <option value="Pickup">Pickup</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-500 dark:text-neutral-400">Status Awal</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-250 dark:border-neutral-700 rounded-lg outline-none font-medium text-neutral-800 dark:text-neutral-100"
                >
                  <option value="Tersedia">Tersedia</option>
                  <option value="Dalam Perbaikan">Dalam Perbaikan</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setIsAdding(false); resetForm(); }}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-850 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg font-bold text-neutral-500 dark:text-neutral-400 text-xs transition border border-neutral-200 dark:border-neutral-750"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0F8A5F] hover:bg-[#0a6344] text-white rounded-lg font-bold text-xs"
              >
                Tambahkan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Roster database vehicle cards lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => {
          const isCurrentlyEditing = editingId === v.id;

          if (isCurrentlyEditing) {
            return (
              <div key={v.id} className="bg-white dark:bg-neutral-900 rounded-2xl border-2 border-[#0F8A5F]/50 p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b dark:border-neutral-800">
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 font-bold">ARMADA: {v.id}</span>
                  <button 
                    type="button" 
                    onClick={() => setEditingId(null)} 
                    className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-400 dark:text-neutral-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={(e) => handleSaveEdit(e, v.id)} className="space-y-3 text-xs font-bold text-neutral-600 dark:text-neutral-400">
                  <div className="space-y-1">
                    <label className="text-neutral-400 dark:text-neutral-500">Nama Kendaraan</label>
                    <input
                      type="text"
                      value={namaKendaraan}
                      onChange={(e) => setNamaKendaraan(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none font-semibold text-neutral-800 dark:text-neutral-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400 dark:text-neutral-500">Nomor Polisi</label>
                    <input
                      type="text"
                      value={nomorPolisi}
                      onChange={(e) => setNomorPolisi(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none font-semibold text-neutral-800 dark:text-neutral-100 uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-neutral-400 dark:text-neutral-500">Kapasitas</label>
                      <input
                        type="number"
                        min={1}
                        value={kapasitas}
                        onChange={(e) => setKapasitas(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none text-neutral-800 dark:text-neutral-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 dark:text-neutral-500 font-bold">Kategori</label>
                      <select
                        value={jenis}
                        onChange={(e) => setJenis(e.target.value as VehicleType)}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-1 py-1 rounded text-xs leading-5 text-neutral-800 dark:text-neutral-100"
                      >
                        <option value="Mobil Operasional">Mobil Operasional</option>
                        <option value="Minibus">Minibus</option>
                        <option value="Bus">Bus</option>
                        <option value="Pickup">Pickup</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400 dark:text-neutral-500 block">Status Operasi</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-1 py-1 rounded text-xs leading-5 text-neutral-800 dark:text-neutral-100"
                    >
                      <option value="Tersedia">Tersedia</option>
                      <option value="Dalam Perbaikan">Dalam Perbaikan</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-850 text-neutral-500 dark:text-neutral-400 rounded text-[10px] border border-neutral-200 dark:border-neutral-750"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-[#0F8A5F] text-white rounded text-[10px]"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            );
          }

          return (
            <div 
              key={v.id} 
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-150 dark:border-neutral-800 p-5 shadow-xs flex flex-col justify-between hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-neutral-950 transition duration-200"
            >
              {/* Header card info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono font-bold tracking-wider">{v.id}</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold py-0.5 px-2 rounded-full border ${statusClasses(v.status)}`}>
                    {statusIcons(v.status)}
                    <span>{v.status}</span>
                  </span>
                </div>
                
                <h4 className="font-extrabold text-base text-neutral-850 dark:text-neutral-100 mt-2 tracking-tight block">{v.nama_kendaraan}</h4>
                <p className="text-xs font-mono font-medium text-neutral-400 dark:text-neutral-500">{v.nomor_polisi}</p>
              </div>

              {/* Specs parameters lists */}
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-bold">
                <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2.5 py-0.5 rounded text-[10px] font-extrabold tracking-tight">
                  {v.jenis}
                </span>

                <div className="flex items-center gap-1 text-neutral-700 dark:text-neutral-300">
                  <Users className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                  <span>Max {v.kapasitas} Kursi</span>
                </div>
              </div>

              {/* Action items on the vehicle (Edit and Delete triggers) */}
              <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleStartEdit(v)}
                  className="p-1.5 bg-neutral-50 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 rounded-lg text-neutral-600 dark:text-neutral-300 font-bold transition inline-flex items-center gap-1 cursor-pointer border border-neutral-200 dark:border-neutral-700"
                  title="Ubah Rincian"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Ubah
                </button>
                
                <button
                  type="button"
                  onClick={() => onDeleteVehicle(v.id)}
                  className="p-1.5 bg-red-50 text-red-650 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition inline-flex items-center cursor-pointer"
                  title="Hapus Kendaraan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
