<?php
/**
 * ==============================================================================
 *                       SIPADES SMART v4.5 - DYNAMIC CONSUMABLES INVENTORY
 *                 SISTEM INFORMASI PENGELOLAAN ASET DESA RARANG SELATAN
 * ==============================================================================
 */
require_once 'header.php';

$success_msg = "";
$error_msg = "";

// 1. TAMBAH TRANSAKSI BARU (MEMUTAR JALUR STOK SISA SECARA OTOMATIS)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'insert') {
    try {
        $id = "PSD-" . rand(1000, 9999);
        $tanggal = safeInput($_POST['tanggal']);
        $nama_barang = safeInput($_POST['nama_barang']);
        $tipe = safeInput($_POST['tipe']); // Masuk / Keluar
        $jumlah = (int) $_POST['jumlah'];
        $penerima = safeInput($_POST['penerima']);
        $keterangan = safeInput($_POST['keterangan']);

        if (empty($tanggal) || empty($nama_barang) || empty($tipe) || $jumlah <= 0) {
            $error_msg = "Isian Tanggal, Nama Barang, Tipe Alur, dan Jumlah wajib diisi.";
        } else {
            // Ambil transaksi terakhir untuk barang ini untuk menghitung sisa stok
            $stmt_last = $pdo->prepare("SELECT stok_sisa FROM persediaan WHERE nama_barang = ? ORDER BY tanggal DESC, id DESC LIMIT 1");
            $stmt_last->execute([$nama_barang]);
            $last_row = $stmt_last->fetch();
            $last_stok = $last_row ? (int)$last_row['stok_sisa'] : 0;

            // Hitung stok baru
            if ($tipe === 'Masuk') {
                $stok_sisa = $last_stok + $jumlah;
            } else { // Keluar
                if ($jumlah > $last_stok) {
                    throw new Exception("Keluar bermasalah: Jumlah penarikan ({$jumlah} unit) melebihi batas stok sisa yang tersedia ({$last_stok} unit).");
                }
                $stok_sisa = $last_stok - $jumlah;
            }

            // Simpan transaksi
            $stmt_insert = $pdo->prepare("INSERT INTO persediaan (id, tanggal, nama_barang, tipe, jumlah, penerima, stok_sisa, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt_insert->execute([$id, $tanggal, $nama_barang, $tipe, $jumlah, $penerima ?: null, $stok_sisa, $keterangan]);
            
            $success_msg = "Alur persediaan {$nama_barang} berhasil direkam! Sisa stok terkalkulasi otomatis: {$stok_sisa} unit.";
        }
    } catch (Exception $e) {
        $error_msg = "Gagal memproses alur: " . $e->getMessage();
    }
}

// 2. AMBIL LOG AKTIVITAS PERSEDIAAN
$search = isset($_GET['search']) ? safeInput($_GET['search']) : '';
$query_str = "SELECT * FROM persediaan WHERE 1=1";
$params = [];

if (!empty($search)) {
    $query_str .= " AND (nama_barang LIKE ? OR penerima LIKE ?)";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
}

$query_str .= " ORDER BY tanggal DESC, id DESC";
$stmt_psd = $pdo->prepare($query_str);
$stmt_psd->execute($params);
$logs_persediaan = $stmt_psd->fetchAll();

// 3. DAFTAR SUMMARY STOK SAAT INI (REKAP UNIK)
$stmt_rekap = $pdo->query("SELECT nama_barang, SUM(CASE WHEN tipe = 'Masuk' THEN jumlah ELSE 0 END) - SUM(CASE WHEN tipe = 'Keluar' THEN jumlah ELSE 0 END) as stok_akhir FROM persediaan GROUP BY nama_barang");
$rekap_stok = $stmt_rekap->fetchAll();
?>

