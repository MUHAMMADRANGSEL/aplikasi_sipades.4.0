import React, { useState } from "react";
import { 
  initialProfilDesa, 
  initialUsers, 
  initialPerangkatDesa, 
  initialRuangan, 
  initialAssets, 
  initialPengadaan, 
  initialPenggunaan, 
  initialPemanfaatan, 
  initialKapitalisasi, 
  initialPenghapusan, 
  initialPersediaan, 
  initialAudit, 
  defaultWhatsAppConfig,
  User,
  ProfilDesa,
  PerangkatDesa,
  Ruangan,
  Asset,
  Pengadaan,
  Penggunaan,
  Pemanfaatan,
  Kapitalisasi,
  Penghapusan,
  Persediaan,
  Audit
} from "./types";

// Import modules
import Dashboard from "./components/Dashboard";
import MasterData from "./components/MasterData";
import Procurement from "./components/Procurement";
import Inventory from "./components/Inventory";
import UsagePemanfaatan from "./components/UsagePemanfaatan";
import CapitalDisposal from "./components/CapitalDisposal";
import Supplies from "./components/Supplies";
import ScannerAudit from "./components/ScannerAudit";
import Reports from "./components/Reports";
import PremiumFeatures from "./components/PremiumFeatures";
import KodeBarang from "./components/KodeBarang";
import GisMap from "./components/GisMap";

import { 
  Building2, 
  Users, 
  LayoutDashboard, 
  Database, 
  FileCheck, 
  Sparkles, 
  PlusSquare, 
  Calendar, 
  Compass, 
  ArrowRightLeft, 
  AlertTriangle,
  FolderSync,
  LogOut,
  Sliders,
  Maximize,
  TrendingDown,
  Warehouse,
  Printer,
  ChevronDown,
  Settings,
  BookOpen,
  MapPin,
  Lock,
  UserCheck,
  LogIn
} from "lucide-react";

