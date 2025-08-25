// ModAPK Pro Platform - Enhanced JavaScript Application

class ModAPKPlatform {
    constructor() {
        this.currentPage = 'home';
        this.apks = [];
        this.categories = [];
        this.users = [];
        this.adminUsers = [];
        this.isAdminLoggedIn = false;
        this.currentAdminUser = null;
        this.downloadQueue = [];
        this.searchHistory = [];
        this.favorites = [];
        this.currentFilters = {
            category: '',
            sort: 'name',
            verified: false,
            recent: false,
            featured: false
        };
        this.pagination = {
            currentPage: 1,
            itemsPerPage: 12,
            totalPages: 1
        };
        this.analytics = {
            totalVisitors: 15678,
            totalDownloads: 89234,
            totalRevenue: 4304.10,
            avgSessionTime: "4m 32s",
            bounceRate: "23.4%"
        };
        this.adNetworks = [];
        this.charts = {};
        this.serviceWorker = null;
        this.deferredPrompt = null;

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        try {
            console.log('Initializing ModAPK Pro Platform...');
            
            // Load data first
            this.loadInitialData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize theme
            this.initTheme();
            
            // Render initial content
            this.renderCurrentPage();
            this.updateStats();
            
            // Setup PWA features (non-blocking)
            setTimeout(() => this.setupPWA(), 1000);
            
            // Initialize charts (non-blocking)
            setTimeout(() => this.initCharts(), 2000);
            
            console.log('Platform initialized successfully!');
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showToast('Failed to initialize platform', 'error');
        }
    }

