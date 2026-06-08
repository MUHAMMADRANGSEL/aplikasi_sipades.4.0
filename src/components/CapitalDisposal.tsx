import React, { useState } from "react";
import { Kapitalisasi, Penghapusan, Asset } from "../types";
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  CheckSquare, 
  Clock, 
  AlertOctagon,
  FileText,
  DollarSign,
  ShieldCheck,
  Lock,
  QrCode,
  Fingerprint,
  CheckCircle2,
  FileSignature
} from "lucide-react";

interface CapitalDisposalProps {
  kapitalisasiList: Kapitalisasi[];
  setKapitalisasiList: (list: Kapitalisasi[]) => void;
  penghapusanList: Penghapusan[];
  setPenghapusanList: (list: Penghapusan[]) => void;
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  onDbAction: (sheet: string, type: "INSERT" | "UPDATE" | "DELETE", data: any) => void;
}

export default function CapitalDisposal({
  kapitalisasiList,
  setKapitalisasiList,
  penghapusanList,
  setPenghapusanList,
  assets,
  setAssets,
  onDbAction
}: CapitalDisposalProps) {
  const [activeTab, setActiveTab] = useState<"kapitalisasi" | "penghapusan">("kapitalisasi");

  // Digisign state for Berita Acara
  const [selectedBaData, setSelectedBaData] = useState<Penghapusan | null>(null);
  const [signedBaList, setSignedBaList] = useState<Record<string, {
    signed: boolean;
    method: "QR" | "TTE";
    certNo: string;
    signer: string;
    timestamp: string;
  }>>({
    // Pre-seed a beautiful existing signed BA
    "BA.045/03/RS/V/2026": {
      signed: true,
      method: "TTE",
      certNo: "TTE-BA-PNH-88219",
      signer: "H. RIDWAN, M.Si. (Kepala Desa)",
      timestamp: "08 Jun 2026 15:44"
    }
  });

  const [signerRoleInput, setSignerRoleInput] = useState<string>("H. RIDWAN, M.Si. (Kepala Desa)");
  const [sigTypeInput, setSigTypeInput] = useState<"QR" | "TTE">("TTE");
  const [ttePin, setTtePin] = useState("");
  const [isSigningBa, setIsSigningBa] = useState(false);

  // Kapitalisasi Form
  const [isAddingCapital, setIsAddingCapital] = useState(false);
  const [capForm, setCapForm] = useState<Partial<Kapitalisasi>>({
    barang_id: "",
    tanggal: new Date().toISOString().split("T")[0],
    keterangan: "",
    nilai_tambah: 0
  });

  // Penghapusan Form
  const [isAddingDisposal, setIsAddingDisposal] = useState(false);
  const [dispForm, setDispForm] = useState<Partial<Penghapusan>>({
    barang_id: "",
    tanggal: new Date().toISOString().split("T")[0],
    alasan: "Rusak Berat",
    berita_acara: `BA.045.2/${Math.floor(Math.random() * 80) + 10}/RS/III/${new Date().getFullYear()}`
  });

  const handleAddCapital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capForm.barang_id || !capForm.nilai_tambah) return;

    const matchedAsset = assets.find(a => a.id === capForm.barang_id);
    const nilaiLama = matchedAsset?.nilai || 0;
    const nilaiTambah = Number(capForm.nilai_tambah);
    const nilaiBaru = nilaiLama + nilaiTambah;

    const added: Kapitalisasi = {
      id: `KAP-${Math.floor(Math.random() * 900) + 100}`,
      barang_id: capForm.barang_id,
      nama_barang: matchedAsset?.nama_barang || "Aset Tidak Dikenal",
      tanggal: capForm.tanggal || new Date().toISOString().split("T")[0],
      keterangan: capForm.keterangan || "",
      nilai_lama: nilaiLama,
      nilai_tambah: nilaiTambah,
      nilai_baru: nilaiBaru,
      status: "Draf"
    };

    setKapitalisasiList([...kapitalisasiList, added]);
    setIsAddingCapital(false);
    onDbAction("KAPITALISASI", "INSERT", added);

    setCapForm({
      barang_id: "",
      tanggal: new Date().toISOString().split("T")[0],
      keterangan: "",
      nilai_tambah: 0
    });
  };

  // POSTING KAPITALISASI: Updates the targeted Asset's book value and sets status to Posted!
  const handlePostingCapital = (item: Kapitalisasi) => {
    const listUpdated = kapitalisasiList.map(k => {
      if (k.id === item.id) {
        return { ...k, status: "Terposting" as const };
      }
      return k;
    });
    setKapitalisasiList(listUpdated);
    onDbAction("KAPITALISASI", "UPDATE", { ...item, status: "Terposting" });

    // Update the real asset value mathematically
    const assetsUpdated = assets.map(asset => {
      if (asset.id === item.barang_id) {
        return { ...asset, nilai: item.nilai_baru };
      }
      return asset;
    });
    setAssets(assetsUpdated);

    // Sync Asset value in Database Sheets
    const matchedAsset = assets.find(a => a.id === item.barang_id);
    if (matchedAsset) {
      const sheetMapping = {
        "KIB A": "TANAH",
        "KIB B": "PERALATAN",
        "KIB C": "GEDUNG",
        "KIB D": "JALAN",
        "KIB E": "ASET_LAINNYA",
        "KIB F": "CONSTRUKSI"
      };
      const sheetName = sheetMapping[matchedAsset.kategori as keyof typeof sheetMapping] || "PERALATAN";
      onDbAction(sheetName, "UPDATE", { ...matchedAsset, nilai: item.nilai_baru });
    }
  };

  const handleDeleteCapital = (id: string, item: Kapitalisasi) => {
    setKapitalisasiList(kapitalisasiList.filter(k => k.id !== id));
    onDbAction("KAPITALISASI", "DELETE", item);
  };

  const handleAddDisposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispForm.barang_id || !dispForm.alasan) return;

    const matchedAsset = assets.find(a => a.id === dispForm.barang_id);
    const added: Penghapusan = {
      id: `PHP-${Math.floor(Math.random() * 900) + 100}`,
      barang_id: dispForm.barang_id,
      nama_barang: matchedAsset?.nama_barang || "Aset Tidak Dikenal",
      tanggal: dispForm.tanggal || new Date().toISOString().split("T")[0],
      alasan: dispForm.alasan as any,
      berita_acara: dispForm.berita_acara || "",
      nilai_buku: matchedAsset?.nilai || 0
    };

    setPenghapusanList([...penghapusanList, added]);
    setIsAddingDisposal(false);
    onDbAction("PENGHAPUSAN", "INSERT", added);

    // Remove the asset from the main active inventory on disposal approval!
    setAssets(assets.filter(a => a.id !== dispForm.barang_id));

    if (matchedAsset) {
      const sheetMapping = {
        "KIB A": "TANAH",
        "KIB B": "PERALATAN",
        "KIB C": "GEDUNG",
        "KIB D": "JALAN",
        "KIB E": "ASET_LAINNYA",
        "KIB F": "CONSTRUKSI"
      };
      const sheetName = sheetMapping[matchedAsset.kategori as keyof typeof sheetMapping] || "PERALATAN";
      onDbAction(sheetName, "DELETE", matchedAsset);
    }

    setDispForm({
      barang_id: "",
      tanggal: new Date().toISOString().split("T")[0],
      alasan: "Rusak Berat",
      berita_acara: `BA.045.2/${Math.floor(Math.random() * 80) + 10}/RS/III/${new Date().getFullYear()}`
    });
  };

  const handleDeleteDisposal = (id: string, item: Penghapusan) => {
    setPenghapusanList(penghapusanList.filter(p => p.id !== id));
    onDbAction("PENGHAPUSAN", "DELETE", item);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab("kapitalisasi")}
            className={`group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-semibold transition-colors ${
              activeTab === "kapitalisasi"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <TrendingUp className="h-4.5 w-4.5" /> Kapitalisasi & Penambahan Nilai
          </button>
          <button
            onClick={() => setActiveTab("penghapusan")}
            className={`group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-semibold transition-colors ${
              activeTab === "penghapusan"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <TrendingDown className="h-4.5 w-4.5" /> Usulan & Penghapusan Aset
          </button>
        </nav>
      </div>

      {activeTab === "kapitalisasi" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">Akumulasi Kapitalisasi Aset</h3>
              <p className="text-xs text-slate-500">Mencatat penambahan nilai guna, rehabilitasi gedung, atau penimbunan tanah sawah</p>
            </div>
            {!isAddingCapital && (
              <button
                onClick={() => setIsAddingCapital(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-teal-500"
              >
                <Plus className="h-4.5 w-4.5" /> Catat Kapitalisasi Baru
              </button>
            )}
          </div>

          {isAddingCapital && (
            <form onSubmit={handleAddCapital} className="bg-white rounded-xl border border-teal-100 p-6 shadow-md space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Formulir Peningkatan Nilai Aset</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Pilih Aset Terdaftar</label>
                  <select
                    value={capForm.barang_id}
                    onChange={e => setCapForm({ ...capForm, barang_id: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                    required
                  >
                    <option value="">-- Pilih Aset --</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>({a.kategori}) {a.nama_barang} [Rp.{a.nilai.toLocaleString("id-ID")}]</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Tanggal Peningkatan</label>
                  <input
                    type="date"
                    value={capForm.tanggal}
                    onChange={e => setCapForm({ ...capForm, tanggal: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nilai Tambahan (Rp)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Nilai yang ditambahkan"
                    value={capForm.nilai_tambah || ""}
                    onChange={e => setCapForm({ ...capForm, nilai_tambah: Number(e.target.value) })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Keterangan Renovasi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Renovasi Kanopi, Uruk Jalan"
                    value={capForm.keterangan}
                    onChange={e => setCapForm({ ...capForm, keterangan: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingCapital(false)}
                  className="rounded-md border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-teal-500"
                >
                  Ajukan Kapitalisasi
                </button>
              </div>
            </form>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm bg-white">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Nama barang</th>
                  <th className="px-6 py-3">Keterangan / Uraian</th>
                  <th className="px-6 py-3 text-right">Nilai Awal</th>
                  <th className="px-6 py-3 text-right">Nilai Tambah (+)</th>
                  <th className="px-6 py-3 text-right">Nilai Buku Baru</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {kapitalisasiList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div>{item.nama_barang}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Asset ID: {item.barang_id}</div>
                    </td>
                    <td className="px-6 py-4">{item.keterangan}</td>
                    <td className="px-6 py-4 text-right">Rp. {item.nilai_lama.toLocaleString("id-ID")}</td>
                    <td className="px-6 py-4 text-right font-semibold text-emerald-600">+ Rp. {item.nilai_tambah.toLocaleString("id-ID")}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">Rp. {item.nilai_baru.toLocaleString("id-ID")}</td>
                    <td className="px-6 py-4">{item.tanggal}</td>
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
                      <div className="flex justify-end gap-1.5">
                        {item.status === "Draf" && (
                          <button
                            onClick={() => handlePostingCapital(item)}
                            className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-1 text-[11px] font-bold text-teal-700 hover:bg-teal-100 transition-colors animate-pulse"
                            title="Posting Kapitalisasi"
                          >
                            <Clock className="h-3 w-3" /> Posting Nilai
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCapital(item.id, item)}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {activeTab === "penghapusan" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">Penghapusan Buku Inventaris</h3>
              <p className="text-xs text-slate-500">Mencatat usulan penghapusan aset karena rusak berat total, hilang, dihibahkan, atau dijual</p>
            </div>
            {!isAddingDisposal && (
              <button
                onClick={() => setIsAddingDisposal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-teal-500"
              >
                <Plus className="h-4.5 w-4.5" /> Usulkan Penghapusan Fisik
              </button>
            )}
          </div>

          {isAddingDisposal && (
            <form onSubmit={handleAddDisposal} className="bg-white rounded-xl border border-rose-100 p-6 shadow-md space-y-4">
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-2">
                <AlertOctagon className="h-4 w-4" /> Berita Acara Penghapusan Aset Daerah
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Pilih Barang Dihapus</label>
                  <select
                    value={dispForm.barang_id}
                    onChange={e => setDispForm({ ...dispForm, barang_id: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                    required
                  >
                    <option value="">-- Pilih Barang --</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>({a.kategori}) {a.nama_barang} • {a.kondisi}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Sebab / Alasan Utama</label>
                  <select
                    value={dispForm.alasan}
                    onChange={e => setDispForm({ ...dispForm, alasan: e.target.value as any })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                  >
                    <option value="Rusak Berat">Rusak Berat (Obsolete)</option>
                    <option value="Hilang">Hilang (Kecurian / Bencana)</option>
                    <option value="Dijual">Dijual (Lelang Resmi Daerah)</option>
                    <option value="Hibah">Hibah (Bantuan ke Dusun/Instansi)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nomor Berita Acara (BA)</label>
                  <input
                    type="text"
                    value={dispForm.berita_acara}
                    onChange={e => setDispForm({ ...dispForm, berita_acara: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Tanggal Eksekusi</label>
                  <input
                    type="date"
                    value={dispForm.tanggal}
                    onChange={e => setDispForm({ ...dispForm, tanggal: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingDisposal(false)}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-rose-500"
                >
                  Setujui BA Penghapusan
                </button>
              </div>
            </form>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm bg-white">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3">No. Regis Penghapusan</th>
                  <th className="px-6 py-3">Nama Aset / Barang</th>
                  <th className="px-6 py-3">Nomor Berita Acara (BA)</th>
                  <th className="px-6 py-3">Alasan Penghapusan</th>
                  <th className="px-6 py-3 text-right">Nilai Buku Dihapuskan</th>
                  <th className="px-6 py-3">Tanggal Wafat Buku</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {penghapusanList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">{item.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div>{item.nama_barang}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Asset ID: {item.barang_id}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-mono text-xs select-all">{item.berita_acara}</span>
                        {signedBaList[item.berita_acara] ? (
                          <button
                            type="button"
                            onClick={() => setSelectedBaData(item)}
                            className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100 px-1.5 py-0.5 rounded text-[9px] font-extrabold cursor-pointer transition-all"
                          >
                            <ShieldCheck className="h-3 w-3 text-emerald-600" /> TTE SAH
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedBaData(item)}
                            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-all"
                          >
                            <FileSignature className="h-2.5 w-2.5 text-blue-600" /> Validasi BA
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xxs font-bold ${
                        item.alasan === "Rusak Berat" ? "bg-rose-50 text-rose-700" :
                        item.alasan === "Hilang" ? "bg-amber-50 text-amber-700" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {item.alasan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      Rp. {item.nilai_buku.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">{item.tanggal}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteDisposal(item.id, item)}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="Hapus riwayat"
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

      {/* 🧾 BERITA ACARA DETAILED MULTI-SIGNATORY MODAL OVERLAY */}
      {selectedBaData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 text-left space-y-4 my-8 animate-fade-in text-xs">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-rose-700 uppercase flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> Dokumen Berita Acara (BA) Penghapusan
              </span>
              <button 
                onClick={() => setSelectedBaData(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Document sheet template */}
            <div className="border border-slate-300 p-6 bg-slate-50/50 rounded-lg space-y-4 text-xs font-serif leading-relaxed shadow-inner">
              <div className="text-center font-bold uppercase space-y-0.5 text-slate-800 border-b border-slate-300 pb-3 font-sans">
                <h4 className="text-sm">PEMERINTAH KABUPATEN LOMBOK TIMUR</h4>
                <h4 className="text-sm">PEMERINTAH DESA RARANG SELATAN</h4>
                <p className="text-[10px] font-normal tracking-wide mt-1">Kecamatan Terara • Kode Pos 83663</p>
                <div className="border-t-2 border-slate-950 h-0.5 mt-1.5" />
                <h3 className="text-xs mt-3 tracking-wider">BERITA ACARA PENGHAPUSAN BARANG INVENTARIS DESA</h3>
                <p className="text-[10px] font-mono font-normal">Nomor Register: {selectedBaData.berita_acara}</p>
              </div>

              <div className="space-y-2 text-slate-700 font-sans leading-relaxed">
                <p>Pada hari ini, dengan mempertimbangkan kondisi barang inventaris desa, kami yang bertandatangan di bawah ini selaku Tim Pemeriksa & Penghapusan Barang Desa Rarang Selatan menyatakan bahwa:</p>
                
                <div className="pl-4 bg-white p-3 rounded border border-slate-205 font-sans text-[11px] space-y-1.5 shadow-sm">
                  <p>• <strong>Nama Aset / Barang:</strong> {selectedBaData.nama_barang} (Asset ID: {selectedBaData.barang_id})</p>
                  <p>• <strong>Nilai Tercatat / Buku:</strong> Rp {selectedBaData.nilai_buku.toLocaleString("id-ID")}</p>
                  <p>• <strong>Sebab Utama Penghabisan:</strong> <span className="text-rose-700 font-semibold">{selectedBaData.alasan}</span></p>
                  <p>• <strong>Tanggal Pembukuan Eksekusi:</strong> {selectedBaData.tanggal}</p>
                </div>

                <p>Menyatakan bahwa barang ini secara resmi <strong>DIHAPUSBUKUKAN</strong> dari Buku Inventaris Desa Rarang Selatan karena alasan kelayakan teknis, untuk selanjutnya diproses secara administrasi sesuai ketentuan Permendagri No. 1 Tahun 2016.</p>
              </div>

              {/* Verified Badge Stamp */}
              {signedBaList[selectedBaData.berita_acara] ? (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded flex items-center gap-2.5 text-emerald-800 font-sans animate-fade-in shadow-sm">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
                  <div className="text-[10px] leading-snug">
                    <p className="font-extrabold uppercase text-emerald-800">Berita Acara Sah & Ter-TTE Digital</p>
                    <p className="mt-0.5">Disahkan oleh <strong>{signedBaList[selectedBaData.berita_acara].signer}</strong> pada {signedBaList[selectedBaData.berita_acara].timestamp}</p>
                    <p className="text-[9px] font-mono text-emerald-600 font-bold mt-0.5">BSrE Sertifikat Serial: {signedBaList[selectedBaData.berita_acara].certNo}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded text-amber-800 font-sans text-[10px] leading-normal shadow-sm">
                  ⚠️ <strong>Status: Menunggu TTD Elektronik Kepala Desa.</strong> Berita Acara ini berstatus draf administrasi dan belum efektif menghapus data inventaris.
                </div>
              )}

              {/* Dynamic signatures footprint layout inside document */}
              <div className="flex justify-between items-end pt-5 border-t border-slate-200 font-sans text-[10px]">
                <div className="text-center">
                  <p className="font-semibold text-slate-500">Mengetahui Tim Pemeriksa,</p>
                  <div className="h-10 flex items-center justify-center italic text-slate-400">TTD Terlampir</div>
                  <p className="font-bold underline text-slate-850">M. FAUZI, S.IP.</p>
                </div>

                <div className="text-center flex flex-col items-center">
                  <p className="font-semibold text-slate-500">Mengesahkan,<br />Kepala Desa Rarang Selatan</p>
                  {signedBaList[selectedBaData.berita_acara] ? (
                    <div className="my-1.5 p-1.5 border border-emerald-300 bg-emerald-50 rounded text-[9px] text-emerald-800 flex flex-col items-center font-bold">
                      {signedBaList[selectedBaData.berita_acara].method === "TTE" ? (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span>TTE CERTIFIED BY BSrE</span>
                        </>
                      ) : (
                        <>
                          <QrCode className="h-7 w-7 text-emerald-850 stroke-[1.5]" />
                          <span className="text-[7px] mt-0.5">QR VALIDATED</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="h-10 flex items-center justify-center text-slate-300 italic">Belum TTD</div>
                  )}
                  <p className="font-bold underline text-slate-850">H. RIDWAN, M.Si.</p>
                </div>
              </div>
            </div>

            {/* Interactive Sign Console (Only shows if unsigned) */}
            {!signedBaList[selectedBaData.berita_acara] && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-sans">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Otoritas Kades</label>
                    <select
                      value={signerRoleInput}
                      onChange={e => setSignerRoleInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none"
                    >
                      <option value="H. RIDWAN, M.Si. (Kepala Desa)">H. RIDWAN, M.Si. — Kepala Desa Rarang Selatan</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pilih Metode Validasi</label>
                    <div className="flex bg-white border border-slate-300 rounded overflow-hidden p-0.5">
                      <button 
                        type="button" 
                        onClick={() => setSigTypeInput("TTE")}
                        className={`flex-1 py-1 px-2 font-bold text-[9px] tracking-wider uppercase text-center rounded transition-all cursor-pointer ${sigTypeInput === "TTE" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
                      >
                        TTE Sandi Negara
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setSigTypeInput("QR")}
                        className={`flex-1 py-1 px-2 font-bold text-[9px] tracking-wider uppercase text-center rounded transition-all cursor-pointer ${sigTypeInput === "QR" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
                      >
                        QR Signature
                      </button>
                    </div>
                  </div>
                </div>

                {sigTypeInput === "TTE" ? (
                  <div className="bg-white p-3 rounded-lg border border-indigo-100 space-y-2 text-left">
                    <span className="text-[10px] font-bold text-indigo-700 flex items-center gap-1"><Lock className="h-3.5 w-3.5 animate-pulse" /> Sertifikat Sandi TTE Keamanan (PIN: 1234)</span>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Ketik PIN TTE Kepala Desa..."
                        value={ttePin}
                        onChange={e => setTtePin(e.target.value)}
                        className="flex-1 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsSigningBa(true);
                          setTimeout(() => {
                            const uniqueNo = `TTE-BA-PNH-${Math.floor(Math.random() * 90000) + 10000}`;
                            setSignedBaList(prev => ({
                              ...prev,
                              [selectedBaData.berita_acara]: {
                                signed: true,
                                method: "TTE",
                                certNo: uniqueNo,
                                signer: "H. RIDWAN, M.Si. (Kepala Desa)",
                                timestamp: new Date().toLocaleDateString("id-ID") + " " + new Date().toLocaleTimeString("id-ID", {hour: "2-digit", minute:"2-digit"})
                              }
                            }));
                            setIsSigningBa(false);
                            setTtePin("");
                          }, 800);
                        }}
                        className="rounded bg-slate-900 text-white hover:bg-slate-800 font-bold px-4 py-1.5 text-xs tracking-wide cursor-pointer transition-colors"
                      >
                        {isSigningBa ? "Mengesahkan..." : "Bubuhkan TTE"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-3 rounded-lg border border-blue-100 flex justify-between items-center gap-2 text-left">
                    <span className="text-[10px] font-bold text-blue-700 flex items-center gap-1"><QrCode className="h-4 w-4" /> Bubuhkan Verifikasi QR Code</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSigningBa(true);
                        setTimeout(() => {
                          const uniqueNo = `QR-PNH-${Math.floor(Math.random() * 90000) + 10000}`;
                          setSignedBaList(prev => ({
                            ...prev,
                            [selectedBaData.berita_acara]: {
                              signed: true,
                              method: "QR",
                              certNo: uniqueNo,
                              signer: "H. RIDWAN, M.Si. (Kepala Desa)",
                              timestamp: new Date().toLocaleDateString("id-ID") + " " + new Date().toLocaleTimeString("id-ID", {hour: "2-digit", minute:"2-digit"})
                            }
                          }));
                          setIsSigningBa(false);
                        }, 800);
                      }}
                      className="rounded bg-blue-600 text-white hover:bg-blue-700 font-bold px-4 py-2 text-xs cursor-pointer transition-colors"
                    >
                      {isSigningBa ? "Memproses..." : "Sematkan QR Stempel"}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-1 gap-2 border-t border-slate-100 mt-2">
              {signedBaList[selectedBaData.berita_acara] && (
                <button
                  type="button"
                  onClick={() => {
                    setSignedBaList(prev => {
                      const copy = { ...prev };
                      delete copy[selectedBaData.berita_acara];
                      return copy;
                    });
                  }}
                  className="rounded border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold px-3 py-1.5 text-xs cursor-pointer transition-colors"
                >
                  Cabut TTD Berita Acara
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedBaData(null)}
                className="rounded bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-1.5 text-xs cursor-pointer transition-colors"
              >
                Selesai / Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