export default function App() {
  // Core states loaded with seed data matched to pemdes.rarangselatan@gmail.com
  const [profileDesa, setProfileDesaLocal] = useState<ProfilDesa>(initialProfilDesa);
  const [users, setUsersLocal] = useState<User[]>(initialUsers);
  const [perangkatDesa, setPerangkatDesaLocal] = useState<PerangkatDesa[]>(initialPerangkatDesa);
  const [ruanganList, setRuanganListLocal] = useState<Ruangan[]>(initialRuangan);
  const [assets, setAssetsLocal] = useState<Asset[]>(initialAssets);
  const [pengadaanList, setPengadaanListLocal] = useState<Pengadaan[]>(initialPengadaan);
  const [penggunaanList, setPenggunaanListLocal] = useState<Penggunaan[]>(initialPenggunaan);
  const [pemanfaatanList, setPemanfaatanListLocal] = useState<Pemanfaatan[]>(initialPemanfaatan);
  const [kapitalisasiList, setKapitalisasiListLocal] = useState<Kapitalisasi[]>(initialKapitalisasi);
  const [penghapusanList, setPenghapusanListLocal] = useState<Penghapusan[]>(initialPenghapusan);
  const [persediaanList, setPersediaanListLocal] = useState<Persediaan[]>(initialPersediaan);
  const [auditList, setAuditListLocal] = useState<Audit[]>(initialAudit);

  // Synchronize arrays of data automatically to the Database REST API endpoints
  function createSyncArraySetter<T extends { id: string }>(
    setLocal: React.Dispatch<React.SetStateAction<T[]>>,
    apiUrl: string,
    enableDelete: boolean = false
  ) {
    return (updater: React.SetStateAction<T[]>) => {
      setLocal(prev => {
        const next = typeof updater === "function" ? (updater as any)(prev) : updater;
        const prevIds = new Set(prev.map(p => p.id));
        const nextIds = new Set(next.map(n => n.id));

        // Sync Inserts and Updates in the background
        next.forEach(async (item) => {
          const prevItem = prev.find(p => p.id === item.id);
          if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
            try {
              await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item)
              });
            } catch (e) {
              console.error(`Failed to sync item to ${apiUrl}:`, e);
            }
          }
        });

        // Sync Deletions if enabled
        if (enableDelete) {
          prev.forEach(async (item) => {
            if (!nextIds.has(item.id)) {
              try {
                await fetch(`${apiUrl}/${item.id}`, {
                  method: "DELETE"
                });
              } catch (e) {
                console.error(`Failed to delete item from ${apiUrl}:`, e);
              }
            }
          });
        }

        return next;
      });
    };
  }

  // Intercepting setters to sync with backend Cloud SQL DB Center
  const setProfileDesa = (updater: React.SetStateAction<ProfilDesa>) => {
    setProfileDesaLocal(prev => {
      const next = typeof updater === "function" ? (updater as any)(prev) : updater;
      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next)
        }).catch(e => console.error("Failed to sync profile to SQL:", e));
      }
      return next;
    });
  };

  const setUsers = createSyncArraySetter<User>(setUsersLocal, "/api/users");
  const setPerangkatDesa = createSyncArraySetter<PerangkatDesa>(setPerangkatDesaLocal, "/api/perangkat");
  const setRuanganList = createSyncArraySetter<Ruangan>(setRuanganListLocal, "/api/ruangan");
  const setAssets = createSyncArraySetter<Asset>(setAssetsLocal, "/api/assets", true);
  const setPengadaanList = createSyncArraySetter<Pengadaan>(setPengadaanListLocal, "/api/pengadaan");
  const setPenggunaanList = createSyncArraySetter<Penggunaan>(setPenggunaanListLocal, "/api/penggunaan");
  const setPemanfaatanList = createSyncArraySetter<Pemanfaatan>(setPemanfaatanListLocal, "/api/pemanfaatan");
  const setKapitalisasiList = createSyncArraySetter<Kapitalisasi>(setKapitalisasiListLocal, "/api/kapitalisasi");
  const setPenghapusanList = createSyncArraySetter<Penghapusan>(setPenghapusanListLocal, "/api/penghapusan");
  const setPersediaanList = createSyncArraySetter<Persediaan>(setPersediaanListLocal, "/api/persediaan");
  const setAuditList = createSyncArraySetter<Audit>(setAuditListLocal, "/api/audit");

  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  // Fetch all tables from SQL Database on component mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchTable = async (url: string, setter: (val: any) => void) => {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            setter(data);
          }
        };
        await Promise.all([
          fetchTable("/api/profile", setProfileDesaLocal),
          fetchTable("/api/users", setUsersLocal),
          fetchTable("/api/perangkat", setPerangkatDesaLocal),
          fetchTable("/api/ruangan", setRuanganListLocal),
          fetchTable("/api/assets", setAssetsLocal),
          fetchTable("/api/pengadaan", setPengadaanListLocal),
          fetchTable("/api/penggunaan", setPenggunaanListLocal),
          fetchTable("/api/pemanfaatan", setPemanfaatanListLocal),
          fetchTable("/api/kapitalisasi", setKapitalisasiListLocal),
          fetchTable("/api/penghapusan", setPenghapusanListLocal),
          fetchTable("/api/persediaan", setPersediaanListLocal),
          fetchTable("/api/audit", setAuditListLocal),
        ]);
      } catch (err) {
        console.error("Error loading SQL data into React state:", err);
      } finally {
        setTimeout(() => setInitialLoading(false), 1200);
      }
    };
    fetchData();
  }, []);

  // Active Role and Session state (starts with admin_sipades / Kaur Umum)
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]);
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string>("");
  const [inputUsername, setInputUsername] = useState<string>("");
  const [inputPassword, setInputPassword] = useState<string>("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    let targetUser = inputUsername.trim();
    if (targetUser.toLowerCase() === "pemdes.rarangselatan@gmail.com" || targetUser.toLowerCase() === "pemdes.rarangselatan") {
      targetUser = "admin_sipades";
    }

    const found = users.find(u => u.username === targetUser);
    if (!found) {
      setLoginError("Akun pengguna tidak ditemukan di data desa. Silakan periksa kembali ketikan Anda atau gunakan salah satu Demo Akun di bawah.");
      return;
    }

    if (inputPassword !== "sipades123") {
      setLoginError("Sandi keamanan yang Anda masukkan tidak cocok.");
      return;
    }

    if (found.status !== "Aktif") {
      setLoginError("Akun Anda berstatus nonaktif. Silakan hubungi Kaur Umum.");
      return;
    }

    setInitialLoading(true);
    setTimeout(() => {
      setCurrentUser(found);
      setIsLoggedIn(true);
      setLoginError("");
      setInputUsername("");
      setInputPassword("");
      setInitialLoading(false);
    }, 600);
  };

  const handleQuickLogin = (uname: string) => {
    setInputUsername(uname);
    setInputPassword("sipades123");
    setLoginError("");
  };

  // Visual database synchronizer transaction queues
  const [dbQueue, setDbQueue] = useState<Array<{ id: string; timestamp: string; sheet: string; type: "INSERT" | "UPDATE" | "DELETE"; payload: any }>>([]);

  // Real WhatsApp Gateway Integration with Fonnte APIs
  const handleSendWhatsAppNotification = async (
    type: "pengadaan" | "aset_baru" | "low_stock" | "audit_remind",
    item: any,
    customApiKey?: string,
    customTarget?: string
  ) => {
    // Phone numbers & template defaults
    const targetNo = customTarget || "087865432109"; // Default destination Kades/Operator Desa Rarang
    const apiKey = customApiKey || ""; // Safe backend fallback or custom user overrides

    let message = "";
    if (type === "pengadaan") {
      message = `⚠️ *NOTIFIKASI SIPADES - RENCANA BELANJA MODAL*\n\n` +
                `Halo Admin/Kades, baru saja diajukan rencana pengadaan barang:\n` +
                `• Kegiatan: *${item.kegiatan}*\n` +
                `• Barang: *${item.barang}*\n` +
                `• Volume: ${item.volume} Unit\n` +
                `• Harga Satuan: Rp ${item.harga.toLocaleString("id-ID")}\n` +
                `• Jumlah Total: *Rp ${item.total.toLocaleString("id-ID")}*\n` +
                `• Sumber Dana: APBDesa *${item.sumber_dana}*\n` +
                `• Lokasi Alokasi: ${item.lokasi}\n\n` +
                `Dokumen pengadaan ini berstatus Draf dan menunggu review pemostingan KIB oleh Kepala Desa.`;
    } else if (type === "aset_baru") {
      message = `✅ *NOTIFIKASI ASET BARU - TERPOSTING REAL-TIME*\n\n` +
                `Perekaman Buku Inventaris (KIB) berhasil disetujui:\n` +
                `• Kategori: *${item.kategori}*\n` +
                `• Nama Barang: *${item.nama_barang}*\n` +
                `• Kode Barang: *${item.kode_barang}*\n` +
                `• Nilai Pembukuan: *Rp ${item.nilai.toLocaleString("id-ID")}*\n` +
                `• Lokasi Penempatan: ${item.lokasi}\n` +
                `• Kondisi Fisik: *${item.kondisi}*\n\n` +
                `Data aset sinkron otomatis di server SIPADES, stiker QR Code pelabelan fisik sudah aktif dan siap dicetak.`;
    } else if (type === "low_stock") {
      message = `🚨 *PERINGATAN STOK LOGISTIK KRITIS*\n\n` +
                `Stok barang persediaan di Gudang Desa Rarang Selatan kurang dari batas aman (< 50):\n` +
                `• Nama Barang: *${item.name}*\n` +
                `• Sisa Mutasi Stok: *${item.qty} Pcs / Karung*\n` +
                `• Evaluasi Keamanan: *Segera lakukan restock via APBDesa!*\n\n` +
                `Pesan sistem ini dikirim otomatis ke Operator & Kepala Urusan Umum Desa.`;
    } else if (type === "audit_remind") {
      message = `📅 *SPESIAL INSTRUKSI - JADWAL REVALUASI & AUDIT ASSET*\n\n` +
                `PEMBERITAHUAN JADWAL AUDIT SIPADES:\n` +
                `• Register ID: *${item.id}*\n` +
                `• Nama Barang: *${item.nama_barang}*\n` +
                `• Lokasi Cetak: ${item.lokasi}\n` +
                `• Rencana Audit: *${item.tanggal}*\n` +
                `• Auditor Terdaftar: *${item.auditor}*\n\n` +
                `Pemeriksaan fisik akan dilakukan pada tanggal tersebut. Mohon siapkan fisik aset and pastikan stiker QR Code dapat dipindai.`;
    }

    console.log(`[WA Gateway Send] Type: ${type}, Recipient: ${targetNo}`);

    try {
      const response = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, target: targetNo, apiKey })
      });
      const resData = await response.json();
      console.log("[WA Gateway API Success Response]:", resData);
      return resData;
    } catch (err) {
      console.error("[WA Gateway Client Fetch Error]:", err);
      return { error: true, message: err };
    }
  };

  // Synchronizer central mechanism
  const registerSyncAction = (sheet: string, type: "INSERT" | "UPDATE" | "DELETE", data: any) => {
    const nextLog = {
      id: `TX-${Math.floor(Math.random() * 800000) + 100000}`,
      timestamp: new Date().toLocaleTimeString("id-ID"),
      sheet,
      type,
      payload: data
    };
    setDbQueue(prev => [nextLog, ...prev]);
  };

  // Clean sync logs
  const clearSyncQueue = () => setDbQueue([]);

  const handleUpdateAssetCoords = (assetId: string, lat: number, lng: number) => {
    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          latitude: lat,
          longitude: lng
        };
      }
      return a;
    }));
  };

  // Responsive Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRolePickerOpen, setIsRolePickerOpen] = useState(false);

  // Filter tabs according to current active User Roles
  const handleRoleChange = (roleName: string) => {
    const match = users.find(u => u.role === roleName);
    if (match) {
      setCurrentUser(match);
      setIsRolePickerOpen(false);

      // Auto redirect to home dashboard on changing role profile
      setCurrentTab("dashboard");
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 antialiased selection:bg-emerald-100 selection:text-emerald-900 font-sans">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-emerald-500/5 transition-transform duration-500 animate-pulse">
            <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
          <div className="text-center space-y-1.5 flex flex-col items-center">
            <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest block animate-pulse">Memuat Sistem</span>
            <div className="h-1 w-12 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-1/2 animate-bounce rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col justify-between p-4 antialiased selection:bg-emerald-100 selection:text-emerald-900 font-sans">
        
        {/* Outer Centered Card Wrapper */}
        <div className="m-auto max-w-md w-full bg-white rounded-3xl border border-slate-200/85 shadow-2xl overflow-hidden p-8 space-y-6 text-left transition-all duration-300 hover:shadow-emerald-500/5 mt-10 mb-10">
          
          {/* Header Branding (Lombok Timur & Sipades Core) */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm transition-transform duration-300 hover:scale-105">
              <img src={profileDesa.logo} 
                   alt="Logo Desa" className="h-14 object-contain" referrerPolicy="no-referrer" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest block">PEMERINTAH DESA RARANG SELATAN</span>
              <h1 className="text-xl font-extrabold text-slate-950 uppercase tracking-tight">SIPADES SMART <span className="text-emerald-600 font-black">v4.0</span></h1>
              <p className="text-xs text-slate-400 font-mono">Sistem Informasi Pengelolaan &amp; Audit Aset Desa</p>
            </div>
          </div>

          {/* Alert Error Message Panel */}
          {loginError && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-850 text-xs font-semibold leading-relaxed flex items-start gap-3 shadow-sm transition-all duration-200">
              <div className="bg-rose-100 p-1.5 rounded-lg text-rose-600 shrink-0">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <span className="block font-bold text-rose-900 mb-0.5">Keamanan Masuk Terkendala:</span>
                <span className="text-rose-700/90 font-medium">{loginError}</span>
              </div>
            </div>
          )}

          {/* Login Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">Username / Email Operator:</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserCheck className="h-4 w-4" />
                </div>
                <input type="text" name="username" placeholder="Masukkan nama pengguna..." required
                       className="w-full text-xs pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150 outline-none placeholder:text-slate-400 font-medium text-slate-800"
                       value={inputUsername}
                       onChange={e => setInputUsername(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">Kata Sandi / PIN:</label>
                <span className="text-[10px] text-emerald-600 font-semibold cursor-help" title="Sandi bawaan untuk semua akun demo adalah sipades123">Lupa sandi?</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input type="password" name="password" placeholder="••••••••" required
                       className="w-full text-xs pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150 outline-none placeholder:text-slate-400 font-medium text-slate-800"
                       value={inputPassword}
                       onChange={e => setInputPassword(e.target.value)} />
              </div>
            </div>

            <button type="submit" 
                    className="w-full rounded-xl bg-slate-900 hover:bg-slate-850 active:bg-slate-950 text-white font-bold py-4 text-xs transition duration-155 uppercase tracking-wider shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]">
              <span>Verifikasi Otorisasi Masuk</span>
              <LogIn className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </form>

          {/* Dynamic Easy Login Helper / Quick Sign-In Options */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono font-black">Pilih Akun Cepat (Klik untuk Mengisi):</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {users.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u.username)}
                  className="text-left p-3 rounded-2xl bg-emerald-50/20 hover:bg-emerald-50 border border-emerald-100/30 hover:border-emerald-200/80 transition-all duration-150 relative group cursor-pointer"
                >
                  <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider block">{u.role}</span>
                  <span className="text-[11px] font-bold text-slate-800 font-mono block mt-0.5">{u.username}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">Sandi: sipades123</span>
                </button>
              ))}
            </div>
            
            {/* Email Shortcut Helper Warning Info */}
            <div className="text-[10px] text-slate-400 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-center">
              Operator juga dapat mengisi email <strong className="text-slate-650">pemdes.rarangselatan@gmail.com</strong> dengan sandi <strong className="text-slate-650">sipades123</strong> untuk masuk otomatis sebagai Administrator.
            </div>
          </div>

        </div>

        {/* Footer Copyright */}
        <div className="text-[10px] text-slate-400 font-mono text-center pb-2 pt-4">
          &copy; 2026 Pemerintah Desa Rarang Selatan &middot; Lombok Timur, NTB
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Upper Navigation Rail bar */}
      <header className="sticky top-0 z-40 bg-white text-slate-800 border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img 
            src={profileDesa.logo} 
            alt="SIPADES Logo" 
            className="h-10 w-auto filter drop-shadow-sm"
            referrerPolicy="no-referrer"
          />
          <div className="text-left">
            <h1 className="text-base font-black uppercase tracking-wider leading-none text-blue-900">SIPADES SMART v4.0</h1>
            <p className="text-[10px] text-blue-700 font-bold uppercase tracking-widest mt-1">
              PEMERINTAH {profileDesa.namaDesa} • {profileDesa.kecamatan}
            </p>
          </div>
        </div>

        {/* User profile selection & testing utilities */}
        <div className="relative">
          <button
            onClick={() => setIsRolePickerOpen(!isRolePickerOpen)}
            className="inline-flex items-center gap-2.5 rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-1.5 text-xs font-bold hover:bg-slate-100 cursor-pointer transition-colors text-slate-700"
          >
            <div className="text-right">
              <span className="block text-slate-400 leading-none text-xxs font-extrabold uppercase tracking-widest text-[9px]">Aktif Akun / Kewenangan:</span>
              <span className="block mt-0.5 text-slate-800 font-semibold">{currentUser.nama} ({currentUser.role})</span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>

          {isRolePickerOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white text-slate-950 p-4 shadow-2xl border border-slate-200 border-t-4 border-t-blue-800 space-y-3 z-50 text-left">
              <span className="block text-[9px] font-black uppercase tracking-wider text-slate-400">Pilih Switch Level Akses (Multi-Role):</span>
              <div className="space-y-1.5">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleRoleChange(u.role)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-bold flex flex-col transition-colors ${
                      currentUser.role === u.role 
                        ? "bg-blue-50 text-blue-900 font-extrabold border border-blue-100" 
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <span>{u.nama}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{u.role}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-2 text-[10px] text-slate-500 font-mono text-center mb-1">
                User Email: pemdes.rarangselatan@gmail.com
              </div>

              {/* Quick exit option */}
              <div className="border-t border-slate-100 pt-2">
                <button
                  onClick={() => {
                    setIsLoggedIn(false);
                    setIsRolePickerOpen(false);
                    setLoginError("");
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Keluar dari Sesi
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Core Full-Width Workspace content Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="sidebar-gradient w-full md:w-64 border-r border-[#1e3a8a]/20 text-left p-4 space-y-6 text-white shadow-lg flex flex-col justify-between">
          <div className="flex flex-col flex-1">
            <div className="space-y-1.5 pl-2 select-none border-b border-white/5 pb-4">
              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest block opacity-75">NAVIGASI BUKU</span>
              <span className="text-xs font-medium text-white/90 block">{currentUser.role} Control Desk</span>
            </div>

            <nav className="space-y-1 flex-1 flex flex-col justify-between mt-4">
              <div className="space-y-1">
                {[
                  { id: "dashboard", label: "Dashboard Ringkasan", icon: LayoutDashboard },
                  { id: "master", label: "Menejemen Basis Data", icon: Building2, roles: ["Administrator"] },
                  { id: "procurement", label: "Belanja & Pengadaan", icon: PlusSquare, roles: ["Administrator", "Operator Desa"] },
                  { id: "inventory", label: "Inventaris / Buku KIB", icon: Database, roles: ["Administrator", "Operator Desa", "Kepala Desa"] },
                  { id: "usage", label: "Hak Guna & Leases", icon: FileCheck, roles: ["Administrator", "Operator Desa", "Kepala Desa"] },
                  { id: "capital", label: "Kapitalisasi & Disposal", icon: TrendingDown, roles: ["Administrator", "Operator Desa", "Kepala Desa"] },
                  { id: "supplies", label: "Persediaan Desa", icon: Warehouse, roles: ["Administrator", "Operator Desa"] },
                  { id: "kode_barang", label: "Referensi Kode Barang", icon: BookOpen },
                  { id: "gis", label: "Peta GIS Aset", icon: MapPin },
                  { id: "scanner", label: "Fisik Scan / Audit", icon: Compass, roles: ["Administrator", "Operator Desa", "Auditor"] },
                  { id: "reports", label: "Pencetakan / Laporan", icon: Printer, roles: ["Administrator", "Operator Desa", "Kepala Desa", "Auditor"] },
                  { id: "premium", label: "Saran Revaluasi AI", icon: Sparkles, roles: ["Administrator", "Operator Desa", "Kepala Desa", "Auditor"] }
                ].map(tab => {
                  // check authorization based on array of allowed roles
                  if (tab.roles && !tab.roles.includes(currentUser.role)) return null;

                  const IconC = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCurrentTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase transition-all tracking-wide ${
                        currentTab === tab.id
                          ? "bg-white/10 text-white border-l-4 border-teal-400 font-extrabold shadow-sm"
                          : "text-blue-200 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <IconC className="h-4.5 w-4.5" /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Beautiful Log Out / Keluar Button at bottom */}
              <div className="pt-4 border-t border-white/10 mt-6">
                <button
                  onClick={() => {
                    setIsLoggedIn(false);
                    setLoginError("");
                    setInputUsername("");
                    setInputPassword("");
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase transition-all tracking-wide text-rose-300 hover:bg-rose-500/15 hover:text-white cursor-pointer"
                >
                  <LogOut className="h-4.5 w-4.5 text-rose-450" /> Keluar Aplikasi
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Dynamic Display viewport panel */}
        <main className="flex-1 bg-slate-50 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {currentTab === "dashboard" && (
            <Dashboard 
              assets={assets} 
              pengadaanList={pengadaanList} 
              persediaanList={persediaanList}
              penghapusanList={penghapusanList} 
              setActiveTab={setCurrentTab}
              userRole={currentUser.role}
            />
          )}

          {currentTab === "master" && (
            <MasterData 
              profilDesa={profileDesa} 
              setProfilDesa={setProfileDesa}
              users={users} 
              setUsers={setUsers}
              perangkatDesa={perangkatDesa} 
              setPerangkatDesa={setPerangkatDesa}
              ruanganList={ruanganList} 
              setRuanganList={setRuanganList}
              onDbAction={registerSyncAction}
            />
          )}

          {currentTab === "procurement" && (
            <Procurement 
              pengadaanList={pengadaanList} 
              setPengadaanList={setPengadaanList}
              assets={assets}
              setAssets={setAssets}
              onDbAction={registerSyncAction}
              onSendWhatsApp={handleSendWhatsAppNotification}
            />
          )}

          {currentTab === "inventory" && (
            <Inventory 
              assets={assets} 
              setAssets={setAssets} 
              ruanganList={ruanganList}
              profilDesa={profileDesa}
              onDbAction={registerSyncAction}
            />
          )}

          {currentTab === "usage" && (
            <UsagePemanfaatan 
              penggunaanList={penggunaanList} 
              setPenggunaanList={setPenggunaanList}
              pemanfaatanList={pemanfaatanList} 
              setPemanfaatanList={setPemanfaatanList}
              assets={assets}
              perangkatDesa={perangkatDesa}
              onDbAction={registerSyncAction}
            />
          )}

          {currentTab === "capital" && (
            <CapitalDisposal 
              kapitalisasiList={kapitalisasiList} 
              setKapitalisasiList={setKapitalisasiList}
              penghapusanList={penghapusanList} 
              setPenghapusanList={setPenghapusanList}
              assets={assets}
              setAssets={setAssets}
              onDbAction={registerSyncAction}
            />
          )}

          {currentTab === "supplies" && (
            <Supplies 
              persediaanList={persediaanList} 
              setPersediaanList={setPersediaanList}
              onDbAction={registerSyncAction}
              onSendWhatsApp={handleSendWhatsAppNotification}
            />
          )}

          {currentTab === "scanner" && (
            <ScannerAudit 
              assets={assets} 
              setAssets={setAssets}
              auditList={auditList} 
              setAuditList={setAuditList}
              onDbAction={registerSyncAction}
              onSendWhatsApp={handleSendWhatsAppNotification}
            />
          )}

          {currentTab === "reports" && (
            <Reports assets={assets} />
          )}

          {currentTab === "kode_barang" && (
            <KodeBarang assets={assets} />
          )}

          {currentTab === "gis" && (
            <GisMap 
              assets={assets} 
              onUpdateAssetCoords={handleUpdateAssetCoords} 
              onDbAction={registerSyncAction} 
            />
          )}

          {currentTab === "premium" && (
            <PremiumFeatures 
              assets={assets} 
              onSendWhatsApp={handleSendWhatsAppNotification}
            />
          )}
        </main>
      </div>

      {/* Footer bar */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>© {new Date().getFullYear()} SIPADES SMART. Hak Cipta Dilindungi Undang-Undang.</span>
        <span>Pemerintah Desa Rarang Selatan • Terara, Lombok Timur, NTB</span>
      </footer>
    </div>
  );
}
