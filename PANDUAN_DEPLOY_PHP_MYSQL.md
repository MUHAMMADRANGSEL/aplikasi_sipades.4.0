# 📖 PANDUAN DEPLOY SIPADES SMART v4.5 (PHP & MySQL)
### Sistem Informasi Pengelolaan Aset Desa Rarang Selatan, Lombok Timur, NTB

Panduan ini ditujukan bagi operator Desa atau IT Administrator untuk melakukan migrasi dan instalasi mandiri aplikasi **SIPADES SMART** murni berbasis **PHP & MySQL** di CyberPanel, cPanel, VPS, ataupun localhost (XAMPP/Laragon).

---

## 🛠️ Persyaratan Sistem (System Requirements)
1. **Web Server**: Apache, Nginx, or OpenLiteSpeed.
2. **PHP Version**: PHP 7.4, 8.0, 8.1, atau 8.2 (Sangat direkomendasikan PHP 8.1+).
3. **PDO Drivers**: `pdo_mysql` diaktifkan di setelan PHP server Anda.
4. **Basis Data**: MySQL v5.7+ atau MariaDB v10.3+.

---

## 📂 Struktur Direktori PHP-MySQL
Seluruh kode siap pakai yang baru saja diintegrasikan terletak di folder `/php` pada repositori Anda:
- `/php/config.php` : Berkas penghubung database utama menggunakan PHP PDO.
- `/php/header.php` & `/php/footer.php` : Kerangka tampilan interaktif yang responsif dengan Tailwind CSS & Lucide Icons.
- `/php/index.php` : Halaman login otorisasi & keamanan.
- `/php/dashboard.php` : Halaman panel utama statistik draf, rekapitualisasi KIB A-F, & timeline audit desa.
- `/php/assets.php` : Pencatatan mandiri Buku KIB, filter kondisi, cetak label QR, & peta koordinat GIS.
- `/php/pengadaan.php` : Siskeudes APBDes procurement tracker & deploy otomatisasi ke KIB B.
- `/php/persediaan.php` : Pencatatan log ATK sekretariat, bantuan pertanian, & ketahanan pangan.
- `/php/audit.php` : Entri opname pemeriksaan fisik & visual real-time di lapangan.
- `/php/profil.php` : Manajemen profil geopolitik wilayah & direktori nama perangkat aktif.
- `/php/database.sql` : Schema database MySQL andal + seed data lengkap Desa Rarang Selatan.

---

## 🚀 Langkah-Langkah Instalasi & Hosting

### Langkah 1: Buat Database Baru di Hosting Anda
1. Masuk ke panel VPS (CyberPanel) atau Shared Hosting (cPanel) Anda.
2. Buka menu **Databases** &rarr; **Create Database**.
3. Daftarkan nama database baru, contoh: `sipades_db`.
4. Buat User Database baru (contoh: `sipades_user`) dan pasangkan kata sandi tangguh.
5. Berikan hak akses penuh (**ALL PRIVILEGES**) dari user tersebut ke database `sipades_db`.

### Langkah 2: Impor Skema Basis Data (MySQL)
1. Buka **phpMyAdmin** melalui hosting panel Anda.
2. Pilih database `sipades_db` yang baru saja dibuat.
3. Klik tab **Import** di bagian atas menu phpMyAdmin.
4. Cari dan pilih berkas `/php/database.sql` yang ada di laptop Anda.
5. Klik **Go** / **Kirim** di pojok bawah. Pastikan seluruh 13 tabel dan data bibit seed awal berhasil dimasukkan tanpa error.

### Langkah 3: Konfigurasi Hubungan Database di PHP
Buka berkas `/php/config.php` dan sesuaikan nilainya dengan kredensial database hosting Anda:
```php
define('DB_HOST', 'localhost');      // Biasanya tetap 'localhost' atau '127.0.0.1'
define('DB_PORT', '3306');           // Port MySQL standar
define('DB_USER', 'sipades_user');   // Masukkan User database Anda
define('DB_PASS', 'SandiTangguh123');// Masukkan kata sandi database Anda
define('DB_NAME', 'sipades_db');     // Masukkan nama database Anda
```

### Langkah 4: Upload Seluruh File PHP ke Server
1. Kompres seluruh file di dalam folder `/php` Anda menjadi berkas `.zip`.
2. Masuk ke **File Manager** di panel Anda, lalu arahkan ke folder root website Anda (biasanya `public_html`).
3. Upload berkas `.zip` tersebut dan lakukan ekstrak (**unzip**) langsung di dalam folder root.

### Langkah 5: Selesai & Pengujian Akses
Buka domain/subdomain Anda pada browser web. Anda akan dialihkan ke halaman masuk otentikasi.
- **URL**: `https://sipades-desa.id/`
- **Default Akun Administrator**:
  - **Username**: `admin_sipades`
  - **Sandi**: `sipades123`

---

## 🔒 Catatan Keamanan PENTING
Setelah sistem Anda aktif mengudara, sangat disarankan untuk masuk ke menu **Profil** &rarr; ganti sandi admin Anda, atau perbarui `password_hash` baris `admin_sipades` di dalam tabel `users` menggunakan enkripsi standar PHP bcrypt.

---
*Dikembangkan oleh:*  
**Kuasa Pengguna Aset Administrasi Desa Rarang Selatan, Lombok Timur, Nusa Tenggara Barat.**
