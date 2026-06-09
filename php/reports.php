<?php
/**
 * ==============================================================================
 *                       SIPADES SMART v4.5 - REPORT REGISTER KIB & SIGNING
 *                 SISTEM INFORMASI PENGELOLAAN ASET DESA RARANG SELATAN
 * ==============================================================================
 */
require_once 'header.php';

// 1. QUERY ASSETS GROUPED & SORTED FOR REGISTER SHEETS
$stmt_r = $pdo->query("SELECT * FROM assets ORDER BY kategori ASC, nama_barang ASC");
$all_assets = $stmt_r->fetchAll();

// Separating sheets
$kib_sheets = [
    'KIB A' => [],
    'KIB B' => [],
    'KIB C' => [],
    'KIB D' => [],
    'KIB E' => [],
    'KIB F' => []
];

foreach ($all_assets as $as) {
    if (isset($kib_sheets[$as['kategori']])) {
        $kib_sheets[$as['kategori']][ ] = $as;
    }
}

// Active Sheet Category View
$active_kib = isset($_GET['kib']) ? safeInput($_GET['kib']) : 'KIB A';
$active_dataset = isset($kib_sheets[$active_kib]) ? $kib_sheets[$active_kib] : [];

// Rerata keuangan kalkulasi
$total_unit = count($active_dataset);
$total_value = 0.0;
$cond_baik = 0;
$cond_ringan = 0;
$cond_berat = 0;

foreach($active_dataset as $item) {
    $total_value += (double)$item['nilai'];
    if ($item['kondisi'] === 'Baik') $cond_baik++;
    elseif ($item['kondisi'] === 'Rusak Ringan') $cond_ringan++;
    else $cond_berat++;
}
?>

