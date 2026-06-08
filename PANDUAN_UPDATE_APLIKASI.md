# Panduan Cara Update Aplikasi SIPADES SMART di VPS CyberPanel

Panduan ini menjelaskan langkah demi langkah untuk memperbarui (update) aplikasi **SIPADES SMART** di VPS CyberPanel Anda setelah Anda melakukan perubahan kode atau penambahan fitur di Google AI Studio.

Ada 2 cara utama untuk melakukan update kode, yaitu **Opsi A (Melalui File Manager CyberPanel - Upload ZIP)** dan **Opsi B (Melalui Git/GitHub - Direkomendasikan)**. Silakan pilih salah satu opsi yang paling sesuai dengan alur kerja Anda.

---

## 🚀 Opsi A: Cara Update Menggunakan File Manager CyberPanel (Upload ZIP)

Gunakan metode ini jika Anda tidak menggunakan sistem Git/GitHub dan memilih mengunduh langsung dari AI Studio.

### Langkah 1: Unduh Kode Terbaru dari Google AI Studio
1. Buka workspace **AI Studio Build**.
2. Masuk ke manu pengaturan/ekspor di bagian pojok kiri bawah atau kanan atas.
3. Pilih **Export to ZIP** untuk mengunduh kode proyek utama Anda dalam file terkompresi `.zip`.

### Langkah 2: Upload ke CyberPanel File Manager
1. Masuk ke dashboard panel web **CyberPanel** (`https://IP_VPS_ANDA:8090`).
2. Masuk ke menu **Websites** -> **List Websites** -> klik tombol **Manage** di sebelah nama domain Anda.
3. Klik **File Manager** untuk membuka berkas folder VPS Anda.
4. Masuk ke folder `/public_html` (ini adalah folder instalasi aplikasi Anda).
5. Upload file `.zip` terbaru yang baru saja Anda unduh.
6. Hapus berkas lama Anda **kecuali**:
   - File konfigurasi `.env` (Sangat penting karena menyimpan kata sandi database Anda!).
   - Folder `/storage` atau berkas unggahan gambar dinas jika ada di server lokal Anda.
7. Ekstrak file `.zip` terbaru di dalam folder `/public_html`. Pastikan struktur folder terekstrak dengan benar (tidak bersarang di dalam subfolder ekstra).

### Langkah 3: Melakukan Build Baru & Restart Server
Sambungkan ke VPS Anda menggunakan koneksi SSH (Terminal/PuTTY):
```bash
# 1. Pindah ke direktori website Anda
cd /home/domain_anda.com/public_html

# 2. Instal library NPM baru (jika ada penambahan pustaka/dependency)
npm install

# 3. Lakukan build ulang aset visual frontend & server bundle
npm run build

# 4. Muat ulang aplikasi Node.js di PM2 untuk menerapkan perubahan
pm2 restart sipades-smart
```

---

## 🛠️ Opsi B: Cara Update Menggunakan Git / GitHub (Lebih Cepat & Praktis)

Gunakan metode ini jika Anda menghubungkan repository Anda ke GitHub. Metode ini sangat praktis karena Anda hanya perlu satu baris perintah untuk menarik perubahan (pull).

### Langkah 1: Push Perubahan ke GitHub
Pastikan seluruh kode perubahan terbaru Anda di AI Studio sudah dicommit dan didorong ke repositori GitHub Anda.

### Langkah 2: Lakukan Pull dari SSH VPS
Buka terminal SSH (Terminal/PuTTY) dan hubungkan ke server VPS Anda, lalu jalankan perintah berikut:
```bash
# 1. Masuk ke foldernya
cd /home/domain_anda.com/public_html

# 2. Ambil pembaruan kode langsung dari GitHub
git pull origin main
```
*(Catatan: Jika Anda melakukan perubahan lokal di file server .env atau file lain di VPS secara tidak sengaja, jalankan perintah `git stash` terlebih dahulu sebelum `git pull`)*

### Langkah 3: Build & Restart Server
Setelah kode berhasil diperbarui dari Git, compiled ulang aplikasi agar perubahan tampil di web:
```bash
# 1. Sinkronkan library node yang baru
npm install

# 2. Compile ulang aplikasi (React + Bundle Express)
npm run build

# 3. Restart server di background menggunakan PM2
pm2 restart sipades-smart
```

---

## 🗄️ Langkah Tambahan: Jika Ada Perubahan Struktur Database (Schema Update)

Jika perubahan terbaru Anda melibatkan integrasi kolom baru atau tabel baru di file database (seperti di `/src/db/schema.ts`), Anda wajib memperbarui skema tabel PostgreSQL di VPS.

### Menggunakan Drizzle Migration
Pastikan Anda mengeksekusi Drizzle schema synchronizer langsung ke database VPS aktif Anda:
```bash
# Generator skema db terbaru di VPS
npx drizzle-kit push
```
Atau, jika Anda membuat modifikasi tabel melalui file mentah `/sipades_database_schema.sql`, Anda dapat menjalankannya langsung di dalam database:
```bash
sudo -i -u postgres psql -d sipades_db -f /home/domain_anda.com/public_html/sipades_database_schema.sql
```

---

## 🔍 Langkah Terakhir: Verifikasi Update Anda berjalan Lancar

Setelah melakukan pembaruan, selalu pastikan aplikasi Anda berjalan dengan baik tanpa ada error yang mengganggu layanan:

### 1. Periksa Log Real-time Server
```bash
pm2 logs sipades-smart
```
*Pastikan tidak ada pesan error berwarna merah ("Unexpected error", "Connection failed", dll)*

### 2. Periksa Status Layanan PM2
```bash
pm2 status
```
*Pastikan kolom `status` bernilai `online` dan jumlah `restart` tidak terus bertambah dengan cepat secara menerus (menandakan aplikasi mengalami crash berulang).*

### 3. Bersihkan Cache Browser (Jika Versi Lama Masih Tampil)
Karena aset frontend React Vite telah terkompilasi ke dalam kode JavaScript yang efisien, browser terkadang menyimpannya di memori cache. Buka website web SIPADES Anda dan tekan kombinasi tombol **`CTRL + F5`** (pada Windows) atau **`CMD + Shift + R`** (pada Mac) guna memuat ulang aset visual teranyar dari server secara utuh.
