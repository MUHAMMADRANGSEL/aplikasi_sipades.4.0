import React, { useState } from "react";
import { 
  Database, 
  Code, 
  Copy, 
  Check, 
  ArrowRightLeft, 
  CloudLightning, 
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
  CheckCircle,
  Clock,
  Settings
} from "lucide-react";

interface DatabaseCenterProps {
  dbQueue: Array<{
    id: string;
    timestamp: string;
    sheet: string;
    type: "INSERT" | "UPDATE" | "DELETE";
    payload: any;
  }>;
  onClearQueue: () => void;
}

export default function DatabaseCenter({ dbQueue, onClearQueue }: DatabaseCenterProps) {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"sheets" | "gas">("sheets");

  const appsScriptCode = `/**
 * SIPADES SMART v4.0 - Apps Script Database Proxy
 * -------------------------------------------------------------
 * Tempel skrip ini pada 'Extensions -> Apps Script' pada Spreadsheet Master Anda.
 * Publikasikan sebagai Web App dengan akses 'Anyone'.
 */

const SPREADSHEET_ID = "MASUKKAN_SPREADSHEET_ID_DEPAN_ANDA";

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const sheetName = postData.sheet; // e.g., "PENGADAAN", "TANAH", "PERALATAN"
    const actionType = postData.type; // "INSERT", "UPDATE", "DELETE"
    const payload = postData.payload;

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // create default headers based on payload keys
      const headers = Object.keys(payload);
      sheet.appendRow(headers);
    }

    if (actionType === "INSERT") {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const rowData = headers.map(h => payload[h] !== undefined ? JSON.stringify(payload[h]) : "");
      sheet.appendRow(rowData);
      return ContentService.createTextOutput(JSON.stringify({ status: "SUCCESS", message: "Data inserted successfully" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (actionType === "UPDATE" || actionType === "DELETE") {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const idIndex = headers.indexOf("id") + 1;
      if (idIndex === 0) throw new Error("Primary key 'id' not found in headers");

      const rowsCount = sheet.getLastRow();
      if (rowsCount > 1) {
        const idColValues = sheet.getRange(2, idIndex, rowsCount - 1, 1).getValues();
        let targetRowIndex = -1;
        for (let i = 0; i < idColValues.length; i++) {
          if (String(idColValues[i][0]) === String(payload.id) || idColValues[i][0] === JSON.stringify(payload.id)) {
            targetRowIndex = i + 2; // actual spreadsheet row index
            break;
          }
        }

        if (targetRowIndex !== -1) {
          if (actionType === "UPDATE") {
            headers.forEach((h, colIdx) => {
              if (payload[h] !== undefined) {
                sheet.getRange(targetRowIndex, colIdx + 1).setValue(payload[h]);
              }
            });
            return ContentService.createTextOutput(JSON.stringify({ status: "SUCCESS", message: "Data updated" }))
              .setMimeType(ContentService.MimeType.JSON);
          } else {
            sheet.deleteRow(targetRowIndex);
            return ContentService.createTextOutput(JSON.stringify({ status: "SUCCESS", message: "Data deleted" }))
              .setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "ERROR", message: "No match key found" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "ERROR", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Tab select sub system */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab("sheets")}
          className={`px-4 py-3 text-xs font-bold uppercase transition-colors border-b-2 ${
            activeSubTab === "sheets" ? "border-teal-600 text-teal-600 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Spreadsheet Real-Time Sync Center
        </button>
        <button
          onClick={() => setActiveSubTab("gas")}
          className={`px-4 py-3 text-xs font-bold uppercase transition-all border-b-2 ${
            activeSubTab === "gas" ? "border-teal-600 text-teal-600 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Code className="h-4 w-4 inline mr-1.5" /> Apps Script Setup & Boilerplate
        </button>
      </div>

      {activeSubTab === "sheets" && (
        <div className="space-y-6">
          {/* Synchronizer Banner dashboard */}
          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-5 text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide block">Integrasi Google API</span>
              <h3 className="text-sm font-bold text-emerald-950 uppercase flex items-center gap-1.5">
                <CloudLightning className="h-4.5 w-4.5 text-emerald-600 animate-pulse" /> Google Spreadsheet Live Database
              </h3>
              <p className="text-xs text-slate-600">
                Pemerintah Desa Rarang Selatan menggunakan Google Spreadsheet sebagai database utama dengan model multi-sheet. Perubahan yang Anda lakukan langsung diantrikan ke antrean sinkronisasi cloud.
              </p>
            </div>
            <a 
              href="https://sheets.google.com" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2 px-4 text-xs"
            >
              Buka Google Spreadsheet <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Live Queue representing active requests sync log */}
            <div className="lg:col-span-8 rounded-xl border border-slate-100 bg-white p-5 shadow-sm text-left">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3 mb-4">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Antrean Transaksi Perubahan Database (Queued Sync Tasks)</span>
                {dbQueue.length > 0 && (
                  <button
                    onClick={onClearQueue}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 duration-150 rounded px-2 py-1 font-bold text-slate-600"
                  >
                    Bersihkan Daftar
                  </button>
                )}
              </div>

              {dbQueue.length > 0 ? (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {dbQueue.map(log => (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                            log.type === "INSERT" ? "bg-emerald-50 text-emerald-700" :
                            log.type === "UPDATE" ? "bg-blue-50 text-blue-700" :
                            "bg-rose-50 text-rose-700"
                          }`}>
                            {log.type}
                          </span>
                          <span className="font-bold text-slate-800">Tabel: {log.sheet}</span>
                        </div>
                        <span className="text-[10px] text-slate-405 font-mono block">Data ID: {log.payload.id || "N/A"}</span>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                          <CheckCircle className="h-3.5 w-3.5" /> Tersinkron (GAS)
                        </span>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">{log.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-12 text-slate-400 italic font-medium flex flex-col items-center justify-center">
                  <ArrowRightLeft className="h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-xs">Tidak ada antrean tertunda. Database Spreadsheet master Anda tersinkron penuh!</p>
                </div>
              )}
            </div>

            {/* List of Sheets & Schemes */}
            <div className="lg:col-span-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm text-left space-y-4">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-widest block border-b border-slate-50 pb-2">Struktur Lembar Kerja (Sheets Model)</span>
              <ul className="space-y-2 text-xs">
                {[
                  { name: "TANAH", rows: 4, desc: "Buku inventaris tanah KIB A" },
                  { name: "PERALATAN", rows: 6, desc: "Alat mesin & elektronik KIB B" },
                  { name: "GEDUNG", rows: 4, desc: "Gedung sarana prasarana KIB C" },
                  { name: "JALAN", rows: 3, desc: "Jalan, irigasi, rabat beton KIB D" },
                  { name: "ASET_LAINNYA", rows: 4, desc: "Buku perpustakaan dll KIB E" },
                  { name: "CONSTRUKSI", rows: 1, desc: "Pekerjaan konstruksi termin KIB F" },
                  { name: "PENGADAAN", rows: 4, desc: "Log pengadaan belanja APBDes" },
                  { name: "PERSEDIAAN", rows: 6, desc: "ATK, bibit jagung, bansos, pupuk" }
                ].map(sheet => (
                  <li key={sheet.name} className="p-2.2 rounded border border-slate-50 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 text-[11px] font-mono">{sheet.name}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{sheet.desc}</p>
                    </div>
                    <span className="bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold rounded text-slate-600">OK</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "gas" && (
        <div className="bg-slate-900 rounded-xl p-6 text-left space-y-4 shadow-sm border border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wide flex items-center gap-1.5">
                <Code className="h-5 w-5" /> Google Apps Script (GAS) Kode Jembatan
              </h3>
              <p className="text-xs text-slate-400 mt-1">Salin kode di bawah ini and tempelkan pada Google Apps Script editor Spreadsheet Anda.</p>
            </div>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 text-slate-950 font-black px-3.5 py-2 text-xs shadow-sm hover:bg-teal-400"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Tersalin!" : "Salin Kode GAS"}
            </button>
          </div>

          <div className="rounded-lg bg-slate-950 p-4 border border-slate-800 overflow-x-auto">
            <pre className="font-mono text-xs text-emerald-400 whitespace-pre leading-relaxed select-all">
              {appsScriptCode}
            </pre>
          </div>

          <div className="rounded bg-teal-950/40 p-4 border border-teal-900/40 text-xs text-teal-300 space-y-2">
            <h4 className="font-extrabold flex items-center gap-1.5"><Zap className="h-4 w-4 text-teal-400" /> LANGKAH SINKRONISASI AKTIF:</h4>
            <ol className="list-decimal pl-5 space-y-1 text-teal-200">
              <li>Buat Spreadsheet baru di Google Drive Anda.</li>
              <li>Pilih menu <span className="font-bold underline">Extensions {"->"} Apps Script</span>.</li>
              <li>Hapus semua isi bawaan, lalu salin and tempel skrip proxy di atas ke editor.</li>
              <li>Ganti <span className="font-bold font-mono">"MASUKKAN_SPREADSHEET_ID_DEPAN_ANDA"</span> dengan ID Spreadsheet Anda yang tertera di URL web.</li>
              <li>Klik <span className="font-bold underline">Deploy {"->"} New Deployment</span>, pilih tipe <span className="font-bold">Web App</span>, isikan akses <span className="font-bold">Anyone</span>, lalu klik Deploy.</li>
              <li>Masukkan URL Deploy yang didapatkan ke dalam setting database aplikasi untuk sinkronisasi otomatis multi-user!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
