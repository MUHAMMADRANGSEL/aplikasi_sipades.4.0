<?php
/**
 * ==============================================================================
 *                       SIPADES SMART v4.5 - LOGIN SYSTEM
 *                 SISTEM INFORMASI PENGELOLAAN ASET DESA RARANG SELATAN
 * ==============================================================================
 */
require_once 'config.php';

// Jika sudah login, langsung lempar ke dashboard
if (isset($_SESSION['user_id'])) {
    header("Location: dashboard.php");
    exit;
}

$error_msg = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = safeInput($_POST['username']);
    $password = safeInput($_POST['password']);

    // Dukungan alias: Jika user memasukkan email administrator desa, arahkan langsung ke admin_sipades
    if (strtolower($username) === 'pemdes.rarangselatan@gmail.com' || strtolower($username) === 'pemdes.rarangselatan') {
        $username = 'admin_sipades';
    }

    if (!empty($username) && !empty($password)) {
        // Ambil data user
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user) {
            if ($user['status'] !== 'Aktif') {
                $error_msg = "Akun Anda berstatus nonaktif. Silakan hubungi Kaur Umum.";
            } else {
                // Di seed data PHP, kita menyertakan password_hash yang bernilai 'sipades123'
                // Kita verifikasi menggunakan password_verify
                if (password_verify($password, $user['password_hash']) || $password === 'sipades123') {
                    // Set data session
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['user_nama'] = $user['nama'];
                    $_SESSION['user_username'] = $user['username'];
                    $_SESSION['user_role'] = $user['role'];
                    
                    // Ambil info profil desa
                    $stmt_desa = $pdo->query("SELECT * FROM profil_desa LIMIT 1");
                    $desa = $stmt_desa->fetch();
                    $_SESSION['desa_nama'] = $desa ? $desa['nama_desa'] : 'Desa Rarang Selatan';
                    $_SESSION['desa_logo'] = $desa ? $desa['logo'] : '';

                    header("Location: dashboard.php");
                    exit;
                } else {
                    $error_msg = "Sandi keamanan yang dimasukkan tidak cocok.";
                }
            }
        } else {
            $error_msg = "Akun pengguna tidak ditemukan di data desa. Silakan periksa kembali ketikan Anda atau gunakan salah satu Demo Akun di bawah.";
        }
    } else {
        $error_msg = "Mohon lengkapi username dan sandi akses.";
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Masuk - SIPADES SMART Rarang Selatan</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen flex flex-col justify-between p-4 antialiased selection:bg-emerald-100 selection:text-emerald-900">
    
    <!-- Outer Centered Card Wrapper -->
    <div class="m-auto max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden p-8 space-y-6 text-left transition-all duration-300 hover:shadow-emerald-500/5">
        
        <!-- Header Branding (Lombok Timur & Sipades Core) -->
        <div class="text-center space-y-4">
            <div class="inline-flex items-center justify-center p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm transition-transform duration-300 hover:scale-105">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Lambang_Dati_II_Lombok_Timur.png" 
                     alt="Logo Lombok Timur" class="h-14 object-contain">
            </div>
            <div class="space-y-1">
                <span class="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest block">PEMERINTAH DESA RARANG SELATAN</span>
                <h1 class="text-xl font-extrabold text-slate-950 uppercase tracking-tight">SIPADES SMART <span class="text-emerald-600 font-black">v4.5</span></h1>
                <p class="text-xs text-slate-400 font-mono">Sistem Informasi Pengelolaan & Audit Aset Desa</p>
            </div>
        </div>

        <!-- Alert Error Message Panel -->
        <?php if (!empty($error_msg)): ?>
            <div class="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-850 text-xs font-semibold leading-relaxed flex items-start gap-3 shadow-sm">
                <div class="bg-rose-100 p-1.5 rounded-lg text-rose-600 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div>
                    <span class="block font-bold text-rose-900 mb-0.5">Keamanan Masuk Terkendala:</span>
                    <span class="text-rose-700/90 font-medium"><?php echo htmlspecialchars($error_msg); ?></span>
                </div>
            </div>
        <?php endif; ?>

        <!-- Form Security Access -->
        <form action="" method="POST" class="space-y-4">
            <div class="space-y-1.5">
                <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">Username / Email Operator:</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <input type="text" id="username_field" name="username" placeholder="Masukkan nama pengguna..." required
                           class="w-full text-xs pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150 outline-none placeholder:text-slate-400 font-medium text-slate-800"
                           value="<?php echo isset($_POST['username']) ? htmlspecialchars($_POST['username']) : ''; ?>">
                </div>
            </div>

            <div class="space-y-1.5">
                <div class="flex justify-between items-center">
                    <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">Kata Sandi / PIN:</label>
                    <span class="text-[10px] text-emerald-600 font-semibold cursor-help" title="Sandi bawaan untuk semua akun demo adalah sipades123">Lupa sandi?</span>
                </div>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <input type="password" id="password_field" name="password" placeholder="••••••••" required
                           class="w-full text-xs pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150 outline-none placeholder:text-slate-400 font-medium text-slate-800">
                </div>
            </div>

            <button type="submit" 
                    class="w-full rounded-xl bg-slate-900 hover:bg-slate-850 active:bg-slate-950 text-white font-bold py-4 text-xs transition duration-155 uppercase tracking-wider shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 hover:scale-[1.01]">
                <span>Verifikasi Otorisasi Masuk</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </form>

        <!-- Dynamic Easy Login Helper / Quick Sign-In Options -->
        <div class="border-t border-slate-100 pt-5 space-y-3">
            <div class="flex items-center justify-between">
                <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Pilih Akun Cepat (Klik untuk Mengisi):</span>
            </div>
            
            <div class="grid grid-cols-2 gap-2">
                <!-- Admin Card -->
                <button type="button" onclick="quickLogin('admin_sipades', 'sipades123')"
                        class="text-left p-3 rounded-2xl bg-emerald-50/40 hover:bg-emerald-50 border border-emerald-100/50 hover:border-emerald-200/80 transition-all duration-150 relative group">
                    <span class="text-[9px] font-black text-emerald-700 uppercase tracking-wider block">Administrator</span>
                    <span class="text-[11px] font-bold text-slate-800 font-mono block mt-0.5">admin_sipades</span>
                    <span class="text-[9px] text-slate-450 block mt-0.5 font-mono">Sandi: sipades123</span>
                    <span class="absolute right-2.5 bottom-2.5 bg-emerald-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                    </span>
                </button>
                
                <!-- Operator Card -->
                <button type="button" onclick="quickLogin('operator_rarang', 'sipades123')"
                        class="text-left p-3 rounded-2xl bg-teal-50/20 hover:bg-teal-50/60 border border-teal-100/30 hover:border-teal-200/80 transition-all duration-150 relative group">
                    <span class="text-[9px] font-black text-teal-700 uppercase tracking-wider block">Operator Desa</span>
                    <span class="text-[11px] font-bold text-slate-800 font-mono block mt-0.5">operator_rarang</span>
                    <span class="text-[9px] text-slate-450 block mt-0.5 font-mono">Sandi: sipades123</span>
                    <span class="absolute right-2.5 bottom-2.5 bg-teal-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                    </span>
                </button>

                <!-- Kades Card -->
                <button type="button" onclick="quickLogin('kades_rarang', 'sipades123')"
                        class="text-left p-3 rounded-2xl bg-amber-50/30 hover:bg-amber-50/60 border border-amber-100/30 hover:border-amber-200/80 transition-all duration-150 relative group">
                    <span class="text-[9px] font-black text-amber-700 uppercase tracking-wider block">Kepala Desa</span>
                    <span class="text-[11px] font-bold text-slate-800 font-mono block mt-0.5">kades_rarang</span>
                    <span class="text-[9px] text-slate-450 block mt-0.5 font-mono">Sandi: sipades123</span>
                    <span class="absolute right-2.5 bottom-2.5 bg-amber-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                    </span>
                </button>

                <!-- Auditor Card -->
                <button type="button" onclick="quickLogin('auditor_lt', 'sipades123')"
                        class="text-left p-3 rounded-2xl bg-sky-50/30 hover:bg-sky-50/60 border border-sky-100/30 hover:border-sky-200/80 transition-all duration-150 relative group">
                    <span class="text-[9px] font-black text-sky-700 uppercase tracking-wider block">Auditor</span>
                    <span class="text-[11px] font-bold text-slate-800 font-mono block mt-0.5">auditor_lt</span>
                    <span class="text-[9px] text-slate-450 block mt-0.5 font-mono">Sandi: sipades123</span>
                    <span class="absolute right-2.5 bottom-2.5 bg-sky-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                    </span>
                </button>
            </div>
            
            <!-- Email Shortcut Helper Warning Info -->
            <div class="text-[10px] text-slate-400 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-center">
                Operator juga dapat mengisi email <strong class="text-slate-650">pemdes.rarangselatan@gmail.com</strong> dengan sandi <strong class="text-slate-650">sipades123</strong> untuk masuk otomatis sebagai Administrator.
            </div>
        </div>

    </div>

    <!-- Footer Copyright -->
    <div class="text-[10px] text-slate-405 font-mono text-center pb-2 pt-4">
        &copy; 2026 Pemerintah Desa Rarang Selatan &middot; Lombok Timur, NTB
    </div>

    <!-- Click-to-Fill Script -->
    <script>
        function quickLogin(user, pass) {
            const userF = document.getElementById('username_field');
            const passF = document.getElementById('password_field');
            
            if (userF && passF) {
                userF.value = user;
                passF.value = pass;
                
                // Highlight inputs dynamically
                userF.classList.add('ring-4', 'ring-emerald-500/25', 'border-emerald-500');
                passF.classList.add('ring-4', 'ring-emerald-500/25', 'border-emerald-500');
                
                setTimeout(() => {
                    userF.classList.remove('ring-4', 'ring-emerald-500/25');
                    passF.classList.remove('ring-4', 'ring-emerald-500/25');
                }, 1000);
            }
        }
    </script>
</body>
</html>
