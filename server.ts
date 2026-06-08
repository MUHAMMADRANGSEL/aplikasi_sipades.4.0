import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database store file (JSON format)
const DB_FILE = path.join(process.cwd(), "database.json");

// Import default seed lists directly from Typescript representation to avoid empty starts
import {
  initialProfilDesa,
  initialUsers,
  initialPerangkatDesa,
  initialRuangan,
  initialAssets,
} from "./src/types.ts";

let dbState: any = {
  profile: initialProfilDesa,
  users: initialUsers,
  perangkat: initialPerangkatDesa,
  ruangan: initialRuangan,
  assets: initialAssets,
  pengadaan: [
    {
      id: "PRC-01",
      tanggal: "2026-03-10",
      kegiatan: "Pembangunan Rabat Beton Jalan Lingkungan Dusun II",
      sumber_dana: "DDS",
      kode_rekening: "2.01.01",
      barang: "Semen Portland, Pasir, Batu Pecah",
      volume: 1,
      harga: 42500000,
      total: 42500000,
      lokasi: "Dusun II Rarang",
      status: "Terposting"
    },
    {
      id: "PRC-02",
      tanggal: "2026-05-18",
      kegiatan: "Pengadaan Laptop Sekretariat BPD Rarang Selatan",
      sumber_dana: "ADD",
      kode_rekening: "1.02.04",
      barang: "2 Unit Laptop ASUS Core i5",
      volume: 2,
      harga: 8500000,
      total: 17000000,
      lokasi: "Kantor BPD Desa Rarang",
      status: "Draf"
    }
  ],
  penggunaan: [],
  pemanfaatan: [],
  kapitalisasi: [],
  penghapusan: [],
  persediaan: [
    {
      id: "INV-01",
      tanggal: "2026-06-01",
      nama_barang: "Kertas HVS A4 80gr - Sekretariat",
      tipe: "Masuk",
      jumlah: 100,
      stok_sisa: 100,
      keterangan: "Pengadaan triwulan II kaur umum"
    },
    {
      id: "INV-02",
      tanggal: "2026-06-05",
      nama_barang: "Kertas HVS A4 80gr - Sekretariat",
      tipe: "Keluar",
      jumlah: 15,
      penerima: "Kasi Pemerintahan",
      stok_sisa: 85,
      keterangan: "Cetak blanko administrasi kependudukan"
    }
  ],
  audit: [
    {
      id: "ADT-01",
      tanggal: "2026-06-02",
      barang_id: "AST-03",
      nama_barang: "Gedung Kantor Desa (Gedung Utama)",
      kondisi: "Baik",
      auditor: "Drs. Hermawan",
      catatan: "Visualisasi detail struktur aman, cat eksterior sedikit pudar."
    }
  ]
};

// Initialize or load DB_FILE
if (fs.existsSync(DB_FILE)) {
  try {
    const rawData = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(rawData);
    dbState = { ...dbState, ...parsed };
  } catch (err) {
    console.error("Gagal membaca database.json, menggunakan data cache awal.", err);
  }
} else {
  saveDbState();
}

function saveDbState() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan database.json ke disk:", err);
  }
}

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

// Helper generic upsert
function upsertItem(arrayName: string, item: any) {
  if (!dbState[arrayName]) {
    dbState[arrayName] = [];
  }
  const idx = dbState[arrayName].findIndex((x: any) => x.id === item.id);
  if (idx > -1) {
    dbState[arrayName][idx] = { ...dbState[arrayName][idx], ...item };
  } else {
    dbState[arrayName].push(item);
  }
  saveDbState();
}

// ------------------------------------------------------------------------------
// DATABASE REST API ENDPOINTS
// ------------------------------------------------------------------------------

// 1. Profil Desa Endpoints
app.get("/api/profile", (req, res) => {
  return res.json(dbState.profile);
});

app.post("/api/profile", (req, res) => {
  dbState.profile = { ...dbState.profile, ...req.body };
  saveDbState();
  return res.json({ success: true });
});

// 2. Users Endpoints
app.get("/api/users", (req, res) => {
  return res.json(dbState.users || []);
});

app.post("/api/users", (req, res) => {
  upsertItem("users", req.body);
  return res.json({ success: true });
});

// 3. Perangkat Desa Endpoints
app.get("/api/perangkat", (req, res) => {
  return res.json(dbState.perangkat || []);
});

app.post("/api/perangkat", (req, res) => {
  upsertItem("perangkat", req.body);
  return res.json({ success: true });
});

// 4. Ruangan Endpoints
app.get("/api/ruangan", (req, res) => {
  return res.json(dbState.ruangan || []);
});

app.post("/api/ruangan", (req, res) => {
  upsertItem("ruangan", req.body);
  return res.json({ success: true });
});

// 5. Assets Endpoints (KIB A - F)
app.get("/api/assets", (req, res) => {
  return res.json(dbState.assets || []);
});

app.post("/api/assets", (req, res) => {
  upsertItem("assets", req.body);
  return res.json({ success: true });
});

app.delete("/api/assets/:id", (req, res) => {
  const { id } = req.params;
  if (dbState.assets) {
    dbState.assets = dbState.assets.filter((a: any) => a.id !== id);
    saveDbState();
  }
  return res.json({ success: true });
});

// 6. Pengadaan Endpoints (Log Rencana Belanja APBDes)
app.get("/api/pengadaan", (req, res) => {
  return res.json(dbState.pengadaan || []);
});

app.post("/api/pengadaan", (req, res) => {
  upsertItem("pengadaan", req.body);
  return res.json({ success: true });
});

// 7. Penggunaan Endpoints
app.get("/api/penggunaan", (req, res) => {
  return res.json(dbState.penggunaan || []);
});

app.post("/api/penggunaan", (req, res) => {
  upsertItem("penggunaan", req.body);
  return res.json({ success: true });
});

// 8. Pemanfaatan Endpoints (Bagi Hasil, Sewa, dll)
app.get("/api/pemanfaatan", (req, res) => {
  return res.json(dbState.pemanfaatan || []);
});

app.post("/api/pemanfaatan", (req, res) => {
  upsertItem("pemanfaatan", req.body);
  return res.json({ success: true });
});

// 9. Kapitalisasi Endpoints
app.get("/api/kapitalisasi", (req, res) => {
  return res.json(dbState.kapitalisasi || []);
});

app.post("/api/kapitalisasi", (req, res) => {
  upsertItem("kapitalisasi", req.body);
  return res.json({ success: true });
});

// 10. Penghapusan Endpoints
app.get("/api/penghapusan", (req, res) => {
  return res.json(dbState.penghapusan || []);
});

app.post("/api/penghapusan", (req, res) => {
  upsertItem("penghapusan", req.body);
  return res.json({ success: true });
});

// 11. Persediaan Endpoints
app.get("/api/persediaan", (req, res) => {
  return res.json(dbState.persediaan || []);
});

app.post("/api/persediaan", (req, res) => {
  upsertItem("persediaan", req.body);
  return res.json({ success: true });
});

// 12. Audit Endpoints
app.get("/api/audit", (req, res) => {
  return res.json(dbState.audit || []);
});

app.post("/api/audit", (req, res) => {
  upsertItem("audit", req.body);
  return res.json({ success: true });
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
