<?php
/**
 * ==============================================================================
 *                       SIPADES SMART v4.5 - PROFILE & STAFF DIRECTORY
 *                 SISTEM INFORMASI PENGELOLAAN ASET DESA RARANG SELATAN
 * ==============================================================================
 */
require_once 'header.php';

$success_msg = "";
$error_msg = "";

// 1. UPDATE DATA PROFIL DESA (PROSEDUR POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_profile') {
    try {
        $kode_desa = safeInput($_POST['kode_desa']);
        $nama_desa = safeInput($_POST['nama_desa']);
        $kecamatan = safeInput($_POST['kecamatan']);
        $kabupaten = safeInput($_POST['kabupaten']);
        $provinsi = safeInput($_POST['provinsi']);
        $logo = safeInput($_POST['logo']) ?: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Lambang_Dati_II_Lombok_Timur.png';

        if (empty($kode_desa) || empty($nama_desa) || empty($kecamatan) || empty($kabupaten)) {
            $error_msg = "Isian Kode Wilayah, Nama Desa, Kecamatan, dan Kabupaten wajib diisi.";
        } else {
            $stmt = $pdo->prepare("UPDATE profil_desa SET nama_desa = ?, kecamatan = ?, kabupaten = ?, provinsi = ?, logo = ? WHERE kode_desa = ?");
            $stmt->execute([$nama_desa, $kecamatan, $kabupaten, $provinsi, $logo, $kode_desa]);
            
            // Perbarui data session
            $_SESSION['desa_nama'] = $nama_desa;
            $_SESSION['desa_logo'] = $logo;

            $success_msg = "Data profil administrasi Desa Rarang Selatan berhasil diperbarui!";
            
            // Muat ulang data terbaru
            $profil_desa['nama_desa'] = $nama_desa;
            $profil_desa['kecamatan'] = $kecamatan;
            $profil_desa['kabupaten'] = $kabupaten;
            $profil_desa['provinsi'] = $provinsi;
            $profil_desa['logo'] = $logo;
        }
    } catch (Exception $e) {
        $error_msg = "Gagal memperbarui profil: " . $e->getMessage();
    }
}

// 2. TAMBAH ANGGOTA PERANGKAT DESA BARU
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_staff') {
    try {
        $id = "P-" . rand(10, 99);
        $nama = safeInput($_POST['nama']);
        $jabatan = safeInput($_POST['jabatan']);
        $nip = safeInput($_POST['nip']);
        $status = 'Aktif';

        if (empty($nama) || empty($jabatan) || empty($nip)) {
            $error_msg = "Isian Nama Lengkap, Jabatan, dan NIP wajib diisi.";
        } else {
            $stmt = $pdo->prepare("INSERT INTO perangkat_desa (id, nama, jabatan, nip, status) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$id, $nama, $jabatan, $nip, $status]);
            $success_msg = "Perangkat desa baru berhasil terdaftar di struktural kabinet!";
        }
    } catch (Exception $e) {
        $error_msg = "Gagal mendaftarkan nama: " . $e->getMessage();
    }
}

// 3. AMBIL DATA TERBARU
$profil_desa = $pdo->query("SELECT * FROM profil_desa LIMIT 1")->fetch();
$staff_list = $pdo->query("SELECT * FROM perangkat_desa ORDER BY jabatan ASC")->fetchAll();
?>

