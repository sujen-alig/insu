// ModAPK Platform - 100% Real Data (No Demo) - Complete Supabase Integration
class ModAPKPlatform {
    constructor() {
        // Hardcoded Supabase configuration - YOUR REAL CREDENTIALS
        this.supabaseUrl = 'https://jpzexvamlwxfyhgeuzpc.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwemV4dmFtbHd4ZnloZ2V1enBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDc0NzYsImV4cCI6MjA3MTcyMzQ3Nn0.wBuPkCmrlyqJhq2KsNiS_1Al3CDlFRudOCEIGHkML7E';
        
        // Initialize Supabase - REQUIRED
        this.supabase = null;
        this.initSupabase();
        
        // Application state - NO DEMO DATA
        this.currentUser = null;
        this.currentView = 'main';
        this.apks = []; // Always empty - loaded from database
        this.categories = []; // Always empty - loaded from database  
        this.filteredApks = [];
        this.isAdmin = false;
        this.downloadProgress = {};
        this.realTimeSubscriptions = [];
        
        // Storage buckets
        this.buckets = {
            apkFiles: 'apk-files',
            screenshots: 'screenshots', 
            icons: 'icons',
            avatars: 'user-avatars'
        };
        
        this.init();
    }
    
    initSupabase() {
        try {
            if (typeof supabase === 'undefined') {
                throw new Error('Supabase library not loaded');
            }
            this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
            console.log('✅ Supabase connected successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Supabase:', error);
            this.showError('Failed to connect to database. Please refresh the page.');
        }
    }
    
