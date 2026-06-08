import React, { useState } from "react";
import { Asset, Audit } from "../types";
import { 
  Camera, 
  QrCode, 
  CheckCircle, 
  Wrench, 
  ClipboardCheck, 
  AlertTriangle,
  User,
  Calendar,
  Layers,
  X,
  ScanLine,
  Image as ImageIcon,
  Plus
} from "lucide-react";

interface ScannerAuditProps {
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  auditList: Audit[];
  setAuditList: (list: Audit[]) => void;
  onDbAction: (sheet: string, type: "INSERT" | "UPDATE" | "DELETE", data: any) => void;
  onSendWhatsApp: (type: "pengadaan" | "aset_baru" | "low_stock" | "audit_remind", item: any) => void;
}

export default function ScannerAudit({
  assets,
  setAssets,
  auditList,
  setAuditList,
  onDbAction,
  onSendWhatsApp
}: ScannerAuditProps) {
  const [activeSegment, setActiveSegment] = useState<"scan" | "audit">("scan");

  // Scanner States
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepMessage, setScanStepMessage] = useState("");

  // Audit reminder states
  const [auditScheduleDate, setAuditScheduleDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState(false);

  const handleSendAuditReminder = () => {
    if (!scannedAsset) return;
    setIsSendingReminder(true);
    setReminderSuccess(false);
    
    setTimeout(() => {
      onSendWhatsApp("audit_remind", {
        id: scannedAsset.id,
        nama_barang: scannedAsset.nama_barang,
        lokasi: scannedAsset.lokasi,
        tanggal: auditScheduleDate,
        auditor: "Drs. Hermawan (Auditor Lombok Timur)"
      });
      setIsSendingReminder(false);
      setReminderSuccess(true);
      setTimeout(() => setReminderSuccess(false), 4000);
    }, 800);
  };

  // Audit Form States
  const [isAddingAudit, setIsAddingAudit] = useState(false);
  const [auditForm, setAuditForm] = useState<Partial<Audit>>({
    barang_id: "",
    kondisi: "Baik",
    auditor: "Drs. Hermawan (Auditor Lombok Timur)",
    catatan: "",
    tanggal: new Date().toISOString().split("T")[0]
  });

  // Simulates scanning an asset by choosing from the dropdown (since physical camera cannot work inside standard sandboxed iframe preview natively without device prompts!)
  const triggerScanSimulation = (assetId: string) => {
    if (!assetId) return;
    setIsScanning(true);
    setScanStepMessage("Menghubungkan kamera & mencari marker QR Code...");
    
    setTimeout(() => {
      setScanStepMessage("Marker QR SIPADES terdeteksi! Membaca checksum data...");
      setTimeout(() => {
        const item = assets.find(a => a.id === assetId) || null;
        setScannedAsset(item);
        setIsScanning(false);
        setScanStepMessage("");
      }, 1000);
    }, 1200);
  };

  const handleCreateAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditForm.barang_id || !auditForm.catatan) return;

    const matchedAsset = assets.find(a => a.id === auditForm.barang_id);
    const added: Audit = {
      id: `AUD-${Math.floor(Math.random() * 900) + 100}`,
      tanggal: auditForm.tanggal || new Date().toISOString().split("T")[0],
      barang_id: auditForm.barang_id,
      nama_barang: matchedAsset?.nama_barang || "Aset Tidak Dikenal",
      kondisi: auditForm.kondisi as any,
      auditor: auditForm.auditor || "Drs. Hermawan",
      catatan: auditForm.catatan
    };

    setAuditList([...auditList, added]);
    setIsAddingAudit(false);
    onDbAction("AUDIT", "INSERT", added);

    // Dynamic State Side Effect: Directly updates the physical asset condition state in inventory on audit process completion!
    const updatedInventory = assets.map(a => {
      if (a.id === auditForm.barang_id) {
        return { ...a, kondisi: auditForm.kondisi as any };
      }
      return a;
    });
    setAssets(updatedInventory);

    // Sync state to specific sheet
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
      onDbAction(sheetName, "UPDATE", { ...matchedAsset, kondisi: auditForm.kondisi });
    }

    setAuditForm({
      barang_id: "",
      kondisi: "Baik",
      auditor: "Drs. Hermawan (Auditor Lombok Timur)",
      catatan: "",
      tanggal: new Date().toISOString().split("T")[0]
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveSegment("scan")}
            className={`group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-semibold transition-colors ${
              activeSegment === "scan"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <ScanLine className="h-4.5 w-4.5" /> Scan QR & Penyelidikan Fisik
          </button>
          <button
            onClick={() => setActiveSegment("audit")}
            className={`group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-semibold transition-colors ${
              activeSegment === "audit"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <ClipboardCheck className="h-4.5 w-4.5" /> Stock Opname & Log Audit
          </button>
        </nav>
      </div>

      {activeSegment === "scan" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Virtual Scanner camera viewpoint */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-5 flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 text-center">Simulator Scan Label QR</h3>
            
            <div className="relative w-full aspect-square max-w-sm rounded-lg bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-4 border border-slate-700">
              {isScanning ? (
                <div className="text-center space-y-4 text-white p-6 z-10 animate-pulse">
                  <div className="h-10 w-10 rounded-full border-2 border-teal-500 border-t-transparent animate-spin mx-auto"></div>
                  <p className="text-xs font-semibold">{scanStepMessage}</p>
                </div>
              ) : scannedAsset ? (
                <div className="absolute inset-0 bg-teal-950/90 p-5 text-white flex flex-col justify-between text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-teal-400 font-mono uppercase block">{scannedAsset.kategori}</span>
                      <h4 id={`scan-name-${scannedAsset.id}`} className="text-sm font-black leading-tight text-white mt-1">{scannedAsset.nama_barang}</h4>
                    </div>
                    <span className="rounded bg-teal-500/20 text-teal-300 text-[10px] px-2 py-0.5 font-bold">{scannedAsset.id}</span>
                  </div>

                  <div className="space-y-2 text-xs text-teal-100 py-4 border-y border-teal-800">
                    <p><span className="text-slate-400">Kode Barang:</span> <span className="font-mono text-white">{scannedAsset.kode_barang}</span></p>
                    <p><span className="text-slate-400">Tahun Perolehan:</span> <span>{scannedAsset.tahun}</span></p>
                    <p><span className="text-slate-400">Nilai Pembukuan:</span> <span>Rp. {scannedAsset.nilai.toLocaleString("id-ID")}</span></p>
                    <p><span className="text-slate-400">Lokasi:</span> <span>{scannedAsset.lokasi}</span></p>
                    <p><span className="text-slate-400">Kondisi Terkini:</span> <span className="font-bold text-white">{scannedAsset.kondisi}</span></p>
                  </div>

                  <button
                    onClick={() => setScannedAsset(null)}
                    className="w-full rounded bg-teal-600 hover:bg-teal-500 text-xs font-bold py-2 text-white transition-colors"
                  >
                    Scan Ulang Barang Lain
                  </button>
                </div>
              ) : (
                <div className="text-center p-6 text-slate-400">
                  <Camera className="h-12 w-12 text-slate-500 mx-auto mb-3 animate-bounce" />
                  <p className="text-xs font-semibold">Kamera Simulator siap memindai QR Code label pada stiker fisik.</p>
                  <p className="text-[10px] text-slate-500 mt-2">Pilih barang di dropdown bawah untuk menyimulasikan sorot kamera ke kode batang.</p>
                </div>
              )}

              {/* Aiming crosshair styling */}
              {!isScanning && !scannedAsset && (
                <div className="absolute inset-10 border-2 border-dashed border-teal-500/40 rounded pointer-events-none flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-teal-400"></div>
                </div>
              )}
            </div>

            {/* Dropdown chooser trigger simulation */}
            <div className="w-full max-w-sm mt-4">
              <label id="choose-scan-label" className="block text-xxs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Pilih Aset Fisik Untuk Disorot</label>
              <select
                onChange={e => triggerScanSimulation(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs"
                defaultValue=""
              >
                <option value="" disabled>-- Pilih Aset Target Simulasi --</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>[{a.id}] {a.nama_barang} ({a.kode_barang})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Physical inspection report panel */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-7">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 border-b border-slate-50 pb-2">Status Audit Temuan Fisik</h3>
            
            {scannedAsset ? (
              <div className="space-y-4 animate-fade-in text-xs text-slate-700">
                <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                  <span className="text-xxs font-bold text-indigo-500 block">DESKRIPSI FISIK BAHAN</span>
                  <p className="font-semibold text-slate-900">{scannedAsset.nama_barang}</p>
                  <p className="text-slate-500 leading-relaxed">
                    Merupakan barang inventaris desa kategori <span className="font-bold underline">{scannedAsset.kategori}</span> terdaftar yang ditempatkan pada <span className="font-bold">{scannedAsset.lokasi}</span>. Nilai perolehan pembelian pada pembukuan adalah Rp.{scannedAsset.nilai.toLocaleString("id-ID")}.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-1">Panduan Checklist Audit (Stock Opname)</h4>
                  <ul className="space-y-2 pl-4 list-decimal text-slate-600">
                    <li>Cocokkan nomor barcode/QR {scannedAsset.id} dengan tag fisik logam/stiker pada barang.</li>
                    <li>Periksa kelengkapan fungsional, apakah barang masih berfungsi prima (Baik).</li>
                    <li>Sebutkan temuan dalam catatan audit (Auditor Log) di tab Stock Opname jika barang butuh re-revaluasi atau penghapusan buku.</li>
                  </ul>
                </div>

                {/* Audit Schedule Reminder Console */}
                <div className="p-4 border border-blue-100 bg-blue-50/50 rounded-xl space-y-3">
                  <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest block">Layanan Notifikasi WA Gateway (Fonnte)</span>
                  <p className="text-slate-550 leading-relaxed text-[11px]">
                    Kirim pesan instruksi atau pengingat jadwal audit fisik resmi ini ke Kaur Umum / Penanggung Jawab di <strong>{scannedAsset.lokasi}</strong> agar barang disiapkan.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2.5 items-end pt-1">
                    <div className="flex-1 w-full text-left">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rencana Tanggal Audit Fisik</label>
                      <input 
                        type="date"
                        value={auditScheduleDate}
                        onChange={e => setAuditScheduleDate(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-850 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendAuditReminder}
                      disabled={isSendingReminder}
                      className="w-full sm:w-auto rounded bg-blue-600 hover:bg-blue-700 hover:shadow-sm text-white font-bold px-4 py-2 text-xs inline-flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer disabled:opacity-50"
                    >
                      {isSendingReminder ? "Mengirim..." : "Kirim Pengingat Jadwal Audit WA"}
                    </button>
                  </div>
                  {reminderSuccess && (
                     <p className="text-xs text-slate-900 border border-emerald-200 bg-emerald-50 p-2.5 rounded-lg font-semibold animate-pulse">
                       ✓ Sukses! Pengingat jadwal audit berhasil diluncurkan ke perangkat desa pengambil kuasa via Fonnte WA Gateway.
                     </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400 h-64 text-center">
                <QrCode className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs">Silakan sorot & scan aset terlebih dahulu menggunakan kamera simulator di sebelah kiri untuk melihat rincian fisik, panduan pemeriksaan, dan melalukan audit stok.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSegment === "audit" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">Aktivitas Stock Opname (Audit Aset)</h3>
              <p className="text-xs text-slate-500">Mencatat hasil pemeriksaan fisik berkala untuk mencegah penyelewengan aset desa</p>
            </div>
            {!isAddingAudit && (
              <button
                onClick={() => setIsAddingAudit(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-teal-500"
              >
                <Plus className="h-3.5 w-3.5" /> Catat Hasil Opname Fisik
              </button>
            )}
          </div>

          {isAddingAudit && (
            <form onSubmit={handleCreateAudit} className="bg-white rounded-xl border border-teal-100 p-6 shadow-md space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Hasil Berita Acara Stock Opname Harian</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Pilih Barang Diaudit</label>
                  <select
                    value={auditForm.barang_id}
                    onChange={e => setAuditForm({ ...auditForm, barang_id: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500"
                    required
                  >
                    <option value="">-- Pilih Barang --</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>({a.id}) {a.nama_barang} [{a.kondisi}]</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Kondisi Hasil Temuan</label>
                  <select
                    value={auditForm.kondisi}
                    onChange={e => setAuditForm({ ...auditForm, kondisi: e.target.value as any })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500"
                  >
                    <option value="Baik">Baik (Berfungsi Normal)</option>
                    <option value="Rusak Ringan">Rusak Ringan (Bisa Diperbaiki)</option>
                    <option value="Rusak Berat">Rusak Berat (Obsolete/Scrap)</option>
                    <option value="Hilang">Hilang (Tidak Berada di Tempat)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Auditor Resmi</label>
                  <input
                    type="text"
                    value={auditForm.auditor}
                    onChange={e => setAuditForm({ ...auditForm, auditor: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 font-sans">Tanggal Audit fisik</label>
                  <input
                    type="date"
                    value={auditForm.tanggal}
                    onChange={e => setAuditForm({ ...auditForm, tanggal: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="col-span-1 md:col-span-4">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Catatan Temuan Lapangan & Tindakan Selanjutnya</label>
                <textarea
                  placeholder="Ketik rincian kerusakan, penggantian suku cadang, atau rekomendasi penghapusan disini..."
                  value={auditForm.catatan}
                  onChange={e => setAuditForm({ ...auditForm, catatan: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none h-20"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingAudit(false)}
                  className="rounded-md border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-teal-500"
                >
                  Simpan Catatan Audit
                </button>
              </div>
            </form>
          )}

          {/* Audit Logs Ledger */}
          <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm bg-white">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3">ID Log</th>
                  <th className="px-6 py-3">Nama Aset / Barang</th>
                  <th className="px-6 py-3">kondisi Terverifikasi</th>
                  <th className="px-6 py-3">Auditor Pelaksana</th>
                  <th className="px-6 py-3">Temuan Lapangan / Catatan</th>
                  <th className="px-6 py-3">Tanggal Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {auditList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">{item.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div>{item.nama_barang}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Asset ID: {item.barang_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                        item.kondisi === "Baik" ? "bg-teal-50 text-teal-700" :
                        item.kondisi === "Rusak Ringan" ? "bg-yellow-50 text-yellow-800" :
                        "bg-red-50 text-red-700"
                      }`}>
                        {item.kondisi}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{item.auditor}</td>
                    <td className="px-6 py-4 text-slate-600 italic">"{item.catatan}"</td>
                    <td className="px-6 py-4">{item.tanggal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
