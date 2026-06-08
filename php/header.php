<?php
/**
 * ==============================================================================
 *                       SIPADES SMART v4.5 - PHP LAYOUT HEADER
 *                 SISTEM INFORMASI PENGELOLAAN ASET DESA RARANG SELATAN
 * ==============================================================================
 */
require_once 'config.php';
checkAuth();

// Current active script name to highlight navigation
$current_page = basename($_SERVER['PHP_SELF']);

// Ambil data profil desa terbaru untuk header
$stmt_desa = $pdo->query("SELECT * FROM profil_desa LIMIT 1");
$profil_desa = $stmt_desa->fetch();
$nama_desa = $profil_desa ? $profil_desa['nama_desa'] : 'Desa Rarang Selatan';
$logo_desa = $profil_desa['logo'] ?: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Lambang_Dati_II_Lombok_Timur.png';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SIPADES SMART - <?php echo htmlspecialchars($nama_desa); ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <!-- Lucide Icons via CDN -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-[#f8fafc] text-slate-800 min-h-screen flex flex-col md:flex-row antialiased">

    <!-- Responsive Mobile Header -->
    <div class="md:hidden w-full bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between text-white shrink-0">
        <div class="flex items-center gap-2">
            <img src="<?php echo htmlspecialchars($logo_desa); ?>" alt="Logo Desa" class="h-8 object-contain">
            <div>
                <span class="text-[9px] font-black tracking-widest text-emerald-400 block">SIPADES SMART PHP</span>
                <span class="text-[11px] font-bold text-white block leading-none"><?php echo htmlspecialchars($nama_desa); ?></span>
            </div>
        </div>
        <button id="mobile-menu-toggle" class="p-1 text-slate-400 hover:text-white">
            <i data-lucide="menu" class="h-6 w-6"></i>
        </button>
    </div>

    <!-- MAIN SIDEBAR NAVIGATION -->
    <aside id="sidebar" class="hidden md:flex w-full md:w-64 bg-slate-900 border-r border-slate-800 flex-col text-slate-300 select-none shrink-0 shrink-0">
        
        <!-- Sidebar Brand logo -->
        <div class="p-6 border-b border-slate-800 flex items-center gap-3">
            <img src="<?php echo htmlspecialchars($logo_desa); ?>" alt="Logo Desa" class="h-10 object-contain max-w-[40px]">
            <div>
                <span class="text-[9px] font-black text-emerald-400 uppercase tracking-widest block font-mono">SIPADES SMART v4.5</span>
                <h2 class="text-xs font-bold text-white leading-normal truncate"><?php echo htmlspecialchars($nama_desa); ?></h2>
                <div class="flex items-center gap-1 mt-0.5">
                    <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span class="text-[8px] text-slate-400 font-mono">MySQL Engine</span>
                </div>
            </div>
        </div>

        <!-- Logged-in User Profile -->
        <div class="p-4 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-3">
            <div class="h-9 w-9 bg-emerald-50/10 rounded-full flex items-center justify-center text-emerald-400 font-extrabold text-xs">
                <?php echo strtoupper(substr($_SESSION['user_nama'], 0, 2)); ?>
            </div>
            <div class="overflow-hidden">
                <span class="block text-xs font-bold text-white truncate"><?php echo htmlspecialchars($_SESSION['user_nama']); ?></span>
                <span class="block text-[10px] text-emerald-400 font-bold font-mono tracking-wider truncate uppercase"><?php echo htmlspecialchars($_SESSION['user_role']); ?></span>
            </div>
        </div>

        <!-- Navigation Lists -->
        <nav class="flex-1 p-4 space-y-1.5 overflow-y-auto">
            
            <a href="dashboard.php" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition <?php echo ($current_page==='dashboard.php') ? 'bg-emerald-600 text-white font-black hover:bg-emerald-700' : 'text-slate-400 hover:bg-slate-800 hover:text-white'; ?>">
                <i data-lucide="layout-dashboard" class="h-4 w-4"></i> Dashboard Utama
            </a>

            <div class="pt-2">
                <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 block">Modul Inventaris & Buku KIB</span>
            </div>

            <a href="assets.php" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition <?php echo ($current_page==='assets.php') ? 'bg-emerald-600 text-white font-black hover:bg-emerald-700' : 'text-slate-400 hover:bg-slate-800 hover:text-white'; ?>">
                <i data-lucide="database" class="h-4 w-4"></i> Inventaris KIB (A - F)
            </a>

            <a href="pengadaan.php" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition <?php echo ($current_page==='pengadaan.php') ? 'bg-emerald-600 text-white font-black hover:bg-emerald-700' : 'text-slate-400 hover:bg-slate-800 hover:text-white'; ?>">
                <i data-lucide="shopping-cart" class="h-4 w-4"></i> Procurement APBDes
            </a>

            <a href="persediaan.php" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition <?php echo ($current_page==='persediaan.php') ? 'bg-emerald-600 text-white font-black hover:bg-emerald-700' : 'text-slate-400 hover:bg-slate-800 hover:text-white'; ?>">
                <i data-lucide="package" class="h-4 w-4"></i> Logistik Persediaan
            </a>

            <a href="audit.php" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition <?php echo ($current_page==='audit.php') ? 'bg-emerald-600 text-white font-black hover:bg-emerald-700' : 'text-slate-400 hover:bg-slate-800 hover:text-white'; ?>">
                <i data-lucide="camera" class="h-4 w-4"></i> Scanner & Audit Lapangan
            </a>

            <div class="pt-2">
                <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 block">Sistem & Rekap</span>
            </div>

            <a href="profil.php" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition <?php echo ($current_page==='profil.php') ? 'bg-emerald-600 text-white font-black hover:bg-emerald-700' : 'text-slate-400 hover:bg-slate-800 hover:text-white'; ?>">
                <i data-lucide="home" class="h-4 w-4"></i> Profil & Perangkat Desa
            </a>

            <a href="logout.php" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition text-rose-400 hover:bg-rose-950/40 hover:text-rose-300">
                <i data-lucide="log-out" class="h-4 w-4"></i> Keluar Aplikasi
            </a>

        </nav>

        <!-- Sidebar footer watermark -->
        <div class="p-4 border-t border-slate-800 text-[9px] text-slate-500 text-center font-mono leading-relaxed">
            Pemerintah Kab. Lombok Timur<br>
            NTB, Indonesia
        </div>
    </aside>

    <!-- MAIN BODY RIGHT STAGE CONTAINER -->
    <main class="flex-1 flex flex-col min-w-0 min-h-screen">
        
        <!-- Header Top Navigation bar -->
        <header class="hidden md:flex bg-white h-16 border-b border-slate-100 px-6 items-center justify-between text-left shrink-0">
            <div class="flex items-center gap-2">
                <span class="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                    <i data-lucide="folder-key" class="h-4.5 w-4.5 text-emerald-600"></i> Kantor Desa Rarang Selatan
                </span>
                <span class="text-[10px] font-bold text-slate-400 px-2 border-l border-slate-200">Kec. Terara, Lombok Timur</span>
            </div>
            
            <div class="flex items-center gap-4">
                <div class="text-right">
                    <span class="block text-xs font-bold text-slate-800 leading-none"><?php echo htmlspecialchars($_SESSION['user_nama']); ?></span>
                    <span class="text-[9.5px] font-semibold text-slate-400 uppercase font-mono mt-0.5 tracking-wider"><?php echo htmlspecialchars($_SESSION['user_role']); ?> ({Lokal})</span>
                </div>
                <div class="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs text-center">
                    <?php echo substr($_SESSION['user_nama'], 0, 1); ?>
                </div>
            </div>
        </header>

        <!-- Scrollable Stage wrapper -->
        <div class="flex-1 p-4 md:p-6 overflow-y-auto w-full">
