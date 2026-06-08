import { pgTable, text, integer, doublePrecision, numeric, timestamp } from "drizzle-orm/pg-core";

// 1. Ref Kode Barang (Optional reference table or simple text model)
export const refKodeBarang = pgTable("ref_kode_barang", {
  id: text("id").primaryKey(),
  kode: text("kode").notNull().unique(),
  nama: text("nama").notNull(),
  kategori: text("kategori").notNull(),
  keterangan: text("keterangan"),
});

// 2. Users
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  nama: text("nama").notNull(),
  username: text("username").notNull().unique(),
  role: text("role").notNull(), // Administrator, Operator Desa, Kepala Desa, Auditor
  status: text("status").notNull().default("Aktif"),
});

// 3. Profil Desa
export const profilDesa = pgTable("profil_desa", {
  kodeDesa: text("kode_desa").primaryKey(),
  namaDesa: text("nama_desa").notNull(),
  kecamatan: text("kecamatan").notNull(),
  kabupaten: text("kabupaten").notNull(),
  provinsi: text("provinsi").notNull(),
  logo: text("logo"),
});

// 4. Perangkat Desa
export const perangkatDesa = pgTable("perangkat_desa", {
  id: text("id").primaryKey(),
  nama: text("nama").notNull(),
  jabatan: text("jabatan").notNull(),
  nip: text("nip").notNull(),
  status: text("status").notNull().default("Aktif"),
});

// 5. Ruangan
export const ruangan = pgTable("ruangan", {
  id: text("id").primaryKey(),
  namaRuangan: text("nama_ruangan").notNull(),
  lokasi: text("lokasi").notNull(),
  penanggungJawab: text("penanggung_jawab").notNull(),
});

// 6. Assets
export const assets = pgTable("assets", {
  id: text("id").primaryKey(),
  kategori: text("kategori").notNull(),
  kode_barang: text("kode_barang").notNull(),
  nama_barang: text("nama_barang").notNull(),
  luas: text("luas"),
  sertifikat: text("sertifikat"),
  merk: text("merk"),
  tahun: text("tahun").notNull(),
  nilai: doublePrecision("nilai").notNull().default(0),
  lokasi: text("lokasi").notNull(),
  kondisi: text("kondisi").notNull().default("Baik"),
  panjang: text("panjang"),
  progress: text("progress"),
  keterangan: text("keterangan"),
  foto: text("foto"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
});

// 7. Pengadaan
export const pengadaan = pgTable("pengadaan", {
  id: text("id").primaryKey(),
  tanggal: text("tanggal").notNull(),
  kegiatan: text("kegiatan").notNull(),
  sumber_dana: text("sumber_dana").notNull(), // DDS, ADD, PAD, PBP
  kode_rekening: text("kode_rekening").notNull(),
  barang: text("barang").notNull(),
  volume: integer("volume").notNull().default(1),
  harga: doublePrecision("harga").notNull().default(0),
  total: doublePrecision("total").notNull().default(0),
  lokasi: text("lokasi").notNull(),
  foto: text("foto"),
  status: text("status").notNull().default("Draf"),
});

// 8. Penggunaan
export const penggunaan = pgTable("penggunaan", {
  id: text("id").primaryKey(),
  sk: text("sk").notNull(),
  barang_id: text("barang_id").notNull(),
  nama_barang: text("nama_barang").notNull(),
  pengguna: text("pengguna").notNull(),
  tanggal: text("tanggal").notNull(),
  status: text("status").notNull().default("Berjalan"),
});

// 9. Pemanfaatan
export const pemanfaatan = pgTable("pemanfaatan", {
  id: text("id").primaryKey(),
  barang_id: text("barang_id").notNull(),
  nama_barang: text("nama_barang").notNull(),
  jenis: text("jenis").notNull(), // Sewa, Pinjam Pakai, etc.
  mitra: text("mitra").notNull(),
  periode_mulai: text("periode_mulai").notNull(),
  periode_selesai: text("periode_selesai").notNull(),
  nilai_kontrak: doublePrecision("nilai_kontrak").notNull().default(0),
  status: text("status").notNull().default("Aktif"),
});

// 10. Kapitalisasi
export const kapitalisasi = pgTable("kapitalisasi", {
  id: text("id").primaryKey(),
  barang_id: text("barang_id").notNull(),
  nama_barang: text("nama_barang").notNull(),
  tanggal: text("tanggal").notNull(),
  keterangan: text("keterangan").notNull(),
  nilai_lama: doublePrecision("nilai_lama").notNull().default(0),
  nilai_tambah: doublePrecision("nilai_tambah").notNull().default(0),
  nilai_baru: doublePrecision("nilai_baru").notNull().default(0),
  status: text("status").notNull().default("Draf"),
});

// 11. Penghapusan
export const penghapusan = pgTable("penghapusan", {
  id: text("id").primaryKey(),
  barang_id: text("barang_id").notNull(),
  nama_barang: text("nama_barang").notNull(),
  tanggal: text("tanggal").notNull(),
  alasan: text("alasan").notNull(), // Rusak Berat, Hilang, etc.
  berita_acara: text("berita_acara").notNull(),
  nilai_buku: doublePrecision("nilai_buku").notNull().default(0),
});

// 12. Persediaan
export const persediaan = pgTable("persediaan", {
  id: text("id").primaryKey(),
  tanggal: text("tanggal").notNull(),
  nama_barang: text("nama_barang").notNull(),
  tipe: text("tipe").notNull(), // Masuk, Keluar
  jumlah: integer("jumlah").notNull().default(0),
  penerima: text("penerima"),
  stok_sisa: integer("stok_sisa").notNull().default(0),
  keterangan: text("keterangan"),
});

// 13. Audit
export const audit = pgTable("audit", {
  id: text("id").primaryKey(),
  tanggal: text("tanggal").notNull(),
  barang_id: text("barang_id").notNull(),
  nama_barang: text("nama_barang").notNull(),
  kondisi: text("kondisi").notNull(), // Baik, Rusak Ringan, Rusak Berat, Hilang
  auditor: text("auditor").notNull(),
  catatan: text("catatan").notNull(),
  foto: text("foto"),
});
