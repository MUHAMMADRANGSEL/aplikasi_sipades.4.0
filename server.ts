import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Import DB modules explicitly with file extensions
import { db } from "./src/db/index.ts";
import { seedDatabase } from "./src/db/seed.ts";
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
} from "./src/db/schema.ts";
import { eq } from "drizzle-orm";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Ensure database has initial seed data
async function initDb() {
  try {
    await seedDatabase();
  } catch (error) {
    console.error("Failed to seed database during startup:", error);
  }
}
initDb();

// ------------------------------------------------------------------------------
// DATABASE REST API ENDPOINTS (SQL AS DATA SOURCE)
// ------------------------------------------------------------------------------

// 1. Profil Desa Endpoints
app.get("/api/profile", async (req, res) => {
  try {
    const list = await db.select().from(profilDesa);
    if (list.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }
    return res.json(list[0]);
  } catch (error: any) {
    console.error("SQL Error in /api/profile:", error);
    return res.status(500).json({ error: "Failed to fetch profil desa" });
  }
});

app.post("/api/profile", async (req, res) => {
  try {
    const data = req.body;
    await db.insert(profilDesa).values({
      kodeDesa: data.kodeDesa,
      namaDesa: data.namaDesa,
      kecamatan: data.kecamatan,
      kabupaten: data.kabupaten,
      provinsi: data.provinsi,
      logo: data.logo,
    }).onConflictDoUpdate({
      target: profilDesa.kodeDesa,
      set: {
        namaDesa: data.namaDesa,
        kecamatan: data.kecamatan,
        kabupaten: data.kabupaten,
        provinsi: data.provinsi,
        logo: data.logo,
      }
    });
    return res.json({ success: true });
  } catch (error: any) {
    console.error("SQL Error on POST /api/profile:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

// 2. Users Endpoints
app.get("/api/users", async (req, res) => {
  try {
    const list = await db.select().from(users);
    return res.json(list);
  } catch (error: any) {
    console.error("SQL Error in /api/users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const data = req.body;
    await db.insert(users).values({
      id: data.id,
      nama: data.nama,
      username: data.username,
      role: data.role,
      status: data.status,
    }).onConflictDoUpdate({
      target: users.id,
      set: {
        nama: data.nama,
        username: data.username,
        role: data.role,
        status: data.status,
      }
    });
    return res.json({ success: true });
  } catch (error: any) {
    console.error("SQL Error on POST /api/users:", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
});

// 3. Perangkat Desa Endpoints
app.get("/api/perangkat", async (req, res) => {
  try {
    const list = await db.select().from(perangkatDesa);
    return res.json(list);
  } catch (error: any) {
    console.error("SQL Error in /api/perangkat:", error);
    return res.status(500).json({ error: "Failed to fetch perangkat desa" });
  }
});

app.post("/api/perangkat", async (req, res) => {
  try {
    const data = req.body;
    await db.insert(perangkatDesa).values({
      id: data.id,
      nama: data.nama,
      jabatan: data.jabatan,
      nip: data.nip,
      status: data.status,
    }).onConflictDoUpdate({
      target: perangkatDesa.id,
      set: {
        nama: data.nama,
        jabatan: data.jabatan,
        nip: data.nip,
        status: data.status,
      }
    });
    return res.json({ success: true });
  } catch (error: any) {
    console.error("SQL Error on POST /api/perangkat:", error);
    return res.status(500).json({ error: "Failed to save perangkat desa" });
  }
});

// 4. Ruangan Endpoints
app.get("/api/ruangan", async (req, res) => {
  try {
    const list = await db.select().from(ruangan);
    return res.json(list);
  } catch (error: any) {
    console.error("SQL Error in /api/ruangan:", error);
    return res.status(500).json({ error: "Failed to fetch ruangan" });
  }
});

app.post("/api/ruangan", async (req, res) => {
  try {
    const data = req.body;
    await db.insert(ruangan).values({
      id: data.id,
      namaRuangan: data.namaRuangan,
      lokasi: data.lokasi,
      penanggungJawab: data.penanggungJawab,
    }).onConflictDoUpdate({
      target: ruangan.id,
      set: {
        namaRuangan: data.namaRuangan,
        lokasi: data.lokasi,
        penanggungJawab: data.penanggungJawab,
      }
    });
    return res.json({ success: true });
  } catch (error: any) {
    console.error("SQL Error on POST /api/ruangan:", error);
    return res.status(500).json({ error: "Failed to save ruangan" });
  }
});

// 5. Assets Endpoints (KIB A - F)
app.get("/api/assets", async (req, res) => {
  try {
    const list = await db.select().from(assets);
    return res.json(list);
  } catch (error: any) {
    console.error("SQL Error or lookup failed for /api/assets:", error);
    return res.status(500).json({ error: "Database lookup failed. Please try again later." });
  }
});

app.post("/api/assets", async (req, res) => {
  try {
    const data = req.body;
    await db.insert(assets).values({
      id: data.id,
      kategori: data.kategori,
      kode_barang: data.kode_barang,
      nama_barang: data.nama_barang,
      luas: data.luas || null,
      sertifikat: data.sertifikat || null,
      merk: data.merk || null,
      tahun: data.tahun,
      nilai: Number(data.nilai || 0),
      lokasi: data.lokasi,
      kondisi: data.kondisi || "Baik",
      panjang: data.panjang || null,
      progress: data.progress || null,
      keterangan: data.keterangan || null,
      foto: data.foto || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
    }).onConflictDoUpdate({
      target: assets.id,
      set: {
        kategori: data.kategori,
        kode_barang: data.kode_barang,
        nama_barang: data.nama_barang,
        luas: data.luas || null,
        sertifikat: data.sertifikat || null,
        merk: data.merk || null,
        tahun: data.tahun,
        nilai: Number(data.nilai || 0),
        lokasi: data.lokasi,
        kondisi: data.kondisi || "Baik",
        panjang: data.panjang || null,
        progress: data.progress || null,
        keterangan: data.keterangan || null,
        foto: data.foto || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
      }
    });
    return res.json({ success: true });
  } catch (error: any) {
    console.error("SQL Error on POST /api/assets:", error);
    return res.status(500).json({ error: "Failed to save asset" });
  }
});

app.delete("/api/assets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(assets).where(eq(assets.id, id));
    return res.json({ success: true });
  } catch (error: any) {
    console.error("SQL Error on DELETE /api/assets:", error);
    return res.status(500).json({ error: "Failed to delete asset" });
  }
});

// 6. Pengadaan Endpoints (Log Rencana Belanja APBDes)
app.get("/api/pengadaan", async (req, res) => {
  try {
    const list = await db.select().from(pengadaan);
    return res.json(list);
  } catch (error: any) {
    console.error("SQL Error in /api/pengadaan:", error);
    return res.status(500).json({ error: "Failed to fetch procurement registers" });
  }
});

app.post("/api/pengadaan", async (req, res) => {
  try {
    const data = req.body;
    await db.insert(pengadaan).values({
      id: data.id,
      tanggal: data.tanggal,
      kegiatan: data.kegiatan,
      sumber_dana: data.sumber_dana,
      kode_rekening: data.kode_rekening,
      barang: data.barang,
      volume: Number(data.volume || 1),
      harga: Number(data.harga || 0),
      total: Number(data.total || 0),
      lokasi: data.lokasi,
      foto: data.foto || null,
      status: data.status,
    }).onConflictDoUpdate({
      target: pengadaan.id,
      set: {
        tanggal: data.tanggal,
        kegiatan: data.kegiatan,
        sumber_dana: data.sumber_dana,
        kode_rekening: data.kode_rekening,
        barang: data.barang,
        volume: Number(data.volume || 1),
        harga: Number(data.harga || 0),
        total: Number(data.total || 0),
        lokasi: data.lokasi,
        foto: data.foto || null,
        status: data.status,
      }
    });
    return res.json({ success: true });
  } catch (error: any) {
    console.error("SQL Error on POST /api/pengadaan:", error);
    return res.status(500).json({ error: "Failed to save procurement record" });
  }
});

// 7. Penggunaan Endpoints
app.get("/api/penggunaan", async (req, res) => {
  try {
    const list = await db.select().from(penggunaan);
    return res.json(list);
  } catch (error: any) {
    console.error("SQL Error in /api/penggunaan:", error);
    return res.status(500).json({ error: "Failed to fetch usage registers" });
  }
});

app.post("/api/penggunaan", async (req, res) => {
  try {
    const data = req.body;
    await db.insert(penggunaan).values({
      id: data.id,
      sk: data.sk,
      barang_id: data.barang_id,
      nama_barang: data.nama_barang,
      pengguna: data.pengguna,
      tanggal: data.tanggal,
      status: data.status,
    }).onConflictDoUpdate({
      target: penggunaan.id,
      set: {
        sk: data.sk,
        barang_id: data.barang_id,
        nama_barang: data.nama_barang,
        pengguna: data.pengguna,
        tanggal: data.tanggal,
        status: data.status,
      }
    });
    return res.json({ success: true });
  } catch (error: any) {
    console.error("SQL Error on POST /api/penggunaan:", error);
    return res.status(500).json({ error: "Failed to save usage distribution" });
  }
});

// 8. Pemanfaatan Endpoints (Bagi Hasil, Sewa, dll)
app.get("/api/pemanfaatan", async (req, res) => {
  try {
    const list = await db.select().from(pemanfaatan);
    return res.json(list);
  } catch (error: any) {
    console.error("SQL Error in /api/pemanfaatan:", error);
    return res.status(500).json({ error: "Failed to fetch yield/lease logs" });
  }
});

app.post("/api/pemanfaatan", async (req, res) => {
  try {
    const data = req.body;
    await db.insert(pemanfaatan).values({
      id: data.id,
      barang_id: data.barang_id,
      nama_barang: data.nama_barang,
      jenis: data.jenis,
      mitra: data.mitra,
      periode_mulai: data.periode_mulai,
      periode_selesai: data.periode_selesai,
      nilai_kontrak: Number(data.nilai_kontrak || 0),
      status: data.status,
    }).onConflictDoUpdate({
      target: pemanfaatan.id,
      set: {
        barang_id: data.barang_id,
        nama_barang: data.nama_barang,
        jenis: data.jenis,
        mitra: data.mitra,
        periode_mulai: data.periode_mulai,
        periode_selesai: data.periode_selesai,
        nilai_kontrak: Number(data.nilai_kontrak || 0),
        status: data.status,
      }
    });
    return res.json({ success: true });
  } catch (error: any) {
    console.error("SQL Error on POST /api/pemanfaatan:", error);
    return res.status(500).json({ error: "Failed to save lease lease information" });
  }
});

// 9. Kapitalisasi Endpoints
app.get("/api/kapitalisasi", async (req, res) => {
  try {
    const list = await db.select().from(kapitalisasi);
    return res.json(list);
  } catch (error: any) {
    console.error("SQL Error in /api/kapitalisasi:", error);
    return res.status(500).json({ error: "Failed to fetch capitalization log" });
  }
});

app.post("/api/kapitalisasi", async (req, res) => {
  try {
    const data = req.body;
    await db.insert(kapitalisasi).values({
      id: data.id,
      barang_id: data.barang_id,
      nama_barang: data.nama_barang,
      tanggal: data.tanggal,
      keterangan: data.keterangan,
      nilai_lama: Number(data.nilai_lama || 0),
      nilai_tambah: Number(data.nilai_tambah || 0),
      nilai_baru: Number(data.nilai_baru || 0),
      status: data.status,
    }).onConflictDoUpdate({
      target: kapitalisasi.id,
      set: {
        barang_id: data.barang_id,
        nama_barang: data.nama_barang,
        tanggal: data.tanggal,
        keterangan: data.keterangan,
        nilai_lama: Number(data.nilai_lama || 0),
        nilai_tambah: Number(data.nilai_tambah || 0),
        nilai_baru: Number(data.nilai_baru || 0),
        status: data.status,
      }
    });
    return res.json({ success: true });
  } catch (error: any) {
    console.error("SQL Error on POST /api/kapitalisasi:", error);
    return res.status(500).json({ error: "Failed to save dynamic asset capitalization" });
  }
});

// 10. Penghapusan Endpoints
app.get("/api/penghapusan", async (req, res) => {
  try {
    const list = await db.select().from(penghapusan);
    return res.json(list);
  } catch (error: any) {
    console.error("SQL Error in /api/penghapusan:", error);
    return res.status(500).json({ error: "Failed to fetch disposal logs" });
  }
});

app.post("/api/penghapusan", async (req, res) => {
  try {
    const data = req.body;
    await db.insert(penghapusan).values({
      id: data.id,
      barang_id: data.barang_id,
      nama_barang: data.nama_barang,
      tanggal: data.tanggal,
      alasan: data.alasan,
      berita_acara: data.berita_acara,
      nilai_buku: Number(data.nilai_buku || 0),
    }).onConflictDoUpdate({
      target: penghapusan.id,
      set: {
        barang_id: data.barang_id,
        nama_barang: data.nama_barang,
        tanggal: data.tanggal,
        alasan: data.alasan,
        berita_acara: data.berita_acara,
        nilai_buku: Number(data.nilai_buku || 0),
      }
    });
    return res.json({ success: true });
  } catch (error: any) {
    console.error("SQL Error on POST /api/penghapusan:", error);
    return res.status(500).json({ error: "Failed to log disposal" });
  }
});

// 11. Persediaan Endpoints
app.get("/api/persediaan", async (req, res) => {
  try {
    const list = await db.select().from(persediaan);
    return res.json(list);
  } catch (error: any) {
    console.error("SQL Error in /api/persediaan:", error);
    return res.status(500).json({ error: "Failed to fetch supplies" });
  }
});

app.post("/api/persediaan", async (req, res) => {
  try {
    const data = req.body;
    await db.insert(persediaan).values({
      id: data.id,
      tanggal: data.tanggal,
      nama_barang: data.nama_barang,
      tipe: data.tipe,
      jumlah: Number(data.jumlah || 0),
      penerima: data.penerima || null,
      stok_sisa: Number(data.stok_sisa || 0),
      keterangan: data.keterangan || null,
    }).onConflictDoUpdate({
      target: persediaan.id,
      set: {
        tanggal: data.tanggal,
        nama_barang: data.nama_barang,
        tipe: data.tipe,
        jumlah: Number(data.jumlah || 0),
        penerima: data.penerima || null,
        stok_sisa: Number(data.stok_sisa || 0),
        keterangan: data.keterangan || null,
      }
    });
    return res.json({ success: true });
  } catch (error: any) {
    console.error("SQL Error on POST /api/persediaan:", error);
    return res.status(500).json({ error: "Failed to save supplies records" });
  }
});

// 12. Audit Endpoints
app.get("/api/audit", async (req, res) => {
  try {
    const list = await db.select().from(audit);
    return res.json(list);
  } catch (error: any) {
    console.error("SQL Error in /api/audit:", error);
    return res.status(500).json({ error: "Failed to fetch physical audit registers" });
  }
});

app.post("/api/audit", async (req, res) => {
  try {
    const data = req.body;
    await db.insert(audit).values({
      id: data.id,
      tanggal: data.tanggal,
      barang_id: data.barang_id,
      nama_barang: data.nama_barang,
      kondisi: data.kondisi,
      auditor: data.auditor,
      catatan: data.catatan,
      foto: data.foto || null,
    }).onConflictDoUpdate({
      target: audit.id,
      set: {
        tanggal: data.tanggal,
        barang_id: data.barang_id,
        nama_barang: data.nama_barang,
        kondisi: data.kondisi,
        auditor: data.auditor,
        catatan: data.catatan,
        foto: data.foto || null,
      }
    });
    return res.json({ success: true });
  } catch (error: any) {
    console.error("SQL Error on POST /api/audit:", error);
    return res.status(500).json({ error: "Failed to log physical audit inspection" });
  }
});

// ------------------------------------------------------------------------------
// ORIGINAL WEB PROXIES / RELEVANT ROUTES
// ------------------------------------------------------------------------------

// Secure WhatsApp Fonnte API Proxy Route
app.post("/api/send-whatsapp", async (req, res) => {
  try {
    const { message, target, apiKey } = req.body;
    if (!message || !target) {
      return res.status(400).json({ error: "Missing message or target parameter." });
    }

    const token = apiKey || process.env.FONNTE_TOKEN || "FonnteKey_RarangSelatan_3a98db25c";
    console.log(`[WA Server API] Sending notification to ${target}`);

    // Real API call to Fonnte WA gateway
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        "Authorization": token,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        target: target,
        message: message,
        countryCode: "62"
      })
    });

    const textResponse = await response.text();
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch {
      data = { raw: textResponse };
    }

    return res.json({
      success: response.ok,
      status: response.status,
      response: data
    });
  } catch (err: any) {
    console.error("Fonnte API Gateway Relay Error:", err);
    return res.status(500).json({ error: err.message || "Failed to relay to Fonnte" });
  }
});

// REST API for AI SMART ASSET Analysis
app.post("/api/gemini/analyse", async (req, res) => {
  try {
    const { asset } = req.body;
    if (!asset) {
      return res.status(400).json({ error: "Missing asset information in request body." });
    }

    if (!ai) {
      return res.json({
        usingMock: true,
        analysis: {
          predictedLifespanYears: 10,
          depreciationPercentage: 45,
          currentValueEstim: Math.round(asset.nilai * 0.55),
          recommendation: asset.kondisi === "Rusak Berat" ? "Segera ajukan penghapusan aset" : "Lanjutkan pemantauan rutin",
          replacementYear: new Date().getFullYear() + 5,
          justification: `[Kunci API Belum Dikonfigurasi] Estimasi standar untuk ${asset.nama_barang} (${asset.merk || "Tanpa Merk"}) dalam kondisi ${asset.kondisi}.`,
          actionSteps: [
            "Lakukan pemeriksaan berkala setiap 6 bulan.",
            "Dokumentasikan setiap perbaikan di riwayat pemeliharaan.",
            "Pastikan pelabelan QR Code terpasang dengan baik."
          ]
        }
      });
    }

    const currentYear = new Date().getFullYear();
    const age = currentYear - Number(asset.tahun || asset.tahun_pengadaan || currentYear);

    const prompt = `Lakukan analisis teknis-ekonomis terhadap aset desa berikut:
- Nama Barang: ${asset.nama_barang}
- Kategori/Jenis: ${asset.kategori || "Peralatan"}
- Merk/Spesifikasi: ${asset.merk || "Standard"}
- Tahun Perolehan: ${asset.tahun || asset.tahun_pengadaan || currentYear} (Umur: ${age} tahun)
- Nilai Perolehan: Rp. ${Number(asset.nilai || asset.harga || 0).toLocaleString("id-ID")}
- Kondisi Fisik saat ini: ${asset.kondisi || "Baik"}
- Lokasi penempatan: ${asset.lokasi || "Kantor Desa"}

Berikan output berupa rekomendasi optimasi umur, prediksi sisa umur ekonomis, penyusutan nilai, rekomendasi tindakan selanjutnya, dan justifikasi logis dalam bahasa Indonesia yang sesuai dengan standar pengelolaan aset negara/daerah (Permendagri No. 1 Ruun 2016 tentang Pengelolaan Aset Desa/sipades).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedLifespanYears: {
              type: Type.NUMBER,
              description: "Sisa taksiran umur ekonomis (tahun) dari barang ini",
            },
            depreciationPercentage: {
              type: Type.NUMBER,
              description: "Persentase akumulasi penyusutan nilai hingga tahun ini (0-100)",
            },
            currentValueEstim: {
              type: Type.NUMBER,
              description: "Estimasi nilai buku saat ini (Rp) setelah memperhitungkan penyusutan dan kondisi",
            },
            recommendation: {
              type: Type.STRING,
              description: "Rekomendasi spesifik (misal: 'Ajukan kapitalisasi penambahan fungsi', 'Pertahankan pemeliharaan berkala', 'Segera usulkan penghapusan')",
            },
            replacementYear: {
              type: Type.NUMBER,
              description: "Tahun di mana aset ini direkomendasikan untuk diganti total / dihapus",
            },
            justification: {
              type: Type.STRING,
              description: "Analisis singkat mengapa rekomendasi ini diberikan berdasarkan kondisi, umur, dan nilai barang.",
            },
            actionSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Langkah-langkah taktis pemeliharaan atau administrasi yang harus dilakukan operator desa berikutnya",
            },
          },
          required: [
            "predictedLifespanYears",
            "depreciationPercentage",
            "currentValueEstim",
            "recommendation",
            "replacementYear",
            "justification",
            "actionSteps",
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response returned from Gemini API");
    }

    const analysis = JSON.parse(text.trim());
    return res.json({ usingMock: false, analysis });

  } catch (err: any) {
    console.error("Gemini analysis error:", err);
    return res.json({
      usingMock: true,
      error: err.message,
      analysis: {
        predictedLifespanYears: 8,
        depreciationPercentage: 50,
        currentValueEstim: Math.round(Number(req.body.asset?.nilai || 0) * 0.5),
        recommendation: "Lakukan pemeliharaan rutin preventif",
        replacementYear: new Date().getFullYear() + 4,
        justification: "Gagal memproses analisis AI. Menggunakan estimasi default standar.",
        actionSteps: [
          "Lakukan pengecekan fisik fisik secara berkala.",
          "Laporkan perubahan kondisi fisik ke Kepala Urusan Umum Desa.",
          "Rekam pengeluaran pemeliharaan di sub-perhitungan kapitalisasi."
        ]
      }
    });
  }
});

// Serve assets and static pages via Vite in Development or raw express in Production
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server SIPADES SMART running on port ${PORT}`);
  });
}

setupVite();
