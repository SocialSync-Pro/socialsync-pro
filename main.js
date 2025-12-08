// SocialSync Pro - Main JavaScript File
// Comprehensive automation tool for multi-platform video publishing

class SocialSyncPro {
    constructor() {
        this.platforms = {
            youtube: { 
                connected: false, 
                name: 'YouTube',
                clientId: '751267062472-sjj4nhk7olnip3t62f61cofnesn85v0i.apps.googleusercontent.com',
                apiKey: 'AIzaSyBabeYCfFunyNEabmOiZK-v8MQLTyc225s',
                clientSecret: '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'
            },
            facebook: { 
                connected: false, 
                name: 'Facebook',
                appId: '3800240566776931',
                clientId: '1946118359672190',
                clientSecret: 'c0593061cd311db7a8d741dfc3bab856',
                redirectUri: 'https://barakahecohomes.com/auth/facebook/callback'
            },
            instagram: { 
                connected: false, 
                name: 'Instagram',
                appId: '1946118359672190',
                clientSecret: 'c0593061cd311db7a8d741dfc3bab856',
                redirectUri: 'https://barakahecohomes.com/auth/facebook/callback'
            },
            tiktok: { 
                connected: false, 
                name: 'TikTok',
                orgId: '7581424600731354124',
                clientKey: 'awc0km4i5x8wchah',
                clientSecret: '2KQFixICVMJiazz324a0BlYpPjL8s594'
            }
        };
        
        this.uploadedVideo = null;
        this.isPublishing = false;
        this.automationQueue = [];
        this.currentUser = null;
        this.apiTokens = {};
        
        this.init();
    }

    init() {
        this.initializeAnimations();
        this.setupEventListeners();
        this.initializeTypedText();
        this.loadDashboardData();
        this.startRealTimeUpdates();
        this.initializeDescriptionCounter();
        this.checkUserAuthentication();
        this.initializeAPIConnections();
    }

