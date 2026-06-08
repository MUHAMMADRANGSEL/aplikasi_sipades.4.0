# Panduan Deployment SIPADES SMART di VPS CyberPanel (OpenLiteSpeed)

Panduan ini menjelaskan langkah demi langkah untuk mengonlinekan aplikasi **SIPADES SMART** (Node.js Express + React Vite + PostgreSQL) di VPS Anda yang menggunakan panel kontrol **CyberPanel** dan server web **OpenLiteSpeed**.

---

## 📋 Prasyarat Keamanan & Spesifikasi VPS

1. **Sistem Operasi**: Ubuntu 20.04 / 22.04 LTS (disarankan).
2. **Koneksi SSH**: Akses root (`ssh root@ip_address_vps`).
3. **Domain/Subdomain**: Domain aktif (misal: `sipades.rarangselatan.desa.id`) yang sudah diarahkan (A Record) ke IP VPS Anda melalui DNS Manager (Cloudflare/ registrar).
4. **Alat Tambahan**: Node.js v18/v20 kompatibel, PostgreSQL v14/v15/v16, dan PM2 (Process Manager).

---

## 🛠️ Langkah 1: Install Node.js dan PostgreSQL di VPS Melalui SSH

Hubungkan ke VPS Anda menggunakan SSH (Terminal/Putty), kemudian jalankan perintah berikut:

### 1. Update Server Repository & System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js & NPM (Menggunakan NVM - Node Version Manager)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v # Pastikan output versi 20.x
npm -v  # Pastikan NPM terinstall
```

### 3. Install dan Konfigurasi PostgreSQL
```bash
# Install Postgres
sudo apt install postgresql postgresql-contrib -y

# Aktifkan layanan Postgres agar jalan otomatis saat boot
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Masuk ke CLI Postgres untuk membuat Database & User
sudo -i -u postgres psql
```

Di dalam tab `psql` (CLI PostgreSQL), buat database dan user baru:
```sql
-- Buat Database
CREATE DATABASE sipades_db;

-- Buat User dengan password kuat (ganti 'password_anda')
CREATE USER sipades_user WITH ENCRYPTED PASSWORD 'password_anda';

-- Berikan hak akses penuh ke user baru pada database tersebut
GRANT ALL PRIVILEGES ON DATABASE sipades_db TO sipades_user;

-- Keluar dari PostgreSQL CLI
\q
```

---

## 🌐 Langkah 2: Konfigurasi Virtual Host / Website Baru di CyberPanel

1. **Masuk ke Panel CyberPanel Anda** (`https://IP_VPS_ANDA:8090`).
2. **Buat Website Baru**:
   - Buka menu **Websites** -> **Create Website**.
   - **Select Package**: Default.
   - **Owner**: Admin (atau user Anda).
   - **Domain Name**: Masukkan domain Anda (misal: `sipades.rarangselatan.desa.id`).
   - **Email**: Email desa Anda (`pemdes.rarangselatan@gmail.com`).
   - **Select PHP**: Pilih versi bebas (kemudian di-bypass oleh Node.js port 3000).
   - **Additional Features**: Centang **SSL (Disarankan)** dan **DKIM Support**.
   - Klik **Create Website**.

---

## 📂 Langkah 3: Mengunggah Script Aplikasi ke VPS

Ada dua cara utama yang direkomendasikan untuk memindahkan kode ini ke VPS:

### Opsi A (Melalui File Manager CyberPanel)
1. Export / Unduh ZIP aplikasi dari Google AI Studio.
2. Di CyberPanel, masuk ke **Websites** -> **List Websites** -> Klik **Manage** pada domain Anda.
3. Klik **File Manager**.
4. Masuk ke direktori `/public_html`.
5. Hapus semua file bawaan (index.html, dll).
6. Upload file ZIP aplikasi Anda, lalu ekstrak ke dalam folder tersebut.

### Opsi B (Disarankan - Menggunakan Git Clone di SSH)
Masuk ke direktori web domain di SSH dan cloning repository Anda:
```bash
# Pindah ke folder public_html domain Anda (sesuaikan domain_anda.com)
cd /home/domain_anda.com/public_html

# Hapus file default bawaan Cyberpanel jika ada
rm -rf *

# Clone repositori git Anda langsung ke folder ini
git clone https://github.com/username/repository-sipades.git .
```

---

## ⚙️ Langkah 4: Konfigurasi `.env` dan Build Aplikasi

Di dalam folder `/public_html` di VPS Anda (akses via SSH):

### 1. Salin file template environment variables
```bash
cp .env.example .env
```

