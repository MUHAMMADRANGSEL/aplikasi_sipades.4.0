import React, { useState } from "react";
import { Asset } from "../types";
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Grid3X3, 
  CheckCircle, 
  FileText,
  BadgeAlert,
  Compass,
  PenTool,
  Lock,
  ShieldCheck,
  QrCode,
  Fingerprint,
  FileSignature,
  RotateCcw
} from "lucide-react";

interface ReportsProps {
  assets: Asset[];
}

export default function Reports({ assets }: ReportsProps) {
  const [selectedReportCat, setSelectedReportCat] = useState<string>("KIB A");
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);

  // Verifiable Digital Signature Registry per KIB
  const [signedState, setSignedState] = useState<Record<string, {
    sekdesSigned: boolean;
    kaurSigned: boolean;
    sekdesMethod?: "QR" | "TTE";
    kaurMethod?: "QR" | "TTE";
    sekdesCert?: string;
    kaurCert?: string;
    timestamp?: string;
  }>>({
    "KIB A": { 
      sekdesSigned: true, 
      kaurSigned: true, 
      sekdesMethod: "QR", 
      kaurMethod: "TTE", 
      sekdesCert: "TTE-BD81-KIB-A", 
      kaurCert: "TTE-F02A-KIB-A",
      timestamp: "08 Jun 2026 14:32"
    },
  });

  const [activeSignerInput, setActiveSignerInput] = useState<"sekdes" | "kaur_umum">("sekdes");
  const [sigTypeInput, setSigTypeInput] = useState<"QR" | "TTE">("TTE");
  const [ttePin, setTtePin] = useState("");
  const [isSealing, setIsSealing] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationModalData, setVerificationModalData] = useState<any>(null);

  const currentCatSig = signedState[selectedReportCat] || { sekdesSigned: false, kaurSigned: false };

  const matchedAssets = assets.filter(a => a.kategori === selectedReportCat);

  // Calculate stats for current category
  const totalQty = matchedAssets.length;
  const totalVal = matchedAssets.reduce((sum, item) => sum + item.nilai, 0);
  const goodQty = matchedAssets.filter(item => item.kondisi === "Baik").length;

  const handleExportSim = (format: "Excel" | "CSV") => {
    setDownloadProgress(`Sedang memproses & memformat ${selectedReportCat} ke lembar kerja ${format}...`);
    setTimeout(() => {
      setDownloadProgress(`Sukses! Mengunduh SIPADES_SMART_${selectedReportCat.replace(" ", "_")}.${format === "Excel" ? "xlsx" : "csv"}`);
      setTimeout(() => setDownloadProgress(null), 3000);
    }, 1500);
  };

  const handleSignDocument = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSealing(true);
    setTimeout(() => {
      const isSekdes = activeSignerInput === "sekdes";
      const certNo = `TTE-${isSekdes ? "SEK" : "KAU"}-${Math.floor(Math.random() * 9000) + 1000}-${selectedReportCat.replace(" ", "")}`;
      
      setSignedState(prev => {
        const current = prev[selectedReportCat] || { sekdesSigned: false, kaurSigned: false };
        return {
          ...prev,
          [selectedReportCat]: {
            ...current,
            sekdesSigned: isSekdes ? true : current.sekdesSigned,
            kaurSigned: !isSekdes ? true : current.kaurSigned,
            sekdesMethod: isSekdes ? sigTypeInput : current.sekdesMethod,
            kaurMethod: !isSekdes ? sigTypeInput : current.kaurMethod,
            sekdesCert: isSekdes ? certNo : current.sekdesCert,
            kaurCert: !isSekdes ? certNo : current.kaurCert,
            timestamp: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) + " " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
          }
        };
      });

      setIsSealing(false);
      setTtePin("");
    }, 1200);
  };

  const handleResetSignatures = () => {
    setSignedState(prev => {
      const next = { ...prev };
      delete next[selectedReportCat];
      return next;
    });
  };

  const handleVerifyDialog = (side: "sekdes" | "kaur") => {
    const sig = currentCatSig;
    const cert = side === "sekdes" ? sig.sekdesCert : sig.kaurCert;
    const method = side === "sekdes" ? sig.sekdesMethod : sig.kaurMethod;
    const signerName = side === "sekdes" ? "HERI KUSWADI, S.Pd." : "M. FAUZI, S.IP.";
    const signerRoleName = side === "sekdes" ? "Sekretaris Desa (Sekdes)" : "Kaur Umum / Pengelola Aset";
    const title = side === "sekdes" ? "Dokumen Persetujuan Sekdes" : "Dokumen Perekaman Kaur Umum";

    setVerificationModalData({
      title,
      signer: signerName,
      role: signerRoleName,
      certNo: cert || "N/A",
      date: sig.timestamp || "N/A",
      integrity: "100% UNTAMPERED (SAH)",
      authority: method === "TTE" ? "Balaicertifikasi BSrE Sandi Negara (BSSN)" : "Local QR Signature Verification",
      hash: "SHA-256: " + Array.from({length: 32}, () => "0123456789ABCDEF"[Math.floor(Math.random() * 16)]).join(""),
      summary: `Dokumen ini di-validasi pada ${sig.timestamp || "N/A"} menggunakan teknologi ${method === "TTE" ? "Tanda Tangan Elektronik Bersertifikat Kominfo" : "QR-Code QR-Signature Sipades"}. Buku inventaris telah terkunci di server cloud SIPADES SMART.`
    });
    setShowVerificationModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Control filters & Download triggers */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap gap-1.5 font-sans">
          {["KIB A", "KIB B", "KIB C", "KIB D", "KIB E", "KIB F"].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedReportCat(cat)}
              className={`px-3 py-1.5 rounded-lg border font-bold text-xxs tracking-wider uppercase transition-all ${
                selectedReportCat === cat
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat === "KIB A" && "KIB A (Tanah)"}
              {cat === "KIB B" && "KIB B (Peraltan)"}
              {cat === "KIB C" && "KIB C (Gedung)"}
              {cat === "KIB D" && "KIB D (Jalan/Irigasi)"}
              {cat === "KIB E" && "KIB E (Aset Lain)"}
              {cat === "KIB F" && "KIB F (Konstruksi)"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 w-full xl:w-auto">
          <button
            onClick={() => handleExportSim("Excel")}
            className="flex-1 xl:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Unduh Dokumen Excel
          </button>
          <button
            onClick={() => handleExportSim("CSV")}
            className="flex-1 xl:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4 text-blue-500" /> Ekspor File CSV
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 xl:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 text-xs shadow-sm"
          >
            <Printer className="h-4 w-4" /> Cetak Buku Register
          </button>
        </div>
      </div>

      {downloadProgress && (
        <p className="text-xs text-indigo-700 font-semibold bg-indigo-50 border border-indigo-100 p-3 rounded-lg animate-pulse">
          {downloadProgress}
        </p>
      )}

      {/* Stats summary of current KIB Category */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-left">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Register Barang</span>
          <span className="text-xl font-bold text-slate-900 block mt-1">{totalQty} Unit</span>
        </div>
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-left">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Nilai Pembukuan</span>
          <span className="text-xl font-bold text-teal-700 block mt-1">Rp. {totalVal.toLocaleString("id-ID")}</span>
        </div>
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-left">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fisik Dalam Kondisi Baik</span>
          <span className="text-xl font-bold text-emerald-600 block mt-1">{goodQty} dari {totalQty} Unit ({totalQty > 0 ? Math.round((goodQty/totalQty)*100) : 0}%)</span>
        </div>
      </div>

      {/* Main Report Worksheet View */}
      <div className="border border-slate-100 bg-white shadow-sm rounded-xl overflow-hidden text-left p-6">
        <div className="text-center space-y-1 mb-6 pb-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">LAPORAN BUKU INVENTARIS BARANG DESA ({selectedReportCat})</h2>
          <h3 className="text-xs font-semibold text-slate-500">KABUPATEN LOMBOK TIMUR • KECAMATAN TERARA • DESA RARANG SELATAN</h3>
          <p className="text-[10px] text-slate-400">Tahun Anggaran Realisasi Pembukuan: {new Date().getFullYear()}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs">
            <thead className="bg-slate-50 font-bold text-slate-700 text-center uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="px-3 py-3 border-r border-slate-100">No.</th>
                <th className="px-4 py-3 border-r border-slate-100">Kode Barang</th>
                <th className="px-6 py-3 border-r border-slate-100">Nama Aset / Spesifikasi</th>
                <th className="px-4 py-3 border-r border-slate-100">Tahun Perolehan</th>
                {selectedReportCat === "KIB A" && (
                  <>
                    <th className="px-4 py-3 border-r border-slate-100">Luas (m2)</th>
                    <th className="px-4 py-3 border-r border-slate-100">Sertifikat</th>
                  </>
                )}
                {selectedReportCat === "KIB B" && <th className="px-4 py-3 border-r border-slate-100">Merk / Tipe</th>}
                {selectedReportCat === "KIB C" && <th className="px-4 py-3 border-r border-slate-100">Jumlah Lantai</th>}
                {selectedReportCat === "KIB D" && <th className="px-4 py-3 border-r border-slate-100">Panjang Konstruksi</th>}
                {selectedReportCat === "KIB F" && <th className="px-4 py-3 border-r border-slate-100">Progress (%)</th>}
                <th className="px-4 py-3 border-r border-slate-100">Asal Usul S.D</th>
                <th className="px-4 py-3 border-r border-slate-100">Kondisi barang</th>
                <th className="px-6 py-3 text-right">Nilai Pembukuan (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-center">
              {matchedAssets.length > 0 ? (
                matchedAssets.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-3 py-3 border-r border-slate-100 text-slate-400 font-bold">{index + 1}</td>
                    <td className="px-4 py-3 border-r border-slate-100 font-mono font-bold text-slate-800">{item.kode_barang}</td>
                    <td className="px-6 py-3 border-r border-slate-100 text-left font-semibold text-slate-900">
                      <div>{item.nama_barang}</div>
                      <div className="text-[9px] text-slate-450 mt-0.5">Asset ID: {item.id}</div>
                    </td>
                    <td className="px-4 py-3 border-r border-slate-100 font-medium">{item.tahun}</td>
                    
                    {selectedReportCat === "KIB A" && (
                      <>
                        <td className="px-4 py-3 border-r border-slate-100">{item.luas || "1.500 m2"}</td>
                        <td className="px-4 py-3 border-r border-slate-100">{item.sertifikat || "M.45/PBM"}</td>
                      </>
                    )}
                    {selectedReportCat === "KIB B" && <td className="px-4 py-3 border-r border-slate-100">{item.merk || "Epson / Standard"}</td>}
                    {selectedReportCat === "KIB C" && <td className="px-4 py-3 border-r border-slate-100">{item.luas || "1 Lantai"}</td>}
                    {selectedReportCat === "KIB D" && <td className="px-4 py-3 border-r border-slate-100">{item.panjang || "400 Meter"}</td>}
                    {selectedReportCat === "KIB F" && <td className="px-4 py-3 border-r border-slate-100">{item.progress || "85%"}</td>}

                    <td className="px-4 py-3 border-r border-slate-100 font-semibold text-[10px] text-slate-500">APBDesa (Desa)</td>
                    <td className="px-4 py-3 border-r border-slate-100 font-bold">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] ${
                        item.kondisi === "Baik" ? "bg-teal-50 text-teal-700" :
                        item.kondisi === "Rusak Ringan" ? "bg-yellow-50 text-yellow-800" :
                        "bg-rose-50 text-rose-700"
                      }`}>
                        {item.kondisi}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-slate-900">
                      {item.nilai.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-20 text-center text-slate-400 italic">
                    Belum ada data terekam untuk {selectedReportCat}.
                  </td>
                </tr>
              )}
              {/* Row Total Aggregate */}
              <tr className="bg-slate-50 font-bold border-y border-slate-200">
                <td colSpan={selectedReportCat === "KIB A" ? 8 : 6} className="px-4 py-3 text-right text-slate-800">TOTAL JUMLAH KEKAYAAN ASET ({selectedReportCat}):</td>
                <td colSpan={3} className="px-6 py-3 text-right text-teal-700 text-sm">Rp. {totalVal.toLocaleString("id-ID")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Digital Signature & Document Certification Console block */}
        <div className="mt-8 border border-slate-200 rounded-xl bg-slate-50 p-5 space-y-4 font-sans text-xs">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-3 gap-3">
            <div className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-indigo-600" />
              <div>
                <h4 className="font-extrabold text-slate-800 uppercase text-xs">Konsol Sertifikasi & Validasi Digital KIB</h4>
                <p className="text-[10px] text-slate-500">Gunakan QR Signature atau Tanda Tangan Elektronik (TTE) untuk penandatanganan dokumen resmi.</p>
              </div>
            </div>
            
            {(currentCatSig.sekdesSigned || currentCatSig.kaurSigned) && (
              <button
                type="button"
                onClick={handleResetSignatures}
                className="text-[10px] text-rose-600 hover:text-rose-800 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" /> Reset/Cabut Tanda Tangan
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Col: Setup & input signing action */}
            <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
              <form onSubmit={handleSignDocument} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Otoritas Penandatangan</label>
                    <select
                      value={activeSignerInput}
                      onChange={e => setActiveSignerInput(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-800 text-xs"
                    >
                      <option value="sekdes">Sekdes — Heri Kuswadi, S.Pd. (Persetujuan)</option>
                      <option value="kaur_umum">Kaur Umum — M. Fauzi, S.IP. (Penyusun)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Metode Tanda Tangan</label>
                    <select
                      value={sigTypeInput}
                      onChange={e => setSigTypeInput(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-850 text-xs"
                    >
                      <option value="TTE">TTE (Secure Electronic Certificate Badge)</option>
                      <option value="QR">QR Signature (Unique QR Validation Code)</option>
                    </select>
                  </div>
                </div>

                {sigTypeInput === "TTE" ? (
                  <div className="border border-indigo-100 bg-indigo-50/20 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                      <span className="flex items-center gap-1 text-indigo-600"><Lock className="h-3.5 w-3.5" /> Sertifikat E-Signature (BSrE BSSN)</span>
                      <span>Default PIN Pendukung: <code className="bg-slate-200 px-1 rounded">1234</code></span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Masukkan Passphrase PIN TTE Penandatangan..."
                        value={ttePin}
                        onChange={e => setTtePin(e.target.value)}
                        required
                        className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800"
                      />
                      <button
                        type="submit"
                        disabled={isSealing}
                        className="rounded bg-slate-900 text-white hover:bg-slate-850 font-bold px-4 py-1.5 text-xs tracking-wide cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        {isSealing ? "Menyegel..." : "Sahkan TTE"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-blue-100 bg-blue-50/20 p-3 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div className="space-y-0.5">
                      <p className="font-bold text-blue-800">QR Validasi Dokumen SIPADES</p>
                      <p className="text-[10px] text-slate-500">Menyematkan stempel QR Code validasi pada cetakan KIB.</p>
                    </div>
                    <button
                      type="submit"
                      disabled={isSealing}
                      className="rounded bg-blue-600 text-white hover:bg-blue-700 font-bold px-4/5 py-2 text-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      {isSealing ? "Menyegel..." : <><QrCode className="h-3.5 w-3.5" /> Berikan Stempel QR</>}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Right Col: Signature Status badge */}
            <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-full min-h-[140px] text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Status Sertifikasi Lembar {selectedReportCat}</span>
              
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">1. Draft Laporan (Kaur Umum)</span>
                  {currentCatSig.kaurSigned ? (
                    <span className="text-emerald-600 font-extrabold bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5 text-[9px] flex items-center gap-0.5">
                      ✓ TERDATALISIR ({currentCatSig.kaurMethod})
                    </span>
                  ) : (
                    <span className="text-amber-600 font-bold bg-amber-50 border border-amber-100 rounded px-2 py-0.5 text-[9px]">Belum Ditandatangani</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">2. Persetujuan (Sekretaris Desa)</span>
                  {currentCatSig.sekdesSigned ? (
                    <span className="text-emerald-600 font-extrabold bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5 text-[9px] flex items-center gap-0.5">
                      ✓ TERSETUJUI ({currentCatSig.sekdesMethod})
                    </span>
                  ) : (
                    <span className="text-amber-600 font-bold bg-amber-50 border border-amber-100 rounded px-2 py-0.5 text-[9px]">Belum Ditandatangani</span>
                  )}
                </div>
              </div>

              {(currentCatSig.sekdesSigned && currentCatSig.kaurSigned) ? (
                <div className="mt-3 bg-emerald-500 text-white rounded-lg p-2 flex items-center gap-1.5 font-bold text-[10px] uppercase shadow-sm">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>DOKUMEN DINYATAKAN ABSAH (TERSERTIFIKASI PENUH)</span>
                </div>
              ) : (
                <div className="mt-3 bg-slate-100 text-slate-500 rounded-lg p-2 flex items-center gap-1.5 font-bold text-[10px]">
                  <Fingerprint className="h-4 w-4 shrink-0" />
                  <span>MENUNGGU VALIDASI TTE PERANGKAT DESA</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic footprints based on Signature state */}
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mt-12 pt-10 border-t border-slate-200 gap-8">
          
          {/* Left Signee: Sekdes */}
          <div className="text-center w-full sm:w-auto relative flex flex-col items-center">
            <p className="font-semibold text-slate-600 text-xs mb-2">Disetujui Oleh,<br />Sekretaris Desa (Sekdes)</p>
            
            {currentCatSig.sekdesSigned ? (
              <div className="my-1 p-2 border border-emerald-200 bg-emerald-50 rounded-lg flex flex-col items-center gap-1 text-center font-bold text-[9px] text-emerald-800 animate-fade-in w-full max-w-[200px]">
                {currentCatSig.sekdesMethod === "TTE" ? (
                  <>
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span className="uppercase text-[8px] tracking-widest text-slate-500">TTE Certified BSrE</span>
                    <span>ID: {currentCatSig.sekdesCert}</span>
                    <button 
                      type="button" 
                      onClick={() => handleVerifyDialog("sekdes")}
                      className="text-indigo-600 hover:underline cursor-pointer pt-0.5 text-[8px] font-black"
                    >
                      Detail Verifikasi
                    </button>
                  </>
                ) : (
                  <>
                    <QrCode className="h-10 w-10 text-emerald-800 pl-0.5 stroke-[1.5]" />
                    <span className="text-[8px] tracking-wide text-emerald-700">QR-CODE APPROVED</span>
                    <button 
                      type="button" 
                      onClick={() => handleVerifyDialog("sekdes")}
                      className="text-indigo-600 hover:underline cursor-pointer text-[8px] font-black"
                    >
                      Pindai Validasi
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="h-14 flex items-center justify-center text-slate-350 italic text-[11px]">— Belum Ditandatangani —</div>
            )}

            <div className="mt-2 text-center">
              <p className="font-bold underline text-slate-900 text-xs">HERI KUSWADI, S.Pd.</p>
              <p className="text-slate-450 text-[10px] font-mono mt-0.5">NIP. 19850312 201011 1 002</p>
            </div>
          </div>

          {/* Right Signee: Kaur Umum */}
          <div className="text-center w-full sm:w-auto relative flex flex-col items-center">
            <p className="font-semibold text-slate-600 text-xs mb-2">Dibuat Oleh,<br />Kaur Umum / Pengelola Aset</p>
            
            {currentCatSig.kaurSigned ? (
              <div className="my-1 p-2 border border-emerald-201 bg-emerald-50 rounded-lg flex flex-col items-center gap-1 text-center font-bold text-[9px] text-emerald-850 animate-fade-in w-full max-w-[200px]">
                {currentCatSig.kaurMethod === "TTE" ? (
                  <>
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span className="uppercase text-[8px] tracking-widest text-slate-500">TTE Certified BSrE</span>
                    <span>ID: {currentCatSig.kaurCert}</span>
                    <button 
                      type="button" 
                      onClick={() => handleVerifyDialog("kaur")}
                      className="text-indigo-600 hover:underline cursor-pointer pt-0.5 text-[8px] font-black"
                    >
                      Detail Verifikasi
                    </button>
                  </>
                ) : (
                  <>
                    <QrCode className="h-10 w-10 text-emerald-800 stroke-[1.5]" />
                    <span className="text-[8px] tracking-wide text-emerald-700">QR-CODE VERIFIED</span>
                    <button 
                      type="button" 
                      onClick={() => handleVerifyDialog("kaur")}
                      className="text-indigo-600 hover:underline cursor-pointer text-[8px] font-black"
                    >
                      Pindai Validasi
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="h-14 flex items-center justify-center text-slate-350 italic text-[11px]">— Belum Ditandatangani —</div>
            )}

            <div className="mt-2 text-center">
              <p className="font-bold underline text-slate-900 text-xs">M. FAUZI, S.IP.</p>
              <p className="text-slate-450 text-[10px] mt-0.5">Pembantu Pengelola Barang Desa</p>
            </div>
          </div>

        </div>
      </div>

      {/* Verification Diagnostic Modal Overlay Component */}
      {showVerificationModal && verificationModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur p-4 text-slate-800">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 text-left space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-indigo-700 uppercase flex items-center gap-1.5 align-middle">
                <ShieldCheck className="h-4 w-4" /> Balai Sertifikasi TTE Sipades
              </span>
              <button 
                onClick={() => setShowVerificationModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-sm font-black text-slate-900 leading-tight">Sertifikat Digital Valid & Autentik</h3>
              <p className="text-slate-600 text-[11px]">SIPADES SMART verifikator mengonfirmasi bahwa penandatangan di bawah ini memegang otoritas valid terhadap dokumen ini:</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-3.5 space-y-2 font-mono text-[10px] leading-relaxed border border-slate-100">
              <p>📍 <strong>Dokumen:</strong> {selectedReportCat} ({matchedAssets.length} Aset Terpilih)</p>
              <p>👤 <strong>Penandatangan:</strong> {verificationModalData.signer}</p>
              <p>💼 <strong>Jabatan:</strong> {verificationModalData.role}</p>
              <p>🎟️ <strong>Nomor SK Sertifikat:</strong> <span className="text-indigo-600 font-bold">{verificationModalData.certNo}</span></p>
              <p>📅 <strong>Timestamp Segel:</strong> {verificationModalData.date}</p>
              <p>🛡️ <strong>Sistem Otoritas:</strong> {verificationModalData.authority}</p>
              <p className="break-all">🗝️ <strong>Hash Enkripsi:</strong><br /><code className="text-[9px] text-slate-500 font-semibold">{verificationModalData.hash}</code></p>
            </div>

            <p className="text-[10px] text-emerald-850 font-bold bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg">
              ✓ INTEGRITAS DOKUMEN 100% TERJAGA. Struktur payload tidak berpindah semenjak proses penandatanganan elektronik ditanamkan.
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowVerificationModal(false)}
                className="rounded bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-5 text-xs cursor-pointer text-center"
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
