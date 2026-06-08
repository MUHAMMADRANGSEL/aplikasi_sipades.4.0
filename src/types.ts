export interface User {
  id: string;
  nama: string;
  username: string;
  role: "Administrator" | "Operator Desa" | "Kepala Desa" | "Auditor";
  status: "Aktif" | "Nonaktif";
}

export interface ProfilDesa {
  kodeDesa: string;
  namaDesa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  logo: string;
}

export interface PerangkatDesa {
  id: string;
  nama: string;
  jabatan: string;
  nip: string;
  status: "Aktif" | "Nonaktif";
}

export interface Ruangan {
  id: string;
  namaRuangan: string;
  lokasi: string;
  penanggungJawab: string;
}

// Unified representation of an Asset in KIB A-F
export interface Asset {
  id: string;
  kategori: "KIB A" | "KIB B" | "KIB C" | "KIB D" | "KIB E" | "KIB F";
  kode_barang: string;
  nama_barang: string;
  luas?: string;       // KIB A, C
  sertifikat?: string; // KIB A
  merk?: string;       // KIB B
  tahun: string;       // KIB B, C, E
  nilai: number;       // All
  lokasi: string;      // All (Ruangan/Sektor)
  kondisi: "Baik" | "Rusak Ringan" | "Rusak Berat" | "Hilang";
  panjang?: string;    // KIB D
  progress?: string;   // KIB F
  keterangan?: string; // KIB E
  foto?: string;       // File reference / URL
  latitude?: number;   // GIS
  longitude?: number;  // GIS
}

export interface Pengadaan {
  id: string;
  tanggal: string;
  kegiatan: string;
  sumber_dana: "DDS" | "ADD" | "PAD" | "PBP"; // Dana Desa, Alokasi Dana Desa, Pendapatan Asli Desa, dll
  kode_rekening: string;
  barang: string;
  volume: number;
  harga: number;
  total: number;
  lokasi: string;
  foto?: string;
  status: "Draf" | "Terposting";
}

export interface Penggunaan {
  id: string;
  sk: string;
  barang_id: string;
  nama_barang: string;
  pengguna: string;
  tanggal: string;
  status: "Berjalan" | "Selesai";
}

export interface Pemanfaatan {
  id: string;
  barang_id: string;
  nama_barang: string;
  jenis: "Sewa" | "Pinjam Pakai" | "Kerjasama Pemanfaatan" | "Bangun Guna Serah";
  mitra: string;
  periode_mulai: string;
  periode_selesai: string;
  nilai_kontrak: number;
  status: "Aktif" | "Selesai";
}

export interface Kapitalisasi {
  id: string;
  barang_id: string;
  nama_barang: string;
  tanggal: string;
  keterangan: string;
  nilai_lama: number;
  nilai_tambah: number;
  nilai_baru: number;
  status: "Draf" | "Terposting";
}

export interface Penghapusan {
  id: string;
  barang_id: string;
  nama_barang: string;
  tanggal: string;
  alasan: "Rusak Berat" | "Hilang" | "Dijual" | "Hibah";
  berita_acara: string;
  nilai_buku: number;
}

export interface Persediaan {
  id: string;
  tanggal: string;
  nama_barang: string;
  tipe: "Masuk" | "Keluar";
  jumlah: number;
  penerima?: string;
  stok_sisa: number;
  keterangan?: string;
}

export interface Audit {
  id: string;
  tanggal: string;
  barang_id: string;
  nama_barang: string;
  kondisi: "Baik" | "Rusak Ringan" | "Rusak Berat" | "Hilang";
  auditor: string;
  catatan: string;
  foto?: string;
}

export interface WhatsAppConfig {
  apiKey: string;
  senderNo: string;
  recipientNo: string;
  templatePengadaan: string;
  templateAsetBaru: string;
}

// Initial Mock Seed Data matched to pemdes.rarangselatan@gmail.com
export const initialProfilDesa: ProfilDesa = {
  kodeDesa: "52.03.02.2008",
  namaDesa: "Desa Rarang Selatan",
  kecamatan: "Terara",
  kabupaten: "Lombok Timur",
  provinsi: "Nusa Tenggara Barat",
  logo: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Lambang_Dati_II_Lombok_Timur.png",
};

export const initialUsers: User[] = [
  { id: "U-01", nama: "Sapriadi, S.H.", username: "admin_sipades", role: "Administrator", status: "Aktif" },
  { id: "U-02", nama: "Lalu Darmawan", username: "operator_rarang", role: "Operator Desa", status: "Aktif" },
  { id: "U-03", nama: "H. Ridwan, M.Si.", username: "kades_rarang", role: "Kepala Desa", status: "Aktif" },
  { id: "U-04", nama: "Drs. Hermawan", username: "auditor_lt", role: "Auditor", status: "Aktif" },
];

