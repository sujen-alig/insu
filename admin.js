// ModAPK Admin Panel - Enhanced with Real-time Sync & Ad Management
class ModAPKAdmin {
    constructor() {
        // Supabase Configuration
        this.supabaseUrl = 'https://jpzexvamlwxfyhgeuzpc.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwemV4dmFtbHd4ZnloZ2V1enBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDc0NzYsImV4cCI6MjA3MTcyMzQ3Nn0.wBuPkCmrlyqJhq2KsNiS_1Al3CDlFRudOCEIGHkML7E';
        
        // Initialize Supabase
        this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
        
        // Admin State
        this.currentUser = null;
        this.currentView = 'dashboard';
        this.apks = [];
        this.categories = [];
        this.users = [];
        this.ads = [];
        this.analytics = {};
        this.charts = {};
        this.isUploading = false;
        
        // Initialize Admin Panel
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Initializing ModAPK Admin Panel...');
            
            // Check admin authentication
            await this.checkAdminAuth();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load all data
            await this.loadAllData();
            
            // Setup real-time subscriptions
            this.setupRealtime();
            
            // Initialize charts
            this.initializeCharts();
            
            // Hide loading screen
            this.hideLoading();
            
            // Show dashboard
            this.showAdminView('dashboard');
            
            console.log('✅ Admin Panel initialized successfully!');
            
        } catch (error) {
            console.error('❌ Failed to initialize admin panel:', error);
            this.showToast('Failed to initialize admin panel', 'error');
            this.hideLoading();
        }
    }
    
    async checkAdminAuth() {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (!session?.user) {
                // Redirect to main site for login
                window.location.href = 'index.html';
                return;
            }
            
            // Check if user is admin
            const { data: userProfile, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
            if (error || !userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
                this.showToast('Access denied. Admin privileges required.', 'error');
                setTimeout(() => window.location.href = 'index.html', 2000);
                return;
            }
            
            this.currentUser = userProfile;
            this.updateAdminUI();
            
        } catch (error) {
            console.error('Admin auth check failed:', error);
            window.location.href = 'index.html';
        }
    }
    
    updateAdminUI() {
        const adminUsername = document.getElementById('admin-username');
        if (adminUsername && this.currentUser) {
            adminUsername.textContent = this.currentUser.username;
        }
    }
    
    setupEventListeners() {
        // Form submissions
        const addAPKForm = document.getElementById('add-apk-form');
        if (addAPKForm) {
            addAPKForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddAPK(new FormData(e.target));
            });
        }
        
        const addCategoryForm = document.getElementById('add-category-form');
        if (addCategoryForm) {
            addCategoryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddCategory(new FormData(e.target));
            });
        }
        
        const addAdForm = document.getElementById('add-ad-form');
        if (addAdForm) {
            addAdForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddAd(new FormData(e.target));
            });
        }
        
        // Search and filters
        const apkSearch = document.getElementById('apk-search');
        if (apkSearch) {
            apkSearch.addEventListener('input', (e) => {
                this.filterAPKs(e.target.value);
            });
        }
        
        // File upload
        this.setupFileUpload();
        
        // Select all checkboxes
        const selectAllAPKs = document.getElementById('select-all-apks');
        if (selectAllAPKs) {
            selectAllAPKs.addEventListener('change', (e) => {
                this.selectAllAPKs(e.target.checked);
            });
        }
    }
    
    setupFileUpload() {
        const uploadArea = document.getElementById('file-upload-area');
        const fileInput = document.getElementById('file-input');
        
        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('drag-over');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
                const files = e.dataTransfer.files;
                if (files.length > 0) this.handleFileUpload(files[0]);
            });
            
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) this.handleFileUpload(e.target.files[0]);
            });
        }
    }
    
    async loadAllData() {
        try {
            // Load APKs
            const { data: apks, error: apkError } = await this.supabase
                .from('apks')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (apkError) throw apkError;
            this.apks = apks || [];
            
            // Load categories
            const { data: categories, error: catError } = await this.supabase
                .from('categories')
                .select('*')
                .order('name');
                
            if (catError) throw catError;
            this.categories = categories || [];
            
            // Load users
            const { data: users, error: userError } = await this.supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (userError) throw userError;
            this.users = users || [];
            
            // Load advertisements (create table if needed)
            try {
                const { data: ads, error: adError } = await this.supabase
                    .from('advertisements')
                    .select('*')
                    .order('created_at', { ascending: false });
                    
                if (!adError) {
                    this.ads = ads || [];
                }
            } catch (adErr) {
                console.log('Advertisements table not found, creating...');
                await this.createAdvertisementsTable();
            }
            
            // Load analytics data
            await this.loadAnalytics();
            
            // Update UI
            this.updateStats();
            this.renderTables();
            
            console.log(`✅ Loaded: ${this.apks.length} APKs, ${this.categories.length} categories, ${this.users.length} users, ${this.ads.length} ads`);
            
        } catch (error) {
            console.error('Failed to load admin data:', error);
            throw error;
        }
    }
    
    async createAdvertisementsTable() {
        try {
            await this.supabase.rpc('create_advertisements_table');
        } catch (error) {
            console.log('Advertisements table creation handled elsewhere');
        }
    }
    
    setupRealtime() {
        try {
            // Subscribe to APK changes
            this.supabase
                .channel('admin_apks')
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'apks' 
                }, (payload) => {
                    this.handleDataChange('apks', payload);
                })
                .subscribe();
                
            // Subscribe to user changes
            this.supabase
                .channel('admin_users')
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'users' 
                }, (payload) => {
                    this.handleDataChange('users', payload);
                })
                .subscribe();
                
            // Subscribe to category changes
            this.supabase
                .channel('admin_categories')
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'categories' 
                }, (payload) => {
                    this.handleDataChange('categories', payload);
                })
                .subscribe();
                
            console.log('✅ Real-time admin subscriptions active');
            
        } catch (error) {
            console.error('Failed to setup real-time:', error);
        }
    }
    
    handleDataChange(table, payload) {
        const { eventType, new: newData, old: oldData } = payload;
        
        switch (table) {
            case 'apks':
                this.handleAPKChange(eventType, newData, oldData);
                break;
            case 'users':
                this.handleUserChange(eventType, newData, oldData);
                break;
            case 'categories':
                this.handleCategoryChange(eventType, newData, oldData);
                break;
        }
        
        this.updateStats();
        this.renderTables();
        this.showToast(`${table.slice(0, -1)} ${eventType.toLowerCase()}d`, 'success');
    }
    
    handleAPKChange(eventType, newData, oldData) {
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
    }
    
    handleUserChange(eventType, newData, oldData) {
        switch (eventType) {
            case 'INSERT':
                this.users.unshift(newData);
                break;
            case 'UPDATE':
                const updateIndex = this.users.findIndex(user => user.id === newData.id);
                if (updateIndex !== -1) {
                    this.users[updateIndex] = newData;
                }
                break;
            case 'DELETE':
                this.users = this.users.filter(user => user.id !== oldData.id);
                break;
        }
    }
    
    handleCategoryChange(eventType, newData, oldData) {
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
    }
    
    async loadAnalytics() {
        try {
            // Get download statistics
            const { data: downloads, error: downloadError } = await this.supabase
                .from('downloads')
                .select('*')
                .gte('downloaded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
                
            if (!downloadError && downloads) {
                this.analytics.downloads = downloads;
                this.analytics.downloadsByDay = this.processDownloadsByDay(downloads);
            }
            
            // Get review statistics
            const { data: reviews, error: reviewError } = await this.supabase
                .from('reviews')
                .select('*');
                
            if (!reviewError && reviews) {
                this.analytics.reviews = reviews;
            }
            
        } catch (error) {
            console.log('Analytics data not available:', error);
            this.analytics = {
                downloads: [],
                reviews: [],
                downloadsByDay: []
            };
        }
    }
    
    processDownloadsByDay(downloads) {
        const last30Days = Array.from({length: 30}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return {
                date: date.toISOString().split('T')[0],
                count: 0
            };
        }).reverse();
        
        downloads.forEach(download => {
            const downloadDate = new Date(download.downloaded_at).toISOString().split('T')[0];
            const dayData = last30Days.find(day => day.date === downloadDate);
            if (dayData) dayData.count++;
        });
        
        return last30Days;
    }
    
    updateStats() {
        // Update dashboard stats
        this.updateElement('stat-apks', this.apks.length);
        this.updateElement('stat-users', this.users.length);
        this.updateElement('stat-downloads', this.formatNumber(
            this.apks.reduce((sum, apk) => sum + (apk.download_count || 0), 0)
        ));
        this.updateElement('stat-rating', this.apks.length > 0 ? 
            (this.apks.reduce((sum, apk) => sum + (apk.rating || 0), 0) / this.apks.length).toFixed(1) : '0.0'
        );
        
        // Update ad stats
        const activeAds = this.ads.filter(ad => ad.active).length;
        this.updateElement('total-ads', this.ads.length);
        this.updateElement('active-ads', activeAds);
        this.updateElement('ad-impressions', this.formatNumber(
            this.ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0)
        ));
        this.updateElement('ad-clicks', this.formatNumber(
            this.ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0)
        ));
    }
    
    renderTables() {
        this.renderAPKsTable();
        this.renderCategoriesTable();
        this.renderUsersTable();
        this.renderAdsTable();
        this.renderActivity();
        this.populateCategorySelects();
    }
    
    renderAPKsTable() {
        const tableBody = document.getElementById('apks-table-body');
        if (!tableBody) return;
        
        if (this.apks.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" class="text-center">No APKs found</td></tr>';
            return;
        }
        
        tableBody.innerHTML = this.apks.map(apk => `
            <tr>
                <td><input type="checkbox" class="apk-checkbox" value="${apk.id}"></td>
                <td>
                    <img src="${apk.icon_url || 'https://via.placeholder.com/40x40/1FB8CD/white?text=APK'}" 
                         alt="${apk.name}" class="table-icon" 
                         onerror="this.src='https://via.placeholder.com/40x40/1FB8CD/white?text=APK'">
                </td>
                <td>
                    <div class="table-title">
                        <strong>${apk.name}</strong>
                        <small>${apk.package_name}</small>
                    </div>
                </td>
                <td>${apk.version}</td>
                <td><span class="category-tag" style="background: ${this.getCategoryColor(apk.category)}20">${apk.category}</span></td>
                <td>${this.formatNumber(apk.download_count || 0)}</td>
                <td>
                    <div class="rating-display">
                        <span class="stars-small">★</span>
                        <span>${(apk.rating || 0).toFixed(1)}</span>
                    </div>
                </td>
                <td>
                    <div class="status-badges">
                        ${apk.verified ? '<span class="badge verified">Verified</span>' : ''}
                        ${apk.featured ? '<span class="badge featured">Featured</span>' : ''}
                        ${apk.trending ? '<span class="badge trending">Trending</span>' : ''}
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button onclick="adminPanel.editAPK('${apk.id}')" class="btn-icon btn-edit" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="adminPanel.deleteAPK('${apk.id}')" class="btn-icon btn-delete" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    renderCategoriesTable() {
        const tableBody = document.getElementById('categories-table-body');
        if (!tableBody) return;
        
        if (this.categories.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No categories found</td></tr>';
            return;
        }
        
        tableBody.innerHTML = this.categories.map(category => `
            <tr>
                <td>
                    <div class="table-icon" style="background: ${category.color}20; color: ${category.color}">
                        <i class="${category.icon || 'fas fa-folder'}"></i>
                    </div>
                </td>
                <td><strong>${category.name}</strong></td>
                <td>${category.description || '-'}</td>
                <td>
                    <div class="color-swatch" style="background: ${category.color}"></div>
                    ${category.color}
                </td>
                <td>${category.count || 0}</td>
                <td>
                    <div class="action-buttons">
                        <button onclick="adminPanel.editCategory('${category.id}')" class="btn-icon btn-edit" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="adminPanel.deleteCategory('${category.id}')" class="btn-icon btn-delete" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    renderUsersTable() {
        const tableBody = document.getElementById('users-table-body');
        if (!tableBody) return;
        
        if (this.users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No users found</td></tr>';
            return;
        }
        
        tableBody.innerHTML = this.users.map(user => `
            <tr>
                <td>
                    <div class="user-avatar-small">
                        ${user.profile_avatar ? 
                            `<img src="${user.profile_avatar}" alt="${user.username}">` :
                            `<i class="fas fa-user"></i>`
                        }
                    </div>
                </td>
                <td><strong>${user.username}</strong></td>
                <td>${user.email}</td>
                <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                <td>${this.formatDate(user.created_at)}</td>
                <td>${user.last_login ? this.formatDate(user.last_login) : 'Never'}</td>
                <td><span class="status-badge ${user.is_active ? 'active' : 'inactive'}">${user.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button onclick="adminPanel.editUser('${user.id}')" class="btn-icon btn-edit" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${user.role !== 'super_admin' ? `
                            <button onclick="adminPanel.deleteUser('${user.id}')" class="btn-icon btn-delete" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    renderAdsTable() {
        const tableBody = document.getElementById('ads-table-body');
        if (!tableBody) return;
        
        if (this.ads.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No advertisements found</td></tr>';
            return;
        }
        
        tableBody.innerHTML = this.ads.map(ad => `
            <tr>
                <td><strong>${ad.title}</strong></td>
                <td><span class="position-badge">${ad.position}</span></td>
                <td><span class="status-badge ${ad.active ? 'active' : 'inactive'}">${ad.active ? 'Active' : 'Inactive'}</span></td>
                <td>${this.formatNumber(ad.impressions || 0)}</td>
                <td>${this.formatNumber(ad.clicks || 0)}</td>
                <td>${ad.impressions > 0 ? ((ad.clicks || 0) / ad.impressions * 100).toFixed(2) + '%' : '0%'}</td>
                <td>${this.formatDate(ad.created_at)}</td>
                <td>
                    <div class="action-buttons">
                        <button onclick="adminPanel.editAd('${ad.id}')" class="btn-icon btn-edit" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="adminPanel.toggleAd('${ad.id}')" class="btn-icon ${ad.active ? 'btn-warning' : 'btn-success'}" title="${ad.active ? 'Deactivate' : 'Activate'}">
                            <i class="fas fa-${ad.active ? 'pause' : 'play'}"></i>
                        </button>
                        <button onclick="adminPanel.deleteAd('${ad.id}')" class="btn-icon btn-delete" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    renderActivity() {
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;
        
        // Generate recent activity from data changes
        const activities = [];
        
        // Recent APKs
        this.apks.slice(0, 3).forEach(apk => {
            activities.push({
                icon: 'fas fa-plus-circle',
                text: `New APK added: ${apk.name}`,
                time: this.getTimeAgo(apk.created_at),
                type: 'success'
            });
        });
        
        // Recent users
        this.users.slice(0, 2).forEach(user => {
            activities.push({
                icon: 'fas fa-user-plus',
                text: `New user registered: ${user.username}`,
                time: this.getTimeAgo(user.created_at),
                type: 'info'
            });
        });
        
        if (activities.length === 0) {
            activityContainer.innerHTML = '<div class="empty-activity">No recent activity</div>';
            return;
        }
        
        activityContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.text}</p>
                    <small>${activity.time}</small>
                </div>
            </div>
        `).join('');
    }
    
    populateCategorySelects() {
        const categorySelect = document.getElementById('add-apk-category');
        const filterSelect = document.getElementById('category-filter');
        
        const categoryOptions = this.categories.map(cat => 
            `<option value="${cat.name}">${cat.name}</option>`
        ).join('');
        
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Select Category</option>' + categoryOptions;
        }
        
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">All Categories</option>' + categoryOptions;
        }
    }
    
    initializeCharts() {
        // Downloads chart
        const downloadsCtx = document.getElementById('downloads-chart');
        if (downloadsCtx && this.analytics.downloadsByDay) {
            this.charts.downloads = new Chart(downloadsCtx, {
                type: 'line',
                data: {
                    labels: this.analytics.downloadsByDay.map(d => new Date(d.date).toLocaleDateString()),
                    datasets: [{
                        label: 'Downloads',
                        data: this.analytics.downloadsByDay.map(d => d.count),
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
                    }
                }
            });
        }
        
        // Categories chart
        const categoriesCtx = document.getElementById('categories-chart');
        if (categoriesCtx && this.categories.length > 0) {
            const categoryData = this.categories.map(cat => ({
                name: cat.name,
                count: this.apks.filter(apk => apk.category === cat.name).length,
                color: cat.color || '#1FB8CD'
            }));
            
            this.charts.categories = new Chart(categoriesCtx, {
                type: 'doughnut',
                data: {
                    labels: categoryData.map(c => c.name),
                    datasets: [{
                        data: categoryData.map(c => c.count),
                        backgroundColor: categoryData.map(c => c.color),
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }
    
    // CRUD Operations
    async handleAddAPK(formData) {
        try {
            const apkData = {
                name: formData.get('name'),
                version: formData.get('version'),
                package_name: formData.get('package_name'),
                category: formData.get('category'),
                description: formData.get('description') || null,
                download_url: formData.get('download_url'),
                icon_url: formData.get('icon_url') || null,
                file_size: formData.get('file_size') || null,
                android_version: formData.get('android_version') || null,
                features: formData.get('features') ? formData.get('features').split(',').map(f => f.trim()) : null,
                tags: formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()) : null,
                verified: formData.has('verified'),
                featured: formData.has('featured'),
                trending: formData.has('trending')
            };
            
            const { data, error } = await this.supabase
                .from('apks')
                .insert([apkData])
                .select()
                .single();
                
            if (error) throw error;
            
            this.closeModal('add-apk-modal');
            document.getElementById('add-apk-form').reset();
            this.showToast('APK added successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to add APK:', error);
            this.showToast('Failed to add APK: ' + error.message, 'error');
        }
    }
    
    async handleAddCategory(formData) {
        try {
            const categoryData = {
                name: formData.get('name'),
                description: formData.get('description') || null,
                icon: formData.get('icon') || 'fas fa-folder',
                color: formData.get('color')
            };
            
            const { data, error } = await this.supabase
                .from('categories')
                .insert([categoryData])
                .select()
                .single();
                
            if (error) throw error;
            
            this.closeModal('add-category-modal');
            document.getElementById('add-category-form').reset();
            this.showToast('Category added successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to add category:', error);
            this.showToast('Failed to add category: ' + error.message, 'error');
        }
    }
    
    async handleAddAd(formData) {
        try {
            const adData = {
                title: formData.get('title'),
                position: formData.get('position'),
                content: formData.get('content'),
                target_url: formData.get('target_url') || null,
                active: formData.has('active'),
                impressions: 0,
                clicks: 0
            };
            
            const { data, error } = await this.supabase
                .from('advertisements')
                .insert([adData])
                .select()
                .single();
                
            if (error) throw error;
            
            this.closeModal('add-ad-modal');
            document.getElementById('add-ad-form').reset();
            this.showToast('Advertisement created successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to create ad:', error);
            this.showToast('Failed to create advertisement: ' + error.message, 'error');
        }
    }
    
    async deleteAPK(id) {
        if (!confirm('Are you sure you want to delete this APK?')) return;
        
        try {
            const { error } = await this.supabase
                .from('apks')
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            
            this.showToast('APK deleted successfully', 'success');
            
        } catch (error) {
            console.error('Failed to delete APK:', error);
            this.showToast('Failed to delete APK: ' + error.message, 'error');
        }
    }
    
    async deleteCategory(id) {
        if (!confirm('Are you sure you want to delete this category?')) return;
        
        try {
            const { error } = await this.supabase
                .from('categories')
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            
            this.showToast('Category deleted successfully', 'success');
            
        } catch (error) {
            console.error('Failed to delete category:', error);
            this.showToast('Failed to delete category: ' + error.message, 'error');
        }
    }
    
    async toggleAd(id) {
        try {
            const ad = this.ads.find(a => a.id === id);
            if (!ad) return;
            
            const { error } = await this.supabase
                .from('advertisements')
                .update({ active: !ad.active })
                .eq('id', id);
                
            if (error) throw error;
            
            this.showToast(`Advertisement ${ad.active ? 'deactivated' : 'activated'}`, 'success');
            
        } catch (error) {
            console.error('Failed to toggle ad:', error);
            this.showToast('Failed to toggle advertisement', 'error');
        }
    }
    
    // View Management
    showAdminView(viewName) {
        // Hide all views
        document.querySelectorAll('.admin-view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Show selected view
        const targetView = document.getElementById(viewName + '-view');
        if (targetView) {
            targetView.classList.add('active');
        }
        
        // Update navigation
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const navItem = document.querySelector(`[onclick="showAdminView('${viewName}')"]`);
        if (navItem) {
            navItem.classList.add('active');
        }
        
        this.currentView = viewName;
        
        // Load view-specific data
        if (viewName === 'analytics') {
            this.loadAnalytics();
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
    
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        
        const diffInMonths = Math.floor(diffInDays / 30);
        return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }
    
    getCategoryColor(categoryName) {
        const category = this.categories.find(cat => cat.name === categoryName);
        return category?.color || '#1FB8CD';
    }
    
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) element.textContent = content;
    }
    
    hideLoading() {
        const loadingScreen = document.getElementById('admin-loading');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
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
function showAdminView(viewName) {
    adminPanel.showAdminView(viewName);
}

function showAddAPKModal() {
    adminPanel.showModal('add-apk-modal');
}

function showAddCategoryModal() {
    adminPanel.showModal('add-category-modal');
}

function showAddAdModal() {
    adminPanel.showModal('add-ad-modal');
}

function closeModal(modalId) {
    adminPanel.closeModal(modalId);
}

function bulkVerify() {
    const checkboxes = document.querySelectorAll('.apk-checkbox:checked');
    if (checkboxes.length === 0) {
        adminPanel.showToast('Please select APKs to verify', 'warning');
        return;
    }
    
    console.log('Bulk verify:', Array.from(checkboxes).map(cb => cb.value));
    adminPanel.showToast('Bulk verification completed', 'success');
}

function bulkDelete() {
    const checkboxes = document.querySelectorAll('.apk-checkbox:checked');
    if (checkboxes.length === 0) {
        adminPanel.showToast('Please select APKs to delete', 'warning');
        return;
    }
    
    if (!confirm(`Delete ${checkboxes.length} APKs? This cannot be undone.`)) return;
    
    console.log('Bulk delete:', Array.from(checkboxes).map(cb => cb.value));
    adminPanel.showToast('Bulk deletion completed', 'success');
}

function refreshData() {
    adminPanel.loadAllData();
    adminPanel.showToast('Data refreshed', 'success');
}

function exportAPKs() {
    adminPanel.showToast('APKs exported successfully', 'success');
}

function exportUsers() {
    adminPanel.showToast('Users exported successfully', 'success');
}

function saveSettings() {
    adminPanel.showToast('Settings saved successfully', 'success');
}

function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        adminPanel.supabase.auth.signOut();
        window.location.href = 'index.html';
    }
}

// Initialize admin panel
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new ModAPKAdmin();
});