<div class="space-y-6 text-left">
    
    <div>
        <h1 class="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <i data-lucide="home" class="h-5 w-5 text-emerald-600"></i> Profil Pemerintahan &amp; Perangkat Desa
        </h1>
        <p class="text-xs text-slate-500 mt-1">Konfigurasi profile wilayah Lombok Timur, identifikasi Kode Kemendagri, dan validasi paraf pejabat pembuat komitmen (KPA).</p>
    </div>

    <!-- Alert Notifications -->
    <?php if (!empty($success_msg)): ?>
        <div class="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs font-bold flex items-center gap-2 animate-pulse">
            <i data-lucide="check-circle" class="h-4.5 w-4.5 text-emerald-600"></i>
            <span><?php echo htmlspecialchars($success_msg); ?></span>
        </div>
    <?php endif; ?>

    <?php if (!empty($error_msg)): ?>
        <div class="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-xs font-bold flex items-center gap-2">
            <i data-lucide="alert-circle" class="h-4.5 w-4.5 text-rose-600"></i>
            <span><?php echo htmlspecialchars($error_msg); ?></span>
        </div>
    <?php endif; ?>

    <!-- Bento Grid Segment -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- PANEL LEFT: EDIT PROFIL DESA -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 class="text-xs font-black text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <i data-lucide="settings" class="h-4.5 w-4.5 text-emerald-600"></i> Informasi Geopolitik Wilayah
            </h3>

            <form action="" method="POST" class="space-y-4 text-xs font-sans">
                <input type="hidden" name="action" value="update_profile">

                <div class="space-y-1">
                    <label class="block font-bold text-slate-500 uppercase">Kode Desa Administrasi Kemendagri:</label>
                    <input type="text" name="kode_desa" value="<?php echo htmlspecialchars($profil_desa['kode_desa']); ?>" readonly
                           class="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono font-bold text-slate-500 shadow-inner outline-none cursor-not-allowed">
                    <span class="block text-[10px] text-slate-400 mt-1 italic">Kode ini terkunci secara definitif di Lombok Timur.</span>
                </div>

                <div class="space-y-1">
                    <label class="block font-bold text-slate-700 uppercase">Nama Instansi Desa:</label>
                    <input type="text" name="nama_desa" value="<?php echo htmlspecialchars($profil_desa['nama_desa']); ?>" required
                           class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                </div>

                <div class="grid grid-cols-3 gap-3">
                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Kecamatan:</label>
                        <input type="text" name="kecamatan" value="<?php echo htmlspecialchars($profil_desa['kecamatan']); ?>" required
                               class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                    </div>

                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Kabupaten:</label>
                        <input type="text" name="kabupaten" value="<?php echo htmlspecialchars($profil_desa['kabupaten']); ?>" required
                               class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                    </div>

                    <div class="space-y-1">
                        <label class="block font-bold text-slate-700 uppercase">Provinsi:</label>
                        <input type="text" name="provinsi" value="<?php echo htmlspecialchars($profil_desa['provinsi']); ?>" required
                               class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                    </div>
                </div>

                <div class="space-y-1">
                    <label class="block font-bold text-slate-700 uppercase">URL Link Logo Daerah (Lambang Kabupaten):</label>
                    <input type="url" name="logo" value="<?php echo htmlspecialchars($profil_desa['logo']); ?>"
                           class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                </div>

                <button type="submit" 
                        class="w-full bg-slate-900 hover:bg-slate-800 text-white font-black p-3 rounded-lg uppercase tracking-wider text-xs shadow-md transition duration-150 cursor-pointer">
                    Simpan Perubahan Geopolitik
                </button>
            </form>
        </div>

        <!-- PANEL RIGHT: DAFTAR PERANGKAT / STAF DESA -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div class="space-y-4">
                <div class="border-b border-slate-100 pb-2 flex justify-between items-center">
                    <h3 class="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <i data-lucide="users" class="h-4.5 w-4.5 text-emerald-600"></i> Struktural Kabinet Desa Rarang Selatan
                    </h3>
                    <button onclick="document.getElementById('add-staff-modal').classList.remove('hidden')" 
                            class="text-[10px] bg-emerald-55 text-emerald-800 border border-emerald-100 hover:bg-emerald-100 p-1 px-2.5 font-bold rounded cursor-pointer transition">
                        + Tambah Staf
                    </button>
                </div>

                <div class="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    <?php if (empty($staff_list)): ?>
                        <p class="text-xs text-slate-400 italic text-center py-6">Belum ada staff terekam.</p>
                    <?php else: ?>
                        <?php foreach ($staff_list as $stf): ?>
                            <div class="p-3 bg-slate-50 border border-slate-150 rounded-lg flex justify-between items-center text-xs text-left">
                                <div class="space-y-0.5">
                                    <span class="text-xs font-extrabold text-slate-900 block"><?php echo htmlspecialchars($stf['nama']); ?></span>
                                    <span class="block text-[10px] text-slate-400 font-mono">NIP: <?php echo htmlspecialchars($stf['nip']); ?></span>
                                </div>
                                <div class="text-right">
                                    <span class="bg-slate-900 text-white font-mono text-[9.5px] font-bold px-2 py-0.5 rounded capitalize">
                                        <?php echo htmlspecialchars($stf['jabatan']); ?>
                                    </span>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>

            <p class="text-[10px] text-slate-400 text-center font-mono leading-relaxed pt-2">
                Staf di atas bertindak selaku Pengawas Pemanfaatan, KPA (Kuasa Pengguna Anggaran) Siskeudes APBDes, &amp; Penilai Aset.
            </p>
        </div>

    </div>

    <!-- MODAL POPUP: ADD STAFF FORM -->
    <div id="add-staff-modal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
        <div class="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl animate-scale-up text-left">
            <div class="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 class="text-xs font-black text-slate-900 uppercase">Daftarkan Staf Desa</h3>
                <button onclick="document.getElementById('add-staff-modal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600">
                    <i data-lucide="x" class="h-5 w-5"></i>
                </button>
            </div>

            <form action="" method="POST" class="space-y-4 text-xs pt-2">
                <input type="hidden" name="action" value="add_staff">

                <div class="space-y-1">
                    <label class="block font-bold text-slate-700 uppercase">Nama Lengkap &amp; Gelar:</label>
                    <input type="text" name="nama" placeholder="Contoh: Supriadi, S.IP." required
                           class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                </div>

                <div class="space-y-1">
                    <label class="block font-bold text-slate-700 uppercase">Nomor Induk Pegawai (NIP):</label>
                    <input type="text" name="nip" placeholder="Contoh: 19800412..." required
                           class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500">
                </div>

                <div class="space-y-1">
                    <label class="block font-bold text-slate-700 uppercase">Jabatan Struktural:</label>
                    <select name="jabatan" required class="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 font-bold text-slate-850">
                        <option value="Sekretaris Desa">Sekretaris Desa</option>
                        <option value="Kaur Umum">Kaur Umum / Inventaris</option>
                        <option value="Kaur Keuangan">Kaur Keuangan / Siskeudes</option>
                        <option value="Kepala Dusun">Kepala Dusun Rarang</option>
                        <option value="Kader Posyandu">Kader Posyandu Mawar</option>
                    </select>
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="submit" class="flex-1 bg-slate-900 hover:bg-slate-850 text-white font-extrabold p-3 rounded-lg text-xs cursor-pointer transition">
                        Simpan Perangkat
                    </button>
                    <button type="button" onclick="document.getElementById('add-staff-modal').classList.add('hidden')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-3 px-6 rounded-lg text-xs cursor-pointer transition">
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
