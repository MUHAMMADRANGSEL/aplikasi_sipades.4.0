<?php
/**
 * ==============================================================================
 *                       SIPADES SMART v4.5 - LOGOUT HANDLER
 *                 SISTEM INFORMASI PENGELOLAAN ASET DESA RARANG SELATAN
 * ==============================================================================
 */
require_once 'config.php';

// Menghapus seluruh data session
$_SESSION = array();

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

session_destroy();

// Redirect kembali ke login screen
header("Location: index.php");
exit;
?>