export const initialPerangkatDesa: PerangkatDesa[] = [
  { id: "P-01", nama: "H. Ridwan, M.Si.", jabatan: "Kepala Desa", nip: "197508122002121003", status: "Aktif" },
  { id: "P-02", nama: "Supriadi, S.IP.", jabatan: "Sekretaris Desa", nip: "198004152009031002", status: "Aktif" },
  { id: "P-03", nama: "Hamzanwadi", jabatan: "Kaur Keuangan", nip: "198811022015041001", status: "Aktif" },
  { id: "P-04", nama: "Baiq Elok", jabatan: "Kaur Umum", nip: "199102202018012002", status: "Aktif" },
];

export const initialRuangan: Ruangan[] = [
  { id: "R-01", namaRuangan: "Kantor Kepala Desa", lokasi: "Gedung Utama Lantai 1", penanggungJawab: "H. Ridwan, M.Si." },
  { id: "R-02", namaRuangan: "Ruang Tata Usaha / Pelayanan", lokasi: "Gedung Utama Lantai 1", penanggungJawab: "Supriadi, S.IP." },
  { id: "R-03", namaRuangan: "Aula Pertemuan Desa", lokasi: "Gedung Serbaguna", penanggungJawab: "Baiq Elok" },
  { id: "R-04", namaRuangan: "Gudang Logistik & Inventaris", lokasi: "Gedung Belakang", penanggungJawab: "Baiq Elok" },
  { id: "R-05", namaRuangan: "Posyandu Mawar", lokasi: "Dusun Rarang Barat", penanggungJawab: "Kader Posyandu" },
];

export const initialAssets: Asset[] = [
  // KIB A (Tanah)
  {
    id: "AST-01",
    kategori: "KIB A",
    kode_barang: "01.01.01.01.01",
    nama_barang: "Tanah Kas Desa (Pekarangan Kantor)",
    luas: "1.200 m2",
    sertifikat: "M.12/Rarang_Selatan/2005",
    tahun: "2005",
    nilai: 350000000,
    lokasi: "Gedung Utama Rarang Selatan",
    kondisi: "Baik",
    latitude: -8.627622,
    longitude: 116.345861,
  },
  {
    id: "AST-02",
    kategori: "KIB A",
    kode_barang: "01.01.01.02.04",
    nama_barang: "Tanah Sawah Bengkok Kades",
    luas: "12.500 m2",
    sertifikat: "M.56/Rarang_Selatan/2008",
    tahun: "2008",
    nilai: 820000000,
    lokasi: "Sektor Pertanian Dusun Orong",
    kondisi: "Baik",
    latitude: -8.631022,
    longitude: 116.349011,
  },
  // KIB B (Peralatan & Mesin)
  {
    id: "AST-03",
    kategori: "KIB B",
    kode_barang: "02.03.01.03.02",
    nama_barang: "Laptop Asus ExpertBook Core i5",
    merk: "Asus ExpertBook B1400",
    tahun: "2024",
    nilai: 14500000,
    lokasi: "Ruang Tata Usaha / Pelayanan",
    kondisi: "Baik",
    foto: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&auto=format&fit=crop&q=60",
  },
  {
    id: "AST-04",
    kategori: "KIB B",
    kode_barang: "02.04.12.01.02",
    nama_barang: "Sepeda Motor Operasional Desa (Yamaha NMAX)",
    merk: "Yamaha NMAX 155cc",
    tahun: "2022",
    nilai: 33200000,
    lokasi: "Sektor Logistik",
    kondisi: "Baik",
    foto: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&auto=format&fit=crop&q=60",
  },
  {
    id: "AST-05",
    kategori: "KIB B",
    kode_barang: "02.06.01.01.01",
    nama_barang: "Kursi Lipat Aula (Shitako)",
    merk: "Shitako Futura",
    tahun: "2021",
    nilai: 24000000, // Total 100 Pcs @ 240.000
    lokasi: "Aula Pertemuan Desa",
    kondisi: "Rusak Ringan",
  },
  // KIB C (Gedung & Bangunan)
  {
    id: "AST-06",
    kategori: "KIB C",
    kode_barang: "03.01.01.01.01",
    nama_barang: "Gedung Kantor Desa Rarang Selatan",
    luas: "350 m2",
    tahun: "2010",
    nilai: 550000000,
    lokasi: "Gedung Utama Rarang Selatan",
    kondisi: "Baik",
    latitude: -8.627622,
    longitude: 116.345861,
    foto: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=400&auto=format&fit=crop&q=60",
  },
  {
    id: "AST-07",
    kategori: "KIB C",
    kode_barang: "03.02.01.03.01",
    nama_barang: "Gedung Posyandu Mawar Jingga",
    luas: "80 m2",
    tahun: "2018",
    nilai: 120000000,
    lokasi: "Dusun Rarang Barat",
    kondisi: "Baik",
    latitude: -8.625122,
    longitude: 116.342111,
  },
  // KIB D (Jalan, Irigasi & Jembatan)
  {
    id: "AST-08",
    kategori: "KIB D",
    kode_barang: "04.01.01.02.01",
    nama_barang: "Rabat Beton Jalan Lingkungan Dusun Barat",
    panjang: "450 Meter",
    tahun: "2023",
    nilai: 185000000,
    lokasi: "Dusun Rarang Barat",
    kondisi: "Baik",
    latitude: -8.624022,
    longitude: 116.341111,
  },
  {
    id: "AST-09",
    kategori: "KIB D",
    kode_barang: "04.03.01.01.02",
    nama_barang: "Saluran Irigasi Tersier Subak Lauk",
    panjang: "800 Meter",
    tahun: "2022",
    nilai: 240000000,
    lokasi: "Sektor Pertanian Dusun Orong",
    kondisi: "Rusak Ringan",
    latitude: -8.632122,
    longitude: 116.351222,
  },
  // KIB E (Aset Lainnya)
  {
    id: "AST-10",
    kategori: "KIB E",
    kode_barang: "05.01.01.01.02",
    nama_barang: "Buku Perpustakaan Desa (Kumpulan Hukum & Pertanian)",
    keterangan: "Sumbangan Dinas Arsip & Perpustakaan",
    tahun: "2020",
    nilai: 8500000,
    lokasi: "Gedung Utama Rarang Selatan",
    kondisi: "Baik",
  },
  // KIB F (Konstruksi Dalam Pengerjaan)
  {
    id: "AST-11",
    kategori: "KIB F",
    kode_barang: "06.01.01.01.99",
    nama_barang: "Pembangunan Lapangan Futsal Desa Rarang",
    progress: "45%",
    tahun: "2026",
    nilai: 75000000, // Realisasi termin 1
    lokasi: "Dusun Rarang Timur",
    kondisi: "Baik",
    latitude: -8.629122,
    longitude: 116.349111,
  }
];

