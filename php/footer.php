<?php
/**
 * ==============================================================================
 *                       SIPADES SMART v4.5 - PHP LAYOUT FOOTER
 *                 SISTEM INFORMASI PENGELOLAAN ASET DESA RARANG SELATAN
 * ==============================================================================
 */
?>
        </div> <!-- End of Scrollable Stage wrapper -->
        
        <!-- Bottom desktop/mobile status bar -->
        <footer class="bg-white border-t border-slate-100 p-4 text-[10px] text-slate-400 font-mono text-center shrink-0 flex flex-col sm:flex-row justify-between items-center gap-2">
            <div>
                &copy; 2026 Pemerintah Desa Rarang Selatan &middot; Lombok Timur
            </div>
            <div class="flex items-center gap-4 text-emerald-600 font-bold">
                <span class="flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span> PHP v8.1+ &amp; MySQL Terhubung</span>
            </div>
        </footer>

    </main>

    <!-- Mobile Navigation Toggle Script -->
    <script>
        // Initialize Lucide vector icons
        lucide.createIcons();

        // Responsive mobile drawer toggle
        const toggleBtn = document.getElementById('mobile-menu-toggle');
        const sidebar = document.getElementById('sidebar');

        if(toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('hidden');
                sidebar.classList.toggle('flex');
                sidebar.classList.toggle('w-full');
                sidebar.classList.toggle('absolute');
                sidebar.classList.toggle('z-50');
                sidebar.classList.toggle('top-16');
                sidebar.classList.toggle('left-0');
                sidebar.classList.toggle('h-[calc(100vh-4rem)]');
            });
        }
    </script>
</body>
</html>
