import React, { useState } from "react";
import { Asset, Ruangan } from "../types";
import { 
  Plus, 
  Trash2, 
  QrCode, 
  Database, 
  MapPin, 
  Layers, 
  Calendar, 
  CheckCircle, 
  Info, 
  Search, 
  Upload, 
  Check,
  FileSpreadsheet,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface InventoryProps {
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  ruanganList: Ruangan[];
  profilDesa?: { logo: string; namaDesa: string; kabupaten: string };
  onDbAction: (sheet: string, type: "INSERT" | "UPDATE" | "DELETE", data: any) => void;
}

export default function Inventory({
  assets,
  setAssets,
  ruanganList,
  profilDesa,
  onDbAction
}: InventoryProps) {
  const [filterCat, setFilterCat] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [qrModalItem, setQrModalItem] = useState<Asset | null>(null);

  // Excel / CSV Import panel simulator state
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [excelDataRow, setExcelDataRow] = useState("");

  // Asset Creation Form States
  const [formAsset, setFormAsset] = useState<Partial<Asset>>({
    kategori: "KIB B",
    kode_barang: "",
    nama_barang: "",
    tahun: new Date().getFullYear().toString(),
    nilai: 0,
    lokasi: ruanganList[0]?.namaRuangan || "Gedung Utama Rarang Selatan",
    kondisi: "Baik"
  });

  // Unique Categories
  const categories = [
    { id: "All", label: "Semua Kategori (KIB)" },
    { id: "KIB A", label: "KIB A (Tanah)" },
    { id: "KIB B", label: "KIB B (Peralatan)" },
    { id: "KIB C", label: "KIB C (Gedung)" },
    { id: "KIB D", label: "KIB D (Jalan/Irigasi)" },
    { id: "KIB E", label: "KIB E (Aset Lain)" },
    { id: "KIB F", label: "KIB F (Konstruksi)" },
  ];

  // Handle Manual addition
  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAsset.nama_barang || !formAsset.nilai) return;

    const added: Asset = {
      id: `AST-${Math.floor(Math.random() * 900) + 100}`,
      kategori: formAsset.kategori as any,
      kode_barang: formAsset.kode_barang || `0${formAsset.kategori?.slice(-1)}.03.01.${Math.floor(Math.random() * 90 + 10)}`,
      nama_barang: formAsset.nama_barang,
      tahun: formAsset.tahun || "2026",
      nilai: Number(formAsset.nilai),
      lokasi: formAsset.lokasi || "Gedung Utama Rarang Selatan",
      kondisi: formAsset.kondisi as any,
      luas: formAsset.luas,
      sertifikat: formAsset.sertifikat,
      merk: formAsset.merk,
      panjang: formAsset.panjang,
      progress: formAsset.progress,
      keterangan: formAsset.keterangan
    };

    setAssets([...assets, added]);
    setIsAdding(false);

    // Sync database spreadsheet database center
    const sheetMapping = {
      "KIB A": "TANAH",
      "KIB B": "PERALATAN",
      "KIB C": "GEDUNG",
      "KIB D": "JALAN",
      "KIB E": "ASET_LAINNYA",
      "KIB F": "CONSTRUKSI"
    };
    const sheetName = sheetMapping[added.kategori as keyof typeof sheetMapping] || "PERALATAN";
    onDbAction(sheetName, "INSERT", added);

    setFormAsset({
      kategori: "KIB B",
      kode_barang: "",
      nama_barang: "",
      tahun: new Date().getFullYear().toString(),
      nilai: 0,
      lokasi: ruanganList[0]?.namaRuangan || "Gedung Utama Rarang Selatan",
      kondisi: "Baik"
    });
  };

  const handleDelete = (id: string, itemToDelete: Asset) => {
    setAssets(assets.filter(a => a.id !== id));
    
    const sheetMapping = {
      "KIB A": "TANAH",
      "KIB B": "PERALATAN",
      "KIB C": "GEDUNG",
      "KIB D": "JALAN",
      "KIB E": "ASET_LAINNYA",
      "KIB F": "CONSTRUKSI"
    };
    const sheetName = sheetMapping[itemToDelete.kategori as keyof typeof sheetMapping] || "PERALATAN";
    onDbAction(sheetName, "DELETE", itemToDelete);
  };

  // Simulates importing ledger data from Excel
  const handleImportExcel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelDataRow.trim()) return;

    try {
      // Row format: KodeBarang;NamaBarang;Tahun;Nilai;Kategori
      // Example: 02.03.01;Genset Kantor 5KVA;2023;12000000;KIB B
      const parts = excelDataRow.split(";");
      if (parts.length < 4) {
        throw new Error("Format baris tidak valid. Gunakan pemisah titikkoma ';'");
      }

      const imported: Asset = {
        id: `AST-X${Math.floor(Math.random() * 90) + 10}`,
        kategori: (parts[4] || "KIB B").trim() as any,
        kode_barang: parts[0].trim(),
        nama_barang: parts[1].trim(),
        tahun: parts[2].trim(),
        nilai: Number(parts[3].trim().replace(/[^0-9]/g, "")),
        lokasi: "Gedung Utama Rarang Selatan",
        kondisi: "Baik"
      };

      setAssets([...assets, imported]);
      setImportStatus("✓ Sukses mengimpor 1 rekod lembar kerja Excel.");
      setExcelDataRow("");

      const sheetMapping = {
        "KIB A": "TANAH",
        "KIB B": "PERALATAN",
        "KIB C": "GEDUNG",
        "KIB D": "JALAN",
        "KIB E": "ASET_LAINNYA",
        "KIB F": "CONSTRUKSI"
      };
      onDbAction(sheetMapping[imported.kategori as keyof typeof sheetMapping] || "PERALATAN", "INSERT", imported);

      setTimeout(() => setImportStatus(null), 4000);
    } catch (err: any) {
      setImportStatus(`❌ Galat: ${err.message}`);
    }
  };

  // Filter & Search logic
  const filteredAssets = assets.filter(item => {
    const matchesCat = filterCat === "All" || item.kategori === filterCat;
    const matchesSearch = item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.kode_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.lokasi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search & Action bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari aset berdasarkan nama, kode barang, atau lokasi penempatan..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-teal-500 bg-slate-50/50"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsImporting(!isImporting)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Import Excel/CSV
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex flex-1 md:flex-none items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500 shadow-sm"
          >
            <Plus className="h-4 w-4" /> Masukkan Aset Historis
          </button>
        </div>
      </div>

      {/* Excel / CSV Simulation panel */}
      {isImporting && (
        <div id="excel-import-panel" className="bg-gradient-to-r from-emerald-50 to-teal-50/30 rounded-xl border border-emerald-100 p-5 space-y-3">
          <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="h-4.5 w-4.5" /> Spreadsheet Import Portal (Simulasi)
          </h4>
          <p className="text-xs text-slate-600">
            Ketik data lapor baris inventaris dari file XLS Anda menggunakan pemisah titikkoma <span className="font-mono bg-emerald-100 px-1 rounded">;</span>
          </p>
          <form onSubmit={handleImportExcel} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="KodeBarang; NamaBarang; Tahun; NilaiRupiah; KategoriKIB(A-F)"
              value={excelDataRow}
              onChange={e => setExcelDataRow(e.target.value)}
              className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-mono focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 shadow"
            >
              Proses Impor
            </button>
          </form>
          <div className="text-[11px] text-slate-400">
            Contoh input: <span className="font-mono bg-white px-1 py-0.5 rounded shadow-sm">02.03.01.21; Handphone Realme C53; 2024; 2250000; KIB B</span>
          </div>
          {importStatus && (
            <p className="text-xs font-semibold mt-2">{importStatus}</p>
          )}
        </div>
      )}

      {/* Manual Input Form */}
      {isAdding && (
        <form onSubmit={handleAddAsset} className="bg-white rounded-xl border border-slate-100 p-6 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Registrasi Aset Lama / Historis Desa</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Kelompok KIB (Kategori)</label>
              <select
                value={formAsset.kategori}
                onChange={e => setFormAsset({ ...formAsset, kategori: e.target.value as any })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
              >
                <option value="KIB A">KIB A (Tanah)</option>
                <option value="KIB B">KIB B (Peralatan & Mesin)</option>
                <option value="KIB C">KIB C (Gedung & Bangunan)</option>
                <option value="KIB D">KIB D (Jalan, Irigasi & Jembatan)</option>
                <option value="KIB E">KIB E (Aset Tetap Lainnya)</option>
                <option value="KIB F">KIB F (Konstruksi Dalam Pengerjaan)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Kode Barang</label>
              <input
                type="text"
                value={formAsset.kode_barang}
                onChange={e => setFormAsset({ ...formAsset, kode_barang: e.target.value })}
                placeholder="Misal: 02.03.01.03"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Barang / Aset</label>
              <input
                type="text"
                value={formAsset.nama_barang}
                onChange={e => setFormAsset({ ...formAsset, nama_barang: e.target.value })}
                placeholder="Nama aset lengkap"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tahun Perolehan</label>
              <input
                type="text"
                value={formAsset.tahun}
                onChange={e => setFormAsset({ ...formAsset, tahun: e.target.value })}
                placeholder="2024"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nilai Perolehan / Taksiran (Rp)</label>
              <input
                type="number"
                value={formAsset.nilai}
                onChange={e => setFormAsset({ ...formAsset, nilai: Number(e.target.value) })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Lokasi Distribusi / PJ</label>
              <select
                value={formAsset.lokasi}
                onChange={e => setFormAsset({ ...formAsset, lokasi: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                {ruanganList.map(r => (
                  <option key={r.id} value={r.namaRuangan}>{r.namaRuangan}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional Sub fields based on KIB Type */}
          <div className="p-4 bg-slate-50 rounded-lg space-y-4">
            <span className="text-xs font-bold text-slate-600 block">Atribut Khusus Registrasi KIB</span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {formAsset.kategori === "KIB A" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Luas Tanah</label>
                    <input
                      type="text"
                      placeholder="1.200 m2"
                      value={formAsset.luas || ""}
                      onChange={e => setFormAsset({ ...formAsset, luas: e.target.value })}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nomor Sertifikat</label>
                    <input
                      type="text"
                      placeholder="M.234/RS/2005"
                      value={formAsset.sertifikat || ""}
                      onChange={e => setFormAsset({ ...formAsset, sertifikat: e.target.value })}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                </>
              )}
              {formAsset.kategori === "KIB B" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Merk / Tipe Mesin</label>
                  <input
                    type="text"
                    placeholder="Yamaha NMAX, Epson L3110"
                    value={formAsset.merk || ""}
                    onChange={e => setFormAsset({ ...formAsset, merk: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
              )}
              {formAsset.kategori === "KIB C" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Luas Lantai Gedung</label>
                  <input
                    type="text"
                    placeholder="350 m2"
                    value={formAsset.luas || ""}
                    onChange={e => setFormAsset({ ...formAsset, luas: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
              )}
              {formAsset.kategori === "KIB D" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Panjang Jarak / Konstruksi</label>
                  <input
                    type="text"
                    placeholder="450 Meter"
                    value={formAsset.panjang || ""}
                    onChange={e => setFormAsset({ ...formAsset, panjang: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
              )}
              {formAsset.kategori === "KIB E" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Keterangan Tambahan / Penulis Buku</label>
                  <input
                    type="text"
                    placeholder="Spesifikasi buku, pustaka dll"
                    value={formAsset.keterangan || ""}
                    onChange={e => setFormAsset({ ...formAsset, keterangan: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
              )}
              {formAsset.kategori === "KIB F" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Progress Pekerjaan Fisik (%)</label>
                  <input
                    type="text"
                    placeholder="Misal: 45%"
                    value={formAsset.progress || ""}
                    onChange={e => setFormAsset({ ...formAsset, progress: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Sembunyikan
            </button>
            <button
              type="submit"
              className="rounded-md bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-teal-500"
            >
              Simpan ke Register KIB
            </button>
          </div>
        </form>
      )}

      {/* Categories Sub tabs filtration */}
      <div className="overflow-x-auto whitespace-nowrap border-b border-slate-100 pb-1">
        <div className="flex gap-1.5 uppercase font-semibold text-[10px]">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(cat.id)}
              className={`px-3 py-2 rounded-lg font-bold transition-colors ${
                filterCat === cat.id 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main KIB Ledger Table */}
      <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm bg-white">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-3">ID & Buku KIB</th>
              <th className="px-6 py-3">Nama Barang / Aset</th>
              <th className="px-6 py-3">Spesifikasi / Atribut</th>
              <th className="px-6 py-3">Peralatan / Sektor</th>
              <th className="px-6 py-3 text-right">Nilai Perolehan</th>
              <th className="px-6 py-3">Kondisi</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {filteredAssets.length > 0 ? (
              filteredAssets.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900 block">{item.id}</span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 uppercase mt-1">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-950 text-xs">{item.nama_barang}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Kode: {item.kode_barang}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {item.kategori === "KIB A" && <span>Luas: {item.luas || "-"} • Sertifikat: {item.sertifikat || "-"}</span>}
                    {item.kategori === "KIB B" && <span>Merk: {item.merk || "-"}</span>}
                    {item.kategori === "KIB C" && <span>Luas Gedung: {item.luas || "-"}</span>}
                    {item.kategori === "KIB D" && <span>Panjang Jalur: {item.panjang || "-"}</span>}
                    {item.kategori === "KIB E" && <span>Keterangan: {item.keterangan || "-"}</span>}
                    {item.kategori === "KIB F" && <span>Progress: {item.progress || "0%"} (R. termin)</span>}
                    <div className="text-[10px] text-slate-400 mt-0.5">Tahun Perolehan: {item.tahun}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{item.lokasi}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">
                    Rp. {item.nilai.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      item.kondisi === "Baik" ? "bg-teal-50 text-teal-700" :
                      item.kondisi === "Rusak Ringan" ? "bg-yellow-50 text-yellow-800" :
                      item.kondisi === "Rusak Berat" ? "bg-red-50 text-red-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {item.kondisi}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setQrModalItem(item)}
                        className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50"
                        title="Cetak Label QR Code"
                      >
                        <QrCode className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item)}
                        className="text-slate-400 hover:text-red-600 p-1.5"
                        title="Hapus aset"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                  Belum ada aset terdaftar di kategori filter ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* QR Code Label Print Modal */}
      {qrModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl space-y-4 border border-slate-100">
            <button
              onClick={() => setQrModalItem(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cetak Label Fisik</h3>
              <p className="text-[10px] text-slate-400 uppercase mt-0.5">Sistem Integrasi QR SIPADES v4.0</p>
            </div>

            {/* Visual Sticker Preview */}
            <div id="print-label-sticker" className="rounded-lg border-[3px] border-slate-800 p-4 bg-white space-y-3 font-sans text-left text-slate-900 shadow">
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-tight text-slate-800">ASET PEMERINTAH DESA</h4>
                  <p className="text-[9px] font-bold text-teal-700 leading-none">{profilDesa?.namaDesa ? profilDesa.namaDesa.toUpperCase() : "DESA RARANG SELATAN"}</p>
                </div>
                <img 
                  src={profilDesa?.logo || "https://upload.wikimedia.org/wikipedia/commons/4/4e/Lambang_Dati_II_Lombok_Timur.png"}
                  alt={profilDesa?.kabupaten || "Lombok Timur"} 
                  className="h-6 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 items-center pt-1">
                {/* QR Generation with api.qrserver.com */}
                <div className="col-span-1 flex flex-col items-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
                      JSON.stringify({ id: qrModalItem.id, code: qrModalItem.kode_barang, name: qrModalItem.nama_barang })
                    )}`}
                    alt="QR Code"
                    className="h-20 w-20 border border-slate-200 p-0.5 rounded"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[8px] font-bold font-mono mt-1 text-slate-500">{qrModalItem.id}</span>
                </div>

                <div className="col-span-2 text-xxs space-y-1 text-slate-700">
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block text-[7px]">Nama Barang:</span>
                    <span className="font-bold text-slate-900 text-[10px] leading-tight break-words">{qrModalItem.nama_barang}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block text-[7px]">Kode Barang:</span>
                    <span className="font-mono text-xs font-bold text-slate-800">{qrModalItem.kode_barang}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block text-[7px]">Tahun & Sektor:</span>
                    <span className="font-semibold text-slate-800">{qrModalItem.tahun} • {qrModalItem.lokasi}</span>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-slate-800 pt-1.5 text-center">
                <p className="text-[8px] font-mono font-bold text-slate-500">KONDISI FISIK: {qrModalItem.kondisi.toUpperCase()} • DO NOT ALTER OR REMOVE</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 text-xs text-center shadow"
              >
                Cetak via Printer Mandiri
              </button>
              <button
                onClick={() => setQrModalItem(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
