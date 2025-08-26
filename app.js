// ModAPK Platform - Simplified Real-Time App
class ModAPKApp {
    constructor() {
        // Supabase Configuration
        this.supabaseUrl = 'https://jpzexvamlwxfyhgeuzpc.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwemV4dmFtbHd4ZnloZ2V1enBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDc0NzYsImV4cCI6MjA3MTcyMzQ3Nn0.wBuPkCmrlyqJhq2KsNiS_1Al3CDlFRudOCEIGHkML7E';
        
        // Initialize Supabase
        this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
        
        // App State
        this.currentUser = null;
        this.isAdmin = false;
        this.apks = [];
        this.categories = [];
        this.ads = [];
        this.currentView = 'home';
        this.selectedApk = null;
        
        // Initialize App
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Initializing ModAPK Platform...');
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Check authentication
            await this.checkAuth();
            
            // Load initial data
            await this.loadData();
            
            // Setup real-time subscriptions
            this.setupRealtime();
            
            // Load ads
            await this.loadAds();
            
            // Hide loading screen
            this.hideLoading();
            
            // Show initial view
            this.showView('home');
            
            console.log('✅ ModAPK Platform initialized successfully!');
            
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.showToast('Failed to initialize app. Please refresh the page.', 'error');
            this.hideLoading();
        }
    }
    
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
        
        // Form submissions
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(new FormData(e.target));
            });
        }
        
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup(new FormData(e.target));
            });
        }
        
        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }
    
    async checkAuth() {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (session?.user) {
                await this.setCurrentUser(session.user);
            }
            
            // Listen for auth changes
            this.supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    await this.setCurrentUser(session.user);
                    this.showToast('Welcome back!', 'success');
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.isAdmin = false;
                    this.updateAuthUI();
                    this.showToast('Logged out successfully', 'success');
                }
            });
            
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    }
    
    async setCurrentUser(authUser) {
        try {
            // Get or create user profile
            let { data: userProfile, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();
                
            if (error && error.code === 'PGRST116') {
                // Create user profile
                const { data: newProfile, error: createError } = await this.supabase
                    .from('users')
                    .insert([{
                        id: authUser.id,
                        email: authUser.email,
                        username: authUser.email.split('@')[0],
                        role: 'user'
                    }])
                    .select()
                    .single();
                    
                if (createError) throw createError;
                userProfile = newProfile;
            } else if (error) {
                throw error;
            }
            
            this.currentUser = userProfile;
            this.isAdmin = userProfile.role === 'admin' || userProfile.role === 'super_admin';
            this.updateAuthUI();
            
        } catch (error) {
            console.error('Failed to set current user:', error);
        }
    }
    
    updateAuthUI() {
        const loginBtn = document.getElementById('login-btn');
        const userMenu = document.getElementById('user-menu');
        const adminBtn = document.getElementById('admin-btn');
        const userName = document.getElementById('user-name');
        
        if (this.currentUser) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'flex';
                if (userName) userName.textContent = this.currentUser.username;
            }
            if (adminBtn && this.isAdmin) {
                adminBtn.style.display = 'flex';
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
            if (adminBtn) adminBtn.style.display = 'none';
        }
    }
    
    async loadData() {
        try {
            // Load categories
            const { data: categories, error: catError } = await this.supabase
                .from('categories')
                .select('*')
                .order('name');
                
            if (catError) throw catError;
            this.categories = categories || [];
            
            // Load APKs
            const { data: apks, error: apkError } = await this.supabase
                .from('apks')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (apkError) throw apkError;
            this.apks = apks || [];
            
            // Update UI
            this.updateStats();
            this.renderCategories();
            this.renderAPKs();
            
            console.log(`✅ Loaded ${this.categories.length} categories and ${this.apks.length} APKs`);
            
        } catch (error) {
            console.error('Failed to load data:', error);
            throw error;
        }
    }
    
    setupRealtime() {
        try {
            // Subscribe to APK changes
            this.supabase
                .channel('apks_changes')
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'apks' 
                }, (payload) => {
                    this.handleAPKChange(payload);
                })
                .subscribe();
                
            // Subscribe to category changes
            this.supabase
                .channel('categories_changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'categories'
                }, (payload) => {
                    this.handleCategoryChange(payload);
                })
                .subscribe();
                
            console.log('✅ Real-time subscriptions active');
            
        } catch (error) {
            console.error('Failed to setup real-time:', error);
        }
    }
    
    handleAPKChange(payload) {
        const { eventType, new: newData, old: oldData } = payload;
        
        switch (eventType) {
            case 'INSERT':
                this.apks.unshift(newData);
                this.showToast('New APK added!', 'success');
                break;
            case 'UPDATE':
                const updateIndex = this.apks.findIndex(apk => apk.id === newData.id);
                if (updateIndex !== -1) {
                    this.apks[updateIndex] = newData;
                }
                break;
            case 'DELETE':
                this.apks = this.apks.filter(apk => apk.id !== oldData.id);
                break;
        }
        
        this.updateStats();
        this.renderAPKs();
    }
    
    handleCategoryChange(payload) {
        const { eventType, new: newData, old: oldData } = payload;
        
        switch (eventType) {
            case 'INSERT':
                this.categories.push(newData);
                break;
            case 'UPDATE':
                const updateIndex = this.categories.findIndex(cat => cat.id === newData.id);
                if (updateIndex !== -1) {
                    this.categories[updateIndex] = newData;
                }
                break;
            case 'DELETE':
                this.categories = this.categories.filter(cat => cat.id !== oldData.id);
                break;
        }
        
        this.renderCategories();
    }
    
    async loadAds() {
        try {
            const { data: ads, error } = await this.supabase
                .from('advertisements')
                .select('*')
                .eq('active', true)
                .order('created_at', { ascending: false });
                
            if (!error && ads) {
                this.ads = ads;
                this.showAds();
            }
            
        } catch (error) {
            console.log('No ads table found, skipping ads');
        }
    }
    
    showAds() {
        this.ads.forEach(ad => {
            const adElement = document.getElementById(ad.position + '-ad-banner');
            if (adElement) {
                const adBody = adElement.querySelector('.ad-body');
                if (adBody) {
                    adBody.innerHTML = ad.content;
                    adElement.style.display = 'block';
                }
            }
        });
    }
    
    updateStats() {
        const totalApks = this.apks.length;
        const totalDownloads = this.apks.reduce((sum, apk) => sum + (apk.download_count || 0), 0);
        const avgRating = totalApks > 0 ? 
            (this.apks.reduce((sum, apk) => sum + (apk.rating || 0), 0) / totalApks).toFixed(1) : '0.0';
        
        this.updateElement('total-apks', totalApks);
        this.updateElement('total-downloads', this.formatNumber(totalDownloads));
        this.updateElement('avg-rating', avgRating);
    }
    
    renderCategories() {
        const container = document.getElementById('categories-grid');
        if (!container) return;
        
        if (this.categories.length === 0) {
            container.innerHTML = '<div class="empty-state">No categories found</div>';
            return;
        }
        
        container.innerHTML = this.categories.map(category => `
            <div class="category-card" onclick="app.filterByCategory('${category.name}')">
                <div class="category-icon" style="background: ${category.color}20; color: ${category.color}">
                    <i class="${category.icon || 'fas fa-folder'}"></i>
                </div>
                <div class="category-info">
                    <h3>${category.name}</h3>
                    <p>${category.description || ''}</p>
                    <span class="category-count">${category.count || 0} apps</span>
                </div>
            </div>
        `).join('');
    }
    
    renderAPKs(containerId = null, apks = null) {
        const containers = containerId ? [containerId] : ['featured-apks', 'latest-apks', 'trending-apks'];
        const apkList = apks || this.apks;
        
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (!container) return;
            
            let filteredApks = apkList;
            
            // Filter based on container type
            if (id === 'featured-apks') {
                filteredApks = apkList.filter(apk => apk.featured).slice(0, 6);
            } else if (id === 'trending-apks') {
                filteredApks = apkList.filter(apk => apk.trending).slice(0, 8);
            } else if (id === 'latest-apks') {
                filteredApks = apkList.slice(0, 8);
            }
            
            if (filteredApks.length === 0) {
                container.innerHTML = '<div class="empty-state">No APKs found</div>';
                return;
            }
            
            container.innerHTML = filteredApks.map(apk => `
                <div class="apk-card" onclick="app.showAPKDetails('${apk.id}')">
                    <div class="apk-image">
                        <img src="${apk.icon_url || '/default-icon.png'}" alt="${apk.name}" 
                             onerror="this.src='https://via.placeholder.com/80x80/1FB8CD/white?text=APK'">
                        ${apk.verified ? '<div class="verified-badge"><i class="fas fa-check-circle"></i></div>' : ''}
                    </div>
                    <div class="apk-info">
                        <h3 class="apk-name">${apk.name}</h3>
                        <p class="apk-category">${apk.category}</p>
                        <div class="apk-meta">
                            <span class="version">v${apk.version}</span>
                            <span class="size">${apk.file_size || 'Unknown'}</span>
                        </div>
                        <div class="apk-stats">
                            <div class="rating">
                                <div class="stars">${this.renderStars(apk.rating || 0)}</div>
                                <span>${(apk.rating || 0).toFixed(1)}</span>
                            </div>
                            <div class="downloads">
                                <i class="fas fa-download"></i>
                                <span>${this.formatNumber(apk.download_count || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        });
    }
    
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (halfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }
    
    async handleSearch(query) {
        if (!query.trim()) {
            this.showView('home');
            return;
        }
        
        try {
            const { data: results, error } = await this.supabase
                .from('apks')
                .select('*')
                .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
                .order('download_count', { ascending: false });
                
            if (error) throw error;
            
            this.showView('search');
            this.renderAPKs('search-results', results || []);
            
        } catch (error) {
            console.error('Search failed:', error);
            // Fallback to local search
            const results = this.apks.filter(apk =>
                apk.name.toLowerCase().includes(query.toLowerCase()) ||
                (apk.description && apk.description.toLowerCase().includes(query.toLowerCase()))
            );
            
            this.showView('search');
            this.renderAPKs('search-results', results);
        }
    }
    
    filterByCategory(categoryName) {
        const results = this.apks.filter(apk => apk.category === categoryName);
        this.showView('search');
        
        // Update header
        const container = document.getElementById('search-results').parentElement;
        const header = container.querySelector('h1');
        if (header) {
            header.textContent = `${categoryName} Apps`;
        }
        
        this.renderAPKs('search-results', results);
    }
    
    showAPKDetails(apkId) {
        const apk = this.apks.find(a => a.id === apkId);
        if (!apk) return;
        
        this.selectedApk = apk;
        
        // Update modal content
        this.updateElement('modal-apk-name', apk.name);
        this.updateElement('modal-apk-category', apk.category);
        this.updateElement('modal-apk-version', 'v' + apk.version);
        this.updateElement('modal-apk-size', apk.file_size || 'Unknown');
        this.updateElement('modal-apk-android', apk.android_version || 'Android 5.0+');
        this.updateElement('modal-apk-rating', (apk.rating || 0).toFixed(1));
        this.updateElement('modal-apk-reviews', apk.review_count || 0);
        this.updateElement('modal-apk-description', apk.description || 'No description available.');
        
        const iconImg = document.getElementById('modal-apk-icon');
        if (iconImg) {
            iconImg.src = apk.icon_url || 'https://via.placeholder.com/80x80/1FB8CD/white?text=APK';
            iconImg.onerror = () => iconImg.src = 'https://via.placeholder.com/80x80/1FB8CD/white?text=APK';
        }
        
        const starsContainer = document.getElementById('modal-apk-stars');
        if (starsContainer) {
            starsContainer.innerHTML = this.renderStars(apk.rating || 0);
        }
        
        this.showModal('apk-modal');
    }
    
    async downloadAPK() {
        if (!this.selectedApk) return;
        
        try {
            // Track download
            if (this.currentUser) {
                await this.supabase
                    .from('downloads')
                    .insert([{
                        apk_id: this.selectedApk.id,
                        user_id: this.currentUser.id
                    }]);
            }
            
            // Open download link
            if (this.selectedApk.download_url) {
                window.open(this.selectedApk.download_url, '_blank');
                this.showToast('Download started!', 'success');
            } else {
                this.showToast('Download link not available', 'error');
            }
            
        } catch (error) {
            console.error('Download failed:', error);
            this.showToast('Download failed. Please try again.', 'error');
        }
    }
    
    async handleLogin(formData) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: formData.get('email'),
                password: formData.get('password')
            });
            
            if (error) throw error;
            
            this.closeModal('login-modal');
            
        } catch (error) {
            console.error('Login failed:', error);
            this.showToast('Login failed: ' + error.message, 'error');
        }
    }
    
    async handleSignup(formData) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email: formData.get('email'),
                password: formData.get('password'),
                options: {
                    data: {
                        username: formData.get('username')
                    }
                }
            });
            
            if (error) throw error;
            
            this.closeModal('signup-modal');
            this.showToast('Account created successfully! Please check your email.', 'success');
            
        } catch (error) {
            console.error('Signup failed:', error);
            this.showToast('Signup failed: ' + error.message, 'error');
        }
    }
    
    async logout() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
        } catch (error) {
            console.error('Logout failed:', error);
            this.showToast('Logout failed', 'error');
        }
    }
    
    showView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Show selected view
        const targetView = document.getElementById(viewName + '-view');
        if (targetView) {
            targetView.classList.add('active');
        }
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const navItem = document.querySelector(`[onclick="showView('${viewName}')"]`);
        if (navItem) {
            navItem.classList.add('active');
        }
        
        this.currentView = viewName;
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    showLogin() {
        this.closeModal('signup-modal');
        this.showModal('login-modal');
    }
    
    showSignup() {
        this.closeModal('login-modal');
        this.showModal('signup-modal');
    }
    
    openAdmin() {
        window.open('admin.html', '_blank');
    }
    
    closeAd(adId) {
        const ad = document.getElementById(adId);
        if (ad) {
            ad.style.display = 'none';
        }
    }
    
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.display = 'block';
        }
    }
    
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }
}

// Global functions for onclick handlers
function showView(viewName) {
    app.showView(viewName);
}

function showLogin() {
    app.showLogin();
}

function showSignup() {
    app.showSignup();
}

function logout() {
    app.logout();
}

function closeModal(modalId) {
    app.closeModal(modalId);
}

function downloadAPK() {
    app.downloadAPK();
}

function closeAd(adId) {
    app.closeAd(adId);
}

function scrollToTop() {
    app.scrollToTop();
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ModAPKApp();
});