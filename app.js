// ModAPK Platform - Fixed JavaScript Implementation
class ModAPKPlatform {
    constructor() {
        // Hardcoded Supabase configuration
        this.supabaseUrl = 'https://jpzexvamlwxfyhgeuzpc.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwemV4dmFtbHd4ZnloZ2V1enBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDc0NzYsImV4cCI6MjA3MTcyMzQ3Nn0.wBuPkCmrlyqJhq2KsNiS_1Al3CDlFRudOCEIGHkML7E';
        
        // Initialize Supabase if available
        try {
            this.supabase = window.supabase?.createClient(this.supabaseUrl, this.supabaseKey);
        } catch (error) {
            console.log('Supabase not available, using local data');
            this.supabase = null;
        }
        
        // Application state
        this.currentUser = null;
        this.currentView = 'main';
        this.apks = [];
        this.categories = [];
        this.filteredApks = [];
        this.isAdmin = false;
        this.downloadProgress = {};
        
        // Sample data
        this.sampleData = {
            apks: [
                {
                    id: '1',
                    name: 'WhatsApp Plus',
                    version: '17.60.2',
                    package_name: 'com.whatsapp.plus',
                    category: 'Social',
                    description: 'Enhanced WhatsApp with advanced privacy features, custom themes, extended media sharing, message scheduling, and anti-ban protection.',
                    download_url: 'https://download.apkpure.com/b/XAPK/Y29tLndoYXRzYXBwLnBsdXM',
                    icon_url: 'https://images.sftcdn.net/images/t_app-icon-m/p/f4fbbd96-9b15-11e6-91f5-00163ed833e7/1919082909/whatsapp-messenger-icon.png',
                    screenshot_urls: ['https://images.apkpure.com/whatsapp/screenshot-1.jpg', 'https://images.apkpure.com/whatsapp/screenshot-2.jpg'],
                    file_size: '58.7 MB',
                    android_version: '4.4+',
                    download_count: 2847362,
                    rating: 4.8,
                    review_count: 12047,
                    features: ['Custom Themes', 'Privacy Options', 'Anti-Ban', 'Message Scheduling'],
                    tags: ['messaging', 'social', 'themes', 'privacy'],
                    verified: true,
                    featured: true,
                    trending: true,
                    created_at: new Date().toISOString()
                },
                {
                    id: '2',
                    name: 'Spotify Premium',
                    version: '8.7.88.475',
                    package_name: 'com.spotify.music.premium',
                    category: 'Music',
                    description: 'Unlock premium features including ad-free listening, unlimited skips, offline downloads, and high-quality streaming.',
                    download_url: 'https://download.apkpure.com/b/APK/Y29tLnNwb3RpZnkubXVzaWM',
                    icon_url: 'https://images.sftcdn.net/images/t_app-icon-m/p/b49eeea8-9b1a-11e6-96f3-00163ed833e7/1919082943/spotify-music-icon.png',
                    screenshot_urls: ['https://images.apkpure.com/spotify/screenshot-1.jpg', 'https://images.apkpure.com/spotify/screenshot-2.jpg'],
                    file_size: '31.4 MB',
                    android_version: '5.0+',
                    download_count: 3421876,
                    rating: 4.9,
                    review_count: 18392,
                    features: ['Ad-Free', 'Offline Downloads', 'Unlimited Skips', 'High Quality'],
                    tags: ['music', 'streaming', 'premium', 'offline'],
                    verified: true,
                    featured: true,
                    trending: true,
                    created_at: new Date().toISOString()
                },
                {
                    id: '3',
                    name: 'Instagram Pro',
                    version: '286.0.0.21.123',
                    package_name: 'com.instagram.android.pro',
                    category: 'Social',
                    description: 'Enhanced Instagram with download capabilities, story viewing without seen status, zoom profile pictures, and advanced privacy controls.',
                    download_url: 'https://download.apkpure.com/b/APK/Y29tLmluc3RhZ3JhbS5hbmRyb2lk',
                    icon_url: 'https://images.sftcdn.net/images/t_app-icon-m/p/f1a5e266-9b0e-11e6-8b90-00163ed833e7/1919082933/instagram-icon.png',
                    screenshot_urls: ['https://images.apkpure.com/instagram/screenshot-1.jpg', 'https://images.apkpure.com/instagram/screenshot-2.jpg'],
                    file_size: '43.2 MB',
                    android_version: '6.0+',
                    download_count: 1967543,
                    rating: 4.7,
                    review_count: 8429,
                    features: ['Download Photos/Videos', 'Anonymous Story View', 'Zoom Profile Pics', 'No Ads'],
                    tags: ['social', 'photography', 'download', 'privacy'],
                    verified: true,
                    featured: true,
                    trending: false,
                    created_at: new Date().toISOString()
                },
                {
                    id: '4',
                    name: 'YouTube Vanced',
                    version: '18.23.35',
                    package_name: 'com.vanced.android.youtube',
                    category: 'Entertainment',
                    description: 'Advanced YouTube client with ad-blocking, background playback, dark theme, and additional customization options.',
                    download_url: 'https://download.apkpure.com/b/APK/Y29tLnZhbmNlZC5hbmRyb2lk',
                    icon_url: 'https://images.sftcdn.net/images/t_app-icon-m/p/f8a50dc0-9b1a-11e6-9f3a-00163ed833e7/1919082957/youtube-icon.png',
                    screenshot_urls: ['https://images.apkpure.com/youtube/screenshot-1.jpg', 'https://images.apkpure.com/youtube/screenshot-2.jpg'],
                    file_size: '67.8 MB',
                    android_version: '6.0+',
                    download_count: 5234891,
                    rating: 4.9,
                    review_count: 23847,
                    features: ['Ad-Free', 'Background Play', 'Picture-in-Picture', 'Dark Theme'],
                    tags: ['video', 'entertainment', 'ad-free', 'background'],
                    verified: true,
                    featured: true,
                    trending: true,
                    created_at: new Date().toISOString()
                },
                {
                    id: '5',
                    name: 'TikTok Pro',
                    version: '28.5.4',
                    package_name: 'com.tiktok.pro',
                    category: 'Social',
                    description: 'Enhanced TikTok with video download capabilities, ad-free browsing, and unlimited video creation features.',
                    download_url: 'https://download.apkpure.com/b/APK/Y29tLnRpa3Rvay5wcm8',
                    icon_url: 'https://images.sftcdn.net/images/t_app-icon-m/p/tiktok-icon.png',
                    screenshot_urls: ['https://images.apkpure.com/tiktok/screenshot-1.jpg'],
                    file_size: '95.2 MB',
                    android_version: '6.0+',
                    download_count: 1245678,
                    rating: 4.6,
                    review_count: 5432,
                    features: ['Video Download', 'No Ads', 'Premium Effects', 'Unlimited Creation'],
                    tags: ['social', 'video', 'entertainment'],
                    verified: true,
                    featured: false,
                    trending: true,
                    created_at: new Date().toISOString()
                },
                {
                    id: '6',
                    name: 'Netflix Mod',
                    version: '8.45.0',
                    package_name: 'com.netflix.mod',
                    category: 'Entertainment',
                    description: 'Modified Netflix app with premium features unlocked, offline downloads, and enhanced streaming quality.',
                    download_url: 'https://download.apkpure.com/b/APK/Y29tLm5ldGZsaXgubW9k',
                    icon_url: 'https://images.sftcdn.net/images/t_app-icon-m/p/netflix-icon.png',
                    screenshot_urls: ['https://images.apkpure.com/netflix/screenshot-1.jpg'],
                    file_size: '42.1 MB',
                    android_version: '5.0+',
                    download_count: 876543,
                    rating: 4.7,
                    review_count: 3210,
                    features: ['Premium Unlocked', 'Offline Download', 'HD Streaming', 'No Ads'],
                    tags: ['entertainment', 'streaming', 'premium'],
                    verified: true,
                    featured: false,
                    trending: false,
                    created_at: new Date().toISOString()
                }
            ],
            categories: [
                { name: 'Social', icon: 'fas fa-users', color: '#4267B2', count: 3 },
                { name: 'Music', icon: 'fas fa-music', color: '#1DB954', count: 1 },
                { name: 'Entertainment', icon: 'fas fa-film', color: '#FF0000', count: 2 },
                { name: 'Games', icon: 'fas fa-gamepad', color: '#FF6B6B', count: 0 },
                { name: 'Photography', icon: 'fas fa-camera', color: '#E1306C', count: 0 },
                { name: 'Productivity', icon: 'fas fa-briefcase', color: '#4285F4', count: 0 },
                { name: 'Tools', icon: 'fas fa-wrench', color: '#FF9500', count: 0 }
            ]
        };

        this.init();
    }

