<?php
/**
 * ==============================================================================
 *                       SIPADES SMART v4.5 - SPATIAL GEOGRAPHICAL GIS MAP
 *                 SISTEM INFORMASI PENGELOLAAN ASET DESA RARANG SELATAN
 * ==============================================================================
 */
require_once 'header.php';

$success_msg = "";
$error_msg = "";

// 1. OPERATION SUBMISSIONS
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'save_coords') {
    try {
        $barang_id = safeInput($_POST['barang_id']);
        $latitude = (double)$_POST['latitude'];
        $longitude = (double)$_POST['longitude'];

        if (empty($barang_id) || empty($latitude) || empty($longitude)) {
            throw new Exception("Parameter koordinat pemetaan spasial kurang lengkap!");
        }

        $stmt_upd = $pdo->prepare("UPDATE assets SET latitude = ?, longitude = ? WHERE id = ?");
        $stmt_upd->execute([$latitude, $longitude, $barang_id]);

        $success_msg = "Sukses memetakan koordinat spasial baru untuk aset ID {$barang_id}!";
    } catch (Exception $e) {
        $error_msg = "Gagal menyimpan koordinat: " . $e->getMessage();
    }
}

// 2. QUERY ALL GEOGRAPHICAL ACTIVE & OPTIONAL ASSETS
$stmt_g = $pdo->query("SELECT id, nama_barang, kategori, kode_barang, nilai, kondisi, lokasi, sertifikat, progress, panjang, luas, foto, latitude, longitude FROM assets ORDER BY nama_barang ASC");
$assets_list = $stmt_g->fetchAll();

// Filter assets already mapped
$mapped_list = [];
foreach($assets_list as $a) {
    if ($a['latitude'] !== null && $a['longitude'] !== null) {
        $mapped_list[] = $a;
    }
}
?>

<!-- Leaflet Library via CDN -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

<style>
    /* Styling leaflet map pins */
    .custom-div-icon {
        background: transparent;
        border: none;
    }
    #map {
        height: 500px;
        width: 100%;
        border-radius: 1rem;
        z-index: 10;
        box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
    }
</style>

