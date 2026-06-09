<?php
/**
 * ==============================================================================
 *                       SIPADES SMART v4.5 - PHP DASHBOARD
 *                 SISTEM INFORMASI PENGELOLAAN ASET DESA RARANG SELATAN
 * ==============================================================================
 */
require_once 'header.php';

// 1. Eksekusi Query Ringkasan Statistik Utama
$stmt_jml_aset = $pdo->query("SELECT COUNT(*) as total FROM assets");
$total_aset = $stmt_jml_aset ? ($stmt_jml_aset->fetch()['total'] ?: 0) : 0;

$stmt_nilai_aset = $pdo->query("SELECT SUM(nilai) as total FROM assets");
$total_nilai = $stmt_nilai_aset ? ($stmt_nilai_aset->fetch()['total'] ?: 0) : 0;

$stmt_rusak_aset = $pdo->query("SELECT COUNT(*) as total FROM assets WHERE kondisi IN ('Rusak Ringan', 'Rusak Berat', 'Hilang')");
$total_rusak = $stmt_rusak_aset ? ($stmt_rusak_aset->fetch()['total'] ?: 0) : 0;

$stmt_procurement = $pdo->query("SELECT SUM(total) as total FROM pengadaan WHERE status = 'Terposting'");
$total_procurement = $stmt_procurement ? ($stmt_procurement->fetch()['total'] ?: 0) : 0;

// 2. Query Rekapitulasi Berdasarkan Buku KIB A - F
$rekaps_kib = [
    'KIB A' => ['nama' => 'Tanah Pendopo / Bengkok Kas', 'total_count' => 0, 'total_value' => 0],
    'KIB B' => ['nama' => 'Peralatan, Komputer & Mesin', 'total_count' => 0, 'total_value' => 0],
    'KIB C' => ['nama' => 'Gedung Kantor, Aula & Posyandu', 'total_count' => 0, 'total_value' => 0],
    'KIB D' => ['nama' => 'Jalan, Irigasi & Jembatan Tani', 'total_count' => 0, 'total_value' => 0],
    'KIB E' => ['nama' => 'Aset Tetap Lainnya & Gendang Beleq', 'total_count' => 0, 'total_value' => 0],
    'KIB F' => ['nama' => 'Konstruksi Dalam Pengerjaan (KDP)', 'total_count' => 0, 'total_value' => 0]
];

$stmt_kib = $pdo->query("SELECT kategori, COUNT(*) as jml, SUM(nilai) as total_nilai FROM assets GROUP BY kategori");
while ($row = $stmt_kib->fetch()) {
    if (isset($rekaps_kib[$row['kategori']])) {
        $rekaps_kib[$row['kategori']]['total_count'] = $row['jml'];
        $rekaps_kib[$row['kategori']]['total_value'] = $row['total_nilai'];
    }
}

// 3. Aktivitas Audit Fisik / Opname Terakhir
$recent_audits = $pdo->query("SELECT * FROM audit ORDER BY tanggal DESC LIMIT 4")->fetchAll();

// 4. Pengadaan Kebutuhan APBDes Menunggu Verifikasi
$pending_procurements = $pdo->query("SELECT * FROM pengadaan WHERE status = 'Draf' ORDER BY tanggal DESC LIMIT 4")->fetchAll();
?>

