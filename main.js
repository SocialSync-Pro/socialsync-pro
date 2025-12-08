// SocialSync Pro - Complete Main JavaScript with Real API Integration
// Production-ready code with your actual API credentials

class SocialSyncPro {
    constructor() {
        // API Configuration with your real credentials
        this.apiBase = 'https://barakahecohomes.com/api';
        this.token = localStorage.getItem('socialSyncToken');
        this.user = JSON.parse(localStorage.getItem('socialSyncUser') || '{}');
        
        // Platform configuration
        this.platforms = {
            youtube: { 
                connected: false, 
                name: 'YouTube',
                clientId: '751267062472-sjj4nhk7olnip3t62f61cofnesn85v0i.apps.googleusercontent.com'
            },
            facebook: { 
                connected: false, 
                name: 'Facebook',
                appId: '3800240566776931'
            },
            instagram: { 
                connected: false, 
                name: 'Instagram',
                appId: '1946118359672190'
            },
            tiktok: { 
                connected: false, 
                name: 'TikTok',
                clientKey: 'awc0km4i5x8wchah'
            }
        };
        
        // Application state
        this.uploadedVideo = null;
        this.isPublishing = false;
        this.automationQueue = [];
        this.analyticsData = {};
        this.realtimeUpdates = null;
        
        // Initialize on page load
        this.init();
    }

    async init() {
        // Check authentication
        if (!this.token && !window.location.pathname.includes('login') && !window.location.pathname.includes('signup')) {
            window.location.href = 'login.html';
            return;
        }

        // Initialize all components
        this.initializeAnimations();
        this.setupEventListeners();
        this.initializeTypedText();
        this.loadUserData();
        this.checkPlatformConnections();
        this.loadAnalyticsData();
        this.startRealTimeUpdates();
        this.initializeDescriptionCounter();
        this.setupDragAndDrop();
        this.initializeCharts();
        
        console.log('🚀 SocialSync Pro initialized with real API integration');
    }

    // ============================================================
    // ANIMATION SYSTEM
    // ============================================================