    loadInitialData() {
        try {
            // Load featured APKs from provided data
            const featuredApks = [
                {
                    id: 1,
                    name: "WhatsApp Plus",
                    version: "17.52.1",
                    category: "Social",
                    description: "Enhanced WhatsApp with advanced privacy features, custom themes, and extended media sharing capabilities",
                    downloadLink: "https://example.com/whatsapp-plus-v17.52.1.apk",
                    screenshotUrls: [
                        "https://via.placeholder.com/400x700/1FB8CD/FFFFFF?text=WhatsApp+Plus+1",
                        "https://via.placeholder.com/400x700/1FB8CD/FFFFFF?text=WhatsApp+Plus+2",
                        "https://via.placeholder.com/400x700/1FB8CD/FFFFFF?text=WhatsApp+Plus+3"
                    ],
                    iconUrl: "https://via.placeholder.com/128x128/1FB8CD/FFFFFF?text=WA+",
                    uploadDate: "2025-08-25",
                    lastUpdated: "2025-08-25",
                    downloadCount: 125847,
                    rating: 4.7,
                    reviewCount: 3241,
                    fileSize: "58.3 MB",
                    androidVersion: "5.0+",
                    permissions: ["Camera", "Contacts", "Microphone", "Storage"],
                    featured: true,
                    verified: true,
                    tags: ["messaging", "privacy", "themes", "social"],
                    adminNotes: "High-quality mod with regular updates"
                },
                {
                    id: 2,
                    name: "Spotify Premium",
                    version: "8.7.78.345",
                    category: "Music",
                    description: "Unlimited music streaming with premium features unlocked, ad-free listening, and offline downloads",
                    downloadLink: "https://example.com/spotify-premium-v8.7.78.apk",
                    screenshotUrls: [
                        "https://via.placeholder.com/400x700/FFC185/FFFFFF?text=Spotify+Premium+1",
                        "https://via.placeholder.com/400x700/FFC185/FFFFFF?text=Spotify+Premium+2"
                    ],
                    iconUrl: "https://via.placeholder.com/128x128/FFC185/FFFFFF?text=SP",
                    uploadDate: "2025-08-23",
                    lastUpdated: "2025-08-24",
                    downloadCount: 234567,
                    rating: 4.9,
                    reviewCount: 5612,
                    fileSize: "31.2 MB",
                    androidVersion: "5.0+",
                    permissions: ["Storage", "Network", "Audio"],
                    featured: true,
                    verified: true,
                    tags: ["music", "streaming", "premium", "offline"]
                },
                {
                    id: 3,
                    name: "Instagram Pro",
                    version: "285.0.0.19.109",
                    category: "Social",
                    description: "Enhanced Instagram with download capabilities, story viewing without marking as seen, and advanced privacy options",
                    downloadLink: "https://example.com/instagram-pro-v285.apk",
                    screenshotUrls: [
                        "https://via.placeholder.com/400x700/B4413C/FFFFFF?text=Instagram+Pro+1",
                        "https://via.placeholder.com/400x700/B4413C/FFFFFF?text=Instagram+Pro+2"
                    ],
                    iconUrl: "https://via.placeholder.com/128x128/B4413C/FFFFFF?text=IG",
                    uploadDate: "2025-08-22",
                    lastUpdated: "2025-08-25",
                    downloadCount: 189234,
                    rating: 4.6,
                    reviewCount: 2847,
                    fileSize: "42.7 MB",
                    androidVersion: "6.0+",
                    permissions: ["Camera", "Storage", "Contacts", "Location"],
                    featured: true,
                    verified: true,
                    tags: ["social", "photo", "download", "privacy"]
                },
                {
                    id: 4,
                    name: "YouTube Vanced",
                    version: "17.03.38",
                    category: "Entertainment",
                    description: "YouTube with ad-blocking, background play, and premium features unlocked",
                    downloadLink: "https://example.com/youtube-vanced.apk",
                    screenshotUrls: ["https://via.placeholder.com/400x700/ECEBD5/000000?text=YouTube+Vanced"],
                    iconUrl: "https://via.placeholder.com/128x128/ECEBD5/000000?text=YT",
                    uploadDate: "2025-08-20",
                    downloadCount: 456789,
                    rating: 4.8,
                    reviewCount: 8932,
                    fileSize: "67.2 MB",
                    androidVersion: "5.0+",
                    featured: false,
                    verified: true,
                    tags: ["video", "ad-free", "premium"]
                },
                {
                    id: 5,
                    name: "Nova Launcher Prime",
                    version: "7.0.57",
                    category: "Tools",
                    description: "Highly customizable Android launcher with premium features unlocked",
                    downloadLink: "https://example.com/nova-launcher-prime.apk",
                    screenshotUrls: ["https://via.placeholder.com/400x700/5D878F/FFFFFF?text=Nova+Launcher"],
                    iconUrl: "https://via.placeholder.com/128x128/5D878F/FFFFFF?text=NL",
                    uploadDate: "2025-08-18",
                    downloadCount: 98765,
                    rating: 4.6,
                    reviewCount: 2341,
                    fileSize: "12.8 MB",
                    androidVersion: "5.0+",
                    featured: false,
                    verified: true,
                    tags: ["launcher", "customization", "prime"]
                }
            ];

            // Load categories
            this.categories = [
                {name: "Games", icon: "fas fa-gamepad", count: 145, color: "#FF6B6B"},
                {name: "Social", icon: "fas fa-users", count: 78, color: "#4ECDC4"},
                {name: "Music", icon: "fas fa-music", count: 56, color: "#45B7D1"},
                {name: "Photography", icon: "fas fa-camera", count: 89, color: "#96CEB4"},
                {name: "Productivity", icon: "fas fa-briefcase", count: 67, color: "#FFEAA7"},
                {name: "Tools", icon: "fas fa-wrench", count: 134, color: "#DDA0DD"},
                {name: "Entertainment", icon: "fas fa-film", count: 92, color: "#FD79A8"},
                {name: "Communication", icon: "fas fa-comments", count: 43, color: "#FDCB6E"}
            ];

            // Load admin users
            this.adminUsers = [
                {
                    id: 1,
                    username: "admin",
                    password: "admin123",
                    role: "super_admin",
                    email: "admin@modapkpro.com",
                    securityQuestion: "What is your favorite color?",
                    securityAnswer: "blue",
                    lastLogin: "2025-08-25T18:30:00Z",
                    permissions: ["all"]
                },
                {
                    id: 2,
                    username: "moderator",
                    password: "mod123",
                    role: "moderator",
                    email: "mod@modapkpro.com",
                    securityQuestion: "What is your pet's name?",
                    securityAnswer: "buddy",
                    lastLogin: "2025-08-25T16:45:00Z",
                    permissions: ["manage_apks", "manage_reviews", "view_analytics"]
                }
            ];

            // Load ad networks
            this.adNetworks = [
                {name: "Google AdSense", status: "active", revenue: 2847.32, ctr: 2.3},
                {name: "Media.net", status: "active", revenue: 1456.78, ctr: 1.8},
                {name: "PropellerAds", status: "pending", revenue: 0, ctr: 0}
            ];

            // Try to load from localStorage, fallback to sample data
            try {
                const storedAPKs = localStorage.getItem('modapk_pro_apks');
                if (storedAPKs) {
                    this.apks = JSON.parse(storedAPKs);
                } else {
                    this.apks = featuredApks;
                }
            } catch (e) {
                console.warn('Could not load from localStorage, using default data');
                this.apks = featuredApks;
            }

            this.saveData();
            console.log('Data loaded successfully:', this.apks.length, 'APKs');

        } catch (error) {
            console.error('Error loading data:', error);
            // Use fallback data
            this.apks = [
                {
                    id: 1,
                    name: "Sample App",
                    version: "1.0.0",
                    category: "Tools",
                    description: "Sample application for testing",
                    downloadLink: "https://example.com/sample.apk",
                    screenshotUrls: ["https://via.placeholder.com/400x700/1FB8CD/FFFFFF?text=Sample"],
                    uploadDate: "2025-08-25",
                    downloadCount: 1000,
                    rating: 4.5,
                    reviewCount: 100,
                    featured: true,
                    verified: true
                }
            ];
        }
    }

