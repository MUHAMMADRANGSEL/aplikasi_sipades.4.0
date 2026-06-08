import React, { useState, useEffect } from "react";
import { 
  Database, 
  Code, 
  Copy, 
  Check, 
  CloudLightning, 
  ExternalLink,
  Layers,
  Zap,
  CheckCircle,
  Settings,
  Link2,
  Lock,
  Wifi,
  RefreshCw,
  AlertCircle,
  FileText
} from "lucide-react";

interface DatabaseCenterProps {
  dbQueue: Array<{
    id: string;
    timestamp: string;
    sheet: string;
    type: "INSERT" | "UPDATE" | "DELETE";
    payload: any;
  }>;
  onClearQueue: () => void;
}

export default function DatabaseCenter({ dbQueue, onClearQueue }: DatabaseCenterProps) {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"supabase" | "sql-schema">("supabase");

  // Supabase Configuration State
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [liveSyncEnabled, setLiveSyncEnabled] = useState(false);
  
  // Loading and feedback states
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);
  
  // Test alerts & results
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [exportResults, setExportResults] = useState<Array<{ table: string; success: boolean; count: number; message?: string; error?: string }> | null>(null);

  // Load configured Supabase settings on mount
  useEffect(() => {
    const fetchConfig = async () => {
      setLoadingConfig(true);
      try {
        const response = await fetch("/api/supabase/config");
        if (response.ok) {
          const data = await response.json();
          setSupabaseUrl(data.supabaseUrl || "");
          setSupabaseKey(data.supabaseKey || "");
          setLiveSyncEnabled(!!data.liveSyncEnabled);
        }
      } catch (err) {
        console.error("Gagal memuat konfigurasi Supabase:", err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  // Save Config handler
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setSaveSuccess(false);
    try {
      const response = await fetch("/api/supabase/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supabaseUrl, supabaseKey, liveSyncEnabled })
      });
      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Gagal menyimpan konfigurasi. Silakan periksa koneksi server Anda.");
      }
    } catch (err) {
      console.error("Error saving setup configuration:", err);
      alert("Terjadi kesalahan teknis saat menyimpan pengaturan.");
    } finally {
      setSavingConfig(false);
    }
  };

  // Test Connection handler
  const handleTestConnection = async () => {
    if (!supabaseUrl || !supabaseKey) {
      setTestResult({ success: false, message: "URL Supabase dan API Key belum dimasukkan." });
      return;
    }
    setTestingConnection(true);
    setTestResult(null);
    try {
      const response = await fetch("/api/supabase/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supabaseUrl, supabaseKey })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setTestResult({ success: true, message: data.message || "Terkoneksi dengan API Supabase!" });
      } else {
        setTestResult({ 
          success: false, 
          message: data.message || data.error || "Gagal terkoneksi. Periksa kembali URL dan API Key Anda." 
        });
      }
    } catch (err: any) {
      console.error("Tes koneksi gagal:", err);
      setTestResult({ success: false, message: "Kesalahan jaringan: Gagal menghubungi REST API Supabase. " + (err.message || "") });
    } finally {
      setTestingConnection(false);
    }
  };

  // Export DB Backup handler
  const handleExportAll = async () => {
    if (!supabaseUrl || !supabaseKey) {
      alert("Konfigurasikan dan simpan kredensial Supabase sebelum mendeploy ekspor!");
      return;
    }
    setExportingAll(true);
    setExportResults(null);
    try {
      const response = await fetch("/api/supabase/sync-all", {
        method: "POST"
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setExportResults(data.results);
      } else {
        alert("Gagal menjalankan prosedur ekspor database: " + (data.error || "Response internal crash"));
      }
    } catch (err: any) {
      console.error("Full database export failed:", err);
      alert("Kesalahan jaringan: Gagal mengekspor database secara penuh. " + (err.message || ""));
    } finally {
      setExportingAll(false);
    }
  };

  const supabaseSqlCode = `-- ==========================================
-- SIPADES SMART - Supabase PostgreSQL Schema
-- ==========================================
-- Jalankan kode ini di SQL Editor Supabase Anda untuk membuat semua tabel.

-- 1. Tabel Profil Desa
CREATE TABLE IF NOT EXISTS profil_desa (
  kode_desa TEXT PRIMARY KEY,
  nama_desa TEXT NOT NULL,
  kecamatan TEXT NOT NULL,
  kabupaten TEXT NOT NULL,
  provinsi TEXT NOT NULL,
  logo TEXT
);

-- 2. Tabel Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aktif'
);

-- 3. Tabel Perangkat Desa
CREATE TABLE IF NOT EXISTS perangkat_desa (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  nip TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aktif'
);

-- 4. Tabel Ruangan
CREATE TABLE IF NOT EXISTS ruangan (
  id TEXT PRIMARY KEY,
  nama_ruangan TEXT NOT NULL,
  lokasi TEXT NOT NULL,
  penanggung_jawab TEXT NOT NULL
);

-- 5. Tabel Assets (KIB Utama)
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  kategori TEXT NOT NULL,
  kode_barang TEXT NOT NULL,
  nama_barang TEXT NOT NULL,
  luas TEXT,
  sertifikat TEXT,
  merk TEXT,
  tahun TEXT NOT NULL,
  nilai DOUBLE PRECISION NOT NULL DEFAULT 0,
  lokasi TEXT NOT NULL,
  kondisi TEXT NOT NULL DEFAULT 'Baik',
  panjang TEXT,
  progress TEXT,
  keterangan TEXT,
  foto TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION
);

-- 6. Tabel Pengadaan (Log APBDes)
CREATE TABLE IF NOT EXISTS pengadaan (
  id TEXT PRIMARY KEY,
  tanggal TEXT NOT NULL,
  kegiatan TEXT NOT NULL,
  sumber_dana TEXT NOT NULL,
  kode_rekening TEXT NOT NULL,
  barang TEXT NOT NULL,
  volume INTEGER NOT NULL DEFAULT 1,
  harga DOUBLE PRECISION NOT NULL DEFAULT 0,
  total DOUBLE PRECISION NOT NULL DEFAULT 0,
  lokasi TEXT NOT NULL,
  foto TEXT,
  status TEXT NOT NULL DEFAULT 'Draf'
);

-- 7. Tabel Penggunaan
CREATE TABLE IF NOT EXISTS penggunaan (
  id TEXT PRIMARY KEY,
  sk TEXT NOT NULL,
  barang_id TEXT NOT NULL,
  nama_barang TEXT NOT NULL,
  pengguna TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Berjalan'
);

-- 8. Tabel Pemanfaatan
CREATE TABLE IF NOT EXISTS pemanfaatan (
  id TEXT PRIMARY KEY,
  barang_id TEXT NOT NULL,
  nama_barang TEXT NOT NULL,
  jenis TEXT NOT NULL,
  mitra TEXT NOT NULL,
  periode_mulai TEXT NOT NULL,
  periode_selesai TEXT NOT NULL,
  nilai_kontrak DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Aktif'
);

-- 9. Tabel Kapitalisasi
CREATE TABLE IF NOT EXISTS kapitalisasi (
  id TEXT PRIMARY KEY,
  barang_id TEXT NOT NULL,
  nama_barang TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  keterangan TEXT NOT NULL,
  nilai_lama DOUBLE PRECISION NOT NULL DEFAULT 0,
  nilai_tambah DOUBLE PRECISION NOT NULL DEFAULT 0,
  nilai_baru DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Draf'
);

-- 10. Tabel Penghapusan
CREATE TABLE IF NOT EXISTS penghapusan (
  id TEXT PRIMARY KEY,
  barang_id TEXT NOT NULL,
  nama_barang TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  alasan TEXT NOT NULL,
  berita_acara TEXT NOT NULL,
  nilai_buku DOUBLE PRECISION NOT NULL DEFAULT 0
);

-- 11. Tabel Persediaan
CREATE TABLE IF NOT EXISTS persediaan (
  id TEXT PRIMARY KEY,
  tanggal TEXT NOT NULL,
  nama_barang TEXT NOT NULL,
  tipe TEXT NOT NULL,
  jumlah INTEGER NOT NULL DEFAULT 0,
  penerima TEXT,
  stok_sisa INTEGER NOT NULL DEFAULT 0,
  keterangan TEXT
);

-- 12. Tabel Audit / Audit Fisik
CREATE TABLE IF NOT EXISTS audit (
  id TEXT PRIMARY KEY,
  tanggal TEXT NOT NULL,
  barang_id TEXT NOT NULL,
  nama_barang TEXT NOT NULL,
  kondisi TEXT NOT NULL,
  auditor TEXT NOT NULL,
  catatan TEXT,
  foto TEXT
);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(supabaseSqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Tab selection */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab("supabase")}
          className={`px-4 py-3 text-xs font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 ${
            activeSubTab === "supabase" ? "border-emerald-600 text-emerald-600 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
          id="tab-supabase-sync"
        >
          <Database className="h-4 w-4" /> Supabase REST Integration
        </button>
        <button
          onClick={() => setActiveSubTab("sql-schema")}
          className={`px-4 py-3 text-xs font-bold uppercase transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === "sql-schema" ? "border-emerald-600 text-emerald-600 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
          id="tab-supabase-sql"
        >
          <Code className="h-4 w-4" /> SQL Schema & DDL
        </button>
      </div>

      {activeSubTab === "supabase" && (
        <div className="space-y-6">
          {/* Synchronizer Banner dashboard */}
          <div className="bg-emerald-50 rounded-xl border border-emerald-150 p-5 text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block">Sistem Sinkronisasi Awan</span>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase flex items-center gap-1.5">
                <CloudLightning className="h-4.5 w-4.5 text-emerald-600 animate-pulse" /> Integrasi Cloud Database Supabase (PostgreSQL)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Menyinkronkan data transaksional dari database lokal Anda ke Supabase Project Cloud. Solusi andal untuk ketahanan data desa secara berkesinambungan dan aman tanpa mengorbankan privasi.
              </p>
            </div>
            {supabaseUrl ? (
              <a 
                href={supabaseUrl} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 text-xs transition duration-150 shrink-0"
                id="btn-open-supabase-project"
              >
                Dashboard Supabase <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <a 
                href="https://supabase.com" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 text-xs transition duration-150 shrink-0"
                id="btn-open-supabase-homepage"
              >
                Buka Supabase <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Setup Form */}
            <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-left space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-slate-600" />
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Kredensial Koneksi REST API</span>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 p-1 px-2.5 rounded-full font-bold">PostgREST Aktif</span>
              </div>

              {loadingConfig ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <RefreshCw className="h-8 w-8 animate-spin text-slate-400 mb-2" />
                  Memuat konfigurasi jembatan database...
                </div>
              ) : (
                <form onSubmit={handleSaveConfig} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                      <Link2 className="h-3.5 w-3.5 text-slate-400" /> Supabase Project URL:
                    </label>
                    <input 
                      type="url" 
                      placeholder="https://xyzabcdefghi.supabase.co"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-emerald-500 focus:bg-white outline-none"
                      required
                    />
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Didapatkan di dashboard Supabase Anda melalui menu <strong>Project Settings {"->"} API {"->"} Project URL</strong>.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-slate-400" /> Supabase API Key (Anon / Service Role):
                    </label>
                    <input 
                      type="password" 
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-emerald-500 focus:bg-white outline-none"
                      required
                    />
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Kunci otorisasi proyek Supabase Anda. Direkomendasikan menggunakan kunci <code>service_role</code> untuk melewati pembatasan bypass RLS jika Anda tidak mendeploy aturan kebijakan tabel.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div className="space-y-0.5 pr-2">
                      <span className="text-[11px] font-bold text-slate-800 uppercase block">Sinkronisasi Real-Time (Dual-Write)</span>
                      <p className="text-[9.5px] text-slate-500 leading-normal">
                        Mengirimkan perubahan data (Aset Baru, Procurement APBDes, dll) secara otomatis di latar belakang ke tabel Supabase.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input 
                        type="checkbox" 
                        checked={liveSyncEnabled}
                        onChange={(e) => setLiveSyncEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={savingConfig}
                      className="flex-1 rounded-lg bg-slate-900 hover:bg-slate-850 text-white font-bold p-2.5 text-xs inline-flex items-center justify-center gap-1.5 transition duration-150 disabled:opacity-50 cursor-pointer"
                      id="btn-save-supabase-config"
                    >
                      {savingConfig ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                      Simpan Konfigurasi
                    </button>

                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={testingConnection || !supabaseUrl}
                      className="rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-150 text-slate-755 font-bold p-2.5 px-4 text-xs inline-flex items-center justify-center gap-1.5 transition duration-150 disabled:opacity-50 cursor-pointer"
                      id="btn-test-supabase-connection"
                    >
                      {testingConnection ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                      Uji Koneksi Supabase
                    </button>
                  </div>
                </form>
              )}

              {/* Real-time Alerts */}
              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-850 text-xs font-bold animate-fade-in">
                  Konfigurasi Supabase berhasil disimpan! Mode Sinkronisasi Real-Time {(liveSyncEnabled ? "AKTIF" : "NONAKTIF")}.
                </div>
              )}

              {testResult && (
                <div className={`p-3 border rounded-lg text-xs leading-relaxed animate-fade-in ${
                  testResult.success 
                    ? "bg-emerald-50 border-emerald-100 text-emerald-800 font-bold flex items-start gap-2" 
                    : "bg-rose-50 border-rose-100 text-rose-800 font-medium flex items-start gap-2"
                }`}>
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <span>{testResult.message}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bulk Export & Backup Area */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-5 text-left shadow-sm space-y-4">
                <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-widest flex items-center gap-1.5">
                  <Database className="h-4.5 w-4.5 text-emerald-600" /> Ekspor & Backup Massal (Supabase)
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Menyalin dan mengunggah seluruh baris data dari database PostgreSQL lokal SIPADES SMART ke dalam tabel Supabase Anda dengan satu tombol. Menggunakan prosedur integrasi multi-table.
                </p>

                <button
                  type="button"
                  onClick={handleExportAll}
                  disabled={exportingAll || !supabaseUrl || !supabaseKey}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 hover:shadow-md text-white font-extrabold p-3 text-xs inline-flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50 cursor-pointer"
                  id="btn-export-all-to-supabase"
                >
                  {exportingAll ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {exportingAll ? "Mengekspor data ke Supabase..." : "Ekspor Seluruh Database"}
                </button>
                
                <p className="text-[9.5px] text-slate-400 italic text-center leading-normal">
                  *Pastikan Anda telah membuat skema tabel melalui subtab <strong>SQL Schema & DDL</strong> sebelum meluncurkan ekspor massal pertama Anda.
                </p>
              </div>

              {/* Dynamic Export Progress / Report */}
              {exportResults && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm space-y-3 max-h-[300px] overflow-y-auto">
                  <div className="border-b border-slate-100 pb-2 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 uppercase tracking-wider">Hasil Prosedur Backup</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">
                      Sukses
                    </span>
                  </div>
                  <div className="space-y-2">
                    {exportResults.map((res, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] p-2 bg-slate-50 rounded border border-slate-100">
                        <div>
                          <span className="font-extrabold font-mono text-[11px] text-slate-800 block">
                            {res.table}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono mt-0.5">{res.count} baris data</span>
                        </div>
                        <div className="text-right">
                          {res.success ? (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[9.5px] font-bold text-emerald-700">
                              <CheckCircle className="h-3 w-3" /> Berhasil
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[9.5px] font-bold text-rose-700" title={res.error || "Gagal"}>
                              <AlertCircle className="h-3 w-3" /> Gagal
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Database sync queue tracking info */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-850 uppercase tracking-wider">Antrean Sinkronisasi ({dbQueue.length})</span>
                  {dbQueue.length > 0 && (
                    <button
                      onClick={onClearQueue}
                      className="text-[9px] bg-slate-100 hover:bg-slate-200 rounded px-2 py-0.5 font-bold text-slate-600 transition cursor-pointer"
                    >
                      Bersihkan
                    </button>
                  )}
                </div>
                {dbQueue.length > 0 ? (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {dbQueue.slice(0, 5).map(log => (
                      <div key={log.id} className="p-2 bg-slate-00 rounded border border-slate-100 flex items-center justify-between text-[10px]">
                        <div>
                          <span className={`inline-block px-1 rounded text-[8px] font-bold text-white mr-1 ${
                            log.type === "INSERT" ? "bg-emerald-600" :
                            log.type === "UPDATE" ? "bg-blue-600" : "bg-rose-600"
                          }`}>{log.type}</span>
                          <span className="font-bold text-slate-700 font-mono">{log.sheet}</span>
                        </div>
                        <span className="text-[8px] text-slate-400 font-mono">{log.timestamp}</span>
                      </div>
                    ))}
                    {dbQueue.length > 5 && (
                      <p className="text-[10px] text-center text-slate-400 italic">+{dbQueue.length - 5} aksi sinkronisasi lainnya...</p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic text-center py-2">Semua transaksi database aman tersinkronisasi.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "sql-schema" && (
        <div className="bg-slate-900 rounded-xl p-6 text-left space-y-4 shadow-sm border border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="h-5 w-5" /> Skrip SQL Setup Proyek Supabase
              </h3>
              <p className="text-xs text-slate-400 mt-1">Gunakan dialek PostgreSQL murni ini untuk mendefinisikan struktur database di panel query Supabase Anda.</p>
            </div>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 text-slate-950 font-black px-4 py-2.5 text-xs shadow-sm hover:bg-emerald-400 cursor-pointer transition shrink-0"
              id="btn-copy-supabase-sql"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Tersalin!" : "Salin Skrip SQL"}
            </button>
          </div>

          <div className="rounded-lg bg-slate-950 p-4 border border-slate-800 overflow-x-auto max-h-[350px] overflow-y-auto">
            <pre className="font-mono text-xs text-emerald-400 whitespace-pre leading-relaxed select-all">
              {supabaseSqlCode}
            </pre>
          </div>

          <div className="rounded bg-slate-850 p-4 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
            <h4 className="font-extrabold text-emerald-400 flex items-center gap-1.5"><Zap className="h-4 w-4" /> LANGKAH SINKRONISASI KONTROL SUPABASE:</h4>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-300">
              <li>Buat proyek database baru secara gratis di portal <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">Supabase.com</a>.</li>
              <li>Pilih menu <strong>SQL Editor</strong> dari bilah navigasi kiri, lalu tekan tombol <strong>"New query"</strong>.</li>
              <li>Tempelkan seluruh skrip pembuatan tabel (SQL DDL) di atas, lalu klik tombol <strong className="bg-[#10b981] text-slate-950 px-1 py-0.5 rounded font-black text-[10px]">Run</strong> di kanan bawah.</li>
              <li>Pastikan query berhasil dijalankan tanpa pesan error (semua tabel akan muncul di menu <strong>Table Editor</strong> Anda).</li>
              <li>Arahkan ke <strong>Project Settings {"->"} API</strong>, temukan bagian <strong>Project URL</strong> dan <strong>service_role API Key</strong> (atau anon key) proyek Anda.</li>
              <li>Masukkan nilai parameters tersebut di panel konfigurasi sebelah kiri, simpan konfigurasi, dan tekan <strong>Uji Koneksi Supabase</strong>.</li>
              <li>Klik <strong>Ekspor Seluruh Database</strong> untuk memulihkan seluruh riwayat rekap KIB dan audit fisik lokal ke cloud!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
