<?php
/**
 * ==============================================================================
 *                       SIPADES SMART v4.5 - REFERENSI KODE BARANG
 *                 SISTEM INFORMASI PENGELOLAAN ASET DESA RARANG SELATAN
 * ==============================================================================
 */
require_once 'header.php';

$success_msg = "";
$error_msg = "";

// 1. OPERATION SUBMISSIONS
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    try {
        $action = $_POST['action'];

        if ($action === 'insert') {
            $id = "KB-CUST-" . rand(1000, 9999);
            $kode = safeInput($_POST['kode']);
            $nama = safeInput($_POST['nama']);
            $kategori = safeInput($_POST['kategori']);
            $keterangan = safeInput($_POST['keterangan']);
            $is_custom = 1;

            if (empty($kode) || empty($nama) || empty($kategori)) {
                throw new Exception("Kolom Kode Barang, Nama Klasifikasi, dan Kategori Klasifikasi wajib diisi!");
            }

            // Validasi duplikasi kode
            $stmt_chk = $pdo->prepare("SELECT id FROM ref_kode_barang WHERE kode = ?");
            $stmt_chk->execute([$kode]);
            if ($stmt_chk->fetch()) {
                throw new Exception("Sandi kode barang [{$kode}] sudah terdaftar di database sebelumnya!");
            }

            $stmt_ins = $pdo->prepare("INSERT INTO ref_kode_barang (id, kode, nama, kategori, keterangan, is_custom) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt_ins->execute([$id, $kode, $nama, $kategori, $keterangan ?: "Custom classification entry.", $is_custom]);

            $success_msg = "Klasifikasi kustom baru [{$nama}] dengan sandi {$kode} berhasil didaftarkan.";
        }
        elseif ($action === 'update') {
            $id = safeInput($_POST['id']);
            $kode = safeInput($_POST['kode']);
            $nama = safeInput($_POST['nama']);
            $kategori = safeInput($_POST['kategori']);
            $keterangan = safeInput($_POST['keterangan']);

            if (empty($id) || empty($kode) || empty($nama) || empty($kategori)) {
                throw new Exception("Kolom data edit perbaikan belum lengkap!");
            }

            // Validasi duplikasi kode pada ID berbeda
            $stmt_chk = $pdo->prepare("SELECT id FROM ref_kode_barang WHERE kode = ? AND id != ?");
            $stmt_chk->execute([$kode, $id]);
            if ($stmt_chk->fetch()) {
                throw new Exception("Gagal. Sandi klasifikasi {$kode} sudah digunakan oleh klasifikasi lain.");
            }

            $stmt_upd = $pdo->prepare("UPDATE ref_kode_barang SET kode = ?, nama = ?, kategori = ?, keterangan = ? WHERE id = ?");
            $stmt_upd->execute([$kode, $nama, $kategori, $keterangan, $id]);

            $success_msg = "Sandi klasifikasi ID {$id} sukses diperbarui.";
        }
        elseif ($action === 'delete') {
            $id = safeInput($_POST['id']);

            // Pastikan tidak dikaitkan dengan aset fisik apapun untuk mencegah error FK
            $stmt_chk_usage = $pdo->prepare("SELECT a.id FROM assets a JOIN ref_kode_barang kb ON a.kode_barang = kb.kode WHERE kb.id = ? LIMIT 1");
            $stmt_chk_usage->execute([$id]);
            if ($stmt_chk_usage->fetch()) {
                throw new Exception("Sandi klasifikasi tidak diperkenankan untuk dihapus karena sedang dikaitkan secara aktif dengan aset fisik di register KIB!");
            }

            $stmt_del = $pdo->prepare("DELETE FROM ref_kode_barang WHERE id = ?");
            $stmt_del->execute([$id]);

            $success_msg = "Klasifikasi kustom berhasil dicabut dari referensi.";
        }
        elseif ($action === 'import') {
            if (!isset($_FILES['csv_file']) || $_FILES['csv_file']['error'] !== UPLOAD_ERR_OK) {
                throw new Exception("File CSV tidak valid atau belum dipilih.");
            }

            $csvMimes = ['text/csv', 'application/csv', 'application/vnd.ms-excel', 'text/plain'];
            // Validasi file
            $fileHandle = fopen($_FILES['csv_file']['tmp_name'], 'r');
            if (!$fileHandle) {
                throw new Exception("Gagal membaca file CSV.");
            }

            // check headers or skip
            $first_row = fgetcsv($fileHandle, 1000, ",");
            if (isset($first_row[0]) && strtolower(trim($first_row[0])) == 'kode') {
                // Header row skipped
            } else {
                fseek($fileHandle, 0); // Reset pointer jika bukan header
            }

            $imported_count = 0;
            $pdo->beginTransaction();
            
            $stmt_insert = $pdo->prepare("INSERT INTO ref_kode_barang (id, kode, nama, kategori, keterangan, is_custom) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt_check = $pdo->prepare("SELECT id FROM ref_kode_barang WHERE kode = ?");

            while (($data = fgetcsv($fileHandle, 1000, ",")) !== FALSE) {
                if (count($data) < 3) continue; // Skip baris kurang kolom (kode, nama, kategori)
                
                $kode = trim($data[0]);
                $nama = trim($data[1]);
                $kategori = trim($data[2]);
                $keterangan = isset($data[3]) ? trim($data[3]) : '';
                
                if(empty($kode) || empty($nama) || empty($kategori)) continue;

                $stmt_check->execute([$kode]);
                if (!$stmt_check->fetch()) {
                    $id = "KB-CUST-IMP" . rand(100, 999) . $imported_count;
                    $stmt_insert->execute([$id, $kode, $nama, $kategori, $keterangan, 1]);
                    $imported_count++;
                }
            }
            fclose($fileHandle);
            $pdo->commit();
            $success_msg = "Berhasil mengimpor {$imported_count} kode klasifikasi kustom dari file CSV.";
        }
    } catch (Exception $e) {
        $error_msg = "Gagal memproses alur modul: " . $e->getMessage();
    }
}

// 2. QUERY DATAS WITH ASSOCIATIVE COUNTS IN REGISTER KIB
$search = isset($_GET['search']) ? safeInput($_GET['search']) : '';
$cat_filter = isset($_GET['cat']) ? safeInput($_GET['cat']) : 'All';

$query_str = "
    SELECT kb.*, COUNT(a.id) as total_assets 
    FROM ref_kode_barang kb 
    LEFT JOIN assets a ON kb.kode = a.kode_barang 
    WHERE 1=1
";
$params = [];

if (!empty($search)) {
    $query_str .= " AND (kb.nama LIKE ? OR kb.kode LIKE ? OR kb.keterangan LIKE ?)";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
}

if ($cat_filter !== 'All') {
    $query_str .= " AND kb.kategori = ?";
    $params[] = $cat_filter;
}

$query_str .= " GROUP BY kb.id ORDER BY kb.kode ASC";
$stmt_kb = $pdo->prepare($query_str);
$stmt_kb->execute($params);
$kode_list = $stmt_kb->fetchAll();

// Statistik Cepat
$total_codes = count($kode_list);
$custom_codes_count = 0;
$active_assoc_codes = 0;
foreach($kode_list as $row) {
    if ($row['is_custom']) {
        $custom_codes_count++;
    }
    if ((int)$row['total_assets'] > 0) {
        $active_assoc_codes++;
    }
}
?>

<div class="space-y-6 text-left">
    <!-- Upper header summary -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div class="space-y-1">
            <div class="flex items-center gap-2">
                <i data-lucide="book-open" class="h-6 w-6 text-blue-905"></i>
                <h2 class="text-xl font-extrabold text-slate-900 tracking-tight uppercase">Kode Klasifikasi Urusan Barang (Kode KIB)</h2>
            </div>
            <p class="text-slate-500 text-xs">
                Referensi pembukuan kode barang resmi sesuai arahan sistem akuntansi Pemkab Lombok Timur &amp; Permendagri No. 47 Tahun 2021 mengenai Penataan Aset Pemerintahan Desa.
            </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
            <button
                onclick="document.getElementById('modal-import').classList.remove('hidden')"
                class="rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-bold py-2.5 px-4 text-xs tracking-wider inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
            >
                <i data-lucide="upload" class="h-4.5 w-4.5"></i> IMPORT CSV
            </button>
            <button
                onclick="openEntryModal()"
                class="rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 px-4 text-xs tracking-wider inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
            >
                <i data-lucide="plus" class="h-4.5 w-4.5"></i> TAMBAH KODE KUSTOM
            </button>
        </div>
    </div>

    <!-- Quick statistics panel cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1 relative overflow-hidden">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Kode Terdaftar Global</span>
            <h3 class="text-2xl font-black text-slate-900 leading-tight"><?php echo $total_codes; ?> <span class="text-xs font-normal text-slate-500">Klasifikasi</span></h3>
            <p class="text-[10px] text-slate-500 font-mono">Permendagri 47/2021 Standard</p>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1 relative overflow-hidden">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Kode Kustom Desa</span>
            <h3 class="text-2xl font-black text-blue-900 leading-tight"><?php echo $custom_codes_count; ?> <span class="text-xs font-normal text-blue-500">Unik</span></h3>
            <p class="text-[10px] text-slate-500 font-mono">Ditambahkan manual oleh operator</p>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1 relative overflow-hidden">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Aplikasi Sinkronisasi Aktif</span>
            <h3 class="text-2xl font-black text-teal-950 leading-tight"><?php echo $active_assoc_codes; ?> <span class="text-xs font-normal text-teal-700">Sandi</span></h3>
            <p class="text-[10px] text-teal-650/90 font-mono">Kode yang berelasi dengan fisik aset</p>
        </div>

        <div class="bg-white border border-teal-200 p-5 bg-teal-50/10 rounded-2xl overflow-hidden relative shadow-sm">
            <span class="text-[10px] font-black text-teal-600 uppercase tracking-widest block font-mono">Oto-Format QR Label</span>
            <h3 class="text-2xl font-black text-emerald-900 leading-tight">100%</h3>
            <p class="text-[10px] text-teal-650 font-mono">QR barcoded sinkron dengan sandi KIB</p>
        </div>
    </div>

    <!-- Controls, filter segments, search engines -->
    <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <form method="GET" class="flex flex-col lg:flex-row gap-3">
            <input type="hidden" name="cat" id="query-cat" value="<?php echo htmlspecialchars($cat_filter); ?>">
            
            <div class="flex-1 relative">
                <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"></i>
                <input 
                    type="text"
                    name="search"
                    placeholder="Saring berdasarkan kode klasifikasi (KIB A-F), nama barang, penataan..."
                    value="<?php echo htmlspecialchars($search); ?>"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                />
            </div>

            <!-- Tab category buttons segments -->
            <div class="flex flex-wrap gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
                <?php foreach(["All", "KIB A", "KIB B", "KIB C", "KIB D", "KIB E", "KIB F"] as $c): ?>
                    <button
                        type="button"
                        onclick="setCategoryFilter('<?php echo $c; ?>')"
                        class="py-1.5 px-3 rounded-lg text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all <?php echo ($cat_filter === $c) ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-850 hover:bg-slate-100'; ?>"
                    >
                        <?php echo ($c === 'All') ? 'Semua Kategori' : $c; ?>
                    </button>
                <?php endforeach; ?>
            </div>
            
            <button type="submit" class="hidden"></button>
        </form>

        <!-- Feedback Messages -->
        <?php if (!empty($success_msg)): ?>
            <div class="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <i data-lucide="check-circle" class="h-4.5 w-4.5 text-emerald-600 shrink-0"></i>
                <span><?php echo htmlspecialchars($success_msg); ?></span>
            </div>
        <?php endif; ?>

        <?php if (!empty($error_msg)): ?>
            <div class="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
                <i data-lucide="alert-circle" class="h-4.5 w-4.5 text-rose-600 shrink-0"></i>
                <span><?php echo htmlspecialchars($error_msg); ?></span>
            </div>
        <?php endif; ?>

        <!-- Table Worksheet Representation -->
        <div class="overflow-x-auto rounded-xl border border-slate-150">
            <table class="w-full text-left border-collapse text-xs">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-150 text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
                        <th class="px-5 py-3.5 text-center">Tipe KIB</th>
                        <th class="px-5 py-3.5">Kode Standardisasi</th>
                        <th class="px-5 py-3.5">Nama Urusan / Klasifikasi</th>
                        <th class="px-5 py-3.5">Keterangan / Fungsi Penataan Teknis</th>
                        <th class="px-5 py-3.5 text-center">Dikaitkan Aset</th>
                        <th class="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-850">
                    <?php if (count($kode_list) > 0): ?>
                        <?php foreach($kode_list as $row): 
                            // Badge colors mapping standard
                            $kategori = $row['kategori'];
                            $kib_badge_style = "bg-slate-50 text-slate-700 border-slate-200";
                            switch($kategori) {
                                case 'KIB A': $kib_badge_style = "bg-blue-50 text-blue-805 border-blue-200"; break;
                                case 'KIB B': $kib_badge_style = "bg-amber-50 text-amber-850 border-amber-200"; break;
                                case 'KIB C': $kib_badge_style = "bg-purple-50 text-purple-800 border-purple-200"; break;
                                case 'KIB D': $kib_badge_style = "bg-emerald-50 text-emerald-800 border-emerald-250"; break;
                                case 'KIB E': $kib_badge_style = "bg-teal-50 text-teal-850 border-teal-200"; break;
                                case 'KIB F': $kib_badge_style = "bg-slate-100 text-slate-800 border-slate-300"; break;
                            }
                        ?>
                            <tr class="hover:bg-slate-50/70 transition-colors">
                                <!-- Badge KIB -->
                                <td class="px-5 py-4 text-center whitespace-nowrap">
                                    <span class="inline-flex items-center justify-center rounded border px-2 py-0.5 text-[9px] font-extrabold font-mono tracking-wider shadow-xxs <?php echo $kib_badge_style; ?>">
                                        <?php echo htmlspecialchars($row['kategori']); ?>
                                    </span>
                                </td>

                                <!-- Code with Copy Trigger -->
                                <td class="px-5 py-4 font-mono font-bold text-slate-900 select-all whitespace-nowrap">
                                    <div class="flex items-center gap-1.5 group font-mono">
                                        <code class="bg-slate-100 px-2 py-1 rounded text-slate-800 border border-slate-200 text-[11px]"><?php echo htmlspecialchars($row['kode']); ?></code>
                                        <button 
                                            type="button" 
                                            onclick="copyToClipboard('<?php echo $row['kode']; ?>')"
                                            title="Copy Sandi Klasifikasi"
                                            class="text-slate-400 hover:text-blue-700 bg-white border border-slate-200 rounded p-1 shadow-xxs cursor-pointer transition-all"
                                        >
                                            <i data-lucide="copy" class="h-3 w-3"></i>
                                        </button>
                                    </div>
                                </td>

                                <!-- Classification Name -->
                                <td class="px-5 py-4 font-semibold text-slate-900 whitespace-normal min-w-[200px]">
                                    <div class="flex items-center gap-1.5">
                                        <span><?php echo htmlspecialchars($row['nama']); ?></span>
                                        <?php if ($row['is_custom']): ?>
                                            <span class="bg-sky-100 text-sky-800 text-[8px] font-black uppercase px-1 rounded-sm border border-sky-200">Custom</span>
                                        <?php endif; ?>
                                    </div>
                                </td>

                                <!-- Keterangan / Fungsi -->
                                <td class="px-5 py-4 text-slate-500 leading-relaxed max-w-[340px] whitespace-normal">
                                    <?php echo htmlspecialchars($row['keterangan']); ?>
                                </td>

                                <!-- Real Active count in KIB -->
                                <td class="px-5 py-4 text-center">
                                    <?php if ((int)$row['total_assets'] > 0): ?>
                                        <span class="bg-teal-500 text-white font-extrabold rounded-full px-2.5 py-0.5 text-[10px] tracking-wide shadow-sm font-mono whitespace-nowrap">
                                            <?php echo $row['total_assets']; ?> Unit
                                        </span>
                                    <?php else: ?>
                                        <span class="text-slate-300 italic font-mono text-[10px]">—</span>
                                    <?php endif; ?>
                                </td>

                                <!-- Actions -->
                                <td class="px-5 py-4 text-right whitespace-nowrap">
                                    <div class="inline-flex gap-1.5 align-middle">
                                        <button 
                                            onclick="viewKodeBarang(<?php echo htmlspecialchars(json_encode($row)); ?>)"
                                            class="bg-white border border-indigo-100 text-indigo-600 hover:bg-indigo-50 rounded p-1.5 shadow-xxs cursor-pointer"
                                            title="View Klasifikasi"
                                        >
                                            <i data-lucide="eye" class="h-3.5 w-3.5"></i>
                                        </button>
                                    <?php if ($row['is_custom']): ?>
                                            <button 
                                                onclick="editKodeBarang(<?php echo htmlspecialchars(json_encode($row)); ?>)"
                                                class="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded p-1.5 shadow-xxs cursor-pointer"
                                                title="Edit Klasifikasi Kustom"
                                            >
                                                <i data-lucide="edit" class="h-3.5 w-3.5"></i>
                                            </button>
                                            <button 
                                                onclick="confirmDeleteKode('<?php echo $row['id']; ?>')"
                                                class="bg-white border border-rose-100 text-rose-650 hover:bg-rose-50 rounded p-1.5 shadow-xxs cursor-pointer"
                                                title="Hapus Klasifikasi Kustom"
                                            >
                                                <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
                                            </button>
                                    <?php else: ?>
                                        <span class="text-[10px] text-slate-400 font-mono italic my-auto ml-1">Standar Pabrikan GID</span>
                                    <?php endif; ?>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr>
                            <td colSpan="6" class="px-5 py-12 text-center text-slate-400 italic h-48">Tidak ditemukan data sandi klasifikasi yang cocok dengan kata pencarian.</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- ==================== FORM SUBMIT DIALOG CODES ==================== -->
<div id="modal-import" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur p-4 overflow-y-auto hidden">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-left my-8 animate-fade-in">
        <form method="POST" enctype="multipart/form-data" class="space-y-4">
            <input type="hidden" name="action" value="import">

            <div class="flex justify-between items-center border-b border-slate-150 pb-3">
                <span class="text-xs font-black text-indigo-900 uppercase flex items-center gap-1.5 font-sans">
                    <i data-lucide="upload-cloud" class="h-4.5 w-4.5 text-indigo-600"></i> IMPORT DATA KLASIFIKASI CSV
                </span>
                <button type="button" onclick="document.getElementById('modal-import').classList.add('hidden')" class="text-slate-440 hover:text-slate-650 font-bold text-xs cursor-pointer">✕</button>
            </div>

            <div class="space-y-3 text-xs text-slate-800">
                <div class="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-[10px] leading-relaxed text-indigo-800 font-medium">
                    Kolom CSV yang didukung wajib memiliki urutan:<br/>
                    1. <strong>Kode Barang</strong> (Maks. 20 Karakter)<br/>
                    2. <strong>Nama Klasifikasi</strong><br/>
                    3. <strong>Kategori</strong> (Misal: KIB A, KIB B)<br/>
                    4. <strong>Keterangan</strong> (Opsional)
                </div>

                <div class="pt-2">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Pilih File CSV Dataset</label>
                    <input type="file" name="csv_file" accept=".csv" required class="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-wider file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 transition-all cursor-pointer border border-slate-300 rounded-lg bg-slate-50">
                </div>
            </div>

            <div class="flex justify-end pt-3 gap-2 border-t border-slate-100">
                <button type="button" onclick="document.getElementById('modal-import').classList.add('hidden')" class="rounded-lg border border-slate-250 hover:bg-slate-50 font-bold py-2 px-4 transition text-slate-700 cursor-pointer text-xs">Batal</button>
                <button type="submit" class="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 shadow-sm transition cursor-pointer text-xs">Jalankan Import</button>
            </div>
        </form>
    </div>
</div>

<div id="modal-kode" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur p-4 overflow-y-auto hidden">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-left my-8 animate-fade-in">
        <form method="POST" class="space-y-4">
            <input type="hidden" name="action" id="form-action" value="insert">
            <input type="hidden" name="id" id="form-id" value="">

            <div class="flex justify-between items-center border-b border-slate-150 pb-3">
                <span id="modal-title" class="text-xs font-black text-blue-900 uppercase flex items-center gap-1.5 font-sans">
                    <i data-lucide="book-open" class="h-4.5 w-4.5 text-blue-600"></i> tambah kode barang kustom baru
                </span>
                <button type="button" onclick="closeEntryModal()" class="text-slate-440 hover:text-slate-650 font-bold text-xs cursor-pointer">✕</button>
            </div>

            <div class="space-y-3.5 text-xs text-slate-800">
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Daftar Bagian KIB Klasifikasi</label>
                    <select name="kategori" id="form-kategori" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-bold">
                        <option value="KIB A">KIB A — Lahan &amp; Tanah Desa</option>
                        <option value="KIB B">KIB B — Mesin, Peralatan &amp; IT Desa</option>
                        <option value="KIB C">KIB C — Gedung &amp; Bangunan Pelayanan</option>
                        <option value="KIB D">KIB D — Jalan, Irigasi &amp; Jaringan Desa</option>
                        <option value="KIB E">KIB E — Perpustakaan, Hewan &amp; Budaya</option>
                        <option value="KIB F">KIB F — Konstruksi KDP Dalam Pengerjaan</option>
                    </select>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Sandi Kode Barang Urusan (Format: XX.XX.XX...)</label>
                    <input type="text" name="kode" id="form-kode" required placeholder="Contoh: 02.03.01.03.99" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nama Klasifikasi / Bidang Urusan</label>
                    <input type="text" name="nama" id="form-nama" required placeholder="Contoh: Drone Pemetaan Udara Pertanian" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-900 focus:bg-white focus:outline-none">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Keterangan / Fungsi Penataan Teknis</label>
                    <textarea name="keterangan" id="form-keterangan" rows="3" placeholder="Sebutkan ringkasan fungsi klasifikasi..." class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-650 focus:bg-white focus:outline-none"></textarea>
                </div>
            </div>

            <div class="flex justify-end pt-3 gap-2 border-t border-slate-100">
                <button type="button" onclick="closeEntryModal()" class="rounded-lg border border-slate-250 hover:bg-slate-50 font-bold py-2 px-4 transition text-slate-700 cursor-pointer">Batal</button>
                <button type="submit" class="rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-5 shadow-sm transition cursor-pointer">Daftarkan Kode</button>
            </div>
        </form>
    </div>
</div>

<!-- POST FORM DRIVER FOR DELETE -->
<form id="form-delete" method="POST" class="hidden">
    <input type="hidden" name="action" value="delete">
    <input type="hidden" name="id" id="del-id" value="">
</form>

<script>
    function setCategoryFilter(cat) {
        document.getElementById('query-cat').value = cat;
        document.getElementById('query-cat').form.submit();
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text);
        alert("Sandi Kode Barang '" + text + "' tersalin sukses ke clipboard!");
    }

    function openEntryModal() {
        document.getElementById('form-action').value = 'insert';
        document.getElementById('form-id').value = '';
        document.getElementById('form-kategori').value = 'KIB B';
        document.getElementById('form-kode').value = '';
        document.getElementById('form-nama').value = '';
        document.getElementById('form-keterangan').value = '';
        document.getElementById('modal-title').innerHTML = '<i data-lucide="book-open" class="h-4.5 w-4.5 text-blue-600 inline"></i> TAMBAH KODE BARANG KUSTOM BARU';
        document.getElementById('modal-kode').classList.remove('hidden');
        lucide.createIcons(); // Instansiasi ulang ikon
    }

    function closeEntryModal() {
        document.getElementById('modal-kode').classList.add('hidden');
    }

    function editKodeBarang(data) {
        document.getElementById('form-action').value = 'update';
        document.getElementById('form-id').value = data.id;
        document.getElementById('form-kategori').value = data.kategori;
        document.getElementById('form-kode').value = data.kode;
        document.getElementById('form-nama').value = data.nama;
        document.getElementById('form-keterangan').value = data.keterangan;
        document.getElementById('modal-title').innerHTML = '<i data-lucide="edit" class="h-4.5 w-4.5 text-amber-600 inline"></i> EDIT HIERARKI KODE KUSTOM';
        document.getElementById('modal-kode').classList.remove('hidden');
        lucide.createIcons();
    }

    function viewKodeBarang(data) {
        editKodeBarang(data);
        document.getElementById('modal-title').innerHTML = '<i data-lucide="eye" class="h-4.5 w-4.5 text-indigo-600 inline"></i> VIEW KLASIFIKASI KODE BARANG';
        const form = document.getElementById('modal-kode').querySelector('form');
        const btnSubmit = form.querySelector('button[type="submit"]');
        if (btnSubmit) btnSubmit.style.display = 'none';
        
        Array.from(form.elements).forEach(el => {
            if(el.tagName !== 'BUTTON') {
                el.disabled = true;
            }
        });

        // Reset state on close logic
        const closeBtn = document.querySelector('#modal-kode button[onclick="closeEntryModal()"]');
        closeBtn.addEventListener('click', function handler() {
            Array.from(form.elements).forEach(el => el.disabled = false);
            if (btnSubmit) btnSubmit.style.display = 'block';
            closeBtn.removeEventListener('click', handler);
        });
    }

    function confirmDeleteKode(id) {
        if (confirm("Apakah anda yakin ingin mencabut sandi klasifikasi kustom ID "+id+" dari database? Tindakan ini tidak dapat dikembalikan.")) {
            document.getElementById('del-id').value = id;
            document.getElementById('form-delete').submit();
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.search.includes('import=1')) {
            document.getElementById('modal-import').classList.remove('hidden');
        }
    });
</script>

<?php require_once 'footer.php'; ?>
