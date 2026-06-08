import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  Copy, 
  Edit, 
  Trash2, 
  HelpCircle, 
  Check, 
  FileText, 
  Layers, 
  ArrowUpDown,
  BookOpen,
  Info,
  SlidersHorizontal
} from "lucide-react";
import { Asset } from "../types";

export interface RefKodeBarang {
  id: string;
  kode: string;
  nama: string;
  kategori: "KIB A" | "KIB B" | "KIB C" | "KIB D" | "KIB E" | "KIB F";
  keterangan: string;
  isCustom?: boolean;
}

interface KodeBarangProps {
  assets: Asset[];
}

export default function KodeBarang({ assets }: KodeBarangProps) {
  // Initial references based on actual Permendagri classification standards
  const [kodeList, setKodeList] = useState<RefKodeBarang[]>([
    // KIB A (Tanah)
    { id: "KB-01", kode: "01.01.01.01.01", nama: "Tanah Bangunan Perkantoran Desa", kategori: "KIB A", keterangan: "Tanah bangunan untuk keperluan dinas pelayanan desa & BPD." },
    { id: "KB-02", kode: "01.01.01.01.02", nama: "Tanah Pekarangan Kantor", kategori: "KIB A", keterangan: "Lahan kosong di sekeliling wilayah fasilitas kantor pemerintah desa." },
    { id: "KB-03", kode: "01.01.01.02.04", nama: "Tanah Sawah Kas Desa (Bengkok Kades / Perangkat)", kategori: "KIB A", keterangan: "Sawah jaminan/bengkok jabatan yang dikelola kades/staf." },
    { id: "KB-04", kode: "01.01.01.03.01", nama: "Tanah Lapangan Olahraga Desa", kategori: "KIB A", keterangan: "Lahan olahraga pemuda desa / fasilitas lapangan umum Dusun Rarang." },
    { id: "KB-05", kode: "01.01.02.01.01", nama: "Tempat Pemakaman Umum (TPU) Desa", kategori: "KIB A", keterangan: "Lokasi pekuburan atau pemakaman warga desa." },
    
    // KIB B (Peralatan & Mesin)
    { id: "KB-06", kode: "02.03.01.03.02", nama: "Laptop / Notebook Komputer", kategori: "KIB B", keterangan: "Alat pengolah data portable pendukung kinerja staf desa." },
    { id: "KB-07", kode: "02.03.01.03.01", nama: "Personal Computer (PC) / Desktop", kategori: "KIB B", keterangan: "Unit komputer meja di bagian admin / kaur umum." },
    { id: "KB-08", kode: "02.04.12.01.02", nama: "Sepeda Motor Operasional Desa", kategori: "KIB B", keterangan: "Kendaraan roda dua dinas perangkat/kepala desa untuk kerja lapangan." },
    { id: "KB-09", kode: "02.04.05.01.01", nama: "Ambulans Desa / Mobil Siaga Desa", kategori: "KIB B", keterangan: "Mobil kesehatan penunjang rujukan darurat warga desa." },
    { id: "KB-10", kode: "02.06.01.01.01", nama: "Kursi Besi / Kursi Aula Lipat", kategori: "KIB B", keterangan: "Menejemen inventaris kursi lipat serbaguna di Aula Desa." },
    { id: "KB-11", kode: "02.03.01.04.01", nama: "Printer / Scanner Kantor", kategori: "KIB B", keterangan: "Alat cetak administrasi, surat pengantar, & laporan desa." },
    { id: "KB-12", kode: "02.05.01.01.01", nama: "Televisi / Alat Studio", kategori: "KIB B", keterangan: "Smart TV pemantau visual CCTV atau papan pengumuman digital." },
    { id: "KB-13", kode: "02.05.02.01.01", nama: "Sound System / Wireless Amplifier Aula", kategori: "KIB B", keterangan: "Alat pengeras suara portable dan sound aula rapat warga Kades." },
    
    // KIB C (Gedung & Bangunan)
    { id: "KB-14", kode: "03.01.01.01.01", nama: "Gedung Kantor Pemerintah Desa", kategori: "KIB C", keterangan: "Bangunan fisik utama kantor urusan & layanan masyarakat." },
    { id: "KB-15", kode: "03.02.01.03.01", nama: "Gedung Posyandu / KIA Desa", kategori: "KIB C", keterangan: "Fasilitas balai pos pelayanan terpadu bagi warga dusun." },
    { id: "KB-16", kode: "03.01.01.03.01", nama: "Gedung Aula Serbaguna Desa", kategori: "KIB C", keterangan: "Aula besar tempat berkumpulnya musyawarah perencanaan pembangunan desa." },
    { id: "KB-17", kode: "03.01.01.05.01", nama: "Gedung Perpustakaan Desa", kategori: "KIB C", keterangan: "Ruang baca umum penyedia literasi pendidikan untuk anak & warga." },
    { id: "KB-18", kode: "03.04.01.01.01", nama: "Tempat Parkir Kendaraan Kantor", kategori: "KIB C", keterangan: "Kanopi/paving block parkiran roda dua dan roda empat desa." },

    // KIB D (Jalan, Irigasi & Jembatan)
    { id: "KB-19", kode: "04.01.01.02.01", nama: "Rabat Beton / Aspal Jalan Lingkungan Desa", kategori: "KIB D", keterangan: "Konstruksi prasarana jalan rabat penghubung antar-dusun." },
    { id: "KB-20", kode: "04.01.02.01.01", nama: "Jembatan Desa Baja / Beton", kategori: "KIB D", keterangan: "Struktur penghubung sungai atau irigasi besar antar wilayah tani." },
    { id: "KB-21", kode: "04.03.01.01.02", nama: "Saluran Irigasi Tersier Petanian", kategori: "KIB D", keterangan: "Parit/gorong-gorong penyaluran air sawah kelompok tani subak." },
    { id: "KB-22", kode: "04.03.02.01.01", nama: "Penampungan Air Bersih Desa (Sumur Bor)", kategori: "KIB D", keterangan: "Instalasi pasokan air minum bersih komunal masyarakat Rarang." },
    { id: "KB-23", kode: "04.05.01.01.01", nama: "Jaringan Listrik Jalan / Penerangan Jalan Umum", kategori: "KIB D", keterangan: "Tiang, solar cell & lampu jalan umum desa untuk keamanan malam hari." },

    // KIB E (Aset Tetap Lainnya)
    { id: "KB-24", kode: "05.01.01.01.02", nama: "Buku Ilmu Pengetahuan / Perpustakaan", kategori: "KIB E", keterangan: "Buku-buku koleksi keagamaan, hukum, peternakan & pertanian desa." },
    { id: "KB-25", kode: "05.01.02.01.01", nama: "Barang Kesenian Tradisional Gendang Beleq (Sasak)", kategori: "KIB E", keterangan: "Aset kebudayaan berupa alat musik tradisional suku Sasak." },
    { id: "KB-26", kode: "05.02.01.01.01", nama: "Hewan Ternak / Tanaman Induk Desa", kategori: "KIB E", keterangan: "Induk sapi/kambing program pemberdayaan ketahanan pangan lokal." },

    // KIB F (Konstruksi Dalam Pengerjaan)
    { id: "KB-27", kode: "06.01.01.01.99", nama: "Konstruksi Bangunan Dalam Pengerjaan (KDP LAPANGAN)", kategori: "KIB F", keterangan: "Aset berbentuk bangunan fisik yang status penyelesaiannya masih draf fisik." },
    { id: "KB-28", kode: "06.01.02.01.99", nama: "Konstruksi Jalan / Irigasi Dalam Pengerjaan", kategori: "KIB F", keterangan: "Proyek jalan lingkungan atau pintu air irigasi desa masih berjalan." }
  ]);

  // Search, filter & sorting states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal / Drawer state for adding custom Code
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEditCode, setSelectedEditCode] = useState<RefKodeBarang | null>(null);

  // Form states
  const [formInput, setFormInput] = useState({
    kode: "",
    nama: "",
    kategori: "KIB B" as RefKodeBarang["kategori"],
    keterangan: ""
  });

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetForm = () => {
    setFormInput({
      kode: "",
      nama: "",
      kategori: "KIB B",
      keterangan: ""
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInput.kode || !formInput.nama) {
      alert("Harap isi kode & nama barang klasifikasi!");
      return;
    }

    const newCode: RefKodeBarang = {
      id: `KB-CUST-${Math.floor(Math.random() * 9000) + 1000}`,
      kode: formInput.kode,
      nama: formInput.nama,
      kategori: formInput.kategori,
      keterangan: formInput.keterangan || "Custom item kode barang yang ditambahkan oleh Pemerintahan Desa.",
      isCustom: true
    };

    setKodeList(prev => [...prev, newCode]);
    handleResetForm();
    setShowAddModal(false);
  };

  const handleStartEdit = (item: RefKodeBarang) => {
    setSelectedEditCode(item);
    setFormInput({
      kode: item.kode,
      nama: item.nama,
      kategori: item.kategori,
      keterangan: item.keterangan
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditCode) return;

    setKodeList(prev => prev.map(item => {
      if (item.id === selectedEditCode.id) {
        return {
          ...item,
          kode: formInput.kode,
          nama: formInput.nama,
          kategori: formInput.kategori,
          keterangan: formInput.keterangan
        };
      }
      return item;
    }));

    handleResetForm();
    setSelectedEditCode(null);
    setShowEditModal(false);
  };

  const handleDeleteCode = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kode klasifikasi kustom ini?")) {
      setKodeList(prev => prev.filter(item => item.id !== id));
    }
  };

  // Filter elements
  const filteredList = kodeList.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.kode.includes(searchQuery) ||
                          item.keterangan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCat === "All" || item.kategori === selectedCat;
    return matchesSearch && matchesCat;
  });

  // Calculate stats
  const totalCodesCount = kodeList.length;
  const customCodesCount = kodeList.filter(item => item.isCustom).length;
  const kibBcodesCount = kodeList.filter(item => item.kategori === "KIB B").length;
  
  // Checking how many codes are actively assigned to real assets in KIB
  const activeCodesInAssets = kodeList.filter(kb => assets.some(a => a.kode_barang === kb.kode)).length;

  const getKibBadgeColor = (kategori: string) => {
    switch (kategori) {
      case "KIB A": return "bg-blue-50 text-blue-800 border-blue-200";
      case "KIB B": return "bg-amber-50 text-amber-850 border-amber-200";
      case "KIB C": return "bg-pink-50 text-pink-800 border-pink-200";
      case "KIB D": return "bg-purple-50 text-purple-800 border-purple-200";
      case "KIB E": return "bg-teal-50 text-teal-850 border-teal-200";
      case "KIB F": return "bg-slate-100 text-slate-800 border-slate-300";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* Upper header summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-900" />
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">KODE KLASIFIKASI BARANG (KODE BARANG)</h2>
          </div>
          <p className="text-slate-550 text-xs">
            Referensi pembukuan kode barang resmi sesuai arahan sistem akuntansi Pemkab Lombok Timur & Permendagri No. 47 Tahun 2021 mengenai Penataan Aset Desa.
          </p>
        </div>
        <button
          onClick={() => { handleResetForm(); setShowAddModal(true); }}
          className="rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 px-4 text-xs tracking-wider inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
        >
          <Plus className="h-4.5 w-4.5" /> TAMBAH KODE KUSTOM
        </button>
      </div>

      {/* Statistics board references */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 text-left relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10 bg-slate-100 p-2 rounded-full">
            <BookOpen className="h-10 w-10 text-slate-900" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Kode Terdaftar</span>
          <h3 className="text-2xl font-black text-slate-900 leading-tight">{totalCodesCount} <span className="text-xs font-normal text-slate-500">Unit</span></h3>
          <p className="text-[10px] text-slate-500 font-mono">28 Standar + {customCodesCount} Custom</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 text-left relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10 bg-amber-100 p-2 rounded-full">
            <Layers className="h-10 w-10 text-amber-900" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Format KIB B (Peralatan)</span>
          <h3 className="text-2xl font-black text-amber-900 leading-tight">{kibBcodesCount} <span className="text-xs font-normal text-amber-600">Terdaftar</span></h3>
          <p className="text-[10px] text-slate-500 font-mono">Kode Peralatan, Mesin & IT</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 text-left relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10 bg-blue-100 p-2 rounded-full">
            <SlidersHorizontal className="h-10 w-10 text-blue-900" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Kode Buatan Kustom</span>
          <h3 className="text-2xl font-black text-blue-800 leading-tight">{customCodesCount} <span className="text-xs font-normal text-blue-600">Spesifik</span></h3>
          <p className="text-[10px] text-slate-500 font-mono">Ditambahkan manual oleh desa</p>
        </div>

        <div className="bg-white rounded-2xl border border-teal-200 p-5 shadow-emerald-50 shadow-sm space-y-2 text-left relative overflow-hidden bg-teal-50/10">
          <div className="absolute right-3 top-3 opacity-20 bg-teal-100 p-2 rounded-full">
            <Check className="h-10 w-10 text-teal-950" />
          </div>
          <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest block">Efisiensi Kode Aktif</span>
          <h3 className="text-2xl font-black text-teal-950 leading-tight">{activeCodesInAssets} <span className="text-xs font-normal text-teal-700">Kode</span></h3>
          <p className="text-[10px] text-teal-600/90 font-medium">Asosiasi aktif dengan fisik KIB</p>
        </div>
      </div>

      {/* Control filter segment & search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Searching input bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari berdasarkan kode klasifikasi (misal: '02.03'), nama barang, atau deskripsi..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
            />
          </div>

          {/* Tab category segment horizontal buttons */}
          <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
            {["All", "KIB A", "KIB B", "KIB C", "KIB D", "KIB E", "KIB F"].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                className={`py-1.5 px-3 rounded-lg text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all ${
                  selectedCat === cat 
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                {cat === "All" ? "Semua Kategori" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Info panel alert helper */}
        <div className="bg-amber-50/55 border border-amber-200/60 p-3.5 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-700 leading-normal">
          <Info className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Pemberitahuan Sinkronisasi KIB:</strong> Kode Barang di tabel ini berfungsi sebagai basis penamaan stiker QR Code dan isian form saat operator meng-input aset baru. Operator dapat dengan mudah meng-copy kode di bawah ini lalu menempelkannya (paste) pada isian <em>"Kode Barang"</em> di formulir KIB untuk akurasi data.
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto rounded-xl border border-slate-150">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
                <th className="px-5 py-3.5 text-center">Tipe KIB</th>
                <th className="px-5 py-3.5">Kode Standardisasi</th>
                <th className="px-5 py-3.5">Nama Urusan / Klasifikasi</th>
                <th className="px-5 py-3.5">Keterangan / Fungsi Penataan</th>
                <th className="px-3 py-3.5 text-center">Aset Fisik</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredList.length > 0 ? (
                filteredList.map((item) => {
                  const associatedAssetsCount = assets.filter(a => a.kode_barang === item.kode).length;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors text-xs">
                      {/* Badge KIB */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-[9px] font-extrabold font-mono tracking-wider shadow-xxs ${getKibBadgeColor(item.kategori)}`}>
                          {item.kategori}
                        </span>
                      </td>

                      {/* Code string with copy option */}
                      <td className="px-5 py-4 font-mono font-bold text-slate-900 select-all whitespace-nowrap">
                        <div className="flex items-center gap-1.5 group">
                          <code className="bg-slate-100 px-2 py-1 rounded text-slate-800 border border-slate-200">
                            {item.kode}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(item.id, item.kode)}
                            title="Klik Copy Kode"
                            className="text-slate-400 hover:text-blue-700 bg-white border border-slate-200 rounded p-1 shadow-xxs group-hover:opacity-100 opacity-80 cursor-pointer transition-all"
                          >
                            {copiedId === item.id ? (
                              <Check className="h-3 w-3 text-emerald-600 font-bold" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Item Name */}
                      <td className="px-5 py-4 font-semibold text-slate-900 whitespace-normal min-w-[200px]">
                        <div className="flex items-center gap-1.5">
                          <span>{item.nama}</span>
                          {item.isCustom && (
                            <span className="bg-sky-100 text-sky-800 text-[8px] font-black uppercase px-1 rounded-sm border border-sky-200">Custom</span>
                          )}
                        </div>
                      </td>

                      {/* Brief description */}
                      <td className="px-5 py-4 text-slate-550 leading-relaxed max-w-[340px] whitespace-normal">
                        {item.keterangan}
                      </td>

                      {/* Association Count Badge */}
                      <td className="px-3 py-4 text-center">
                        {associatedAssetsCount > 0 ? (
                          <span className="bg-teal-500 text-white font-extrabold rounded-full px-2 py-0.5 text-[10px] shadow-sm tracking-wide">
                            {associatedAssetsCount} Unit
                          </span>
                        ) : (
                          <span className="text-slate-300 italic font-mono text-[10px]">—</span>
                        )}
                      </td>

                      {/* Row actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {item.isCustom ? (
                          <div className="inline-flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(item)}
                              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded p-1.5 shadow-xxs cursor-pointer transition-colors"
                              title="Edit Kode Barang Kustom"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCode(item.id)}
                              className="bg-white border border-rose-100 text-rose-650 hover:bg-rose-50 hover:text-rose-800 rounded p-1.5 shadow-xxs cursor-pointer transition-colors animate-fade-in"
                              title="Hapus Kode Barang Kustom"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Standar Pabrikan GID</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 italic h-48">
                    Data kode klasifikasi tidak ditemukan untuk kata kunci "{searchQuery}" atau filter "{selectedCat}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Regulation Info Box card */}
      <div className="bg-slate-900 text-slate-350 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row gap-5 items-center justify-between text-left antialiased">
        <div className="space-y-2 max-w-3xl">
          <span className="border border-slate-700 rounded px-2.5 py-0.5 text-[8px] font-mono tracking-widest text-slate-450 uppercase font-black block w-fit">Permendagri Regulasi</span>
          <h4 className="text-sm font-bold text-white uppercase tracking-wide">Pedoman Pembukuan Siskeudes & SIPADES SMART</h4>
          <p className="text-[11.5px] leading-relaxed text-slate-400 font-sans">
            Standar format pengkodean barang mengikuti susunan 5 tingkat kelompok urusan: <em>{'{Bidang}.{Sub-Bidang}.{Kelompok}.{Jenis}.{Objek}'}</em>. Digit yang serasi mencegah duplikasi ganda dalam Laporan Kekayaan Milik Desa (LKMD) tahunan. Seluruh daftar di sini terintegrasi langsung dengan menu stiker barcoded KIB dan visual pemicu scanner audit lapangan.
          </p>
        </div>
        <div className="rounded-xl border border-slate-850 p-4 bg-slate-950/40 text-center min-w-[200px] shrink-0">
          <span className="text-[10px] text-slate-500 font-mono font-bold block uppercase tracking-wider">Metode Sinkronisasi</span>
          <p className="text-white font-extrabold text-base mt-1">Sipades-Cloud</p>
          <span className="text-[9px] text-teal-400 font-black tracking-widest block uppercase mt-1 animate-pulse">● Online & Enkripsi data</span>
        </div>
      </div>

      {/* ➕ TAMBAH KODE KUSTOM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur p-4 overflow-y-auto">
          <form 
            onSubmit={handleAddSubmit}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-left space-y-4 my-8 animate-fade-in"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <span className="text-xs font-black text-blue-900 uppercase flex items-center gap-1.5 font-sans">
                <Plus className="h-4.5 w-4.5 text-blue-600" /> Tambah Kode Barang Kustom Baru
              </span>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-800">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Klasifikasi KIB</label>
                <select
                  value={formInput.kategori}
                  onChange={e => setFormInput(prev => ({ ...prev, kategori: e.target.value as any }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-blue-600 focus:outline-none font-bold"
                >
                  <option value="KIB A">KIB A — Aset Tanah Desa</option>
                  <option value="KIB B">KIB B — Mesin, Peralatan & IT Desa</option>
                  <option value="KIB C">KIB C — Gedung & Bangunan Desa</option>
                  <option value="KIB D">KIB D — Jalan, Irigasi & Penerangan Desa</option>
                  <option value="KIB E">KIB E — Aset Perpustakaan & Kesenian</option>
                  <option value="KIB F">KIB F — Konstruksi Dalam Pengerjaan (KDP)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Sandi Kode Barang (Contoh: 02.03.01.03.99)</label>
                <input 
                  type="text"
                  placeholder="02.03.01.03.99"
                  value={formInput.kode}
                  onChange={e => setFormInput(prev => ({ ...prev, kode: e.target.value }))}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-blue-600 focus:outline-none font-medium font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Nama Urusan / Klasifikasi Barang</label>
                <input 
                  type="text"
                  placeholder="Server Cloud Mini Data Server"
                  value={formInput.nama}
                  onChange={e => setFormInput(prev => ({ ...prev, nama: e.target.value }))}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-blue-600 focus:outline-none font-semibold text-slate-850"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Keterangan / Fungsi Penataan Teknis</label>
                <textarea 
                  rows={3}
                  placeholder="Deskripsi ringkas mengenai item pengelompokan..."
                  value={formInput.keterangan}
                  onChange={e => setFormInput(prev => ({ ...prev, keterangan: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-blue-600 focus:outline-none text-slate-650"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-slate-250 hover:bg-slate-50 font-bold py-2 px-4 text-xs cursor-pointer text-slate-700 transition"
              >
                Kembali / Batal
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-5 text-xs cursor-pointer shadow-sm transition"
              >
                Daftarkan Kode
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ✏️ EDIT KODE KUSTOM MODAL */}
      {showEditModal && selectedEditCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur p-4 overflow-y-auto">
          <form 
            onSubmit={handleEditSubmit}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-left space-y-4 my-8 animate-fade-in"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <span className="text-xs font-black text-amber-900 uppercase flex items-center gap-1.5 font-sans">
                <Edit className="h-4.5 w-4.5 text-amber-600" /> Edit Kode Klasifikasi Kustom
              </span>
              <button 
                type="button"
                onClick={() => { setSelectedEditCode(null); setShowEditModal(false); }}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-800">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Klasifikasi KIB</label>
                <select
                  value={formInput.kategori}
                  onChange={e => setFormInput(prev => ({ ...prev, kategori: e.target.value as any }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-blue-600 focus:outline-none font-bold"
                >
                  <option value="KIB A">KIB A — Aset Tanah Desa</option>
                  <option value="KIB B">KIB B — Mesin, Peralatan & IT Desa</option>
                  <option value="KIB C">KIB C — Gedung & Bangunan Desa</option>
                  <option value="KIB D">KIB D — Jalan, Irigasi & Penerangan Desa</option>
                  <option value="KIB E">KIB E — Aset Perpustakaan & Kesenian</option>
                  <option value="KIB F">KIB F — Konstruksi Dalam Pengerjaan (KDP)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Sandi Kode Barang</label>
                <input 
                  type="text"
                  placeholder="02.03.01.03.99"
                  value={formInput.kode}
                  onChange={e => setFormInput(prev => ({ ...prev, kode: e.target.value }))}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-blue-600 focus:outline-none font-medium font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Nama Urusan / Klasifikasi Barang</label>
                <input 
                  type="text"
                  placeholder="Server Cloud Mini Data Server"
                  value={formInput.nama}
                  onChange={e => setFormInput(prev => ({ ...prev, nama: e.target.value }))}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-blue-600 focus:outline-none font-semibold text-slate-850"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Keterangan / Fungsi Penataan Teknis</label>
                <textarea 
                  rows={3}
                  placeholder="Deskripsi ringkas mengenai item pengelompokan..."
                  value={formInput.keterangan}
                  onChange={e => setFormInput(prev => ({ ...prev, keterangan: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-blue-600 focus:outline-none text-slate-650"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setSelectedEditCode(null); setShowEditModal(false); }}
                className="rounded-lg border border-slate-250 hover:bg-slate-50 font-bold py-2 px-4 text-xs cursor-pointer text-slate-700 transition"
              >
                Kembali / Batal
              </button>
              <button
                type="submit"
                className="rounded-lg bg-slate-900 hover:bg-slate-850 text-white font-bold py-2 px-5 text-xs cursor-pointer shadow-sm transition"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