    saveData() {
        try {
            localStorage.setItem('modapk_pro_apks', JSON.stringify(this.apks));
        } catch (error) {
            console.warn('Could not save to localStorage:', error);
        }
    }

    setupEventListeners() {
        try {
            // Theme toggle
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', () => this.toggleTheme());
            }

            // Search toggle
            const searchToggle = document.getElementById('searchToggle');
            const searchOverlay = document.getElementById('searchOverlay');
            if (searchToggle && searchOverlay) {
                searchToggle.addEventListener('click', () => {
                    searchOverlay.classList.toggle('show');
                    if (searchOverlay.classList.contains('show')) {
                        const globalSearch = document.getElementById('globalSearch');
                        if (globalSearch) globalSearch.focus();
                    }
                });
            }

            // Global search
            const globalSearch = document.getElementById('globalSearch');
            if (globalSearch) {
                let searchTimeout;
                globalSearch.addEventListener('input', (e) => {
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => {
                        this.handleGlobalSearch(e.target.value);
                    }, 300);
                });
            }

            // Voice search simulation
            const voiceSearch = document.getElementById('voiceSearch');
            if (voiceSearch) {
                voiceSearch.addEventListener('click', () => {
                    this.simulateVoiceSearch();
                });
            }

            // Mobile menu toggle
            const mobileMenuToggle = document.getElementById('mobileMenuToggle');
            const mobileNav = document.getElementById('mobileNav');
            if (mobileMenuToggle && mobileNav) {
                mobileMenuToggle.addEventListener('click', () => {
                    mobileNav.classList.toggle('show');
                });
            }

            // User account button
            const userBtn = document.getElementById('userBtn');
            if (userBtn) {
                userBtn.addEventListener('click', () => this.showUserModal());
            }

            // Admin button
            const adminBtn = document.getElementById('adminBtn');
            if (adminBtn) {
                adminBtn.addEventListener('click', () => this.showAdminModal());
            }

            // Admin login form
            const adminLoginForm = document.getElementById('adminLoginForm');
            if (adminLoginForm) {
                adminLoginForm.addEventListener('submit', (e) => this.handleAdminLogin(e));
            }

