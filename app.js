// ModAPK Platform - Fixed Online Version with Supabase Integration
class OnlineModAPKPlatform {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.isOnline = false;
        this.apks = [];
        this.categories = [];
        this.filteredApks = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.subscriptions = [];
        this.retryCount = 0;
        this.maxRetries = 3;
        
        // Configuration
        this.config = {
            supabaseUrl: localStorage.getItem('modapk_supabase_url'),
            supabaseKey: localStorage.getItem('modapk_supabase_key'),
            demoMode: localStorage.getItem('modapk_demo_mode') === 'true'
        };
        
        this.init();
    }

    async init() {
        console.log('Initializing Online ModAPK Platform...');
        
        // First setup event listeners
        this.setupEventListeners();
        
        // Check if we should show setup wizard or main app
        if (this.shouldShowSetup()) {
            this.showSetupWizard();
            return;
        }
        
        // Initialize the platform
        await this.initializePlatform();
    }

    shouldShowSetup() {
        return !this.config.demoMode && (!this.config.supabaseUrl || !this.config.supabaseKey);
    }

    async initializePlatform() {
        // Initialize Supabase if configured
        if (this.config.supabaseUrl && this.config.supabaseKey && !this.config.demoMode) {
            await this.initializeSupabase();
        } else {
            // Demo mode
            this.initializeDemoMode();
        }
        
        // Load initial data
        await this.loadInitialData();
        
        // Check authentication state
        await this.checkAuthState();
        
        // Start real-time subscriptions
        if (this.isOnline) {
            this.setupRealtimeSubscriptions();
        }
        
        // Render UI
        this.renderCategories();
        this.renderAPKs();
        this.updateStats();
        this.loadTheme();
        
        // Hide setup wizard and show main app
        this.hideSetupWizard();
        
        console.log('Platform initialized successfully');
    }

    async initializeSupabase() {
        try {
            const { createClient } = supabase;
            this.supabase = createClient(this.config.supabaseUrl, this.config.supabaseKey);
            
            // Test connection
            const { data, error } = await this.supabase.from('categories').select('count');
            
            if (error) {
                console.error('Supabase connection error:', error);
                this.showToast('Failed to connect to database. Switching to demo mode.', 'warning');
                this.initializeDemoMode();
                return;
            }
            
            this.isOnline = true;
            this.showToast('Connected to online database!', 'success');
            console.log('Supabase initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            this.showToast('Failed to initialize database connection. Using demo mode.', 'warning');
            this.initializeDemoMode();
        }
    }

    initializeDemoMode() {
        console.log('Running in demo mode');
        this.isOnline = false;
        this.config.demoMode = true;
        localStorage.setItem('modapk_demo_mode', 'true');
        this.showToast('Running in demo mode. Set up Supabase for full online functionality.', 'info');
    }

    showSetupWizard() {
        const wizard = document.getElementById('setupWizard');
        const main = document.querySelector('.main');
        const header = document.querySelector('.header');
        
        if (wizard) {
            wizard.classList.remove('hidden');
        }
        if (main) {
            main.style.display = 'none';
        }
        if (header) {
            header.style.display = 'none';
        }
    }

    hideSetupWizard() {
        const wizard = document.getElementById('setupWizard');
        const main = document.querySelector('.main');
        const header = document.querySelector('.header');
        
        if (wizard) {
            wizard.classList.add('hidden');
        }
        if (main) {
            main.style.display = 'block';
        }
        if (header) {
            header.style.display = 'block';
        }
    }

    async loadInitialData() {
        if (this.isOnline && this.supabase) {
            await this.loadOnlineData();
        } else {
            this.loadDemoData();
        }
    }

    async loadOnlineData() {
        try {
            // Load categories
            const { data: categories, error: catError } = await this.supabase
                .from('categories')
                .select('*')
                .order('name');
            
            if (catError) throw catError;
            
            this.categories = categories.map(cat => ({
                name: cat.name,
                icon: cat.icon,
                color: cat.color,
                count: cat.count || 0
            }));
            
            // Load APKs
            const { data: apks, error: apkError } = await this.supabase
                .from('apks')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (apkError) throw apkError;
            
            this.apks = apks.map(apk => this.formatApkFromDatabase(apk));
            this.filteredApks = [...this.apks];
            
        } catch (error) {
            console.error('Error loading online data:', error);
            this.showToast('Error loading data from database. Using demo data.', 'warning');
            this.loadDemoData();
        }
    }

    loadDemoData() {
        console.log('Loading demo data...');
        
        // Demo categories
        this.categories = [
            {name: "Social", icon: "fas fa-users", color: "#4267B2", count: 0},
            {name: "Music", icon: "fas fa-music", color: "#1DB954", count: 0},
            {name: "Entertainment", icon: "fas fa-film", color: "#FF0000", count: 0},
            {name: "Games", icon: "fas fa-gamepad", color: "#FF6B6B", count: 0},
            {name: "Photography", icon: "fas fa-camera", color: "#E1306C", count: 0},
            {name: "Productivity", icon: "fas fa-briefcase", color: "#4285F4", count: 0},
            {name: "Tools", icon: "fas fa-wrench", color: "#FF9500", count: 0}
        ];

        // Demo APKs
        this.apks = [
            {
                id: 1,
                name: "WhatsApp Plus",
                version: "17.60.2",
                packageName: "com.whatsapp.plus",
                category: "Social",
                description: "Enhanced WhatsApp with advanced privacy features, custom themes, extended media sharing, message scheduling, and anti-ban protection.",
                downloadUrl: "https://download.apkpure.com/b/XAPK/Y29tLndoYXRzYXBwLnBsdXM",
                iconUrl: "https://via.placeholder.com/64x64/25D366/ffffff?text=WA+",
                fileSize: "58.7 MB",
                androidVersion: "4.4+",
                downloadCount: 2847362,
                rating: 4.8,
                reviewCount: 12047,
                permissions: ["Camera", "Contacts", "Microphone", "Storage", "Phone"],
                features: ["Custom Themes", "Privacy Options", "Anti-Ban", "Message Scheduling"],
                lastUpdated: "2025-08-24",
                verified: true,
                featured: true,
                trending: true,
                tags: ["messaging", "social", "themes", "privacy"]
            },
            {
                id: 2,
                name: "Spotify Premium",
                version: "8.7.88.475",
                packageName: "com.spotify.music.premium",
                category: "Music",
                description: "Unlock premium features including ad-free listening, unlimited skips, offline downloads, and high-quality streaming.",
                downloadUrl: "https://download.apkpure.com/b/XAPK/Y29tLnNwb3RpZnkubXVzaWM",
                iconUrl: "https://via.placeholder.com/64x64/1DB954/ffffff?text=SP",
                fileSize: "31.4 MB",
                androidVersion: "5.0+",
                downloadCount: 3421876,
                rating: 4.9,
                reviewCount: 18392,
                permissions: ["Storage", "Network", "Audio", "Phone State"],
                features: ["Ad-Free", "Offline Downloads", "Unlimited Skips", "High Quality"],
                lastUpdated: "2025-08-25",
                verified: true,
                featured: true,
                trending: true,
                tags: ["music", "streaming", "premium", "offline"]
            },
            {
                id: 3,
                name: "Instagram Pro",
                version: "286.0.0.21.123",
                packageName: "com.instagram.android.pro",
                category: "Social",
                description: "Enhanced Instagram with download capabilities, story viewing without seen status, zoom profile pictures, and advanced privacy controls.",
                downloadUrl: "https://download.apkpure.com/b/APK/Y29tLmluc3RhZ3JhbS5hbmRyb2lk",
                iconUrl: "https://via.placeholder.com/64x64/E1306C/ffffff?text=IG",
                fileSize: "43.2 MB",
                androidVersion: "6.0+",
                downloadCount: 1967543,
                rating: 4.7,
                reviewCount: 8429,
                permissions: ["Camera", "Storage", "Contacts", "Location", "Microphone"],
                features: ["Download Photos/Videos", "Anonymous Story View", "Zoom Profile Pics", "No Ads"],
                lastUpdated: "2025-08-23",
                verified: true,
                featured: false,
                trending: false,
                tags: ["social", "photography", "download", "privacy"]
            },
            {
                id: 4,
                name: "YouTube Vanced",
                version: "18.23.35",
                packageName: "com.vanced.android.youtube",
                category: "Entertainment",
                description: "Advanced YouTube client with ad-blocking, background playback, dark theme, and additional customization options.",
                downloadUrl: "https://download.apkpure.com/b/APK/Y29tLnZhbmNlZC5hbmRyb2lk",
                iconUrl: "https://via.placeholder.com/64x64/FF0000/ffffff?text=YT",
                fileSize: "67.8 MB",
                androidVersion: "6.0+",
                downloadCount: 5234891,
                rating: 4.9,
                reviewCount: 23847,
                permissions: ["Storage", "Network", "Audio"],
                features: ["Ad-Free", "Background Play", "Picture-in-Picture", "Dark Theme"],
                lastUpdated: "2025-08-22",
                verified: true,
                featured: true,
                trending: true,
                tags: ["video", "entertainment", "ad-free", "background"]
            },
            {
                id: 5,
                name: "Netflix Mod",
                version: "8.62.0",
                packageName: "com.netflix.mediaclient.mod",
                category: "Entertainment",
                description: "Modded Netflix with premium features unlocked, 4K streaming, and ad-free experience.",
                downloadUrl: "https://download.apkpure.com/b/APK/Y29tLm5ldGZsaXgubW9k",
                iconUrl: "https://via.placeholder.com/64x64/E50914/ffffff?text=NF",
                fileSize: "89.1 MB",
                androidVersion: "5.0+",
                downloadCount: 4532891,
                rating: 4.6,
                reviewCount: 15632,
                permissions: ["Storage", "Network"],
                features: ["Premium Unlocked", "4K Streaming", "Ad-Free", "Offline Downloads"],
                lastUpdated: "2025-08-21",
                verified: true,
                featured: false,
                trending: true,
                tags: ["streaming", "movies", "premium", "4k"]
            },
            {
                id: 6,
                name: "TikTok Pro",
                version: "29.8.4",
                packageName: "com.zhiliaoapp.musically.pro",
                category: "Social",
                description: "Enhanced TikTok with download capabilities, no watermarks, and advanced editing features.",
                downloadUrl: "https://download.apkpure.com/b/APK/Y29tLnRpa3Rva3Byby5hcGs",
                iconUrl: "https://via.placeholder.com/64x64/000000/ffffff?text=TT",
                fileSize: "142.3 MB",
                androidVersion: "6.0+",
                downloadCount: 6789123,
                rating: 4.5,
                reviewCount: 28391,
                permissions: ["Camera", "Microphone", "Storage", "Location"],
                features: ["Video Download", "No Watermark", "Advanced Editor", "HD Export"],
                lastUpdated: "2025-08-20",
                verified: true,
                featured: false,
                trending: false,
                tags: ["video", "social", "editor", "download"]
            }
        ];
        
        this.updateCategoryCounts();
        this.filteredApks = [...this.apks];
        console.log('Demo data loaded:', this.apks.length, 'APKs');
    }

    updateCategoryCounts() {
        this.categories.forEach(category => {
            category.count = this.apks.filter(apk => apk.category === category.name).length;
        });
    }

    formatApkFromDatabase(dbApk) {
        return {
            id: dbApk.id,
            name: dbApk.name,
            version: dbApk.version,
            packageName: dbApk.package_name,
            category: dbApk.category,
            description: dbApk.description,
            downloadUrl: dbApk.download_url,
            iconUrl: dbApk.icon_url || `https://via.placeholder.com/64x64/cccccc/ffffff?text=${dbApk.name.charAt(0)}`,
            fileSize: dbApk.file_size,
            androidVersion: dbApk.android_version,
            downloadCount: dbApk.download_count || 0,
            rating: dbApk.rating || 4.5,
            reviewCount: dbApk.review_count || 0,
            permissions: dbApk.permissions || [],
            features: dbApk.features || [],
            tags: dbApk.tags || [],
            verified: dbApk.verified || false,
            featured: dbApk.featured || false,
            trending: dbApk.trending || false,
            lastUpdated: dbApk.last_updated,
            createdAt: dbApk.created_at
        };
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.attachEventListeners());
        } else {
            this.attachEventListeners();
        }
    }

    attachEventListeners() {
        console.log('Attaching event listeners...');
        
        // Setup wizard events
        this.setupWizardEventListeners();
        
        // Main app events
        this.setupMainAppEventListeners();
        
        console.log('Event listeners attached');
    }

    setupWizardEventListeners() {
        // Setup form submission
        const setupForm = document.getElementById('supabaseConfigForm');
        if (setupForm) {
            setupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Setup form submitted');
                this.handleSupabaseConfig(e);
            });
        }
        
        // Copy SQL button
        const copySQLBtn = document.getElementById('copySQLBtn');
        if (copySQLBtn) {
            copySQLBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.copySQLScript();
            });
        }
        
        // Demo mode button
        const demoModeBtn = document.getElementById('demoModeBtn');
        if (demoModeBtn) {
            demoModeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Demo mode button clicked');
                this.enableDemoMode();
            });
        }
    }

    setupMainAppEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }
        
        // Authentication buttons
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('loginModal');
            });
        }
        
        if (signupBtn) {
            signupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('signupModal');
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        
        // Social login buttons
        const googleLoginBtn = document.getElementById('googleLoginBtn');
        const githubLoginBtn = document.getElementById('githubLoginBtn');
        
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', () => this.socialLogin('google'));
        }
        
        if (githubLoginBtn) {
            githubLoginBtn.addEventListener('click', () => this.socialLogin('github'));
        }
        
        // Auth forms
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }
        
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                console.log('Search input:', e.target.value);
                this.handleSearch(e.target.value);
            });
            searchInput.addEventListener('keyup', (e) => {
                console.log('Search keyup:', e.target.value);
                this.handleSearch(e.target.value);
            });
        }
        
        // Filter controls
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');
        const filterToggle = document.getElementById('filterToggle');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (sortFilter) {
            sortFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (filterToggle) {
            filterToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAdvancedFilters();
            });
        }
        
        // View controls
        const gridView = document.getElementById('gridView');
        const listView = document.getElementById('listView');
        
        if (gridView) {
            gridView.addEventListener('click', () => this.setViewMode('grid'));
        }
        
        if (listView) {
            listView.addEventListener('click', () => this.setViewMode('list'));
        }
        
        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMore());
        }
        
        // Admin panel
        const adminPanelBtn = document.getElementById('adminPanelBtn');
        const closeAdminPanel = document.getElementById('closeAdminPanel');
        
        if (adminPanelBtn) {
            adminPanelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAdminPanel();
            });
        }
        
        if (closeAdminPanel) {
            closeAdminPanel.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideAdminPanel();
            });
        }
        
        // Admin navigation
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const panel = e.target.dataset.panel || e.target.closest('.admin-nav-btn').dataset.panel;
                this.switchAdminPanel(panel);
            });
        });
        
        // Modal close handlers
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.hideModal(modal.id);
                }
            });
        });
        
        // Close modals on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
        
        // Download modal controls
        const pauseDownloadBtn = document.getElementById('pauseDownloadBtn');
        const cancelDownloadBtn = document.getElementById('cancelDownloadBtn');
        
        if (pauseDownloadBtn) {
            pauseDownloadBtn.addEventListener('click', () => this.pauseDownload());
        }
        
        if (cancelDownloadBtn) {
            cancelDownloadBtn.addEventListener('click', () => this.cancelDownload());
        }
        
        // Close deployment info
        const closeDeploymentInfo = document.getElementById('closeDeploymentInfo');
        if (closeDeploymentInfo) {
            closeDeploymentInfo.addEventListener('click', () => {
                document.getElementById('deploymentInfo').classList.add('hidden');
            });
        }
    }

    async handleSupabaseConfig(e) {
        e.preventDefault();
        
        const url = document.getElementById('supabaseUrl').value.trim();
        const key = document.getElementById('supabaseKey').value.trim();
        
        if (!url || !key) {
            this.showToast('Please provide both URL and API key', 'error');
            return;
        }
        
        // Save configuration
        localStorage.setItem('modapk_supabase_url', url);
        localStorage.setItem('modapk_supabase_key', key);
        localStorage.removeItem('modapk_demo_mode');
        
        this.config.supabaseUrl = url;
        this.config.supabaseKey = key;
        this.config.demoMode = false;
        
        // Initialize platform with Supabase
        await this.initializePlatform();
        
        if (this.isOnline) {
            // Show deployment info
            setTimeout(() => {
                document.getElementById('deploymentInfo').classList.remove('hidden');
            }, 2000);
        }
    }

    copySQLScript() {
        const sqlElement = document.querySelector('.sql-script code');
        if (sqlElement) {
            navigator.clipboard.writeText(sqlElement.textContent).then(() => {
                this.showToast('SQL script copied to clipboard!', 'success');
            }).catch(() => {
                this.showToast('Failed to copy SQL script', 'error');
            });
        }
    }

    enableDemoMode() {
        console.log('Enabling demo mode...');
        localStorage.setItem('modapk_demo_mode', 'true');
        this.config.demoMode = true;
        
        // Initialize platform in demo mode
        this.initializePlatform().then(() => {
            console.log('Demo mode initialized');
        });
    }

    handleSearch(query) {
        console.log('Handling search for:', query);
        
        if (!query.trim()) {
            this.filteredApks = [...this.apks];
        } else {
            this.filteredApks = this.apks.filter(apk => 
                apk.name.toLowerCase().includes(query.toLowerCase()) ||
                apk.description.toLowerCase().includes(query.toLowerCase()) ||
                apk.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
                apk.features.some(feature => feature.toLowerCase().includes(query.toLowerCase()))
            );
        }
        
        console.log('Filtered results:', this.filteredApks.length);
        
        this.currentPage = 1;
        this.renderAPKs();
        
        const sectionTitle = document.getElementById('sectionTitle');
        if (sectionTitle) {
            sectionTitle.textContent = query ? `Search Results for "${query}" (${this.filteredApks.length})` : 'Featured Apps';
        }
    }

    renderCategories() {
        const grid = document.getElementById('categoriesGrid');
        const filter = document.getElementById('categoryFilter');
        
        if (!grid || !filter) return;
        
        console.log('Rendering categories:', this.categories.length);
        
        grid.innerHTML = '';
        filter.innerHTML = '<option value="">All Categories</option>';
        
        this.categories.forEach(category => {
            // Category card
            const card = document.createElement('div');
            card.className = 'category-card';
            card.style.borderColor = category.color;
            card.innerHTML = `
                <i class="${category.icon} category-icon" style="color: ${category.color}"></i>
                <div class="category-name">${category.name}</div>
                <div class="category-count">${category.count} apps</div>
            `;
            card.addEventListener('click', () => this.filterByCategory(category.name));
            grid.appendChild(card);
            
            // Filter option
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            filter.appendChild(option);
        });
    }

    renderAPKs() {
        const grid = document.getElementById('apksGrid');
        const loadingSpinner = document.getElementById('loadingSpinner');
        
        if (!grid) return;
        
        console.log('Rendering APKs:', this.filteredApks.length);
        
        if (loadingSpinner) loadingSpinner.classList.remove('hidden');
        
        setTimeout(() => {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            
            if (this.currentPage === 1) {
                grid.innerHTML = '';
            }
            
            const newApks = this.filteredApks.slice(startIndex, endIndex);
            console.log('Rendering APKs slice:', newApks.length);
            
            newApks.forEach(apk => {
                const card = this.createAPKCard(apk);
                grid.appendChild(card);
            });
            
            if (loadingSpinner) loadingSpinner.classList.add('hidden');
            
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                if (endIndex >= this.filteredApks.length) {
                    loadMoreBtn.style.display = 'none';
                } else {
                    loadMoreBtn.style.display = 'block';
                }
            }
        }, 300);
    }

    createAPKCard(apk) {
        const card = document.createElement('div');
        card.className = 'apk-card';
        
        const badges = [];
        if (apk.verified) badges.push('<span class="badge badge--verified">Verified</span>');
        if (apk.featured) badges.push('<span class="badge badge--featured">Featured</span>');
        if (apk.trending) badges.push('<span class="badge badge--trending">Trending</span>');
        
        const stars = '★'.repeat(Math.floor(apk.rating)) + '☆'.repeat(5 - Math.floor(apk.rating));
        
        card.innerHTML = `
            <div class="apk-header">
                <div class="apk-badges">${badges.join('')}</div>
                <img src="${apk.iconUrl}" alt="${apk.name}" class="apk-icon" onerror="this.src='https://via.placeholder.com/64x64/cccccc/ffffff?text=APK'">
                <div class="apk-info">
                    <h4>${apk.name}</h4>
                    <div class="apk-version">v${apk.version}</div>
                    <span class="apk-category">${apk.category}</span>
                </div>
            </div>
            <div class="apk-body">
                <p class="apk-description">${apk.description}</p>
                <div class="apk-features">
                    ${apk.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
                <div class="apk-stats">
                    <div class="apk-rating">
                        <span class="stars">${stars}</span>
                        <span>${apk.rating} (${apk.reviewCount.toLocaleString()})</span>
                    </div>
                    <div>${apk.downloadCount.toLocaleString()} downloads</div>
                </div>
            </div>
            <div class="apk-footer">
                <button class="download-btn" data-apk-id="${apk.id}">
                    <i class="fas fa-download"></i> Download
                </button>
                <span class="apk-size">${apk.fileSize}</span>
            </div>
        `;
        
        const downloadBtn = card.querySelector('.download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Download button clicked for APK:', apk.id);
                this.startDownload(apk.id);
            });
        }
        
        return card;
    }

    async startDownload(apkId) {
        const apk = this.apks.find(a => a.id === apkId);
        if (!apk) {
            console.error('APK not found:', apkId);
            return;
        }
        
        console.log('Starting download for:', apk.name);
        
        // Record download
        if (this.isOnline && this.supabase && this.currentUser) {
            try {
                await this.supabase
                    .from('downloads')
                    .insert([{
                        apk_id: apkId,
                        user_id: this.currentUser.id
                    }]);
                
                // Update download count
                await this.supabase
                    .from('apks')
                    .update({ download_count: apk.downloadCount + 1 })
                    .eq('id', apkId);
                
            } catch (error) {
                console.error('Error recording download:', error);
            }
        } else {
            // Update local count in demo mode
            apk.downloadCount++;
        }
        
        this.showDownloadModal(apk);
        this.simulateDownload(apk);
        this.updateStats();
    }

    showDownloadModal(apk) {
        const modal = document.getElementById('downloadModal');
        const appIcon = document.getElementById('downloadAppIcon');
        const appName = document.getElementById('downloadAppName');
        const appSize = document.getElementById('downloadAppSize');
        
        if (!modal || !appIcon || !appName || !appSize) {
            console.error('Download modal elements not found');
            return;
        }
        
        appIcon.src = apk.iconUrl;
        appIcon.onerror = () => {
            appIcon.src = 'https://via.placeholder.com/64x64/cccccc/ffffff?text=APK';
        };
        appName.textContent = apk.name;
        appSize.textContent = apk.fileSize;
        
        const progressBar = document.getElementById('downloadProgressBar');
        const percentage = document.getElementById('downloadPercentage');
        const speed = document.getElementById('downloadSpeed');
        
        if (progressBar) progressBar.style.width = '0%';
        if (percentage) percentage.textContent = '0%';
        if (speed) speed.textContent = '0 KB/s';
        
        this.showModal('downloadModal');
        console.log('Download modal shown');
    }

    simulateDownload(apk) {
        const progressBar = document.getElementById('downloadProgressBar');
        const percentage = document.getElementById('downloadPercentage');
        const speed = document.getElementById('downloadSpeed');
        
        if (!progressBar || !percentage || !speed) {
            console.error('Download progress elements not found');
            return;
        }
        
        let progress = 0;
        this.currentDownloadInterval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress > 100) progress = 100;
            
            progressBar.style.width = `${progress}%`;
            percentage.textContent = `${Math.floor(progress)}%`;
            speed.textContent = `${(Math.random() * 5 + 1).toFixed(1)} MB/s`;
            
            if (progress >= 100) {
                clearInterval(this.currentDownloadInterval);
                setTimeout(() => {
                    this.hideModal('downloadModal');
                    this.showToast(`${apk.name} downloaded successfully!`, 'success');
                    
                    const link = document.createElement('a');
                    link.href = apk.downloadUrl;
                    link.download = `${apk.name}_v${apk.version}.apk`;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }, 1000);
            }
        }, 300);
    }

    pauseDownload() {
        if (this.currentDownloadInterval) {
            clearInterval(this.currentDownloadInterval);
            this.showToast('Download paused', 'warning');
        }
    }

    cancelDownload() {
        if (this.currentDownloadInterval) {
            clearInterval(this.currentDownloadInterval);
        }
        this.hideModal('downloadModal');
        this.showToast('Download cancelled', 'error');
    }

    filterByCategory(category) {
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = category;
        }
        this.applyFilters();
        const sectionTitle = document.getElementById('sectionTitle');
        if (sectionTitle) {
            sectionTitle.textContent = `${category} Apps`;
        }
    }

    applyFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');
        
        const categoryValue = categoryFilter ? categoryFilter.value : '';
        const sortValue = sortFilter ? sortFilter.value : 'downloads';
        
        this.filteredApks = [...this.apks];
        
        if (categoryValue) {
            this.filteredApks = this.filteredApks.filter(apk => apk.category === categoryValue);
        }
        
        switch (sortValue) {
            case 'downloads':
                this.filteredApks.sort((a, b) => b.downloadCount - a.downloadCount);
                break;
            case 'rating':
                this.filteredApks.sort((a, b) => b.rating - a.rating);
                break;
            case 'date':
                this.filteredApks.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
                break;
            case 'name':
                this.filteredApks.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
        
        this.currentPage = 1;
        this.renderAPKs();
    }

    toggleAdvancedFilters() {
        const filters = document.getElementById('advancedFilters');
        if (!filters) return;
        
        filters.classList.toggle('hidden');
        
        const toggleBtn = document.getElementById('filterToggle');
        if (toggleBtn) {
            if (filters.classList.contains('hidden')) {
                toggleBtn.innerHTML = '<i class="fas fa-filter"></i> Advanced Filters';
            } else {
                toggleBtn.innerHTML = '<i class="fas fa-times"></i> Hide Filters';
            }
        }
    }

    setViewMode(mode) {
        const grid = document.getElementById('apksGrid');
        const gridBtn = document.getElementById('gridView');
        const listBtn = document.getElementById('listView');
        
        if (!grid || !gridBtn || !listBtn) return;
        
        if (mode === 'list') {
            grid.classList.add('list-view');
            gridBtn.classList.remove('active');
            listBtn.classList.add('active');
        } else {
            grid.classList.remove('list-view');
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
        }
    }

    loadMore() {
        this.currentPage++;
        this.renderAPKs();
    }

    updateStats() {
        const totalApks = document.getElementById('totalApks');
        const totalDownloads = document.getElementById('totalDownloads');
        const adminTotalApks = document.getElementById('adminTotalApks');
        const adminTotalDownloads = document.getElementById('adminTotalDownloads');
        
        const totalDownloadCount = this.apks.reduce((sum, apk) => sum + apk.downloadCount, 0);
        
        if (totalApks) totalApks.textContent = this.apks.length.toLocaleString();
        if (totalDownloads) totalDownloads.textContent = (totalDownloadCount / 1000000).toFixed(1) + 'M';
        if (adminTotalApks) adminTotalApks.textContent = this.apks.length.toLocaleString();
        if (adminTotalDownloads) adminTotalDownloads.textContent = totalDownloadCount.toLocaleString();
    }

    // Authentication methods (simplified for brevity)
    async checkAuthState() {
        // Implementation for checking auth state
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        // Demo mode login
        this.currentUser = {
            id: 'demo-user',
            email: email,
            username: email.split('@')[0],
            role: email === 'admin@modapk.com' ? 'admin' : 'user',
            isAdmin: email === 'admin@modapk.com'
        };
        
        this.updateAuthUI();
        this.hideModal('loginModal');
        this.showToast('Logged in successfully!', 'success');
        document.getElementById('loginForm').reset();
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const username = document.getElementById('signupUsername').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        
        this.currentUser = {
            id: 'demo-user-' + Date.now(),
            email: email,
            username: username,
            role: 'user',
            isAdmin: false
        };
        
        this.updateAuthUI();
        this.hideModal('signupModal');
        this.showToast('Account created successfully!', 'success');
        document.getElementById('signupForm').reset();
    }

    async socialLogin(provider) {
        this.showToast(`${provider} login requires online mode`, 'warning');
    }

    async logout() {
        this.currentUser = null;
        this.updateAuthUI();
        this.hideAdminPanel();
        this.showToast('Logged out successfully', 'success');
    }

    updateAuthUI() {
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const userMenu = document.getElementById('userMenu');
        const adminPanelBtn = document.getElementById('adminPanelBtn');
        const userName = document.getElementById('userName');
        
        if (this.currentUser) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (signupBtn) signupBtn.classList.add('hidden');
            if (userMenu) userMenu.classList.remove('hidden');
            if (userName) userName.textContent = this.currentUser.username;
            
            if (this.currentUser.isAdmin) {
                if (adminPanelBtn) adminPanelBtn.classList.remove('hidden');
            }
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (signupBtn) signupBtn.classList.remove('hidden');
            if (userMenu) userMenu.classList.add('hidden');
            if (adminPanelBtn) adminPanelBtn.classList.add('hidden');
        }
    }

    // Admin panel methods (simplified)
    showAdminPanel() {
        if (!this.currentUser || !this.currentUser.isAdmin) {
            this.showToast('Access denied. Admin privileges required.', 'error');
            return;
        }
        
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.classList.remove('hidden');
        }
    }

    hideAdminPanel() {
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.classList.add('hidden');
        }
    }

    switchAdminPanel(panelName) {
        // Implementation for switching admin panels
    }

    // Utility methods
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }

    toggleTheme() {
        const currentScheme = document.documentElement.getAttribute('data-color-scheme');
        const newScheme = currentScheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-color-scheme', newScheme);
        localStorage.setItem('modapk_theme', newScheme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = newScheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('modapk_theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-color-scheme', savedTheme);
            const themeIcon = document.querySelector('#themeToggle i');
            if (themeIcon) {
                themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="${iconMap[type]} toast-icon"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        `;
        
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => toast.remove());
        }
        
        container.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
        
        console.log('Toast shown:', message, type);
    }

    // Real-time methods (for online mode)
    setupRealtimeSubscriptions() {
        // Implementation for real-time subscriptions
    }

    handleApkChange(payload) {
        // Implementation for handling APK changes
    }
}

// Initialize the platform
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Online ModAPK Platform...');
    window.modapk = new OnlineModAPKPlatform();
});

if (document.readyState !== 'loading') {
    console.log('Document already loaded, initializing Online ModAPK Platform...');
    window.modapk = new OnlineModAPKPlatform();
}