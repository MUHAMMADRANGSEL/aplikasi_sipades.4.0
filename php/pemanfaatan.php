<?php
/**
 * ==============================================================================
 *                       SIPADES SMART v4.5 - USAGE AND LEASES DOCK
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
        if ($action === 'add_penggunaan') {
            $id = "PGN-" . rand(1000, 9999);
            $sk = safeInput($_POST['sk']);
            $barang_id = safeInput($_POST['barang_id']);
            $pengguna = safeInput($_POST['pengguna']);
            $tanggal = safeInput($_POST['tanggal']);
            $status = safeInput($_POST['status']);

            if (empty($sk) || empty($barang_id) || empty($pengguna) || empty($tanggal)) {
                throw new Exception("Seluruh data input penetapan penggunaan wajib diisi!");
            }

            // Ambil nama barang
            $stmt_b = $pdo->prepare("SELECT nama_barang FROM assets WHERE id = ?");
            $stmt_b->execute([$barang_id]);
            $b_row = $stmt_b->fetch();
            $nama_barang = $b_row ? $b_row['nama_barang'] : "Aset Tidak Beridentitas";

            $stmt_ins = $pdo->prepare("INSERT INTO penggunaan (id, sk, barang_id, nama_barang, pengguna, tanggal, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt_ins->execute([$id, $sk, $barang_id, $nama_barang, $pengguna, $tanggal, $status]);
            $success_msg = "Sukses merekam Surat Keputusan {$sk} untuk penggunaan K Kib oleh {$pengguna}.";
        }
        elseif ($action === 'edit_penggunaan') {
            $id = safeInput($_POST['id']);
            $sk = safeInput($_POST['sk']);
            $barang_id = safeInput($_POST['barang_id']);
            $pengguna = safeInput($_POST['pengguna']);
            $tanggal = safeInput($_POST['tanggal']);
            $status = safeInput($_POST['status']);

            if (empty($id) || empty($sk) || empty($barang_id) || empty($pengguna) || empty($tanggal)) {
                throw new Exception("Seluruh data penginputan revisi wajib diisi lengkap!");
            }

            $stmt_b = $pdo->prepare("SELECT nama_barang FROM assets WHERE id = ?");
            $stmt_b->execute([$barang_id]);
            $b_row = $stmt_b->fetch();
            $nama_barang = $b_row ? $b_row['nama_barang'] : "Aset Tidak Beridentitas";

            $stmt_upd = $pdo->prepare("UPDATE penggunaan SET sk = ?, barang_id = ?, nama_barang = ?, pengguna = ?, tanggal = ?, status = ? WHERE id = ?");
            $stmt_upd->execute([$sk, $barang_id, $nama_barang, $pengguna, $tanggal, $status, $id]);
            $success_msg = "ID pengurus penggunaan {$id} berhasil diperbarui dengan rincian terbaru.";
        }
        elseif ($action === 'delete_penggunaan') {
            $id = safeInput($_POST['id']);
            $stmt_del = $pdo->prepare("DELETE FROM penggunaan WHERE id = ?");
            $stmt_del->execute([$id]);
            $success_msg = "Perekaman penetapan penggunaan bernomor ID {$id} sukses dihapus dari ledger.";
        }
        elseif ($action === 'add_pemanfaatan') {
            $id = "PMF-" . rand(1000, 9999);
            $barang_id = safeInput($_POST['barang_id']);
            $jenis = safeInput($_POST['jenis']);
            $mitra = safeInput($_POST['mitra']);
            $periode_mulai = safeInput($_POST['periode_mulai']);
            $periode_selesai = safeInput($_POST['periode_selesai']);
            $nilai_kontrak = (double)$_POST['nilai_kontrak'];
            $status = safeInput($_POST['status']);

            if (empty($barang_id) || empty($jenis) || empty($mitra) || empty($periode_mulai) || empty($periode_selesai)) {
                throw new Exception("Data input rincian pemanfaatan aset wajib terisi sempurna!");
            }

            $stmt_b = $pdo->prepare("SELECT nama_barang FROM assets WHERE id = ?");
            $stmt_b->execute([$barang_id]);
            $b_row = $stmt_b->fetch();
            $nama_barang = $b_row ? $b_row['nama_barang'] : "Aset Tidak Beridentitas";

            $stmt_ins = $pdo->prepare("INSERT INTO pemanfaatan (id, barang_id, nama_barang, jenis, mitra, periode_mulai, periode_selesai, nilai_kontrak, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt_ins->execute([$id, $barang_id, $nama_barang, $jenis, $mitra, $periode_mulai, $periode_selesai, $nilai_kontrak, $status]);
            $success_msg = "Sewa / bagi hasil aset dengan mitra {$mitra} bernilai kontrak Rp " . number_format($nilai_kontrak, 0, ',', '.') . " sukses disimpan.";
        }
        elseif ($action === 'edit_pemanfaatan') {
            $id = safeInput($_POST['id']);
            $barang_id = safeInput($_POST['barang_id']);
            $jenis = safeInput($_POST['jenis']);
            $mitra = safeInput($_POST['mitra']);
            $periode_mulai = safeInput($_POST['periode_mulai']);
            $periode_selesai = safeInput($_POST['periode_selesai']);
            $nilai_kontrak = (double)$_POST['nilai_kontrak'];
            $status = safeInput($_POST['status']);

            if (empty($id) || empty($barang_id) || empty($jenis) || empty($mitra) || empty($periode_mulai) || empty($periode_selesai)) {
                throw new Exception("Data perbaikan sewa / bagi hasil pemanfaatan aset tidak boleh ada yang kosong!");
            }

            $stmt_b = $pdo->prepare("SELECT nama_barang FROM assets WHERE id = ?");
            $stmt_b->execute([$barang_id]);
            $b_row = $stmt_b->fetch();
            $nama_barang = $b_row ? $b_row['nama_barang'] : "Aset Tidak Beridentitas";

            $stmt_upd = $pdo->prepare("UPDATE pemanfaatan SET barang_id = ?, nama_barang = ?, jenis = ?, mitra = ?, periode_mulai = ?, periode_selesai = ?, nilai_kontrak = ?, status = ? WHERE id = ?");
            $stmt_upd->execute([$barang_id, $nama_barang, $jenis, $mitra, $periode_mulai, $periode_selesai, $nilai_kontrak, $status, $id]);
            $success_msg = "Berhasil mengupdate rincian kontrak sewa {$id} dengan {$mitra}.";
        }
        elseif ($action === 'delete_pemanfaatan') {
            $id = safeInput($_POST['id']);
            $stmt_del = $pdo->prepare("DELETE FROM pemanfaatan WHERE id = ?");
            $stmt_del->execute([$id]);
            $success_msg = "Perekaman pemanfaatan & sewa ID {$id} sukses dihapus.";
        }
    } catch (Exception $e) {
        $error_msg = "Gagal memproses pengajuan: " . $e->getMessage();
    }
}

// 2. QUERY MASTER DATA
// Seluruh data aset terdaftar untuk link form select
$stmt_assets = $pdo->query("SELECT id, nama_barang, kategori, nilai, kondisi FROM assets ORDER BY nama_barang ASC");
$all_assets = $stmt_assets->fetchAll();

// List data penggunaan
$stmt_usage = $pdo->query("SELECT * FROM penggunaan ORDER BY tanggal DESC");
$usage_list = $stmt_usage->fetchAll();

// List data pemanfaatan
$stmt_lease = $pdo->query("SELECT * FROM pemanfaatan ORDER BY periode_mulai DESC");
$lease_list = $stmt_lease->fetchAll();

// Menghitung statistik rekap
$total_kades_sk = count($usage_list);
$total_active_lease = 0;
$total_revenue_lease = 0.0;
foreach($lease_list as $l) {
    if ($l['status'] === 'Aktif') {
        $total_active_lease++;
    }
    $total_revenue_lease += (double)$l['nilai_kontrak'];
}

// Target tab
$active_tab = isset($_GET['tab']) ? safeInput($_GET['tab']) : 'penggunaan';
?>

<div class="space-y-6 text-left">
    <!-- Header Page Panel -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div class="space-y-1">
            <h1 class="text-lg font-black text-slate-950 uppercase tracking-tight flex items-center gap-2">
                <i data-lucide="file-check" class="h-5.5 w-5.5 text-blue-800"></i> HAK GUNA &amp; PEMANFAATAN ASET DESA
            </h1>
            <p class="text-xs text-slate-500">Mencatat pendistribusian kuasa pakai internal (SK Kepala Desa KKD) dan kontrak pemanfaatan sewa/kemitraan dengan pihak ketiga.</p>
        </div>
        
        <div class="flex gap-2 font-mono">
            <?php if ($active_tab === 'penggunaan'): ?>
                <button onclick="openFormModal('penggunaan')" class="rounded-lg bg-blue-900 hover:bg-blue-850 text-white font-bold py-2 px-4 text-xs tracking-wider inline-flex items-center gap-1.5 transition cursor-pointer shadow-sm">
                    <i data-lucide="plus-circle" class="h-4 w-4"></i> ENTRY SK GUNA BARU
                </button>
            <?php else: ?>
                <button onclick="openFormModal('pemanfaatan')" class="rounded-lg bg-indigo-900 hover:bg-indigo-850 text-white font-bold py-2 px-4 text-xs tracking-wider inline-flex items-center gap-1.5 transition cursor-pointer shadow-sm">
                    <i data-lucide="plus-circle" class="h-4 w-4"></i> ENTRY KONTRAK SEWA BARU
                </button>
            <?php endif; ?>
        </div>
    </div>

    <!-- Stats Panels board -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-left relative overflow-hidden">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Penetapan SK Kades</span>
            <h3 class="text-2xl font-black text-slate-900 leading-tight mt-1"><?php echo $total_kades_sk; ?> <span class="text-xs font-normal text-slate-500">Berkas SK</span></h3>
            <p class="text-[10px] text-slate-500 font-mono">Mutasi kuasa pakai internal perangkat</p>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-left relative overflow-hidden">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Pihak Keiga / Mitra Aktif</span>
            <h3 class="text-2xl font-black text-blue-900 leading-tight mt-1"><?php echo $total_active_lease; ?> <span class="text-xs font-normal text-blue-500">Kontrak</span></h3>
            <p class="text-[10px] text-slate-500 font-mono">Sewa, KSP, Pinjam Pakai, BGS</p>
        </div>

        <div class="bg-white rounded-2xl border border-teal-200 p-5 shadow-sm text-left bg-teal-50/10 relative overflow-hidden">
            <span class="text-[10px] font-black text-teal-600 uppercase tracking-widest block font-mono">Penerimaan Kontrak Pihak Ke-3</span>
            <h3 class="text-2xl font-black text-teal-900 leading-tight mt-1">Rp <?php echo number_format($total_revenue_lease, 0, ',', '.'); ?></h3>
            <p class="text-[10px] text-teal-650 font-mono">Potensi pendapatan asli desa (PAD) tahun berjalan</p>
        </div>
    </div>

    <!-- Tab navigation panels -->
    <div class="flex border-b border-slate-200 gap-1 font-sans">
        <a href="?tab=penggunaan" class="py-2.5 px-4 font-bold text-xs uppercase tracking-wide border-b-2 transition <?php echo ($active_tab==='penggunaan') ? 'border-slate-900 text-slate-900 bg-white/50' : 'border-transparent text-slate-400 hover:text-slate-800'; ?>">
            1. Penetapan Penggunaan Intern (SK Kades)
        </a>
        <a href="?tab=pemanfaatan" class="py-2.5 px-4 font-bold text-xs uppercase tracking-wide border-b-2 transition <?php echo ($active_tab==='pemanfaatan') ? 'border-slate-900 text-slate-900 bg-white/50' : 'border-transparent text-slate-400 hover:text-slate-800'; ?>">
            2. Pemanfaatan &amp; Sewa Pihak Ketiga (KSP/BGS)
        </a>
    </div>

    <!-- Operation Messages info banners -->
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

    <!-- TAB 1 CONTENT: PENGGUNAAN INTERNAL -->
    <?php if ($active_tab === 'penggunaan'): ?>
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-200 text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
                            <th class="px-4 py-3">No. Berkas SK</th>
                            <th class="px-4 py-3">Aset Terkait</th>
                            <th class="px-4 py-3">Instansi / Penanggung Jawab</th>
                            <th class="px-4 py-3">Tanggal Penyerahan</th>
                            <th class="px-4 py-3 text-center">Status</th>
                            <th class="px-4 py-3 text-right">Tindakan</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <?php if (count($usage_list) > 0): ?>
                            <?php foreach ($usage_list as $row): ?>
                                <tr class="hover:bg-slate-50/50 transition duration-150">
                                    <td class="px-4 py-4 font-mono font-bold text-slate-900 select-all">
                                        <div class="flex items-center gap-1.5">
                                            <i data-lucide="file-text" class="h-4 w-4 text-slate-400 shrink-0"></i>
                                            <span><?php echo htmlspecialchars($row['sk']); ?></span>
                                        </div>
                                    </td>
                                    <td class="px-4 py-4">
                                        <div class="font-semibold text-slate-900"><?php echo htmlspecialchars($row['nama_barang']); ?></div>
                                        <div class="text-[10px] text-slate-400 mt-0.5">Asset ID: <?php echo htmlspecialchars($row['barang_id']); ?></div>
                                    </td>
                                    <td class="px-4 py-4 font-medium text-slate-700">
                                        <?php echo htmlspecialchars($row['pengguna']); ?>
                                    </td>
                                    <td class="px-4 py-4 font-medium text-slate-600">
                                        <?php echo date('d M Y', strtotime($row['tanggal'])); ?>
                                    </td>
                                    <td class="px-4 py-4 text-center">
                                        <span class="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider <?php echo ($row['status'] === 'Berjalan') ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-600 border border-slate-200'; ?>">
                                            <?php echo htmlspecialchars($row['status']); ?>
                                        </span>
                                    </td>
                                    <td class="px-4 py-4 text-right">
                                        <div class="inline-flex gap-1.5">
                                            <button onclick="editPenggunaan(<?php echo htmlspecialchars(json_encode($row)); ?>)" class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-755 rounded p-1.5 shadow-xxs transition cursor-pointer">
                                                <i data-lucide="edit" class="h-3.5 w-3.5"></i>
                                            </button>
                                            <button onclick="confirmDelUsage('<?php echo $row['id']; ?>')" class="bg-white border border-rose-100 hover:bg-rose-50 text-rose-650 rounded p-1.5 shadow-xxs transition cursor-pointer">
                                                <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colSpan="6" class="px-4 py-20 text-center text-slate-400 italic">Belum ada SK penetapan penggunaan yang terekam. Silakan gunakan tombol di atas untuk mendaftarkan berkas SK.</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    <?php endif; ?>

    <!-- TAB 2 CONTENT: PEMANFAATAN PIHAK KETIGA -->
    <?php if ($active_tab === 'pemanfaatan'): ?>
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-200 text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
                            <th class="px-4 py-3">Nama Mitra / Pihak Ke-3</th>
                            <th class="px-4 py-3">Aset Terkait</th>
                            <th class="px-4 py-3">Tipe Pemanfaatan</th>
                            <th class="px-4 py-3">Durasi Periode Kontrak</th>
                            <th class="px-4 py-3 text-right">Nilai Sewa (Kontrak)</th>
                            <th class="px-4 py-3 text-center">Status</th>
                            <th class="px-4 py-3 text-right">Tindakan</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <?php if (count($lease_list) > 0): ?>
                            <?php foreach ($lease_list as $row): ?>
                                <tr class="hover:bg-slate-50/50 transition duration-150">
                                    <td class="px-4 py-4 font-bold text-slate-900">
                                        <div class="flex items-center gap-1.5">
                                            <i data-lucide="user" class="h-4 w-4 text-slate-400 shrink-0"></i>
                                            <span><?php echo htmlspecialchars($row['mitra']); ?></span>
                                        </div>
                                    </td>
                                    <td class="px-4 py-4">
                                        <div class="font-semibold text-slate-900"><?php echo htmlspecialchars($row['nama_barang']); ?></div>
                                        <div class="text-[10px] text-slate-400 mt-0.5">Asset ID: <?php echo htmlspecialchars($row['barang_id']); ?></div>
                                    </td>
                                    <td class="px-4 py-4 font-bold text-slate-800">
                                        <span class="bg-amber-100/50 text-amber-800 border-amber-200 px-2 py-0.5 rounded text-[10px] border">
                                            <?php echo htmlspecialchars($row['jenis']); ?>
                                        </span>
                                    </td>
                                    <td class="px-4 py-4 font-medium text-slate-650 leading-relaxed font-mono">
                                        <?php echo date('d M Y', strtotime($row['periode_mulai'])) . " s.d " . date('d M Y', strtotime($row['periode_selesai'])); ?>
                                    </td>
                                    <td class="px-4 py-4 text-right font-mono font-black text-slate-900">
                                        Rp <?php echo number_format($row['nilai_kontrak'], 2, ',', '.'); ?>
                                    </td>
                                    <td class="px-4 py-4 text-center">
                                        <span class="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider <?php echo ($row['status'] === 'Aktif') ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'; ?>">
                                            <?php echo htmlspecialchars($row['status']); ?>
                                        </span>
                                    </td>
                                    <td class="px-4 py-4 text-right">
                                        <div class="inline-flex gap-1.5">
                                            <button onclick="editPemanfaatan(<?php echo htmlspecialchars(json_encode($row)); ?>)" class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-755 rounded p-1.5 shadow-xxs transition cursor-pointer">
                                                <i data-lucide="edit" class="h-3.5 w-3.5"></i>
                                            </button>
                                            <button onclick="confirmDelLease('<?php echo $row['id']; ?>')" class="bg-white border border-rose-100 hover:bg-rose-50 text-rose-650 rounded p-1.5 shadow-xxs transition cursor-pointer">
                                                <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colSpan="7" class="px-4 py-20 text-center text-slate-400 italic">Belum ada kontrak kerjasama atau sewa pihak ketiga yang terekam. Klik tombol di atas untuk entry.</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    <?php endif; ?>
</div>

<!-- ==================== DIALOG FORM MODALS ==================== -->

<!-- 1. MODAL PENGGUNAAN -->
<div id="modal-penggunaan" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur p-4 overflow-y-auto hidden">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-left my-8 animate-fade-in">
        <form method="POST" class="space-y-4">
            <input type="hidden" name="action" id="penggunaan-action" value="add_penggunaan">
            <input type="hidden" name="id" id="penggunaan-id" value="">

            <div class="flex justify-between items-center border-b border-slate-150 pb-3">
                <span id="penggunaan-modal-title" class="text-xs font-black text-blue-900 uppercase flex items-center gap-1.5">
                    <i data-lucide="file-check" class="h-4.5 w-4.5 text-blue-600"></i> entry berkas sk guna kades
                </span>
                <button type="button" onclick="closeFormModal('penggunaan')" class="text-slate-450 hover:text-slate-700 font-bold text-xs cursor-pointer">✕</button>
            </div>

            <div class="space-y-3.5 text-xs">
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nomor Berkas SK Kades</label>
                    <input type="text" name="sk" id="penggunaan-sk" required placeholder="Contoh: SK.142/02/VII/2026" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold text-slate-900">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pilih Barang dari KIB</label>
                    <select name="barang_id" id="penggunaan-barang_id" required class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold text-slate-800">
                        <option value="">-- Pilih Aset Terdaftar --</option>
                        <?php foreach($all_assets as $a): ?>
                            <option value="<?php echo htmlspecialchars($a['id']); ?>">
                                [<?php echo htmlspecialchars($a['kategori']); ?>] <?php echo htmlspecialchars($a['nama_barang']); ?> (Kondisi: <?php echo htmlspecialchars($a['kondisi']); ?>)
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Penerima Kekuasaan Pakai (Pengguna)</label>
                    <input type="text" name="pengguna" id="penggunaan-pengguna" required placeholder="Contoh: Sekretariat Desa / Sitorus Ginting" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold text-slate-900">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tanggal Berlaku / Penyerahan</label>
                    <input type="date" name="tanggal" id="penggunaan-tanggal" required class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold text-slate-900">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Penggunaan</label>
                    <select name="status" id="penggunaan-status" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold text-slate-800">
                        <option value="Berjalan">Berjalan</option>
                        <option value="Selesai">Selesai / Dicabut</option>
                    </select>
                </div>
            </div>

            <div class="flex justify-end pt-3 gap-2 border-t border-slate-100">
                <button type="button" onclick="closeFormModal('penggunaan')" class="rounded-lg border border-slate-250 hover:bg-slate-50 font-bold py-2 px-4 transition text-slate-700 cursor-pointer">Batal</button>
                <button type="submit" class="rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-5 shadow-sm transition cursor-pointer">Simpan Data Guna</button>
            </div>
        </form>
    </div>
</div>

<!-- 2. MODAL PEMANFAATAN -->
<div id="modal-pemanfaatan" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur p-4 overflow-y-auto hidden">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-left my-8 animate-fade-in">
        <form method="POST" class="space-y-4">
            <input type="hidden" name="action" id="pemanfaatan-action" value="add_pemanfaatan">
            <input type="hidden" name="id" id="pemanfaatan-id" value="">

            <div class="flex justify-between items-center border-b border-slate-150 pb-3">
                <span id="pemanfaatan-modal-title" class="text-xs font-black text-indigo-900 uppercase flex items-center gap-1.5">
                    <i data-lucide="file-check" class="h-4.5 w-4.5 text-indigo-600"></i> RESTRUKTURISASI / KONTRAK SEWA ASET
                </span>
                <button type="button" onclick="closeFormModal('pemanfaatan')" class="text-slate-450 hover:text-slate-700 font-bold text-xs cursor-pointer">✕</button>
            </div>

            <div class="space-y-3.5 text-xs">
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pilih Barang dari KIB</label>
                    <select name="barang_id" id="pemanfaatan-barang_id" required class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-semibold text-slate-800">
                        <option value="">-- Pilih Aset Terdaftar --</option>
                        <?php foreach($all_assets as $a): ?>
                            <option value="<?php echo htmlspecialchars($a['id']); ?>">
                                [<?php echo htmlspecialchars($a['kategori']); ?>] <?php echo htmlspecialchars($a['nama_barang']); ?> (Kondisi: <?php echo htmlspecialchars($a['kondisi']); ?>)
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Jenis Pemanfaatan / Sewa</label>
                    <select name="jenis" id="pemanfaatan-jenis" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-semibold text-slate-800">
                        <option value="Sewa">Sewa Aset / Kios</option>
                        <option value="Pinjam Pakai">Pinjam Pakai Instansi</option>
                        <option value="Kerjasama Pemanfaatan">Kerjasama Pemanfaatan (KSP)</option>
                        <option value="Bangun Guna Serah">Bangun Guna Serah / Bangun Serah Guna (BGS/BSG)</option>
                    </select>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nama Mitra / Pihak Ke-3</label>
                    <input type="text" name="mitra" id="pemanfaatan-mitra" required placeholder="Contoh: PT. Sumber Makmur Jasa / BUMN Lombok" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-semibold text-slate-900">
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mulai Kontrak</label>
                        <input type="date" name="periode_mulai" id="pemanfaatan-periode_mulai" required class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-semibold text-slate-900">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Selesai Kontrak</label>
                        <input type="date" name="periode_selesai" id="pemanfaatan-periode_selesai" required class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-semibold text-slate-900">
                    </div>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nilai Kontrak Kompensasi (Rp)</label>
                    <input type="number" name="nilai_kontrak" id="pemanfaatan-nilai_kontrak" required placeholder="Masukkan nominal, contoh: 24500000" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-bold font-mono text-slate-900">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Sewa</label>
                    <select name="status" id="pemanfaatan-status" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-semibold text-slate-800">
                        <option value="Aktif">Aktif</option>
                        <option value="Selesai">Selesai</option>
                    </select>
                </div>
            </div>

            <div class="flex justify-end pt-3 gap-2 border-t border-slate-100">
                <button type="button" onclick="closeFormModal('pemanfaatan')" class="rounded-lg border border-slate-250 hover:bg-slate-50 font-bold py-2 px-4 transition text-slate-700 cursor-pointer">Batal</button>
                <button type="submit" class="rounded-lg bg-indigo-900 hover:bg-indigo-850 text-white font-bold py-2 px-5 shadow-sm transition cursor-pointer">Simpan Kontrak</button>
            </div>
        </form>
    </div>
</div>

<!-- DELETE PENGGUNAAN POST DRIVER FORM -->
<form id="form-delete-penggunaan" method="POST" class="hidden">
    <input type="hidden" name="action" value="delete_penggunaan">
    <input type="hidden" name="id" id="del-penggunaan-id" value="">
</form>

<!-- DELETE PEMANFAATAN POST DRIVER FORM -->
<form id="form-delete-pemanfaatan" method="POST" class="hidden">
    <input type="hidden" name="action" value="delete_pemanfaatan">
    <input type="hidden" name="id" id="del-pemanfaatan-id" value="">
</form>

<script>
    function openFormModal(type) {
        if (type === 'penggunaan') {
            document.getElementById('penggunaan-action').value = 'add_penggunaan';
            document.getElementById('penggunaan-id').value = '';
            document.getElementById('penggunaan-sk').value = '';
            document.getElementById('penggunaan-barang_id').value = '';
            document.getElementById('penggunaan-pengguna').value = '';
            document.getElementById('penggunaan-tanggal').value = '';
            document.getElementById('penggunaan-status').value = 'Berjalan';
            document.getElementById('penggunaan-modal-title').textContent = 'ENTRY BERKAS SK GUNA KADES';
            document.getElementById('modal-penggunaan').classList.remove('hidden');
        } else if (type === 'pemanfaatan') {
            document.getElementById('pemanfaatan-action').value = 'add_pemanfaatan';
            document.getElementById('pemanfaatan-id').value = '';
            document.getElementById('pemanfaatan-barang_id').value = '';
            document.getElementById('pemanfaatan-jenis').value = 'Sewa';
            document.getElementById('pemanfaatan-mitra').value = '';
            document.getElementById('pemanfaatan-periode_mulai').value = '';
            document.getElementById('pemanfaatan-periode_selesai').value = '';
            document.getElementById('pemanfaatan-nilai_kontrak').value = '';
            document.getElementById('pemanfaatan-status').value = 'Aktif';
            document.getElementById('pemanfaatan-modal-title').textContent = 'RESTRUKTURISASI / KONTRAK SEWA ASET';
            document.getElementById('modal-pemanfaatan').classList.remove('hidden');
        }
    }

    function closeFormModal(type) {
        if (type === 'penggunaan') {
            document.getElementById('modal-penggunaan').classList.add('hidden');
        } else if (type === 'pemanfaatan') {
            document.getElementById('modal-pemanfaatan').classList.add('hidden');
        }
    }

    function editPenggunaan(data) {
        document.getElementById('penggunaan-action').value = 'edit_penggunaan';
        document.getElementById('penggunaan-id').value = data.id;
        document.getElementById('penggunaan-sk').value = data.sk;
        document.getElementById('penggunaan-barang_id').value = data.barang_id;
        document.getElementById('penggunaan-pengguna').value = data.pengguna;
        document.getElementById('penggunaan-tanggal').value = data.tanggal;
        document.getElementById('penggunaan-status').value = data.status;
        document.getElementById('penggunaan-modal-title').textContent = 'REVISI PENETAPAN PENGGUNAAN SK';
        document.getElementById('modal-penggunaan').classList.remove('hidden');
    }

    function confirmDelUsage(id) {
        if (confirm("Apakah Anda benar-benar yakin ingin menghapus penetapan penggunaan SK "+id+" ini secara permanen dari basis data?")) {
            document.getElementById('del-penggunaan-id').value = id;
            document.getElementById('form-delete-penggunaan').submit();
        }
    }

    function editPemanfaatan(data) {
        document.getElementById('pemanfaatan-action').value = 'edit_pemanfaatan';
        document.getElementById('pemanfaatan-id').value = data.id;
        document.getElementById('pemanfaatan-barang_id').value = data.barang_id;
        document.getElementById('pemanfaatan-jenis').value = data.jenis;
        document.getElementById('pemanfaatan-mitra').value = data.mitra;
        document.getElementById('pemanfaatan-periode_mulai').value = data.periode_mulai;
        document.getElementById('pemanfaatan-periode_selesai').value = data.periode_selesai;
        document.getElementById('pemanfaatan-nilai_kontrak').value = data.nilai_kontrak;
        document.getElementById('pemanfaatan-status').value = data.status;
        document.getElementById('pemanfaatan-modal-title').textContent = 'REVISI RIWAYAT KONTRAK SEWA / KSP';
        document.getElementById('modal-pemanfaatan').classList.remove('hidden');
    }

    function confirmDelLease(id) {
        if (confirm("Hapus rekam pemanfaatan dengan ID "+id+"?")) {
            document.getElementById('del-pemanfaatan-id').value = id;
            document.getElementById('form-delete-pemanfaatan').submit();
        }
    }
</script>

<?php require_once 'footer.php'; ?>