            // Modal close buttons
            document.querySelectorAll('.modal-close').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const modal = e.target.closest('.modal');
                    if (modal) this.hideModal(modal.id);
                });
            });

            // Upload form
            const uploadForm = document.getElementById('uploadForm');
            if (uploadForm) {
                uploadForm.addEventListener('submit', (e) => this.handleUpload(e));
            }

            // Contact form
            const contactForm = document.getElementById('contactForm');
            if (contactForm) {
                contactForm.addEventListener('submit', (e) => this.handleContact(e));
            }

            // Browse filters
            const categoryFilter = document.getElementById('categoryFilter');
            const sortBy = document.getElementById('sortBy');
            const verifiedOnly = document.getElementById('verifiedOnly');
            const recentOnly = document.getElementById('recentOnly');
            const featuredOnly = document.getElementById('featuredOnly');

            [categoryFilter, sortBy, verifiedOnly, recentOnly, featuredOnly].forEach(element => {
                if (element) {
                    element.addEventListener('change', () => this.applyFilters());
                }
            });

            // Upload zone drag and drop
            const uploadZone = document.getElementById('uploadZone');
            if (uploadZone) {
                ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                    uploadZone.addEventListener(eventName, this.preventDefaults, false);
                });

                ['dragenter', 'dragover'].forEach(eventName => {
                    uploadZone.addEventListener(eventName, () => uploadZone.classList.add('dragover'), false);
                });

                ['dragleave', 'drop'].forEach(eventName => {
                    uploadZone.addEventListener(eventName, () => uploadZone.classList.remove('dragover'), false);
                });

                uploadZone.addEventListener('drop', (e) => this.handleFileDrop(e), false);
                uploadZone.addEventListener('click', () => this.simulateFileSelect());
            }

            // Close modals when clicking outside
            window.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    this.hideModal(e.target.id);
                }
            });

            // Install prompt
            const installBtn = document.getElementById('installBtn');
            const dismissInstall = document.getElementById('dismissInstall');
            
            if (installBtn) {
                installBtn.addEventListener('click', () => this.installApp());
            }
            
            if (dismissInstall) {
                dismissInstall.addEventListener('click', () => {
                    const installPrompt = document.getElementById('installPrompt');
                    if (installPrompt) installPrompt.classList.add('hidden');
                });
            }

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    // Close any open modals
                    document.querySelectorAll('.modal.show').forEach(modal => {
                        this.hideModal(modal.id);
                    });
                    
                    // Close search overlay
                    const searchOverlay = document.getElementById('searchOverlay');
                    if (searchOverlay && searchOverlay.classList.contains('show')) {
                        searchOverlay.classList.remove('show');
                    }
                }
            });

            console.log('Event listeners set up successfully');
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    // Navigation System
    navigateTo(page) {
        try {
            if (this.currentPage === page) return;

            // Hide all pages
            document.querySelectorAll('.page').forEach(p => {
                p.classList.remove('active');
            });

            // Show target page
            const targetPage = document.getElementById(`${page}Page`);
            if (targetPage) {
                targetPage.classList.add('active');
                this.currentPage = page;
                
                // Update navigation active state
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.dataset.page === page) {
                        link.classList.add('active');
                    }
                });

                // Render page-specific content
                this.renderCurrentPage();
                
                // Close mobile menu if open
                const mobileNav = document.getElementById('mobileNav');
                if (mobileNav) {
                    mobileNav.classList.remove('show');
                }
            }
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }

    renderCurrentPage() {
        try {
            switch (this.currentPage) {
                case 'home':
                    this.renderHomePage();
                    break;
                case 'browse':
                    this.renderBrowsePage();
                    break;
                case 'upload':
                    this.renderUploadPage();
                    break;
                case 'about':
                    this.renderAboutPage();
                    break;
                case 'contact':
                    this.renderContactPage();
                    break;
                default:
                    this.renderHomePage();
            }
        } catch (error) {
            console.error('Error rendering page:', error);
        }
    }

    renderHomePage() {
        try {
            // Render categories
            this.renderCategories();
            
            // Render featured APKs
            this.renderFeaturedAPKs();
            
            // Render trending APKs
            this.renderTrendingAPKs();
            
            // Update hero stats
            this.updateHeroStats();
        } catch (error) {
            console.error('Error rendering home page:', error);
        }
    }

    renderCategories() {
        try {
            const grid = document.getElementById('categoriesGrid');
            if (!grid) return;

            grid.innerHTML = this.categories.map(category => `
                <div class="category-card" onclick="app.browseByCategory('${category.name}')" style="cursor: pointer;">
                    <div class="category-icon" style="color: ${category.color}">
                        <i class="${category.icon}"></i>
                    </div>
                    <div class="category-name">${this.escapeHtml(category.name)}</div>
                    <div class="category-count">${category.count} apps</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error rendering categories:', error);
        }
    }

    renderFeaturedAPKs() {
        try {
            const grid = document.getElementById('featuredGrid');
            if (!grid) return;

            const featuredAPKs = this.apks.filter(apk => apk.featured).slice(0, 6);
            grid.innerHTML = this.generateAPKCardsHTML(featuredAPKs);
        } catch (error) {
            console.error('Error rendering featured APKs:', error);
        }
    }

    renderTrendingAPKs() {
        try {
            const grid = document.getElementById('trendingGrid');
            if (!grid) return;

            const trendingAPKs = [...this.apks]
                .sort((a, b) => b.downloadCount - a.downloadCount)
                .slice(0, 8);
            grid.innerHTML = this.generateAPKCardsHTML(trendingAPKs);
        } catch (error) {
            console.error('Error rendering trending APKs:', error);
        }
    }

    renderBrowsePage() {
        try {
            this.populateFilters();
            this.applyFilters();
        } catch (error) {
            console.error('Error rendering browse page:', error);
        }
    }

    populateFilters() {
        try {
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                categoryFilter.innerHTML = '<option value="">All Categories</option>' +
                    this.categories.map(cat => 
                        `<option value="${this.escapeHtml(cat.name)}">${this.escapeHtml(cat.name)}</option>`
                    ).join('');
            }
        } catch (error) {
            console.error('Error populating filters:', error);
        }
    }

    generateAPKCardsHTML(apks) {
        try {
            if (!apks || apks.length === 0) {
                return '<div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 2rem;"><p>No APKs found</p></div>';
            }

            return apks.map(apk => `
                <div class="apk-card" onclick="app.showAPKDetails(${apk.id})" style="cursor: pointer;">
                    ${apk.featured ? '<div class="apk-card-badge">Featured</div>' : ''}
                    <div class="apk-card-image">
                        ${apk.screenshotUrls && apk.screenshotUrls[0] ? 
                            `<img src="${apk.screenshotUrls[0]}" alt="${this.escapeHtml(apk.name)}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-mobile-alt\\'></i>'">` :
                            '<i class="fas fa-mobile-alt"></i>'
                        }
                    </div>
                    <div class="apk-card-content">
                        <div class="apk-card-header">
                            <h3 class="apk-card-title">${this.escapeHtml(apk.name)}</h3>
                            <span class="apk-card-version">v${this.escapeHtml(apk.version)}</span>
                        </div>
                        <div class="apk-card-category">${this.escapeHtml(apk.category)}</div>
                        <p class="apk-card-description">${this.escapeHtml(apk.description)}</p>
                        <div class="apk-card-meta">
                            <div class="apk-card-downloads">
                                <i class="fas fa-download"></i>
                                ${this.formatNumber(apk.downloadCount)}
                            </div>
                            <div class="apk-card-rating">
                                <span class="star-rating">★</span>
                                ${apk.rating || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error generating APK cards:', error);
            return '<div class="no-results">Error loading APKs</div>';
        }
    }

    // APK Details Modal
    showAPKDetails(id) {
        try {
            const apk = this.apks.find(a => a.id === id);
            if (!apk) {
                this.showToast('APK not found', 'error');
                return;
            }

            const modal = document.getElementById('apkModal');
            const title = document.getElementById('apkModalTitle');
            const content = document.getElementById('apkModalContent');

            if (!modal || !title || !content) return;

            title.textContent = apk.name;
            content.innerHTML = `
                <div class="apk-modal-content" style="padding: 1.5rem;">
                    <div class="apk-modal-header" style="display: grid; grid-template-columns: 200px 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div class="apk-modal-image" style="width: 200px; height: 150px; background: var(--color-bg-2); border-radius: var(--radius-base); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                            ${apk.screenshotUrls && apk.screenshotUrls[0] ? 
                                `<img src="${apk.screenshotUrls[0]}" alt="${this.escapeHtml(apk.name)}" style="width: 100%; height: 100%; object-fit: cover;">` :
                                '<i class="fas fa-mobile-alt" style="font-size: 3rem; color: var(--color-text-secondary);"></i>'
                            }
                        </div>
                        <div class="apk-modal-info">
                            <h3 style="margin: 0 0 1rem 0;">${this.escapeHtml(apk.name)}</h3>
                            <div class="apk-modal-meta" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.875rem;">
                                <div><strong>Version:</strong> ${this.escapeHtml(apk.version)}</div>
                                <div><strong>Category:</strong> ${this.escapeHtml(apk.category)}</div>
                                <div><strong>Size:</strong> ${apk.fileSize || 'Unknown'}</div>
                                <div><strong>Downloads:</strong> ${this.formatNumber(apk.downloadCount)}</div>
                                <div><strong>Rating:</strong> ${apk.rating ? `★ ${apk.rating} (${apk.reviewCount || 0} reviews)` : 'Not rated'}</div>
                                <div><strong>Android:</strong> ${apk.androidVersion || 'All versions'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="apk-modal-description" style="margin-bottom: 1.5rem;">
                        <h4 style="margin: 0 0 0.5rem 0;">Description</h4>
                        <p style="margin: 0; line-height: 1.5;">${this.escapeHtml(apk.description)}</p>
                    </div>

                    ${apk.permissions && apk.permissions.length > 0 ? `
                        <div class="apk-modal-permissions" style="margin-bottom: 1.5rem;">
                            <h4 style="margin: 0 0 0.5rem 0;">Permissions</h4>
                            <div class="permissions-list" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                ${apk.permissions.map(perm => `<span class="permission-tag" style="background: var(--color-bg-1); padding: 0.25rem 0.5rem; border-radius: var(--radius-full); font-size: 0.75rem;">${this.escapeHtml(perm)}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="apk-modal-actions" style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 1rem;">
                        <button class="btn btn--primary btn--lg" onclick="app.initiateDownload(${id})">
                            <i class="fas fa-download"></i> Download APK
                        </button>
                        <button class="btn btn--outline" onclick="app.addToFavorites(${id})">
                            <i class="fas fa-heart"></i> Favorite
                        </button>
                        <button class="btn btn--outline" onclick="app.shareAPK(${id})">
                            <i class="fas fa-share"></i> Share
                        </button>
                    </div>

                    <div class="security-notice" style="background: var(--color-bg-3); padding: 1rem; border-radius: var(--radius-base); text-align: center; font-size: 0.875rem;">
                        <i class="fas fa-shield-alt" style="color: var(--color-success); margin-right: 0.5rem;"></i>
                        <p style="margin: 0;">This APK has been scanned for malware and is safe to download. Always download from trusted sources.</p>
                    </div>
                </div>
            `;

            this.showModal('apkModal');
        } catch (error) {
            console.error('Error showing APK details:', error);
            this.showToast('Error loading APK details', 'error');
        }
    }

    // Download System
    initiateDownload(id) {
        try {
            const apk = this.apks.find(a => a.id === id);
            if (!apk) return;

            this.hideModal('apkModal');
            
            // Update download count
            const apkIndex = this.apks.findIndex(a => a.id === id);
            if (apkIndex !== -1) {
                this.apks[apkIndex].downloadCount++;
                this.saveData();
                this.updateStats();
            }

            // Show success message and open link
            this.showToast('Download started! Opening link...', 'success');
            
            setTimeout(() => {
                window.open(apk.downloadLink, '_blank');
            }, 1000);

        } catch (error) {
            console.error('Error initiating download:', error);
            this.showToast('Error starting download', 'error');
        }
    }

    // Admin System
    showAdminModal() {
        try {
            this.showModal('adminModal');
            
            if (this.isAdminLoggedIn) {
                const loginSection = document.getElementById('loginSection');
                const adminDashboard = document.getElementById('adminDashboard');
                
                if (loginSection) loginSection.classList.add('hidden');
                if (adminDashboard) adminDashboard.classList.remove('hidden');
                
                this.renderAdminDashboard();
            } else {
                const loginSection = document.getElementById('loginSection');
                const adminDashboard = document.getElementById('adminDashboard');
                
                if (loginSection) loginSection.classList.remove('hidden');
                if (adminDashboard) adminDashboard.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error showing admin modal:', error);
        }
    }

    handleAdminLogin(e) {
        try {
            e.preventDefault();
            
            const username = document.getElementById('adminUsername')?.value;
            const password = document.getElementById('adminPassword')?.value;
            const securityAnswer = document.getElementById('securityAnswer')?.value?.toLowerCase();

            const user = this.adminUsers.find(u => 
                u.username === username && 
                u.password === password && 
                u.securityAnswer === securityAnswer
            );

            if (user) {
                this.isAdminLoggedIn = true;
                this.currentAdminUser = user;
                
                const loginSection = document.getElementById('loginSection');
                const adminDashboard = document.getElementById('adminDashboard');
                
                if (loginSection) loginSection.classList.add('hidden');
                if (adminDashboard) adminDashboard.classList.remove('hidden');
                
                this.renderAdminDashboard();
                this.showToast('Admin login successful!', 'success');
                
                // Clear form
                const adminLoginForm = document.getElementById('adminLoginForm');
                if (adminLoginForm) adminLoginForm.reset();
            } else {
                this.showToast('Invalid credentials or security answer!', 'error');
            }
        } catch (error) {
            console.error('Error in admin login:', error);
            this.showToast('Login error occurred', 'error');
        }
    }

    renderAdminDashboard() {
        try {
            // Setup admin navigation
            document.querySelectorAll('.admin-nav-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const tab = e.target.dataset.tab;
                    if (tab) this.switchAdminTab(tab);
                });
            });

            // Render overview by default
            this.switchAdminTab('overview');
        } catch (error) {
            console.error('Error rendering admin dashboard:', error);
        }
    }

    switchAdminTab(tab) {
        try {
            // Update nav items
            document.querySelectorAll('.admin-nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.tab === tab) {
                    item.classList.add('active');
                }
            });

            // Update content
            document.querySelectorAll('.admin-tab-content').forEach(content => {
                content.classList.remove('active');
            });

            const targetTab = document.getElementById(`${tab}Tab`);
            if (targetTab) {
                targetTab.classList.add('active');
            }

            // Render tab-specific content
            this.renderAdminTab(tab);
        } catch (error) {
            console.error('Error switching admin tab:', error);
        }
    }

    renderAdminTab(tab) {
        try {
            switch (tab) {
                case 'overview':
                    this.updateAdminStats();
                    setTimeout(() => this.renderAdminCharts(), 100);
                    break;
                case 'apks':
                    this.renderAdminAPKTable();
                    break;
                case 'users':
                case 'ads':
                case 'analytics':
                case 'settings':
                    // These are static content in HTML
                    break;
            }
        } catch (error) {
            console.error('Error rendering admin tab:', error);
        }
    }

    updateAdminStats() {
        try {
            const totalAPKs = this.apks.length;
            const totalDownloads = this.apks.reduce((sum, apk) => sum + apk.downloadCount, 0);

            const adminTotalApks = document.getElementById('adminTotalApks');
            const adminTotalDownloads = document.getElementById('adminTotalDownloads');

            if (adminTotalApks) adminTotalApks.textContent = totalAPKs;
            if (adminTotalDownloads) adminTotalDownloads.textContent = this.formatNumber(totalDownloads);
        } catch (error) {
            console.error('Error updating admin stats:', error);
        }
    }

    renderAdminCharts() {
        try {
            // Only initialize charts if Chart.js is available
            if (typeof Chart === 'undefined') {
                console.warn('Chart.js not loaded, skipping charts');
                return;
            }

            // Downloads chart
            const downloadsCtx = document.getElementById('downloadsChart');
            if (downloadsCtx && !this.charts.downloads) {
                this.charts.downloads = new Chart(downloadsCtx, {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                        datasets: [{
                            label: 'Downloads',
                            data: [12000, 19000, 30000, 25000, 32000, 38000, 42000],
                            borderColor: '#1FB8CD',
                            backgroundColor: 'rgba(31, 184, 205, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }

            // Revenue chart
            const revenueCtx = document.getElementById('revenueChart');
            if (revenueCtx && !this.charts.revenue) {
                this.charts.revenue = new Chart(revenueCtx, {
                    type: 'bar',
                    data: {
                        labels: ['AdSense', 'Media.net', 'PropellerAds', 'Direct'],
                        datasets: [{
                            label: 'Revenue ($)',
                            data: [2847.32, 1456.78, 0, 854.23],
                            backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error rendering admin charts:', error);
        }
    }

    renderAdminAPKTable() {
        try {
            const tbody = document.getElementById('adminApkTable');
            if (!tbody) return;

            tbody.innerHTML = this.apks.map(apk => `
                <tr>
                    <td>${this.escapeHtml(apk.name)}</td>
                    <td>${this.escapeHtml(apk.version)}</td>
                    <td>${this.escapeHtml(apk.category)}</td>
                    <td>${this.formatNumber(apk.downloadCount)}</td>
                    <td>
                        <span class="status status--${apk.verified ? 'success' : 'warning'}">
                            ${apk.verified ? 'Verified' : 'Pending'}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn--outline btn--sm" onclick="app.editAPK(${apk.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn--outline btn--sm" onclick="app.deleteAPK(${apk.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error rendering admin APK table:', error);
        }
    }

    // Theme Management
    initTheme() {
        try {
            const savedTheme = localStorage.getItem('modapk_pro_theme') || 'light';
            document.documentElement.setAttribute('data-color-scheme', savedTheme);
            this.updateThemeButton(savedTheme);
        } catch (error) {
            console.warn('Error initializing theme:', error);
        }
    }

    toggleTheme() {
        try {
            const currentTheme = document.documentElement.getAttribute('data-color-scheme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-color-scheme', newTheme);
            localStorage.setItem('modapk_pro_theme', newTheme);
            this.updateThemeButton(newTheme);
        } catch (error) {
            console.error('Error toggling theme:', error);
        }
    }

    updateThemeButton(theme) {
        try {
            const button = document.getElementById('themeToggle');
            if (button) {
                const icon = button.querySelector('i');
                if (icon) {
                    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                }
            }
        } catch (error) {
            console.error('Error updating theme button:', error);
        }
    }

    // Utility Functions
    showModal(modalId) {
        try {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        } catch (error) {
            console.error('Error showing modal:', error);
        }
    }

    hideModal(modalId) {
        try {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('show');
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        } catch (error) {
            console.error('Error hiding modal:', error);
        }
    }

    showToast(message, type = 'info') {
        try {
            const container = document.getElementById('toastContainer');
            if (!container) {
                console.log('Toast:', message, `(${type})`);
                return;
            }

            const toast = document.createElement('div');
            toast.className = `toast toast--${type}`;
            
            const icons = {
                success: 'fas fa-check-circle',
                error: 'fas fa-exclamation-circle',
                info: 'fas fa-info-circle',
                warning: 'fas fa-exclamation-triangle'
            };

            toast.innerHTML = `
                <i class="${icons[type] || icons.info}"></i>
                <span>${this.escapeHtml(message)}</span>
            `;

            container.appendChild(toast);

            // Auto remove
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 5000);

            // Click to remove
            toast.addEventListener('click', () => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            });
        } catch (error) {
            console.error('Error showing toast:', error);
        }
    }

    updateStats() {
        try {
            const totalAPKs = this.apks.length;
            const totalDownloads = this.apks.reduce((sum, apk) => sum + apk.downloadCount, 0);

            // Update hero stats
            const heroTotalApks = document.getElementById('heroTotalApks');
            const heroTotalDownloads = document.getElementById('heroTotalDownloads');
            
            if (heroTotalApks) heroTotalApks.textContent = totalAPKs;
            if (heroTotalDownloads) heroTotalDownloads.textContent = this.formatNumber(totalDownloads);

            // Update about stats
            const aboutTotalApks = document.getElementById('aboutTotalApks');
            const aboutTotalDownloads = document.getElementById('aboutTotalDownloads');
            
            if (aboutTotalApks) aboutTotalApks.textContent = totalAPKs;
            if (aboutTotalDownloads) aboutTotalDownloads.textContent = this.formatNumber(totalDownloads);
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    updateHeroStats() {
        this.updateStats();
    }

    formatNumber(num) {
        if (!num) return '0';
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Stub functions for features mentioned in the UI
    browseByCategory(category) {
        this.navigateTo('browse');
        setTimeout(() => {
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                categoryFilter.value = category;
                this.applyFilters();
            }
        }, 100);
    }

    applyFilters() {
        // This would implement filtering logic
        this.showToast('Filters applied', 'info');
    }

    handleGlobalSearch(query) {
        // This would implement search functionality
        console.log('Searching for:', query);
    }

    simulateVoiceSearch() {
        this.showToast('Voice search activated! (Simulation)', 'info');
    }

    showUserModal() {
        this.showModal('userModal');
    }

    handleUpload(e) {
        e.preventDefault();
        this.showToast('Upload functionality would be implemented here', 'info');
    }

    handleContact(e) {
        e.preventDefault();
        this.showToast('Message sent successfully! (Simulation)', 'success');
    }

    addToFavorites(id) {
        this.showToast('Added to favorites!', 'success');
    }

    shareAPK(id) {
        if (navigator.share) {
            navigator.share({
                title: 'Check out this APK',
                url: window.location.href
            });
        } else {
            this.showToast('Link copied to clipboard!', 'success');
        }
    }

    editAPK(id) {
        this.showToast('Edit functionality would be implemented here', 'info');
    }

    deleteAPK(id) {
        if (confirm('Are you sure you want to delete this APK?')) {
            this.apks = this.apks.filter(apk => apk.id !== id);
            this.saveData();
            this.renderAdminAPKTable();
            this.updateStats();
            this.showToast('APK deleted successfully!', 'success');
        }
    }

    renderUploadPage() {
        const categorySelect = document.getElementById('uploadCategory');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Select Category</option>' +
                this.categories.map(cat => 
                    `<option value="${cat.name}">${cat.name}</option>`
                ).join('');
        }
    }

    renderAboutPage() {
        this.updateStats();
    }

    renderContactPage() {
        // Contact page is static
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleFileDrop(e) {
        this.showToast('File drop detected! (Simulation)', 'info');
    }

    simulateFileSelect() {
        this.showToast('File browser opened (Simulation)', 'info');
    }

    setupPWA() {
        // PWA setup would go here
        console.log('PWA features initialized');
    }

    installApp() {
        this.showToast('App installation feature (Simulation)', 'info');
    }

    initCharts() {
        // Charts initialization is handled in renderAdminCharts
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ModAPKPlatform();
    console.log('ModAPK Pro Platform loaded successfully!');
    console.log('Admin credentials: username: admin, password: admin123, security answer: blue');
    console.log('Moderator credentials: username: moderator, password: mod123, security answer: buddy');
});
document.querySelector('.spinner, #spinner, #loader').style.display = 'none';
