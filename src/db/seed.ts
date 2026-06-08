import { db } from "./index.ts";
import { 
  users, 
  profilDesa, 
  perangkatDesa, 
  ruangan, 
  assets, 
  pengadaan, 
  penggunaan, 
  pemanfaatan, 
  kapitalisasi, 
  penghapusan, 
  persediaan, 
  audit
} from "./schema.ts";
import { 
  initialProfilDesa, 
  initialUsers, 
  initialPerangkatDesa, 
  initialRuangan, 
  initialAssets, 
  initialPengadaan, 
  initialPenggunaan, 
  initialPemanfaatan, 
  initialKapitalisasi, 
  initialPenghapusan, 
  initialPersediaan, 
  initialAudit 
} from "../types.ts";

export async function seedDatabase() {
  try {
    // 1. Check if profiling or assets are empty
    const existingAssets = await db.select().from(assets).limit(1);
    if (existingAssets.length > 0) {
      console.log("Database already has data. Skipping seed.");
      return;
    }

    console.log("Seeding database...");

    // Seeding Profil Desa
    await db.insert(profilDesa).values({
      kodeDesa: initialProfilDesa.kodeDesa,
      namaDesa: initialProfilDesa.namaDesa,
      kecamatan: initialProfilDesa.kecamatan,
      kabupaten: initialProfilDesa.kabupaten,
      provinsi: initialProfilDesa.provinsi,
      logo: initialProfilDesa.logo || null,
    }).onConflictDoNothing();

    // Seeding Users
    for (const u of initialUsers) {
      await db.insert(users).values({
        id: u.id,
        nama: u.nama,
        username: u.username,
        role: u.role,
        status: u.status,
      }).onConflictDoNothing();
    }

    // Seeding Perangkat Desa
    for (const p of initialPerangkatDesa) {
      await db.insert(perangkatDesa).values({
        id: p.id,
        nama: p.nama,
        jabatan: p.jabatan,
        nip: p.nip,
        status: p.status,
      }).onConflictDoNothing();
    }

    // Seeding Ruangan
    for (const r of initialRuangan) {
      await db.insert(ruangan).values({
        id: r.id,
        namaRuangan: r.namaRuangan,
        lokasi: r.lokasi,
        penanggungJawab: r.penanggungJawab,
      }).onConflictDoNothing();
    }

    // Seeding Assets
    for (const a of initialAssets) {
      await db.insert(assets).values({
        id: a.id,
        kategori: a.kategori,
        kode_barang: a.kode_barang,
        nama_barang: a.nama_barang,
        luas: a.luas || null,
        sertifikat: a.sertifikat || null,
        merk: a.merk || null,
        tahun: a.tahun,
        nilai: Number(a.nilai || 0),
        lokasi: a.lokasi,
        kondisi: a.kondisi,
        panjang: a.panjang || null,
        progress: a.progress || null,
        keterangan: a.keterangan || null,
        foto: a.foto || null,
        latitude: a.latitude || null,
        longitude: a.longitude || null,
      }).onConflictDoNothing();
    }

    // Seeding Pengadaan
    for (const p of initialPengadaan) {
      await db.insert(pengadaan).values({
        id: p.id,
        tanggal: p.tanggal,
        kegiatan: p.kegiatan,
        sumber_dana: p.sumber_dana,
        kode_rekening: p.kode_rekening,
        barang: p.barang,
        volume: Number(p.volume || 1),
        harga: Number(p.harga || 0),
        total: Number(p.total || 0),
        lokasi: p.lokasi,
        foto: p.foto || null,
        status: p.status,
      }).onConflictDoNothing();
    }

    // Seeding Penggunaan
    for (const p of initialPenggunaan) {
      await db.insert(penggunaan).values({
        id: p.id,
        sk: p.sk,
        barang_id: p.barang_id,
        nama_barang: p.nama_barang,
        pengguna: p.pengguna,
        tanggal: p.tanggal,
        status: p.status,
      }).onConflictDoNothing();
    }

    // Seeding Pemanfaatan
    for (const p of initialPemanfaatan) {
      await db.insert(pemanfaatan).values({
        id: p.id,
        barang_id: p.barang_id,
        nama_barang: p.nama_barang,
        jenis: p.jenis,
        mitra: p.mitra,
        periode_mulai: p.periode_mulai,
        periode_selesai: p.periode_selesai,
        nilai_kontrak: Number(p.nilai_kontrak || 0),
        status: p.status,
      }).onConflictDoNothing();
    }

    // Seeding Kapitalisasi
    for (const k of initialKapitalisasi) {
      await db.insert(kapitalisasi).values({
        id: k.id,
        barang_id: k.barang_id,
        nama_barang: k.nama_barang,
        tanggal: k.tanggal,
        keterangan: k.keterangan,
        nilai_lama: Number(k.nilai_lama || 0),
        nilai_tambah: Number(k.nilai_tambah || 0),
        nilai_baru: Number(k.nilai_baru || 0),
        status: k.status,
      }).onConflictDoNothing();
    }

    // Seeding Penghapusan
    for (const d of initialPenghapusan) {
      await db.insert(penghapusan).values({
        id: d.id,
        barang_id: d.barang_id,
        nama_barang: d.nama_barang,
        tanggal: d.tanggal,
        alasan: d.alasan,
        berita_acara: d.berita_acara,
        nilai_buku: Number(d.nilai_buku || 0),
      }).onConflictDoNothing();
    }

    // Seeding Persediaan
    for (const p of initialPersediaan) {
      await db.insert(persediaan).values({
        id: p.id,
        tanggal: p.tanggal,
        nama_barang: p.nama_barang,
        tipe: p.tipe,
        jumlah: Number(p.jumlah || 0),
        penerima: p.penerima || null,
        stok_sisa: Number(p.stok_sisa || 0),
        keterangan: p.keterangan || null,
      }).onConflictDoNothing();
    }

    // Seeding Audit
    for (const a of initialAudit) {
      await db.insert(audit).values({
        id: a.id,
        tanggal: a.tanggal,
        barang_id: a.barang_id,
        nama_barang: a.nama_barang,
        kondisi: a.kondisi,
        auditor: a.auditor,
        catatan: a.catatan,
        foto: a.foto || null,
      }).onConflictDoNothing();
    }

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Database seeding failed:", err);
  }
}