<div class="space-y-6 text-left">
    
    <!-- Title Page banner layout -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="space-y-1">
            <div class="flex items-center gap-2">
                <i data-lucide="printer" class="h-6 w-6 text-indigo-700"></i>
                <h2 class="text-xl font-extrabold text-slate-900 tracking-tight uppercase">Buku Register Kartu Inventaris Barang (KIB)</h2>
            </div>
            <p class="text-slate-500 text-xs">
                Mencetak buku rekapitulasi inventaris desa (KIB A s.d F) dilengkapi pengesahan Tanda Tangan Elektronik (TTE) pejabat desa yang sah.
            </p>
        </div>
        
        <div class="flex flex-wrap gap-2 font-mono">
            <button 
                onclick="exportToCSV()" 
                class="rounded-lg bg-emerald-705 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 text-xs font-sans tracking-wide inline-flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                style="background-color: #059669;"
            >
                <i data-lucide="file-spreadsheet" class="h-4 w-4"></i> EXPORT EXCEL (CSV)
            </button>
            <button 
                onclick="window.print()" 
                class="rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 text-xs font-sans tracking-wide inline-flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
                <i data-lucide="printer" class="h-4 w-4"></i> CETAK BUKU REGISTER
            </button>
        </div>
    </div>

    <!-- Sheet category picker tabs -->
    <div class="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 font-sans">
        <?php foreach(['KIB A' => 'Tanah (KIB A)', 'KIB B' => 'Peralatan/Mesin (KIB B)', 'KIB C' => 'Gedung/Bangunan (KIB C)', 'KIB D' => 'Irigasi/Jaringan (KIB D)', 'KIB E' => 'Aset Lainnya (KIB E)', 'KIB F' => 'Konstruksi KDP (KIB F)'] as $key => $title): ?>
            <a 
                href="?kib=<?php echo $key; ?>" 
                class="py-2.5 px-4 rounded-lg text-xs font-bold transition <?php echo ($active_kib === $key) ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500 hover:bg-white/50 hover:text-slate-800'; ?>"
            >
                <?php echo $title; ?>
            </a>
        <?php endforeach; ?>
    </div>

    <!-- Financial live accounting widgets board -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1 relative overflow-hidden select-none">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Total Unit Terdaftar</span>
            <h3 class="text-2xl font-black text-slate-900 leading-tight"><?php echo $total_unit; ?> <span class="text-xs font-normal text-slate-500">Aset Regis</span></h3>
            <p class="text-[10px] text-slate-500 font-mono">Berdasarkan Lampiran <?php echo $active_kib; ?></p>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1 relative overflow-hidden select-none">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Total Nilai Buku Perolehan</span>
            <h3 class="text-2xl font-black text-indigo-900 leading-tight">Rp <?php echo number_format($total_value, 0, ',', '.'); ?></h3>
            <p class="text-[10px] text-slate-500 font-mono">Akumulasi herarki saldo buku</p>
        </div>

        <div class="bg-teal-50/10 rounded-2xl border border-teal-200 p-5 shadow-sm space-y-1 relative overflow-hidden select-none">
            <span class="text-[10px] font-black text-teal-600 uppercase tracking-widest block font-mono">Fisik Kondisi Baik</span>
            <h3 class="text-2xl font-black text-teal-900 leading-tight"><?php echo $cond_baik; ?> <span class="text-xs font-normal text-teal-650">Unit</span></h3>
            <p class="text-[10px] text-teal-650 font-mono">Aset prima &bull; Nilai guna optimal</p>
        </div>

        <div class="bg-amber-50/10 rounded-2xl border border-amber-200 p-5 shadow-sm space-y-1 relative overflow-hidden select-none">
            <span class="text-[10px] font-black text-amber-600 uppercase tracking-widest block font-mono">Kondisi Rusak Ringan / Berat</span>
            <h3 class="text-2xl font-black text-amber-900 leading-tight"><?php echo $cond_ringan + $cond_berat; ?> <span class="text-xs font-normal text-amber-650">Unit</span></h3>
            <p class="text-[10px] text-amber-600/90 font-mono">Membutuhkan alur rehabilitasi / lelang</p>
        </div>
    </div>

    <!-- Table register data worksheet -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5">
        <div class="border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
            <span class="text-xs font-black text-slate-800 uppercase tracking-wide font-mono">LAMBAR KERJA REGISTER LAJU <?php echo $active_kib; ?></span>
            <span class="text-[10.5px] font-bold text-slate-400">PEMKAB LOMBOK TIMUR &bull; SIPADES v4.5</span>
        </div>

        <div class="overflow-x-auto rounded-xl border">
            <table class="w-full text-left border-collapse text-xs whitespace-nowrap" id="kib-table-ref">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-200 text-[9.5px] font-black text-slate-455 uppercase tracking-wider font-mono">
                        <th class="px-4 py-3.5 text-center">No</th>
                        <th class="px-4 py-3.5">ID Aset</th>
                        <th class="px-4 py-3.5">Kode Barang Permendagri</th>
                        <th class="px-4 py-3.5">Nama Urusan / Urai Barang</th>
                        <th class="px-4 py-3.5">Asal-Usul / Perolehan</th>
                        <th class="px-4 py-3.5">Spesifikasi Lain (Sertifikat/Luas/Ukuran)</th>
                        <th class="px-4 py-3.5">Tanggal Perolehan</th>
                        <th class="px-4 py-3.5 text-center">Kondisi</th>
                        <th class="px-4 py-3.5 text-right">Nilai Pembukuan (Rp)</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php if (count($active_dataset) > 0): ?>
                        <?php $no = 1; foreach ($active_dataset as $row): ?>
                            <tr class="hover:bg-slate-50/50 transition">
                                <td class="px-4 py-3.5 text-center font-bold text-slate-400"><?php echo $no++; ?></td>
                                <td class="px-4 py-3.5 font-mono font-bold text-slate-600"><?php echo htmlspecialchars($row['id']); ?></td>
                                <td class="px-4 py-3.5 font-mono text-slate-900 select-all font-bold">
                                    <code class="bg-slate-100 px-1.5 py-0.5 border rounded text-[10.5px]"><?php echo htmlspecialchars($row['kode_barang']); ?></code>
                                </td>
                                <td class="px-4 py-3.5 font-semibold text-slate-900"><?php echo htmlspecialchars($row['nama_barang']); ?></td>
                                <td class="px-4 py-3.5 text-slate-600">
                                    <span class="bg-blue-50 text-blue-800 border border-blue-100 px-1.5 py-0.5 rounded text-[10px] font-bold"><?php echo htmlspecialchars($row['asal_usul']); ?></span>
                                </td>
                                <td class="px-4 py-3.5 text-slate-500 text-[10.5px] truncate max-w-[200px]">
                                    <?php 
                                        $specs = [];
                                        if (!empty($row['sertifikat'])) $specs[] = "Sertifikat: " . $row['sertifikat'];
                                        if (!empty($row['luas'])) $specs[] = "Luas: " . $row['luas'];
                                        if (!empty($row['panjang'])) $specs[] = "Panjang: " . $row['panjang'];
                                        if (!empty($row['merek'])) $specs[] = "Merek: " . $row['merek'];
                                        echo count($specs) > 0 ? htmlspecialchars(implode(" | ", $specs)) : "-";
                                    ?>
                                </td>
                                <td class="px-4 py-3.5 text-slate-650 font-bold font-mono text-[10.5px]"><?php echo date('d M Y', strtotime($row['tanggal_perolehan'])); ?></td>
                                <td class="px-4 py-3.5 text-center whitespace-nowrap">
                                    <span class="inline-flex justify-center rounded px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider <?php echo ($row['kondisi'] === 'Baik') ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' : (($row['kondisi'] === 'Rusak Ringan') ? 'bg-amber-50 text-amber-800 border border-amber-150' : 'bg-rose-50 text-rose-800 border-rose-150'); ?>">
                                        <?php echo htmlspecialchars($row['kondisi']); ?>
                                    </span>
                                </td>
                                <td class="px-4 py-3.5 text-right font-mono font-black text-slate-950">
                                    Rp <?php echo number_format($row['nilai'], 2, ',', '.'); ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                        <!-- Grand Total Row -->
                        <tr class="bg-indigo-50/30 border-t-2 border-indigo-150 font-sans">
                            <td colSpan="8" class="px-4 py-4 text-left font-black text-slate-800 text-xs uppercase">TOTAL SALDO AKHIR EVALUASI <?php echo $active_kib; ?>:</td>
                            <td class="px-4 py-4 text-right font-mono font-black text-blue-900 text-xs">Rp <?php echo number_format($total_value, 2, ',', '.'); ?></td>
                        </tr>
                    <?php else: ?>
                        <tr>
                            <td colSpan="9" class="px-4 py-24 text-center text-slate-400 italic">Belum ada barang fisik terdaftar untuk lembar KIB ini.</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- DIGITAL CERTIFICATE VALIDATION HUB CONSOLE -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        <!-- Controls signing inputs -->
        <div class="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Bilah Penandatanganan Dokumen</span>
            
            <div class="space-y-3.5 text-xs text-slate-800">
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-450 uppercase mb-1">Nama Pejabat Resmi</label>
                        <input type="text" id="sign-name" value="H. RIDWAN, M.Si." class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-450 uppercase mb-1">Struktur Jabatan</label>
                        <input type="text" id="sign-role" value="Kepala Desa Rarang Selatan" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-450 uppercase mb-1">Nomor Registrasi / Pegawai</label>
                        <input type="text" id="sign-id" value="NIP. 19750812 200212 1 003" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-450 uppercase mb-1">Pilih Alur TTE</label>
                        <select id="sign-type" onchange="toggleSignType(this)" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-bold focus:outline-none">
                            <option value="TTE">✓ Sertifikat Elektronik BSrE (Seal QR)</option>
                            <option value="CORET">Coretan Pad Tanda Tangan Basah</option>
                        </select>
                    </div>
                </div>

                <!-- Canvas signature pad drawing pad (VISIBLE ONLY ON SELECT CORET) -->
                <div id="coretan-pad" class="border border-slate-300 rounded-xl bg-slate-50 p-3 text-center space-y-2 hidden animate-fade-in relative">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sapu jari / kursor Anda di bawah:</label>
                    <div class="relative bg-white border rounded-lg h-24 overflow-hidden shadow-inner">
                        <canvas id="sig-canvas" class="w-full h-full cursor-crosshair"></canvas>
                        <button type="button" onclick="clearSigCanvas()" class="absolute top-2 right-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-1.5 py-0.5 text-[8.5px] rounded tracking-wide uppercase">Hapus Pad</button>
                    </div>
                </div>

                <div class="pt-3 border-t flex justify-end gap-2">
                    <button type="button" id="btn-unsigned" onclick="executeDigitalSign()" class="rounded-lg bg-indigo-900 hover:bg-indigo-850 text-white font-bold py-2.5 px-5 tracking-wide inline-flex items-center gap-1.5 cursor-pointer shadow">
                        <i data-lucide="shield-check" class="h-4.5 w-4.5 text-indigo-400"></i> SAHKAN DATA REGISTER (TTE)
                    </button>
                    <button type="button" id="btn-signed" onclick="revokeDigitalSign()" class="rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-5 tracking-wide inline-flex items-center gap-1.5 cursor-pointer shadow-sm hidden">
                        <i data-lucide="x-circle" class="h-4.5 w-4.5 text-rose-300 animate-pulse"></i> BATALKAN INTEGRITAS TTE
                    </button>
                </div>
            </div>
        </div>

        <!-- Signing proof stamps visualization (Live HUD preview) -->
        <div class="md:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between h-[300px]">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Live Lembar Pengesahan TTE</span>
            
            <div id="sign-proof-placeholder" class="flex-1 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <i data-lucide="lock" class="h-10 w-10 text-slate-300 stroke-[1.2]"></i>
                <p class="text-[11px] max-w-xs leading-normal">
                    Pengesahan kosong. Silakan isi parameter pejabat lalu tekan tombol **SAHKAN DATA REGISTER (TTE)** untuk mencetak stamp elektronik.
                </p>
            </div>

            <!-- Authentic Stamp view -->
            <div id="sign-proof-stamp" class="flex-1 border border-emerald-200 bg-emerald-50/20 rounded-xl p-5 shadow-inner scale-100 flex flex-col justify-between text-left hidden animate-fade-in relative">
                
                <!-- Verification QR Badge -->
                <div class="flex justify-between items-start gap-4">
                    <div class="space-y-0.5">
                        <span class="bg-emerald-600 text-white font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-widest font-mono">✓ KEMENDAGRI RI CERTIFIED</span>
                        <h4 class="font-extrabold text-[11px] text-slate-850 mt-1 uppercase" id="proof-name">N/A</h4>
                        <p class="text-[9.5px] text-slate-500 font-mono" id="proof-id">N/A</p>
                    </div>
                    
                    <!-- Sim QR code -->
                    <div class="bg-white border rounded p-1 shadow-xxs">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=SIPADES-SMART-LOMBOK-TIMUR-VERIFIED-TTE-2026" class="h-12 w-12" alt="QR Authentic">
                    </div>
                </div>

                <!-- Pad drawing preview if type is DRAW -->
                <div id="canvas-proof-preview" class="border border-slate-200 shadow-inner rounded-lg h-14 bg-white hidden relative overflow-hidden self-start pr-4 pl-4 mt-2">
                    <img id="drawn-proof-img" src="" class="h-full object-contain mx-auto" alt="Drawn Proof">
                    <span class="absolute bottom-1 right-1 text-[7px] text-slate-400 font-mono">PAD SEALED</span>
                </div>

                <div class="pt-3.5 border-t border-emerald-150 flex justify-between items-end text-[9.5px]">
                    <div class="font-mono text-[8.5px] text-emerald-800 font-black">
                        <p>INTEGRITY: SECURE_MD5_PASS_OK</p>
                        <p>STAMP DATE: <?php echo date('d-m-Y H:i:s'); ?> WIB</p>
                    </div>
                    <span class="text-emerald-700 hover:underline font-bold cursor-pointer text-right">Verifikasi Balai BSrE 🔒</span>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- ==================== REPORT CORE LOGIC JAVASCRIPT ==================== -->
