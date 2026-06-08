<?php
/**
 * ==============================================================================
 *                       SIPADES SMART v4.5 - PHYSICAL AUDITS & SCANNER LOGS
 *                 SISTEM INFORMASI PENGELOLAAN ASET DESA RARANG SELATAN
 * ==============================================================================
 */
require_once 'header.php';

$success_msg = "";
$error_msg = "";

// 1. TAMBAH AUDIT PENILAIAN FISIK BARU
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'insert') {
    try {
        $id = "AUD-" . rand(1000, 9999);
        $tanggal = safeInput($_POST['tanggal']);
        $barang_id = safeInput($_POST['barang_id']); // ID Aset KIB
        $kondisi = safeInput($_POST['kondisi']);
        $auditor = safeInput($_POST['auditor']);
        $catatan = safeInput($_POST['catatan']);
        $foto_bukti = safeInput($_POST['foto']) ?: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400';

        if (empty($tanggal) || empty($barang_id) || empty($kondisi) || empty($auditor) || empty($catatan)) {
            $error_msg = "Isian Tanggal, Pemilihan Aset, Kondisi Fisik Terbaru, Auditor, dan Catatan wajib diisi.";
        } else {
            // Ambil nama barang asli dari tabel assets
            $stmt_ast = $pdo->prepare("SELECT nama_barang FROM assets WHERE id = ? LIMIT 1");
            $stmt_ast->execute([$barang_id]);
            $asset_found = $stmt_ast->fetch();

            if (!$asset_found) {
                throw new Exception("ID Aset {$barang_id} tidak valid atau tidak terdaftar di database KIB.");
            }

            $nama_barang = $asset_found['nama_barang'];

            // Mulai database transaction untuk konsistensi data
            $pdo->beginTransaction();

            // A. Simpan Log Audit
            $stmt_insert = $pdo->prepare("INSERT INTO audit (id, tanggal, barang_id, nama_barang, kondisi, auditor, catatan, foto) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt_insert->execute([$id, $tanggal, $barang_id, $nama_barang, $kondisi, $auditor, $catatan, $foto_bukti]);

            // B. Update status kondisi terkini langsung di tabel assets
            $stmt_update_asset = $pdo->prepare("UPDATE assets SET kondisi = ? WHERE id = ?");
            $stmt_update_asset->execute([$kondisi, $barang_id]);

            $pdo->commit();

            $success_msg = "Audit Fisik Lapangan ID {$id} berhasil disimpan! Status aset di Buku KIB otomatis terupdate menjadi '{$kondisi}'.";
        }
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        $error_msg = "Kegagalan prosedur audit: " . $e->getMessage();
    }
}

// 2. READ ALL DISPOSAL AUDITS LOGS
$search = isset($_GET['search']) ? safeInput($_GET['search']) : '';
$query_str = "SELECT * FROM audit WHERE 1=1";
$params = [];

if (!empty($search)) {
    $query_str .= " AND (nama_barang LIKE ? OR auditor LIKE ? OR barang_id LIKE ?)";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
}

$query_str .= " ORDER BY tanggal DESC";
$stmt_audit = $pdo->prepare($query_str);
$stmt_audit->execute($params);
$audits_log = $stmt_audit->fetchAll();

// List assets untuk pengait dropdown pemilih aset
$all_assets_dropdown = $pdo->query("SELECT id, nama_barang, kategori, kondisi FROM assets ORDER BY nama_barang ASC")->fetchAll();
?>

<div class="space-y-6 text-left">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 class="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <i data-lucide="camera" class="h-5 w-5 text-emerald-600"></i> Scanner &amp; Pemeriksaan Opname Fisik (Audit)
            </h1>
            <p class="text-xs text-slate-500 mt-1">Lacak pencocokan kondisi KIB riil di lapangan, kumpulkan foto koordinat bukti, dan cegah kebocoran aset desa.</p>
        </div>
        <button onclick="document.getElementById('add-audit-modal').classList.remove('hidden')" 
                class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2.5 text-xs shadow-md transition duration-150 cursor-pointer">
            <i data-lucide="file-plus" class="h-4 w-4 text-emerald-400"></i> Rekam Audit Baru
        </button>
    </div>

    <!-- Alarm Box -->
    <?php if (!empty($success_msg)): ?>
        <div class="p-4 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-950 text-xs font-bold flex items-start gap-2 animate-pulse">
            <i data-lucide="check-circle" class="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5"></i>
            <span><?php echo htmlspecialchars($success_msg); ?></span>
        </div>
    <?php endif; ?>

    <?php if (!empty($error_msg)): ?>
        <div class="p-4 bg-rose-50 border border-rose-150 rounded-xl text-rose-955 text-xs font-bold flex items-start gap-2">
            <i data-lucide="alert-circle" class="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5"></i>
            <span><?php echo htmlspecialchars($error_msg); ?></span>
        </div>
    <?php endif; ?>

    <!-- Search Tool -->
    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-2">
        <form method="GET" class="w-full relative">
            <input type="text" name="search" placeholder="Cari log berdasarkan nama aset, ID, atau auditor..." 
                   value="<?php echo htmlspecialchars($search); ?>"
                   class="w-full text-xs p-2.5 pl-9 rounded-lg border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white outline-none">
            <i data-lucide="search" class="absolute left-2.5 top-3 h-4 w-4 text-slate-400"></i>
        </form>
    </div>

    <!-- VIEW AUDIT BENTO TIMELINE LOG -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Live Action panel explaining audit scanner guidelines -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 class="text-xs font-black text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <i data-lucide="help-circle" class="h-4.5 w-4.5 text-emerald-600"></i> Panduan Rekonsiliasi Aset Desa
            </h3>
            
            <div class="space-y-3.5 text-xs text-slate-600 font-sans leading-relaxed">
                <ol class="list-decimal pl-4 space-y-2.5">
                    <li>
                        <strong>Identifikasi Label Aset</strong>: Pastikan stiker register kode QR terpasang kuat di bodi fisik (laptop, alat kantor, atau motor).
                    </li>
                    <li>
                        <strong>Gunakan Scanner QR / Manual Input</strong>: Klik "Suku Label QR" dari kamera HP, atau rekam manual menggunakan tombol "Rekam Audit Baru" di pojok kanan atas.
                    </li>
                    <li>
                        <strong>Tentukan Kondisi Riil</strong>: Tunjuk salah satu opsi (Baik, Rusak Ringan, Rusak Berat, Hilang) berdasarkan temuan nyata.
                    </li>
                    <li>
                        <strong>Simpan Catatan Temuan</strong>: Nyatakan dalam rekap (Misal: "Aset dalam penampatan ruang TU, tombol keyboard spasi mati").
                    </li>
                </ol>
                <div class="p-3 bg-slate-50 border border-slate-150 rounded-lg text-[11px] text-slate-500">
                    <span class="font-extrabold text-[#059669] block font-mono text-[10px] uppercase">Otomasi Database:</span>
                    Penyimpanan log pemeriksaan secara mandiri akan langsung memperbarui status keutuhan KIB pada direktori katalog sehingga tidak perlu diedit ganda.
                </div>
            </div>
        </div>

        <!-- History Ledger logs lists -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between max-h-[500px] overflow-y-auto">
            <h3 class="text-xs font-black text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <i data-lucide="history" class="h-4.5 w-4.5 text-emerald-600"></i> Riwayat Temuan Lapangan
            </h3>

            <div class="space-y-4 pr-1">
                <?php if (empty($audits_log)): ?>
                    <p class="text-xs text-slate-400 italic text-center py-12">Belum ada catatan aktivitas opname aset terekam.</p>
                <?php else: ?>
                    <?php foreach ($audits_log as $audit): ?>
                        <div class="p-4 bg-slate-50 border border-slate-150 rounded-xl text-xs space-y-3 relative text-left">
                            <div class="flex justify-between items-center text-[10px] text-slate-400">
                                <span class="font-extrabold font-mono text-slate-600"><?php echo htmlspecialchars($audit['id']); ?></span>
                                <span class="font-bold font-mono"><?php echo htmlspecialchars($audit['tanggal']); ?></span>
                            </div>

                            <div class="flex gap-3 items-start">
                                <?php if ($audit['foto']): ?>
                                    <img src="<?php echo htmlspecialchars($audit['foto']); ?>" alt="Temuan" class="h-14 w-20 object-cover rounded-lg border border-slate-200 shadow-sm shrink-0">
                                <?php endif; ?>
                                <div>
                                    <h4 class="font-extrabold text-slate-900 leading-tight"><?php echo htmlspecialchars($audit['nama_barang']); ?></h4>
                                    <span class="block text-[9.5px] text-slate-400 font-mono mt-0.5">Aset ID: <?php echo htmlspecialchars($audit['barang_id']); ?></span>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-2 text-[10px] border-t border-slate-200/60 pt-2 text-slate-600">
                                <div>Kondisi Lapangan: <br>
                                    <?php if ($audit['kondisi'] === 'Baik'): ?>
                                        <span class="bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.2 rounded text-[9px]">BAIK</span>
                                    <?php else: ?>
                                        <span class="bg-rose-50 text-rose-800 font-bold px-1.5 py-0.2 rounded text-[9px]"><?php echo strtoupper($audit['kondisi']); ?></span>
                                    <?php endif; ?>
                                </div>
                                <div class="text-right">Auditor Lapangan: <br><strong class="text-slate-800"><?php echo htmlspecialchars($audit['auditor']); ?></strong></div>
                            </div>

                            <div class="bg-white border rounded p-2 text-slate-500 font-sans italic text-[10.5px]">
                                "<?php echo htmlspecialchars($audit['catatan']); ?>"
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>

    </div>

    <!-- MODAL POPUP: ADD AUDIT FORM -->
    <div id="add-audit-modal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl animate-scale-up text-left">
            <div class="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 class="text-xs font-black text-slate-900 uppercase">Isi Lembar Pemeriksaan</h3>
                <button onclick="document.getElementById('add-audit-modal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600">
                    <i data-lucide="x" class="h-5 w-5"></i>
                </button>
            </div>

            <form action="" method="POST" class="space-y-4 text-xs pt-2">
                <input type="hidden" name="action" value="insert">

                <div class="space-y-1">
                    <label class="block font-bold text-slate-700 uppercase">Tanggal Verifikasi Fisik:</label>
                    <input type="date" name="tanggal" value="<?php echo date('Y-m-d'); ?>" required
                           class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                </div>

                <div class="space-y-1">
                    <label class="block font-bold text-slate-700 uppercase">Pilih Aset Yang Diuji:</label>
                    <select name="barang_id" required class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                        <option value="">-- Hubungkan Ke KIB --</option>
                        <?php foreach($all_assets_dropdown as $ast): ?>
                            <option value="<?php echo htmlspecialchars($ast['id']); ?>">
                                [<?php echo htmlspecialchars($ast['id']); ?>] <?php echo htmlspecialchars($ast['nama_barang']); ?> (Kondisi KIB: <?php echo htmlspecialchars($ast['kondisi']); ?>)
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Temuan Kondisi Nyata:</label>
                        <select name="kondisi" class="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 font-bold text-slate-800">
                            <option value="Baik">Sehat / Kondisi Baik</option>
                            <option value="Rusak Ringan">Rusak Ringan (Bisa Digunakan)</option>
                            <option value="Rusak Berat">Rusak Berat (Mati Total)</option>
                            <option value="Hilang">Laporan Hilang</option>
                        </select>
                    </div>

                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Nama Pemeriksa / Auditor:</label>
                        <input type="text" name="auditor" value="<?php echo htmlspecialchars($_SESSION['user_nama']); ?>" required
                               class="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                    </div>
                </div>

                <div class="space-y-1">
                    <label class="block font-bold text-slate-700 uppercase">URL Gambar Hubungan Kondisi (Opsional):</label>
                    <input type="url" name="foto" placeholder="https://..."
                           class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                </div>

                <div class="space-y-1">
                    <label class="block font-bold text-slate-700 uppercase">Catatan Verifikasi Detail / Deskripsi:</label>
                    <textarea name="catatan" rows="3" placeholder="Sebutkan temuan riil (misal: Sasis motor baret ringan, oli rem bocor)..." required
                              class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500"></textarea>
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="submit" class="flex-1 bg-slate-900 hover:bg-slate-850 text-white font-extrabold p-3 rounded-lg text-xs cursor-pointer transition">
                        Simpan Hasil Pemeriksaan
                    </button>
                    <button type="button" onclick="document.getElementById('add-audit-modal').classList.add('hidden')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-3 px-6 rounded-lg text-xs cursor-pointer transition">
                        Batal
                    </button>
                </div>
            </form>
        </div>
    </div>

</div>

<?php 
require_once 'footer.php'; 
?>
