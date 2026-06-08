import React, { useState } from "react";
import { ProfilDesa, User, PerangkatDesa, Ruangan } from "../types";
import { 
  Building, 
  Users, 
  MapPin, 
  Key, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  Lock,
  UserPlus
} from "lucide-react";

interface MasterDataProps {
  profilDesa: ProfilDesa;
  setProfilDesa: (p: ProfilDesa) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  perangkatDesa: PerangkatDesa[];
  setPerangkatDesa: (perangkat: PerangkatDesa[]) => void;
  ruanganList: Ruangan[];
  setRuanganList: (ruangan: Ruangan[]) => void;
  onDbAction: (sheet: string, type: "INSERT" | "UPDATE" | "DELETE", data: any) => void;
}

export default function MasterData({
  profilDesa,
  setProfilDesa,
  users,
  setUsers,
  perangkatDesa,
  setPerangkatDesa,
  ruanganList,
  setRuanganList,
  onDbAction
}: MasterDataProps) {
  const [activeSubTab, setActiveSubTab] = useState<"profil" | "users" | "perangkat" | "ruangan">("profil");

  // Profile Form States
  const [prefForm, setPrefForm] = useState<ProfilDesa>({ ...profilDesa });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // User States
  const [newUser, setNewUser] = useState<Partial<User>>({ nama: "", username: "", role: "Operator Desa", status: "Aktif" });
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Perangkat States
  const [newPerangkat, setNewPerangkat] = useState<Partial<PerangkatDesa>>({ nama: "", jabatan: "", nip: "", status: "Aktif" });
  const [isAddingPerangkat, setIsAddingPerangkat] = useState(false);

  // Ruangan States
  const [newRuangan, setNewRuangan] = useState<Partial<Ruangan>>({ namaRuangan: "", lokasi: "", penanggungJawab: "" });
  const [isAddingRuangan, setIsAddingRuangan] = useState(false);

  // Handle Profile Update
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfilDesa(prefForm);
    setIsEditingProfile(false);
    onDbAction("PROFIL_DESA", "UPDATE", prefForm);
  };

  // Handle Add User
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.nama || !newUser.username) return;
    const added: User = {
      id: `USR-${Math.floor(Math.random() * 900) + 100}`,
      nama: newUser.nama,
      username: newUser.username,
      role: newUser.role as "Administrator" | "Operator Desa" | "Kepala Desa" | "Auditor",
      status: newUser.status as "Aktif" | "Nonaktif"
    };
    setUsers([...users, added]);
    setIsAddingUser(false);
    setNewUser({ nama: "", username: "", role: "Operator Desa", status: "Aktif" });
    onDbAction("USER", "INSERT", added);
  };

  const handleDeleteUser = (id: string, userToDelete: User) => {
    setUsers(users.filter(u => u.id !== id));
    onDbAction("USER", "DELETE", userToDelete);
  };

  // Handle Add Perangkat
  const handleAddPerangkat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerangkat.nama || !newPerangkat.jabatan) return;
    const added: PerangkatDesa = {
      id: `PRK-${Math.floor(Math.random() * 900) + 100}`,
      nama: newPerangkat.nama,
      jabatan: newPerangkat.jabatan,
      nip: newPerangkat.nip || "-",
      status: (newPerangkat.status || "Aktif") as "Aktif" | "Nonaktif"
    };
    setPerangkatDesa([...perangkatDesa, added]);
    setIsAddingPerangkat(false);
    setNewPerangkat({ nama: "", jabatan: "", nip: "", status: "Aktif" });
    onDbAction("PERANGKAT_DESA", "INSERT", added);
  };

  const handleDeletePerangkat = (id: string, item: PerangkatDesa) => {
    setPerangkatDesa(perangkatDesa.filter(p => p.id !== id));
    onDbAction("PERANGKAT_DESA", "DELETE", item);
  };

  // Handle Add Ruangan
  const handleAddRuangan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuangan.namaRuangan || !newRuangan.lokasi) return;
    const added: Ruangan = {
      id: `RU-${Math.floor(Math.random() * 900) + 100}`,
      namaRuangan: newRuangan.namaRuangan,
      lokasi: newRuangan.lokasi,
      penanggungJawab: newRuangan.penanggungJawab || "-"
    };
    setRuanganList([...ruanganList, added]);
    setIsAddingRuangan(false);
    setNewRuangan({ namaRuangan: "", lokasi: "", penanggungJawab: "" });
    onDbAction("RUANGAN", "INSERT", added);
  };

  const handleDeleteRuangan = (id: string, item: Ruangan) => {
    setRuanganList(ruanganList.filter(r => r.id !== id));
    onDbAction("RUANGAN", "DELETE", item);
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6" aria-label="Tabs">
          {[
            { id: "profil", label: "Profil Desa", icon: Building },
            { id: "users", label: "Manajemen User", icon: Users },
            { id: "perangkat", label: "Perangkat Desa", icon: Users },
            { id: "ruangan", label: "Data Ruangan / Unit", icon: MapPin },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium ${
                  activeSubTab === tab.id
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${activeSubTab === tab.id ? "text-teal-600" : "text-slate-400 group-hover:text-slate-500"}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Section */}
      {activeSubTab === "profil" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Logo Pemerintah Daerah</span>
            <img 
              src={profilDesa.logo} 
              alt="Logo Desa" 
              className="h-32 w-auto object-contain my-4 transition-transform hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <h3 className="text-lg font-bold text-slate-900 mt-2">{profilDesa.namaDesa}</h3>
            <p className="text-xs text-slate-500 mt-1">Kec. {profilDesa.kecamatan} • Kab. {profilDesa.kabupaten}</p>
            <p className="text-[11px] font-mono text-slate-400 mt-2">Kode Kemendagri: {profilDesa.kodeDesa}</p>
          </div>

          <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 id="profile-desa-title" className="text-sm font-bold text-slate-900 uppercase tracking-wider">Identitas Wilayah Desa</h3>
              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={() => { setPrefForm({ ...profilDesa }); setIsEditingProfile(true); }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <Edit2 className="h-3.5 w-3.5 text-slate-400" /> Edit Profil
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Desa</label>
                    <input
                      type="text"
                      value={prefForm.namaDesa}
                      onChange={e => setPrefForm({ ...prefForm, namaDesa: e.target.value })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Kode Desa</label>
                    <input
                      type="text"
                      value={prefForm.kodeDesa}
                      onChange={e => setPrefForm({ ...prefForm, kodeDesa: e.target.value })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Kecamatan</label>
                    <input
                      type="text"
                      value={prefForm.kecamatan}
                      onChange={e => setPrefForm({ ...prefForm, kecamatan: e.target.value })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Kabupaten</label>
                    <input
                      type="text"
                      value={prefForm.kabupaten}
                      onChange={e => setPrefForm({ ...prefForm, kabupaten: e.target.value })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Provinsi</label>
                    <input
                      type="text"
                      value={prefForm.provinsi}
                      onChange={e => setPrefForm({ ...prefForm, provinsi: e.target.value })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">URL Logo (PNG / JPG)</label>
                    <input
                      type="text"
                      value={prefForm.logo}
                      onChange={e => setPrefForm({ ...prefForm, logo: e.target.value })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="rounded-md border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-md bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-500"
                  >
                    <Save className="h-4 w-4" /> Simpan Profil
                  </button>
                </div>
              </form>
            ) : (
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold text-slate-400">Nama Desa Resmi</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">{profilDesa.namaDesa}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-400">Kode Wilayah Kemendagri</dt>
                  <dd className="mt-1 text-sm font-mono text-slate-800">{profilDesa.kodeDesa}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-400">Kecamatan</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">{profilDesa.kecamatan}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-400">Kabupaten / Kota</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">{profilDesa.kabupaten}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-400">Provinsi</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">{profilDesa.provinsi}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-400">Integrasi Cloud</dt>
                  <dd className="mt-1 text-sm font-medium text-emerald-600 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    Google Spreadsheet DB Active
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      )}

      {/* Users Section */}
      {activeSubTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Pengguna Sistem SIPADES</h3>
              <p className="text-xs text-slate-400">Daftar pengguna terdaftar yang dapat mengkases sistem</p>
            </div>
            <button
              onClick={() => setIsAddingUser(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-500"
            >
              <UserPlus className="h-3.5 w-3.5" /> Tambah User
            </button>
          </div>

          {/* User Add Form Modal Overlay */}
          {isAddingUser && (
            <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-4">
              <form onSubmit={handleAddUser} className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={newUser.nama}
                    onChange={e => setNewUser({ ...newUser, nama: e.target.value })}
                    placeholder="Nama lengkap"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Username</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="Username login"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Role Akses</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Operator Desa">Operator Desa</option>
                    <option value="Kepala Desa">Kepala Desa</option>
                    <option value="Auditor">Auditor</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-md bg-teal-600 py-2 text-xs font-bold text-white shadow hover:bg-teal-500"
                  >
                    Ok, Tambahkan
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingUser(false)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm bg-white">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Nama Pengguna</th>
                  <th className="px-6 py-3">Username</th>
                  <th className="px-6 py-3">Hak Akses (Role)</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-800">{u.nama}</td>
                    <td className="px-6 py-4 font-mono">{u.username}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xxs font-medium ring-1 ring-inset ${
                        u.role === "Administrator" ? "bg-purple-50 text-purple-700 ring-purple-600/20" :
                        u.role === "Kepala Desa" ? "bg-amber-50 text-amber-700 ring-amber-600/20" :
                        u.role === "Auditor" ? "bg-blue-50 text-blue-700 ring-blue-600/20" :
                        "bg-teal-50 text-teal-700 ring-teal-600/20"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Standard system operator cannot be deleted */}
                      {u.username !== "admin_sipades" ? (
                        <button
                          onClick={() => handleDeleteUser(u.id, u)}
                          className="text-red-600 hover:text-red-900 duration-150 p-1"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Perangkat Desa Section */}
      {activeSubTab === "perangkat" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Perangkat Pemerintah Desa</h3>
              <p className="text-xs text-slate-400">Petugas struktural pelaksana administrasi pemerintahan desa</p>
            </div>
            <button
              onClick={() => setIsAddingPerangkat(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-500"
            >
              <Plus className="h-3.5 w-3.5" /> Tambah Perangkat
            </button>
          </div>

          {isAddingPerangkat && (
            <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-4">
              <form onSubmit={handleAddPerangkat} className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={newPerangkat.nama}
                    onChange={e => setNewPerangkat({ ...newPerangkat, nama: e.target.value })}
                    placeholder="Nama Lengkap"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Jabatan Pemdes</label>
                  <input
                    type="text"
                    value={newPerangkat.jabatan}
                    onChange={e => setNewPerangkat({ ...newPerangkat, jabatan: e.target.value })}
                    placeholder="Misal: Sekdes / Kasi Pelayanan"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">NIP / NIAP</label>
                  <input
                    type="text"
                    value={newPerangkat.nip}
                    onChange={e => setNewPerangkat({ ...newPerangkat, nip: e.target.value })}
                    placeholder="NIP perangkat desa"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-md bg-teal-600 py-2 text-xs font-bold text-white shadow hover:bg-teal-500"
                  >
                    Simpan Perangkat
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingPerangkat(false)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm bg-white">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Nama Lengkap</th>
                  <th className="px-6 py-3">Jabatan Resmi</th>
                  <th className="px-6 py-3">NIP / Nomor Identitas</th>
                  <th className="px-6 py-3">Status Keaktifan</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {perangkatDesa.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-800">{p.nama}</td>
                    <td className="px-6 py-4 text-slate-600">{p.jabatan}</td>
                    <td className="px-6 py-4 font-mono text-slate-500">{p.nip}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeletePerangkat(p.id, p)}
                        className="text-red-600 hover:text-red-900 duration-150 p-1"
                        title="Hapus Perangkat"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ruangan Section */}
      {activeSubTab === "ruangan" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Daftar Ruangan & Unit Lokasi</h3>
              <p className="text-xs text-slate-400">Ruangan penempatan inventaris peralatan, mesin, atau aset gedung lainnya</p>
            </div>
            <button
              onClick={() => setIsAddingRuangan(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-500"
            >
              <Plus className="h-3.5 w-3.5" /> Tambah Lokasi / Ruang
            </button>
          </div>

          {isAddingRuangan && (
            <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-4">
              <form onSubmit={handleAddRuangan} className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Ruangan</label>
                  <input
                    type="text"
                    value={newRuangan.namaRuangan}
                    onChange={e => setNewRuangan({ ...newRuangan, namaRuangan: e.target.value })}
                    placeholder="Misal: Ruang Sekretariat"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Lokasi Sektor</label>
                  <input
                    type="text"
                    value={newRuangan.lokasi}
                    onChange={e => setNewRuangan({ ...newRuangan, lokasi: e.target.value })}
                    placeholder="Misal: Gedung Utama Lantai 1"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Penanggung Jawab (PJ)</label>
                  <input
                    type="text"
                    value={newRuangan.penanggungJawab}
                    onChange={e => setNewRuangan({ ...newRuangan, penanggungJawab: e.target.value })}
                    placeholder="Nama Penanggung Jawab"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-md bg-teal-600 py-2 text-xs font-bold text-white shadow hover:bg-teal-500"
                  >
                    Simpan Ruangan
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingRuangan(false)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ruanganList.map(r => (
              <div key={r.id} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-teal-50 p-2 text-teal-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <button
                    onClick={() => handleDeleteRuangan(r.id, r)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Hapus lokasi"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4">
                  <span className="text-[10px] font-mono text-slate-400 block">{r.id}</span>
                  <h4 id={`ruangan-label-${r.id}`} className="text-sm font-bold text-slate-800">{r.namaRuangan}</h4>
                  <p className="text-xs text-slate-500 mt-1">{r.lokasi}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>PJ Ruangan:</span>
                    <span className="font-semibold text-slate-700">{r.penanggungJawab}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