    async init() {
        console.log('Initializing ModAPK Platform...');
        await this.loadInitialData();
        this.setupEventListeners();
        this.checkAuthState();
        this.showView('main');
        
        // Show welcome message after a short delay
        setTimeout(() => {
            this.showToast('Welcome to ModAPK Platform!', 'info');
        }, 1000);
    }

    async loadInitialData() {
        try {
            // Use sample data
            this.apks = [...this.sampleData.apks];
            this.categories = [...this.sampleData.categories];
            this.filteredApks = [...this.apks];
            
            console.log('Loaded apps:', this.apks.length);
            
            // Update UI
            setTimeout(() => {
                this.updateStats();
                this.renderFeaturedApps();
                this.renderAllApps();
                this.renderCategories();
                this.populateFilters();
            }, 100);
            
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Search functionality with debouncing
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
            console.log('Search listener attached');
        }

        // Filter controls
        const categoryFilter = document.getElementById('category-filter');
        const sortFilter = document.getElementById('sort-filter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                console.log('Category filter changed:', e.target.value);
                this.handleCategoryFilter(e.target.value);
            });
        }
        
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                console.log('Sort filter changed:', e.target.value);
                this.handleSortFilter(e.target.value);
            });
        }

        // Navigation click handlers
        this.setupNavigation();

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#user-menu')) {
                const dropdown = document.getElementById('user-dropdown');
                if (dropdown) {
                    dropdown.classList.add('hidden');
                }
            }
        });
    }

    setupNavigation() {
        // Brand click
        const brand = document.querySelector('.nav-brand');
        if (brand) {
            brand.addEventListener('click', (e) => {
                e.preventDefault();
                this.showView('main');
            });
        }

        // Navigation buttons
        const homeBtn = document.querySelector('[onclick="showView(\'main\')"]');
        const categoriesBtn = document.querySelector('[onclick="showView(\'categories\')"]');
        const trendingBtn = document.querySelector('[onclick="showView(\'trending\')"]');
        const loginBtn = document.getElementById('login-btn');
        const userMenu = document.getElementById('user-menu');
        const adminBtn = document.getElementById('admin-btn');

        if (homeBtn) {
            homeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showView('main');
            });
        }

        if (categoriesBtn) {
            categoriesBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showView('categories');
            });
        }

        if (trendingBtn) {
            trendingBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showView('trending');
            });
        }

        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal();
            });
        }

        if (userMenu) {
            userMenu.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleUserMenu();
            });
        }

        if (adminBtn) {
            adminBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showView('admin');
            });
        }

        console.log('Navigation listeners set up');
    }

    checkAuthState() {
        // Check for demo admin login
        const demoUser = localStorage.getItem('demoUser');
        if (demoUser) {
            try {
                this.currentUser = JSON.parse(demoUser);
                this.isAdmin = this.currentUser.email === 'admin@modapk.com';
                this.updateAuthUI();
            } catch (error) {
                console.error('Error parsing demo user:', error);
            }
        }
    }

    updateAuthUI() {
        const loginBtn = document.getElementById('login-btn');
        const userMenu = document.getElementById('user-menu');
        const userName = document.getElementById('user-name');
        const adminBtn = document.getElementById('admin-btn');

        if (this.currentUser) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (userMenu) userMenu.style.display = 'flex';
            if (userName) userName.textContent = this.currentUser.email.split('@')[0];
            
            if (this.isAdmin && adminBtn) {
                adminBtn.style.display = 'flex';
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
            if (adminBtn) adminBtn.style.display = 'none';
        }
    }

    updateStats() {
        const totalApps = this.apks.length;
        const totalDownloads = this.apks.reduce((sum, app) => sum + app.download_count, 0);
        
        const totalAppsEl = document.getElementById('total-apps');
        const totalDownloadsEl = document.getElementById('total-downloads');
        
        if (totalAppsEl) totalAppsEl.textContent = totalApps;
        if (totalDownloadsEl) totalDownloadsEl.textContent = this.formatNumber(totalDownloads);
        
        // Update admin stats
        const adminTotalApps = document.getElementById('admin-total-apps');
        const adminTotalDownloads = document.getElementById('admin-total-downloads');
        const adminTotalUsers = document.getElementById('admin-total-users');
        
        if (adminTotalApps) adminTotalApps.textContent = totalApps;
        if (adminTotalDownloads) adminTotalDownloads.textContent = this.formatNumber(totalDownloads);
        if (adminTotalUsers) adminTotalUsers.textContent = '1,247'; // Mock data
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    renderFeaturedApps() {
        const container = document.getElementById('featured-apps');
        if (!container) return;

        const featuredApps = this.apks.filter(app => app.featured);
        container.innerHTML = featuredApps.map(app => this.createAppCard(app)).join('');
        console.log('Rendered featured apps:', featuredApps.length);
    }

    renderAllApps() {
        const container = document.getElementById('all-apps');
        if (!container) return;

        container.innerHTML = this.filteredApks.map(app => this.createAppCard(app)).join('');
        console.log('Rendered all apps:', this.filteredApks.length);
    }

    renderTrendingApps() {
        const container = document.getElementById('trending-apps');
        if (!container) return;

        const trendingApps = this.apks.filter(app => app.trending);
        container.innerHTML = trendingApps.map(app => this.createAppCard(app)).join('');
        console.log('Rendered trending apps:', trendingApps.length);
    }

    createAppCard(app) {
        const badges = [];
        if (app.verified) badges.push('<span class="app-badge verified">Verified</span>');
        if (app.featured) badges.push('<span class="app-badge featured">Featured</span>');
        if (app.trending) badges.push('<span class="app-badge trending">Trending</span>');

        const features = app.features.slice(0, 3).map(feature => 
            `<span class="app-feature">${feature}</span>`
        ).join('');

        return `
            <div class="app-card" data-app-id="${app.id}">
                <div class="app-badges">
                    ${badges.join('')}
                </div>
                <div class="app-card-header">
                    <img src="${app.icon_url}" alt="${app.name}" class="app-icon" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiNjY2MiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptLTIgMTVsLTUtNSAxLjQxLTEuNDFMMTAgMTQuMTdsNy41OS03LjU5TDE5IDhsLTkgOXoiLz48L3N2Zz4='">
                    <div class="app-info">
                        <h3 class="app-name">${app.name}</h3>
                        <div class="app-version">v${app.version}</div>
                        <div class="app-category">${app.category}</div>
                    </div>
                </div>
                <div class="app-card-body">
                    <p class="app-description">${app.description}</p>
                    <div class="app-features">
                        ${features}
                    </div>
                </div>
                <div class="app-card-footer">
                    <div class="app-stats">
                        <div class="app-stat">
                            <i class="fas fa-download"></i>
                            <span>${this.formatNumber(app.download_count)}</span>
                        </div>
                        <div class="app-stat">
                            <i class="fas fa-star"></i>
                            <span>${app.rating}</span>
                        </div>
                        <div class="app-stat">
                            <i class="fas fa-hdd"></i>
                            <span>${app.file_size}</span>
                        </div>
                    </div>
                    <button class="download-btn" data-app-id="${app.id}">
                        <i class="fas fa-download"></i>
                        Download
                    </button>
                </div>
            </div>
        `;
    }

    renderCategories() {
        const container = document.getElementById('categories-grid');
        if (!container) return;

        container.innerHTML = this.categories.map(category => `
            <div class="category-card" data-category="${category.name}">
                <div class="category-icon" style="color: ${category.color}">
                    <i class="${category.icon}"></i>
                </div>
                <h3 class="category-name">${category.name}</h3>
                <p class="category-count">${category.count} apps</p>
            </div>
        `).join('');

        // Add click listeners to category cards
        container.addEventListener('click', (e) => {
            const categoryCard = e.target.closest('.category-card');
            if (categoryCard) {
                const category = categoryCard.dataset.category;
                this.filterByCategory(category);
            }
        });
    }

    populateFilters() {
        const categoryFilter = document.getElementById('category-filter');
        if (!categoryFilter) return;

        // Clear existing options (except "All Categories")
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    }

    handleSearch(query) {
        console.log('Searching for:', query);
        
        if (!query.trim()) {
            this.filteredApks = [...this.apks];
        } else {
            const searchTerm = query.toLowerCase();
            this.filteredApks = this.apks.filter(app =>
                app.name.toLowerCase().includes(searchTerm) ||
                app.description.toLowerCase().includes(searchTerm) ||
                app.category.toLowerCase().includes(searchTerm) ||
                app.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        
        this.renderAllApps();
        console.log('Search results:', this.filteredApks.length);
    }

    handleCategoryFilter(category) {
        console.log('Filtering by category:', category);
        
        if (!category) {
            this.filteredApks = [...this.apks];
        } else {
            this.filteredApks = this.apks.filter(app => app.category === category);
        }
        this.renderAllApps();
    }

    handleSortFilter(sortBy) {
        console.log('Sorting by:', sortBy);
        
        switch (sortBy) {
            case 'downloads':
                this.filteredApks.sort((a, b) => b.download_count - a.download_count);
                break;
            case 'rating':
                this.filteredApks.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                this.filteredApks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'name':
                this.filteredApks.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
        this.renderAllApps();
    }

    filterByCategory(category) {
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.value = category;
            this.handleCategoryFilter(category);
        }
        this.showView('main');
    }

    showView(viewName) {
        console.log('Showing view:', viewName);
        
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Show target view
        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewName;

            // Load view-specific content
            setTimeout(() => {
                switch (viewName) {
                    case 'trending':
                        this.renderTrendingApks();
                        break;
                    case 'admin':
                        if (this.isAdmin) {
                            this.loadAdminData();
                        } else {
                            this.showView('main');
                            this.showToast('Access denied. Admin privileges required.', 'error');
                        }
                        break;
                }
            }, 100);
        }

        // Update navigation active states
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
    }

    showAppDetails(appId) {
        console.log('Showing app details for:', appId);
        
        const app = this.apks.find(a => a.id === appId);
        if (!app) {
            console.error('App not found:', appId);
            return;
        }

        const container = document.getElementById('apk-details-content');
        if (!container) return;

        const features = app.features.map(feature => 
            `<div class="feature-item"><i class="fas fa-check"></i> ${feature}</div>`
        ).join('');

        const screenshots = app.screenshot_urls.map(url => 
            `<img src="${url}" alt="Screenshot" class="screenshot" onerror="this.style.display='none'">`
        ).join('');

        container.innerHTML = `
            <div class="apk-header">
                <img src="${app.icon_url}" alt="${app.name}" class="apk-icon-large" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2NjYyIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01IDEuNDEtMS40MUwxMCAxNC4xN2w3LjU5LTcuNTlMMTkgOGwtOSA5eiIvPjwvc3ZnPg=='">
                <div class="apk-header-info">
                    <h1 class="apk-title">${app.name}</h1>
                    <p class="apk-subtitle">Version ${app.version} • ${app.category}</p>
                    <div class="apk-meta">
                        <div class="meta-item">
                            <span class="meta-value">${app.rating}</span>
                            <span class="meta-label">Rating</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-value">${this.formatNumber(app.download_count)}</span>
                            <span class="meta-label">Downloads</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-value">${app.file_size}</span>
                            <span class="meta-label">Size</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-value">${app.android_version}</span>
                            <span class="meta-label">Android</span>
                        </div>
                    </div>
                    <div class="apk-actions">
                        <button class="apk-download-btn" data-app-id="${app.id}">
                            <i class="fas fa-download"></i>
                            Download APK
                        </button>
                        <button class="apk-secondary-btn" onclick="platform.shareApp('${app.id}')">
                            <i class="fas fa-share"></i>
                            Share
                        </button>
                        <button class="apk-secondary-btn" onclick="platform.generateQR('${app.id}')">
                            <i class="fas fa-qrcode"></i>
                            QR Code
                        </button>
                    </div>
                </div>
            </div>

            <div class="apk-content">
                <div class="content-section">
                    <h3><i class="fas fa-info-circle"></i> Description</h3>
                    <p>${app.description}</p>
                </div>

                <div class="content-section">
                    <h3><i class="fas fa-star"></i> Key Features</h3>
                    <div class="features-list">
                        ${features}
                    </div>
                </div>

                <div class="content-section">
                    <h3><i class="fas fa-images"></i> Screenshots</h3>
                    <div class="screenshots-grid">
                        ${screenshots}
                    </div>
                </div>
            </div>
        `;

        // Add event listener to download button in details
        const downloadBtn = container.querySelector('.apk-download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startDownload(app.id);
            });
        }

        this.showView('apk-details');
    }

    async startDownload(appId) {
        console.log('Starting download for app:', appId);
        
        const app = this.apks.find(a => a.id === appId);
        if (!app) return;

        // Update download count
        app.download_count++;
        this.updateStats();
        
        this.simulateDownload(app);
    }

    simulateDownload(app) {
        console.log('Simulating download for:', app.name);
        
        // Show download modal
        const modal = document.getElementById('download-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
        
        const appNameEl = document.getElementById('download-app-name');
        const appSizeEl = document.getElementById('download-app-size');
        
        if (appNameEl) appNameEl.textContent = app.name;
        if (appSizeEl) appSizeEl.textContent = app.file_size;
        
        // Reset progress
        const progressFill = document.getElementById('download-progress-fill');
        const progressText = document.getElementById('download-percentage');
        const speedText = document.getElementById('download-speed');
        const installBtn = document.getElementById('install-btn');
        
        if (progressFill) progressFill.style.width = '0%';
        if (progressText) progressText.textContent = '0%';
        if (speedText) speedText.textContent = '0 KB/s';
        if (installBtn) installBtn.style.display = 'none';

        // Simulate download progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5; // Random progress between 5-20%
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                if (progressFill) progressFill.style.width = '100%';
                if (progressText) progressText.textContent = '100%';
                if (speedText) speedText.textContent = 'Complete';
                if (installBtn) installBtn.style.display = 'block';
                
                this.showToast('Download completed!', 'success');
                
                // Auto-hide modal after 3 seconds
                setTimeout(() => {
                    this.hideDownloadModal();
                }, 3000);
                
            } else {
                if (progressFill) progressFill.style.width = progress + '%';
                if (progressText) progressText.textContent = Math.round(progress) + '%';
                if (speedText) speedText.textContent = Math.round(Math.random() * 500 + 100) + ' KB/s';
            }
        }, 200);

        this.downloadProgress[app.id] = { interval, progress };
    }

    hideDownloadModal() {
        const modal = document.getElementById('download-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }

    cancelDownload() {
        // Stop any ongoing download simulation
        Object.values(this.downloadProgress).forEach(download => {
            if (download.interval) {
                clearInterval(download.interval);
            }
        });
        this.downloadProgress = {};
        this.hideDownloadModal();
        this.showToast('Download cancelled', 'info');
    }

    openAPK() {
        // Simulate APK installation
        this.showToast('APK file opened. Follow your device instructions to install.', 'info');
        this.hideDownloadModal();
    }

    shareApp(appId) {
        const app = this.apks.find(a => a.id === appId);
        if (!app) return;

        if (navigator.share) {
            navigator.share({
                title: app.name,
                text: app.description,
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback: copy to clipboard
            const shareUrl = `${window.location.origin}#app=${appId}`;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(shareUrl).then(() => {
                    this.showToast('App link copied to clipboard!', 'success');
                }).catch(() => {
                    this.showToast('Share link: ' + shareUrl, 'info');
                });
            } else {
                this.showToast('Share link: ' + shareUrl, 'info');
            }
        }
    }

    generateQR(appId) {
        const app = this.apks.find(a => a.id === appId);
        if (!app) return;

        // Generate QR code for mobile download
        this.showToast('QR Code: Scan to download ' + app.name + ' on mobile', 'info');
    }

    // Authentication Functions
    showLoginModal() {
        console.log('Showing login modal');
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
    }

    hideLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }

    showAuthTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        
        const tabBtn = document.querySelector(`[onclick*="${tab}"]`);
        const form = document.getElementById(`${tab}-form`);
        
        if (tabBtn) tabBtn.classList.add('active');
        if (form) form.classList.add('active');
    }

    async handleLogin(event) {
        event.preventDefault();
        console.log('Handling login...');
        
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');

        this.showLoading(true);

        try {
            // Check for admin credentials
            if (email === 'admin@modapk.com' && password === 'admin123') {
                // Simulate admin login
                this.currentUser = { email, id: 'admin', role: 'admin' };
                this.isAdmin = true;
                
                // Save to localStorage for persistence
                localStorage.setItem('demoUser', JSON.stringify(this.currentUser));
                
                this.updateAuthUI();
                this.hideLoginModal();
                this.showToast('Admin login successful!', 'success');
            } else {
                // Demo user login
                this.currentUser = { email, id: Date.now().toString(), role: 'user' };
                this.isAdmin = false;
                
                // Save to localStorage for persistence
                localStorage.setItem('demoUser', JSON.stringify(this.currentUser));
                
                this.updateAuthUI();
                this.hideLoginModal();
                this.showToast('Login successful!', 'success');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showToast('Login failed: ' + error.message, 'error');
        }

        this.showLoading(false);
    }

    async handleRegister(event) {
        event.preventDefault();
        console.log('Handling registration...');
        
        const formData = new FormData(event.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');

        this.showLoading(true);

        try {
            // Demo registration
            this.currentUser = { 
                email, 
                id: Date.now().toString(), 
                role: 'user',
                name 
            };
            this.isAdmin = false;
            
            // Save to localStorage for persistence
            localStorage.setItem('demoUser', JSON.stringify(this.currentUser));
            
            this.updateAuthUI();
            this.hideLoginModal();
            this.showToast('Registration successful! Welcome to ModAPK!', 'success');

        } catch (error) {
            console.error('Registration error:', error);
            this.showToast('Registration failed: ' + error.message, 'error');
        }

        this.showLoading(false);
    }

    logout() {
        console.log('Logging out...');
        
        this.currentUser = null;
        this.isAdmin = false;
        
        // Clear localStorage
        localStorage.removeItem('demoUser');
        
        this.updateAuthUI();
        this.showToast('Logged out successfully', 'info');
        
        if (this.currentView === 'admin') {
            this.showView('main');
        }
    }

    toggleUserMenu() {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    }

    // Admin Panel Functions
    async loadAdminData() {
        if (!this.isAdmin) return;
        console.log('Loading admin data...');

        setTimeout(() => {
            this.loadAdminApps();
            this.loadAdminUsers();
            this.loadAdminAnalytics();
        }, 100);
    }

    loadAdminApps() {
        const tbody = document.getElementById('admin-apps-table');
        if (!tbody) return;

        tbody.innerHTML = this.apks.map(app => `
            <tr>
                <td>
                    <div class="app-info">
                        <img src="${app.icon_url}" alt="${app.name}" class="app-icon-small" onerror="this.style.display='none'">
                        <div>
                            <strong>${app.name}</strong><br>
                            <small>${app.package_name}</small>
                        </div>
                    </div>
                </td>
                <td>${app.version}</td>
                <td>${app.category}</td>
                <td>${this.formatNumber(app.download_count)}</td>
                <td>${app.rating} ⭐</td>
                <td>
                    <div class="admin-actions-cell">
                        <button class="admin-action-btn edit" data-app-id="${app.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="admin-action-btn delete" data-app-id="${app.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners to admin action buttons
        tbody.addEventListener('click', (e) => {
            if (e.target.closest('.admin-action-btn.edit')) {
                const appId = e.target.closest('.admin-action-btn.edit').dataset.appId;
                this.editApp(appId);
            } else if (e.target.closest('.admin-action-btn.delete')) {
                const appId = e.target.closest('.admin-action-btn.delete').dataset.appId;
                this.deleteApp(appId);
            }
        });
    }

    loadAdminUsers() {
        const tbody = document.getElementById('admin-users-table');
        if (!tbody) return;

        // Mock user data
        const users = [
            { id: 1, name: 'John Doe', email: 'john@example.com', joined: '2024-01-15', downloads: 25 },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', joined: '2024-02-20', downloads: 18 },
            { id: 3, name: 'Admin User', email: 'admin@modapk.com', joined: '2024-01-01', downloads: 0 }
        ];

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.joined}</td>
                <td>${user.downloads}</td>
                <td>
                    <div class="admin-actions-cell">
                        <button class="admin-action-btn edit" data-user-id="${user.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="admin-action-btn delete" data-user-id="${user.id}">
                            <i class="fas fa-ban"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    loadAdminAnalytics() {
        // Load charts with Chart.js if available
        if (typeof Chart !== 'undefined') {
            this.loadDownloadsChart();
            this.loadCategoriesChart();
        } else {
            console.log('Chart.js not loaded, skipping analytics charts');
        }
    }

    loadDownloadsChart() {
        const ctx = document.getElementById('downloads-chart');
        if (!ctx) return;

        try {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Downloads',
                        data: [1200, 1900, 3000, 5000, 4000, 6000],
                        borderColor: '#1FB8CD',
                        backgroundColor: 'rgba(31, 184, 205, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error creating downloads chart:', error);
        }
    }

    loadCategoriesChart() {
        const ctx = document.getElementById('categories-chart');
        if (!ctx) return;

        try {
            const categoryData = this.categories.filter(c => c.count > 0);
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: categoryData.map(c => c.name),
                    datasets: [{
                        data: categoryData.map(c => c.count),
                        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F', '#DB4545'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        } catch (error) {
            console.error('Error creating categories chart:', error);
        }
    }

    showAdminTab(tab) {
        console.log('Showing admin tab:', tab);
        
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));

        const tabBtn = document.querySelector(`[onclick*="${tab}"]`);
        const content = document.getElementById(`admin-${tab}-tab`);
        
        if (tabBtn) tabBtn.classList.add('active');
        if (content) content.classList.add('active');

        // Load tab-specific data
        setTimeout(() => {
            switch (tab) {
                case 'apps':
                    this.loadAdminApps();
                    break;
                case 'users':
                    this.loadAdminUsers();
                    break;
                case 'analytics':
                    this.loadAdminAnalytics();
                    break;
            }
        }, 50);
    }

    showAddAppModal() {
        const modal = document.getElementById('app-modal');
        const title = document.getElementById('app-modal-title');
        const form = document.getElementById('app-form');
        
        if (title) title.textContent = 'Add New App';
        if (form) form.reset();
        
        const idInput = document.querySelector('input[name="id"]');
        if (idInput) idInput.value = '';
        
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
    }

    hideAppModal() {
        const modal = document.getElementById('app-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }

    editApp(appId) {
        console.log('Editing app:', appId);
        
        const app = this.apks.find(a => a.id === appId);
        if (!app) return;

        const title = document.getElementById('app-modal-title');
        if (title) title.textContent = 'Edit App';
        
        const form = document.getElementById('app-form');
        if (!form) return;
        
        // Populate form fields
        const fields = {
            'name': app.name,
            'version': app.version,
            'package_name': app.package_name,
            'category': app.category,
            'description': app.description,
            'download_url': app.download_url,
            'icon_url': app.icon_url,
            'file_size': app.file_size,
            'android_version': app.android_version,
            'features': app.features.join(', '),
            'id': app.id
        };

        Object.keys(fields).forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) input.value = fields[field];
        });

        // Handle checkboxes
        const checkboxes = {
            'verified': app.verified,
            'featured': app.featured,
            'trending': app.trending
        };

        Object.keys(checkboxes).forEach(checkbox => {
            const input = form.querySelector(`[name="${checkbox}"]`);
            if (input) input.checked = checkboxes[checkbox];
        });

        const modal = document.getElementById('app-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
    }

    async handleAppSubmit(event) {
        event.preventDefault();
        if (!this.isAdmin) return;

        console.log('Handling app submit...');
        
        const formData = new FormData(event.target);
        const appData = {
            name: formData.get('name'),
            version: formData.get('version'),
            package_name: formData.get('package_name'),
            category: formData.get('category'),
            description: formData.get('description'),
            download_url: formData.get('download_url'),
            icon_url: formData.get('icon_url'),
            file_size: formData.get('file_size'),
            android_version: formData.get('android_version'),
            features: formData.get('features').split(',').map(f => f.trim()).filter(f => f),
            verified: formData.get('verified') === 'on',
            featured: formData.get('featured') === 'on',
            trending: formData.get('trending') === 'on',
            tags: [formData.get('category').toLowerCase()],
            rating: 4.5,
            review_count: 0,
            download_count: 0,
            screenshot_urls: []
        };

        const appId = formData.get('id');

        try {
            if (appId) {
                // Update existing app
                const appIndex = this.apks.findIndex(a => a.id === appId);
                if (appIndex >= 0) {
                    this.apks[appIndex] = { ...this.apks[appIndex], ...appData };
                    this.showToast('App updated successfully!', 'success');
                }
            } else {
                // Add new app
                appData.id = Date.now().toString();
                appData.created_at = new Date().toISOString();
                this.apks.unshift(appData);
                this.showToast('App added successfully!', 'success');
            }

            // Update displays
            this.filteredApks = [...this.apks];
            this.updateStats();
            this.renderAllApps();
            this.renderFeaturedApps();
            this.loadAdminApps();
            this.hideAppModal();

        } catch (error) {
            console.error('Error saving app:', error);
            this.showToast('Error saving app: ' + error.message, 'error');
        }
    }

    deleteApp(appId) {
        if (!this.isAdmin) return;
        
        console.log('Deleting app:', appId);
        
        if (confirm('Are you sure you want to delete this app?')) {
            this.apks = this.apks.filter(app => app.id !== appId);
            this.filteredApks = [...this.apks];
            this.updateStats();
            this.renderAllApks();
            this.renderFeaturedApps();
            this.loadAdminApps();
            this.showToast('App deleted successfully', 'success');
        }
    }

    // Utility Functions
    showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.toggle('hidden', !show);
        }
    }

    showToast(message, type = 'info') {
        console.log(`Toast: ${type} - ${message}`);
        
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }

    getToastIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }
}

// Global platform instance
let platform;

// Initialize the platform when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing platform...');
    platform = new ModAPKPlatform();

    // Set up global event delegation for dynamic content
    document.body.addEventListener('click', (e) => {
        // Handle app card clicks
        const appCard = e.target.closest('.app-card');
        if (appCard && !e.target.closest('.download-btn')) {
            const appId = appCard.dataset.appId;
            if (appId) {
                platform.showAppDetails(appId);
            }
        }

        // Handle download button clicks
        const downloadBtn = e.target.closest('.download-btn');
        if (downloadBtn) {
            e.stopPropagation();
            const appId = downloadBtn.dataset.appId;
            if (appId) {
                platform.startDownload(appId);
            }
        }

        // Handle modal close clicks
        if (e.target.classList.contains('modal-overlay') || e.target.closest('.modal-close')) {
            e.target.closest('.modal').classList.add('hidden');
            e.target.closest('.modal').style.display = 'none';
        }

        // Handle auth tab clicks
        if (e.target.closest('[data-auth-tab]')) {
            const tab = e.target.closest('[data-auth-tab]').dataset.authTab;
            platform.showAuthTab(tab);
        }

        // Handle admin tab clicks
        if (e.target.closest('[data-admin-tab]')) {
            const tab = e.target.closest('[data-admin-tab]').dataset.adminTab;
            platform.showAdminTab(tab);
        }
    });

    // Handle form submissions
    document.body.addEventListener('submit', (e) => {
        if (e.target.id === 'login-form' || e.target.closest('#login-form')) {
            platform.handleLogin(e);
        } else if (e.target.id === 'register-form' || e.target.closest('#register-form')) {
            platform.handleRegister(e);
        } else if (e.target.id === 'app-form' || e.target.closest('#app-form')) {
            platform.handleAppSubmit(e);
        }
    });
});

// Global functions for backward compatibility
window.showView = (view) => platform?.showView(view);
window.showAppDetails = (appId) => platform?.showAppDetails(appId);
window.startDownload = (appId) => platform?.startDownload(appId);
window.filterByCategory = (category) => platform?.filterByCategory(category);
window.shareApp = (appId) => platform?.shareApp(appId);
window.generateQR = (appId) => platform?.generateQR(appId);
window.showLoginModal = () => platform?.showLoginModal();
window.hideLoginModal = () => platform?.hideLoginModal();
window.showAuthTab = (tab) => platform?.showAuthTab(tab);
window.handleLogin = (event) => platform?.handleLogin(event);
window.handleRegister = (event) => platform?.handleRegister(event);
window.toggleUserMenu = () => platform?.toggleUserMenu();
window.logout = () => platform?.logout();
window.hideDownloadModal = () => platform?.hideDownloadModal();
window.cancelDownload = () => platform?.cancelDownload();
window.openAPK = () => platform?.openAPK();
window.showAdminTab = (tab) => platform?.showAdminTab(tab);
window.showAddAppModal = () => platform?.showAddAppModal();
window.hideAppModal = () => platform?.hideAppModal();
window.editApp = (appId) => platform?.editApp(appId);
window.deleteApp = (appId) => platform?.deleteApp(appId);
window.handleAppSubmit = (event) => platform?.handleAppSubmit(event);