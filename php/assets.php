<?php
/**
 * ==============================================================================
 *                       SIPADES SMART v4.5 - KIB ASSETS CATALOG
 *                 SISTEM INFORMASI PENGELOLAAN ASET DESA RARANG SELATAN
 * ==============================================================================
 */
require_once 'header.php';

$success_msg = "";
$error_msg = "";

// 1. TAMBAH / INSERT ASET BARU (PROSEDUR POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'insert') {
    try {
        $id = "AST-" . rand(100000, 999999);
        $kategori = safeInput($_POST['kategori']);
        $kode_barang = safeInput($_POST['kode_barang']);
        $nama_barang = safeInput($_POST['nama_barang']);
        $luas = safeInput($_POST['luas']);
        $sertifikat = safeInput($_POST['sertifikat']);
        $merk = safeInput($_POST['merk']);
        $tahun = safeInput($_POST['tahun']);
        $nilai = (double) $_POST['nilai'];
        $lokasi = safeInput($_POST['lokasi']);
        $kondisi = safeInput($_POST['kondisi']);
        $panjang = safeInput($_POST['panjang']);
        $progress = safeInput($_POST['progress']);
        $keterangan = safeInput($_POST['keterangan']);
        $foto = safeInput($_POST['foto']) ?: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400';
        $latitude = (isset($_POST['latitude']) && $_POST['latitude'] !== '') ? (double) $_POST['latitude'] : null;
        $longitude = (isset($_POST['longitude']) && $_POST['longitude'] !== '') ? (double) $_POST['longitude'] : null;

        if (empty($kategori) || empty($kode_barang) || empty($nama_barang) || empty($tahun) || empty($lokasi)) {
            $error_msg = "Isian Kategori, Kode Barang, Nama Barang, Tahun, dan Lokasi wajib diisi.";
        } else {
            $stmt = $pdo->prepare("INSERT INTO assets (id, kategori, kode_barang, nama_barang, luas, sertifikat, merk, tahun, nilai, lokasi, kondisi, panjang, progress, keterangan, foto, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $kategori, $kode_barang, $nama_barang, $luas, $sertifikat, $merk, $tahun, $nilai, $lokasi, $kondisi, $panjang, $progress, $keterangan, $foto, $latitude, $longitude]);
            $success_msg = "Data aset baru berhasil didaftarkan ke Buku {$kategori}!";
        }
    } catch (Exception $e) {
        $error_msg = "Prosedur gagal dijalankan: " . $e->getMessage();
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update') {
    try {
        $id = safeInput($_POST['id']);
        $kategori = safeInput($_POST['kategori']);
        $kode_barang = safeInput($_POST['kode_barang']);
        $nama_barang = safeInput($_POST['nama_barang']);
        $luas = safeInput($_POST['luas']);
        $sertifikat = safeInput($_POST['sertifikat']);
        $merk = safeInput($_POST['merk']);
        $tahun = safeInput($_POST['tahun']);
        $nilai = (double) $_POST['nilai'];
        $lokasi = safeInput($_POST['lokasi']);
        $kondisi = safeInput($_POST['kondisi']);
        $panjang = safeInput($_POST['panjang']);
        $progress = safeInput($_POST['progress']);
        $keterangan = safeInput($_POST['keterangan']);
        $foto = safeInput($_POST['foto']) ?: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400';
        $latitude = (isset($_POST['latitude']) && $_POST['latitude'] !== '') ? (double) $_POST['latitude'] : null;
        $longitude = (isset($_POST['longitude']) && $_POST['longitude'] !== '') ? (double) $_POST['longitude'] : null;

        if (empty($id) || empty($kategori) || empty($kode_barang) || empty($nama_barang) || empty($tahun) || empty($lokasi)) {
            $error_msg = "Isian penting wajib diisi.";
        } else {
            $stmt = $pdo->prepare("UPDATE assets SET kategori=?, kode_barang=?, nama_barang=?, luas=?, sertifikat=?, merk=?, tahun=?, nilai=?, lokasi=?, kondisi=?, panjang=?, progress=?, keterangan=?, foto=?, latitude=?, longitude=? WHERE id=?");
            $stmt->execute([$kategori, $kode_barang, $nama_barang, $luas, $sertifikat, $merk, $tahun, $nilai, $lokasi, $kondisi, $panjang, $progress, $keterangan, $foto, $latitude, $longitude, $id]);
            $success_msg = "Data aset {$id} berhasil diperbarui!";
        }
    } catch (Exception $e) {
        $error_msg = "Prosedur gagal dijalankan: " . $e->getMessage();
    }
}

// 2. PROSEDUR DELETE ASET
if (isset($_GET['delete'])) {
    try {
        $id_to_delete = safeInput($_GET['delete']);
        $stmt_del = $pdo->prepare("DELETE FROM assets WHERE id = ?");
        $stmt_del->execute([$id_to_delete]);
        $success_msg = "Aset {$id_to_delete} berhasil dihapus dari Buku KIB.";
    } catch (Exception $e) {
        $error_msg = "Gagal menghapus aset: " . $e->getMessage();
    }
}

// 3. RETRIEVE MASTER REFERENSI & RUANGAN UNTUK DROPDOWN FORM
$ref_kode_barang_list = $pdo->query("SELECT * FROM ref_kode_barang ORDER BY kode ASC")->fetchAll();
$ruangan_list = $pdo->query("SELECT * FROM ruangan ORDER BY nama_ruangan ASC")->fetchAll();

// 4. FILTERING & SEARCHING LOGIC
$search = isset($_GET['search']) ? safeInput($_GET['search']) : '';
$filter_kategori = isset($_GET['kategori']) ? safeInput($_GET['kategori']) : '';
$filter_kondisi = isset($_GET['kondisi']) ? safeInput($_GET['kondisi']) : '';

$query_str = "SELECT a.*, r.nama as nama_referensi 
              FROM assets a 
              LEFT JOIN ref_kode_barang r ON a.kode_barang = r.kode 
              WHERE 1=1";
$params = [];

if (!empty($search)) {
    $query_str .= " AND (a.nama_barang LIKE ? OR a.id LIKE ? OR a.kode_barang LIKE ?)";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
}

if (!empty($filter_kategori)) {
    $query_str .= " AND a.kategori = ?";
    $params[] = $filter_kategori;
}

if (!empty($filter_kondisi)) {
    $query_str .= " AND a.kondisi = ?";
    $params[] = $filter_kondisi;
}

$query_str .= " ORDER BY a.created_at DESC";
$stmt_assets = $pdo->prepare($query_str);
$stmt_assets->execute($params);
$assets_list = $stmt_assets->fetchAll();
?>

<div class="space-y-6 text-left">
    
    <!-- Title Section -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 class="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <i data-lucide="folder-kanban" class="h-5 w-5 text-emerald-600"></i> Inventarisasi Buku KIB A - F
            </h1>
            <p class="text-xs text-slate-500 mt-1">Kelola seluruh kekayaan, tanah kas desa, gedung kantor, jalan lingkungan, dan modal operasional desa.</p>
        </div>
        <button onclick="document.getElementById('add-asset-modal').classList.remove('hidden')" 
                class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2.5 text-xs shadow-md transition duration-150 cursor-pointer">
            <i data-lucide="plus-circle" class="h-4 w-4 text-emerald-400"></i> Registrasi Aset Baru
        </button>
    </div>

    <!-- Alert Notifications -->
    <?php if (!empty($success_msg)): ?>
        <div class="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs font-bold flex items-center gap-2">
            <i data-lucide="check-circle" class="h-4 w-4 text-emerald-600"></i>
            <span><?php echo htmlspecialchars($success_msg); ?></span>
        </div>
    <?php endif; ?>

    <?php if (!empty($error_msg)): ?>
        <div class="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-xs font-bold flex items-center gap-2">
            <i data-lucide="alert-circle" class="h-4 w-4 text-rose-600"></i>
            <span><?php echo htmlspecialchars($error_msg); ?></span>
        </div>
    <?php endif; ?>

    <!-- Filter & Search Toolbar Container -->
    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <form method="GET" class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <!-- Search bar -->
            <div class="space-y-1 md:col-span-2">
                <label class="block text-[10px] font-bold text-slate-400 uppercase font-mono">Pencarian Aset:</label>
                <div class="relative">
                    <input type="text" name="search" placeholder="Masukkan ID, Kode Rekening, atau Nama Aset..." 
                           value="<?php echo htmlspecialchars($search); ?>"
                           class="w-full text-xs p-2.5 pl-8 rounded-lg border border-slate-200 focus:border-emerald-500 focus:bg-white outline-none">
                    <i data-lucide="search" class="absolute left-2.5 top-3 h-4 w-4 text-slate-400"></i>
                </div>
            </div>

            <!-- Filter Kategori -->
            <div class="space-y-1">
                <label class="block text-[10px] font-bold text-slate-400 uppercase font-mono">Kategori KIB:</label>
                <select name="kategori" onchange="this.form.submit()"
                        class="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-emerald-500 outline-none">
                    <option value="">-- Semua KIB --</option>
                    <option value="KIB A" <?php echo ($filter_kategori==='KIB A')?'selected':''; ?>>KIB A - Tanah</option>
                    <option value="KIB B" <?php echo ($filter_kategori==='KIB B')?'selected':''; ?>>KIB B - Peralatan &amp; Mesin</option>
                    <option value="KIB C" <?php echo ($filter_kategori==='KIB C')?'selected':''; ?>>KIB C - Gedung &amp; Bangunan</option>
                    <option value="KIB D" <?php echo ($filter_kategori==='KIB D')?'selected':''; ?>>KIB D - Jalan, Irigasi &amp; Jembatan</option>
                    <option value="KIB E" <?php echo ($filter_kategori==='KIB E')?'selected':''; ?>>KIB E - Aset Tetap Lainnya</option>
                    <option value="KIB F" <?php echo ($filter_kategori==='KIB F')?'selected':''; ?>>KIB F - Konstruksi DPD</option>
                </select>
            </div>

            <!-- Filter Kondisi -->
            <div class="space-y-1">
                <label class="block text-[10px] font-bold text-slate-400 uppercase font-mono">Kondisi Fisik:</label>
                <select name="kondisi" onchange="this.form.submit()"
                        class="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-emerald-500 outline-none">
                    <option value="">-- Semua Kondisi --</option>
                    <option value="Baik" <?php echo ($filter_kondisi==='Baik')?'selected':''; ?>>Baik</option>
                    <option value="Rusak Ringan" <?php echo ($filter_kondisi==='Rusak Ringan')?'selected':''; ?>>Rusak Ringan</option>
                    <option value="Rusak Berat" <?php echo ($filter_kondisi==='Rusak Berat')?'selected':''; ?>>Rusak Berat</option>
                    <option value="Hilang" <?php echo ($filter_kondisi==='Hilang')?'selected':''; ?>>Hilang</option>
                </select>
            </div>
        </form>
    </div>

    <!-- MAIN DATA VIEW (CARDS / BENTO GRID) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <?php if (empty($assets_list)): ?>
            <div class="md:col-span-3 text-center bg-white p-12 rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
                <i data-lucide="layers-3" class="h-10 w-10 text-slate-300 mx-auto mb-2"></i>
                Tidak menemukan aset terdaftar yang cocok dengan filter pencarian Anda.
            </div>
        <?php else: ?>
            <?php foreach ($assets_list as $asset): ?>
                <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                    
                    <!-- Card Top Area -->
                    <div>
                        <!-- Foto & Kategori header -->
                        <div class="relative h-44 w-full bg-slate-100">
                            <img src="<?php echo htmlspecialchars($asset['foto']); ?>" alt="Foto Aset" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            
                            <div class="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                                <span class="bg-slate-950/70 text-emerald-400 font-bold font-mono text-[10px] px-2 py-0.5 rounded uppercase backdrop-blur-sm">
                                    <?php echo htmlspecialchars($asset['kategori']); ?>
                                </span>
                                
                                <?php if ($asset['kondisi'] === 'Baik'): ?>
                                    <span class="bg-emerald-600 text-white font-bold text-[9.5px] px-2 py-0.5 rounded shadow">Baik</span>
                                <?php elseif ($asset['kondisi'] === 'Rusak Ringan'): ?>
                                    <span class="bg-amber-500 text-white font-bold text-[9.5px] px-2 py-0.5 rounded shadow">Rusak Ringan</span>
                                <?php else: ?>
                                    <span class="bg-rose-600 text-white font-bold text-[9.5px] px-2 py-0.5 rounded shadow"><?php echo htmlspecialchars($asset['kondisi']); ?></span>
                                <?php endif; ?>
                            </div>

                            <span class="absolute bottom-3 left-3 text-xs font-bold text-white font-mono bg-slate-900/60 p-0.5 px-2 rounded">
                                ID: <?php echo htmlspecialchars($asset['id']); ?>
                            </span>
                        </div>

                        <!-- Info details -->
                        <div class="p-4 space-y-3">
                            <div>
                                <span class="text-[10px] text-slate-400 font-mono block">Kode: <?php echo htmlspecialchars($asset['kode_barang']); ?></span>
                                <h3 class="text-sm font-black text-slate-900 leading-tight mt-0.5 h-10 line-clamp-2" title="<?php echo htmlspecialchars($asset['nama_barang']); ?>">
                                    <?php echo htmlspecialchars($asset['nama_barang']); ?>
                                </h3>
                            </div>

                            <!-- Detail spesifikasi dinamis -->
                            <div class="grid grid-cols-2 gap-2 text-[10.5px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-sans">
                                <div>Tahun: <strong class="text-slate-800 font-semibold"><?php echo htmlspecialchars($asset['tahun']); ?></strong></div>
                                <div>Lokasi: <span class="text-slate-800 font-semibold truncate block" title="<?php echo htmlspecialchars($asset['lokasi']); ?>"><?php echo htmlspecialchars($asset['lokasi']); ?></span></div>
                                <?php if (!empty($asset['merk'])): ?>
                                    <div class="col-span-2">Merk: <strong class="text-slate-800"><?php echo htmlspecialchars($asset['merk']); ?></strong></div>
                                <?php endif; ?>
                                <?php if (!empty($asset['luas'])): ?>
                                    <div>Luas: <strong class="text-slate-800"><?php echo htmlspecialchars($asset['luas']); ?></strong></div>
                                <?php endif; ?>
                                <?php if (!empty($asset['sertifikat'])): ?>
                                    <div class="col-span-2 text-[9.5px] truncate" title="Sertifikat: <?php echo htmlspecialchars($asset['sertifikat']); ?>">Sert: <code class="bg-white p-0.5 px-1 border rounded"><?php echo htmlspecialchars($asset['sertifikat']); ?></code></div>
                                <?php endif; ?>
                            </div>

                            <?php if (!empty($asset['keterangan'])): ?>
                                <p class="text-[10.5px] text-slate-400 italic leading-snug line-clamp-2">"<?php echo htmlspecialchars($asset['keterangan']); ?>"</p>
                            <?php endif; ?>
                        </div>
                    </div>

                    <!-- Value & Actions Bottom Area -->
                    <div class="p-4 pt-0 border-t border-slate-100 mt-2">
                        <div class="flex justify-between items-center py-2.5">
                            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Nilai Buku Aset:</span>
                            <span class="text-xs font-black text-emerald-600"><?php echo formatRupiah($asset['nilai']); ?></span>
                        </div>

                        <!-- Card Action Buttons -->
                        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-1 border-t border-slate-50">
                            <!-- View Detail -->
                            <button onclick="viewAsset(<?php echo htmlspecialchars(json_encode($asset)); ?>)" 
                                    class="rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-1.5 text-[10px] font-bold inline-flex items-center justify-center gap-1 cursor-pointer transition">
                                <i data-lucide="eye" class="h-3.5 w-3.5"></i> View
                            </button>

                            <?php if ($_SESSION['user_role'] === 'Administrator' || $_SESSION['user_role'] === 'Operator Desa'): ?>
                                <!-- Edit Detail -->
                                <button onclick="editAsset(<?php echo htmlspecialchars(json_encode($asset)); ?>)" 
                                        class="rounded bg-sky-50 hover:bg-sky-100 text-sky-700 py-1.5 text-[10px] font-bold inline-flex items-center justify-center gap-1 cursor-pointer transition">
                                    <i data-lucide="edit-3" class="h-3.5 w-3.5"></i> Edit
                                </button>
                                
                                <a href="assets.php?delete=<?php echo htmlspecialchars($asset['id']); ?>" 
                                   onclick="return confirm('Apakah Anda yakin ingin menghapus data aset ini secara permanen dari Buku Inventaris?')"
                                   class="rounded bg-rose-50 hover:bg-rose-100 text-rose-600 py-1.5 text-[10px] font-bold inline-flex items-center justify-center gap-1 cursor-pointer transition">
                                    <i data-lucide="trash-2" class="h-3.5 w-3.5"></i> Hapus
                                </a>
                            <?php else: ?>
                                <button disabled class="rounded bg-slate-50 text-slate-300 py-1.5 text-[10px] font-semibold inline-flex items-center justify-center gap-1 cursor-not-allowed">
                                    <i data-lucide="lock" class="h-3.5 w-3.5"></i> Edit
                                </button>
                                <button disabled class="rounded bg-slate-50 text-slate-300 py-1.5 text-[10px] font-semibold inline-flex items-center justify-center gap-1 cursor-not-allowed">
                                    <i data-lucide="lock" class="h-3.5 w-3.5"></i> Del
                                </button>
                            <?php endif; ?>

                            <!-- QR code modal key -->
                            <button onclick="openQRModal('<?php echo htmlspecialchars($asset['id']); ?>', '<?php echo htmlspecialchars($asset['nama_barang']); ?>', '<?php echo htmlspecialchars($asset['kode_barang']); ?>')" 
                                    class="rounded bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 text-[10px] font-bold inline-flex items-center justify-center gap-1 cursor-pointer transition">
                                <i data-lucide="qr-code" class="h-3.5 w-3.5"></i> QR code
                            </button>
                        </div>
                    </div>

                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <!-- MODAL POPUP: REGISTRASI ASET BARU -->
    <div id="add-asset-modal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 animate-scale-up text-left shadow-2xl">
            <div class="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 class="text-sm font-black text-slate-900 uppercase">Form Registrasi Aset Baru Rarang Selatan</h3>
                <button onclick="document.getElementById('add-asset-modal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600">
                    <i data-lucide="x" class="h-5 w-5"></i>
                </button>
            </div>

            <form action="" method="POST" id="form-asset" class="space-y-4 text-xs">
                <input type="hidden" name="action" id="form-action-asset" value="insert">
                <input type="hidden" name="id" id="form-asset-id" value="">

                <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Kategori KIB:</label>
                        <select name="kategori" required
                                class="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                            <option value="">-- Pilih Buku KIB --</option>
                            <option value="KIB A">KIB A - Tanah</option>
                            <option value="KIB B">KIB B - Peralatan &amp; Mesin</option>
                            <option value="KIB C">KIB C - Gedung &amp; Bangunan</option>
                            <option value="KIB D">KIB D - Jalan, Irigasi &amp; Jembatan</option>
                            <option value="KIB E">KIB E - Aset Tetap Lainnya</option>
                            <option value="KIB F">KIB F - Konstruksi DPD</option>
                        </select>
                    </div>

                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Jenis Kode Rekening (Permendagri 47):</label>
                        <select name="kode_barang" required
                                class="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                            <option value="">-- Pilih Referensi Kode --</option>
                            <?php foreach ($ref_kode_barang_list as $ref): ?>
                                <option value="<?php echo htmlspecialchars($ref['kode']); ?>">
                                    [<?php echo htmlspecialchars($ref['kode']); ?>] <?php echo htmlspecialchars($ref['nama']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>

                <div class="space-y-1">
                    <label class="block font-bold text-slate-700 uppercase">Nama Lengkap Aset:</label>
                    <input type="text" name="nama_barang" placeholder="Contoh: Gedung Kantor BPD Rarang" required
                           class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                </div>

                <div class="grid grid-cols-3 gap-3">
                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Tahun Perolehan:</label>
                        <input type="number" name="tahun" value="<?php echo date('Y'); ?>" required
                               class="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                    </div>

                    <div class="space-y-1 col-span-2">
                        <label class="block font-bold text-slate-700 uppercase">Nilai Aset (Rupiah):</label>
                        <input type="number" name="nilai" value="0" required
                               class="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Merk / Model:</label>
                        <input type="text" name="merk" placeholder="Isi jika KIB B"
                               class="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                    </div>

                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Lokasi Penempatan:</label>
                        <select name="lokasi" required
                                class="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                            <option value="">-- Pilih Lokasi --</option>
                            <?php foreach ($ruangan_list as $ruang): ?>
                                <option value="<?php echo htmlspecialchars($ruang['nama_ruangan']); ?>">
                                    <?php echo htmlspecialchars($ruang['nama_ruangan']); ?> (<?php echo htmlspecialchars($ruang['lokasi']); ?>)
                                </option>
                            <?php endforeach; ?>
                            <option value="Sektor Pertanian Dusun Orong">Sektor Pertanian Dusun Orong</option>
                            <option value="Sektor Logistik Desa">Sektor Logistik Desa</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-3">
                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Kondisi:</label>
                        <select name="kondisi" class="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                            <option value="Baik">Baik</option>
                            <option value="Rusak Ringan">Rusak Ringan</option>
                            <option value="Rusak Berat">Rusak Berat</option>
                            <option value="Hilang">Hilang</option>
                        </select>
                    </div>

                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Luas (misal: 100 m2):</label>
                        <input type="text" name="luas" placeholder="Untuk KIB A/C"
                               class="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                    </div>

                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Sertifikat Hak Pakai:</label>
                        <input type="text" name="sertifikat" placeholder="No. Sertifikat"
                               class="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Garis Lintang (Latitude):</label>
                        <input type="text" name="latitude" placeholder="Contoh: -8.6276"
                               class="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                    </div>

                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Garis Bujur (Longitude):</label>
                        <input type="text" name="longitude" placeholder="Contoh: 116.3458"
                               class="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                    </div>
                </div>

                <div class="space-y-1">
                    <label class="block font-bold text-slate-700 uppercase">URL Link Foto Aset:</label>
                    <input type="url" name="foto" placeholder="https://..."
                           class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                </div>

                <div class="space-y-1">
                    <label class="block font-bold text-slate-700 uppercase">Keterangan Tambahan / Riwayat:</label>
                    <textarea name="keterangan" rows="2" placeholder="Catatan asalnya, hibah daerah atau realisasi APBDes..."
                              class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500"></textarea>
                </div>

                <div class="flex gap-3 pt-3">
                    <button type="submit" 
                            class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold p-3 rounded-lg text-xs cursor-pointer transition">
                        Simpan Registrasi KIB
                    </button>
                    <button type="button" onclick="document.getElementById('add-asset-modal').classList.add('hidden')"
                            class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-3 px-6 rounded-lg text-xs cursor-pointer transition">
                        Batal
                    </button>
                </div>

            </form>
        </div>
    </div>

    <!-- MODAL POPUP: PRINT QR CODE -->
    <div id="qr-modal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl border border-slate-200 p-8 max-w-xs w-full text-center space-y-5 animate-scale-up">
            <h3 class="text-xs font-black text-slate-900 uppercase">LABEL SCANNER QR-CODE KIB</h3>
            
            <!-- Real physical label frame -->
            <div id="printable-qr-frame" class="border-2 border-slate-900 p-4 rounded-xl space-y-3 bg-white block">
                <span class="block text-[8px] font-black tracking-widest text-[#059669] uppercase font-mono leading-none">SIPADES SMART LOGS</span>
                <span class="block text-[8px] font-bold text-slate-500 uppercase leading-none font-mono">PEMDES RARANG SELATAN</span>
                
                <!-- QR visual box generator using qrserver api -->
                <div class="h-32 w-32 bg-slate-50 rounded-lg border border-slate-100 mx-auto flex items-center justify-center p-2">
                    <img id="qr-image-src" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TEST-DATA" alt="Aset QR LOGS" class="h-full w-full object-contain">
                </div>
                
                <div class="space-y-0.5">
                    <span id="qr-asset-id" class="block font-mono text-[9px] font-bold text-slate-800 leading-none">ID-00000</span>
                    <span id="qr-asset-name" class="block text-[9.5px] font-black text-slate-900 mt-0.5 leading-tight truncate">NAMA BARANG</span>
                    <span id="qr-asset-code" class="block text-[7.5px] font-semibold text-slate-400 font-mono leading-none">00.00.00.00</span>
                </div>
            </div>

            <div class="flex gap-2">
                <button onclick="window.print()" class="flex-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2 px-4 text-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer">
                    <i data-lucide="printer" class="h-4 w-4"></i> Cetak Label
                </button>
                <button onclick="document.getElementById('qr-modal').classList.add('hidden')" class="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-2 px-4 text-xs transition cursor-pointer">
                    Tutup
                </button>
            </div>
        </div>
    </div>

</div>

<!-- QR Helper Script -->
<script>
    function openQRModal(id, name, code) {
        document.getElementById('qr-asset-id').innerText = id;
        document.getElementById('qr-asset-name').innerText = name;
        document.getElementById('qr-asset-code').innerText = code;
        
        // Buat dynamic QR code payload
        const qrPayload = encodeURIComponent(`PEMDES RARANG SELATAN - Aset ID: ${id}\nNama: ${name}\nKlasifikasi: ${code}`);
        document.getElementById('qr-image-src').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrPayload}`;
        
        document.getElementById('qr-modal').classList.remove('hidden');
    }

    function editAsset(asset) {
        const form = document.querySelector('#form-asset');
        document.querySelector('#form-action-asset').value = 'update';
        document.querySelector('#form-asset-id').value = asset.id;
        
        form.querySelector('[name="kategori"]').value = asset.kategori || '';
        form.querySelector('[name="kode_barang"]').value = asset.kode_barang || '';
        form.querySelector('[name="nama_barang"]').value = asset.nama_barang || '';
        form.querySelector('[name="tahun"]').value = asset.tahun || '';
        form.querySelector('[name="nilai"]').value = asset.nilai || 0;
        form.querySelector('[name="kondisi"]').value = asset.kondisi || '';
        form.querySelector('[name="merk"]').value = asset.merk || '';
        form.querySelector('[name="luas"]').value = asset.luas || '';
        form.querySelector('[name="panjang"]').value = asset.panjang || '';
        form.querySelector('[name="sertifikat"]').value = asset.sertifikat || '';
        form.querySelector('[name="progress"]').value = asset.progress || '';
        form.querySelector('[name="lokasi"]').value = asset.lokasi || '';
        form.querySelector('[name="latitude"]').value = asset.latitude || '';
        form.querySelector('[name="longitude"]').value = asset.longitude || '';
        form.querySelector('[name="keterangan"]').value = asset.keterangan || '';
        form.querySelector('[name="foto"]').value = asset.foto || '';

        // Reset submit button text
        const btnSubmit = form.querySelector('button[type="submit"]');
        if (btnSubmit) btnSubmit.innerText = 'Perbarui Data Aset';
        
        // Change Title
        document.querySelector('#add-asset-modal h3').innerText = 'Form Perbaikan Data Aset';
        
        // Un-disable all fields in case it was disabled by view mode
        Array.from(form.elements).forEach(el => el.disabled = false);

        document.getElementById('add-asset-modal').classList.remove('hidden');
    }

    function viewAsset(asset) {
        editAsset(asset); // Populate fields exactly like edit
        
        // Change Modal properties for purely viewing
        document.querySelector('#add-asset-modal h3').innerText = 'Rincian Lengkap Data Aset';
        
        const form = document.querySelector('#form-asset');
        const btnSubmit = form.querySelector('button[type="submit"]');
        if (btnSubmit) btnSubmit.style.display = 'none'; // Hide submit button for viewing
        
        // Make all read only
        Array.from(form.elements).forEach(el => {
            if(el.tagName !== 'BUTTON') {
                el.disabled = true;
            }
        });
    }

    // Must handle modal reset on close since we disable fields in view mode
    const origCloseAsset = document.querySelector('#add-asset-modal button[onclick*="add-asset-modal"]').getAttribute('onclick');
    document.querySelector('#add-asset-modal button[onclick*="add-asset-modal"]').onclick = function() {
        document.getElementById('add-asset-modal').classList.add('hidden');
        document.querySelector('#form-asset').reset();
        document.querySelector('#form-action-asset').value = 'insert';
        document.querySelector('#form-asset-id').value = '';
        Array.from(document.querySelector('#form-asset').elements).forEach(el => el.disabled = false);
        const btnSubmit = document.querySelector('#form-asset button[type="submit"]');
        if (btnSubmit) {
            btnSubmit.style.display = 'block';
            btnSubmit.innerText = 'Simpan ke KIB DPD';
        }
        document.querySelector('#add-asset-modal h3').innerText = 'Form Registrasi Aset Baru Rarang Selatan';
    };
</script>

<?php 
require_once 'footer.php'; 
?>
