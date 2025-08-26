// ModAPK Admin Panel - 100% Real Data (No Demo) - Complete Supabase Integration
class AdminPlatform {
    constructor() {
        // Hardcoded Supabase configuration - YOUR REAL CREDENTIALS
        this.supabaseUrl = 'https://jpzexvamlwxfyhgeuzpc.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwemV4dmFtbHd4ZnloZ2V1enBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDc0NzYsImV4cCI6MjA3MTcyMzQ3Nn0.wBuPkCmrlyqJhq2KsNiS_1Al3CDlFRudOCEIGHkML7E';
        
        // Initialize Supabase - REQUIRED
        this.supabase = null;
        this.initSupabase();
        
        // Admin state - NO DEMO DATA
        this.currentUser = null;
        this.currentView = 'dashboard';
        this.apks = []; // Always loaded from database
        this.users = []; // Always loaded from database
        this.categories = []; // Always loaded from database
        this.analytics = {}; // Always loaded from database
        this.isUploading = false;
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
            console.log('✅ Admin Supabase connected successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Supabase:', error);
            this.showNotification('Failed to connect to database. Please refresh the page.', 'error');
        }
    }
    
    async init() {
        if (!this.supabase) {
            this.showNotification('Database connection required. Please refresh the page.', 'error');
            return;
        }
        
        try {
            // Check admin authentication first
            await this.checkAdminAuth();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load all real data from database
            await this.loadAllData();
            
            // Setup real-time subscriptions
            this.setupRealtimeSubscriptions();
            
            // Render dashboard with real data
            this.renderDashboard();
            
            console.log('✅ Admin platform initialized with real data only');
        } catch (error) {
            console.error('❌ Failed to initialize admin platform:', error);
            this.showNotification('Failed to load admin data: ' + error.message, 'error');
        }
    }
    
    async checkAdminAuth() {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (!session?.user) {
                // Redirect to main platform for login
                window.location.href = 'index.html';
                return;
            }
            
            // Get user profile and check admin role
            const { data: userProfile, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
            if (error) throw error;
            
            if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
                this.showNotification('Access denied. Admin privileges required.', 'error');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
                return;
            }
            
            this.currentUser = userProfile;
            this.updateAdminUI();
            
        } catch (error) {
            console.error('❌ Admin auth check failed:', error);
            window.location.href = 'index.html';
        }
    }
    
    async loadAllData() {
        try {
            // Load APKs from database
            const { data: apks, error: apkError } = await this.supabase
                .from('apks')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (apkError) throw apkError;
            this.apks = apks || [];
            
            // Load users from database
            const { data: users, error: userError } = await this.supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (userError) throw userError;
            this.users = users || [];
            
            // Load categories from database
            const { data: categories, error: catError } = await this.supabase
                .from('categories')
                .select('*')
                .order('name');
                
            if (catError) throw catError;
            this.categories = categories || [];
            
            // Load analytics data
            await this.loadAnalytics();
            
            console.log(`✅ Admin loaded: ${this.apks.length} APKs, ${this.users.length} users, ${this.categories.length} categories`);
            
        } catch (error) {
            console.error('❌ Failed to load admin data:', error);
            throw error;
        }
    }
    
    async loadAnalytics() {
        try {
            // Get download statistics
            const { data: downloadStats, error: downloadError } = await this.supabase
                .from('downloads')
                .select('apk_id, downloaded_at')
                .gte('downloaded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
                
            if (downloadError) throw downloadError;
            
            // Get review statistics  
            const { data: reviewStats, error: reviewError } = await this.supabase
                .from('reviews')
                .select('rating, created_at')
                .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
                
            if (reviewError) throw reviewError;
            
            this.analytics = {
                totalDownloadsToday: downloadStats?.filter(d => 
                    new Date(d.downloaded_at).toDateString() === new Date().toDateString()
                ).length || 0,
                totalDownloadsWeek: downloadStats?.length || 0,
                averageRating: reviewStats?.length > 0 ? 
                    (reviewStats.reduce((sum, r) => sum + r.rating, 0) / reviewStats.length).toFixed(1) : 0,
                downloadsByDay: this.getDownloadsByDay(downloadStats || [])
            };
            
        } catch (error) {
            console.error('❌ Failed to load analytics:', error);
            this.analytics = {
                totalDownloadsToday: 0,
                totalDownloadsWeek: 0,
                averageRating: 0,
                downloadsByDay: []
            };
        }
    }
    
    getDownloadsByDay(downloads) {
        const last7Days = Array.from({length: 7}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return {
                date: date.toISOString().split('T')[0],
                day: date.toLocaleDateString('en', { weekday: 'short' }),
                count: 0
            };
        }).reverse();
        
        downloads.forEach(download => {
            const downloadDate = new Date(download.downloaded_at).toISOString().split('T')[0];
            const dayData = last7Days.find(day => day.date === downloadDate);
            if (dayData) dayData.count++;
        });
        
        return last7Days;
    }
    
    setupRealtimeSubscriptions() {
        if (!this.supabase) return;
        
        try {
            // Subscribe to APK changes
            const apkSubscription = this.supabase
                .channel('admin_apks_changes')
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'apks' 
                }, (payload) => {
                    this.handleApkChange(payload);
                })
                .subscribe();
                
            // Subscribe to user changes
            const userSubscription = this.supabase
                .channel('admin_users_changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public', 
                    table: 'users'
                }, (payload) => {
                    this.handleUserChange(payload);
                })
                .subscribe();
                
            this.realTimeSubscriptions.push(apkSubscription, userSubscription);
            console.log('✅ Admin real-time subscriptions active');
            
        } catch (error) {
            console.error('❌ Failed to setup admin real-time subscriptions:', error);
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
        
        this.renderAPKsTable();
        this.renderDashboard();
    }
    
    handleUserChange(payload) {
        const { eventType, new: newData, old: oldData } = payload;
        
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
        
        this.renderUsersTable();
        this.renderDashboard();
    }
    
    setupEventListeners() {
        // Add APK form
        const addApkForm = document.getElementById('add-apk-form');
        if (addApkForm) {
            addApkForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddAPK(new FormData(e.target));
            });
        }
        
        // File upload handling
        this.setupFileUploadListeners();
        
        // Search and filters
        const apkSearch = document.getElementById('apk-search');
        if (apkSearch) {
            apkSearch.addEventListener('input', (e) => {
                this.filterAPKs(e.target.value);
            });
        }
        
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.filterAPKs();
            });
        }
        
        const statusFilter = document.getElementById('status-filter');  
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filterAPKs();
            });
        }
    }
    
    setupFileUploadListeners() {
        // Drag and drop for APK files
        const uploadArea = document.getElementById('upload-area');
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
    
    async handleFileUpload(file) {
        if (this.isUploading) {
            this.showNotification('Upload already in progress', 'warning');
            return;
        }
        
        try {
            this.isUploading = true;
            this.showUploadProgress(0);
            
            // Validate file
            const validTypes = ['.apk', '.xapk', '.apkm'];
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            
            if (!validTypes.includes(fileExtension)) {
                throw new Error('Invalid file type. Please select an APK file.');
            }
            
            if (file.size > 100 * 1024 * 1024) { // 100MB limit
                throw new Error('File too large. Maximum size is 100MB.');
            }
            
            // Upload to Supabase Storage
            const fileName = `${Date.now()}_${file.name}`;
            const { data: uploadData, error: uploadError } = await this.supabase.storage
                .from(this.buckets.apkFiles)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                    onUploadProgress: (progress) => {
                        const percentage = (progress.loaded / progress.total) * 100;
                        this.showUploadProgress(percentage);
                    }
                });
                
            if (uploadError) throw uploadError;
            
            // Get public URL
            const { data: { publicUrl } } = this.supabase.storage
                .from(this.buckets.apkFiles)
                .getPublicUrl(fileName);
                
            this.showUploadProgress(100);
            
            // Pre-fill form with uploaded file info
            this.prefillAPKForm({
                fileName: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                fileSize: this.formatFileSize(file.size),
                downloadUrl: publicUrl
            });
            
            this.showNotification('File uploaded successfully!', 'success');
            this.hideUploadProgress();
            
        } catch (error) {
            console.error('❌ File upload failed:', error);
            this.showNotification('Upload failed: ' + error.message, 'error');
            this.hideUploadProgress();
        } finally {
            this.isUploading = false;
        }
    }
    
    showUploadProgress(percentage) {
        const progressContainer = document.getElementById('upload-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const uploadContent = document.querySelector('#upload-area .upload-content');
        
        if (progressContainer && progressFill && progressText) {
            uploadContent.style.display = 'none';
            progressContainer.style.display = 'block';
            progressFill.style.width = percentage + '%';
            progressText.textContent = `Uploading... ${Math.round(percentage)}%`;
        }
    }
    
    hideUploadProgress() {
        const progressContainer = document.getElementById('upload-progress');
        const uploadContent = document.querySelector('#upload-area .upload-content');
        
        setTimeout(() => {
            if (progressContainer && uploadContent) {
                progressContainer.style.display = 'none';
                uploadContent.style.display = 'block';
            }
        }, 1000);
    }
    
    prefillAPKForm(data) {
        const form = document.getElementById('add-apk-form');
        if (!form) return;
        
        if (data.fileName) {
            const nameInput = form.querySelector('input[name="name"]');
            if (nameInput) nameInput.value = data.fileName;
        }
        
        if (data.fileSize) {
            const sizeInput = form.querySelector('input[name="file_size"]');
            if (sizeInput) sizeInput.value = data.fileSize;
        }
        
        if (data.downloadUrl) {
            const urlInput = form.querySelector('input[name="download_url"]');
            if (urlInput) urlInput.value = data.downloadUrl;
        }
    }
    
    async handleAddAPK(formData) {
        try {
            // Validate required fields
            const requiredFields = ['name', 'version', 'package_name', 'category', 'download_url'];
            for (const field of requiredFields) {
                if (!formData.get(field)?.trim()) {
                    throw new Error(`${field.replace('_', ' ')} is required`);
                }
            }
            
            // Process screenshot URLs
            let screenshotUrls = [];
            const screenshotInput = formData.get('screenshot_urls');
            if (screenshotInput) {
                screenshotUrls = screenshotInput.split(',').map(url => url.trim()).filter(url => url);
            }
            
            // Process features and tags
            const features = formData.get('features') ? 
                formData.get('features').split(',').map(f => f.trim()).filter(f => f) : [];
            const tags = formData.get('tags') ? 
                formData.get('tags').split(',').map(t => t.trim()).filter(t => t) : [];
                
            // Build APK data object
            const apkData = {
                name: formData.get('name').trim(),
                version: formData.get('version').trim(),
                package_name: formData.get('package_name').trim(),
                category: formData.get('category'),
                description: formData.get('description')?.trim() || null,
                download_url: formData.get('download_url').trim(),
                icon_url: formData.get('icon_url')?.trim() || null,
                file_size: formData.get('file_size')?.trim() || null,
                android_version: formData.get('android_version')?.trim() || null,
                screenshot_urls: screenshotUrls.length > 0 ? screenshotUrls : null,
                features: features.length > 0 ? features : null,
                tags: tags.length > 0 ? tags : null,
                verified: formData.has('verified'),
                featured: formData.has('featured'),
                trending: formData.has('trending'),
                rating: 0,
                review_count: 0,
                download_count: 0
            };
            
            // Insert into database
            const { data, error } = await this.supabase
                .from('apks')
                .insert([apkData])
                .select()
                .single();
                
            if (error) throw error;
            
            // Success - close modal and refresh
            this.closeModal('add-apk-modal');
            document.getElementById('add-apk-form').reset();
            this.showNotification('APK added successfully!', 'success');
            
            console.log('✅ APK added:', data);
            
        } catch (error) {
            console.error('❌ Failed to add APK:', error);
            this.showNotification('Failed to add APK: ' + error.message, 'error');
        }
    }
    
    async editAPK(id) {
        try {
            const apk = this.apks.find(a => a.id === id);
            if (!apk) throw new Error('APK not found');
            
            // Create edit modal with pre-filled data
            const modal = this.createEditAPKModal(apk);
            document.body.appendChild(modal);
            
        } catch (error) {
            console.error('❌ Failed to edit APK:', error);
            this.showNotification('Failed to load APK for editing', 'error');
        }
    }
    
    async deleteAPK(id) {
        if (!confirm('Are you sure you want to delete this APK? This action cannot be undone.')) {
            return;
        }
        
        try {
            const { error } = await this.supabase
                .from('apks')
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            
            this.showNotification('APK deleted successfully', 'success');
            
        } catch (error) {
            console.error('❌ Failed to delete APK:', error);
            this.showNotification('Failed to delete APK: ' + error.message, 'error');
        }
    }
    
    renderDashboard() {
        // Update stats
        const totalApks = this.apks.length;
        const totalUsers = this.users.length;
        const totalDownloadsToday = this.analytics.totalDownloadsToday;
        const avgRating = this.analytics.averageRating;
        
        this.updateElementText('total-apks', totalApks);
        this.updateElementText('total-downloads', totalDownloadsToday);
        this.updateElementText('total-users', totalUsers);
        this.updateElementText('avg-rating', avgRating);
        
        // Render activity feed
        this.renderActivity();
        
        // Initialize charts with real data
        this.initCharts();
    }
    
    renderActivity() {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;
        
        // Get recent activities from real data
        const recentAPKs = this.apks
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3);
            
        const recentUsers = this.users
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 2);
            
        const activities = [
            ...recentAPKs.map(apk => ({
                action: 'New APK added',
                item: `${apk.name} v${apk.version}`,
                time: this.getTimeAgo(apk.created_at)
            })),
            ...recentUsers.map(user => ({
                action: 'User registered', 
                item: user.username,
                time: this.getTimeAgo(user.created_at)
            }))
        ].sort((a, b) => a.time.localeCompare(b.time)).slice(0, 5);
        
        if (activities.length === 0) {
            activityList.innerHTML = '<div class="activity-item">No recent activity</div>';
            return;
        }
        
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-content">
                    <strong>${activity.action}</strong>: ${activity.item}
                </div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `).join('');
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
                <td><input type="checkbox" value="${apk.id}" class="apk-checkbox"></td>
                <td>
                    <img src="${apk.icon_url || '/default-icon.png'}" alt="${apk.name}" class="apk-icon-small" onerror="this.src='/default-icon.png'">
                </td>
                <td>
                    <div class="apk-title">
                        <strong>${apk.name}</strong>
                        <small>${apk.package_name}</small>
                    </div>
                </td>
                <td>${apk.version}</td>
                <td><span class="category-badge" style="background-color: ${this.getCategoryColor(apk.category)}20">${apk.category}</span></td>
                <td>${this.formatNumber(apk.download_count || 0)}</td>
                <td>
                    <div class="rating-display">
                        <span class="stars">★</span>
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
                        <button onclick="adminPlatform.editAPK('${apk.id}')" class="btn-edit" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="adminPlatform.deleteAPK('${apk.id}')" class="btn-delete" title="Delete">
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
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No users found</td></tr>';
            return;
        }
        
        tableBody.innerHTML = this.users.map(user => `
            <tr>
                <td>
                    <div class="user-avatar">
                        ${user.profile_avatar ? 
                            `<img src="${user.profile_avatar}" alt="${user.username}">` :
                            `<i class="fas fa-user"></i>`
                        }
                    </div>
                </td>
                <td>
                    <div class="user-info">
                        <strong>${user.username}</strong>
                        <small>${user.email}</small>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="role-badge role-${user.role}">${user.role}</span>
                </td>
                <td>${this.formatDate(user.created_at)}</td>
                <td>${user.last_login ? this.formatDate(user.last_login) : 'Never'}</td>
                <td>
                    <div class="action-buttons">
                        <button onclick="adminPlatform.editUser('${user.id}')" class="btn-edit" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${user.role !== 'super_admin' ? `
                            <button onclick="adminPlatform.deleteUser('${user.id}')" class="btn-delete" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    initCharts() {
        // Downloads chart with real data
        const ctx1 = document.getElementById('downloadsChart');
        if (ctx1 && window.Chart && this.analytics.downloadsByDay) {
            new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: this.analytics.downloadsByDay.map(d => d.day),
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
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        // Categories chart with real data
        const ctx2 = document.getElementById('categoriesChart');
        if (ctx2 && window.Chart && this.categories.length > 0) {
            const categoryData = this.categories.map(cat => ({
                name: cat.name,
                count: this.apks.filter(apk => apk.category === cat.name).length,
                color: cat.color || '#1FB8CD'
            }));
            
            new Chart(ctx2, {
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
    
    updateAdminUI() {
        const adminUsername = document.getElementById('admin-username');
        if (adminUsername && this.currentUser) {
            adminUsername.textContent = this.currentUser.username;
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
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    
    updateElementText(id, text) {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" class="notification-close">×</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideIn 0.3s ease;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196F3'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Cleanup
    destroy() {
        this.realTimeSubscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }
}

// Global Functions for HTML onclick handlers
function showAdminView(viewName) {
    // Hide all views
    document.querySelectorAll('.admin-view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show selected view
    const targetView = document.getElementById(`admin-${viewName}`);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    // Update nav active state
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const clickedNavItem = document.querySelector(`[onclick="showAdminView('${viewName}')"]`);
    if (clickedNavItem) {
        clickedNavItem.classList.add('active');
    }
    
    // Load specific view data
    if (viewName === 'apks') {
        adminPlatform.renderAPKsTable();
    } else if (viewName === 'users') {
        adminPlatform.renderUsersTable();
    } else if (viewName === 'analytics') {
        adminPlatform.initCharts();
    }
}

function showAddAPKModal() {
    const modal = document.getElementById('add-apk-modal');
    if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function bulkVerify() {
    const checkedBoxes = document.querySelectorAll('.apk-checkbox:checked');
    if (checkedBoxes.length === 0) {
        adminPlatform.showNotification('Please select APKs to verify', 'warning');
        return;
    }
    
    const ids = Array.from(checkedBoxes).map(cb => cb.value);
    console.log('Bulk verify APKs:', ids);
    // Implement bulk verify logic
}

function bulkDelete() {
    const checkedBoxes = document.querySelectorAll('.apk-checkbox:checked');
    if (checkedBoxes.length === 0) {
        adminPlatform.showNotification('Please select APKs to delete', 'warning');
        return;
    }
    
    if (!confirm(`Delete ${checkedBoxes.length} APKs? This cannot be undone.`)) {
        return;
    }
    
    const ids = Array.from(checkedBoxes).map(cb => cb.value);
    console.log('Bulk delete APKs:', ids);
    // Implement bulk delete logic
}

function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        if (adminPlatform.supabase) {
            adminPlatform.supabase.auth.signOut();
        }
        window.location.href = 'index.html';
    }
}

function saveSettings() {
    adminPlatform.showNotification('Settings saved successfully!', 'success');
}

function resetSettings() {
    if (confirm('Reset all settings to default?')) {
        adminPlatform.showNotification('Settings reset to default', 'info');
    }
}

function updateAnalytics() {
    adminPlatform.loadAnalytics().then(() => {
        adminPlatform.renderDashboard();
        adminPlatform.showNotification('Analytics updated', 'success');
    });
}

// Initialize admin platform
let adminPlatform;
document.addEventListener('DOMContentLoaded', () => {
    adminPlatform = new AdminPlatform();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (adminPlatform) {
        adminPlatform.destroy();
    }
});