<div class="space-y-6 text-left">
    
    <!-- Title section header -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="space-y-1">
            <div class="flex items-center gap-2">
                <i data-lucide="compass" class="h-6 w-6 text-indigo-700 animate-spin" style="animation-duration: 15s;"></i>
                <h2 class="text-xl font-extrabold text-slate-900 tracking-tight uppercase">Sistem Geografis Spasial Sipades-GIS</h2>
            </div>
            <p class="text-slate-500 text-xs">
                Monitoring sebaran fisik tanah kas desa, balai posyandu dusun, gedung sekolah, dan jalan rabat milik Desa secara interakti spasial.
            </p>
        </div>
        <div class="flex flex-wrap gap-2">
            <button
                onclick="resetMapView()"
                class="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3 text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
            >
                <i data-lucide="navigation" class="h-3.5 w-3.5"></i> Set Center
            </button>
            
            <button
                onclick="toggleEditMode()"
                id="edit-mode-btn"
                class="rounded-lg font-bold py-2 px-4.5 text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm bg-indigo-600 text-white hover:bg-indigo-700"
            >
                <i data-lucide="pen-tool" class="h-4 w-4"></i> Entri / Update Detail GIS
            </button>
        </div>
    </div>

    <!-- Alert status message -->
    <?php if (!empty($success_msg)): ?>
        <div class="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <i data-lucide="check-circle" class="h-4.5 w-4.5 text-emerald-600 shrink-0"></i>
            <span><?php echo htmlspecialchars($success_msg); ?></span>
        </div>
    <?php endif; ?>

    <?php if (!empty($error_msg)): ?>
        <div class="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
            <i data-lucide="alert-circle" class="h-4.5 w-4.5 text-rose-600 shrink-0"></i>
            <span><?php echo htmlspecialchars($error_msg); ?></span>
        </div>
    <?php endif; ?>

    <!-- Main grid container layout map + details -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        <!-- Interactive Leaflet map stage -->
        <div class="xl:col-span-8 space-y-4">
            
            <!-- Filter ribbon toolbar -->
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-3">
                <div class="flex flex-wrap items-center gap-1.5 line-none font-mono">
                    <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1">ZONASI KIB:</span>
                    <button onclick="setMapFilter('ALL')" id="filter-all" class="filter-btn active py-1.5 px-3 rounded text-[10px] font-black uppercase transition-colors cursor-pointer bg-slate-900 text-white">Semua GIS Aset</button>
                    <button onclick="setMapFilter('KIB A')" id="filter-kiba" class="filter-btn py-1.5 px-3 rounded text-[10px] font-black uppercase transition-colors cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200">Tanah (KIB A)</button>
                    <button onclick="setMapFilter('KIB C')" id="filter-kibc" class="filter-btn py-1.5 px-3 rounded text-[10px] font-black uppercase transition-colors cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200">Gedung (KIB C)</button>
                    <button onclick="setMapFilter('KIB D')" id="filter-kibd" class="filter-btn py-1.5 px-3 rounded text-[10px] font-black uppercase transition-colors cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200">Konstruksi Irigasi (KIB D)</button>
                </div>

                <!-- Basemap selection -->
                <div class="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
                    <span class="text-[10px] text-slate-500 font-mono px-2 hidden sm:inline font-bold">BASEMAP LAYER:</span>
                    <button onclick="changeBasemap('osm')" id="btn-bm-osm" class="p-1.5 rounded transition-all cursor-pointer bg-white text-indigo-750 shadow-xxs"><i data-lucide="globe" class="h-3.5 w-3.5"></i></button>
                    <button onclick="changeBasemap('satellite')" id="btn-bm-satellite" class="p-1.5 rounded transition-all cursor-pointer text-slate-500 hover:text-slate-900"><i data-lucide="layers" class="h-3.5 w-3.5"></i></button>
                    <button onclick="changeBasemap('voyager')" id="btn-bm-voyager" class="p-1.5 rounded transition-all cursor-pointer text-slate-500 hover:text-slate-900"><i data-lucide="map" class="h-3.5 w-3.5"></i></button>
                </div>
            </div>

            <!-- Map stage container -->
            <div class="relative">
                <div id="map"></div>

                <!-- Live coordinates HUD helper -->
                <div class="absolute bottom-3 left-3 z-[1001] bg-slate-950/80 backdrop-blur rounded-lg px-3 py-1.5 border border-slate-800 text-[10px] text-slate-300 font-mono flex items-center gap-2">
                    <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span id="coord-hud">Peta dimuat</span>
                </div>

                <!-- Active banner warning editing mode is enabled -->
                <div id="edit-banner" class="absolute top-3 left-1/2 -translate-x-1/2 z-[1001] bg-rose-600 border border-rose-700 text-white font-bold text-[10.5px] px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-bounce hidden">
                    <i data-lucide="compass" class="h-4 w-4 animate-spin" style="animation-duration: 3s"></i>
                    <span>PEMETAAN AKTIF: Silakan klik sembarang lokasi di peta untuk menaruh pin koordinat!</span>
                </div>
            </div>

            <div class="flex justify-between items-center text-slate-500 text-[10.5px] px-1 font-mono select-none">
                <span>Rerata Pengetikan Geodesi: <strong>WGS84 Equator</strong> (WGS_1984_UTM_Zone_50S)</span>
                <span>Peta: OpenStreetMap Standard</span>
            </div>
        </div>

        <!-- Right info panel or editing parameters -->
        <div class="xl:col-span-4 space-y-4">
            
            <!-- Entri coordinates target (ONLY VISIBLE ON EDIT SPATIAL MODE) -->
            <div id="editor-panel" class="bg-white rounded-2xl border border-rose-200 shadow-sm p-5 space-y-4 hidden animate-fade-in">
                <div class="border-b border-slate-100 pb-2.5 flex justify-between items-center">
                    <span class="text-xs font-black text-rose-700 uppercase tracking-wide flex items-center gap-1.5 align-middle">
                        <i data-lucide="pen-tool" class="h-4 w-4 text-rose-600"></i> Form Input Pin Lokasi
                    </span>
                    <button onclick="toggleEditMode()" class="p-1 text-slate-400 hover:text-slate-650 bg-slate-100 rounded-full cursor-pointer">
                        <i data-lucide="x" class="h-3.5 w-3.5"></i>
                    </button>
                </div>

                <form method="POST" class="space-y-3.5 text-xs">
                    <input type="hidden" name="action" value="save_coords">
                    <input type="hidden" name="latitude" id="input-lat" value="">
                    <input type="hidden" name="longitude" id="input-lng" value="">

                    <p class="text-[11px] text-slate-550 bg-slate-50 border p-2.5 rounded-lg border-slate-150 leading-relaxed">
                        Pilih barang sasaran di input bawah untuk dideretkan, lalu klik sembarang lokasi di maps untuk mendeteksi koordinat lintang dan bujurnya.
                    </p>

                    <div>
                        <label class="block text-[10px] font-bold text-slate-450 uppercase mb-1.5 tracking-wider">Aset Sasaran KIB</label>
                        <select name="barang_id" id="select-editor-target" required onchange="onSelectEditorTarget(this)" class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 font-semibold text-slate-800 text-xs">
                            <option value="">-- Pilih Aset Terdaftar --</option>
                            <?php foreach($assets_list as $ast): ?>
                                <option value="<?php echo $ast['id']; ?>" data-lat="<?php echo $ast['latitude']; ?>" data-lng="<?php echo $ast['longitude']; ?>">
                                    [<?php echo $ast['kategori']; ?>] <?php echo htmlspecialchars($ast['nama_barang']); ?> (<?php echo ($ast['latitude']!==null) ? "Sudah Terpetakan" : "Koran Koordinat"; ?>)
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div>
                        <label class="block text-[10px] font-bold text-slate-450 uppercase mb-1.5 tracking-wider">Koordinat Pin Baru</label>
                        <div id="click-hud-badge" class="bg-rose-50 border border-rose-100 text-rose-850 p-2.5 rounded-lg text-[10.5px] italic">
                            Silakan klik suatu wilayah pada peta untuk menaruh PIN merah.
                        </div>
                    </div>

                    <div class="flex gap-2 pt-2 border-t border-slate-100">
                        <button type="button" onclick="toggleEditMode()" class="flex-1 py-1.5 font-bold text-slate-650 bg-slate-100 hover:bg-slate-200 rounded-lg text-center cursor-pointer">Batal</button>
                        <button type="submit" id="btn-save-coords" disabled class="flex-1 py-1.5 font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow transition-colors cursor-pointer text-center flex items-center justify-center gap-1">
                            <i data-lucide="save" class="h-3.5 w-3.5"></i> SIMPAN KOORDINAT
                        </button>
                    </div>
                </form>
            </div>

            <!-- Standard selected asset info details (VISIBLE IN PREVIEW VIEW) -->
            <div id="inspector-panel" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 min-h-[300px] flex flex-col justify-between">
                <div>
                    <div class="border-b border-white-100 pb-2.5 flex justify-between items-center text-left">
                        <span class="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5 font-mono">
                            <i data-lucide="tag" class="h-4 w-4 text-indigo-700"></i> Detail Geografis &amp; KIB
                        </span>
                        <button id="btn-pindah-reset-inspector" onclick="resetInspector()" class="text-slate-450 hover:text-slate-700 text-[10px] font-bold hidden cursor-pointer">Reset</button>
                    </div>

                    <!-- Placeholder empty asset state -->
                    <div id="inspector-placeholder" class="flex flex-col items-center justify-center text-center h-[260px] text-slate-400 space-y-2">
                        <i data-lucide="map-pin" class="h-10 w-10 text-slate-300 stroke-[1.2]"></i>
                        <p class="text-[11px] max-w-xs leading-normal">
                            Belum ada aset terpilih. Silakan klik salah satu penanda (pin) di atas peta atau gunakan bilah list di bawah untuk memfokuskan.
                        </p>
                    </div>

                    <!-- Inspected Asset Details block -->
                    <div id="inspector-details" class="space-y-3 pt-2 text-xs text-slate-700 text-left hidden">
                        <!-- Photo placeholder -->
                        <div id="inspector-photo" class="rounded-xl overflow-hidden h-32 border border-slate-200 shadow-inner relative hidden">
                            <img id="ins-img" src="" alt="Aset" class="w-full h-full object-cover">
                            <span class="absolute bottom-2 right-2 bg-black/70 text-white font-mono text-[8px] px-1.5 py-0.5 rounded tracking-wide uppercase">SIPADES REAL DOCUMENT</span>
                        </div>

                        <div class="space-y-0.5">
                            <span id="ins-kategori-badge" class="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[8.5px] font-black font-mono tracking-wider shadow-xxs">N/A</span>
                            <h4 id="ins-nama" class="font-extrabold text-sm text-slate-900 leading-snug">N/A</h4>
                            <p class="text-[10px] text-slate-405 font-mono">ID: <span id="ins-id">N/A</span> &bull; Sandi: <span id="ins-sandi">N/A</span></p>
                        </div>

                        <!-- Coords values -->
                        <div class="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                            <div>
                                <span class="text-[9px] text-slate-400 uppercase tracking-wide block">Garis Lintang (Lat)</span>
                                <code id="ins-lat" class="text-slate-800 font-bold font-mono text-[10px]">N/A</code>
                            </div>
                            <div>
                                <span class="text-[9px] text-slate-400 uppercase tracking-wide block">Garis Bujur (Lng)</span>
                                <code id="ins-lng" class="text-slate-800 font-bold font-mono text-[10px]">N/A</code>
                            </div>
                        </div>

                        <!-- Technical specification boxes -->
                        <div class="grid grid-cols-2 gap-2 text-[10.5px]">
                            <div class="border border-slate-150 p-2 rounded bg-slate-50/50">
                                <span class="text-[8.5px] font-bold text-slate-400 uppercase block">Nilai Buku / Tercatat</span>
                                <span id="ins-nilai" class="font-bold text-slate-900">Rp 0</span>
                            </div>
                            <div class="border border-slate-150 p-2 rounded bg-slate-50/50">
                                <span class="text-[8.5px] font-bold text-slate-400 uppercase block">Kondisi Fisik</span>
                                <span id="ins-kondisi-badge" class="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold mt-1 border">Baik</span>
                            </div>
                            <div id="ins-box-luas" class="border border-slate-150 p-2 rounded bg-slate-50/50 col-span-2 hidden">
                                <span class="text-[8.5px] font-bold text-slate-400 uppercase block">Luas Tanah / Bangunan</span>
                                <span id="ins-luas" class="font-bold text-slate-800">N/A</span>
                            </div>
                            <div id="ins-box-sertifikat" class="border border-slate-150 p-2 rounded bg-slate-50/50 col-span-2 hidden">
                                <span class="text-[8.5px] font-bold text-slate-400 uppercase block">No. Sertifikat Hak Guna</span>
                                <span id="ins-sertifikat" class="font-mono text-slate-705 font-bold text-[10px] break-all">N/A</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="inspector-footer" class="mt-3 pt-3 border-t border-slate-100 flex justify-between gap-1 text-[10.5px] text-left hidden">
                    <span id="ins-lokasi" class="text-slate-450 italic">Lokasi: N/A</span>
                    <button onclick="zoomMaxSelected()" class="text-indigo-650 hover:underline font-extrabold cursor-pointer">Zoom Max 🔍</button>
                </div>
            </div>

            <!-- Quick Find index search list -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 text-left">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Indeks Geografis KIB</span>
                
                <div class="relative">
                    <i data-lucide="search" class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"></i>
                    <input 
                        type="text"
                        onkeyup="searchGisIndex(this)"
                        placeholder="Saring daftar indeks cepat..."
                        class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-[10.5px] text-slate-800 focus:bg-white focus:outline-none Focus:ring-1 focus:ring-indigo-650 font-medium"
                    />
                </div>

                <!-- Index lists -->
                <div id="index-scrollbar" class="max-h-[170px] overflow-y-auto divide-y divide-slate-100 pr-1 text-[11px]">
                    <?php if (count($mapped_list) > 0): ?>
                        <?php foreach ($mapped_list as $mapItem): ?>
                            <button
                                type="button"
                                onclick="panToAsset(<?php echo htmlspecialchars(json_encode($mapItem)); ?>)"
                                class="gis-index-item w-full text-left py-2 px-2.5 rounded hover:bg-slate-50 transition-all cursor-pointer flex justify-between items-center gap-1.5"
                                data-nama="<?php echo htmlspecialchars(strtolower($mapItem['nama_barang'])); ?>"
                            >
                                <div class="truncate">
                                    <span class="font-mono text-[9px] text-slate-400 block uppercase"><?php echo $mapItem['kategori']; ?> &bull; ID <?php echo $mapItem['id']; ?></span>
                                    <span class="text-slate-800 block truncate font-semibold"><?php echo htmlspecialchars($mapItem['nama_barang']); ?></span>
                                </div>
                                <span class="font-mono text-[10px] text-slate-500 font-semibold shrink-0">
                                    <?php echo round($mapItem['latitude'], 4) . ", " . round($mapItem['longitude'], 4); ?>
                                </span>
                            </button>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <div class="text-center py-6 italic text-slate-400 text-xxs">Belum ada aset terpetakan di database.</div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- ==================== GIS LOGIC CORE JAVASCRIPT ==================== -->