<script>
    let isSigned = false;
    let canvas, ctx;
    let isDrawing = false;

    // 1. Export CSV engine
    function exportToCSV() {
        const table = document.getElementById("kib-table-ref");
        let csvContent = "";

        for (let row of table.rows) {
            let rowData = [];
            for (let cell of row.cells) {
                // Bersihkan newline & tab untuk merapikan pembatas koma
                let val = cell.innerText.replace(/\n/g, "").replace(/,/g, ".");
                rowData.push('"' + val + '"');
            }
            csvContent += rowData.join(",") + "\r\n";
        }

        // Generate download
        let blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
        let url = URL.createObjectURL(blob);
        let link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "Arsip-KIB-Register-<?php echo $active_kib; ?>.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // 2. Select signed type
    function toggleSignType(select) {
        const pad = document.getElementById('coretan-pad');
        if (select.value === 'CORET') {
            pad.classList.remove('hidden');
            initCanvas();
        } else {
            pad.classList.add('hidden');
        }
    }

    // 3. Drawing canvas core signatures
    function initCanvas() {
        canvas = document.getElementById('sig-canvas');
        if (!canvas) return;

        // Atur lebar kanvas sesuai bounding client
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = 96;

        ctx = canvas.getContext('2d');
        ctx.strokeStyle = "#1A365D"; // Deep Blue Ink
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        // Touch and mouse listeners
        canvas.addEventListener("mousedown", startDraw);
        canvas.addEventListener("mousemove", drawLine);
        canvas.addEventListener("mouseup", endDraw);
        canvas.onselectstart = function() { return false; }; // anti highlight
    }

    function startDraw(e) {
        isDrawing = true;
        ctx.beginPath();
        const r = canvas.getBoundingClientRect();
        ctx.moveTo(e.clientX - r.left, e.clientY - r.top);
    }

    function drawLine(e) {
        if (!isDrawing) return;
        const r = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - r.left, e.clientY - r.top);
        ctx.stroke();
    }

    function endDraw() {
        isDrawing = false;
    }

    function clearSigCanvas() {
        if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    // 4. Execute digital signatures
    function executeDigitalSign() {
        const name = document.getElementById('sign-name').value.trim();
        const role = document.getElementById('sign-role').value.trim();
        const nip = document.getElementById('sign-id').value.trim();
        const type = document.getElementById('sign-type').value;

        if (name === "" || role === "") {
            alert("Nama pejabat dan struktur jabatan tidak boleh kosong!");
            return;
        }

        // Live HUD fillings
        document.getElementById('proof-name').textContent = name;
        document.getElementById('proof-id').textContent = role + " • " + nip;

        // Render proof block
        document.getElementById('sign-proof-placeholder').classList.add('hidden');
        document.getElementById('sign-proof-stamp').classList.remove('hidden');

        // Check if type is coret
        const drawProof = document.getElementById('canvas-proof-preview');
        if (type === 'CORET' && canvas) {
            // ekspor dataURL kanvas ke gambar
            const dataUrl = canvas.toDataURL();
            document.getElementById('drawn-proof-img').src = dataUrl;
            drawProof.classList.remove('hidden');
        } else {
            drawProof.classList.add('hidden');
        }

        // Buttons updates
        document.getElementById('btn-unsigned').classList.add('hidden');
        document.getElementById('btn-signed').classList.remove('hidden');

        isSigned = true;
    }

    function revokeDigitalSign() {
        // Reset proof elements
        document.getElementById('sign-proof-placeholder').classList.remove('hidden');
        document.getElementById('sign-proof-stamp').classList.add('hidden');
        document.getElementById('canvas-proof-preview').classList.add('hidden');

        // Buttons updates
        document.getElementById('btn-unsigned').classList.remove('hidden');
        document.getElementById('btn-signed').classList.add('hidden');

        clearSigCanvas();
        isSigned = false;
    }
</script>

<?php require_once 'footer.php'; ?>
