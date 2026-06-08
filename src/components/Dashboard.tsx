import React, { useState } from "react";
import { Asset, Pengadaan, Persediaan, Penghapusan } from "../types";
import { 
  Building2, 
  MapPin, 
  Wrench, 
  Layers, 
  AlertTriangle, 
  TrendingUp, 
  PlusCircle, 
  FileCheck,
  TrendingDown,
  Calendar,
  IndianRupee,
  Coins
} from "lucide-react";

interface DashboardProps {
  assets: Asset[];
  pengadaanList: Pengadaan[];
  persediaanList: Persediaan[];
  penghapusanList: Penghapusan[];
  setActiveTab: (tab: string) => void;
  userRole: string;
}

export default function Dashboard({
  assets,
  pengadaanList,
  persediaanList,
  penghapusanList,
  setActiveTab,
  userRole
}: DashboardProps) {
  const [chartHover, setChartHover] = useState<number | null>(null);

  // Math Calculations for stats cards
  const totalAssetsVal = assets.reduce((acc, curr) => acc + curr.nilai, 0);
  const totalTanahCount = assets.filter(a => a.kategori === "KIB A").length;
  const totalGedungCount = assets.filter(a => a.kategori === "KIB C").length;
  const totalPeralatanCount = assets.filter(a => a.kategori === "KIB B").length;
  const totalPersediaanQty = persediaanList.reduce((acc, curr) => {
    return curr.tipe === "Masuk" ? acc + curr.jumlah : acc - curr.jumlah;
  }, 0);

  // Group assets for charting
  const categoryVals = {
    "KIB A (Tanah)": assets.filter(a => a.kategori === "KIB A").reduce((acc, curr) => acc + curr.nilai, 0),
    "KIB B (Peralatan)": assets.filter(a => a.kategori === "KIB B").reduce((acc, curr) => acc + curr.nilai, 0),
    "KIB C (Gedung)": assets.filter(a => a.kategori === "KIB C").reduce((acc, curr) => acc + curr.nilai, 0),
    "KIB D (Jalan/Irigasi)": assets.filter(a => a.kategori === "KIB D").reduce((acc, curr) => acc + curr.nilai, 0),
    "KIB E (Aset Lain)": assets.filter(a => a.kategori === "KIB E").reduce((acc, curr) => acc + curr.nilai, 0),
    "KIB F (Konstruksi)": assets.filter(a => a.kategori === "KIB F").reduce((acc, curr) => acc + curr.nilai, 0),
  };

  const conditionCounts = {
    "Baik": assets.filter(a => a.kondisi === "Baik").length,
    "Rusak Ringan": assets.filter(a => a.kondisi === "Rusak Ringan").length,
    "Rusak Berat": assets.filter(a => a.kondisi === "Rusak Berat").length,
    "Hilang": assets.filter(a => a.kondisi === "Hilang").length,
  };

  // Monthly or yearly procurement math
  const yearlyData = [
    { year: 2021, val: 320000000 },
    { year: 2022, val: 450000000 },
    { year: 2023, val: 560000000 },
    { year: 2024, val: 780000000 },
    { year: 2025, val: 1250000000 },
    { year: 2026, val: 1450000000 + pengadaanList.filter(p => p.status === "Terposting").reduce((acc, c) => acc + c.total, 0) },
  ];

  // Persediaan alerts
  const lowStockItems = Array.from(
    persediaanList.reduce((acc, item) => {
      const current = acc.get(item.nama_barang) || 0;
      acc.set(item.nama_barang, item.tipe === "Masuk" ? current + item.jumlah : current - item.jumlah);
      return acc;
    }, new Map<string, number>())
  ).map(([name, qty]) => ({ name, qty }))
   .filter(item => item.qty <= 50);

  const formattedValue = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-900 to-slate-900 p-6 text-white shadow-md">
        <h1 id="dashboard-header" className="font-sans text-2xl font-bold tracking-tight">
          Selamat Datang di SIPADES SMART v4.0
        </h1>
        <p className="mt-1 text-sm text-blue-100 max-w-2xl">
          Sistem Digital Terpadu Pengelolaan Aset Desa Rarang Selatan. Membantu perangkat desa mewujudkan pemerintahan yang transparan, akuntabel, dan berbasis data real-time.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-md bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-300 ring-1 ring-inset ring-blue-500/30">
            Role: {userRole}
          </span>
          <span className="inline-flex items-center rounded-md bg-green-500/20 px-2 py-1 text-xs font-medium text-green-300 ring-1 ring-inset ring-green-500/30">
            Spreadsheet Database: Sinkron
          </span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Stat 1 */}
        <div className="relative overflow-hidden rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Aset Desa</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-slate-900">{assets.length}</h3>
            <p className="text-xs text-slate-400 mt-1">Item KIB Terdaftar</p>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-600"></div>
        </div>

        {/* Stat 2 */}
        <div className="relative overflow-hidden rounded-xl bg-white p-5 shadow-sm border border-slate-100 xl:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Nilai Aset Terkapitalisasi</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{formattedValue(totalAssetsVal)}</h3>
            <p className="text-xs text-slate-400 mt-1">Revaluasi & Kapitalisasi Aktif</p>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-500"></div>
        </div>

        {/* Stat 3 */}
        <div className="relative overflow-hidden rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Aset Tanah (KIB A)</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-slate-900">{totalTanahCount}</h3>
            <p className="text-xs text-slate-400 mt-1">Sertifikat & Bengkok</p>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-500"></div>
        </div>

        {/* Stat 4 */}
        <div className="relative overflow-hidden rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Bangunan (KIB C)</span>
            <div className="rounded-lg bg-sky-50 p-2 text-sky-600">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-slate-900">{totalGedungCount}</h3>
            <p className="text-xs text-slate-400 mt-1">Gedung Kantor, Pustaka, & Posyandu</p>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-sky-500"></div>
        </div>

        {/* Stat 5 */}
        <div className="relative overflow-hidden rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Stok Persediaan</span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-slate-900">{totalPersediaanQty}</h3>
            <p className="text-xs text-slate-400 mt-1">Sisa ATK & Bibit Tani</p>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-rose-500"></div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Categorized asset value SVG Custom Chart */}
        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Nilai Aset per Kategori (KIB A - F)</h3>
              <p className="text-xs text-slate-400">Distribusi nilai perolehan pembukuan aset desa</p>
            </div>
            <TrendingUp className="h-5 w-5 text-indigo-500" />
          </div>
          {/* SVG representation */}
          <div className="flex flex-col md:flex-row items-center justify-around gap-4 h-64">
            <div className="relative w-48 h-48">
              {/* Pie SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {(() => {
                  let accumAngle = 0;
                  const categories = Object.entries(categoryVals);
                  const grandTotal = categories.reduce((s, [, v]) => s + v, 0) || 1;
                  const colors = ["#0d9488", "#4f46e5", "#f59e0b", "#0284c7", "#ec4899", "#8b5cf6"];

                  return categories.map(([name, val], idx) => {
                    const pct = val / grandTotal;
                    const strokeDash = pct * 2 * Math.PI * 40;
                    const strokeOffset = accumAngle * 2 * Math.PI * 40;
                    accumAngle += pct;
                    const strokeColors = ["#1E3A8A", "#2563EB", "#3B82F6", "#60A5FA", "#10B981", "#F59E0B"];
                    return (
                      <circle
                        key={name}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={strokeColors[idx]}
                        strokeWidth="11"
                        strokeDasharray={`${strokeDash} 251.2`}
                        strokeDashoffset={-strokeOffset}
                        onMouseEnter={() => setChartHover(idx)}
                        onMouseLeave={() => setChartHover(null)}
                        className="transition-all duration-300 cursor-pointer hover:stroke-[13px]"
                      />
                    );
                  });
                })()}
                <circle cx="50" cy="50" r="28" fill="#ffffff" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xxs font-medium text-slate-400 uppercase">Grand Total</span>
                <span className="text-xs font-bold text-slate-800 text-center px-2 truncate max-w-[120px]">
                  {formattedValue(totalAssetsVal).replace("Rp", "Rp ")}
                </span>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="space-y-2 text-xs w-full max-w-xs">
              {(() => {
                const categories = Object.entries(categoryVals);
                const colors = ["#1E3A8A", "#2563EB", "#3B82F6", "#60A5FA", "#10B981", "#F59E0B"];
                const grandTotal = categories.reduce((s, [, v]) => s + v, 0) || 1;
                return categories.map(([name, val], idx) => (
                  <div 
                    key={name} 
                    className={`flex items-center justify-between p-1.5 rounded-lg transition-colors ${
                      chartHover === idx ? "bg-slate-50 font-semibold" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[idx] }}></span>
                      <span className="text-slate-600 truncate max-w-[120px]">{name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-900 leading-none block">{formattedValue(val)}</span>
                      <span className="text-[10px] text-slate-400 block">{((val / grandTotal) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Condition Pie Chart */}
        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Kondisi Fisik Aset</h3>
            <p className="text-xs text-slate-400">Pembagian kondisi fisik inventaris desa</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-4 h-64">
            {/* Condition bar visualization */}
            <div className="w-full space-y-3.5 px-2">
              {(() => {
                const total = Object.values(conditionCounts).reduce((s, v) => s + v, 0) || 1;
                const items = [
                  { label: "Baik", count: conditionCounts.Baik, color: "bg-green-600", text: "text-green-600" },
                  { label: "Rusak Ringan", count: conditionCounts["Rusak Ringan"], color: "bg-yellow-500", text: "text-yellow-600" },
                  { label: "Rusak Berat", count: conditionCounts["Rusak Berat"], color: "bg-rose-500", text: "text-rose-600" },
                  { label: "Hilang", count: conditionCounts.Hilang, color: "bg-slate-500", text: "text-slate-600" }
                ];
                return items.map(item => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span className="font-medium">{item.label}</span>
                      <span>{item.count} Unit <span className="text-slate-400">({((item.count / total) * 100).toFixed(0)}%)</span></span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.count / total) * 100}%` }}></div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Yearly Growth SVG Line / Area Chart */}
      <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Grafik Nilai Aset Tahunan (2021 - 2026)</h3>
            <p className="text-xs text-slate-400">Pertumbuhan kapitalisasi aset dari APBDesa</p>
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="h-4 w-4" /> Real-time Audit
          </span>
        </div>
        <div className="h-48 w-full mt-2">
          {/* Custom responsive SVG chart */}
          <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
            {(() => {
              const maxVal = Math.max(...yearlyData.map(d => d.val)) || 1;
              const points = yearlyData.map((d, i) => {
                const x = 50 + i * 180;
                const y = 170 - (d.val / maxVal) * 140;
                return { x, y, value: d.val, year: d.year };
              });
              const pointsStr = points.map(p => `${p.x},${p.y}`).join(" ");
              const areaPointsStr = `50,170 ${pointsStr} ${points[points.length - 1].x},170`;

              return (
                <>
                  {/* Grid Lines */}
                  <line x1="50" y1="30" x2="950" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="50" y1="100" x2="950" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="50" y1="170" x2="950" y2="170" stroke="#e2e8f0" strokeWidth="1.5" />

                  {/* Gradient fill */}
                  <defs>
                    <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon points={areaPointsStr} fill="url(#chart-grad)" />

                  {/* Connection Line */}
                  <polyline points={pointsStr} fill="none" stroke="#2563EB" strokeWidth="3" />

                  {/* Markers & Labels */}
                  {points.map((p, idx) => (
                    <g key={p.year}>
                      {/* Interactive Hover Point */}
                      <circle cx={p.x} cy={p.y} r="5" fill="#1E3A8A" stroke="#ffffff" strokeWidth="2" className="cursor-pointer hover:r-7 transition-all duration-300" />
                      {/* Price Tag values */}
                      <text x={p.x} y={p.y - 12} textAnchor="middle" fill="#334155" fontSize="10" fontWeight="600">
                        {p.value >= 1e9 ? `${(p.value / 1e9).toFixed(2)} M` : `${(p.value / 1e6).toFixed(0)} Jt`}
                      </text>
                      {/* Year label */}
                      <text x={p.x} y="190" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="500">
                        Th. {p.year}
                      </text>
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Widgets & Logs Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Widget 1: Recent Assets */}
        <div id="recent-assets-widget" className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Aset Baru Terdaftar</h3>
            <button onClick={() => setActiveTab("inventaris")} className="text-xs text-blue-600 hover:underline">Lihat Semua</button>
          </div>
          <div className="divide-y divide-slate-100">
            {assets.slice(-3).reverse().map(asset => (
              <div key={asset.id} className="flex items-center gap-3 py-2.5">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600 text-xs font-bold leading-none w-10 text-center">
                  {asset.kategori}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-medium text-slate-900 truncate">{asset.nama_barang}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tahun {asset.tahun || "2026"} • {asset.lokasi}</p>
                </div>
                <div className="text-right text-xs font-semibold text-slate-700">
                  {formattedValue(asset.nilai).replace(",00", "")}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 2: Supply Warning */}
        <div id="supply-warning-widget" className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Persediaan Menipis</h3>
            <button onClick={() => setActiveTab("persediaan")} className="text-xs text-blue-600 hover:underline">Kelola Stok</button>
          </div>
          <div className="divide-y divide-slate-100">
            {lowStockItems.length > 0 ? (
              lowStockItems.map(item => (
                <div key={item.name} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0 flex-1">
                    <span id={`low-stock-label-${item.name}`} className="text-xs font-medium text-slate-900 truncate block">{item.name}</span>
                    <span className="text-[10px] text-slate-400">Peringatan: Segera beli stok baru</span>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.qty <= 10 ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-800"
                    }`}>
                      {item.qty} Pcs
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Stok semua persediaan aman & melimpah.
              </div>
            )}
          </div>
        </div>

        {/* Widget 3: Recent Write Off / Penghapusan */}
        <div id="writeoff-recent-widget" className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Aset Baru Dihapus</h3>
            <button onClick={() => setActiveTab("kapitalisasi")} className="text-xs text-blue-600 hover:underline">Riwayat</button>
          </div>
          <div className="divide-y divide-slate-100">
            {penghapusanList.length > 0 ? (
              penghapusanList.slice(-3).reverse().map(item => (
                <div key={item.id} className="flex items-center gap-3 py-2.5">
                  <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                    <TrendingDown className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-medium text-slate-900 truncate">{item.nama_barang}</h4>
                    <p className="text-[10px] text-rose-500 mt-0.5">Alasan: {item.alasan}</p>
                  </div>
                  <div className="text-right text-[10px] text-slate-400">
                    {item.tanggal}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Belum ada penghapusan aset di tahun ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