<div class="space-y-6 text-left w-full">
    
    <!-- Top banner info Rarang Selatan -->
    <div class="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
        <div class="space-y-1">
            <span class="text-[10px] font-black tracking-widest text-emerald-400 uppercase font-mono">DASHBOARD UTAMA MONITORING</span>
            <h2 class="text-lg font-black uppercase tracking-tight md:text-xl">SIPADES SMART v4.5</h2>
            <p class="text-xs text-slate-300 max-w-xl">
                Sugeng Rawuh di portal kontrol database aset Pemerintah Desa Rarang Selatan. Seluruh rekapitulasi KIB A sampai KIB F dijalankan secara otomatis di atas sistem database MySQL yang andal.
            </p>
        </div>
        <div class="bg-slate-700/45 p-3.5 rounded-xl border border-slate-600 shrink-0 text-center font-mono">
            <span class="block text-[9px] text-slate-400 font-bold uppercase">Tanggal Hari Ini (server)</span>
            <span class="text-xs font-bold text-emerald-300"><?php echo date('d F Y'); ?></span>
        </div>
    </div>

    <!-- 4 Dashboard Stats grids -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Jml Item KIB -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div class="space-y-1">
                <span class="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Total Inventaris KIB</span>
                <span class="text-xl font-extrabold text-slate-900 block"><?php echo number_format($total_aset); ?> <span class="text-xs text-slate-400 font-medium font-mono">Baris</span></span>
                <span class="text-[9px] text-slate-500 block">Tersimpan dalam database</span>
            </div>
            <div class="h-10 w-10 bg-emerald-50 rounded-xl text-emerald-600 flex items-center justify-center">
                <i data-lucide="layers" class="h-5 w-5"></i>
            </div>
        </div>

        <!-- Total Nilai Aset -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div class="space-y-1">
                <span class="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Nilai Total Kekayaan</span>
                <span class="text-xl font-extrabold text-emerald-600 block"><?php echo formatRupiah($total_nilai); ?></span>
                <span class="text-[9px] text-slate-500 block">Aktiva inventarisasi desa</span>
            </div>
            <div class="h-10 w-10 bg-emerald-50 rounded-xl text-emerald-600 flex items-center justify-center">
                <i data-lucide="banknote" class="h-5 w-5"></i>
            </div>
        </div>

        <!-- Rusak / Butuh Perhatian -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div class="space-y-1">
                <span class="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Aset Rusak / Hilang</span>
                <span class="text-xl font-extrabold text-rose-600 block"><?php echo number_format($total_rusak); ?> <span class="text-xs text-rose-400 font-medium font-mono">Unit</span></span>
                <span class="text-[9px] text-slate-500 block">Status Baik adalah sasaran utama</span>
            </div>
            <div class="h-10 w-10 bg-rose-50 rounded-xl text-rose-600 flex items-center justify-center">
                <i data-lucide="alert-octagon" class="h-5 w-5"></i>
            </div>
        </div>

        <!-- Belanja Pengadaan APBDes -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div class="space-y-1">
                <span class="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Realisasi Belanja APBDes</span>
                <span class="text-xl font-extrabold text-slate-800 block"><?php echo formatRupiah($total_procurement); ?></span>
                <span class="text-[9px] text-slate-500 block">Status terposting KIB</span>
            </div>
            <div class="h-10 w-10 bg-slate-100 rounded-xl text-slate-600 flex items-center justify-center">
                <i data-lucide="shopping-bag" class="h-5 w-5"></i>
            </div>
        </div>

    </div>

    <!-- Middle layer: Rekap KIB GRID -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Rekapitulasi detail KIB A - F -->
        <div class="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div class="border-b border-slate-100 pb-3 flex justify-between items-center">
                <span class="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-lucide="folder-open" class="h-4.5 w-4.5 text-emerald-600"></i> Rekapitulasi Kartu Inventaris Barang (KIB)
                </span>
                <a href="assets.php" class="text-[10px] text-emerald-600 hover:underline font-bold">Kelola Semua Aset &rarr;</a>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <?php foreach ($rekaps_kib as $key => $kib): ?>
                    <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between space-y-2 text-left">
                        <div>
                            <div class="flex justify-between items-center">
                                <span class="text-xs font-extrabold text-slate-800 font-mono"><?php echo $key; ?></span>
                                <span class="bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    <?php echo $kib['total_count']; ?> Item
                                </span>
                            </div>
                            <span class="text-[11px] text-slate-500 mt-1 block h-8 leading-tight line-clamp-2"><?php echo htmlspecialchars($kib['nama']); ?></span>
                        </div>
                        <div class="border-t border-slate-200/60 pt-2 flex justify-between items-center">
                            <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Nilai:</span>
                            <span class="text-xs font-black text-slate-800"><?php echo formatRupiah($kib['total_value']); ?></span>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Siskeudes APBDes Procurements Wait Approval -->
        <div class="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div class="border-b border-slate-100 pb-3 flex justify-between items-center">
                <span class="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-lucide="clock" class="h-4.5 w-4.5 text-amber-500"></i> Pengadaan APBDes (Draf)
                </span>
                <span class="text-[9.5px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">Verifikasi Staf</span>
            </div>

            <div class="space-y-3">
                <?php if (empty($pending_procurements)): ?>
                    <p class="text-xs text-slate-400 italic text-center py-6">Tidak ada pengadaan bersatus draf peninjauan.</p>
                <?php else: ?>
                    <?php foreach ($pending_procurements as $req): ?>
                        <div class="p-3 bg-amber-50/20 border border-amber-100/50 rounded-lg text-xs space-y-1">
                            <div class="flex justify-between items-center text-[10px] text-slate-400">
                                <span class="font-bold font-mono text-slate-600"><?php echo htmlspecialchars($req['id']); ?></span>
                                <span class="font-medium font-mono"><?php echo htmlspecialchars($req['tanggal']); ?></span>
                            </div>
                            <span class="block font-bold text-slate-800 leading-tight truncate"><?php echo htmlspecialchars($req['barang']); ?></span>
                            <div class="flex justify-between items-center text-[10px] mt-1 text-slate-500">
                                <span>Sumber: <?php echo htmlspecialchars($req['sumber_dana']); ?></span>
                                <span class="font-bold text-amber-600"><?php echo formatRupiah($req['total']); ?></span>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>

    </div>

    <!-- Bottom Layer: Recent Audits & GIS summary -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Recent Physical Audits logs -->
        <div class="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div class="border-b border-slate-100 pb-3 flex justify-between items-center">
                <span class="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-lucide="check-square" class="h-4.5 w-4.5 text-emerald-600"></i> Log Pemeriksaan Opname / Audit Fisik Terbaru
                </span>
                <a href="audit.php" class="text-[10px] text-emerald-600 hover:underline font-bold">Jalankan Audit &rarr;</a>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-xs text-left">
                    <thead>
                        <tr class="bg-slate-50 text-slate-400 uppercase text-[9.5px] font-bold border-b border-slate-100">
                            <th class="p-3">Tanggal</th>
                            <th class="p-3">Aset Terkait</th>
                            <th class="p-3">Kondisi Lapangan</th>
                            <th class="p-3">Auditor Pelapor</th>
                            <th class="p-3">Foto Bukti</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <?php if (empty($recent_audits)): ?>
                            <tr>
                                <td colspan="5" class="p-4 text-center text-slate-400 italic">Belum ada data audit fisik tercatat.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($recent_audits as $audit): ?>
                                <tr class="hover:bg-slate-50/50">
                                    <td class="p-3 font-mono font-bold text-slate-550"><?php echo htmlspecialchars($audit['tanggal']); ?></td>
                                    <td class="p-3">
                                        <span class="font-semibold text-slate-800"><?php echo htmlspecialchars($audit['nama_barang']); ?></span>
                                        <span class="block text-[10px] text-slate-400 font-mono mt-0.5"><?php echo htmlspecialchars($audit['barang_id']); ?></span>
                                    </td>
                                    <td class="p-3">
                                        <?php if ($audit['kondisi'] === 'Baik'): ?>
                                            <span class="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[9.5px]">Baik</span>
                                        <?php elseif ($audit['kondisi'] === 'Rusak Ringan'): ?>
                                            <span class="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded text-[9.5px]">Rusak Ringan</span>
                                        <?php else: ?>
                                            <span class="bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded text-[9.5px]"><?php echo $audit['kondisi']; ?></span>
                                        <?php endif; ?>
                                        <span class="block text-[10px] text-slate-400 italic mt-1 max-w-[200px] truncate" title="<?php echo htmlspecialchars($audit['catatan']); ?>"><?php echo htmlspecialchars($audit['catatan']); ?></span>
                                    </td>
                                    <td class="p-3 text-slate-600 font-medium"><?php echo htmlspecialchars($audit['auditor']); ?></td>
                                    <td class="p-3">
                                        <?php if ($audit['foto']): ?>
                                            <img src="<?php echo htmlspecialchars($audit['foto']); ?>" alt="Foto Verifikasi" class="h-8 w-12 object-cover rounded border border-slate-200">
                                        <?php else: ?>
                                            <span class="text-slate-400 text-[10px] font-mono">Tanpa Foto</span>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Quick Settings Shortcuts -->
        <div class="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div class="border-b border-slate-100 pb-3 flex justify-between items-center">
                <span class="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-lucide="info" class="h-4.5 w-4.5 text-emerald-600"></i> Informasi Server Hosting
                </span>
            </div>

            <div class="space-y-3.5 text-xs text-slate-600 font-sans leading-relaxed">
                <div class="bg-slate-50 border border-slate-150 p-3 rounded-lg space-y-2">
                    <span class="font-extrabold text-[#059669] block font-mono text-[10.5px]">SISTEM TERUJI PADA:</span>
                    <ul class="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                        <li><strong>CyberPanel VPS (Ubuntu 22.04 LTS)</strong></li>
                        <li><strong>OpenLiteSpeed Server</strong></li>
                        <li><strong>Standard cPanel Shared Hosting</strong></li>
                        <li><strong>XAMPP / Laragon (Lingkungan Lokal)</strong></li>
                    </ul>
                </div>
                <p class="text-[10.5px] text-slate-500 leading-normal">
                    Halaman ini murni dijalankan di atas file PHP server-side dan basis data MySQL. Menghilangkan ketergantungan pada runtime Node.js PM2, dan menjaga beban RAM server di bawah desa tetap stabil.
                </p>
            </div>
        </div>

    </div>

</div>

<?php 
require_once 'footer.php'; 
?>