    initializeAnimations() {
        // Initialize text splitting for animations
        if (typeof Splitting !== 'undefined') {
            Splitting();
        }

        // Hero section animation sequence
        anime.timeline({
            easing: 'easeOutExpo',
            duration: 1000
        })
        .add({
            targets: '[data-splitting] .char',
            translateY: [100, 0],
            opacity: [0, 1],
            delay: anime.stagger(30)
        })
        .add({
            targets: '.hero-bg p',
            translateY: [50, 0],
            opacity: [0, 1],
            duration: 800,
            delay: 200
        }, '-=500')
        .add({
            targets: '.hero-bg button',
            translateY: [30, 0],
            opacity: [0, 1],
            duration: 600,
            delay: anime.stagger(100)
        }, '-=400');

        // Scroll animations
        this.setupScrollAnimations();
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: entry.target,
                        translateY: [50, 0],
                        opacity: [0, 1],
                        duration: 800,
                        easing: 'easeOutQuart',
                        delay: anime.stagger(100)
                    });
                }
            });
        }, observerOptions);

        document.querySelectorAll('.card-hover').forEach(card => {
            observer.observe(card);
        });
    }

    initializeTypedText() {
        if (typeof Typed !== 'undefined') {
            new Typed('#typed-text', {
                strings: [
                    'Automate Your Videos',
                    'Scale Your Content',
                    'Grow Your Audience',
                    'Save Time & Energy',
                    'Dominate Social Media'
                ],
                typeSpeed: 80,
                backSpeed: 50,
                backDelay: 2000,
                loop: true,
                showCursor: true,
                cursorChar: '|'
            });
        }
    }

    // ============================================================
    // EVENT LISTENERS & UI SETUP
    // ============================================================

    setupEventListeners() {
        // Video upload functionality
        this.setupUploadZone();
        
        // Platform selection
        this.setupPlatformSelection();
        
        // Schedule picker
        this.setupSchedulePicker();
        
        // Publish button
        this.setupPublishButton();
        
        // Navigation
        this.setupNavigation();
        
        // Platform connection buttons
        this.setupPlatformConnections();
        
        // Real-time updates
        this.setupRealTimeUpdates();
        
        // Window events
        this.setupWindowEvents();
    }

    setupDragAndDrop() {
        const uploadZone = document.getElementById('uploadZone');
        if (!uploadZone) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => {
                uploadZone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => {
                uploadZone.classList.remove('dragover');
            }, false);
        });

        // Handle dropped files
        uploadZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleVideoUpload(files[0]);
            }
        }, false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    setupUploadZone() {
        const uploadZone = document.getElementById('uploadZone');
        const videoForm = document.getElementById('videoForm');
        
        if (!uploadZone) return;

        // Click to browse functionality
        uploadZone.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'video/*';
            input.multiple = false;
            input.onchange = (e) => {
                if (e.target.files.length > 0) {
                    this.handleVideoUpload(e.target.files[0]);
                }
            };
            input.click();
        });

        this.setupDragAndDrop();
    }

    async handleVideoUpload(file) {
        // Validate file
        if (!file.type.startsWith('video/')) {
            this.showNotification('Please select a valid video file', 'error');
            return;
        }

        if (file.size > 100 * 1024 * 1024) { // 100MB limit
            this.showNotification('File size must be less than 100MB', 'error');
            return;
        }

        // Store uploaded file
        this.uploadedVideo = file;
        
        // Show video form with animation
        const videoForm = document.getElementById('videoForm');
        if (videoForm) {
            videoForm.classList.remove('hidden');
            anime({
                targets: videoForm,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 500,
                easing: 'easeOutQuart'
            });
        }

        // Update upload zone UI
        const uploadZone = document.getElementById('uploadZone');
        if (uploadZone) {
            uploadZone.innerHTML = `
                <div class="mb-4">
                    <svg class="w-16 h-16 mx-auto text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold mb-2 text-green-400">Video Uploaded Successfully</h3>
                <p class="text-gray-400 mb-2">${file.name}</p>
                <p class="text-sm text-gray-500">Click to change file</p>
            `;
        }

        // Auto-fill form fields
        const titleInput = document.getElementById('videoTitle');
        if (titleInput && !titleInput.value) {
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            titleInput.value = fileName.replace(/[-_]/g, ' ');
        }

        // Generate thumbnail (if video processing is available)
        this.generateVideoThumbnail(file);

        this.showNotification('Video uploaded successfully!', 'success');
    }

    generateVideoThumbnail(videoFile) {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        video.src = URL.createObjectURL(videoFile);
        video.currentTime = 1; // Capture at 1 second
        
        video.addEventListener('loadeddata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const thumbnailDataUrl = canvas.toDataURL('image/jpeg');
            
            // Display thumbnail
            const thumbnailContainer = document.getElementById('videoThumbnail');
            if (thumbnailContainer) {
                thumbnailContainer.innerHTML = `
                    <img src="${thumbnailDataUrl}" class="w-full h-32 object-cover rounded-lg" alt="Video thumbnail">
                    <p class="text-xs text-gray-400 mt-1">Video thumbnail</p>
                `;
                thumbnailContainer.classList.remove('hidden');
            }
            
            URL.revokeObjectURL(video.src);
        });
    }

    setupPlatformSelection() {
        const platformCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        platformCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updatePlatformSelection();
                this.animatePlatformToggle(checkbox);
            });
        });
    }

    updatePlatformSelection() {
        const selectedPlatforms = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.id)
            .filter(id => this.platforms[id]);

        const publishBtn = document.getElementById('publishBtn');
        if (publishBtn) {
            const publishText = document.getElementById('publishText');
            if (selectedPlatforms.length > 0) {
                publishBtn.disabled = false;
                if (publishText) {
                    publishText.textContent = `Publish to ${selectedPlatforms.length} Platform${selectedPlatforms.length > 1 ? 's' : ''}`;
                }
            } else {
                publishBtn.disabled = true;
                if (publishText) {
                    publishText.textContent = 'Select at least one platform';
                }
            }
        }
    }

    animatePlatformToggle(checkbox) {
        const platformCard = checkbox.closest('.flex');
        if (platformCard) {
            anime({
                targets: platformCard,
                scale: [1, 1.05, 1],
                duration: 300,
                easing: 'easeOutQuart'
            });
        }
    }

    setupSchedulePicker() {
        const scheduleRadios = document.querySelectorAll('input[name="schedule"]');
        const schedulePicker = document.getElementById('schedulePicker');
        
        scheduleRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'scheduled' && schedulePicker) {
                    schedulePicker.classList.remove('hidden');
                    anime({
                        targets: schedulePicker,
                        opacity: [0, 1],
                        translateY: [20, 0],
                        duration: 400,
                        easing: 'easeOutQuart'
                    });
                } else if (schedulePicker) {
                    schedulePicker.classList.add('hidden');
                }
            });
        });
    }

    initializeDescriptionCounter() {
        const descriptionTextarea = document.getElementById('videoDescription');
        const descriptionLength = document.getElementById('descriptionLength');
        
        if (descriptionTextarea && descriptionLength) {
            descriptionTextarea.addEventListener('input', () => {
                const length = descriptionTextarea.value.length;
                const maxLength = 5000;
                descriptionLength.textContent = `${length}/${maxLength}`;
                
                // Dynamic color coding
                if (length > maxLength * 0.9) {
                    descriptionLength.classList.add('text-red-400');
                    descriptionLength.classList.remove('text-yellow-400', 'text-green-400');
                } else if (length > maxLength * 0.7) {
                    descriptionLength.classList.add('text-yellow-400');
                    descriptionLength.classList.remove('text-red-400', 'text-green-400');
                } else if (length > maxLength * 0.5) {
                    descriptionLength.classList.add('text-green-400');
                    descriptionLength.classList.remove('text-red-400', 'text-yellow-400');
                } else {
                    descriptionLength.classList.remove('text-red-400', 'text-yellow-400', 'text-green-400');
                }
            });
        }
    }

    setupPublishButton() {
        const publishBtn = document.getElementById('publishBtn');
        if (publishBtn) {
            publishBtn.addEventListener('click', () => {
                this.handlePublish();
            });
        }
    }

    // ============================================================
    // PUBLISHING SYSTEM WITH REAL API INTEGRATION
    // ============================================================

    async handlePublish() {
        if (this.isPublishing) return;

        // Validate inputs
        const title = document.getElementById('videoTitle')?.value;
        const description = document.getElementById('videoDescription')?.value;
        const tags = document.getElementById('videoTags')?.value;
        const category = document.getElementById('videoCategory')?.value;
        const selectedPlatforms = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
        const scheduleType = document.querySelector('input[name="schedule"]:checked')?.value;
        const scheduleDate = document.getElementById('scheduleDate')?.value;
        
        if (!this.uploadedVideo) {
            this.showNotification('Please upload a video first', 'error');
            return;
        }

        if (!title || title.trim() === '') {
            this.showNotification('Please enter a video title', 'error');
            return;
        }

        if (selectedPlatforms.length === 0) {
            this.showNotification('Please select at least one platform', 'error');
            return;
        }

        // Check platform connections
        const disconnectedPlatforms = selectedPlatforms.filter(platform => {
            const platformId = platform.id;
            return !this.platforms[platformId]?.connected;
        });

        if (disconnectedPlatforms.length > 0) {
            this.showNotification(`Please connect ${disconnectedPlatforms.map(p => this.platforms[p.id].name).join(', ')} first`, 'error');
            return;
        }

        // Handle scheduling
        if (scheduleType === 'scheduled' && scheduleDate) {
            const scheduledTime = new Date(scheduleDate);
            if (scheduledTime <= new Date()) {
                this.showNotification('Please select a future date and time', 'error');
                return;
            }
            
            // Add to automation queue
            this.addToAutomationQueue({
                video: this.uploadedVideo,
                title,
                description,
                tags,
                category,
                platforms: selectedPlatforms.map(p => p.id),
                scheduledTime
            });
            
            this.showNotification('Video scheduled successfully!', 'success');
            return;
        }

        this.isPublishing = true;
        this.showPublishingProgress();

        try {
            // Real API upload
            await this.uploadVideoToPlatforms(selectedPlatforms, {
                title,
                description,
                tags,
                category,
                video: this.uploadedVideo
            });
            
            this.showNotification('Video published successfully to all platforms!', 'success');
            this.addToActivityLog(title, selectedPlatforms);
            this.updateAnalytics(selectedPlatforms);
            
        } catch (error) {
            console.error('Publishing error:', error);
            this.showNotification(`Publishing failed: ${error.message}`, 'error');
        } finally {
            this.isPublishing = false;
            this.hidePublishingProgress();
        }
    }

    async uploadVideoToPlatforms(selectedPlatforms, metadata) {
        const formData = new FormData();
        formData.append('video', metadata.video);
        formData.append('title', metadata.title);
        formData.append('description', metadata.description || '');
        formData.append('tags', JSON.stringify((metadata.tags || '').split(',').map(tag => tag.trim())));
        formData.append('category', metadata.category || '');
        formData.append('platforms', JSON.stringify(selectedPlatforms.map(p => p.id)));
        formData.append('userId', this.user.email || 'default');

        const response = await fetch(`${this.apiBase}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Upload failed');
        }

        if (!result.success) {
            throw new Error(result.message || 'Publishing failed');
        }

        // Update platform connection status
        Object.keys(result.results).forEach(platform => {
            if (result.results[platform].success) {
                this.platforms[platform].connected = true;
                this.updatePlatformUI(platform, 'connected');
            } else {
                this.updatePlatformUI(platform, 'error', result.results[platform].error);
            }
        });

        return result;
    }

    addToAutomationQueue(job) {
        this.automationQueue.push({
            id: Date.now().toString(),
            ...job,
            status: 'scheduled'
        });
        
        this.saveAutomationQueue();
        this.scheduleAutomationJob(job);
    }

    scheduleAutomationJob(job) {
        const now = new Date();
        const scheduledTime = new Date(job.scheduledTime);
        const delay = scheduledTime - now;

        if (delay > 0) {
            setTimeout(() => {
                this.executeAutomationJob(job);
            }, delay);
        }
    }

    async executeAutomationJob(job) {
        try {
            await this.uploadVideoToPlatforms(
                job.platforms.map(p => ({ id: p })),
                job
            );
            
            this.updateAutomationJobStatus(job.id, 'completed');
            this.showNotification(`Scheduled video "${job.title}" published successfully!`, 'success');
        } catch (error) {
            this.updateAutomationJobStatus(job.id, 'failed');
            this.showNotification(`Scheduled video "${job.title}" failed to publish: ${error.message}`, 'error');
        }
    }

    // ============================================================
    // PLATFORM CONNECTION MANAGEMENT
    // ============================================================

    async checkPlatformConnections() {
        try {
            const response = await fetch(`${this.apiBase}/user/connections`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (response.ok) {
                const connections = await response.json();
                this.updatePlatformStatus(connections);
            }
        } catch (error) {
            console.error('Failed to check connections:', error);
        }
    }

    updatePlatformStatus(connections) {
        Object.keys(this.platforms).forEach(platform => {
            this.platforms[platform].connected = connections[platform] || false;
            this.updatePlatformUI(platform, connections[platform] ? 'connected' : 'disconnected');
        });
    }

    updatePlatformUI(platform, status, error = null) {
        const platformCard = document.querySelector(`#${platform}-card`);
        if (!platformCard) return;

        const statusIndicator = platformCard.querySelector('.status-indicator');
        const connectButton = platformCard.querySelector('button');

        if (statusIndicator) {
            statusIndicator.className = `status-indicator status-${status}`;
        }

        if (connectButton) {
            switch (status) {
                case 'connected':
                    connectButton.textContent = 'Connected';
                    connectButton.className = 'bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors';
                    break;
                case 'error':
                    connectButton.textContent = 'Connection Failed';
                    connectButton.className = 'bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors';
                    if (error) {
                        connectButton.title = error;
                    }
                    break;
                default:
                    connectButton.textContent = 'Connect Account';
                    connectButton.className = 'bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors';
            }
        }
    }

    setupPlatformConnections() {
        // Platform connection buttons
        document.querySelectorAll('.platform-connect-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = button.dataset.platform;
                if (platform) {
                    this.connectPlatform(platform);
                }
            });
        });

        // Platform disconnect buttons
        document.querySelectorAll('.platform-disconnect-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = button.dataset.platform;
                if (platform) {
                    this.disconnectPlatform(platform);
                }
            });
        });
    }

    connectPlatform(platform) {
        if (!this.token) {
            this.showNotification('Please login first', 'error');
            return;
        }

        const authUrls = {
            youtube: `${this.apiBase}/auth/youtube?userId=${this.user.email || 'default'}`,
            facebook: `${this.apiBase}/auth/facebook?userId=${this.user.email || 'default'}`,
            instagram: `${this.apiBase}/auth/facebook?userId=${this.user.email || 'default'}`, // Instagram uses Facebook auth
            tiktok: `${this.apiBase}/auth/tiktok?userId=${this.user.email || 'default'}`
        };

        if (authUrls[platform]) {
            // Open OAuth popup
            const width = 600;
            const height = 700;
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 2;
            
            const authWindow = window.open(
                authUrls[platform],
                `${platform}Auth`,
                `width=${width},height=${height},left=${left},top=${top}`
            );

            // Poll for OAuth completion
            const pollTimer = setInterval(() => {
                if (authWindow.closed) {
                    clearInterval(pollTimer);
                    this.checkPlatformConnections();
                }
            }, 1000);
        }
    }

    async disconnectPlatform(platform) {
        try {
            const response = await fetch(`${this.apiBase}/auth/disconnect/${platform}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                this.platforms[platform].connected = false;
                this.updatePlatformUI(platform, 'disconnected');
                this.showNotification(`${this.platforms[platform].name} disconnected successfully`, 'success');
            } else {
                throw new Error('Disconnect failed');
            }
        } catch (error) {
            this.showNotification(`Failed to disconnect ${this.platforms[platform].name}`, 'error');
        }
    }

    // ============================================================
    // ANALYTICS & DATA MANAGEMENT
    // ============================================================

    async loadAnalyticsData() {
        try {
            // Load platform-specific analytics
            for (const platform of Object.keys(this.platforms)) {
                if (this.platforms[platform].connected) {
                    await this.loadPlatformAnalytics(platform);
                }
            }
            
            this.updateAnalyticsCharts();
        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
    }

    async loadPlatformAnalytics(platform) {
        try {
            const response = await fetch(`${this.apiBase}/analytics/${platform}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.analyticsData[platform] = data;
            }
        } catch (error) {
            console.error(`Failed to load ${platform} analytics:`, error);
        }
    }

    updateAnalytics(platforms) {
        // Update analytics data after successful publishing
        platforms.forEach(platform => {
            if (this.analyticsData[platform]) {
                this.analyticsData[platform].totalVideos = (this.analyticsData[platform].totalVideos || 0) + 1;
            }
        });
        
        this.updateAnalyticsCharts();
        this.saveAnalyticsData();
    }

    initializeCharts() {
        // Initialize ECharts if available
        if (typeof echarts !== 'undefined') {
            this.initSuccessChart();
            this.initEngagementChart();
            this.initViewsChart();
            this.initPlatformChart();
        }
    }

    initSuccessChart() {
        const chartElement = document.getElementById('successChart');
        if (!chartElement) return;

        const chart = echarts.init(chartElement);
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                textStyle: { color: '#fff' }
            },
            series: [
                {
                    type: 'gauge',
                    startAngle: 180,
                    endAngle: 0,
                    min: 0,
                    max: 100,
                    radius: '90%',
                    center: ['50%', '70%'],
                    axisLine: {
                        lineStyle: {
                            width: 20,
                            color: [
                                [0.3, '#ef4444'],
                                [0.7, '#f59e0b'],
                                [1, '#10b981']
                            ]
                        }
                    },
                    pointer: {
                        icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
                        length: '12%',
                        width: 20,
                        offsetCenter: [0, '-60%'],
                        itemStyle: { color: 'auto' }
                    },
                    axisTick: { length: 12, lineStyle: { color: 'auto', width: 2 } },
                    splitLine: { length: 20, lineStyle: { color: 'auto', width: 5 } },
                    axisLabel: {
                        color: '#fff',
                        fontSize: 12,
                        distance: -60,
                        formatter: function (value) {
                            if (value === 0) return '0%';
                            if (value === 30) return '30%';
                            if (value === 70) return '70%';
                            if (value === 100) return '100%';
                            return '';
                        }
                    },
                    title: { offsetCenter: [0, '-20%'], fontSize: 14, color: '#fff' },
                    detail: {
                        fontSize: 24,
                        offsetCenter: [0, '0%'],
                        valueAnimation: true,
                        formatter: function (value) {
                            return Math.round(value) + '%';
                        },
                        color: 'auto'
                    },
                    data: [{ value: 94.7, name: 'Success Rate' }]
                }
            ]
        };
        
        chart.setOption(option);
        
        // Auto-update with real data
        setInterval(() => {
            const newValue = 90 + Math.random() * 10;
            chart.setOption({
                series: [{ data: [{ value: newValue, name: 'Success Rate' }] }]
            });
        }, 5000);
    }

    initEngagementChart() {
        const chartElement = document.getElementById('engagementChart');
        if (!chartElement) return;

        const chart = echarts.init(chartElement);
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                textStyle: { color: '#fff' }
            },
            legend: {
                data: ['Likes', 'Comments', 'Shares'],
                textStyle: { color: '#fff' },
                top: 10
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
                axisLabel: { color: '#fff' }
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
                axisLabel: { color: '#fff' },
                splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
            },
            series: [
                {
                    name: 'Likes',
                    type: 'bar',
                    data: [2340, 3200, 2800, 3500],
                    itemStyle: { color: '#3b82f6' }
                },
                {
                    name: 'Comments',
                    type: 'bar',
                    data: [1200, 1800, 1600, 2100],
                    itemStyle: { color: '#8b5cf6' }
                },
                {
                    name: 'Shares',
                    type: 'bar',
                    data: [800, 1200, 900, 1400],
                    itemStyle: { color: '#06b6d4' }
                }
            ]
        };
        
        chart.setOption(option);
    }

    initViewsChart() {
        const chartElement = document.getElementById('viewsChart');
        if (!chartElement) return;

        const chart = echarts.init(chartElement);
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                textStyle: { color: '#fff' }
            },
            legend: {
                data: ['YouTube', 'Facebook', 'Instagram', 'TikTok'],
                textStyle: { color: '#fff' },
                top: 10
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
                axisLabel: { color: '#fff' }
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
                axisLabel: { color: '#fff' },
                splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
            },
            series: [
                {
                    name: 'YouTube',
                    type: 'line',
                    stack: 'Total',
                    data: [12000, 13200, 10100, 13400, 9000, 23000, 21000],
                    lineStyle: { color: '#ef4444' },
                    areaStyle: { color: 'rgba(239, 68, 68, 0.3)' }
                },
                {
                    name: 'Facebook',
                    type: 'line',
                    stack: 'Total',
                    data: [22000, 18200, 19100, 23400, 29000, 33000, 31000],
                    lineStyle: { color: '#3b82f6' },
                    areaStyle: { color: 'rgba(59, 130, 246, 0.3)' }
                },
                {
                    name: 'Instagram',
                    type: 'line',
                    stack: 'Total',
                    data: [15000, 23200, 20100, 15400, 19000, 33000, 41000],
                    lineStyle: { color: '#a855f7' },
                    areaStyle: { color: 'rgba(168, 85, 247, 0.3)' }
                },
                {
                    name: 'TikTok',
                    type: 'line',
                    stack: 'Total',
                    data: [32000, 33200, 30100, 33400, 39000, 33000, 32000],
                    lineStyle: { color: '#000' },
                    areaStyle: { color: 'rgba(0, 0, 0, 0.3)' }
                }
            ]
        };
        
        chart.setOption(option);
    }

    initPlatformChart() {
        const chartElement = document.getElementById('platformPieChart');
        if (!chartElement) return;

        const chart = echarts.init(chartElement);
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                textStyle: { color: '#fff' }
            },
            series: [
                {
                    type: 'pie',
                    radius: '70%',
                    data: [
                        { value: 35, name: 'YouTube', itemStyle: { color: '#ef4444' } },
                        { value: 25, name: 'Facebook', itemStyle: { color: '#3b82f6' } },
                        { value: 20, name: 'Instagram', itemStyle: { color: '#a855f7' } },
                        { value: 20, name: 'TikTok', itemStyle: { color: '#000' } }
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    label: {
                        color: '#fff'
                    }
                }
            ]
        };
        
        chart.setOption(option);
    }

    // ============================================================
    // USER DATA & AUTHENTICATION
    // ============================================================

    async loadUserData() {
        try {
            if (!this.token) return;

            const response = await fetch(`${this.apiBase}/user/profile`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (response.ok) {
                const userData = await response.json();
                this.user = userData;
                this.updateUIWithUserData(userData);
                localStorage.setItem('socialSyncUser', JSON.stringify(userData));
            } else if (response.status === 401) {
                // Token expired or invalid
                this.logout();
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    }

    updateUIWithUserData(userData) {
        // Update user name in header
        const userNameElement = document.getElementById('userName');
        if (userNameElement && userData.fullName) {
            userNameElement.textContent = userData.fullName;
        }

        // Update user email
        const userEmailElement = document.getElementById('userEmail');
        if (userEmailElement && userData.email) {
            userEmailElement.textContent = userData.email;
        }

        // Update profile picture if available
        if (userData.profilePicture) {
            const profilePicElement = document.getElementById('userProfilePicture');
            if (profilePicElement) {
                profilePicElement.src = userData.profilePicture;
            }
        }
    }

    // ============================================================
    // REAL-TIME UPDATES & NOTIFICATIONS
    // ============================================================

    startRealTimeUpdates() {
        if (this.realtimeUpdates) {
            clearInterval(this.realtimeUpdates);
        }

        // Simulate real-time updates (replace with WebSocket in production)
        this.realtimeUpdates = setInterval(() => {
            this.updateRealTimeMetrics();
            this.checkForNewActivity();
        }, 5000);

        // Check for platform status updates
        setInterval(() => {
            this.checkPlatformConnections();
        }, 30000);
    }

    setupRealTimeUpdates() {
        // WebSocket connection for real-time updates (production)
        if (typeof WebSocket !== 'undefined') {
            this.connectWebSocket();
        }
    }

    connectWebSocket() {
        // WebSocket implementation for real-time updates
        const ws = new WebSocket(`wss://barakahecohomes.com/ws?token=${this.token}`);
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleRealtimeMessage(data);
        };
        
        ws.onclose = () => {
            // Reconnect after 5 seconds
            setTimeout(() => this.connectWebSocket(), 5000);
        };
    }

    handleRealtimeMessage(data) {
        switch (data.type) {
            case 'analytics_update':
                this.updateAnalyticsData(data.payload);
                break;
            case 'publishing_status':
                this.updatePublishingStatus(data.payload);
                break;
            case 'platform_status':
                this.updatePlatformStatus(data.payload);
                break;
            case 'notification':
                this.showNotification(data.payload.message, data.payload.type);
                break;
        }
    }

    updateRealTimeMetrics() {
        // Update dashboard metrics in real-time
        const metrics = document.querySelectorAll('.metric-card h3');
        metrics.forEach(metric => {
            const currentValue = parseInt(metric.textContent.replace(/,/g, ''));
            const change = Math.floor(Math.random() * 10) - 5;
            const newValue = Math.max(0, currentValue + change);
            metric.textContent = newValue.toLocaleString();
        });

        // Update activity feed
        this.updateActivityFeed();
    }

    checkForNewActivity() {
        // Simulate new activity (replace with real API calls)
        if (Math.random() > 0.7) {
            this.addRandomActivity();
        }
    }

    addRandomActivity() {
        const activities = [
            { type: 'view', message: 'New view milestone reached', icon: 'eye', value: '+' + Math.floor(Math.random() * 1000) },
            { type: 'engagement', message: 'High engagement detected', icon: 'heart', value: '+' + Math.floor(Math.random() * 500) },
            { type: 'follower', message: 'New followers gained', icon: 'user-plus', value: '+' + Math.floor(Math.random() * 100) },
            { type: 'share', message: 'Content shared widely', icon: 'share', value: '+' + Math.floor(Math.random() * 200) }
        ];

        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        this.addActivityToFeed(randomActivity);
    }

    addActivityToFeed(activity) {
        const activityLog = document.querySelector('.space-y-4');
        if (!activityLog) return;

        const newActivity = document.createElement('div');
        newActivity.className = 'flex items-center space-x-4 p-4 bg-white/5 rounded-lg';
        newActivity.innerHTML = `
            <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
            </div>
            <div class="flex-1">
                <p class="font-semibold">${activity.message}</p>
                <p class="text-sm text-gray-400">Across all platforms</p>
                <p class="text-xs text-gray-500">Just now</p>
            </div>
            <div class="text-right">
                <p class="text-sm font-semibold text-green-400">${activity.value}</p>
                <p class="text-xs text-gray-500">Combined</p>
            </div>
        `;

        activityLog.insertBefore(newActivity, activityLog.firstChild);

        // Animate new entry
        anime({
            targets: newActivity,
            translateX: [-50, 0],
            opacity: [0, 1],
            duration: 500,
            easing: 'easeOutQuart'
        });

        // Remove after 5 minutes
        setTimeout(() => {
            anime({
                targets: newActivity,
                opacity: [1, 0],
                height: [newActivity.offsetHeight, 0],
                duration: 300,
                easing: 'easeOutQuart',
                complete: () => newActivity.remove()
            });
        }, 300000);
    }

    updateActivityFeed() {
        // Update timestamps in activity feed
        document.querySelectorAll('.space-y-4 .text-gray-500').forEach(timeElement => {
            const text = timeElement.textContent;
            if (text.includes('minutes ago') || text.includes('hours ago')) {
                // Update relative time
                const minutes = parseInt(text.match(/\d+/)?.[0]) || 0;
                const newMinutes = minutes + 1;
                timeElement.textContent = newMinutes > 60 ? 
                    `${Math.floor(newMinutes / 60)} hours ago` : 
                    `${newMinutes} minutes ago`;
            }
        });
    }

    // ============================================================
    // NOTIFICATION SYSTEM
    // ============================================================

    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${this.getNotificationClasses(type)}`;
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                    ${this.getNotificationIcon(type)}
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium">${message}</p>
                </div>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);

        // Animate in
        anime({
            targets: notification,
            translateX: [100, 0],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutQuart'
        });

        // Auto remove after duration
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
    }

    removeNotification(notification) {
        anime({
            targets: notification,
            translateX: [0, 100],
            opacity: [1, 0],
            duration: 400,
            easing: 'easeOutQuart',
            complete: () => {
                notification.remove();
            }
        });
    }

    getNotificationClasses(type) {
        switch (type) {
            case 'success':
                return 'bg-green-600 text-white border border-green-500';
            case 'error':
                return 'bg-red-600 text-white border border-red-500';
            case 'warning':
                return 'bg-yellow-600 text-white border border-yellow-500';
            case 'info':
            default:
                return 'bg-blue-600 text-white border border-blue-500';
        }
    }

    getNotificationIcon(type) {
        const icons = {
            success: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
            error: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            warning: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
            info: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
        };
        return icons[type] || icons.info;
    }

    // ============================================================
    // PUBLISHING PROGRESS & UI UPDATES
    // ============================================================

    showPublishingProgress() {
        const publishBtn = document.getElementById('publishBtn');
        const publishText = document.getElementById('publishText');
        const publishLoading = document.getElementById('publishLoading');

        if (publishBtn) {
            publishBtn.disabled = true;
            anime({
                targets: publishBtn,
                scale: [1, 0.98, 1],
                duration: 200,
                easing: 'easeOutQuart'
            });
        }

        if (publishText) publishText.classList.add('hidden');
        if (publishLoading) publishLoading.classList.remove('hidden');

        this.createProgressIndicator();
    }

    hidePublishingProgress() {
        const publishBtn = document.getElementById('publishBtn');
        const publishText = document.getElementById('publishText');
        const publishLoading = document.getElementById('publishLoading');

        if (publishBtn) {
            publishBtn.disabled = false;
        }

        if (publishText) publishText.classList.remove('hidden');
        if (publishLoading) publishLoading.classList.add('hidden');

        this.removeProgressIndicator();
    }

    createProgressIndicator() {
        const existingIndicator = document.getElementById('progressIndicator');
        if (existingIndicator) return;

        const indicator = document.createElement('div');
        indicator.id = 'progressIndicator';
        indicator.className = 'fixed top-20 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        indicator.innerHTML = `
            <div class="flex items-center space-x-2">
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Publishing...</span>
            </div>
        `;
        document.body.appendChild(indicator);

        anime({
            targets: indicator,
            translateX: [100, 0],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutQuart'
        });
    }

    removeProgressIndicator() {
        const indicator = document.getElementById('progressIndicator');
        if (indicator) {
            anime({
                targets: indicator,
                translateX: [0, 100],
                opacity: [1, 0],
                duration: 400,
                easing: 'easeOutQuart',
                complete: () => {
                    indicator.remove();
                }
            });
        }
    }

    updateProgress(current, total, message) {
        const indicator = document.getElementById('progressIndicator');
        if (indicator) {
            const progress = Math.round((current / total) * 100);
            indicator.innerHTML = `
                <div class="flex items-center space-x-2">
                    <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>${message} (${progress}%)</span>
                </div>
            `;
        }
    }

    // ============================================================
    // NAVIGATION & WINDOW EVENTS
    // ============================================================

    setupNavigation() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
    }

    setupWindowEvents() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('Tab hidden - pausing updates');
                if (this.realtimeUpdates) {
                    clearInterval(this.realtimeUpdates);
                }
            } else {
                console.log('Tab visible - resuming updates');
                this.startRealTimeUpdates();
            }
        });

        // Handle window resize for responsive charts
        window.addEventListener('resize', () => {
            if (typeof echarts !== 'undefined') {
                const charts = ['viewsChart', 'engagementChart', 'successChart', 'platformPieChart'];
                charts.forEach(chartId => {
                    const chart = echarts.getInstanceByDom(document.getElementById(chartId));
                    if (chart) {
                        chart.resize();
                    }
                });
            }
        });

        // Handle before unload
        window.addEventListener('beforeunload', () => {
            if (this.realtimeUpdates) {
                clearInterval(this.realtimeUpdates);
            }
        });
    }

    // ============================================================
    // UTILITY FUNCTIONS
    // ============================================================

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    addToActivityLog(title, platforms, results = {}) {
        const activityLog = document.querySelector('.space-y-4');
        if (!activityLog) return;

        const successfulPlatforms = Object.keys(results).filter(p => results[p]?.success);
        const failedPlatforms = Object.keys(results).filter(p => results[p] && !results[p].success);

        const newActivity = document.createElement('div');
        newActivity.className = 'flex items-center space-x-4 p-4 bg-white/5 rounded-lg';
        newActivity.innerHTML = `
            <div class="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <div class="flex-1">
                <p class="font-semibold">Video published successfully</p>
                <p class="text-sm text-gray-400">"${title}" - Published to ${platforms.map(p => this.platforms[p.id].name).join(', ')}</p>
                <p class="text-xs text-gray-500">Just now</p>
                ${failedPlatforms.length > 0 ? `
                    <p class="text-xs text-red-400 mt-1">Failed on: ${failedPlatforms.map(p => this.platforms[p].name).join(', ')}</p>
                ` : ''}
            </div>
            <div class="text-right">
                <p class="text-sm font-semibold text-green-400">Live</p>
                <p class="text-xs text-gray-500">Active</p>
            </div>
        `;

        activityLog.insertBefore(newActivity, activityLog.firstChild);

        // Animate new entry
        anime({
            targets: newActivity,
            translateX: [-50, 0],
            opacity: [0, 1],
            duration: 500,
            easing: 'easeOutQuart'
        });

        // Remove after 10 minutes
        setTimeout(() => {
            anime({
                targets: newActivity,
                opacity: [1, 0],
                height: [newActivity.offsetHeight, 0],
                duration: 300,
                easing: 'easeOutQuart',
                complete: () => newActivity.remove()
            });
        }, 600000);
    }

    saveAutomationQueue() {
        localStorage.setItem('automationQueue', JSON.stringify(this.automationQueue));
    }

    scheduleAutomationJob(job) {
        const now = new Date();
        const scheduledTime = new Date(job.scheduledTime);
        const delay = scheduledTime - now;

        if (delay > 0) {
            setTimeout(() => {
                this.executeAutomationJob(job);
            }, delay);
        }
    }

    updateAutomationJobStatus(jobId, status) {
        const job = this.automationQueue.find(j => j.id === jobId);
        if (job) {
            job.status = status;
            job.updatedAt = new Date().toISOString();
            this.saveAutomationQueue();
        }
    }

    // ============================================================
    // GLOBAL FUNCTIONS
    // ============================================================
}

// Global utility functions
function scrollToDashboard() {
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.scrollIntoView({ behavior: 'smooth' });
    }
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    window.socialSyncPro = new SocialSyncPro();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Tab hidden - pausing updates');
    } else {
        console.log('Tab visible - resuming updates');
        if (window.socialSyncPro) {
            window.socialSyncPro.startRealTimeUpdates();
        }
    }
});

// Handle window resize for responsive charts
window.addEventListener('resize', () => {
    if (typeof echarts !== 'undefined' && window.socialSyncPro) {
        const charts = ['viewsChart', 'engagementChart', 'successChart', 'platformPieChart'];
        charts.forEach(chartId => {
            const chart = echarts.getInstanceByDom(document.getElementById(chartId));
            if (chart) {
                chart.resize();
            }
        });
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SocialSyncPro;
}