export const initialPengadaan: Pengadaan[] = [
  {
    id: "PGD-01",
    tanggal: "2026-02-15",
    kegiatan: "Pengadaan Sarana Layanan Publik Berbasis IT",
    sumber_dana: "DDS",
    kode_rekening: "2.05.02.5.2.2.01",
    barang: "Printer EPSON L3110 All-in-One",
    volume: 2,
    harga: 2850000,
    total: 5700000,
    lokasi: "Ruang Tata Usaha / Pelayanan",
    status: "Terposting",
  },
  {
    id: "PGD-02",
    tanggal: "2026-05-10",
    kegiatan: "Peningkatan Sarana Posyandu Cegah Stunting",
    sumber_dana: "ADD",
    kode_rekening: "2.02.04.5.2.3.15",
    barang: "Alat Ukur Tinggi & Timbangan Digital Bayi",
    volume: 5,
    harga: 1600000,
    total: 8000000,
    lokasi: "Posyandu Mawar",
    status: "Draf"
  }
];

export const initialPenggunaan: Penggunaan[] = [
  {
    id: "PGN-01",
    sk: "SK.141/02-DS.RS/2024",
    barang_id: "AST-04",
    nama_barang: "Sepeda Motor Operasional Desa (Yamaha NMAX)",
    pengguna: "Supriadi, S.IP. (Sekretaris Desa Rarang Selatan)",
    tanggal: "2024-01-10",
    status: "Berjalan"
  },
  {
    id: "PGN-02",
    sk: "SK.141/15-DS.RS/2024",
    barang_id: "AST-03",
    nama_barang: "Laptop Asus ExpertBook Core i5",
    pengguna: "Baiq Elok (Staff Kaur Umum)",
    tanggal: "2024-03-12",
    status: "Berjalan"
  }
];

export const initialPemanfaatan: Pemanfaatan[] = [
  {
    id: "PMF-01",
    barang_id: "AST-05",
    nama_barang: "Kursi Lipat Aula (Shitako)",
    jenis: "Sewa",
    mitra: "Kelompok Pemuda Karang Taruna (Acara Sumpah Pemuda)",
    periode_mulai: "2025-10-27",
    periode_selesai: "2025-10-29",
    nilai_kontrak: 350000,
    status: "Selesai"
  },
  {
    id: "PMF-02",
    barang_id: "AST-02",
    nama_barang: "Tanah Sawah Bengkok Kades",
    jenis: "Sewa",
    mitra: "Poktan Tani Makmur Rarang",
    periode_mulai: "2026-05-01",
    periode_selesai: "2027-05-01",
    nilai_kontrak: 12000000,
    status: "Aktif"
  }
];

