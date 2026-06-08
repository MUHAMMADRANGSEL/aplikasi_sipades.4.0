import React, { useState } from "react";
import { Pengadaan, Asset } from "../types";
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  Upload, 
  FileText, 
  Image as ImageIcon,
  DollarSign,
  AlertCircle,
  TrendingUp,
  MapPin,
  Calendar,
  X
} from "lucide-react";

interface ProcurementProps {
  pengadaanList: Pengadaan[];
  setPengadaanList: (list: Pengadaan[]) => void;
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  onDbAction: (sheet: string, type: "INSERT" | "UPDATE" | "DELETE", data: any) => void;
  onSendWhatsApp: (type: "pengadaan" | "aset_baru", item: any) => void;
}

export default function Procurement({
  pengadaanList,
  setPengadaanList,
  assets,
  setAssets,
  onDbAction,
  onSendWhatsApp
}: ProcurementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Pengadaan>>({
    tanggal: new Date().toISOString().split("T")[0],
    kegiatan: "",
    sumber_dana: "DDS",
    kode_rekening: "",
    barang: "",
    volume: 1,
    harga: 0,
    lokasi: "Gedung Utama Rarang Selatan"
  });

  // Photo & Doc state simulation
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [uploadedDoc, setUploadedDoc] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // File drag & drop simulator
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setUploadedPhoto("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=60");
      } else {
        setUploadedDoc(file.name);
      }
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "photo" | "doc") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === "photo") {
        setUploadedPhoto("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=60");
      } else {
        setUploadedDoc(file.name);
      }
    }
  };

  const handleAddProcurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kegiatan || !formData.barang || !formData.volume || !formData.harga) return;

    const volume = Number(formData.volume);
    const harga = Number(formData.harga);
    const total = volume * harga;

    const added: Pengadaan = {
      id: `PGD-${Math.floor(Math.random() * 900) + 100}`,
      tanggal: formData.tanggal || new Date().toISOString().split("T")[0],
      kegiatan: formData.kegiatan,
      sumber_dana: formData.sumber_dana as any,
      kode_rekening: formData.kode_rekening || "2.01.01",
      barang: formData.barang,
      volume,
      harga,
      total,
      lokasi: formData.lokasi || "Gedung Utama Rarang Selatan",
      foto: uploadedPhoto || undefined,
      status: "Draf"
    };

    const nextList = [...pengadaanList, added];
    setPengadaanList(nextList);
    setIsAdding(false);
    
    // Trigger Database Center Sinkronisasi
    onDbAction("PENGADAAN", "INSERT", added);

    // Send simulated WhatsApp audit notification for new procurement
    onSendWhatsApp("pengadaan", added);

    // Reset Form
    setFormData({
      tanggal: new Date().toISOString().split("T")[0],
      kegiatan: "",
      sumber_dana: "DDS",
      kode_rekening: "",
      barang: "",
      volume: 1,
      harga: 0,
      lokasi: "Gedung Utama Rarang Selatan"
    });
    setUploadedPhoto(null);
    setUploadedDoc(null);
  };

  const handleDelete = (id: string, itemToDelete: Pengadaan) => {
    setPengadaanList(pengadaanList.filter(p => p.id !== id));
    onDbAction("PENGADAAN", "DELETE", itemToDelete);
  };

  // POSTING: Moves the procurement item from draft/pending list and spawns it in KIB Inventory!
  const handlePosting = (item: Pengadaan) => {
    const listUpdated = pengadaanList.map(p => {
      if (p.id === item.id) {
        return { ...p, status: "Terposting" as const };
      }
      return p;
    });
    setPengadaanList(listUpdated);
    onDbAction("PENGADAAN", "UPDATE", { ...item, status: "Terposting" });

    // Deduce categorization based on item name / properties
    let determinedCat: "KIB A" | "KIB B" | "KIB C" | "KIB D" | "KIB E" | "KIB F" = "KIB B";
    let kodePrefix = "02.03"; // standard KIB B
    const itemNameLower = item.barang.toLowerCase();

    if (itemNameLower.includes("tanah") || itemNameLower.includes("sawah") || itemNameLower.includes("pekarangan")) {
      determinedCat = "KIB A";
      kodePrefix = "01.01";
    } else if (itemNameLower.includes("gedung") || itemNameLower.includes("kantor") || itemNameLower.includes("posyandu") || itemNameLower.includes("aula")) {
      determinedCat = "KIB C";
      kodePrefix = "03.01";
    } else if (itemNameLower.includes("jalan") || itemNameLower.includes("aspal") || itemNameLower.includes("rabat") || itemNameLower.includes("irigasi")) {
      determinedCat = "KIB D";
      kodePrefix = "04.01";
    } else if (itemNameLower.includes("buku") || itemNameLower.includes("sandaran") || itemNameLower.includes("hukum")) {
      determinedCat = "KIB E";
      kodePrefix = "05.01";
    }

    // Insert newly created asset based on procurement
    const newAsset: Asset = {
      id: `AST-${Math.floor(Math.random() * 900) + 100}`,
      kategori: determinedCat,
      kode_barang: `${kodePrefix}.${Math.floor(Math.random() * 80) + 10}.${Math.floor(Math.random() * 80) + 10}.${Math.floor(Math.random() * 80) + 10}`,
      nama_barang: item.barang,
      tahun: item.tanggal.split("-")[0],
      nilai: item.total,
      lokasi: item.lokasi,
      kondisi: "Baik",
      foto: item.foto || "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&auto=format&fit=crop&q=60"
    };

    setAssets([...assets, newAsset]);
    
    // Register insertion log in DB center
    if (determinedCat === "KIB A") onDbAction("TANAH", "INSERT", newAsset);
    else if (determinedCat === "KIB B") onDbAction("PERALATAN", "INSERT", newAsset);
    else if (determinedCat === "KIB C") onDbAction("GEDUNG", "INSERT", newAsset);
    else if (determinedCat === "KIB D") onDbAction("JALAN", "INSERT", newAsset);
    else onDbAction("ASET_LAINNYA", "INSERT", newAsset);

    // Send SMS / WA confirmation
    onSendWhatsApp("aset_baru", newAsset);
  };

  return (
    <div className="space-y-6">
      {/* Tab Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 uppercase">Pengadaan Aset Baru</h2>
          <p className="text-xs text-slate-500">Form pengadaan belanja modal Aset Desa berdasar APBDesa (SIPADES 3.0)</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-teal-500"
          >
            <Plus className="h-4 w-4" /> Input Pengadaan Baru
          </button>
        )}
      </div>

      {/* Adding Procurement Form Overlay */}
      {isAdding && (
        <form onSubmit={handleAddProcurement} className="bg-white rounded-xl border border-teal-100 p-6 shadow-md space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-500"></span> Pengisian Form Pengadaan Belanja Modal
            </h3>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tanggal Belanja</label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={e => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Sumber Dana APBDes</label>
              <select
                value={formData.sumber_dana}
                onChange={e => setFormData({ ...formData, sumber_dana: e.target.value as any })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
              >
                <option value="DDS">DDS (Dana Desa)</option>
                <option value="ADD">ADD (Alokasi Dana Desa)</option>
                <option value="PAD">PAD (Pendapatan Asli Desa)</option>
                <option value="PBP">PBP (Penerimaan Bantuan Provinsi)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Kode Rekening Kegiatan</label>
              <input
                type="text"
                value={formData.kode_rekening}
                onChange={e => setFormData({ ...formData, kode_rekening: e.target.value })}
                placeholder="Misal: 2.05.02"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Kegiatan Bidang</label>
              <input
                type="text"
                value={formData.kegiatan}
                onChange={e => setFormData({ ...formData, kegiatan: e.target.value })}
                placeholder="Kebijakan Pengadaan Sarana Prasarana Kantor"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Lokasi Distribusi / Penempatan</label>
              <input
                type="text"
                value={formData.lokasi}
                onChange={e => setFormData({ ...formData, lokasi: e.target.value })}
                placeholder="Kantor Desa / Dusun / Posyandu"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Barang Pengadaan</label>
              <input
                type="text"
                value={formData.barang}
                onChange={e => setFormData({ ...formData, barang: e.target.value })}
                placeholder="Misal: Motor Dinas Sekdes, Lemari Arsip"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Volume (Jumlah)</label>
              <input
                type="number"
                min="1"
                value={formData.volume}
                onChange={e => setFormData({ ...formData, volume: Number(e.target.value) })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Harga Satuan (Rp)</label>
              <input
                type="number"
                min="0"
                value={formData.harga}
                onChange={e => setFormData({ ...formData, harga: Number(e.target.value) })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Combined Drag & Drop File Upload Panel */}
          <div className="space-y-2 mt-2">
            <span className="block text-xs font-semibold text-slate-500">Foto Fisik Barang & Dokumen Kuitansi</span>
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors flex flex-col items-center justify-center cursor-pointer ${
                dragActive ? "border-teal-500 bg-teal-50/20" : "border-slate-300 hover:border-teal-500 hover:bg-slate-50"
              }`}
            >
              <Upload className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700">Tarik dari komputer atau Klik untuk mengunggah dokumen</p>
              <p className="text-[10px] text-slate-400 mt-1">Dukung file Gambar (.JPG, .PNG) & File Excel/PDF bukti pembayaran</p>
              
              <input
                type="file"
                id="file-procure"
                multiple
                className="hidden"
                onChange={e => handleManualUpload(e, "photo")}
              />
              <label htmlFor="file-procure" className="mt-3 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600">
                Pilih File Dokumen
              </label>
            </div>

            {/* Uploaded assets progress indicator */}
            {(uploadedPhoto || uploadedDoc) && (
              <div className="flex flex-wrap gap-2 pt-2">
                {uploadedPhoto && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-200">
                    <ImageIcon className="h-3.5 w-3.5" /> Foto Barang Terupload (Ok)
                    <button type="button" onClick={() => setUploadedPhoto(null)} className="text-teal-900 hover:text-red-500 ml-1">×</button>
                  </span>
                )}
                {uploadedDoc && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                    <FileText className="h-3.5 w-3.5" /> Kuitansi_{uploadedDoc} (Ok)
                    <button type="button" onClick={() => setUploadedDoc(null)} className="text-blue-900 hover:text-red-500 ml-1">×</button>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batalkan
            </button>
            <button
              type="submit"
              className="rounded-md bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-teal-500"
            >
              Simpan Pengadaan Aset
            </button>
          </div>
        </form>
      )}

      {/* Procurement Ledger Grid */}
      <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm bg-white">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-3">Rencana Kegiatan & Rekening</th>
              <th className="px-6 py-3">Nama Barang</th>
              <th className="px-6 py-3">Volume & Harga</th>
              <th className="px-6 py-3">S Dana</th>
              <th className="px-6 py-3">Total Belanja (Aset)</th>
              <th className="px-6 py-3">Lokasi / Sektor</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {pengadaanList.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{item.kegiatan}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Rek: {item.kode_rekening}</div>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-800">{item.barang}</td>
                <td className="px-6 py-4">
                  <div>{item.volume} Unit</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">@ {item.harga.toLocaleString("id-ID")}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-800">
                    {item.sumber_dana}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-900">
                  Rp. {item.total.toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4">{item.lokasi}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xxs font-semibold leading-5 ${
                    item.status === "Terposting" 
                      ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20" 
                      : "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20"
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {item.status === "Draf" && (
                      <button
                        onClick={() => handlePosting(item)}
                        className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-1 text-[11px] font-bold text-teal-700 hover:bg-teal-100 transition-colors"
                        title="Posting ke KIB"
                      >
                        <CheckCircle className="h-3 w-3" /> Posting KIB
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id, item)}
                      className="text-slate-400 hover:text-red-500 duration-150 p-1"
                      title="Hapus"
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
  );
}
