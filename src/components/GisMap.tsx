import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Map as MapIcon, 
  Search, 
  MapPin, 
  Layers, 
  Check, 
  Plus, 
  AlertCircle,
  Maximize2,
  Minimize2,
  Navigation,
  Globe,
  Settings2,
  Tag,
  PenTool,
  Save,
  HelpCircle,
  X,
  Compass
} from "lucide-react";
import { Asset } from "../types";

interface GisMapProps {
  assets: Asset[];
  onUpdateAssetCoords?: (assetId: string, lat: number, lng: number) => void;
  onDbAction?: (sheet: string, type: "INSERT" | "UPDATE" | "DELETE", payload: any) => void;
}

export default function GisMap({ assets, onUpdateAssetCoords, onDbAction }: GisMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.FeatureGroup | null>(null);
  
  // Center of Desa Rarang Selatan
  const defaultCenter: [number, number] = [-8.627622, 116.345861];
  const defaultZoom = 15;

  // Map settings states
  const [activeBaseLayer, setActiveBaseLayer] = useState<"standard" | "satellite" | "hybrid" | "dark">("standard");
  const [filterKib, setFilterKib] = useState<string>("ALL_GIS"); // ALL_GIS, KIB A, KIB C, KIB D, KIB F
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCoords, setHoveredCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  // Interactive editing states
  const [isEditingCoords, setIsEditingCoords] = useState(false);
  const [editableAssetId, setEditableAssetId] = useState<string>("");
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [tempMarker, setTempMarker] = useState<L.Marker | null>(null);

  // Filter assets that have GIS coordinates (lat/lng)
  const gisAssets = assets.filter(
    (asset) => 
      asset.latitude !== undefined && 
      asset.longitude !== undefined && 
      (asset.kategori === "KIB A" || asset.kategori === "KIB C" || asset.kategori === "KIB D" || asset.kategori === "KIB F")
  );

  // List of all assets including those without coords to assign/update them
  const allGeographicalAvailableAssets = assets.filter(
    (asset) => asset.kategori === "KIB A" || asset.kategori === "KIB C" || asset.kategori === "KIB D" || asset.kategori === "KIB F"
  );

  // Leaflet tile layers configurations
  const tileLayers = {
    standard: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }),
    satellite: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }),
    hybrid: L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
    }),
    dark: L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
    })
  };

  // Get Custom Pin Icon using L.divIcon with pure Tailwind
  const getCustomMarkerIcon = (asset: Asset, isActive: boolean) => {
    let pinColor = "bg-blue-600 border-blue-200";
    let catLetter = "A";

    if (asset.kategori === "KIB A") {
      pinColor = "bg-blue-600 border-blue-200 text-blue-100";
      catLetter = "TNH"; // Tanah
    } else if (asset.kategori === "KIB C") {
      pinColor = "bg-purple-600 border-purple-200 text-purple-100";
      catLetter = "GDG"; // Gedung
    } else if (asset.kategori === "KIB D") {
      pinColor = "bg-emerald-600 border-emerald-200 text-emerald-100";
      catLetter = "JLN"; // Jalan / Irigasi
    } else if (asset.kategori === "KIB F") {
      pinColor = "bg-amber-600 border-amber-200 text-amber-100";
      catLetter = "KDP"; // Konstruksi
    }

    const scaleStyle = isActive ? "scale-125 ring-4 ring-rose-500 z-[9999]" : "hover:scale-110";
    const pulseElement = isActive ? `<div className="absolute -inset-1.5 rounded-full bg-rose-500/40 animate-ping"></div>` : "";

    const htmlContent = `
      <div className="relative flex flex-col items-center justify-center ${scaleStyle} transition-transform duration-200 py-1">
        ${pulseElement}
        <div className="flex h-8 w-8 items-center justify-center rounded-full ${pinColor} shadow-md border-2 font-mono text-[9px] font-black uppercase text-white">
          ${catLetter}
        </div>
        <div className="h-2 w-2 transform rotate-45 -mt-1.5 ${pinColor.split(" ")[0]} border-r border-b"></div>
      </div>
    `;

    return L.divIcon({
      html: htmlContent,
      className: "custom-leaflet-marker",
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -40]
    });
  };

  // 1. Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create a Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: true,
      layers: [tileLayers.standard] // Use Standard as default base
    });

    mapInstanceRef.current = map;

    // Create FeatureGroup for geo points
    const markersLayer = L.featureGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Listen to mousemove to display current coordinates
    map.on("mousemove", (e: L.LeafletMouseEvent) => {
      setHoveredCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    // Listen to map click for setting custom coordinates
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (isEditingCoords) {
        setClickedCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Base layer update trigger
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tilelayers from map
    Object.values(tileLayers).forEach((layer) => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });

    // Add selected Base Layer
    tileLayers[activeBaseLayer].addTo(map);
  }, [activeBaseLayer]);

  // 3. Reset zoom helper
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(defaultCenter, defaultZoom);
      setSelectedAsset(null);
    }
  };

  // 4. Markers creation and lifecycle
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    // Clean up previous markers
    markersLayer.clearLayers();

    // Create markers for GIS Assets filtered
    const visibleAssets = gisAssets.filter(
      (asset) => filterKib === "ALL_GIS" || asset.kategori === filterKib
    );

    visibleAssets.forEach((asset) => {
      if (asset.latitude === undefined || asset.longitude === undefined) return;

      const marker = L.marker([asset.latitude, asset.longitude], {
        icon: getCustomMarkerIcon(asset, selectedAsset?.id === asset.id)
      });

      // Simple Click triggers Info Panel inside React UI (cleaner design than Leaflet popups)
      marker.on("click", () => {
        setSelectedAsset(asset);
        map.setView([asset.latitude!, asset.longitude!], 16, { animate: true });
      });

      // Bind a quick tooltip
      marker.bindTooltip(`
        <div class="px-2 py-1 font-sans text-xxs">
          <p class="font-extrabold text-slate-900">${asset.nama_barang}</p>
          <p class="text-slate-500 mt-0.5">${asset.kategori} &bull; Rp ${asset.nilai.toLocaleString("id-ID")}</p>
        </div>
      `, { direction: "top", offset: [0, -10] });

      markersLayer.addLayer(marker);
    });

    // Pan map to fit all bounds if filtered assets list has length > 0
    if (visibleAssets.length > 0 && filterKib !== "ALL_GIS") {
      try {
        const bounds = markersLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
      } catch (err) {
        console.warn("Bounds mapping failed", err);
      }
    }
  }, [filterKib, assets, selectedAsset]);

  // 5. Temp Custom Coords Marker rendering during coordinates placement mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tempMarker) {
      map.removeLayer(tempMarker);
      setTempMarker(null);
    }

    if (isEditingCoords && clickedCoords) {
      const pinHtml = `
        <div class="relative flex flex-col items-center justify-center scale-110 animate-bounce">
          <div class="absolute -inset-1 rounded-full bg-rose-500/50 animate-ping"></div>
          <div class="flex h-7 w-7 items-center justify-center rounded-full bg-rose-650 border border-slate-50 text-white shadow font-sans text-[11px] font-black">
            🔴
          </div>
          <div class="h-1.5 w-1.5 transform rotate-45 -mt-1 bg-rose-650"></div>
        </div>
      `;
      const curIcon = L.divIcon({
        html: pinHtml,
        className: "temp-gis-edit-marker",
        iconSize: [28, 38],
        iconAnchor: [14, 38]
      });

      const nextMarker = L.marker([clickedCoords.lat, clickedCoords.lng], {
        icon: curIcon
      }).addTo(map);

      setTempMarker(nextMarker);
      map.setView([clickedCoords.lat, clickedCoords.lng], 16);
    }
  }, [isEditingCoords, clickedCoords]);

  const selectAndPanTo = (asset: Asset) => {
    setSelectedAsset(asset);
    if (mapInstanceRef.current && asset.latitude && asset.longitude) {
      mapInstanceRef.current.setView([asset.latitude, asset.longitude], 17, { animate: true });
    }
  };

  // Searching assets within coordinates list
  const filteredSearchList = gisAssets.filter((asset) => {
    return (
      asset.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.kode_barang.includes(searchQuery) ||
      asset.lokasi.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Assign Coords submission handler
  const handleSaveCoordinates = () => {
    if (!editableAssetId) {
      alert("Harap pilih aset yang ingin dipetakan!");
      return;
    }
    if (!clickedCoords) {
      alert("Silakan klik salah satu titik lokasi pada peta terlampir untuk menaruh PIN koordinat.");
      return;
    }

    // Call state update hooks
    if (onUpdateAssetCoords) {
      onUpdateAssetCoords(editableAssetId, clickedCoords.lat, clickedCoords.lng);
    }

    // Call sync ledger queue
    if (onDbAction) {
      onDbAction("assets", "UPDATE", { id: editableAssetId, latitude: clickedCoords.lat, longitude: clickedCoords.lng });
    }

    alert(`Sukses memetakan koordinat baru untuk aset ${editableAssetId}!`);
    
    // Clear out panel
    setIsEditingCoords(false);
    setEditableAssetId("");
    setClickedCoords(null);
    if (tempMarker && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(tempMarker);
      setTempMarker(null);
    }
  };

  const getConditionStyle = (cond: string) => {
    switch (cond) {
      case "Baik": return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Rusak Ringan": return "bg-amber-50 text-amber-800 border-amber-200";
      case "Rusak Berat": return "bg-rose-50 text-rose-800 border-rose-200";
      default: return "bg-slate-50 text-slate-700 border-slate-250";
    }
  };

  const getKibBadgeColor = (kategori: string) => {
    switch (kategori) {
      case "KIB A": return "bg-blue-50 text-blue-800 border-blue-200";
      case "KIB B": return "bg-amber-50 text-amber-850 border-amber-200";
      case "KIB C": return "bg-purple-100 text-purple-800 border-purple-200";
      case "KIB D": return "bg-emerald-50 text-emerald-800 border-emerald-250";
      case "KIB E": return "bg-teal-50 text-teal-850 border-teal-200";
      case "KIB F": return "bg-slate-100 text-slate-800 border-slate-300";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* Title section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-indigo-700 animate-spin" style={{ animationDuration: "12s" }} />
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">Modul Sistem Informasi Geografis (Sipades-GIS)</h2>
          </div>
          <p className="text-slate-550 text-xs">
            Pemetaan spasial aset milik desa Lombok Timur secara interaktif. Digunakan untuk monitoring fisik, sertifikat tanah, dan pelacakan kelayakan gedung desa.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleResetView}
            className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3 text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            <Navigation className="h-3.5 w-3.5" /> Set Center
          </button>
          
          <button
            onClick={() => {
              setIsEditingCoords(!isEditingCoords);
              // reset edit targets
              setEditableAssetId("");
              setClickedCoords(null);
            }}
            className={`rounded-lg font-bold py-2 px-4.5 text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              isEditingCoords 
                ? "bg-rose-600 text-white hover:bg-rose-700" 
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            <PenTool className="h-4 w-4" /> 
            {isEditingCoords ? "BATAL REKLASIFIKASI" : "ENTRI / UPDATE DETAIL GIS"}
          </button>
        </div>
      </div>

      {/* Grid container - Left Map, Right details Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-auto">
        
        {/* Map column and controller filters */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          
          {/* Controls Segment */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-3">
            {/* Filter classification buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider mr-1">Tampilkan:</span>
              {[
                { id: "ALL_GIS", label: "Semua GIS Aset" },
                { id: "KIB A", label: "Tanah (KIB A)" },
                { id: "KIB C", label: "Gedung (KIB C)" },
                { id: "KIB D", label: "Jalan/Irigasi (KIB D)" },
                { id: "KIB F", label: "Konstruksi (KIB F)" }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterKib(filter.id)}
                  type="button"
                  className={`py-1.5 px-3 rounded text-[10px] font-black uppercase transition-colors cursor-pointer ${
                    filterKib === filter.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Base tile layer selector switches */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-mono px-2 hidden sm:inline font-bold">BASEMAP LAYER:</span>
              {[
                { id: "standard", icon: Globe, tooltip: "Road OpenStreet" },
                { id: "satellite", icon: Layers, tooltip: "Satelit Esri" },
                { id: "dark", icon: MapIcon, tooltip: "Dark Modern Mode" }
              ].map((basemap) => {
                const IconComp = basemap.icon;
                const isSelected = activeBaseLayer === basemap.id;
                return (
                  <button
                    key={basemap.id}
                    type="button"
                    title={basemap.tooltip}
                    onClick={() => setActiveBaseLayer(basemap.id as any)}
                    className={`p-1.5 rounded transition-all cursor-pointer ${
                      isSelected ? "bg-white text-indigo-750 shadow-sm font-bold" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <IconComp className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map canvas container */}
          <div className="relative rounded-2xl border border-slate-200 bg-slate-200 shadow overflow-hidden h-[500px]">
            {/* The Actual Leaflet Map Canvas */}
            <div id="leaflet-react-gis-map" ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Interactive coordinates helper banner overlay */}
            <div className="absolute bottom-3 left-3 z-[1001] bg-slate-950/80 backdrop-blur rounded-lg px-3 py-1.5 border border-slate-800 text-[10px] text-slate-350 font-mono flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                Lat: {hoveredCoords ? hoveredCoords.lat.toFixed(6) : defaultCenter[0]} • 
                Lng: {hoveredCoords ? hoveredCoords.lng.toFixed(6) : defaultCenter[1]}
              </span>
            </div>

            {/* Mini prompt banner if Editing coords is active */}
            {isEditingCoords && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1001] bg-rose-600 border border-rose-700 text-white font-bold text-[10.5px] px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
                <Compass className="h-4 w-4 animate-spin" />
                <span>Mode Pemetaan Aktif: Klik lokasi di peta untuk menaruh PIN koordinat aset!</span>
              </div>
            )}
          </div>

          {/* GIS Data Count bar */}
          <div className="flex justify-between items-center text-slate-500 text-[10.5px] px-1 font-mono">
            <span>Menampilkan <strong>{gisAssets.length} dari {allGeographicalAvailableAssets.length}</strong> total aset geografis di database Rarang Selatan.</span>
            <span>Rerata Presisi: 99.85% (Indo-DGN95)</span>
          </div>
        </div>

        {/* Info panel + editing controls column */}
        <div className="xl:col-span-4 space-y-5">
          
          {/* Entri / Update coords Panel during editing state */}
          {isEditingCoords ? (
            <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-5 space-y-4 text-left">
              <div className="border-b border-slate-100 pb-2.5 flex justify-between items-center">
                <span className="text-xs font-black text-rose-700 uppercase tracking-wide flex items-center gap-1.5 align-middle">
                  <PenTool className="h-4 w-4" /> Form Input Pin Lokasi
                </span>
                <button 
                  onClick={() => setIsEditingCoords(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 hover:cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-slate-700 leading-normal">
                <p className="text-[11px] text-slate-500 bg-slate-50 border p-2.5 rounded-lg border-slate-150">
                  Pilih aset desa yang ingin Anda perbarui atau tambahkan koordinatnya. Lalu kursor-klik bagian di atas peta untuk mengunci titik koordinat spasial barunya.
                </p>

                {/* Select asset identifier */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5 tracking-wider">Pilih Aset Fisik Desa</label>
                  <select
                    value={editableAssetId}
                    onChange={(e) => {
                      setEditableAssetId(e.target.value);
                      // seed coords if existing has some
                      const matched = assets.find(a => a.id === e.target.value);
                      if (matched && matched.latitude && matched.longitude) {
                        setClickedCoords({ lat: matched.latitude, lng: matched.longitude });
                      } else {
                        setClickedCoords(null);
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs"
                  >
                    <option value="">-- Pilih Aset Tanah / Gedung / Jalan --</option>
                    {allGeographicalAvailableAssets.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.kategori} &bull; {item.nama_barang} ({item.latitude ? "Terpetakan" : "Tanpa Koordinat"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Display click state */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5 tracking-wider">Kunci Koordinat Terpilih</label>
                  {clickedCoords ? (
                    <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg flex justify-between items-center animate-fade-in">
                      <div className="font-mono text-[10.5px] text-emerald-800">
                        <p><strong>Latitude:</strong> {clickedCoords.lat.toFixed(8)}</p>
                        <p><strong>Longitude:</strong> {clickedCoords.lng.toFixed(8)}</p>
                      </div>
                      <span className="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase">READY</span>
                    </div>
                  ) : (
                    <div className="bg-rose-50 border border-rose-100 text-rose-850 p-2.5 rounded-lg text-[10.5px] italic">
                      Silakan KLIK di sembarang lokasi yang tepat pada tampilan peta untuk mendapatkan titik koordinat presisi.
                    </div>
                  )}
                </div>

                {/* Save actions buttons */}
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingCoords(false);
                      setClickedCoords(null);
                    }}
                    className="flex-1 py-2 font-bold text-slate-650 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-center text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCoordinates}
                    disabled={!editableAssetId || !clickedCoords}
                    className="flex-1 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow transition-colors cursor-pointer text-center text-xs flex items-center justify-center gap-1"
                  >
                    <Save className="h-3.5 w-3.5" /> SIMPAN KOORDINAT
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Selected Asset Information Details Card */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 text-left min-h-[300px] flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-100 pb-2.5 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5 font-mono">
                    <Tag className="h-4 w-4 text-indigo-700" /> Detail Geografis & Spek KIB
                  </span>
                  {selectedAsset && (
                    <button 
                      onClick={() => setSelectedAsset(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 font-bold text-xs"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {selectedAsset ? (
                  <div className="space-y-3 pt-2 text-xs text-slate-700 animate-fade-in">
                    {/* Visual Photo (Simulated via unsplash references inside assets database) */}
                    {selectedAsset.foto && (
                      <div className="rounded-xl overflow-hidden h-32 border border-slate-200 shadow-inner relative">
                        <img 
                          src={selectedAsset.foto} 
                          alt={selectedAsset.nama_barang} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white font-mono text-[8px] px-1.5 py-0.5 rounded tracking-wide uppercase">DOKUMEN SIPADES</span>
                      </div>
                    )}

                    {/* Metadata Header */}
                    <div className="space-y-0.5">
                      <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[8.5px] font-black font-mono tracking-wider shadow-xxs ${getKibBadgeColor(selectedAsset.kategori)}`}>
                        {selectedAsset.kategori}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{selectedAsset.nama_barang}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {selectedAsset.id} &bull; Kode: {selectedAsset.kode_barang}</p>
                    </div>

                    {/* Geographical values */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wide block">Garis Lintang (Lat)</span>
                        <code className="text-slate-800 font-bold font-mono text-[10px]">{selectedAsset.latitude?.toFixed(7)}</code>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wide block">Garis Bujur (Lng)</span>
                        <code className="text-slate-800 font-bold font-mono text-[10px]">{selectedAsset.longitude?.toFixed(7)}</code>
                      </div>
                    </div>

                    {/* Technical values details */}
                    <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                      <div className="border border-slate-150 p-2 rounded bg-slate-50/50">
                        <span className="text-[8.5px] font-bold text-slate-400 uppercase block">Nilai Buku / Tercatat</span>
                        <span className="font-bold text-slate-900">Rp {selectedAsset.nilai.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="border border-slate-150 p-2 rounded bg-slate-50/50">
                        <span className="text-[8.5px] font-bold text-slate-400 uppercase block">Kondisi Fisik</span>
                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold mt-1 border ${getConditionStyle(selectedAsset.kondisi)}`}>
                          {selectedAsset.kondisi}
                        </span>
                      </div>
                      {selectedAsset.luas && (
                        <div className="border border-slate-150 p-2 rounded bg-slate-50/50 col-span-2">
                          <span className="text-[8.5px] font-bold text-slate-400 uppercase block">Luas Tanah / Bangunan</span>
                          <span className="font-bold text-slate-800">{selectedAsset.luas}</span>
                        </div>
                      )}
                      {selectedAsset.panjang && (
                        <div className="border border-slate-150 p-2 rounded bg-slate-50/50 col-span-2">
                          <span className="text-[8.5px] font-bold text-slate-400 uppercase block">Panjang Fisik</span>
                          <span className="font-bold text-slate-800">{selectedAsset.panjang}</span>
                        </div>
                      )}
                      {selectedAsset.sertifikat && (
                        <div className="border border-slate-150 p-2 rounded bg-slate-50/50 col-span-2">
                          <span className="text-[8.5px] font-bold text-slate-400 uppercase block">Nomor Sertifikat Hak Pakai</span>
                          <span className="font-mono text-slate-700 font-bold text-[10px] break-all select-all">{selectedAsset.sertifikat}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center h-[340px] text-slate-400 space-y-2">
                    <MapIcon className="h-10 w-10 text-slate-300 stroke-[1.2]" />
                    <p className="text-[11px] max-w-xs leading-normal">
                      Belum ada aset terpilih. Silakan klik salah satu penanda (pin) di atas peta atau gunakan bilah pencari untuk melihat spek rinci.
                    </p>
                  </div>
                )}
              </div>

              {selectedAsset && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between gap-1 text-[10.5px]">
                  <span className="text-slate-450 italic">Lokasi: {selectedAsset.lokasi}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (mapInstanceRef.current && selectedAsset.latitude && selectedAsset.longitude) {
                        mapInstanceRef.current.setView([selectedAsset.latitude, selectedAsset.longitude], 18, { animate: true });
                      }
                    }}
                    className="text-indigo-600 hover:underline font-extrabold cursor-pointer"
                  >
                    Zoom Maximize 🔍
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Find geographical index list panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 text-left">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Indeks Cepat Aset Berkoordinat</span>
            
            {/* Search filter within geographical Index */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text"
                placeholder="Saring daftar indeks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-[10.5px] text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
              />
            </div>

            <div className="max-h-[170px] overflow-y-auto divide-y divide-slate-100 pr-1 text-[11px] font-sans">
              {filteredSearchList.length > 0 ? (
                filteredSearchList.map((item) => {
                  const isSelected = selectedAsset?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectAndPanTo(item)}
                      className={`w-full text-left py-2 px-2.5 rounded transition-all cursor-pointer flex justify-between items-center gap-1.5 ${
                        isSelected ? "bg-indigo-50 border-l-4 border-indigo-600 font-bold" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="truncate">
                        <span className="font-mono text-[9px] text-slate-450 block uppercase">{item.kategori} &bull; ID {item.id}</span>
                        <span className={`text-slate-800 block truncate ${isSelected ? "font-extrabold" : "font-medium"}`}>{item.nama_barang}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 font-semibold shrink-0">
                        {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-6 italic text-slate-400 text-xxs">Tidak ada indeks yang cocok.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
