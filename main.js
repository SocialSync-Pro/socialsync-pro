// SocialSync Pro - Main JavaScript File
// Comprehensive automation tool for multi-platform video publishing

class SocialSyncPro {
    constructor() {
        this.platforms = {
            youtube: { connected: true, name: 'YouTube' },
            facebook: { connected: true, name: 'Facebook' },
            instagram: { connected: false, name: 'Instagram' },
            tiktok: { connected: false, name: 'TikTok' }
        };
        
        this.uploadedVideo = null;
        this.isPublishing = false;
        this.automationQueue = [];
        
        this.init();
    }

    init() {
        this.initializeAnimations();
        this.setupEventListeners();
        this.initializeTypedText();
        this.loadDashboardData();
        this.startRealTimeUpdates();
        this.initializeDescriptionCounter();
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
        // Upload zone functionality
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
    }

    setupUploadZone() {
        const uploadZone = document.getElementById('uploadZone');
        const videoForm = document.getElementById('videoForm');
        
        if (!uploadZone) return;

        // Drag and drop handlers
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleVideoUpload(files[0]);
            }
        });

        // Click to browse
        uploadZone.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'video/*';
            input.onchange = (e) => {
                if (e.target.files.length > 0) {
                    this.handleVideoUpload(e.target.files[0]);
                }
            };
            input.click();
        });
    }

    handleVideoUpload(file) {
        // Validate file
        if (!file.type.startsWith('video/')) {
            this.showNotification('Please select a valid video file', 'error');
            return;
        }

        if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB limit
            this.showNotification('File size must be less than 2GB', 'error');
            return;
        }

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

        // Update upload zone
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

        // Auto-fill form fields if possible
        const titleInput = document.getElementById('videoTitle');
        if (titleInput && !titleInput.value) {
            const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
            titleInput.value = fileName.replace(/[-_]/g, ' '); // Clean up filename
        }

        this.showNotification('Video uploaded successfully!', 'success');
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
                
                // Change color based on length
                if (length > maxLength * 0.9) {
                    descriptionLength.classList.add('text-red-400');
                    descriptionLength.classList.remove('text-yellow-400');
                } else if (length > maxLength * 0.7) {
                    descriptionLength.classList.add('text-yellow-400');
                    descriptionLength.classList.remove('text-red-400');
                } else {
                    descriptionLength.classList.remove('text-red-400', 'text-yellow-400');
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

    async handlePublish() {
        if (this.isPublishing) return;

        // Validate inputs
        const title = document.getElementById('videoTitle')?.value;
        const description = document.getElementById('videoDescription')?.value;
        const tags = document.getElementById('videoTags')?.value;
        const category = document.getElementById('videoCategory')?.value;
        const selectedPlatforms = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
        
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
            return this.platforms[platformId] && !this.platforms[platformId].connected;
        });

        if (disconnectedPlatforms.length > 0) {
            this.showNotification(`Please connect ${disconnectedPlatforms.map(p => this.platforms[p.id].name).join(', ')} first`, 'error');
            return;
        }

        this.isPublishing = true;
        this.showPublishingProgress();

        try {
            // Simulate publishing process
            await this.simulatePublishing(selectedPlatforms, title);
            this.showNotification('Video published successfully to all platforms!', 'success');
            this.addToActivityLog(title, selectedPlatforms);
        } catch (error) {
            this.showNotification('Publishing failed. Please try again.', 'error');
        } finally {
            this.isPublishing = false;
            this.hidePublishingProgress();
        }
    }

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

        // Create progress indicator
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

        // Remove progress indicator
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

    async simulatePublishing(platforms, title) {
        const totalSteps = platforms.length * 3; // 3 steps per platform
        let currentStep = 0;

        for (const platform of platforms) {
            const platformName = this.platforms[platform.id].name;
            
            // Step 1: Uploading
            this.updateProgress(currentStep++, totalSteps, `Uploading to ${platformName}...`);
            await this.delay(1000);

            // Step 2: Processing
            this.updateProgress(currentStep++, totalSteps, `Processing on ${platformName}...`);
            await this.delay(800);

            // Step 3: Publishing
            this.updateProgress(currentStep++, totalSteps, `Publishing to ${platformName}...`);
            await this.delay(600);
        }

        this.updateProgress(totalSteps, totalSteps, 'Complete!');
        await this.delay(500);
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

    addToActivityLog(title, platforms, description = '', tags = '', category = '') {
        const activityLog = document.querySelector('.space-y-4');
        if (!activityLog) return;

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
            </div>
            <div class="text-right">
                <p class="text-sm font-semibold text-green-400">Processing</p>
                <p class="text-xs text-gray-500">Live soon</p>
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
    }

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
    }

    setupPlatformConnections() {
        // Handle platform connection buttons
        document.querySelectorAll('button').forEach(button => {
            if (button.textContent.includes('Connect') || button.textContent.includes('Manage')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handlePlatformConnection(button);
                });
            }
        });
    }

    handlePlatformConnection(button) {
        const platformCard = button.closest('.card-hover');
        if (!platformCard) return;

        // Simulate connection process
        button.disabled = true;
        button.textContent = 'Connecting...';

        anime({
            targets: button,
            scale: [1, 0.95, 1],
            duration: 200,
            easing: 'easeOutQuart'
        });

        setTimeout(() => {
            button.disabled = false;
            button.textContent = 'Connected';
            button.classList.add('bg-green-600', 'hover:bg-green-700');
            button.classList.remove('bg-blue-600', 'hover:bg-blue-700');
            
            this.showNotification('Platform connected successfully!', 'success');
        }, 2000);
    }

    // Utility Functions
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${this.getNotificationClasses(type)}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);

        // Animate in
        anime({
            targets: notification,
            translateX: [100, 0],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutQuart'
        });

        // Auto remove after 3 seconds
        setTimeout(() => {
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
        }, 3000);
    }

    getNotificationClasses(type) {
        switch (type) {
            case 'success':
                return 'bg-green-600 text-white';
            case 'error':
                return 'bg-red-600 text-white';
            case 'warning':
                return 'bg-yellow-600 text-white';
            default:
                return 'bg-blue-600 text-white';
        }
    }

    // Dashboard Data Management
    loadDashboardData() {
        // Simulate loading dashboard metrics
        this.updateMetrics();
        this.loadRecentActivity();
    }

    updateMetrics() {
        // Update metric cards with animation
        const metrics = document.querySelectorAll('.metric-card h3');
        metrics.forEach((metric, index) => {
            const targetValue = parseInt(metric.textContent.replace(/,/g, ''));
            let currentValue = 0;
            const increment = targetValue / 50;
            
            const counter = setInterval(() => {
                currentValue += increment;
                if (currentValue >= targetValue) {
                    currentValue = targetValue;
                    clearInterval(counter);
                }
                metric.textContent = Math.floor(currentValue).toLocaleString();
            }, 50);
        });
    }

    loadRecentActivity() {
        // Simulate real-time activity updates
        setInterval(() => {
            this.addRandomActivity();
        }, 30000); // Add new activity every 30 seconds
    }

    addRandomActivity() {
        const activities = [
            { type: 'view', message: 'New view milestone reached', icon: 'eye' },
            { type: 'engagement', message: 'High engagement detected', icon: 'heart' },
            { type: 'follower', message: 'New followers gained', icon: 'user-plus' },
            { type: 'share', message: 'Content shared widely', icon: 'share' }
        ];

        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        // Implementation would add this to the activity log
    }

    // Real-time Updates
    startRealTimeUpdates() {
        // Simulate real-time data updates
        setInterval(() => {
            this.updateRealTimeMetrics();
        }, 5000); // Update every 5 seconds
    }

    updateRealTimeMetrics() {
        // Simulate small changes in metrics
        const metricValues = document.querySelectorAll('.metric-card h3');
        metricValues.forEach(metric => {
            const currentValue = parseInt(metric.textContent.replace(/,/g, ''));
            const change = Math.floor(Math.random() * 10) - 5; // -5 to +5
            const newValue = Math.max(0, currentValue + change);
            metric.textContent = newValue.toLocaleString();
        });
    }
}

// Global Functions
function scrollToDashboard() {
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.socialSyncPro = new SocialSyncPro();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause real-time updates when tab is not visible
        console.log('Tab hidden - pausing updates');
    } else {
        // Resume updates when tab becomes visible
        console.log('Tab visible - resuming updates');
        if (window.socialSyncPro) {
            window.socialSyncPro.updateRealTimeMetrics();
        }
    }
});

// Handle window resize for responsive charts
window.addEventListener('resize', () => {
    // Trigger chart resize events if charts exist
    if (typeof echarts !== 'undefined') {
        echarts.getInstanceByDom && echarts.getInstanceByDom(document.getElementById('viewsChart'))?.resize();
        echarts.getInstanceByDom && echarts.getInstanceByDom(document.getElementById('engagementChart'))?.resize();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SocialSyncPro;
}