<div class="space-y-6 text-left">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 class="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <i data-lucide="package" class="h-5 w-5 text-emerald-600"></i> Gudang Logistik &amp; Persediaan Habis Pakai
            </h1>
            <p class="text-xs text-slate-500 mt-1">Mengawasi ketersediaan ATK sekretariat, bantuan bibit pertanian, ketahanan pangan, bahan rehabilitasi, dll.</p>
        </div>
        <button onclick="document.getElementById('add-stock-modal').classList.remove('hidden')" 
                class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2.5 text-xs shadow-md transition duration-150 cursor-pointer">
            <i data-lucide="arrow-left-right" class="h-4 w-4 text-emerald-400"></i> Rekam transaksi Gudang
        </button>
    </div>

    <!-- Feedback banner -->
    <?php if (!empty($success_msg)): ?>
        <div class="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs font-bold flex items-center gap-2">
            <i data-lucide="check-circle" class="h-4.5 w-4.5 text-emerald-600 shrink-0"></i>
            <span><?php echo htmlspecialchars($success_msg); ?></span>
        </div>
    <?php endif; ?>

    <?php if (!empty($error_msg)): ?>
        <div class="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-xs font-bold flex items-center gap-2">
            <i data-lucide="alert-circle" class="h-4.5 w-4.5 text-rose-600 shrink-0"></i>
            <span><?php echo htmlspecialchars($error_msg); ?></span>
        </div>
    <?php endif; ?>

    <!-- Summary Stock Panels -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Interactive form table summary of actual products stock -->
        <div class="md:col-span-1 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 class="text-xs font-black text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <i data-lucide="boxes" class="h-4.5 w-4.5 text-emerald-600"></i> Posisi Persediaan Saat Ini
            </h3>
            
            <div class="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                <?php if (empty($rekap_stok)): ?>
                    <p class="text-xs text-slate-400 italic text-center py-6">Belum ada stok terekam.</p>
                <?php else: ?>
                    <?php foreach ($rekap_stok as $item): ?>
                        <div class="p-3 bg-slate-50 border border-slate-150 rounded-lg flex justify-between items-center text-xs">
                            <span class="font-extrabold text-slate-800 truncate pr-2 max-w-[150px] block" title="<?php echo htmlspecialchars($item['nama_barang']); ?>">
                                <?php echo htmlspecialchars($item['nama_barang']); ?>
                            </span>
                            <span class="font-mono font-black rounded px-2.5 py-1 text-slate-900 border <?php echo $item['stok_akhir'] > 15 ? 'bg-emerald-50 border-emerald-100 text-emerald-850' : 'bg-rose-50 border-rose-100 text-rose-850'; ?>">
                                <?php echo number_format($item['stok_akhir']); ?> unit
                            </span>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>

        <!-- History Ledger lists -->
        <div class="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div class="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span class="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-lucide="clipboard-list" class="h-4.5 w-4.5 text-emerald-600"></i> Buku Kendali Alur Logistik
                </span>
                
                <!-- Simple live filter layout -->
                <form method="GET" class="relative max-w-xs w-full">
                    <input type="text" name="search" placeholder="Cari nama barang..." value="<?php echo htmlspecialchars($search); ?>"
                           class="w-full text-[11px] p-2 pl-8 rounded-md border border-slate-200 outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white">
                    <i data-lucide="search" class="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400"></i>
                </form>
            </div>

            <div class="overflow-x-auto flex-1">
                <table class="w-full text-xs text-left">
                    <thead>
                        <tr class="bg-slate-50 text-slate-400 font-bold uppercase text-[9.5px] border-b border-slate-150">
                            <th class="p-3">Tanggal</th>
                            <th class="p-3">Rincian Barang</th>
                            <th class="p-3 text-center">Tipe Alur</th>
                            <th class="p-3 text-right">Volume</th>
                            <th class="p-3 text-right">Sisa Lapangan</th>
                            <th class="p-3">Penerima / Ket</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-600 leading-normal">
                        <?php if (empty($logs_persediaan)): ?>
                            <tr>
                                <td colspan="6" class="p-8 text-center text-slate-400 italic">Belum ada transaksi keluar-masuk logistik.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($logs_persediaan as $row): ?>
                                <tr class="hover:bg-slate-50/50">
                                    <td class="p-3 font-mono text-slate-500 font-bold"><?php echo htmlspecialchars($row['tanggal']); ?></td>
                                    <td class="p-3 font-extrabold text-slate-800"><?php echo htmlspecialchars($row['nama_barang']); ?></td>
                                    <td class="p-3 text-center">
                                        <?php if ($row['tipe'] === 'Masuk'): ?>
                                            <span class="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[9.5px] border border-emerald-200">MASUK</span>
                                        <?php else: ?>
                                            <span class="bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded text-[9.5px] border border-rose-200">KELUAR</span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="p-3 text-right font-mono font-bold text-slate-900"><?php echo number_format($row['jumlah']); ?> unit</td>
                                    <td class="p-3 text-right font-mono font-extrabold text-slate-700 bg-slate-50 mb-1"><?php echo number_format($row['stok_sisa']); ?> unit</td>
                                    <td class="p-3 max-w-[150px] truncate">
                                        <?php if ($row['penerima']): ?>
                                            <span class="block font-semibold text-slate-700 truncate" title="Penerima: <?php echo htmlspecialchars($row['penerima']); ?>">P: <?php echo htmlspecialchars($row['penerima']); ?></span>
                                        <?php endif; ?>
                                        <span class="block text-[10px] text-slate-400 italic truncate" title="<?php echo htmlspecialchars($row['keterangan']); ?>"><?php echo htmlspecialchars($row['keterangan']); ?></span>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

    </div>

    <!-- MODAL POPUP: INVENTORY TRANSACTION FORM -->
    <div id="add-stock-modal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl animate-scale-up text-left">
            <div class="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 class="text-xs font-black text-slate-900 uppercase">Input Alur Logistik / ATK</h3>
                <button onclick="document.getElementById('add-stock-modal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600">
                    <i data-lucide="x" class="h-5 w-5"></i>
                </button>
            </div>

            <form action="" method="POST" class="space-y-4 text-xs pt-1">
                <input type="hidden" name="action" value="insert">

                <div class="space-y-1">
                    <label class="block font-bold text-slate-700 uppercase">Tanggal Alur:</label>
                    <input type="date" name="tanggal" value="<?php echo date('Y-m-d'); ?>" required
                           class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                </div>

                <div class="space-y-1">
                    <label class="block font-bold text-slate-700 uppercase">Nama Barang / ATK / Bahan pangan:</label>
                    <input type="text" name="nama_barang" placeholder="Contoh: Bibit Jagung Hibrida Premium" required list="opsi-produk-gudang"
                           class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                    <datalist id="opsi-produk-gudang">
                        <option value="Bibit Jagung Hibrida Premium">
                        <option value="Kertas HVS A4 Sinar Dunia 80gr">
                        <option value="Tinta Printer Epson Black T6641">
                        <option value="Bantuan Beras Miskin Desa Rerang">
                    </datalist>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Pilih Jenis Alur:</label>
                        <select name="tipe" required class="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 font-bold text-slate-800">
                            <option value="Masuk">MASUK (Tambah Stok)</option>
                            <option value="Keluar">KELUAR (Kurangi Stok)</option>
                        </select>
                    </div>

                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Volume Jumlah:</label>
                        <input type="number" name="jumlah" value="10" min="1" required
                               class="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                    </div>
                </div>

                <div class="space-y-1">
                    <label class="block font-bold text-slate-700 uppercase">Nama Penerima (Hanya untuk opsi KELUAR):</label>
                    <input type="text" name="penerima" placeholder="Contoh: Kelompok Tani Harapan / Sie Layanan"
                           class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                </div>

                <div class="space-y-1">
                    <label class="block font-bold text-slate-700 uppercase">Keterangan / Dokumen Sumber:</label>
                    <textarea name="keterangan" rows="2" placeholder="Catatan asalnya, hibah, belanja sekretariat..."
                              class="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500"></textarea>
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="submit" class="flex-1 bg-slate-900 hover:bg-slate-850 text-white font-extrabold p-3 rounded-lg text-xs cursor-pointer transition">
                        Simpan Transaksi
                    </button>
                    <button type="button" onclick="document.getElementById('add-stock-modal').classList.add('hidden')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-3 px-6 rounded-lg text-xs cursor-pointer transition">
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
