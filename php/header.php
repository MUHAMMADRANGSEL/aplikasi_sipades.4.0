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
$profil_desa = $stmt_desa ? $stmt_desa->fetch() : false;
$nama_desa = ($profil_desa && !empty($profil_desa['nama_desa'])) ? $profil_desa['nama_desa'] : 'Desa Rarang Selatan';
$logo_desa = ($profil_desa && !empty($profil_desa['logo'])) ? $profil_desa['logo'] : 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Lambang_Dati_II_Lombok_Timur.png';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SIPADES SMART - <?php echo htmlspecialchars($nama_desa); ?></title>
    <!-- Dark Mode Initializer -->
    <script>
        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    </script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class'
        }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <!-- Lucide Icons via CDN -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        /* SAFE-BOOT LAYOUT FALLBACK (Protects visual integrity if Tailwind CDN fails) */
        .flex { display: flex !important; }
        .flex-col { flex-direction: column !important; }
        .hidden { display: none !important; }
        .w-full { width: 100% !important; }
        .fixed { position: fixed !important; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .z-50 { z-index: 50 !important; }
        .items-center { align-items: center !important; }
        .justify-center { justify-content: center !important; }
        
        /* Ensure modals show up when not hidden */
        [id^="modal-"]:not(.hidden) { display: flex !important; }
        
        @media (min-width: 768px) {
            .md\:flex { display: flex !important; }
            .md\:flex-row { flex-direction: row !important; }
            .md\:w-64 { width: 256px !important; }
            .md\:hidden { display: none !important; }
        }
        
        body { font-family: 'Inter', sans-serif; transition: background-color 0.3s ease, color 0.3s ease; }
        .sidebar-gradient { background: linear-gradient(180deg, #1E3A8A 0%, #172554 100%); border-right: 1px solid rgba(30,58,138,0.2); }
        
        /* DARK MODE - CSS OVERRIDES (Global Settings for automatic dark mapping) */
        html.dark body { background-color: #0f172a !important; color: #e2e8f0 !important; }
        html.dark .bg-white { background-color: #1e293b !important; border-color: #334155 !important; }
        html.dark .bg-\[\#f8fafc\] { background-color: #0f172a !important; }
        html.dark .text-slate-900, html.dark .text-slate-800 { color: #f8fafc !important; }
        html.dark .text-slate-700, html.dark .text-slate-600 { color: #cbd5e1 !important; }
        html.dark .text-slate-500, html.dark .text-slate-400 { color: #94a3b8 !important; }
        html.dark .bg-slate-50, html.dark .bg-slate-100 { background-color: #0f172a !important; }
        html.dark .bg-slate-200 { background-color: #334155 !important; }
        html.dark .border-slate-350, html.dark .border-slate-300, html.dark .border-slate-200, html.dark .border-slate-100, html.dark .border-slate-50 { border-color: #334155 !important; }
        
        html.dark input, html.dark select, html.dark textarea { background-color: #0f172a !important; border-color: #475569 !important; color: #f8fafc !important; }
        html.dark input:focus, html.dark select:focus, html.dark textarea:focus { background-color: #1e293b !important; border-color: #6366f1 !important; }
        
        html.dark .bg-emerald-50 { background-color: #064e3b !important; border-color: #065f46 !important; }
        html.dark .text-emerald-800, html.dark .text-emerald-600 { color: #34d399 !important; }
        html.dark .bg-rose-50 { background-color: #4c0519 !important; border-color: #881337 !important; }
        html.dark .text-rose-800, html.dark .text-rose-600 { color: #fb7185 !important; }
        html.dark .bg-blue-50 { background-color: #172554 !important; border-color: #1e3a8a !important; }
        html.dark .text-blue-800, html.dark .text-blue-600 { color: #60a5fa !important; }
        html.dark .bg-amber-50 { background-color: #451a03 !important; border-color: #78350f !important; }
        html.dark .text-amber-800, html.dark .text-amber-600 { color: #fbbf24 !important; }
        html.dark .bg-indigo-50\/20, html.dark .bg-indigo-50 { background-color: #1e1b4b !important; border-color: #312e81 !important; }
        html.dark .text-indigo-905, html.dark .text-indigo-800 { color: #818cf8 !important; }
        
        html.dark td, html.dark th { border-color: #334155 !important; color: #cbd5e1 !important; }
        html.dark tr.hover\:bg-slate-50\/50:hover, html.dark tr.hover\:bg-slate-50:hover { background-color: #334155 !important; }
        html.dark .divide-slate-100 > :not([hidden]) ~ :not([hidden]) { border-color: #334155 !important; }
        
        html.dark header.bg-white { background-color: #0f172a !important; border-color: #1e293b !important; }
        html.dark .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.5) !important; }
        html.dark .border { border-color: #334155 !important; }
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
        <div class="flex items-center gap-2 text-slate-400">
            <button id="theme-toggle-mobile" class="p-1 hover:text-white transition-colors" title="Toggle Theme">
                <i data-lucide="moon" class="h-5 w-5 theme-moon-icon"></i>
                <i data-lucide="sun" class="h-5 w-5 theme-sun-icon hidden"></i>
            </button>
            <button id="mobile-menu-toggle" class="p-1 hover:text-white transition-colors">
                <i data-lucide="menu" class="h-6 w-6"></i>
            </button>
        </div>
    </div>

    <!-- MAIN SIDEBAR NAVIGATION -->
    <aside id="sidebar" class="hidden md:flex w-full md:w-64 sidebar-gradient flex-col text-white select-none shrink-0 shadow-lg">
        
        <!-- Sidebar Brand logo -->
        <div class="p-6 border-b border-white/10 flex items-center gap-3">
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
        <div class="p-4 bg-black/20 border-b border-white/5 flex items-center gap-3">
            <div class="h-9 w-9 bg-emerald-50/10 rounded-full flex items-center justify-center text-emerald-400 font-extrabold text-xs">
                <?php echo strtoupper(substr($_SESSION['user_nama'], 0, 2)); ?>
            </div>
            <div class="overflow-hidden">
                <span class="block text-xs font-bold text-white truncate"><?php echo htmlspecialchars($_SESSION['user_nama']); ?></span>
                <span class="block text-[10px] text-blue-300 font-bold font-mono tracking-wider truncate uppercase"><?php echo htmlspecialchars($_SESSION['user_role']); ?></span>
            </div>
        </div>

        <!-- Navigation Lists -->
        <nav class="flex-1 p-4 space-y-1.5 overflow-y-auto">
            
            <a href="dashboard.php" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition <?php echo ($current_page==='dashboard.php') ? 'bg-white/10 text-white border-l-4 border-teal-400 font-extrabold shadow-sm' : 'text-blue-200 hover:bg-white/5 hover:text-white'; ?>">
                <i data-lucide="layout-dashboard" class="h-4 w-4"></i> Dashboard Utama
            </a>

            <a href="profil.php" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition <?php echo ($current_page==='profil.php') ? 'bg-white/10 text-white border-l-4 border-teal-400 font-extrabold shadow-sm' : 'text-blue-200 hover:bg-white/5 hover:text-white'; ?>">
                <i data-lucide="building-2" class="h-4 w-4"></i> Mnj. Basis Data
            </a>

            <a href="pengadaan.php" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition <?php echo ($current_page==='pengadaan.php') ? 'bg-white/10 text-white border-l-4 border-teal-400 font-extrabold shadow-sm' : 'text-blue-200 hover:bg-white/5 hover:text-white'; ?>">
                <i data-lucide="plus-square" class="h-4 w-4"></i> Belanja & Pengadaan
            </a>

            <a href="assets.php" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition <?php echo ($current_page==='assets.php') ? 'bg-white/10 text-white border-l-4 border-teal-400 font-extrabold shadow-sm' : 'text-blue-200 hover:bg-white/5 hover:text-white'; ?>">
                <i data-lucide="database" class="h-4 w-4"></i> Inventaris KIB
            </a>

            <a href="pemanfaatan.php" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition <?php echo ($current_page==='pemanfaatan.php') ? 'bg-white/10 text-white border-l-4 border-teal-400 font-extrabold shadow-sm' : 'text-blue-200 hover:bg-white/5 hover:text-white'; ?>">
                <i data-lucide="file-check" class="h-4 w-4"></i> Hak Guna & Leases
            </a>

            <a href="kapitalisasi.php" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition <?php echo ($current_page==='kapitalisasi.php') ? 'bg-white/10 text-white border-l-4 border-teal-400 font-extrabold shadow-sm' : 'text-blue-200 hover:bg-white/5 hover:text-white'; ?>">
                <i data-lucide="trending-down" class="h-4 w-4"></i> Kapitalisasi
            </a>

            <a href="persediaan.php" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition <?php echo ($current_page==='persediaan.php') ? 'bg-white/10 text-white border-l-4 border-teal-400 font-extrabold shadow-sm' : 'text-blue-200 hover:bg-white/5 hover:text-white'; ?>">
                <i data-lucide="warehouse" class="h-4 w-4"></i> Persediaan Desa
            </a>

            <a href="ref_kode_barang.php" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition <?php echo ($current_page==='ref_kode_barang.php' && !isset($_GET['import'])) ? 'bg-white/10 text-white border-l-4 border-teal-400 font-extrabold shadow-sm' : 'text-blue-200 hover:bg-white/5 hover:text-white'; ?>">
                <i data-lucide="book-open" class="h-4 w-4"></i> Ref Kode Barang
            </a>

            <a href="ref_kode_barang.php?import=1" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition <?php echo ($current_page==='ref_kode_barang.php' && isset($_GET['import'])) ? 'bg-white/10 text-white border-l-4 border-teal-400 font-extrabold shadow-sm' : 'text-blue-200 hover:bg-white/5 hover:text-white'; ?>">
                <i data-lucide="upload-cloud" class="h-4 w-4"></i> Import Kode Barang
            </a>

            <a href="gis.php" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition <?php echo ($current_page==='gis.php') ? 'bg-white/10 text-white border-l-4 border-teal-400 font-extrabold shadow-sm' : 'text-blue-200 hover:bg-white/5 hover:text-white'; ?>">
                <i data-lucide="map-pin" class="h-4 w-4"></i> Peta GIS Aset
            </a>

            <a href="audit.php" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition <?php echo ($current_page==='audit.php') ? 'bg-white/10 text-white border-l-4 border-teal-400 font-extrabold shadow-sm' : 'text-blue-200 hover:bg-white/5 hover:text-white'; ?>">
                <i data-lucide="compass" class="h-4 w-4"></i> Fisik Scan / Audit
            </a>

            <a href="reports.php" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition <?php echo ($current_page==='reports.php') ? 'bg-white/10 text-white border-l-4 border-teal-400 font-extrabold shadow-sm' : 'text-blue-200 hover:bg-white/5 hover:text-white'; ?>">
                <i data-lucide="printer" class="h-4 w-4"></i> Pencetakan
            </a>

            <a href="premium.php" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition <?php echo ($current_page==='premium.php') ? 'bg-white/10 text-white border-l-4 border-teal-400 font-extrabold shadow-sm' : 'text-blue-200 hover:bg-white/5 hover:text-white'; ?>">
                <i data-lucide="sparkles" class="h-4 w-4"></i> Revaluasi AI
            </a>
        </nav>

        <!-- Sidebar footer watermark -->
        <div class="p-4 border-t border-white/10 flex justify-between items-center bg-black/10">
            <div class="text-[9px] text-blue-200 text-center font-mono leading-relaxed truncate">
                Kab. Lombok Timur
            </div>
            <a href="logout.php" title="Keluar Aplikasi" class="p-1.5 text-rose-300 hover:bg-rose-500/20 hover:text-rose-100 rounded transition-colors">
                <i data-lucide="log-out" class="h-4 w-4"></i>
            </a>
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
                <!-- Desktop Theme Toggle -->
                <button id="theme-toggle-desktop" class="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg transition-colors border border-slate-200 dark:border-slate-700" title="Toggle Theme Mode">
                    <i data-lucide="moon" class="h-4.5 w-4.5 theme-moon-icon"></i>
                    <i data-lucide="sun" class="h-4.5 w-4.5 theme-sun-icon hidden"></i>
                </button>

                <div class="text-right">
                    <span class="block text-xs font-bold text-slate-800 leading-none"><?php echo htmlspecialchars($_SESSION['user_nama']); ?></span>
                    <span class="text-[9.5px] font-semibold text-slate-400 uppercase font-mono mt-0.5 tracking-wider"><?php echo htmlspecialchars($_SESSION['user_role']); ?> ({Lokal})</span>
                </div>
                <div class="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs text-center mr-1">
                    <?php echo substr($_SESSION['user_nama'], 0, 1); ?>
                </div>
                <!-- Topbar Quick Logout Button -->
                <a href="logout.php" title="Keluar Aplikasi" class="bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-600 p-2 rounded-xl transition-all border border-rose-100/60 duration-150 flex items-center gap-1.5 px-3">
                    <i data-lucide="log-out" class="h-3.5 w-3.5"></i>
                    <span class="text-[11px] font-bold uppercase tracking-wider">Keluar</span>
                </a>
            </div>
        </header>

        <!-- Scrollable Stage wrapper -->
        <div class="flex-1 p-4 md:p-6 overflow-y-auto w-full">
            <script>
                document.addEventListener('DOMContentLoaded', () => {
                    const themeToggleBtns = [document.getElementById('theme-toggle-desktop'), document.getElementById('theme-toggle-mobile')];
                    const moonIcons = document.querySelectorAll('.theme-moon-icon');
                    const sunIcons = document.querySelectorAll('.theme-sun-icon');

                    // Check initial state
                    if (document.documentElement.classList.contains('dark')) {
                        moonIcons.forEach(el => el.classList.add('hidden'));
                        sunIcons.forEach(el => el.classList.remove('hidden'));
                    }

                    themeToggleBtns.forEach(btn => {
                        if(btn) {
                            btn.addEventListener('click', () => {
                                document.documentElement.classList.toggle('dark');
                                const isDark = document.documentElement.classList.contains('dark');
                                
                                if (isDark) {
                                    localStorage.setItem('theme', 'dark');
                                    moonIcons.forEach(el => el.classList.add('hidden'));
                                    sunIcons.forEach(el => el.classList.remove('hidden'));
                                } else {
                                    localStorage.setItem('theme', 'light');
                                    moonIcons.forEach(el => el.classList.remove('hidden'));
                                    sunIcons.forEach(el => el.classList.add('hidden'));
                                }
                            });
                        }
                    });
                });
            </script>
