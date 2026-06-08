<?php
/**
 * ==============================================================================
 *                       SIPADES SMART v4.5 - APBDES PROCUREMENTS LOGS
 *                 SISTEM INFORMASI PENGELOLAAN ASET DESA RARANG SELATAN
 * ==============================================================================
 */
require_once 'header.php';

$success_msg = "";
$error_msg = "";

// 1. TAMBAH / POSTING PENGADAAN BARU
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'insert') {
    try {
        $id = "PGD-" . rand(1000, 9999);
        $tanggal = safeInput($_POST['tanggal']);
        $kegiatan = safeInput($_POST['kegiatan']);
        $sumber_dana = safeInput($_POST['sumber_dana']);
        $kode_rekening = safeInput($_POST['kode_rekening']);
        $barang = safeInput($_POST['barang']);
        $volume = (int) $_POST['volume'];
        $harga = (double) $_POST['harga'];
        $total = $volume * $harga;
        $lokasi = safeInput($_POST['lokasi']);
        $status = 'Draf'; // Default draf dahulu dan diverifikasi

        if (empty($tanggal) || empty($kegiatan) || empty($barang) || $harga <= 0) {
            $error_msg = "Isian Tanggal, Kegiatan, Nama Barang, dan Harga wajib diisi dengan benar.";
        } else {
            $stmt = $pdo->prepare("INSERT INTO pengadaan (id, tanggal, kegiatan, sumber_dana, kode_rekening, barang, volume, harga, total, lokasi, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $tanggal, $kegiatan, $sumber_dana, $kode_rekening, $barang, $volume, $harga, $total, $lokasi, $status]);
            $success_msg = "Pengadaan APBDes baru berhasil didaftarkan sebagai Draf!";
        }
    } catch (Exception $e) {
        $error_msg = "Terjadi kesalahan: " . $e->getMessage();
    }
}

// 2. VERIFIKASI POSTING (Dari Draf -> Terposting)
if (isset($_GET['approve'])) {
    try {
        $id_to_approve = safeInput($_GET['approve']);
        // Tarik data pengadaan
        $stmt_get = $pdo->prepare("SELECT * FROM pengadaan WHERE id = ?");
        $stmt_get->execute([$id_to_approve]);
        $row = $stmt_get->fetch();

        if ($row && $row['status'] === 'Draf') {
            // Update status pengadaan
            $stmt_post = $pdo->prepare("UPDATE pengadaan SET status = 'Terposting' WHERE id = ?");
            $stmt_post->execute([$id_to_approve]);

            // Duplikasi data secara otomatis sebagai aset KIB B baru
            $new_ast_id = "AST-" . rand(100000, 999999);
            $stmt_dup = $pdo->prepare("INSERT INTO assets (id, kategori, kode_barang, nama_barang, merk, tahun, nilai, lokasi, kondisi, keterangan, foto) VALUES (?, 'KIB B', '02.03.01.04.01', ?, 'Hasil Pengadaan APBDes', ?, ?, ?, 'Baik', ?, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400')");
            
            // Ambil tahun dari tanggal
            $tahun_proc = date('Y', strtotime($row['tanggal']));
            
            $stmt_dup->execute([
                $new_ast_id, 
                $row['barang'], 
                $tahun_proc, 
                $row['total'], 
                $row['lokasi'], 
                "Terdaftar otomatis dari log Siskeudes/Pengadaan APBDes ID: " . $row['id']
            ]);

            $success_msg = "Pengadaan {$id_to_approve} disetujui! Aset berhasil dideploy otomatis ke Buku KIB B dengan ID {$new_ast_id}.";
        }
    } catch (Exception $e) {
        $error_msg = "Prosedur posting gagal: " . $e->getMessage();
    }
}

// 3. READ LIST PENGADAAN
$search = isset($_GET['search']) ? safeInput($_GET['search']) : '';
$query_src = "SELECT * FROM pengadaan WHERE 1=1";
$params = [];

if(!empty($search)) {
    $query_src .= " AND (barang LIKE ? OR kegiatan LIKE ? OR id LIKE ?)";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
}

$query_src .= " ORDER BY tanggal DESC";
$stmt_pgd = $pdo->prepare($query_src);
$stmt_pgd->execute($params);
$procurements_list = $stmt_pgd->fetchAll();

// List Ruangan
$ruangan_list = $pdo->query("SELECT * FROM ruangan ORDER BY nama_ruangan ASC")->fetchAll();
?>

<div class="space-y-6 text-left">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 class="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <i data-lucide="shopping-cart" class="h-5 w-5 text-emerald-600"></i> Log Belanja Pengadaan APBDes
            </h1>
            <p class="text-xs text-slate-500 mt-1">Lacak pencairan dana DDS, ADD, PAD, jembatan penilai, dan integrasikan draf belanja langsung ke Buku KIB Desa.</p>
        </div>
        <button onclick="document.getElementById('add-proc-modal').classList.remove('hidden')" 
                class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2.5 text-xs shadow-md cursor-pointer transition">
            <i data-lucide="plus" class="h-4 w-4 text-emerald-400"></i> Rekam Belanja Baru
        </button>
    </div>

    <!-- Alarm Box -->
    <?php if (!empty($success_msg)): ?>
        <div class="p-4 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-900 text-xs font-bold flex items-start gap-2">
            <i data-lucide="check-circle" class="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5"></i>
            <span><?php echo htmlspecialchars($success_msg); ?></span>
        </div>
    <?php endif; ?>

    <?php if (!empty($error_msg)): ?>
        <div class="p-4 bg-rose-50 border border-rose-150 rounded-xl text-rose-900 text-xs font-bold flex items-start gap-2">
            <i data-lucide="alert-circle" class="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5"></i>
            <span><?php echo htmlspecialchars($error_msg); ?></span>
        </div>
    <?php endif; ?>

    <!-- Search Tool -->
    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-2">
        <form method="GET" class="w-full relative">
            <input type="text" name="search" placeholder="Cari berdasarkan nama barang, dana, kegiatan..." 
                   value="<?php echo htmlspecialchars($search); ?>"
                   class="w-full text-xs p-2.5 pl-9 rounded-lg border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white outline-none">
            <i data-lucide="search" class="absolute left-2.5 top-3 h-4 w-4 text-slate-400"></i>
        </form>
    </div>

    <!-- SQL TABLE LIST -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
                <thead>
                    <tr class="bg-slate-900 text-slate-300 font-bold uppercase text-[9px] font-mono border-b border-slate-800">
                        <th class="p-3">ID Pengadaan</th>
                        <th class="p-3">Tanggal</th>
                        <th class="p-3">Sub Kegiatan</th>
                        <th class="p-3">Rincian Barang</th>
                        <th class="p-3 text-right">Vol &amp; Harga Satuan</th>
                        <th class="p-3 text-right">Total Realisasi</th>
                        <th class="p-3">Lokasi Target</th>
                        <th class="p-3">Status</th>
                        <th class="p-3 text-center">Aksi Dokumen</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-sans text-slate-755">
                    <?php if (empty($procurements_list)): ?>
                        <tr>
                            <td colspan="9" class="p-8 text-center text-slate-400 italic">Belum ada daftar pengadaan terdata.</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($procurements_list as $row): ?>
                            <tr class="hover:bg-slate-50/50">
                                <td class="p-3 font-mono font-bold text-slate-500"><?php echo htmlspecialchars($row['id']); ?></td>
                                <td class="p-3 font-mono"><?php echo htmlspecialchars($row['tanggal']); ?></td>
                                <td class="p-3">
                                    <span class="font-extrabold text-slate-800 block"><?php echo htmlspecialchars($row['kegiatan']); ?></span>
                                    <span class="inline-block mt-1 font-mono text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                        REK: <?php echo htmlspecialchars($row['kode_rekening']); ?>
                                    </span>
                                </td>
                                <td class="p-3 font-semibold text-slate-900"><?php echo htmlspecialchars($row['barang']); ?></td>
                                <td class="p-3 text-right font-mono font-medium">
                                    <?php echo htmlspecialchars($row['volume']); ?> Unit &times;<br>
                                    <span class="text-[10px] text-slate-400"><?php echo formatRupiah($row['harga']); ?></span>
                                </td>
                                <td class="p-3 text-right font-mono font-extrabold text-slate-900">
                                    <?php echo formatRupiah($row['total']); ?><br>
                                    <span class="text-[9.5px] font-extrabold text-emerald-600 bg-emerald-50 px-1 rounded uppercase"><?php echo htmlspecialchars($row['sumber_dana']); ?></span>
                                </td>
                                <td class="p-3 font-medium text-slate-600"><?php echo htmlspecialchars($row['lokasi']); ?></td>
                                <td class="p-3">
                                    <?php if ($row['status'] === 'Draf'): ?>
                                        <span class="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[9.5px] font-bold text-amber-700 animate-pulse border border-amber-200">
                                            DRAF REVIEW
                                        </span>
                                    <?php else: ?>
                                        <span class="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[9.5px] font-bold text-emerald-700 border border-emerald-200">
                                            TERPOSTING KIB
                                        </span>
                                    <?php endif; ?>
                                </td>
                                <td class="p-3 text-center">
                                    <?php if ($row['status'] === 'Draf'): ?>
                                        <?php if ($_SESSION['user_role'] === 'Administrator' || $_SESSION['user_role'] === 'Operator Desa'): ?>
                                            <a href="pengadaan.php?approve=<?php echo htmlspecialchars($row['id']); ?>" 
                                               onclick="return confirm('Apakah Anda yakin setuju memposting ini? Tindakan ini akan menyebarkannya secara otomatis sebagai bagian register Buku KIB B.')"
                                               class="rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1.5 px-2.5 text-[10px] uppercase shadow transition inline-flex items-center gap-1">
                                                <i data-lucide="check" class="h-3 w-3"></i> Posting Aset
                                            </a>
                                        <?php else: ?>
                                            <span class="text-slate-400 italic text-[10px]">Tunggu Admin</span>
                                        <?php endif; ?>
                                    <?php else: ?>
                                        <span class="text-slate-400 font-mono text-[10px] font-bold flex items-center justify-center gap-1">
                                            <i data-lucide="shield-check" class="h-4 w-4 text-emerald-500"></i> Terverifikasi
                                        </span>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- MODAL POPUP: ADD PROCUREMENT -->
    <div id="add-proc-modal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl animate-scale-up text-left">
            <div class="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 class="text-xs font-black text-slate-900 uppercase">Rekam Log Belanja Siskeudes</h3>
                <button onclick="document.getElementById('add-proc-modal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600">
                    <i data-lucide="x" class="h-5 w-5"></i>
                </button>
            </div>

            <form action="" method="POST" class="space-y-4 text-xs pt-2">
                <input type="hidden" name="action" value="insert">

                <div class="space-y-1">
                    <label class="block font-bold text-slate-700 uppercase">Tanggal Belanja Realisasi:</label>
                    <input type="date" name="tanggal" value="<?php echo date('Y-m-d'); ?>" required
                           class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Sumber Anggaran:</label>
                        <select name="sumber_dana" required class="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                            <option value="DDS">DDS (Dana Desa - APBDes)</option>
                            <option value="ADD">ADD (Alokasi Dana Desa)</option>
                            <option value="PAD">PAD (Pendapatan Asli Desa)</option>
                            <option value="PBP">PBP (Bantuan Keuangan Provinsi)</option>
                        </select>
                    </div>

                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Kode Rekening Sub:</label>
                        <input type="text" name="kode_rekening" value="2.01.02.5.2.3.01" required
                               class="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                    </div>
                </div>

                <div class="space-y-1">
                    <label class="block font-bold text-slate-700 uppercase">Kategori Sub Kegiatan:</label>
                    <input type="text" name="kegiatan" placeholder="Contoh: Pembinaan Kelembagaan Desa" required
                           class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                </div>

                <div class="space-y-1">
                    <label class="block font-bold text-slate-700 uppercase">Nama Barang / Belanja Modal:</label>
                    <input type="text" name="barang" placeholder="Contoh: AC Aula Daikin 2 PK" required
                           class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Volume (Pcs/Unit):</label>
                        <input type="number" name="volume" value="1" min="1" required
                               class="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                    </div>

                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Harga Satuan (Rp):</label>
                        <input type="number" name="harga" placeholder="Contoh: 4500000" required
                               class="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                    </div>
                </div>

                <div class="space-y-1">
                    <label class="block font-bold text-slate-700 uppercase">Kamar / Lokasi Penempatan Sasaran:</label>
                    <select name="lokasi" required class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                        <?php foreach($ruangan_list as $ruang): ?>
                            <option value="<?php echo htmlspecialchars($ruang['nama_ruangan']); ?>">
                                <?php echo htmlspecialchars($ruang['nama_ruangan']); ?>
                            </option>
                        <?php endforeach; ?>
                        <option value="Sektor Logistik Desa">Sektor Logistik Desa</option>
                    </select>
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="submit" class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-extrabold p-3 rounded-lg text-xs cursor-pointer transition">
                        Daftarkan Belanja Modal
                    </button>
                    <button type="button" onclick="document.getElementById('add-proc-modal').classList.add('hidden')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-3 px-6 rounded-lg text-xs cursor-pointer transition">
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