export const initialKapitalisasi: Kapitalisasi[] = [
  {
    id: "KAP-01",
    barang_id: "AST-06",
    nama_barang: "Gedung Kantor Desa Rarang Selatan",
    tanggal: "2025-08-20",
    keterangan: "Pemasangan Kanopi Baja Ringan & Cat Ulang Bagian Luar",
    nilai_lama: 550000000,
    nilai_tambah: 45000000,
    nilai_baru: 595000000,
    status: "Terposting"
  }
];

export const initialPenghapusan: Penghapusan[] = [
  {
    id: "PHP-01",
    barang_id: "AST-05", // partial replacement / obsolete
    nama_barang: "Komputer Deskpro Intel Core 2 Duo (Aset Bersejarah Desa)",
    tanggal: "2026-03-10",
    alasan: "Rusak Berat",
    berita_acara: "BA.045.2/08/RS/III/2026",
    nilai_buku: 5500000
  }
];

export const initialPersediaan: Persediaan[] = [
  { id: "PSD-01", tanggal: "2026-05-01", nama_barang: "Bibit Jagung Hibrida Premium", tipe: "Masuk", jumlah: 150, stok_sisa: 150, keterangan: "Bantuan Dinas Pertanian Lombok Timur" },
  { id: "PSD-02", tanggal: "2026-05-05", nama_barang: "Bibit Jagung Hibrida Premium", tipe: "Keluar", jumlah: 40, penerima: "Kelompok Tani Harapan Jaya", stok_sisa: 110, keterangan: "Pembagian bibit gratis Program Ketahanan Pangan" },
  { id: "PSD-03", tanggal: "2026-06-01", nama_barang: "Kertas HVS A4 Sinar Dunia 80gr", tipe: "Masuk", jumlah: 50, stok_sisa: 50, keterangan: "Pengadaan rutin ATK Kantor" },
  { id: "PSD-04", tanggal: "2026-06-03", nama_barang: "Kertas HVS A4 Sinar Dunia 80gr", tipe: "Keluar", jumlah: 10, penerima: "Sekretariat Pelayanan Desa", stok_sisa: 40, keterangan: "Penggunaan operasional tata usaha" }
];

export const initialAudit: Audit[] = [
  {
    id: "AUD-01",
    tanggal: "2026-05-20",
    barang_id: "AST-03",
    nama_barang: "Laptop Asus ExpertBook Core i5",
    kondisi: "Baik",
    auditor: "Drs. Hermawan (Auditor Lombok Timur)",
    catatan: "Sistem dan fisik dalam kondisi prima, terlabeli QR Code dengan lengkap.",
  }
];

export const defaultWhatsAppConfig: WhatsAppConfig = {
  apiKey: "FonnteKey_RarangSelatan_3a98db25c",
  senderNo: "081234567890",
  recipientNo: "087865432109",
  templatePengadaan: "⚠️ NOTIFIKASI SIPADES: Pengadaan baru senilai *{{total}}* oleh Operator untuk barang *{{barang}}* sedang menunggu approval Kades.",
  templateAsetBaru: "✅ NOTIFIKASI SIPADES: Aset baru *{{nama}}* (Kode: {{kode}}) telah sukses terdaftar di KIB Desa Rarang Selatan dengan label QR Active."
};

// Spreadsheet Database Code Template (for users to see in the "Database Center" tab)
export const gsCodeTemplate = `/**
 * ==========================================
 * GOOGLE APPS SCRIPT - SIPADES SMART ENGINE
 * ==========================================
 * Tempatkan kode ini pada Editor Apps Script 
 * yang terhubung dengan Google Spreadsheet Anda.
 */

const SPREADSHEET_ID = "MASUKKAN_ID_SPREADSHEET_ANDA_DISINI";

function doGet(e) {
  return HtmlService.createTemplateFromFile("index")
    .evaluate()
    .setTitle("SIPADES SMART - Desa Rarang Selatan")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Mengambil semua data tabel SIPADES dari Sheet
function getSipadesData(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const list = [];
  
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const obj = {};
    headers.forEach((header, index) => {
      obj[header.toString().toLowerCase().replace(/\\s+/g, "_")] = row[index];
    });
    list.push(obj);
  }
  return list;
}

// Menambah data secara otomatis
function insertSipadesRecord(sheetName, recordData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const newRow = headers.map(header => {
    const key = header.toString().toLowerCase().replace(/\\s+/g, "_");
    return recordData[key] !== undefined ? recordData[key] : "";
  });
  
  sheet.appendRow(newRow);
  return { success: true, message: "Aset sukses tercatat di Google Spreadsheet!" };
}
`;
