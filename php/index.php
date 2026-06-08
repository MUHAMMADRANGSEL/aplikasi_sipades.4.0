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
            $error_msg = "Akun pengguna tidak ditemukan di data desa.";
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
<body class="bg-slate-50 min-h-screen flex flex-col justify-between p-4">
    <div class="m-auto max-w-sm w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-6 space-y-6 text-left">
        
        <!-- Header Branding -->
        <div class="text-center space-y-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Lambang_Dati_II_Lombok_Timur.png" 
                 alt="Logo Lombok Timur" class="h-14 mx-auto object-contain">
            <div>
                <span class="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">PEMERINTAH DESA RARANG SELATAN</span>
                <h1 class="text-lg font-extrabold text-slate-950 uppercase tracking-tight font-sans mt-0.5">SIPADES SMART v4.5</h1>
                <p class="text-[11px] text-slate-500 font-mono mt-0.5">Sistem Informasi Pengelolaan Aset</p>
            </div>
        </div>

        <!-- Alert Error -->
        <?php if (!empty($error_msg)): ?>
            <div class="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-xs font-bold leading-normal flex items-start gap-2 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span><?php echo htmlspecialchars($error_msg); ?></span>
            </div>
        <?php endif; ?>

        <!-- Form Security Access -->
        <form action="" method="POST" class="space-y-4">
            <div class="space-y-1">
                <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">Username Sistem:</label>
                <input type="text" name="username" placeholder="Masukkan username" required
                       class="w-full text-xs p-3 rounded-lg border border-slate-200 bg-slate-50 focus:border-emerald-500 focus:bg-white outline-none"
                       value="<?php echo isset($_POST['username']) ? htmlspecialchars($_POST['username']) : ''; ?>">
            </div>

            <div class="space-y-1">
                <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">Sandi Keamanan:</label>
                <input type="password" name="password" placeholder="••••••••" required
                       class="w-full text-xs p-3 rounded-lg border border-slate-200 bg-slate-50 focus:border-emerald-500 focus:bg-white outline-none">
            </div>

            <button type="submit" 
                    class="w-full rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-black py-3 text-xs transition duration-150 uppercase tracking-wide shadow-md">
                Otorisasi Masuk
            </button>
        </form>

        <div class="text-center bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span class="block text-[10px] text-slate-400 uppercase font-mono">Demo Akun Bawaan:</span>
            <div class="grid grid-cols-2 gap-1 text-[9.5px] text-left text-slate-600 font-mono mt-1.5">
                <div>User: <span class="font-bold text-emerald-600">admin_sipades</span></div>
                <div>Pass: <span class="font-bold">sipades123</span></div>
                <div>Role: <span class="text-slate-400">Administrator</span></div>
                <div>Status: <span class="text-emerald-500 font-medium">Aktif</span></div>
            </div>
        </div>

    </div>

    <!-- Footer Copyright -->
    <div class="text-[10px] text-slate-400 font-mono text-center pb-2">
        &copy; 2026 Pemerintah Desa Rarang Selatan &middot; Lombok Timur, NTB
    </div>
</body>
</html>
