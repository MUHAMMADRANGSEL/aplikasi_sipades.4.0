<?php
/**
 * ==============================================================================
 *                       SIPADES SMART v4.5 - PHP CONFIGURATION
 *                 SISTEM INFORMASI PENGELOLAAN ASET DESA RARANG SELATAN
 * ==============================================================================
 * Author: Sapriadi, S.H. (Administrator Desa Rarang Selatan)
 * Description: Jembatan database menggunakan PHP PDO MySQL.
 * ==============================================================================
 */

// Nonaktifkan reporting error di server produksi agar tidak merusak tata letak visual (mencegah tulisan notice/warning yang tidak rapi)
error_reporting(0);
ini_set('display_errors', 0);

// Memulai Session Keamanan Pengguna
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Parameter Koneksi Database MySQL (Sesuaikan dengan server/Hosting Anda)
define('DB_HOST', getenv('MYSQL_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('MYSQL_PORT') ?: '3306');
define('DB_USER', getenv('MYSQL_USER') ?: 'root');
define('DB_PASS', getenv('MYSQL_PASSWORD') ?: '');
define('DB_NAME', getenv('MYSQL_DB_NAME') ?: 'sipades_db');

try {
    // Membuat string DSN (Data Source Name)
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    
    // Opsi Konfigurasi PDO untuk keamanan dan kompatibilitas
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    
    // Inisialisasi Koneksi
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    
} catch (PDOException $e) {
    // Tampilan kegagalan koneksi database yang rapi
    die("<!DOCTYPE html>
    <html lang='id'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Database Connection Error - SIPADES SMART</title>
        <script src='https://cdn.tailwindcss.com'></script>
    </head>
    <body class='bg-slate-50 min-h-screen flex items-center justify-center p-6 font-sans'>
        <div class='max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-xl text-center space-y-4 animate-fade-in'>
            <div class='h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500'>
                <svg xmlns='http://www.w3.org/2000/svg' class='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                </svg>
            </div>
            <h1 class='text-lg font-black text-slate-800 uppercase tracking-wider'>Akses Database Terputus</h1>
            <p class='text-xs text-slate-500 leading-relaxed'>
                Aplikasi SIPADES SMART gagal terhubung ke server database MySQL Anda menggunakan PDO. Hubungi administrator desa d/a Pemdes Rarang Selatan.
            </p>
            <div class='bg-slate-50 border border-slate-200 p-3 rounded-lg text-left'>
                <span class='block text-[10px] font-bold text-slate-400 uppercase font-mono'>Pesan Kesalahan:</span>
                <code class='text-[10px] text-rose-600 font-mono break-all'>" . htmlspecialchars($e->getMessage()) . "</code>
            </div>
            <div class='pt-2'>
                <a href='index.php' class='block w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 text-xs transition duration-150 shadow-md'>
                    Muat Ulang Halaman
                </a>
            </div>
        </div>
    </body>
    </html>");
}

/**
 * Helper fungsi untuk mengonversi nilai desimal rupiah
 */
function formatRupiah($angka) {
    return "Rp " . number_format($angka, 0, ',', '.');
}

/**
 * Proteksi Input XSS (Cross Site Scripting)
 */
function safeInput($data) {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

/**
 * Cek apakah user telah login
 */
function checkAuth() {
    if (!isset($_SESSION['user_id'])) {
        header("Location: index.php");
        exit;
    }
}
?>
