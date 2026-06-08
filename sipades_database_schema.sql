-- ==============================================================================
--                       SIPADES SMART - DATABASE SCHEMA & SEED DATA
--                 SISTEM INFORMASI PENGELOLAAN ASET DESA RARANG SELATAN
--                       KABUPATEN LOMBOK TIMUR, NUSA TENGGARA BARAT
-- ==============================================================================
-- Target DBMS: PostgreSQL / CockroachDB / MySQL (Cross-Platform Compatible Standard)
-- Created: 2026-06-08
-- Description: Skrip SQL lengkap untuk menginisialisasi tabel-tabel Siskeudes & Sipades
--              yang menyimpan data inventaris kekayaan desa KIB A - KIB F, transaksi
--              pengadaan, mutasi penggunaan, pemanfaatan, kapitalisasi, penghapusan,
--              persediaan barang habis pakai, serta logs koordinat GIS dan audit fisik.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PEMBERSIHAN TABEL (JIKA SUDAH ADA)
-- ------------------------------------------------------------------------------
-- Note: Melakukan DROP tabel dengan urutan dependency yang terbalik dari foreign keys.
DROP TABLE IF EXISTS audit CASCADE;
DROP TABLE IF EXISTS persediaan CASCADE;
DROP TABLE IF EXISTS penghapusan CASCADE;
DROP TABLE IF EXISTS kapitalisasi CASCADE;
DROP TABLE IF EXISTS pemanfaatan CASCADE;
DROP TABLE IF EXISTS penggunaan CASCADE;
DROP TABLE IF EXISTS pengadaan CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS ruangan CASCADE;
DROP TABLE IF EXISTS perangkat_desa CASCADE;
DROP TABLE IF EXISTS profil_desa CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS ref_kode_barang CASCADE;


-- ------------------------------------------------------------------------------
-- 2. STRUKTUR TABEL URUSAN & MASTER
-- ------------------------------------------------------------------------------

-- A. Referensi Kode Barang Klasifikasi (Permendagri No. 47 Tahun 2021)
CREATE TABLE ref_kode_barang (
    id VARCHAR(50) PRIMARY KEY,
    kode VARCHAR(50) NOT NULL UNIQUE,
    nama VARCHAR(255) NOT NULL,
    kategori VARCHAR(20) NOT NULL CHECK (kategori IN ('KIB A', 'KIB B', 'KIB C', 'KIB D', 'KIB E', 'KIB F')),
    keterangan TEXT,
    is_custom BOOLEAN DEFAULT FALSE
);

-- B. Pengguna Sistem (Users & Roles)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Administrator', 'Operator Desa', 'Kepala Desa', 'Auditor')),
    status VARCHAR(20) NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- C. Profil Pemerintahan Desa