<script>
    // Center Desa Rarang Selatan kabupaten Lombok Timur NTB
    const defaultCenter = [-8.627622, 116.345861];
    const defaultZoom = 15;

    let map;
    let markersLayer;
    let tempMarker = null;

    let activeFilter = 'ALL';
    let baseLayers = {};
    let activeBase = 'osm';

    let isEditingCoords = false;
    let clickedCoords = null;

    // Database JSON list
    const assetsData = <?php echo json_encode($assets_list); ?>;

    // 1. Initialization Map
    document.addEventListener("DOMContentLoaded", function() {
        map = L.map('map', {
            center: defaultCenter,
            zoom: defaultZoom,
            zoomControl: true
        });

        // Tiles
        baseLayers.osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        });

        baseLayers.satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
            maxZoom: 19,
            attribution: 'ArcGIS Satellite'
        });

        baseLayers.voyager = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png", {
            maxZoom: 19,
            attribution: 'CARTO'
        });

        // Set default layer
        baseLayers.osm.addTo(map);

        // FeatureGroup
        markersLayer = L.featureGroup().addTo(map);

        // Render real targets
        renderActivePins();

        // Mousemove coordinate HUD update
        map.on("mousemove", function(e) {
            document.getElementById('coord-hud').textContent = "Lat: " + e.latlng.lat.toFixed(6) + " • Lng: " + e.latlng.lng.toFixed(6);
        });

        // Map Click Listener
        map.on("click", function(e) {
            if (!isEditingCoords) return;

            clickedCoords = { lat: e.latlng.lat, lng: e.latlng.lng };

            // Update Input Forms
            document.getElementById('input-lat').value = clickedCoords.lat;
            document.getElementById('input-lng').value = clickedCoords.lng;

            document.getElementById('click-hud-badge').className = "bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg flex justify-between items-center animate-fade-in";
            document.getElementById('click-hud-badge').innerHTML = `
                <div class="font-mono text-[10.5px] text-emerald-800">
                    <p><strong>Latitude:</strong> ${clickedCoords.lat.toFixed(8)}</p>
                    <p><strong>Longitude:</strong> ${clickedCoords.lng.toFixed(8)}</p>
                </div>
                <span class="bg-emerald-550 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase">READY</span>
            `;

            // Validate save button
            validateSaveButton();

            // Render temp red marker for placing coordinate
            if (tempMarker) {
                map.removeLayer(tempMarker);
            }

            const tempIconHtml = `
                <div class="relative flex flex-col items-center justify-center scale-110 animate-bounce">
                    <div class="absolute -inset-1 rounded-full bg-rose-500/50 animate-ping"></div>
                    <div class="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 border border-white text-white shadow font-sans text-[11px] font-black">
                        📍
                    </div>
                </div>
            `;
            const customTempIcon = L.divIcon({
                html: tempIconHtml,
                className: 'custom-div-icon',
                iconSize: [28, 38],
                iconAnchor: [14, 38]
            });

            tempMarker = L.marker([clickedCoords.lat, clickedCoords.lng], { icon: customTempIcon }).addTo(map);
        });
    });

    // 2. Tile layer change handler
    function changeBasemap(layerName) {
        Object.values(baseLayers).forEach(layer => {
            if (map.hasLayer(layer)) {
                map.removeLayer(layer);
            }
        });

        baseLayers[layerName].addTo(map);
        activeBase = layerName;

        // Visual states active select
        document.getElementById('btn-bm-osm').className = "p-1.5 rounded transition-all cursor-pointer " + (layerName==='osm'?'bg-white text-indigo-750 shadow-xxs':'text-slate-500 hover:text-slate-900');
        document.getElementById('btn-bm-satellite').className = "p-1.5 rounded transition-all cursor-pointer " + (layerName==='satellite'?'bg-white text-indigo-750 shadow-xxs':'text-slate-500 hover:text-slate-900');
        document.getElementById('btn-bm-voyager').className = "p-1.5 rounded transition-all cursor-pointer " + (layerName==='voyager'?'bg-white text-indigo-750 shadow-xxs':'text-slate-500 hover:text-slate-900');
    }

    // 3. Render active marker pins
    let activeInspectedAsset = null;

    function renderActivePins() {
        markersLayer.clearLayers();

        const targets = assetsData.filter(a => {
            if (a.latitude === null || a.longitude === null) return false;
            if (activeFilter === 'ALL') return true;
            return a.kategori === activeFilter;
        });

        targets.forEach(a => {
            const latitude = parseFloat(a.latitude);
            const longitude = parseFloat(a.longitude);

            // Set color badge matching
            let pinColor = "bg-blue-600 border-blue-200 text-blue-105";
            let kibLetter = "TNH";
            if (a.kategori === 'KIB C') {
                pinColor = "bg-purple-600 border-purple-200 text-purple-100";
                kibLetter = "GDG";
            } else if (a.kategori === 'KIB D') {
                pinColor = "bg-emerald-600 border-emerald-250 text-emerald-100";
                kibLetter = "JLN";
            }

            const isInspected = (activeInspectedAsset && activeInspectedAsset.id === a.id);
            const scaleClass = isInspected ? "scale-125 ring-4 ring-rose-500 z-[9999]" : "hover:scale-110";
            const pulseMarkup = isInspected ? `<div class="absolute -inset-1.5 rounded-full bg-rose-500/40 animate-ping"></div>` : "";

            const htmlMarkup = `
                <div class="relative flex flex-col items-center justify-center ${scaleClass} transition-transform duration-100 py-1">
                    ${pulseMarkup}
                    <div class="flex h-8 w-8 items-center justify-center rounded-full ${pinColor} shadow-md border-2 font-mono text-[9px] font-black uppercase text-white">
                        ${kibLetter}
                    </div>
                    <div class="h-2 w-2 transform rotate-45 -mt-1 ${pinColor.split(" ")[0]} border-r border-b border-inherit"></div>
                </div>
            `;

            const markerIcon = L.divIcon({
                html: htmlMarkup,
                className: 'custom-div-icon',
                iconSize: [32, 42],
                iconAnchor: [16, 42],
                popupAnchor: [0, -40]
            });

            const marker = L.marker([latitude, longitude], { icon: markerIcon });
            
            // Tooltip bind popup hover
            marker.bindTooltip(`
                <div class="px-2 py-1 font-sans text-xxs">
                    <p class="font-bold text-slate-900">${a.nama_barang}</p>
                    <p class="text-slate-500 mt-0.5">${a.kategori} &bull; Rp ${parseInt(a.nilai).toLocaleString("id-ID")}</p>
                </div>
            `, { direction: 'top', offset: [0, -10] });

            // Click listener
            marker.on("click", function() {
                inspectAsset(a);
                map.setView([latitude, longitude], 17, { animate: true });
            });

            markersLayer.addLayer(marker);
        });
    }

    // 4. Inspect element details
    function inspectAsset(asset) {
        activeInspectedAsset = asset;

        document.getElementById('inspector-placeholder').className = "hidden";
        document.getElementById('inspector-details').className = "space-y-3 pt-2 text-xs text-slate-705 text-left";
        document.getElementById('inspector-footer').className = "mt-3 pt-3 border-t border-slate-100 flex justify-between gap-1 text-[10.5px] text-left";
        document.getElementById('btn-pindah-reset-inspector').classList.remove('hidden');

        // Text fills
        document.getElementById('ins-nama').textContent = asset.nama_barang;
        document.getElementById('ins-id').textContent = asset.id;
        document.getElementById('ins-sandi').textContent = asset.kode_barang;
        document.getElementById('ins-lat').textContent = parseFloat(asset.latitude).toFixed(7);
        document.getElementById('ins-lng').textContent = parseFloat(asset.longitude).toFixed(7);
        document.getElementById('ins-nilai').textContent = "Rp " + parseFloat(asset.nilai).toLocaleString("id-ID");
        document.getElementById('ins-lokasi').textContent = "Lokasi: " + asset.lokasi;

        // Kategori Badge Style
        const badge = document.getElementById('ins-kategori-badge');
        badge.textContent = asset.kategori;
        badge.className = "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[8.5px] font-black font-mono tracking-wider shadow-xxs " + 
            (asset.kategori==='KIB A'?'bg-blue-50 text-blue-805 border-blue-200':asset.kategori==='KIB C'?'bg-purple-50 text-purple-800 border-purple-200':'bg-emerald-50 text-emerald-800 border-emerald-250');

        // Kondisi Badge Style
        const condBadge = document.getElementById('ins-kondisi-badge');
        condBadge.textContent = asset.kondisi;
        condBadge.className = "inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold mt-1 border " + 
            (asset.kondisi==='Baik'?'bg-emerald-50 text-emerald-800 border-emerald-200':asset.kondisi==='Rusak Ringan'?'bg-amber-50 text-amber-800 border-amber-200':'bg-rose-50 text-rose-800 border-rose-201');

        // Optional fields (Sertifikat & Luas)
        if (asset.luas) {
            document.getElementById('ins-box-luas').className = "border border-slate-150 p-2 rounded bg-slate-50/50 col-span-2";
            document.getElementById('ins-luas').textContent = asset.luas;
        } else {
            document.getElementById('ins-box-luas').className = "hidden";
        }

        if (asset.sertifikat) {
            document.getElementById('ins-box-sertifikat').className = "border border-slate-150 p-2 rounded bg-slate-50/50 col-span-2";
            document.getElementById('ins-sertifikat').textContent = asset.sertifikat;
        } else {
            document.getElementById('ins-box-sertifikat').className = "hidden";
        }

        // Image Photo
        if (asset.foto) {
            document.getElementById('inspector-photo').className = "rounded-xl overflow-hidden h-32 border border-slate-200 shadow-inner relative block";
            document.getElementById('ins-img').src = asset.foto;
        } else {
            document.getElementById('inspector-photo').className = "hidden";
        }

        // Trigger pulse marker pin mapping
        renderActivePins();
    }

    function resetInspector() {
        activeInspectedAsset = null;
        document.getElementById('inspector-placeholder').className = "flex flex-col items-center justify-center text-center h-[260px] text-slate-400 space-y-2";
        document.getElementById('inspector-details').className = "hidden";
        document.getElementById('inspector-footer').className = "hidden";
        document.getElementById('btn-pindah-reset-inspector').className = "hidden";
        renderActivePins();
    }

    function resetMapView() {
        if (map) {
            map.setView(defaultCenter, defaultZoom);
            resetInspector();
        }
    }

    function zoomMaxSelected() {
        if (map && activeInspectedAsset) {
            map.setView([activeInspectedAsset.latitude, activeInspectedAsset.longitude], 18, { animate: true });
        }
    }

    function panToAsset(data) {
        inspectAsset(data);
        if (map && data.latitude && data.longitude) {
            map.setView([data.latitude, data.longitude], 17, { animate: true });
        }
    }

    // 5. Filter category ribbon
    function setMapFilter(cat) {
        activeFilter = cat;
        
        // Buttons highlight states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.className = "filter-btn py-1.5 px-3 rounded text-[10px] font-black uppercase transition-colors cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200";
        });

        if (cat === 'ALL') document.getElementById('filter-all').className = "filter-btn active py-1.5 px-3 rounded text-[10px] font-black uppercase transition-colors cursor-pointer bg-slate-900 text-white";
        else if (cat === 'KIB A') document.getElementById('filter-kiba').className = "filter-btn active py-1.5 px-3 rounded text-[10px] font-black uppercase transition-colors cursor-pointer bg-slate-900 text-white";
        else if (cat === 'KIB C') document.getElementById('filter-kibc').className = "filter-btn active py-1.5 px-3 rounded text-[10px] font-black uppercase transition-colors cursor-pointer bg-slate-900 text-white";
        else if (cat === 'KIB D') document.getElementById('filter-kibd').className = "filter-btn active py-1.5 px-3 rounded text-[10px] font-black uppercase transition-colors cursor-pointer bg-slate-900 text-white";

        renderActivePins();

        // Fit map bounds if targets length > 0
        try {
            const bounds = markersLayer.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
            }
        } catch(e){}
    }

    // 6. Interactive editor settings
    function toggleEditMode() {
        isEditingCoords = !isEditingCoords;

        const btn = document.getElementById('edit-mode-btn');
        const editor = document.getElementById('editor-panel');
        const inspector = document.getElementById('inspector-panel');
        const banner = document.getElementById('edit-banner');

        if (isEditingCoords) {
            btn.className = "rounded-lg font-bold py-2 px-4.5 text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm bg-rose-600 text-white hover:bg-rose-700 animate-pulse";
            btn.innerHTML = `<i data-lucide="x" class="h-4 w-4"></i> Batal Reklasifikasi`;
            editor.classList.remove('hidden');
            inspector.className = "hidden shadow-sm";
            banner.classList.remove('hidden');

            // clear previous
            document.getElementById('select-editor-target').value = '';
            document.getElementById('input-lat').value = '';
            document.getElementById('input-lng').value = '';
            document.getElementById('click-hud-badge').className = "bg-rose-50 border border-rose-100 text-rose-850 p-2.5 rounded-lg text-[10.5px] italic";
            document.getElementById('click-hud-badge').textContent = "Silakan klik suatu wilayah pada peta untuk menaruh PIN merah.";
            validateSaveButton();
        } else {
            btn.className = "rounded-lg font-bold py-2 px-4.5 text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm bg-indigo-600 text-white hover:bg-indigo-700";
            btn.innerHTML = `<i data-lucide="pen-tool" class="h-4 w-4"></i> Entri / Update Detail GIS`;
            editor.classList.add('hidden');
            inspector.className = "bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 min-h-[300px] flex flex-col justify-between";
            banner.classList.add('hidden');

            if (tempMarker) {
                map.removeLayer(tempMarker);
                tempMarker = null;
            }
            clickedCoords = null;
            resetInspector();
        }
        lucide.createIcons();
    }

    function onSelectEditorTarget(select) {
        const option = select.options[select.selectedIndex];
        const lat = option.getAttribute('data-lat');
        const lng = option.getAttribute('data-lng');

        if (lat && lng && lat !== "" && lng !== "") {
            clickedCoords = { lat: parseFloat(lat), lng: parseFloat(lng) };
            document.getElementById('input-lat').value = lat;
            document.getElementById('input-lng').value = lng;

            document.getElementById('click-hud-badge').className = "bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg flex justify-between items-center";
            document.getElementById('click-hud-badge').innerHTML = `
                <div class="font-mono text-[10.5px] text-emerald-800">
                    <p><strong>Latitude:</strong> ${clickedCoords.lat.toFixed(8)}</p>
                    <p><strong>Longitude:</strong> ${clickedCoords.lng.toFixed(8)}</p>
                </div>
                <span class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase">EXISTING</span>
            `;

            // Draw temp pin
            if (tempMarker) map.removeLayer(tempMarker);

            const tempIconHtml = `
                <div class="relative flex flex-col items-center justify-center scale-110">
                    <div class="absolute -inset-1 rounded-full bg-rose-500/50 animate-ping"></div>
                    <div class="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 border border-white text-white shadow font-sans text-[11px] font-black">
                        📍
                    </div>
                </div>
            `;
            const customTempIcon = L.divIcon({
                html: tempIconHtml,
                className: 'custom-div-icon',
                iconSize: [28, 38],
                iconAnchor: [14, 38]
            });
            tempMarker = L.marker([clickedCoords.lat, clickedCoords.lng], { icon: customTempIcon }).addTo(map);
            map.setView([clickedCoords.lat, clickedCoords.lng], 16, { animate: true });
        } else {
            clickedCoords = null;
            document.getElementById('input-lat').value = '';
            document.getElementById('input-lng').value = '';
            document.getElementById('click-hud-badge').className = "bg-rose-50 border border-rose-100 text-rose-850 p-2.5 rounded-lg text-[10.5px] italic";
            document.getElementById('click-hud-badge').textContent = "Silakan klik suatu wilayah pada peta untuk menaruh PIN merah.";
            if (tempMarker) {
                map.removeLayer(tempMarker);
                tempMarker = null;
            }
        }
        validateSaveButton();
    }

    function validateSaveButton() {
        const target = document.getElementById('select-editor-target').value;
        const btn = document.getElementById('btn-save-coords');
        if (target !== '' && clickedCoords !== null) {
            btn.removeAttribute('disabled');
        } else {
            btn.setAttribute('disabled', 'true');
        }
    }

    // Index geographical filter searches
    function searchGisIndex(input) {
        const q = input.value.toLowerCase().trim();
        document.querySelectorAll('.gis-index-item').forEach(item => {
            const nameAttr = item.getAttribute('data-nama');
            if (nameAttr.includes(q)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
</script>

<?php require_once 'footer.php'; ?>
