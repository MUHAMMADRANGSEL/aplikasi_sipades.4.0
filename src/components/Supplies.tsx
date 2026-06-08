import React, { useState } from "react";
import { Persediaan } from "../types";
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Blocks, 
  Warehouse, 
  User, 
  BookOpen, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  Layers
} from "lucide-react";

interface SuppliesProps {
  persediaanList: Persediaan[];
  setPersediaanList: (list: Persediaan[]) => void;
  onDbAction: (sheet: string, type: "INSERT" | "UPDATE" | "DELETE", data: any) => void;
  onSendWhatsApp: (type: "pengadaan" | "aset_baru" | "low_stock" | "audit_remind", item: any) => void;
}

export default function Supplies({
  persediaanList,
  setPersediaanList,
  onDbAction,
  onSendWhatsApp
}: SuppliesProps) {
  const [isAddingIn, setIsAddingIn] = useState(false);
  const [isAddingOut, setIsAddingOut] = useState(false);

  // Group by item to get unique available stocks in real-time
  const inventorySummary = Array.from(
    persediaanList.reduce((acc, item) => {
      const current = acc.get(item.nama_barang) || 0;
      acc.set(item.nama_barang, item.tipe === "Masuk" ? current + item.jumlah : current - item.jumlah);
      return acc;
    }, new Map<string, number>())
  ).map(([name, qty]) => ({ name, qty }));

  // Form states
  const [formIn, setFormIn] = useState<Partial<Persediaan>>({
    tanggal: new Date().toISOString().split("T")[0],
    nama_barang: "Bibit Jagung Hibrida Premium",
    jumlah: 10,
    keterangan: ""
  });

  const [formOut, setFormOut] = useState<Partial<Persediaan>>({
    tanggal: new Date().toISOString().split("T")[0],
    nama_barang: "Bibit Jagung Hibrida Premium",
    jumlah: 5,
    penerima: "",
    keterangan: ""
  });

  const handleInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIn.nama_barang || !formIn.jumlah) return;

    const currentQty = inventorySummary.find(i => i.name === formIn.nama_barang)?.qty || 0;
    const added: Persediaan = {
      id: `PSD-${Math.floor(Math.random() * 900) + 100}`,
      tanggal: formIn.tanggal || new Date().toISOString().split("T")[0],
      nama_barang: formIn.nama_barang,
      tipe: "Masuk",
      jumlah: Number(formIn.jumlah),
      stok_sisa: currentQty + Number(formIn.jumlah),
      keterangan: formIn.keterangan || "Penerimaan Stok"
    };

    setPersediaanList([...persediaanList, added]);
    setIsAddingIn(false);
    onDbAction("PERSEDIAAN", "INSERT", added);

    setFormIn({
      tanggal: new Date().toISOString().split("T")[0],
      nama_barang: "Bibit Jagung Hibrida Premium",
      jumlah: 10,
      keterangan: ""
    });
  };

  const handleOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOut.nama_barang || !formOut.jumlah || !formOut.penerima) return;

    const currentQty = inventorySummary.find(i => i.name === formOut.nama_barang)?.qty || 0;
    const outQty = Number(formOut.jumlah);

    const remainingStock = currentQty - outQty;
    const added: Persediaan = {
      id: `PSD-${Math.floor(Math.random() * 900) + 100}`,
      tanggal: formOut.tanggal || new Date().toISOString().split("T")[0],
      nama_barang: formOut.nama_barang,
      tipe: "Keluar",
      jumlah: outQty,
      penerima: formOut.penerima,
      stok_sisa: remainingStock,
      keterangan: formOut.keterangan || "Distribusi bantuan sosial kepada warga"
    };

    setPersediaanList([...persediaanList, added]);
    setIsAddingOut(false);
    onDbAction("PERSEDIAAN", "INSERT", added);

    if (remainingStock < 50) {
      onSendWhatsApp("low_stock", { name: formOut.nama_barang, qty: remainingStock });
    }

    setFormOut({
      tanggal: new Date().toISOString().split("T")[0],
      nama_barang: "Bibit Jagung Hibrida Premium",
      jumlah: 5,
      penerima: "",
      keterangan: ""
    });
  };

  const handleDelete = (id: string, item: Persediaan) => {
    setPersediaanList(persediaanList.filter(p => p.id !== id));
    onDbAction("PERSEDIAAN", "DELETE", item);
  };

  return (
    <div className="space-y-6">
      {/* Supplies Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {inventorySummary.map(item => (
          <div key={item.name} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest block">Gudang Logistik Desa</span>
              <Warehouse className="h-4.5 w-4.5 text-slate-400" />
            </div>
            <div className="mt-3">
              <h4 id={`supply-name-${item.name}`} className="text-xs font-bold text-slate-800">{item.name}</h4>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-slate-900">{item.qty}</span>
                <span className="text-xs text-slate-400">Pcs / Karung</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Status Keamanan:</span>
              <span className={`font-semibold ${item.qty <= 50 ? "text-rose-600 animate-pulse" : "text-emerald-600"}`}>
                {item.qty <= 50 ? "Perlu Pembelian Ulang!" : "Aman / Cukup"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Action triggers */}
      <div className="flex flex-wrap gap-2 justify-end">
        {!isAddingIn && !isAddingOut && (
          <>
            <button
              onClick={() => setIsAddingIn(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3.5 py-2 text-xs font-bold text-teal-700 hover:bg-teal-100"
            >
              <ArrowUpRight className="h-4.5 w-4.5" /> Catat Barang Masuk (Restock)
            </button>
            <button
              onClick={() => setIsAddingOut(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
            >
              <ArrowDownLeft className="h-4.5 w-4.5" /> Salurkan Barang Keluar (Bansos)
            </button>
          </>
        )}
      </div>

      {/* Adding In Form Overlay */}
      {isAddingIn && (
        <form onSubmit={handleInSubmit} className="bg-white rounded-xl border border-teal-100 p-5 shadow-md space-y-4">
          <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider">Penerimaan & Pasokan Barang Baru</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Barang Persediaan</label>
              <select
                value={formIn.nama_barang}
                onChange={e => setFormIn({ ...formIn, nama_barang: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
              >
                <option value="Bibit Jagung Hibrida Premium">Bibit Jagung Hibrida Premium</option>
                <option value="Kertas HVS A4 Sinar Dunia 80gr">Kertas HVS A4 Sinar Dunia 80gr</option>
                <option value="Sembako Sembilan Bahan Pokok (Bansos)">Sembako Sembilan Bahan Pokok (Bansos)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 font-sans">Jumlah Diterima (Pcs)</label>
              <input
                type="number"
                min="1"
                value={formIn.jumlah}
                onChange={e => setFormIn({ ...formIn, jumlah: Number(e.target.value) })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Pemasok / Keterangan</label>
              <input
                type="text"
                placeholder="Dinas Pertanian / Anggaran APBDes"
                value={formIn.keterangan}
                onChange={e => setFormIn({ ...formIn, keterangan: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tanggal</label>
              <input
                type="date"
                value={formIn.tanggal}
                onChange={e => setFormIn({ ...formIn, tanggal: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddingIn(false)} className="rounded-md border border-slate-200 px-4 py-2 text-xs font-semibold">Batal</button>
            <button type="submit" className="rounded-md bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-teal-500">Ok, Simpan Mutasi Masuk</button>
          </div>
        </form>
      )}

      {/* Adding Out Form Overlay */}
      {isAddingOut && (
        <form onSubmit={handleOutSubmit} className="bg-white rounded-xl border border-indigo-100 p-5 shadow-md space-y-4">
          <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Penyaluran / Pembagian Barang kepada Masyarakat</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Barang Persediaan</label>
              <select
                value={formOut.nama_barang}
                onChange={e => setFormOut({ ...formOut, nama_barang: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="Bibit Jagung Hibrida Premium">Bibit Jagung Hibrida Premium</option>
                <option value="Kertas HVS A4 Sinar Dunia 80gr">Kertas HVS A4 Sinar Dunia 80gr</option>
                <option value="Sembako Sembilan Bahan Pokok (Bansos)">Sembako Sembilan Bahan Pokok (Bansos)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Jumlah Disalurkan (Pcs)</label>
              <input
                type="number"
                min="1"
                value={formOut.jumlah}
                onChange={e => setFormOut({ ...formOut, jumlah: Number(e.target.value) })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">KPM / Nama Penerima Kuasa</label>
              <input
                type="text"
                placeholder="Kelompok Tani Tunas Jaya / Warga Dusun"
                value={formOut.penerima}
                onChange={e => setFormOut({ ...formOut, penerima: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tanggal Keluar</label>
              <input
                type="date"
                value={formOut.tanggal}
                onChange={e => setFormOut({ ...formOut, tanggal: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddingOut(false)} className="rounded-md border border-slate-200 px-4 py-2 text-xs font-semibold">Batal</button>
            <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500">Ok, Salurkan & Potong Stok</button>
          </div>
        </form>
      )}

      {/* Supply Ledger logs */}
      <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm bg-white">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-3">ID Buku</th>
              <th className="px-6 py-3">Nama barang persediaan</th>
              <th className="px-6 py-3">Menejemen Mutasi</th>
              <th className="px-6 py-3">Volume Mutasi</th>
              <th className="px-6 py-3">Penerima Manfaat / KPM</th>
              <th className="px-6 py-3 text-right">Sisa Stok Gudang</th>
              <th className="px-6 py-3">Uraian / Keterangan</th>
              <th className="px-6 py-3">Tanggal</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {persediaanList.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-mono font-bold text-slate-800">{item.id}</td>
                <td className="px-6 py-4 font-semibold text-slate-900">{item.nama_barang}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xxs font-bold ${
                    item.tipe === "Masuk" ? "bg-emerald-50 text-emerald-800" : "bg-indigo-50 text-indigo-800"
                  }`}>
                    {item.tipe === "Masuk" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                    {item.tipe === "Masuk" ? "Barang Masuk" : "Barang Keluar"}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold">{item.jumlah} Pcs</td>
                <td className="px-6 py-4 font-medium">{item.penerima || "Gudang Logistik Desa"}</td>
                <td className="px-6 py-4 text-right font-semibold text-slate-700">{item.stok_sisa}</td>
                <td className="px-6 py-4 text-slate-500">{item.keterangan || "-"}</td>
                <td className="px-6 py-4">{item.tanggal}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(item.id, item)}
                    className="text-slate-400 hover:text-red-500 p-1"
                    title="Hapus"
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
  );
}
