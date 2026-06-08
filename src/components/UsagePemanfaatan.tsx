import React, { useState } from "react";
import { Penggunaan, Pemanfaatan, Asset, PerangkatDesa } from "../types";
import { 
  Plus, 
  Trash2, 
  FileCheck, 
  Signature, 
  User, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  Award,
  Key,
  X,
  FileText
} from "lucide-react";

interface UsagePemanfaatanProps {
  penggunaanList: Penggunaan[];
  setPenggunaanList: (list: Penggunaan[]) => void;
  pemanfaatanList: Pemanfaatan[];
  setPemanfaatanList: (list: Pemanfaatan[]) => void;
  assets: Asset[];
  perangkatDesa: PerangkatDesa[];
  onDbAction: (sheet: string, type: "INSERT" | "UPDATE" | "DELETE", data: any) => void;
}

export default function UsagePemanfaatan({
  penggunaanList,
  setPenggunaanList,
  pemanfaatanList,
  setPemanfaatanList,
  assets,
  perangkatDesa,
  onDbAction
}: UsagePemanfaatanProps) {
  const [activeSegment, setActiveSegment] = useState<"penggunaan" | "pemanfaatan">("penggunaan");

  // SK Usage form states
  const [isAddingUsage, setIsAddingUsage] = useState(false);
  const [selectedSKItem, setSelectedSKItem] = useState<Penggunaan | null>(null);
  const [usageForm, setUsageForm] = useState<Partial<Penggunaan>>({
    sk: `SK.141/${Math.floor(Math.random() * 80) + 10}-DS.RS/${new Date().getFullYear()}`,
    barang_id: "",
    pengguna: perangkatDesa[0]?.nama || "",
    tanggal: new Date().toISOString().split("T")[0]
  });

  // Lease / Pemanfaatan form states
  const [isAddingLease, setIsAddingLease] = useState(false);
  const [leaseForm, setLeaseForm] = useState<Partial<Pemanfaatan>>({
    barang_id: "",
    jenis: "Sewa",
    mitra: "",
    periode_mulai: new Date().toISOString().split("T")[0],
    periode_selesai: "",
    nilai_kontrak: 0
  });

  const handleAddUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usageForm.barang_id || !usageForm.pengguna) return;

    const matchedAsset = assets.find(a => a.id === usageForm.barang_id);
    const added: Penggunaan = {
      id: `PGN-${Math.floor(Math.random() * 900) + 100}`,
      sk: usageForm.sk || "",
      barang_id: usageForm.barang_id,
      nama_barang: matchedAsset?.nama_barang || "Aset Tidak Dikenal",
      pengguna: usageForm.pengguna,
      tanggal: usageForm.tanggal || new Date().toISOString().split("T")[0],
      status: "Berjalan"
    };

    setPenggunaanList([...penggunaanList, added]);
    setIsAddingUsage(false);
    onDbAction("PENGGUNAAN", "INSERT", added);
    
    // reset
    setUsageForm({
      sk: `SK.141/${Math.floor(Math.random() * 80) + 10}-DS.RS/${new Date().getFullYear()}`,
      barang_id: "",
      pengguna: perangkatDesa[0]?.nama || "",
      tanggal: new Date().toISOString().split("T")[0]
    });
  };

  const handleDeleteUsage = (id: string, item: Penggunaan) => {
    setPenggunaanList(penggunaanList.filter(p => p.id !== id));
    onDbAction("PENGGUNAAN", "DELETE", item);
  };

  const handleAddLease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaseForm.barang_id || !leaseForm.mitra || !leaseForm.nilai_kontrak) return;

    const matchedAsset = assets.find(a => a.id === leaseForm.barang_id);
    const added: Pemanfaatan = {
      id: `PMF-${Math.floor(Math.random() * 900) + 100}`,
      barang_id: leaseForm.barang_id,
      nama_barang: matchedAsset?.nama_barang || "Aset Tidak Dikenal",
      jenis: (leaseForm.jenis || "Sewa") as any,
      mitra: leaseForm.mitra,
      periode_mulai: leaseForm.periode_mulai || new Date().toISOString().split("T")[0],
      periode_selesai: leaseForm.periode_selesai || "",
      nilai_kontrak: Number(leaseForm.nilai_kontrak),
      status: "Aktif"
    };

    setPemanfaatanList([...pemanfaatanList, added]);
    setIsAddingLease(false);
    onDbAction("PEMANFAATAN", "INSERT", added);

    setLeaseForm({
      barang_id: "",
      jenis: "Sewa",
      mitra: "",
      periode_mulai: new Date().toISOString().split("T")[0],
      periode_selesai: "",
      nilai_kontrak: 0
    });
  };

  const handleDeleteLease = (id: string, item: Pemanfaatan) => {
    setPemanfaatanList(pemanfaatanList.filter(p => p.id !== id));
    onDbAction("PEMANFAATAN", "DELETE", item);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveSegment("penggunaan")}
            className={`group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-semibold transition-colors ${
              activeSegment === "penggunaan"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <FileCheck className="h-4.5 w-4.5" /> penetapan Penggunaan Aset (SK Kades)
          </button>
          <button
            onClick={() => setActiveSegment("pemanfaatan")}
            className={`group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-semibold transition-colors ${
              activeSegment === "pemanfaatan"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <Briefcase className="h-4.5 w-4.5" /> Pemanfaatan & Sewa KSP / BGS
          </button>
        </nav>
      </div>

      {activeSegment === "penggunaan" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">Penetapan Status Penggunaan</h3>
              <p className="text-xs text-slate-500">Menyusun Surat Keputusan (SK) Kepala Urusan Pemegang Aset Desa</p>
            </div>
            {!isAddingUsage && (
              <button
                onClick={() => setIsAddingUsage(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-teal-500"
              >
                <Plus className="h-3.5 w-3.5" /> Susun SK Penggunaan Baru
              </button>
            )}
          </div>

          {isAddingUsage && (
            <form onSubmit={handleAddUsage} className="bg-white rounded-xl border border-teal-100 p-6 shadow-md space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pemberian Kuasa Pemakaian Aset Desa</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nomor SK Keputusan</label>
                  <input
                    type="text"
                    value={usageForm.sk}
                    onChange={e => setUsageForm({ ...usageForm, sk: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Pilih Barang Inventaris</label>
                  <select
                    value={usageForm.barang_id}
                    onChange={e => setUsageForm({ ...usageForm, barang_id: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                    required
                  >
                    <option value="">-- Pilih Barang --</option>
                    {assets.filter(a => a.kategori === "KIB B" || a.kategori === "KIB C").map(a => (
                      <option key={a.id} value={a.id}>({a.id}) {a.nama_barang}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Pemegang / Pengguna</label>
                  <select
                    value={usageForm.pengguna}
                    onChange={e => setUsageForm({ ...usageForm, pengguna: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                    required
                  >
                    <option value="">-- Pilih Perangkat Desa --</option>
                    {perangkatDesa.map(p => (
                      <option key={p.id} value={`${p.nama} (${p.jabatan})`}>{p.nama} • {p.jabatan}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Tanggal Mulai Berlaku</label>
                  <input
                    type="date"
                    value={usageForm.tanggal}
                    onChange={e => setUsageForm({ ...usageForm, tanggal: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingUsage(false)}
                  className="rounded-md border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-teal-500"
                >
                  Terbitkan SK
                </button>
              </div>
            </form>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm bg-white">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3">No. SK Kepala Desa</th>
                  <th className="px-6 py-3">Nama Aset / Barang</th>
                  <th className="px-6 py-3">Kuasa Pengguna (Perangkat)</th>
                  <th className="px-6 py-3">Tgl Penyerahan</th>
                  <th className="px-6 py-3">Status Pinjam Guna</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {penggunaanList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">{item.sk}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div>{item.nama_barang}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Asset ID: {item.barang_id}</div>
                    </td>
                    <td className="px-6 py-4">{item.pengguna}</td>
                    <td className="px-6 py-4">{item.tanggal}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedSKItem(item)}
                          className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-1 text-[11px] font-bold text-teal-700 hover:bg-teal-100 transition-colors"
                        >
                          <FileText className="h-3 w-3" /> Cetak SK
                        </button>
                        <button
                          onClick={() => handleDeleteUsage(item.id, item)}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSegment === "pemanfaatan" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">Sewa & Kerjasama Pemanfaatan</h3>
              <p className="text-xs text-slate-500">Mengelola aset sewa-menyewa, pinjam pakai, kerjasama (KSP), dan Bangun Guna Serah (BGS)</p>
            </div>
            {!isAddingLease && (
              <button
                onClick={() => setIsAddingLease(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-teal-500"
              >
                <Plus className="h-3.5 w-3.5" /> Tambah Berita Acara Pemanfaatan
              </button>
            )}
          </div>

          {isAddingLease && (
            <form onSubmit={handleAddLease} className="bg-white rounded-xl border border-teal-100 p-6 shadow-md space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Registrasi Penandatanganan Kemitraan Aset</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Pilih Barang Aset Desa</label>
                  <select
                    value={leaseForm.barang_id}
                    onChange={e => setLeaseForm({ ...leaseForm, barang_id: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                    required
                  >
                    <option value="">-- Pilih Barang --</option>
                    {assets.filter(a => a.kategori === "KIB A" || a.kategori === "KIB C").map(a => (
                      <option key={a.id} value={a.id}>({a.id}) {a.nama_barang} - Rp.{a.nilai.toLocaleString("id-ID")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Jenis Pemanfaatan</label>
                  <select
                    value={leaseForm.jenis}
                    onChange={e => setLeaseForm({ ...leaseForm, jenis: e.target.value as any })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                  >
                    <option value="Sewa">Sewa (Khas Kas Desa)</option>
                    <option value="Pinjam Pakai">Pinjam Pakai (Karang Taruna / Dinas)</option>
                    <option value="Kerjasama Pemanfaatan">Kerjasama Pemanfaatan (KSP)</option>
                    <option value="Bangun Guna Serah">Bangun Guna Serah (BGS)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 font-sans">Nama Mitra Pembayar / Peminjam</label>
                  <input
                    type="text"
                    placeholder="Kelompok Tani, PT, BUMDes, dll"
                    value={leaseForm.mitra}
                    onChange={e => setLeaseForm({ ...leaseForm, mitra: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Dimulai Tanggal</label>
                  <input
                    type="date"
                    value={leaseForm.periode_mulai}
                    onChange={e => setLeaseForm({ ...leaseForm, periode_mulai: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Selesai Kontrak Tanggal</label>
                  <input
                    type="date"
                    value={leaseForm.periode_selesai}
                    onChange={e => setLeaseForm({ ...leaseForm, periode_selesai: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nilai Kontrak / Sewa Setahun (Rp)</label>
                  <input
                    type="number"
                    value={leaseForm.nilai_kontrak}
                    onChange={e => setLeaseForm({ ...leaseForm, nilai_kontrak: Number(e.target.value) })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingLease(false)}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-teal-500"
                >
                  Simpan BA Kerja Sama
                </button>
              </div>
            </form>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm bg-white">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Nama barang Desa</th>
                  <th className="px-6 py-3">Jenis Pemanfaatan</th>
                  <th className="px-6 py-3">Nama Mitra Kerjasama</th>
                  <th className="px-6 py-3">Periode Kontrak</th>
                  <th className="px-6 py-3 text-right">Nilai Kontrak</th>
                  <th className="px-6 py-3">Status Kontrak</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {pemanfaatanList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div>{item.nama_barang}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Asset ID: {item.barang_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2 py-1 text-xxs font-bold text-indigo-700">
                        {item.jenis}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{item.mitra}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold">{item.periode_mulai}</div>
                      <div className="text-slate-400 text-[10px] mt-0.5">s/d {item.periode_selesai || "-"}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      Rp. {item.nilai_kontrak.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xxs font-semibold leading-5 ${
                        item.status === "Aktif" 
                          ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20" 
                          : "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-400/20"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteLease(item.id, item)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable SK Kades Preview Modal */}
      {selectedSKItem && (
        <div id="sk-print-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-xl bg-white p-8 shadow-2xl space-y-4 border border-slate-100 my-4 text-slate-900 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSelectedSKItem(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 pointer-events-auto"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Official Letter representation */}
            <div className="border border-slate-200 p-6 rounded bg-white shadow-sm space-y-4 font-sans text-xs leading-relaxed text-left">
              {/* Kop Surat */}
              <div className="text-center border-b-4 border-double border-slate-800 pb-4">
                <h2 className="text-sm font-bold tracking-wider">PEMERINTAH KABUPATEN LOMBOK TIMUR</h2>
                <h2 className="text-sm font-bold tracking-wider leading-relaxed">KECAMATAN TERARA • DESA RARANG SELATAN</h2>
                <p className="text-[10px] text-slate-500">Jl. Raya Mataram - Labuhan Lombok Km. 38, Kode Pos 83662</p>
                <p className="text-[9px] text-teal-700 underline font-semibold mt-0.5">pemdes.rarangselatan@gmail.com</p>
              </div>

              {/* Title Document */}
              <div className="text-center my-4 space-y-1">
                <h3 className="font-bold underline text-sm">SURAT KEPUTUSAN KEPALA DESA RARANG SELATAN</h3>
                <p className="font-mono text-slate-700 text-xxs font-bold">Nomor SK: {selectedSKItem.sk}</p>
                <p className="font-semibold text-xxs uppercase">TENTANG PENETAPAN PEMAKAI / KETUA KUASA PENGGUNA BARANG MILIK DESA</p>
              </div>

              {/* Body */}
              <div className="space-y-3">
                <p className="text-justify">
                  Menimbang bahwa demi tertib administrasi, pemeliharaan fisik, dan akuntabilitas penggunaan Barang Milik Desa, maka dipandang perlu menetapkan penanggung jawab / pemakai aset melalui Keputusan Kepala Desa.
                </p>
                <div>
                  <h4 className="font-bold">MEMUTUSKAN</h4>
                  <dl className="grid grid-cols-1 gap-2 mt-2 pl-4 sm:grid-cols-4">
                    <dt className="font-bold text-slate-600">MENETAPKAN:</dt>
                    <dd className="sm:col-span-3">Menyerahkan hak pakai operasional kepada pegawai di bawah ini:</dd>
                    
                    <dt className="font-semibold text-slate-500">Nama Pemegang:</dt>
                    <dd className="sm:col-span-3 font-bold text-slate-900">{selectedSKItem.pengguna}</dd>

                    <dt className="font-semibold text-slate-500">Barang Aset:</dt>
                    <dd className="sm:col-span-3 font-bold text-slate-900">{selectedSKItem.nama_barang} (ID: {selectedSKItem.barang_id})</dd>

                    <dt className="font-semibold text-slate-500">Tanggal Mulai:</dt>
                    <dd className="sm:col-span-3 font-medium text-slate-800">{selectedSKItem.tanggal}</dd>

                    <dt className="font-semibold text-slate-500">Status Aset:</dt>
                    <dd className="sm:col-span-3 font-semibold text-emerald-600 flex items-center gap-1">
                      <span>●</span> Kuasa Penggunaan Aktif
                    </dd>
                  </dl>
                </div>
                <p className="text-justify pt-1">
                  Keputusan ini berlaku sejak tanggal ditetapkan, dengan ketentuan apabila di kemudian hari terdapat kekeliruan dalam penetapan ini, maka akan diadakan perbaikan atau re-revaluasi sebagaimana mestinya.
                </p>
              </div>

              {/* Tanda Tangan */}
              <div className="flex justify-between items-end pt-6">
                <div>
                  <p className="text-[10px] text-slate-400">Scan QR untuk verifikasi</p>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(
                      `VE_SK_${selectedSKItem.id}_${selectedSKItem.sk}`
                    )}`}
                    alt="Verifikasi SK"
                    className="h-14 w-14 border border-slate-100 p-0.5 rounded mt-1"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-center space-y-12">
                  <p className="font-medium">Ditetapkan di: Rarang Selatan<br />Pada Tanggal: {selectedSKItem.tanggal}</p>
                  <div>
                    <p className="font-bold underline text-slate-900">H. RIDWAN, M.Si.</p>
                    <p className="text-slate-500 text-[10px]">Kepala Desa Rarang Selatan</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 rounded-lg bg-teal-600 hover:bg-teal-500 font-bold py-2 text-xs text-white text-center shadow"
              >
                Cetak Surat Keputusan (PDF)
              </button>
              <button
                onClick={() => setSelectedSKItem(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 text-xs"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