    async init() {
        if (!this.supabase) {
            this.showError('Database connection required. Please refresh the page.');
            return;
        }
        
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            // Load real data from database
            await this.loadAllData();
            
            // Check authentication state
            await this.checkAuthState();
            
            // Setup real-time subscriptions
            this.setupRealtimeSubscriptions();
            
            // Render UI with real data
            this.renderAllViews();
            
            console.log('✅ Platform initialized with real data only');
        } catch (error) {
            console.error('❌ Failed to initialize platform:', error);
            this.showError('Failed to load data. Please check your connection and refresh.');
        }
    }
    
    async loadAllData() {
        try {
            // Load categories from database
            const { data: categories, error: catError } = await this.supabase
                .from('categories')
                .select('*')
                .order('name');
                
            if (catError) throw catError;
            this.categories = categories || [];
            
            // Load APKs from database
            const { data: apks, error: apkError } = await this.supabase
                .from('apks')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (apkError) throw apkError;
            this.apks = apks || [];
            this.filteredApks = [...this.apks];
            
            console.log(`✅ Loaded ${this.categories.length} categories and ${this.apks.length} APKs from database`);
            
        } catch (error) {
            console.error('❌ Failed to load data:', error);
            throw error;
        }
    }
    
    setupRealtimeSubscriptions() {
        if (!this.supabase) return;
        
        try {
            // Subscribe to APK changes
            const apkSubscription = this.supabase
                .channel('apks_changes')
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'apks' 
                }, (payload) => {
                    console.log('APK changed:', payload);
                    this.handleApkChange(payload);
                })
                .subscribe();
                
            // Subscribe to category changes  
            const categorySubscription = this.supabase
                .channel('categories_changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public', 
                    table: 'categories'
                }, (payload) => {
                    console.log('Category changed:', payload);
                    this.handleCategoryChange(payload);
                })
                .subscribe();
                
            this.realTimeSubscriptions.push(apkSubscription, categorySubscription);
            console.log('✅ Real-time subscriptions active');
        } catch (error) {
            console.error('❌ Failed to setup real-time subscriptions:', error);
        }
    }
    
    handleApkChange(payload) {
        const { eventType, new: newData, old: oldData } = payload;
        
        switch (eventType) {
            case 'INSERT':
                this.apks.unshift(newData);
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
        
        this.applyCurrentFilter();
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
    
    async checkAuthState() {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (session?.user) {
                await this.handleUserSession(session.user);
            }
            
            // Listen for auth changes
            this.supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    await this.handleUserSession(session.user);
                } else if (event === 'SIGNED_OUT') {
                    this.handleUserSignOut();
                }
            });
            
        } catch (error) {
            console.error('❌ Auth check failed:', error);
        }
    }
    
    async handleUserSession(user) {
        try {
            // Get or create user profile
            let { data: userProfile, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();
                
            if (error && error.code === 'PGRST116') {
                // User doesn't exist, create profile
                const { data: newProfile, error: createError } = await this.supabase
                    .from('users')
                    .insert([{
                        id: user.id,
                        email: user.email,
                        username: user.email.split('@')[0],
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
            console.log('✅ User authenticated:', userProfile.username);
            
        } catch (error) {
            console.error('❌ Failed to handle user session:', error);
        }
    }
    
    handleUserSignOut() {
        this.currentUser = null;
        this.isAdmin = false;
        this.updateAuthUI();
        console.log('✅ User signed out');
    }
    
    updateAuthUI() {
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const userMenu = document.getElementById('user-menu');
        const adminBtn = document.getElementById('admin-btn');
        
        if (this.currentUser) {
            // User is logged in
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'flex';
                const userName = userMenu.querySelector('#user-name');
                if (userName) userName.textContent = this.currentUser.username;
            }
            if (adminBtn && this.isAdmin) {
                adminBtn.style.display = 'flex';
            }
        } else {
            // User is not logged in
            if (loginBtn) loginBtn.style.display = 'flex';
            if (signupBtn) signupBtn.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
            if (adminBtn) adminBtn.style.display = 'none';
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
        
        // View switching
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-view]')) {
                const view = e.target.closest('[data-view]').dataset.view;
                this.showView(view);
            }
            
            if (e.target.closest('[data-category]')) {
                const category = e.target.closest('[data-category]').dataset.category;
                this.filterByCategory(category);
            }
        });
        
        // Modal handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
            if (e.target.classList.contains('close-modal')) {
                this.closeModal(e.target.closest('.modal'));
            }
        });
        
        // Auth handlers
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showLoginModal());
        }
        
        const signupBtn = document.getElementById('signup-btn');
        if (signupBtn) {
            signupBtn.addEventListener('click', () => this.showSignupModal());
        }
        
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }
    
    async handleSearch(query) {
        if (!query.trim()) {
            this.filteredApks = [...this.apks];
        } else {
            try {
                // Real-time search in database
                const { data, error } = await this.supabase
                    .from('apks')
                    .select('*')
                    .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
                    .order('created_at', { ascending: false });
                    
                if (error) throw error;
                this.filteredApks = data || [];
                
            } catch (error) {
                console.error('❌ Search failed:', error);
                // Fallback to local search
                this.filteredApks = this.apks.filter(apk =>
                    apk.name.toLowerCase().includes(query.toLowerCase()) ||
                    apk.description?.toLowerCase().includes(query.toLowerCase()) ||
                    apk.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
                );
            }
        }
        
        this.renderAPKs();
    }
    
    filterByCategory(category) {
        if (category === 'all') {
            this.filteredApks = [...this.apks];
        } else {
            this.filteredApks = this.apks.filter(apk => apk.category === category);
        }
        
        this.renderAPKs();
        this.updateCategoryUI(category);
    }
    
    applyCurrentFilter() {
        // Reapply current filter after data changes
        const activeCategory = document.querySelector('.category-item.active')?.dataset.category;
        const searchQuery = document.getElementById('search-input')?.value;
        
        if (searchQuery && searchQuery.trim()) {
            this.handleSearch(searchQuery);
        } else if (activeCategory && activeCategory !== 'all') {
            this.filterByCategory(activeCategory);
        } else {
            this.filteredApks = [...this.apks];
        }
    }
    
    renderAllViews() {
        this.renderCategories();
        this.renderAPKs();
        this.updateStats();
    }
    
    renderCategories() {
        const categoriesContainer = document.querySelector('.categories-grid');
        if (!categoriesContainer) return;
        
        if (this.categories.length === 0) {
            categoriesContainer.innerHTML = '<div class="empty-state">No categories found</div>';
            return;
        }
        
        categoriesContainer.innerHTML = this.categories.map(category => `
            <div class="category-card" data-category="${category.name}">
                <div class="category-icon" style="color: ${category.color}">
                    <i class="${category.icon}"></i>
                </div>
                <div class="category-info">
                    <h3>${category.name}</h3>
                    <p>${category.description || ''}</p>
                    <span class="category-count">${category.count || 0} apps</span>
                </div>
            </div>
        `).join('');
    }
    
    renderAPKs() {
        const apksContainer = document.querySelector('.apks-grid');
        if (!apksContainer) return;
        
        if (this.filteredApks.length === 0) {
            apksContainer.innerHTML = '<div class="empty-state">No APKs found</div>';
            return;
        }
        
        apksContainer.innerHTML = this.filteredApks.map(apk => `
            <div class="apk-card" data-id="${apk.id}">
                <div class="apk-image">
                    <img src="${apk.icon_url || '/default-icon.png'}" alt="${apk.name}" loading="lazy">
                    ${apk.verified ? '<div class="verified-badge"><i class="fas fa-check-circle"></i></div>' : ''}
                </div>
                <div class="apk-info">
                    <h3 class="apk-name">${apk.name}</h3>
                    <p class="apk-category">${apk.category}</p>
                    <div class="apk-meta">
                        <span class="version">v${apk.version}</span>
                        <span class="size">${apk.file_size || 'Unknown size'}</span>
                    </div>
                    <div class="apk-stats">
                        <div class="rating">
                            <i class="fas fa-star"></i>
                            <span>${apk.rating || 0}</span>
                        </div>
                        <div class="downloads">
                            <i class="fas fa-download"></i>
                            <span>${this.formatNumber(apk.download_count || 0)}</span>
                        </div>
                    </div>
                    <button class="download-btn" onclick="platform.downloadAPK('${apk.id}')">
                        <i class="fas fa-download"></i>
                        Download
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    updateStats() {
        const totalApks = this.apks.length;
        const totalDownloads = this.apks.reduce((sum, apk) => sum + (apk.download_count || 0), 0);
        const avgRating = this.apks.length > 0 ? 
            (this.apks.reduce((sum, apk) => sum + (apk.rating || 0), 0) / this.apks.length).toFixed(1) : 0;
        
        // Update stats display
        const statsElements = {
            'total-apks': totalApks,
            'total-downloads': this.formatNumber(totalDownloads),
            'avg-rating': avgRating
        };
        
        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }
    
    // File Upload Functions
    async uploadFile(file, bucket, folder = '') {
        if (!this.supabase) throw new Error('Database not connected');
        
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${folder}${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            
            const { data, error } = await this.supabase.storage
                .from(bucket)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });
                
            if (error) throw error;
            
            // Get public URL
            const { data: { publicUrl } } = this.supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);
                
            return {
                path: data.path,
                publicUrl: publicUrl,
                fullPath: `${bucket}/${fileName}`
            };
            
        } catch (error) {
            console.error('❌ File upload failed:', error);
            throw error;
        }
    }
    
    async downloadAPK(apkId) {
        try {
            const apk = this.apks.find(a => a.id === apkId);
            if (!apk) throw new Error('APK not found');
            
            // Track download
            if (this.supabase) {
                await this.supabase
                    .from('downloads')
                    .insert([{
                        apk_id: apkId,
                        user_id: this.currentUser?.id || null,
                        ip_address: null, // Will be handled by server
                        downloaded_at: new Date().toISOString()
                    }]);
            }
            
            // Start download
            if (apk.download_url) {
                window.open(apk.download_url, '_blank');
                this.showSuccess('Download started!');
            } else {
                throw new Error('Download URL not available');
            }
            
        } catch (error) {
            console.error('❌ Download failed:', error);
            this.showError('Download failed: ' + error.message);
        }
    }
    
    // Authentication Functions
    async showLoginModal() {
        const modal = this.createModal('Login', `
            <form id="login-form">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" required>
                </div>
                <button type="submit" class="btn btn--primary">Login</button>
            </form>
        `);
        
        modal.querySelector('#login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(new FormData(e.target));
        });
        
        document.body.appendChild(modal);
    }
    
    async handleLogin(formData) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: formData.get('email'),
                password: formData.get('password')
            });
            
            if (error) throw error;
            
            this.closeModal(document.querySelector('.modal'));
            this.showSuccess('Login successful!');
            
        } catch (error) {
            console.error('❌ Login failed:', error);
            this.showError('Login failed: ' + error.message);
        }
    }
    
    async showSignupModal() {
        const modal = this.createModal('Sign Up', `
            <form id="signup-form">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" required minlength="6">
                </div>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" name="username" required>
                </div>
                <button type="submit" class="btn btn--primary">Sign Up</button>
            </form>
        `);
        
        modal.querySelector('#signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup(new FormData(e.target));
        });
        
        document.body.appendChild(modal);
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
            
            this.closeModal(document.querySelector('.modal'));
            this.showSuccess('Account created successfully!');
            
        } catch (error) {
            console.error('❌ Signup failed:', error);
            this.showError('Signup failed: ' + error.message);
        }
    }
    
    async logout() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            this.showSuccess('Logged out successfully');
            
        } catch (error) {
            console.error('❌ Logout failed:', error);
            this.showError('Logout failed: ' + error.message);
        }
    }
    
    // Utility Functions
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        return modal;
    }
    
    closeModal(modal) {
        if (modal) {
            modal.remove();
        }
    }
    
    showSuccess(message) {
        this.showToast(message, 'success');
    }
    
    showError(message) {
        this.showToast(message, 'error');
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
    
    showView(viewName) {
        // Handle view switching logic
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        const targetView = document.querySelector(`[data-view="${viewName}"]`);
        if (targetView) {
            targetView.classList.add('active');
        }
        
        this.currentView = viewName;
    }
    
    // Cleanup on page unload
    destroy() {
        this.realTimeSubscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }
}

// Initialize platform when DOM is loaded
let platform;
document.addEventListener('DOMContentLoaded', () => {
    platform = new ModAPKPlatform();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (platform) {
        platform.destroy();
    }
});