CREATE TABLE profil_desa (
    kode_desa VARCHAR(50) PRIMARY KEY, -- ex: 52.03.02.2008 (Kode Wilayah Rarang Selatan)
    nama_desa VARCHAR(150) NOT NULL,
    kecamatan VARCHAR(100) NOT NULL,
    kabupaten VARCHAR(100) NOT NULL,
    provinsi VARCHAR(100) NOT NULL,
    logo VARCHAR(500),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- D. Perangkat Desa Aktif / Penanggung jawab
CREATE TABLE perangkat_desa (
    id VARCHAR(50) PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    jabatan VARCHAR(100) NOT NULL,
    nip VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif'))
);

-- E. Daftar Lokasi / Ruangan di Lingkungan Kantor & Dusun
CREATE TABLE ruangan (
    id VARCHAR(50) PRIMARY KEY,
    nama_ruangan VARCHAR(150) NOT NULL,
    lokasi VARCHAR(255) NOT NULL,
    penanggung_jawab VARCHAR(150) NOT NULL
);


-- ------------------------------------------------------------------------------
-- 3. TABEL INVENTARIS UTAMA (KIB A - F)
-- ------------------------------------------------------------------------------

-- F. Aset Tetap Milik Desa (Kartu Inventaris Barang / KIB)
CREATE TABLE assets (
    id VARCHAR(50) PRIMARY KEY,
    kategori VARCHAR(20) NOT NULL CHECK (kategori IN ('KIB A', 'KIB B', 'KIB C', 'KIB D', 'KIB E', 'KIB F')),
    kode_barang VARCHAR(50) NOT NULL,
    nama_barang VARCHAR(255) NOT NULL,
    luas VARCHAR(100),               -- Berlaku untuk KIB A (Tanah), C (Gedung)
    sertifikat VARCHAR(255),         -- Berlaku untuk KIB A (Tanah) - Sertifikat Hak Pakai
    merk VARCHAR(255),               -- Berlaku untuk KIB B (Peralatan)
    tahun VARCHAR(10) NOT NULL,       -- Tahun Perolehan / Pembelian
    nilai DECIMAL(18, 2) NOT NULL DEFAULT 0.00 CHECK (nilai >= 0),
    lokasi VARCHAR(255) NOT NULL,    -- Sektor/Ruangan penempatan aset
    kondisi VARCHAR(50) NOT NULL DEFAULT 'Baik' CHECK (kondisi IN ('Baik', 'Rusak Ringan', 'Rusak Berat', 'Hilang')),
    panjang VARCHAR(100),            -- Berlaku untuk KIB D (Jalan & Irigasi)
    progress VARCHAR(50),            -- Berlaku untuk KIB F (Konstruksi Dalam Pengerjaan, e.g., '45%')
    keterangan TEXT,                 -- Catatan tambahan / KIB E (Aset Tetap Lainnya)
    foto VARCHAR(500),               -- Tautan foto verifikasi fisik lapangan
    latitude DOUBLE PRECISION,       -- Koordinat Geografis (Sipades-GIS)
    longitude DOUBLE PRECISION,      -- Koordinat Geografis (Sipades-GIS)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assets_kode FOREIGN KEY (kode_barang) REFERENCES ref_kode_barang(kode) ON UPDATE CASCADE
);


-- ------------------------------------------------------------------------------
-- 4. TABEL MUTASI DAN TRANSAKSI KEUANGAN
-- ------------------------------------------------------------------------------

-- G. Log Pengadaan Sarana & Prasarana Baru
CREATE TABLE pengadaan (
    id VARCHAR(50) PRIMARY KEY,
    tanggal DATE NOT NULL,
    kegiatan VARCHAR(255) NOT NULL,
    sumber_dana VARCHAR(10) NOT NULL CHECK (sumber_dana IN ('DDS', 'ADD', 'PAD', 'PBP')), -- DDS=Dana Desa APBDes
    kode_rekening VARCHAR(100) NOT NULL,
    barang VARCHAR(255) NOT NULL,
    volume INT NOT NULL DEFAULT 1 CHECK (volume > 0),
    harga DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    lokasi VARCHAR(255) NOT NULL,
    foto VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'Draf' CHECK (status IN ('Draf', 'Terposting'))
);

-- H. Distribusi Penggunaan / Surat Keputusan (SK) Kuasa Pengguna Barang
CREATE TABLE penggunaan (
    id VARCHAR(50) PRIMARY KEY,
    sk VARCHAR(150) NOT NULL,
    barang_id VARCHAR(50) NOT NULL,
    nama_barang VARCHAR(255) NOT NULL,
    pengguna VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL,
    status VARCHAR(25) NOT NULL DEFAULT 'Berjalan' CHECK (status IN ('Berjalan', 'Selesai')),
    CONSTRAINT fk_penggunaan_asset FOREIGN KEY (barang_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- I. Sewa / Pemanfaatan Lahan Sawah / Lapangan Oleh Pihak Ketiga (BUMDes / Poktan)
CREATE TABLE pemanfaatan (
    id VARCHAR(50) PRIMARY KEY,
    barang_id VARCHAR(50) NOT NULL,
    nama_barang VARCHAR(255) NOT NULL,
    jenis VARCHAR(50) NOT NULL CHECK (jenis IN ('Sewa', 'Pinjam Pakai', 'Kerjasama Pemanfaatan', 'Bangun Guna Serah')),
    mitra VARCHAR(255) NOT NULL,
    periode_mulai DATE NOT NULL,
    periode_selesai DATE NOT NULL,
    nilai_kontrak DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(25) NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Selesai')),
    CONSTRAINT fk_pemanfaatan_asset FOREIGN KEY (barang_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- J. Kapitalisasi Penambahan Nilai Aset (Rehabilitasi / Renovasi Berat)
CREATE TABLE kapitalisasi (
    id VARCHAR(50) PRIMARY KEY,
    barang_id VARCHAR(50) NOT NULL,
    nama_barang VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL,
    keterangan TEXT NOT NULL,
    nilai_lama DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    nilai_tambah DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    nilai_baru DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'Draf' CHECK (status IN ('Draf', 'Terposting')),
    CONSTRAINT fk_kapitalisasi_asset FOREIGN KEY (barang_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- K. Penghapusan / Disposal Aset Rusak Berat, Dijual / Hibah
CREATE TABLE penghapusan (
    id VARCHAR(50) PRIMARY KEY,
    barang_id VARCHAR(50) NOT NULL,
    nama_barang VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL,
    alasan VARCHAR(50) NOT NULL CHECK (alasan IN ('Rusak Berat', 'Hilang', 'Dijual', 'Hibah')),
    berita_acara VARCHAR(150) NOT NULL,
    nilai_buku DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_penghapusan_asset FOREIGN KEY (barang_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- L. Persediaan Logistik Kantor & Ketahanan Pangan (Barang Habis Pakai)
CREATE TABLE persediaan (
    id VARCHAR(50) PRIMARY KEY,
    tanggal DATE NOT NULL,
    nama_barang VARCHAR(255) NOT NULL,
    tipe VARCHAR(10) NOT NULL CHECK (tipe IN ('Masuk', 'Keluar')),
    jumlah INT NOT NULL DEFAULT 0 CHECK (jumlah >= 0),
    penerima VARCHAR(255),
    stok_sisa INT NOT NULL DEFAULT 0 CHECK (stok_sisa >= 0),
    keterangan TEXT
);

-- M. Lembar Audit Fisik Kondisi Lapangan (Opname Fisik)
CREATE TABLE audit (
    id VARCHAR(50) PRIMARY KEY,
    tanggal DATE NOT NULL,
    barang_id VARCHAR(50) NOT NULL,
    nama_barang VARCHAR(255) NOT NULL,
    kondisi VARCHAR(50) NOT NULL CHECK (kondisi IN ('Baik', 'Rusak Ringan', 'Rusak Berat', 'Hilang')),
    auditor VARCHAR(255) NOT NULL,
    catatan TEXT NOT NULL,
    foto VARCHAR(500),
    CONSTRAINT fk_audit_asset FOREIGN KEY (barang_id) REFERENCES assets(id) ON DELETE CASCADE
);


-- ------------------------------------------------------------------------------
-- 5. OPTIMALISASI DATABASE (INDEXES DESIGN)
-- ------------------------------------------------------------------------------
-- Pemasangan indexes mempercepat filtering laporan tahunan, scanning QR code, & load GIS
CREATE INDEX idx_assets_kategori ON assets (kategori);
CREATE INDEX idx_assets_kode ON assets (kode_barang);
CREATE INDEX idx_assets_kondisi ON assets (kondisi);
CREATE INDEX idx_assets_gis ON assets (latitude, longitude);
CREATE INDEX idx_persediaan_nama ON persediaan (nama_barang);
CREATE INDEX idx_pengadaan_tanggal ON pengadaan (tanggal);


-- ==============================================================================
--                       II. SEED DATA (INITIAL PAYLOAD)
--          (Sesuai Data Riil Pemerintah Desa Rarang Selatan Terkini)
-- ==============================================================================

-- 1. SEED DATA: REFERENSI KODE BARANG (REF KODE BARANG)
INSERT INTO ref_kode_barang (id, kode, nama, kategori, keterangan, is_custom) VALUES
-- KIB A (Tanah)
('KB-01', '01.01.01.01.01', 'Tanah Bangunan Perkantoran Desa', 'KIB A', 'Tanah bangunan untuk keperluan dinas pelayanan desa & BPD.', FALSE),
('KB-02', '01.01.01.01.02', 'Tanah Pekarangan Kantor', 'KIB A', 'Lahan kosong di sekeliling wilayah fasilitas kantor pemerintah desa.', FALSE),
('KB-03', '01.01.01.02.04', 'Tanah Sawah Kas Desa (Bengkok Kades / Perangkat)', 'KIB A', 'Sawah jaminan/bengkok jabatan yang dikelola kades/staf.', FALSE),
('KB-04', '01.01.01.03.01', 'Tanah Lapangan Olahraga Desa', 'KIB A', 'Lahan olahraga pemuda desa / fasilitas lapangan umum Dusun Rarang.', FALSE),
('KB-05', '01.01.02.01.01', 'Tempat Pemakaman Umum (TPU) Desa', 'KIB A', 'Lokasi pekuburan atau pemakaman warga desa.', FALSE),

-- KIB B (Peralatan & Mesin)
('KB-06', '02.03.01.03.02', 'Laptop / Notebook Komputer', 'KIB B', 'Alat pengolah data portable pendukung kinerja staf desa.', FALSE),
('KB-07', '02.03.01.03.01', 'Personal Computer (PC) / Desktop', 'KIB B', 'Unit komputer meja di bagian admin / kaur umum.', FALSE),
('KB-08', '02.04.12.01.02', 'Sepeda Motor Operasional Desa', 'KIB B', 'Kendaraan roda dua dinas perangkat/kepala desa untuk kerja lapangan.', FALSE),
('KB-09', '02.04.05.01.01', 'Ambulans Desa / Mobil Siaga Desa', 'KIB B', 'Mobil kesehatan penunjang rujukan darurat warga desa.', FALSE),
('KB-10', '02.06.01.01.01', 'Kursi Besi / Kursi Aula Lipat', 'KIB B', 'Menejemen inventaris kursi lipat serbaguna di Aula Desa.', FALSE),
('KB-11', '02.03.01.04.01', 'Printer / Scanner Kantor', 'KIB B', 'Alat cetak administrasi, surat pengantar, & laporan desa.', FALSE),
('KB-12', '02.05.01.01.01', 'Televisi / Alat Studio', 'KIB B', 'Smart TV pemantau visual CCTV atau papan pengumuman digital.', FALSE),
('KB-13', '02.05.02.01.01', 'Sound System / Wireless Amplifier Aula', 'KIB B', 'Alat pengeras suara portable dan sound aula rapat warga Kades.', FALSE),

-- KIB C (Gedung & Bangunan)
('KB-14', '03.01.01.01.01', 'Gedung Kantor Pemerintah Desa', 'KIB C', 'Bangunan fisik utama kantor urusan & layanan masyarakat.', FALSE),
('KB-15', '03.02.01.03.01', 'Gedung Posyandu / KIA Desa', 'KIB C', 'Fasilitas balai pos pelayanan terpadu bagi warga dusun.', FALSE),
('KB-16', '03.01.01.03.01', 'Gedung Aula Serbaguna Desa', 'KIB C', 'Aula besar tempat berkumpulnya musyawarah perencanaan pembangunan desa.', FALSE),
('KB-17', '03.01.01.05.01', 'Gedung Perpustakaan Desa', 'KIB C', 'Ruang baca umum penyedia literasi pendidikan untuk anak & warga.', FALSE),
('KB-18', '03.04.01.01.01', 'Tempat Parkir Kendaraan Kantor', 'KIB C', 'Kanopi/paving block parkiran roda dua dan roda empat desa.', FALSE),

-- KIB D (Jalan, Irigasi & Jembatan)
('KB-19', '04.01.01.02.01', 'Rabat Beton / Aspal Jalan Lingkungan Desa', 'KIB D', 'Konstruksi prasarana jalan rabat penghubung antar-dusun.', FALSE),
('KB-20', '04.01.02.01.01', 'Jembatan Desa Baja / Beton', 'KIB D', 'Struktur penghubung sungai atau irigasi besar antar wilayah tani.', FALSE),
('KB-21', '04.03.01.01.02', 'Saluran Irigasi Tersier Petanian', 'KIB D', 'Parit/gorong-gorong penyaluran air sawah kelompok tani subak.', FALSE),
('KB-22', '04.03.02.01.01', 'Penampungan Air Bersih Desa (Sumur Bor)', 'KIB D', 'Instalasi pasokan air minum bersih komunal masyarakat Rarang.', FALSE),
('KB-23', '04.05.01.01.01', 'Jaringan Listrik Jalan / Penerangan Jalan Umum', 'KIB D', 'Tiang, solar cell & lampu jalan umum desa untuk keamanan malam hari.', FALSE),

-- KIB E (Aset Tetap Lainnya)
('KB-24', '05.01.01.01.02', 'Buku Ilmu Pengetahuan / Perpustakaan', 'KIB E', 'Buku-buku koleksi keagamaan, hukum, peternakan & pertanian desa.', FALSE),
('KB-25', '05.01.02.01.01', 'Barang Kesenian Tradisional Gendang Beleq (Sasak)', 'KIB E', 'Aset kebudayaan berupa alat musik tradisional suku Sasak.', FALSE),
('KB-26', '05.02.01.01.01', 'Hewan Ternak / Tanaman Induk Desa', 'KIB E', 'Induk sapi/kambing program pemberdayaan ketahanan pangan lokal.', FALSE),

-- KIB F (Konstruksi Dalam Pengerjaan)
('KB-27', '06.01.01.01.99', 'Konstruksi Bangunan Dalam Pengerjaan (KDP LAPANGAN)', 'KIB F', 'Aset berbentuk bangunan fisik yang status penyelesaiannya masih draf fisik.', FALSE),
('KB-28', '06.01.02.01.99', 'Konstruksi Jalan / Irigasi Dalam Pengerjaan', 'KIB F', 'Proyek jalan lingkungan atau pintu air irigasi desa masih berjalan.', FALSE);


-- 2. SEED DATA: PENGGUNA SISTEM
INSERT INTO users (id, nama, username, role, status) VALUES
('U-01', 'Sapriadi, S.H.', 'admin_sipades', 'Administrator', 'Aktif'),
('U-02', 'Lalu Darmawan', 'operator_rarang', 'Operator Desa', 'Aktif'),
('U-03', 'H. Ridwan, M.Si.', 'kades_rarang', 'Kepala Desa', 'Aktif'),
('U-04', 'Drs. Hermawan', 'auditor_lt', 'Auditor', 'Aktif');


-- 3. SEED DATA: PROFIL DESA (RARANG SELATAN)
INSERT INTO profil_desa (kode_desa, nama_desa, kecamatan, kabupaten, provinsi, logo) VALUES
('52.03.02.2008', 'Desa Rarang Selatan', 'Terara', 'Lombok Timur', 'Nusa Tenggara Barat', 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Lambang_Dati_II_Lombok_Timur.png');


-- 4. SEED DATA: PERANGKAT DESA
INSERT INTO perangkat_desa (id, nama, jabatan, nip, status) VALUES
('P-01', 'H. Ridwan, M.Si.', 'Kepala Desa', '197508122002121003', 'Aktif'),
('P-02', 'Supriadi, S.IP.', 'Sekretaris Desa', '198004152009031002', 'Aktif'),
('P-03', 'Hamzanwadi', 'Kaur Keuangan', '198811022015041001', 'Aktif'),
('P-04', 'Baiq Elok', 'Kaur Umum', '199102202018012002', 'Aktif');


-- 5. SEED DATA: DAFTAR RUANGAN DESAL / SEKTOR
INSERT INTO ruangan (id, nama_ruangan, lokasi, penanggung_jawab) VALUES
('R-01', 'Kantor Kepala Desa', 'Gedung Utama Lantai 1', 'H. Ridwan, M.Si.'),
('R-02', 'Ruang Tata Usaha / Pelayanan', 'Gedung Utama Lantai 1', 'Supriadi, S.IP.'),
('R-03', 'Aula Pertemuan Desa', 'Gedung Serbaguna', 'Baiq Elok'),
('R-04', 'Gudang Logistik & Inventaris', 'Gedung Belakang', 'Baiq Elok'),
('R-05', 'Posyandu Mawar', 'Dusun Rarang Barat', 'Kader Posyandu');


-- 6. SEED DATA: DAFTAR ASET KIB A - F (KECACATAN GEOGRAFIS DI PETAKAN JELAS UNTUK GIS MAP)
INSERT INTO assets (id, kategori, kode_barang, nama_barang, luas, sertifikat, merk, tahun, nilai, lokasi, kondisi, panjang, progress, keterangan, foto, latitude, longitude) VALUES
-- KIB A (Tanah)
('AST-01', 'KIB A', '01.01.01.01.01', 'Tanah Kas Desa (Pekarangan Kantor)', '1.200 m2', 'M.12/Rarang_Selatan/2005', NULL, '2005', 350000000.00, 'Gedung Utama Rarang Selatan', 'Baik', NULL, NULL, NULL, NULL, -8.627622, 116.345861),
('AST-02', 'KIB A', '01.01.01.02.04', 'Tanah Sawah Bengkok Kades', '12.500 m2', 'M.56/Rarang_Selatan/2008', NULL, '2008', 820000000.00, 'Sektor Pertanian Dusun Orong', 'Baik', NULL, NULL, NULL, NULL, -8.631022, 116.349011),

-- KIB B (Peralatan & Mesin)
('AST-03', 'KIB B', '02.03.01.03.02', 'Laptop Asus ExpertBook Core i5', NULL, NULL, 'Asus ExpertBook B1400', '2024', 14500000.00, 'Ruang Tata Usaha / Pelayanan', 'Baik', NULL, NULL, NULL, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&auto=format&fit=crop&q=60', NULL, NULL),
('AST-04', 'KIB B', '02.04.12.01.02', 'Sepeda Motor Operasional Desa (Yamaha NMAX)', NULL, NULL, 'Yamaha NMAX 155cc', '2022', 33200000.00, 'Sektor Logistik', 'Baik', NULL, NULL, NULL, 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&auto=format&fit=crop&q=60', NULL, NULL),
('AST-05', 'KIB B', '02.06.01.01.01', 'Kursi Lipat Aula (Shitako)', NULL, NULL, 'Shitako Futura', '2021', 24000000.00, 'Aula Pertemuan Desa', 'Rusak Ringan', NULL, NULL, NULL, NULL, NULL, NULL),

-- KIB C (Gedung & Bangunan)
('AST-06', 'KIB C', '03.01.01.01.01', 'Gedung Kantor Desa Rarang Selatan', '350 m2', NULL, NULL, '2010', 550000000.00, 'Gedung Utama Rarang Selatan', 'Baik', NULL, NULL, NULL, 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=400&auto=format&fit=crop&q=60', -8.627622, 116.345861),
('AST-07', 'KIB C', '03.02.01.03.01', 'Gedung Posyandu Mawar Jingga', '80 m2', NULL, NULL, '2018', 120000000.00, 'Dusun Rarang Barat', 'Baik', NULL, NULL, NULL, NULL, -8.625122, 116.342111),

-- KIB D (Jalan, Irigasi & Jembatan)
('AST-08', 'KIB D', '04.01.01.02.01', 'Rabat Beton Jalan Lingkungan Dusun Barat', NULL, NULL, NULL, '2023', 185000000.00, 'Dusun Rarang Barat', 'Baik', '450 Meter', NULL, NULL, NULL, -8.624022, 116.341111),
('AST-09', 'KIB D', '04.03.01.01.02', 'Saluran Irigasi Tersier Subak Lauk', NULL, NULL, NULL, '2022', 240000000.00, 'Sektor Pertanian Dusun Orong', 'Rusak Ringan', '800 Meter', NULL, NULL, NULL, -8.632122, 116.351222),

-- KIB E (Aset Lainnya)
('AST-10', 'KIB E', '05.01.01.01.02', 'Buku Perpustakaan Desa (Kumpulan Hukum & Pertanian)', NULL, NULL, NULL, '2020', 8500000.00, 'Gedung Utama Rarang Selatan', 'Baik', NULL, NULL, 'Sumbangan Dinas Arsip & Perpustakaan', NULL, NULL, NULL),

-- KIB F (Konstruksi Dalam Pengerjaan)
('AST-11', 'KIB F', '06.01.01.01.99', 'Pembangunan Lapangan Futsal Desa Rarang', NULL, NULL, NULL, '2026', 75000000.00, 'Dusun Rarang Timur', 'Baik', NULL, '45%', 'Realisasi biaya termin kesatu', NULL, -8.629122, 116.349111);


-- 7. SEED DATA: TRANSAKSI PENGADAAN BARU
INSERT INTO pengadaan (id, tanggal, kegiatan, sumber_dana, kode_rekening, barang, volume, harga, total, lokasi, foto, status) VALUES
('PGD-01', '2026-02-15', 'Pengadaan Sarana Layanan Publik Berbasis IT', 'DDS', '2.05.02.5.2.2.01', 'Printer EPSON L3110 All-in-One', 2, 2850000.00, 5700000.00, 'Ruang Tata Usaha / Pelayanan', NULL, 'Terposting'),
('PGD-02', '2026-05-10', 'Peningkatan Sarana Posyandu Cegah Stunting', 'ADD', '2.02.04.5.2.3.15', 'Alat Ukur Tinggi & Timbangan Digital Bayi', 5, 1600000.00, 8000000.00, 'Posyandu Mawar', NULL, 'Draf');


-- 8. SEED DATA: LOG PENGGUNAAN SK KADES
INSERT INTO penggunaan (id, sk, barang_id, nama_barang, pengguna, tanggal, status) VALUES
('PGN-01', 'SK.141/02-DS.RS/2024', 'AST-04', 'Sepeda Motor Operasional Desa (Yamaha NMAX)', 'Supriadi, S.IP. (Sekretaris Desa Rarang Selatan)', '2024-01-10', 'Berjalan'),
('PGN-02', 'SK.141/15-DS.RS/2024', 'AST-03', 'Laptop Asus ExpertBook Core i5', 'Baiq Elok (Staff Kaur Umum)', '2024-03-12', 'Berjalan');


-- 9. SEED DATA: TRANSAKSI PEMANFAATAN BAGI HASIL / SEWA
INSERT INTO pemanfaatan (id, barang_id, nama_barang, jenis, mitra, periode_mulai, periode_selesai, nilai_kontrak, status) VALUES
('PMF-01', 'AST-05', 'Kursi Lipat Aula (Shitako)', 'Sewa', 'Kelompok Pemuda Karang Taruna (Acara Sumpah Pemuda)', '2025-10-27', '2025-10-29', 350000.00, 'Selesai'),
('PMF-02', 'AST-02', 'Tanah Sawah Bengkok Kades', 'Sewa', 'Poktan Tani Makmur Rarang', '2026-05-01', '2027-05-01', 12000000.00, 'Aktif');


-- 10. SEED DATA: LOG REALISASI REHABILITASI KAPITALISASI
INSERT INTO kapitalisasi (id, barang_id, nama_barang, tanggal, keterangan, nilai_lama, nilai_tambah, nilai_baru, status) VALUES
('KAP-01', 'AST-06', 'Gedung Kantor Desa Rarang Selatan', '2025-08-20', 'Pemasangan Kanopi Baja Ringan & Cat Ulang Bagian Luar', 550000000.00, 45000000.00, 595000000.00, 'Terposting');


-- 11. SEED DATA: PENGHAPUSAN BARANG DISPOSAL
INSERT INTO penghapusan (id, barang_id, nama_barang, tanggal, alasan, berita_acara, nilai_buku) VALUES
('PHP-01', 'AST-05', 'Komputer Deskpro Intel Core 2 Duo (Aset Bersejarah Desa)', '2026-03-10', 'Rusak Berat', 'BA.045.2/08/RS/III/2026', 5500000.00);


-- 12. SEED DATA: PERSEDIAAN BARANG HABIS PAKAI
INSERT INTO persediaan (id, tanggal, nama_barang, tipe, jumlah, penerima, stok_sisa, keterangan) VALUES
('PSD-01', '2026-05-01', 'Bibit Jagung Hibrida Premium', 'Masuk', 150, NULL, 150, 'Bantuan Dinas Pertanian Lombok Timur'),
('PSD-02', '2026-05-05', 'Bibit Jagung Hibrida Premium', 'Keluar', 40, 'Kelompok Tani Harapan Jaya', 110, 'Pembagian bibit gratis Program Ketahanan Pangan'),
('PSD-03', '2026-06-01', 'Kertas HVS A4 Sinar Dunia 80gr', 'Masuk', 50, NULL, 50, 'Pengadaan rutin ATK Kantor'),
('PSD-04', '2026-06-03', 'Kertas HVS A4 Sinar Dunia 80gr', 'Keluar', 10, 'Sekretariat Pelayanan Desa', 40, 'Penggunaan operasional tata usaha');


-- 13. SEED DATA: OPNAME / AUDIT FISIK LAPANGAN
INSERT INTO audit (id, tanggal, barang_id, nama_barang, kondisi, auditor, catatan, foto) VALUES
('AUD-01', '2026-05-20', 'AST-03', 'Laptop Asus ExpertBook Core i5', 'Baik', 'Drs. Hermawan (Auditor Lombok Timur)', 'Sistem dan fisik dalam kondisi prima, terlabeli QR Code dengan lengkap.', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&auto=format&fit=crop&q=60');


-- ==============================================================================
--                       III. CONTOH QUERY MONITORING & LAPORAN
-- ==============================================================================

-- 1. Query: Rekapitulasi Total Jumlah Kekayaan Desa berdasarkan Kategori KIB
-- SELECT kategori, COUNT(id) AS jumlah_item, SUM(nilai) AS total_nilai 
-- FROM assets 
-- GROUP BY kategori 
-- ORDER BY kategori;

-- 2. Query: Mengidentifikasi Aset yang Rusak Berat atau Perlu Segera Direhabilitasi
-- SELECT id, nama_barang, lokasi, kondisi, nilai 
-- FROM assets 
-- WHERE kondisi IN ('Rusak Ringan', 'Rusak Berat') 
-- ORDER BY kondisi DESC;

-- 3. Query: Evaluasi Status Mutasi Sewa / Pemanfaatan Lahan Milik Desa Berjalan
-- SELECT p.id, p.nama_barang, p.mitra, p.periode_mulai, p.periode_selesai, p.nilai_kontrak, p.status 
-- FROM pemanfaatan p 
-- WHERE p.status = 'Aktif' AND p.periode_selesai >= CURRENT_DATE;