### 2. Edit file `.env` menggunakan nano editor
```bash
nano .env
```
Sesuaikan nilainya seperti contoh di bawah ini:
```env
# Kunci API Gemini untuk fitur analisis pintar aset
GEMINI_API_KEY="AIzaSyA..."

# Domain utama website SIPADES Anda
APP_URL="https://sipades.rarangselatan.desa.id"

# Token SMS / WhatsApp Gateway Fonnte
FONNTE_TOKEN="YOUR_FONNTE_GATEWAY_TOKEN"

# Detail Database PostgreSQL Lokal yang dibuat di Langkah 1
SQL_HOST="127.0.0.1"
SQL_PORT="5432"
SQL_USER="sipades_user"
SQL_PASSWORD="password_anda"
SQL_DB_NAME="sipades_db"

# Gunakan kredensial yang sama untuk Admin Migrasi
SQL_ADMIN_USER="sipades_user"
SQL_ADMIN_PASSWORD="password_anda"
```
*Tekan `CTRL + O`, lalu `Enter` untuk menyimpan, dan `CTRL + X` untuk keluar dari nano.*

### 3. Menginstall Dependencies & Melakukan Build Produksi
Jalankan perintah berikut untuk mendownload library dan mengompilasi kode React (Vite) dan Express (Server bundle):
```bash
# Install library node
npm install

# Build asset statis & server bundle (dist/server.cjs)
npm run build
```
*(Proses ini akan menghasilkan folder `/dist` yang berisi React SPA statis ter-minifikasi, dan file backend `dist/server.cjs`)*

---

## 🚀 Langkah 5: Jalankan Aplikasi secara Background menggunakan PM2

Gunakan **PM2 (Process Manager)** agar aplikasi Express Server port 3000 berjalan di latar belakang secara berkelanjutan, stabil, dan otomatis restart saat VPS mati/reboot.

### 1. Install PM2 secara Global
```bash
npm install -g pm2
```

### 2. Mulai Server Express Backend dengan PM2
```bash
pm2 start dist/server.cjs --name "sipades-smart"
```

### 3. Konfigurasi Autostart saat VPS booting ulang
```bash
pm2 startup
```
*Sistem akan mengeluarkan satu baris perintah kustom (biasanya dimulai dengan `sudo env PATH=...`). Salin baris perintah tersebut, tempelkan ke terminal VPS Anda, lalu tekan `Enter`.*

### 4. Simpan status PM2 saat ini
```bash
pm2 save
```
*(Sekarang status aplikasi Node.js Anda aman dan selalu menyala di internal port `3000`). Anda dapat memeriksa status aplikasi kapan saja dengan perintah `pm2 status`.*

---

## 🔗 Langkah 6: Konfigurasi OpenLiteSpeed Reverse Proxy (Mengarahkan Port 3000 ke Domain Publik)

Agar domain `sipades.rarangselatan.desa.id` secara mulus mengarah ke port internal Node JS (port 3000) yang dijaga oleh PM2, Anda harus memasang aturan **Reverse Proxy**.

Ada dua metode di CyberPanel (OpenLiteSpeed). Metode melalui pengaturan Rewrite Rules `.htaccess` sangat mudah dan direkomendasikan.

### Metode File `.htaccess` (Paling Cepat / Mudah)

1. Di CyberPanel, masuk ke **Websites** -> **List Websites** -> Pilih website Anda -> Klik **Manage**.
2. Cari dan klik menu **Rewrite Rules**.
3. Pilih template **Proxy HTTP** jika ada, atau cukup paste baris konfigurasi berikut ke paling atas editor `.htaccess`:

```text
### REVERSE PROXY TO NODE.JS PORT 3000 ###
RewriteEngine On
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
```

4. Klik **Save**.
5. Restart OpenLiteSpeed melalui CyberPanel di tombol pojok kanan atas dashboard atau jalankan perintah di SSH:
   ```bash
   sudo systemctl restart lsws
   ```

*(Sekarang, buka domain Anda `https://sipades.rarangselatan.desa.id` di browser. Selamat! Aplikasi SIPADES SMART Anda beserta database PostgreSQL seutuhnya telah aktif dan dapat diakses publik dengan aman).*

---

## 🔍 Cara Melakukan Monitoring dan Perawatan Log Server

Apabila terjadi kendala saat aplikasi online, gunakan perintah SSH berikut untuk melakukan pengecekan:

- **Melihat Log Realtime Aplikasi**:
  ```bash
  pm2 logs sipades-smart
  ```
- **Mematikan Aplikasi Sementara**:
  ```bash
  pm2 stop sipades-smart
  ```
- **Memulai / Merestart Aplikasi**:
  ```bash
  pm2 restart sipades-smart
  ```
- **Mengunduh Update Kode Terbaru (jika menggunakan Git)**:
  ```bash
  # Masuk ke folder, lalu tarik kode dan lakukan build ulang
  cd /home/domain_anda.com/public_html
  git pull
  npm install
  npm run build
  pm2 restart sipades-smart
  ```
- **Memeriksa Status Koneksi Database PostgreSQL Anda**:
  ```bash
  sudo -i -u postgres psql -d sipades_db -c "SELECT * FROM users;"
  ```
