<?php
/**
 * ==============================================================================
 *                       SIPADES SMART v4.5 - CAPITALIZATION & DISPOSALS
 *                 SISTEM INFORMASI PENGELOLAAN ASET DESA RARANG SELATAN
 * ==============================================================================
 */
require_once 'header.php';

$success_msg = "";
$error_msg = "";

// 1. OPERATION SUBMISSIONS
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];

    try {
        if ($action === 'add_kapitalisasi') {
            $id = "KAP-" . rand(1000, 9999);
            $barang_id = safeInput($_POST['barang_id']);
            $tanggal = safeInput($_POST['tanggal']);
            $keterangan = safeInput($_POST['keterangan']);
            $nilai_tambah = (double)$_POST['nilai_tambah'];
            $status = "Draf"; // Default draf

            if (empty($barang_id) || empty($tanggal) || empty($keterangan) || $nilai_tambah <= 0) {
                throw new Exception("Input rekonstruksi kapitalisasi belum lengkap!");
            }

            // Ambil info aset
            $stmt_b = $pdo->prepare("SELECT nama_barang, nilai FROM assets WHERE id = ?");
            $stmt_b->execute([$barang_id]);
            $b_row = $stmt_b->fetch();
            if (!$b_row) {
                throw new Exception("Aset target tidak ditemukan di pembukuan KIB.");
            }

            $nama_barang = $b_row['nama_barang'];
            $nilai_lama = (double)$b_row['nilai'];
            $nilai_baru = $nilai_lama + $nilai_tambah;

            $stmt_ins = $pdo->prepare("INSERT INTO kapitalisasi (id, barang_id, nama_barang, tanggal, keterangan, nilai_lama, nilai_tambah, nilai_baru, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt_ins->execute([$id, $barang_id, $nama_barang, $tanggal, $keterangan, $nilai_lama, $nilai_tambah, $nilai_baru, $status]);
            
            $success_msg = "Taksiran kapitalisasi baru {$id} untuk [{$nama_barang}] direkam sebagai DRAF.";
        }
        elseif ($action === 'edit_kapitalisasi') {
            $id = safeInput($_POST['id']);
            $barang_id = safeInput($_POST['barang_id']);
            $tanggal = safeInput($_POST['tanggal']);
            $keterangan = safeInput($_POST['keterangan']);
            $nilai_tambah = (double) $_POST['nilai_tambah'];

            $stmt_b = $pdo->prepare("SELECT nama_barang, nilai FROM assets WHERE id = ?");
            $stmt_b->execute([$barang_id]);
            $b_row = $stmt_b->fetch();
            if (!$b_row) {
                throw new Exception("Aset target tidak ditemukan di pembukuan KIB.");
            }
            $nama_barang = $b_row['nama_barang'];
            $nilai_lama = (double)$b_row['nilai'];
            $nilai_baru = $nilai_lama + $nilai_tambah;

            $stmt_upd = $pdo->prepare("UPDATE kapitalisasi SET barang_id = ?, nama_barang = ?, tanggal = ?, keterangan = ?, nilai_lama = ?, nilai_tambah = ?, nilai_baru = ? WHERE id = ?");
            $stmt_upd->execute([$barang_id, $nama_barang, $tanggal, $keterangan, $nilai_lama, $nilai_tambah, $nilai_baru, $id]);
            $success_msg = "Revisi kapitalisasi draf berhasil disimpan.";
        }
        elseif ($action === 'post_kapitalisasi') {
            // Posting kapitalisasi akan mengupdate nilai aset asli di tabel assets
            $id = safeInput($_POST['id']);
            
            $pdo->beginTransaction();

            $stmt_kap = $pdo->prepare("SELECT * FROM kapitalisasi WHERE id = ?");
            $stmt_kap->execute([$id]);
            $kap = $stmt_kap->fetch();

            if (!$kap) {
                throw new Exception("Rekas kapitalisasi tidak teridentifikasi.");
            }

            if ($kap['status'] === 'Terposting') {
                throw new Exception("Kegiatan kapitalisasi ini sudah diposting sebelumnya!");
            }

            // Update nilai aset utama
            $stmt_upd_asset = $pdo->prepare("UPDATE assets SET nilai = ? WHERE id = ?");
            $stmt_upd_asset->execute([$kap['nilai_baru'], $kap['barang_id']]);

            // Update status kapitalisasi
            $stmt_upd_kap = $pdo->prepare("UPDATE kapitalisasi SET status = 'Terposting' WHERE id = ?");
            $stmt_upd_kap->execute([$id]);

            $pdo->commit();
            $success_msg = "Sukses memposting kapitalisasi {$id}! Nilai buku aset target {$kap['nama_barang']} berhasil ditingkatkan menjadi Rp " . number_format($kap['nilai_baru'], 2, ',', '.') . " secara permanen.";
        }
        elseif ($action === 'delete_kapitalisasi') {
            $id = safeInput($_POST['id']);
            
            $stmt_chk = $pdo->prepare("SELECT status FROM kapitalisasi WHERE id = ?");
            $stmt_chk->execute([$id]);
            $chk = $stmt_chk->fetch();

            if ($chk && $chk['status'] === 'Terposting') {
                throw new Exception("Kapitalisasi yang sudah BERSTATUS TERPOSTING tidak diperbolehkan untuk dihapus untuk mencegah korupsi riwayat buku pembukuan!");
            }

            $stmt_del = $pdo->prepare("DELETE FROM kapitalisasi WHERE id = ?");
            $stmt_del->execute([$id]);
            $success_msg = "Konsep draf kapitalisasi {$id} terhapus.";
        }
        elseif ($action === 'add_penghapusan') {
            $id = "DIS-" . rand(1000, 9999);
            $barang_id = safeInput($_POST['barang_id']);
            $tanggal = safeInput($_POST['tanggal']);
            $alasan = safeInput($_POST['alasan']);
            $berita_acara = safeInput($_POST['berita_acara']);

            if (empty($barang_id) || empty($tanggal) || empty($alasan) || empty($berita_acara)) {
                throw new Exception("Data input pengajuan penghapusan belum diisi lengkap!");
            }

            // Ambil info aset
            $stmt_b = $pdo->prepare("SELECT nama_barang, nilai FROM assets WHERE id = ?");
            $stmt_b->execute([$barang_id]);
            $b_row = $stmt_b->fetch();
            if (!$b_row) {
                throw new Exception("Aset target tidak ditemukan di database.");
            }

            $nama_barang = $b_row['nama_barang'];
            $nilai_buku = (double)$b_row['nilai'];

            // Mulai transaksi untuk menghapus aset asli secara otomatis agar status sinkron
            $pdo->beginTransaction();

            $stmt_ins = $pdo->prepare("INSERT INTO penghapusan (id, barang_id, nama_barang, tanggal, alasan, berita_acara, nilai_buku) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt_ins->execute([$id, $barang_id, $nama_barang, $tanggal, $alasan, $berita_acara, $nilai_buku]);

            // Hapus aset dari KIB aktif karena sudah dihapus/disposed
            $stmt_del_asset = $pdo->prepare("DELETE FROM assets WHERE id = ?");
            $stmt_del_asset->execute([$barang_id]);

            $pdo->commit();
            $success_msg = "Sukses mengeksekusi penghapusan aset [{$nama_barang}] sesuai nomor Berita Acara BA {$berita_acara}. Item dipindahkan ke arsip Disposal.";
        }
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        $error_msg = "Gagal memproses alur modul: " . $e->getMessage();
    }
}

// 2. QUERY DATAS
// Seluruh data aset terdaftar untuk kapitalisasi
$stmt_assets = $pdo->query("SELECT id, nama_barang, kategori, nilai, kondisi FROM assets ORDER BY nama_barang ASC");
$all_assets = $stmt_assets->fetchAll();

// List data kapitalisasi
$stmt_kap_list = $pdo->query("SELECT * FROM kapitalisasi ORDER BY tanggal DESC");
$kap_list = $stmt_kap_list->fetchAll();

// List data penghapusan
$stmt_disp_list = $pdo->query("SELECT * FROM penghapusan ORDER BY tanggal DESC");
$disp_list = $stmt_disp_list->fetchAll();

// Target tab
$active_tab = isset($_GET['tab']) ? safeInput($_GET['tab']) : 'kapitalisasi';
?>

<div class="space-y-6 text-left">
    <!-- Header Page Panel -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div class="space-y-1">
            <h1 class="text-lg font-black text-slate-950 uppercase tracking-tight flex items-center gap-2">
                <i data-lucide="trending-down" class="h-5.5 w-5.5 text-blue-800"></i> MODUL KAPITALISASI &amp; DISPOSAL ASET
            </h1>
            <p class="text-xs text-slate-500">Menyusun pembukuan penambahan nilai kegunaan paska rehab berat (Kapitalisasi) serta mengarsipkan penghapusan resmi aset rusak/hilang (Disposal).</p>
        </div>
        
        <div class="flex gap-2 font-mono">
            <?php if ($active_tab === 'kapitalisasi'): ?>
                <button onclick="document.getElementById('modal-add-kapitalisasi').classList.remove('hidden')" class="rounded-lg bg-blue-900 hover:bg-blue-850 text-white font-bold py-2 px-4 text-xs tracking-wider inline-flex items-center gap-1.5 transition cursor-pointer shadow-sm">
                    <i data-lucide="plus-circle" class="h-4 w-4"></i> ENTRY REHAB / KAPITALISASI
                </button>
            <?php else: ?>
                <button onclick="document.getElementById('modal-add-disposal').classList.remove('hidden')" class="rounded-lg bg-rose-900 hover:bg-rose-850 text-white font-bold py-2 px-4 text-xs tracking-wider inline-flex items-center gap-1.5 transition cursor-pointer shadow-sm">
                    <i data-lucide="trash-2" class="h-4 w-4 text-rose-300"></i> AJUKAN PENGHAPUSAN (DISPOSAL)
                </button>
            <?php endif; ?>
        </div>
    </div>

    <!-- Tab navigation panels -->
    <div class="flex border-b border-slate-200 gap-1 font-sans">
        <a href="?tab=kapitalisasi" class="py-2.5 px-4 font-bold text-xs uppercase tracking-wide border-b-2 transition <?php echo ($active_tab==='kapitalisasi') ? 'border-slate-900 text-slate-900 bg-white/50' : 'border-transparent text-slate-400 hover:text-slate-800'; ?>">
            1. Kapitalisasi &amp; Penambahan Nilai Buku paska Rehab
        </a>
        <a href="?tab=disposal" class="py-2.5 px-4 font-bold text-xs uppercase tracking-wide border-b-2 transition <?php echo ($active_tab==='disposal') ? 'border-slate-900 text-slate-900 bg-white/50' : 'border-transparent text-slate-400 hover:text-slate-800'; ?>">
            2. Berita Acara Pertanggungjawaban / Penghapusan (Disposal)
        </a>
    </div>

    <!-- Output messages banners -->
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

    <!-- TAB 1 CONTENT: KAPITALISASI -->
    <?php if ($active_tab === 'kapitalisasi'): ?>
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-200 text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
                            <th class="px-4 py-3">ID Log</th>
                            <th class="px-4 py-3">Aset KIB Terkait</th>
                            <th class="px-4 py-3">Tanggal Kegiatan</th>
                            <th class="px-4 py-3 text-right">Nilai Awal</th>
                            <th class="px-4 py-3 text-right">Biaya Tambah (Rehab)</th>
                            <th class="px-4 py-3 text-right">Nilai Akhir Baru</th>
                            <th class="px-4 py-3 text-center">Status</th>
                            <th class="px-4 py-3 text-right">Tindakan</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <?php if (count($kap_list) > 0): ?>
                            <?php foreach ($kap_list as $row): ?>
                                <tr class="hover:bg-slate-50/50 transition duration-150">
                                    <td class="px-4 py-4 font-mono font-bold text-slate-650"><?php echo htmlspecialchars($row['id']); ?></td>
                                    <td class="px-4 py-4">
                                        <div class="font-bold text-slate-900"><?php echo htmlspecialchars($row['nama_barang']); ?></div>
                                        <div class="text-[9px] text-slate-400 mt-1 font-mono">ID Target: <?php echo htmlspecialchars($row['barang_id']); ?></div>
                                    </td>
                                    <td class="px-4 py-4 font-semibold text-slate-600"><?php echo date('d M Y', strtotime($row['tanggal'])); ?></td>
                                    <td class="px-4 py-4 text-right font-mono text-slate-600">Rp <?php echo number_format($row['nilai_lama'], 0, ',', '.'); ?></td>
                                    <td class="px-4 py-4 text-right font-mono font-bold text-blue-900">+ Rp <?php echo number_format($row['nilai_tambah'], 0, ',', '.'); ?></td>
                                    <td class="px-4 py-4 text-right font-mono font-black text-slate-950">Rp <?php echo number_format($row['nilai_baru'], 0, ',', '.'); ?></td>
                                    <td class="px-4 py-4 text-center">
                                        <span class="inline-flex items-center justify-center rounded px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider <?php echo ($row['status'] === 'Terposting') ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' : 'bg-slate-100 text-slate-500 border border-slate-200'; ?>">
                                            <?php echo htmlspecialchars($row['status']); ?>
                                        </span>
                                    </td>
                                    <td class="px-4 py-4 text-right">
                                        <div class="inline-flex gap-1 justify-end items-center align-middle">
                                            <button onclick="viewKapitalisasi(<?php echo htmlspecialchars(json_encode($row)); ?>)" class="bg-white border border-indigo-100 hover:bg-indigo-50 text-indigo-600 rounded p-1 shadow-xxs transition cursor-pointer" title="View Detail">
                                                <i data-lucide="eye" class="h-3.5 w-3.5"></i>
                                            </button>
                                            <?php if ($row['status'] === 'Draf'): ?>
                                                <button onclick="editKapitalisasi(<?php echo htmlspecialchars(json_encode($row)); ?>)" class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded p-1 shadow-xxs transition cursor-pointer" title="Edit Draf">
                                                    <i data-lucide="edit" class="h-3.5 w-3.5"></i>
                                                </button>
                                                <button onclick="confirmPostKapitalisasi('<?php echo $row['id']; ?>', '<?php echo htmlspecialchars($row['nama_barang']); ?>')" class="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-2.5 py-1 text-[10px] rounded uppercase tracking-wider shadow-xxs transition cursor-pointer flex items-center gap-1">
                                                    <i data-lucide="upload" class="h-3 w-3"></i> POSTING LEDGER
                                                </button>
                                                <button onclick="confirmDelKapitalisasi('<?php echo $row['id']; ?>')" class="bg-white border border-rose-100 hover:bg-rose-50 text-rose-650 rounded p-1 shadow-xxs transition cursor-pointer">
                                                    <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
                                                </button>
                                            <?php else: ?>
                                                <span class="text-[10px] text-slate-400 italic font-mono pt-[3px] pr-1">Terikat KIB</span>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colSpan="8" class="px-4 py-20 text-center text-slate-400 italic">Belum ada rekaman kapitalisasi paska rehab yang terdata. Silakan rekam draf baru.</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    <?php endif; ?>

    <!-- TAB 2 CONTENT: DISPOSAL / PENGHAPUSAN -->
    <?php if ($active_tab === 'disposal'): ?>
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-200 text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
                            <th class="px-4 py-3">No. Berita Acara BA</th>
                            <th class="px-4 py-3">Nama Barang Penghapusan</th>
                            <th class="px-4 py-3">Tanggal Mutasi</th>
                            <th class="px-4 py-3">Alasan Pokok</th>
                            <th class="px-4 py-3 text-right">Nilai Buku Terhapus</th>
                            <th class="px-4 py-3 text-right">Dokumen BA</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <?php if (count($disp_list) > 0): ?>
                            <?php foreach ($disp_list as $row): ?>
                                <tr class="hover:bg-slate-50/50 transition duration-150">
                                    <td class="px-4 py-4 font-mono font-bold text-slate-900 select-all"><?php echo htmlspecialchars($row['berita_acara']); ?></td>
                                    <td class="px-4 py-4">
                                        <div class="font-bold text-rose-950"><?php echo htmlspecialchars($row['nama_barang']); ?></div>
                                        <div class="text-[9px] text-slate-400 mt-1 font-mono">Disposal ID: <?php echo htmlspecialchars($row['id']); ?> &bull; KIB Ref: <?php echo htmlspecialchars($row['barang_id']); ?></div>
                                    </td>
                                    <td class="px-4 py-4 font-semibold text-slate-650"><?php echo date('d M Y', strtotime($row['tanggal'])); ?></td>
                                    <td class="px-4 py-4 font-bold">
                                        <span class="bg-rose-50 text-rose-800 border border-rose-100 rounded px-2.5 py-0.5 text-[10px] uppercase">
                                            <?php echo htmlspecialchars($row['alasan']); ?>
                                        </span>
                                    </td>
                                    <td class="px-4 py-4 text-right font-mono font-bold text-slate-800">
                                        Rp <?php echo number_format($row['nilai_buku'], 0, ',', '.'); ?>
                                    </td>
                                    <td class="px-4 py-4 text-right">
                                        <button onclick="viewBeritaAcara(<?php echo htmlspecialchars(json_encode($row)); ?>)" class="bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold px-3 py-1.5 rounded text-[10px] uppercase shadow-xxs transition cursor-pointer flex items-center gap-1">
                                            <i data-lucide="file-text" class="h-3 w-3"></i> Tampilkan BA PDF
                                        </button>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colSpan="6" class="px-4 py-20 text-center text-slate-400 italic">Belum ada riwayat penghapusan aset resmi (Disposal) di pembukuan SIPADES.</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    <?php endif; ?>
</div>

<!-- ==================== DIALOG FORM MODALS ==================== -->

<!-- 1. MODAL TAMBAH KAPITALISASI -->
<div id="modal-add-kapitalisasi" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur p-4 overflow-y-auto hidden">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-left my-8 animate-fade-in">
        <form method="POST" class="space-y-4">
            <input type="hidden" name="action" value="add_kapitalisasi">

            <div class="flex justify-between items-center border-b border-slate-150 pb-3">
                <span class="text-xs font-black text-blue-900 uppercase flex items-center gap-1.5">
                    <i data-lucide="plus-circle" class="h-4.5 w-4.5 text-blue-600"></i> entry rehab &amp; kapitalisasi
                </span>
                <button type="button" onclick="document.getElementById('modal-add-kapitalisasi').classList.add('hidden')" class="text-slate-450 hover:text-slate-700 font-bold text-xs cursor-pointer">✕</button>
            </div>

            <div class="space-y-3.5 text-xs text-slate-800">
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Aset Fisik Sasaran KIB</label>
                    <select name="barang_id" required class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold text-slate-800">
                        <option value="">-- Pilih Aset untuk Direhab --</option>
                        <?php foreach($all_assets as $a): ?>
                            <option value="<?php echo htmlspecialchars($a['id']); ?>">
                                [<?php echo htmlspecialchars($a['kategori']); ?>] <?php echo htmlspecialchars($a['nama_barang']); ?> (Nilai Buku: Rp <?php echo number_format($a['nilai'], 0, ',', '.'); ?>)
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tanggal Penyelesaian Rehab Berat</label>
                    <input type="date" name="tanggal" required class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold text-slate-900">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Beban Nilai Tambah / Biaya Konstruksi (Rp)</label>
                    <input type="number" name="nilai_tambah" required placeholder="Masukkan nominal, contoh: 12500000" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-bold font-mono text-slate-900">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Keterangan / Rincian Rehab Fisik</label>
                    <textarea name="keterangan" rows="3" required placeholder="Contoh: Penggantian atap genteng beton rusak dan finishing dinding aula serbaguna." class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-650"></textarea>
                </div>
            </div>

            <div class="flex justify-end pt-3 gap-2 border-t border-slate-100">
                <button type="button" onclick="document.getElementById('modal-add-kapitalisasi').classList.add('hidden')" class="rounded-lg border border-slate-250 hover:bg-slate-50 font-bold py-2 px-4 transition text-slate-700 cursor-pointer">Batal</button>
                <button type="submit" class="rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-5 shadow-sm transition cursor-pointer">Rekam Konsep Draf</button>
            </div>
        </form>
    </div>
</div>

<!-- 2. MODAL TAMBAH DISPOSAL -->
<div id="modal-add-disposal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur p-4 overflow-y-auto hidden">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-left my-8 animate-fade-in">
        <form method="POST" class="space-y-4">
            <input type="hidden" name="action" value="add_penghapusan">

            <div class="flex justify-between items-center border-b border-slate-150 pb-3">
                <span class="text-xs font-black text-rose-900 uppercase flex items-center gap-1.5 animate-pulse">
                    <i data-lucide="alert-triangle" class="h-4.5 w-4.5 text-rose-600"></i> AJU PENGHAPUSAN ASET SECARA SAH
                </span>
                <button type="button" onclick="document.getElementById('modal-add-disposal').classList.add('hidden')" class="text-slate-450 hover:text-slate-700 font-bold text-xs cursor-pointer">✕</button>
            </div>

            <div class="space-y-3.5 text-xs text-slate-800">
                <div class="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-900 text-[10.5px] leading-normal font-medium">
                    ⚠️ <strong>PERINGATAN ATURAN:</strong> Proses penghapusan ini bersifat <strong>IRREVERSIBLE</strong>. Seketika setelah data terekam, barang target terpilih akan otomatis dihancurkan dari buku inventaris KIB aktif serta dialokasikan pada folder arsip disposal.
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Aset Rusak / Hilang Target</label>
                    <select name="barang_id" required class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-semibold text-slate-800">
                        <option value="">-- Pilih Aset Target Penghapusan --</option>
                        <?php foreach($all_assets as $a): ?>
                            <option value="<?php echo htmlspecialchars($a['id']); ?>">
                                [<?php echo htmlspecialchars($a['kategori']); ?>] <?php echo htmlspecialchars($a['nama_barang']); ?> (Kondisi: <?php echo htmlspecialchars($a['kondisi']); ?>)
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Alasan Mutasi Pokok</label>
                    <select name="alasan" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-semibold text-slate-800">
                        <option value="Rusak Berat">Rusak Berat &amp; Tidak Ekonomis</option>
                        <option value="Hilang">Hilang atau Kecurian</option>
                        <option value="Dijual">Dijual Melalui Lelang Terbuka</option>
                        <option value="Hibah">Hibah Bantuan ke Lembaga / Karang Taruna</option>
                    </select>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nomor Surat Keputusan Berita Acara (BA)</label>
                    <input type="text" name="berita_acara" required placeholder="Contoh: BA.03/PEN Penghapusan/VI/2026" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-semibold text-slate-900">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tanggal Eksekusi Disposal</label>
                    <input type="date" name="tanggal" required class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-semibold text-slate-900">
                </div>
            </div>

            <div class="flex justify-end pt-3 gap-2 border-t border-slate-100">
                <button type="button" onclick="document.getElementById('modal-add-disposal').classList.add('hidden')" class="rounded-lg border border-slate-250 hover:bg-slate-50 font-bold py-2 px-4 transition text-slate-700 cursor-pointer">Batal</button>
                <button type="submit" class="rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-5 shadow-sm transition cursor-pointer">Eksekusi Hancurkan Aset</button>
            </div>
        </form>
    </div>
</div>

<!-- 3. MODAL DETAILED VIEW BERITA ACARA (BA) -->
<div id="modal-view-ba" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur p-4 overflow-y-auto hidden">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 text-left my-8 animate-fade-in">
        <div class="flex justify-between items-center border-b border-slate-150 pb-3">
            <span class="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5 font-mono">
                <i data-lucide="file-text" class="h-4.5 w-4.5 text-emerald-600"></i> lembar berita acara penghapusan barang (ba)
            </span>
            <button type="button" onclick="document.getElementById('modal-view-ba').classList.add('hidden')" class="text-slate-450 hover:text-slate-700 font-bold text-xs cursor-pointer">✕</button>
        </div>

        <div class="space-y-6 pt-4 text-xs text-slate-800">
            <!-- Kop Berkas -->
            <div class="text-center space-y-1 pb-4 border-b border-dashed border-slate-200 select-none">
                <h3 class="text-sm font-black text-slate-900 leading-none">PEMERINTAH KABUPATEN LOMBOK TIMUR</h3>
                <h4 class="text-xs font-black text-slate-850 leading-none">KECAMATAN TERARA • KANTOR KEPALA DESA RARANG SELATAN</h4>
                <p class="text-[9.5px] text-slate-400 font-mono">Alamat: Jl. Raya Terara-Lombok No.5, Kode Pos: 83661</p>
            </div>

            <!-- Isi inti surat -->
            <div class="space-y-3 font-sans leading-relaxed">
                <p class="text-center font-bold text-slate-900 underline text-xs">BERITA ACARA PENGHAPUSAN ASET MILIK DESA<br /><span class="text-[10px] font-mono no-underline text-slate-500">Nomor SK BA: <span id="ba-no-placeholder" class="font-bold">N/A</span></span></p>
                
                <p>Pada hari ini, yang bertanda tangan di bawah ini mewakili Pengurus Pembantu Pengelola Barang Milik Desa Rarang Selatan, menyatakan telah melakukan peninjauan fisik dan verifikasi administrasi kelayakan ekonomis terhadap unit aset desa berikut:</p>
                
                <div class="bg-slate-50 border rounded-lg p-3.5 space-y-2 font-mono text-[10.5px]">
                    <p>📦 <strong>Nama Urusan Fisik:</strong> <span id="ba-nama-placeholder" class="font-bold text-rose-900">N/A</span></p>
                    <p>🎟️ <strong>Kode ID Aset:</strong> <span id="ba-id-placeholder" class="font-bold text-slate-700">N/A</span></p>
                    <p>🕒 <strong>Tanggal Dihapuskan:</strong> <span id="ba-tanggal-placeholder" class="font-medium">N/A</span></p>
                    <p>⚖️ <strong>Nilai Buku Tercatat:</strong> <span id="ba-nilai-placeholder" class="font-bold text-slate-900">N/A</span></p>
                    <p>⚠️ <strong>Alasan Penghapusan:</strong> <span id="ba-alasan-placeholder" class="font-bold text-rose-800">N/A</span></p>
                </div>

                <p>Menyatakan bahwa terhitung dari tanggal ditetapkan, aset miliki desa tersebut **DIHAPUSKAN SECARA PERMANEN** dari register Kertas Kerja Kartu Inventaris Barang (KIB) Desa serta dialihkan kepada status mutasi Disposal karena alasan kedaluwarsa nilai pakai teknis maupun kehilangan.</p>
            </div>

            <!-- TTE & Validasi block -->
            <div class="flex justify-between items-end pt-5 border-t border-slate-100">
                <div class="text-center">
                    <p class="text-[10.5px] font-bold text-slate-500 mb-10">Mengetahui,<br />Kepala Desa Rarang Selatan</p>
                    <p class="font-extrabold underline text-slate-900">H. RIDWAN, M.Si.</p>
                    <p class="text-slate-400 font-mono text-[9px]">NIP. 19750812 200212 1 003</p>
                </div>
                
                <div class="text-center flex flex-col items-center">
                    <!-- Simulasi QR-TTE Sah -->
                    <div class="border border-emerald-200 bg-emerald-50 rounded p-1.5 flex flex-col items-center gap-1 text-[8px] font-mono text-emerald-800 font-bold mb-1.5 max-w-[130px]">
                        <span>✓ SIPADES SECURE TTE</span>
                        <code class="text-[7.5px] bg-slate-100 px-1 rounded text-slate-600">SHA-256: F98D2E1</code>
                    </div>
                    <p class="text-[10.5px] font-bold text-slate-500">Dibuat Oleh,<br />Kaur Umum / Pengendali Aset</p>
                    <p class="font-extrabold underline text-slate-900">M. FAUZI, S.IP.</p>
                    <p class="text-slate-450 text-[9.5px]">Rarang Selatan, Lombok Timur</p>
                </div>
            </div>
        </div>

        <div class="flex justify-end pt-5 gap-2 border-t border-slate-100">
            <button type="button" onclick="window.print()" class="rounded-lg border border-slate-250 hover:bg-slate-50 font-bold py-2 px-4 text-xs transition text-slate-705 cursor-pointer flex items-center gap-1">
                <i data-lucide="printer" class="h-3.5 w-3.5"></i> CETAK ARSIP BA CORONG
            </button>
            <button type="button" onclick="document.getElementById('modal-view-ba').classList.add('hidden')" class="rounded-lg bg-slate-900 hover:bg-slate-850 text-white font-bold py-2 px-5 text-xs shadow-sm transition cursor-pointer">Selesai</button>
        </div>
    </div>
</div>

<!-- OPERATION DRIVER POST FORMS -->
<form id="form-post-kapitalisasi" method="POST" class="hidden">
    <input type="hidden" name="action" value="post_kapitalisasi">
    <input type="hidden" name="id" id="post-kapitalisasi-id" value="">
</form>

<form id="form-delete-kapitalisasi" method="POST" class="hidden">
    <input type="hidden" name="action" value="delete_kapitalisasi">
    <input type="hidden" name="id" id="del-kapitalisasi-id" value="">
</form>

<script>
    function editKapitalisasi(data) {
        const form = document.getElementById('modal-add-kapitalisasi').querySelector('form');
        form.querySelector('input[name="action"]').value = 'edit_kapitalisasi';
        
        let idField = form.querySelector('input[name="id"]');
        if (!idField) {
            idField = document.createElement('input');
            idField.type = 'hidden';
            idField.name = 'id';
            form.appendChild(idField);
        }
        idField.value = data.id;

        form.querySelector('[name="barang_id"]').value = data.barang_id || '';
        form.querySelector('[name="tanggal"]').value = data.tanggal || '';
        form.querySelector('[name="nilai_tambah"]').value = data.nilai_tambah || '';
        form.querySelector('[name="keterangan"]').value = data.keterangan || '';
        
        const btnSubmit = form.querySelector('button[type="submit"]');
        if (btnSubmit) btnSubmit.innerText = 'Simpan Pembaruan';
        
        Array.from(form.elements).forEach(el => el.disabled = false);
        document.getElementById('modal-add-kapitalisasi').classList.remove('hidden');
    }

    function viewKapitalisasi(data) {
        editKapitalisasi(data);
        const form = document.getElementById('modal-add-kapitalisasi').querySelector('form');
        const btnSubmit = form.querySelector('button[type="submit"]');
        if (btnSubmit) btnSubmit.style.display = 'none';
        
        Array.from(form.elements).forEach(el => {
            if(el.tagName !== 'BUTTON') {
                el.disabled = true;
            }
        });

        // Reset
        const closeBtn = document.querySelector('#modal-add-kapitalisasi button[onclick*="hidden"]');
        closeBtn.addEventListener('click', function handler() {
            Array.from(form.elements).forEach(el => el.disabled = false);
            if (btnSubmit) {
                btnSubmit.style.display = 'block';
                btnSubmit.innerText = 'Rekam Konsep Draf';
            }
            form.querySelector('input[name="action"]').value = 'add_kapitalisasi';
            closeBtn.removeEventListener('click', handler);
        });
    }

    function confirmPostKapitalisasi(id, name) {
        if (confirm("Posting kapitalisasi "+id+" untuk aset ["+name+"]? Hal ini akan secara otomatis memperbarui nilai total buku rincian aset tersebut di register KIB utama desa.")) {
            document.getElementById('post-kapitalisasi-id').value = id;
            document.getElementById('form-post-kapitalisasi').submit();
        }
    }

    function confirmDelKapitalisasi(id) {
        if (confirm("Coret draf penambahan modal rehab ID "+id+"?")) {
            document.getElementById('del-kapitalisasi-id').value = id;
            document.getElementById('form-delete-kapitalisasi').submit();
        }
    }

    function viewBeritaAcara(data) {
        document.getElementById('ba-no-placeholder').textContent = data.berita_acara;
        document.getElementById('ba-nama-placeholder').textContent = data.nama_barang;
        document.getElementById('ba-id-placeholder').textContent = data.barang_id;
        document.getElementById('ba-tanggal-placeholder').textContent = data.tanggal;
        
        // Format Currency sederhana
        const valFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(data.nilai_buku);
        document.getElementById('ba-nilai-placeholder').textContent = valFormatted;
        
        document.getElementById('ba-alasan-placeholder').textContent = data.alasan;
        
        document.getElementById('modal-view-ba').classList.remove('hidden');
    }
</script>

<?php require_once 'footer.php'; ?>