    // Animation Initialization
    initializeAnimations() {
        // Initialize text splitting for animations
        if (typeof Splitting !== 'undefined') {
            Splitting();
        }

        // Animate hero elements on load
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

        // Animate cards on scroll
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

    // Typed Text Animation
    initializeTypedText() {
        if (typeof Typed !== 'undefined') {
            new Typed('#typed-text', {
                strings: [
                    'Automate Your Videos',
                    'Scale Your Content',
                    'Grow Your Audience',
                    'Save Time & Energy'
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

    // Event Listeners Setup
    setupEventListeners() {
        // Video upload handling
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('videoFile');
        
        if (uploadZone && fileInput) {
            uploadZone.addEventListener('click', () => fileInput.click());
            uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
            uploadZone.addEventListener('drop', this.handleFileDrop.bind(this));
            fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        }

        // Platform toggles
        document.querySelectorAll('.platform-toggle').forEach(toggle => {
            toggle.addEventListener('change', this.handlePlatformToggle.bind(this));
        });

        // Publish button
        const publishBtn = document.getElementById('publishBtn');
        if (publishBtn) {
            publishBtn.addEventListener('click', this.handlePublish.bind(this));
        }

        // Schedule toggle
        const scheduleToggle = document.getElementById('scheduleToggle');
        if (scheduleToggle) {
            scheduleToggle.addEventListener('change', this.toggleScheduleOptions.bind(this));
        }

        // Navigation
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', this.handleNavigation.bind(this));
        });
    }

    // API Integration Methods
    initializeAPIConnections() {
        // Load stored tokens
        const storedTokens = localStorage.getItem('socialsync_tokens');
        if (storedTokens) {
            this.apiTokens = JSON.parse(storedTokens);
            this.updatePlatformStatuses();
        }
    }

    async connectYouTube() {
        try {
            // YouTube OAuth 2.0 flow
            const redirectUri = window.location.origin + '/auth/youtube/callback';
            const scope = 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube';
            
            const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
                `client_id=${this.platforms.youtube.clientId}&` +
                `redirect_uri=${redirectUri}&` +
                `scope=${encodeURIComponent(scope)}&` +
                `response_type=code&` +
                `access_type=offline&` +
                `prompt=consent`;
            
            // In a real implementation, redirect to authUrl
            console.log('YouTube OAuth URL:', authUrl);
            
            // Simulate successful connection
            this.platforms.youtube.connected = true;
            this.updatePlatformStatus('youtube', true);
            this.saveTokens();
            
        } catch (error) {
            console.error('YouTube connection error:', error);
            this.showNotification('Failed to connect YouTube', 'error');
        }
    }

    async connectFacebook() {
        try {
            // Facebook OAuth flow
            const scope = 'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish';
            
            const authUrl = `https://www.facebook.com/dialog/oauth?` +
                `client_id=${this.platforms.facebook.clientId}&` +
                `redirect_uri=${this.platforms.facebook.redirectUri}&` +
                `scope=${encodeURIComponent(scope)}&` +
                `response_type=code`;
            
            console.log('Facebook OAuth URL:', authUrl);
            
            // Simulate successful connection
            this.platforms.facebook.connected = true;
            this.platforms.instagram.connected = true; // Instagram uses Facebook auth
            this.updatePlatformStatus('facebook', true);
            this.updatePlatformStatus('instagram', true);
            this.saveTokens();
            
        } catch (error) {
            console.error('Facebook connection error:', error);
            this.showNotification('Failed to connect Facebook', 'error');
        }
    }

    async connectTikTok() {
        try {
            // TikTok OAuth flow
            const scope = 'video.upload,user.info.basic';
            
            const authUrl = `https://www.tiktok.com/auth/authorize?` +
                `client_key=${this.platforms.tiktok.clientKey}&` +
                `redirect_uri=${window.location.origin}/auth/tiktok/callback&` +
                `scope=${encodeURIComponent(scope)}&` +
                `response_type=code`;
            
            console.log('TikTok OAuth URL:', authUrl);
            
            // Simulate successful connection
            this.platforms.tiktok.connected = true;
            this.updatePlatformStatus('tiktok', true);
            this.saveTokens();
            
        } catch (error) {
            console.error('TikTok connection error:', error);
            this.showNotification('Failed to connect TikTok', 'error');
        }
    }

    updatePlatformStatus(platform, connected) {
        this.platforms[platform].connected = connected;
        const statusElement = document.querySelector(`[data-platform="${platform}"] .status-indicator`);
        if (statusElement) {
            statusElement.className = `status-indicator ${connected ? 'status-connected' : 'status-disconnected'}`;
        }
        
        const toggleElement = document.querySelector(`[data-platform="${platform}"] .platform-toggle`);
        if (toggleElement) {
            toggleElement.checked = connected;
        }
    }

    updatePlatformStatuses() {
        Object.keys(this.platforms).forEach(platform => {
            this.updatePlatformStatus(platform, this.platforms[platform].connected);
        });
    }

    saveTokens() {
        localStorage.setItem('socialsync_tokens', JSON.stringify(this.apiTokens));
    }

    // User Authentication
    checkUserAuthentication() {
        const userData = localStorage.getItem('socialsync_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateUserInterface();
        }
    }

    updateUserInterface() {
        // Update UI with user information
        const userElements = document.querySelectorAll('.user-name');
        userElements.forEach(element => {
            element.textContent = this.currentUser?.fullName || 'User';
        });
    }

    // Video Upload Handling
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleFileDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processVideoFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processVideoFile(file);
        }
    }

    processVideoFile(file) {
        if (!file.type.startsWith('video/')) {
            this.showNotification('Please select a valid video file', 'error');
            return;
        }

        this.uploadedVideo = file;
        this.updateUploadPreview(file);
        this.showNotification('Video uploaded successfully!', 'success');
    }

    updateUploadPreview(file) {
        const uploadZone = document.getElementById('uploadZone');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        
        if (uploadZone) {
            uploadZone.innerHTML = `
                <div class="text-center">
                    <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <p class="text-lg font-semibold">${file.name}</p>
                    <p class="text-sm text-gray-400">${this.formatFileSize(file.size)}</p>
                </div>
            `;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Platform Management
    handlePlatformToggle(e) {
        const platform = e.target.dataset.platform;
        const isConnected = e.target.checked;
        
        if (isConnected) {
            this.connectPlatform(platform);
        } else {
            this.disconnectPlatform(platform);
        }
    }

    async connectPlatform(platform) {
        switch (platform) {
            case 'youtube':
                await this.connectYouTube();
                break;
            case 'facebook':
                await this.connectFacebook();
                break;
            case 'instagram':
                // Instagram is connected through Facebook
                await this.connectFacebook();
                break;
            case 'tiktok':
                await this.connectTikTok();
                break;
            default:
                this.showNotification(`Platform ${platform} not supported`, 'error');
        }
    }

    disconnectPlatform(platform) {
        this.platforms[platform].connected = false;
        this.updatePlatformStatus(platform, false);
        this.showNotification(`${this.platforms[platform].name} disconnected`, 'warning');
    }

    // Publishing Logic
    async handlePublish() {
        if (!this.uploadedVideo) {
            this.showNotification('Please upload a video first', 'error');
            return;
        }

        const selectedPlatforms = this.getSelectedPlatforms();
        if (selectedPlatforms.length === 0) {
            this.showNotification('Please select at least one platform', 'error');
            return;
        }

        const publishData = {
            title: document.getElementById('videoTitle')?.value || '',
            description: document.getElementById('videoDescription')?.value || '',
            platforms: selectedPlatforms,
            schedule: this.getScheduleData()
        };

        this.isPublishing = true;
        this.showPublishingProgress();

        try {
            await this.publishToPlatforms(publishData);
            this.showNotification('Video published successfully!', 'success');
        } catch (error) {
            console.error('Publishing error:', error);
            this.showNotification('Publishing failed. Please try again.', 'error');
        } finally {
            this.isPublishing = false;
            this.hidePublishingProgress();
        }
    }

    getSelectedPlatforms() {
        const selected = [];
        document.querySelectorAll('.platform-toggle:checked').forEach(toggle => {
            selected.push(toggle.dataset.platform);
        });
        return selected;
    }

    getScheduleData() {
        const scheduleToggle = document.getElementById('scheduleToggle');
        if (scheduleToggle && scheduleToggle.checked) {
            return {
                scheduled: true,
                date: document.getElementById('scheduleDate')?.value,
                time: document.getElementById('scheduleTime')?.value
            };
        }
        return { scheduled: false };
    }

    async publishToPlatforms(data) {
        // Simulate publishing to each platform
        for (const platform of data.platforms) {
            await this.simulatePlatformPublish(platform, data);
        }
    }

    async simulatePlatformPublish(platform, data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Published to ${platform}:`, data);
                resolve();
            }, 2000);
        });
    }

    // UI Updates
    showPublishingProgress() {
        const progressElement = document.getElementById('publishingProgress');
        if (progressElement) {
            progressElement.classList.remove('hidden');
        }
    }

    hidePublishingProgress() {
        const progressElement = document.getElementById('publishingProgress');
        if (progressElement) {
            progressElement.classList.add('hidden');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
            type === 'success' ? 'bg-green-600' :
            type === 'error' ? 'bg-red-600' :
            type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
        } text-white`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        anime({
            targets: notification,
            translateX: [300, 0],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuart'
        });
        
        // Remove after 3 seconds
        setTimeout(() => {
            anime({
                targets: notification,
                translateX: [0, 300],
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInQuart',
                complete: () => notification.remove()
            });
        }, 3000);
    }

    // Dashboard Data
    loadDashboardData() {
        // Simulate loading dashboard statistics
        this.updateDashboardStats({
            totalVideos: 127,
            totalViews: '2.4M',
            engagementRate: '4.8%',
            activeAutomations: 5
        });
    }

    updateDashboardStats(stats) {
        const elements = {
            totalVideos: document.getElementById('totalVideos'),
            totalViews: document.getElementById('totalViews'),
            engagementRate: document.getElementById('engagementRate'),
            activeAutomations: document.getElementById('activeAutomations')
        };

        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                elements[key].textContent = stats[key];
            }
        });
    }

    startRealTimeUpdates() {
        // Simulate real-time updates
        setInterval(() => {
            this.updateRealTimeStats();
        }, 30000);
    }

    updateRealTimeStats() {
        // Simulate real-time stat updates
        const currentViews = document.getElementById('totalViews');
        if (currentViews) {
            // Add some random growth
            const currentValue = parseFloat(currentViews.textContent.replace('M', ''));
            const newValue = currentValue + (Math.random() * 0.1);
            currentViews.textContent = newValue.toFixed(1) + 'M';
        }
    }

    // Description Counter
    initializeDescriptionCounter() {
        const descriptionField = document.getElementById('videoDescription');
        const counterElement = document.getElementById('descriptionCounter');
        
        if (descriptionField && counterElement) {
            descriptionField.addEventListener('input', (e) => {
                const length = e.target.value.length;
                counterElement.textContent = `${length}/5000 characters`;
                
                if (length > 4500) {
                    counterElement.classList.add('text-red-400');
                } else {
                    counterElement.classList.remove('text-red-400');
                }
            });
        }
    }

    // Navigation
    handleNavigation(e) {
        const href = e.target.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    toggleScheduleOptions(e) {
        const scheduleOptions = document.getElementById('scheduleOptions');
        if (scheduleOptions) {
            if (e.target.checked) {
                scheduleOptions.classList.remove('hidden');
                anime({
                    targets: scheduleOptions,
                    opacity: [0, 1],
                    translateY: [-20, 0],
                    duration: 300,
                    easing: 'easeOutQuart'
                });
            } else {
                anime({
                    targets: scheduleOptions,
                    opacity: [1, 0],
                    translateY: [0, -20],
                    duration: 300,
                    easing: 'easeInQuart',
                    complete: () => scheduleOptions.classList.add('hidden')
                });
            }
        }
    }
}

// Initialize the application
let socialSyncApp;
document.addEventListener('DOMContentLoaded', function() {
    socialSyncApp = new SocialSyncPro();
});

// Global functions for HTML onclick handlers
function connectPlatform(platform) {
    if (socialSyncApp) {
        socialSyncApp.connectPlatform(platform);
    }
}

function showSignUp() {
    window.location.href = 'signup.html';
}

function showLogin() {
    alert('Login functionality would be implemented here');
}