// Authentication and Social Media Integration
class SocialSyncAuth {
    constructor() {
        this.initializeEventListeners();
        this.loadGoogleSDK();
        this.loadFacebookSDK();
    }

    initializeEventListeners() {
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEmailSignup();
            });
        }
    }

    // Email Signup
    async handleEmailSignup() {
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;

        // Validation
        if (!this.validateSignupForm(fullName, email, password, confirmPassword, terms)) {
            return;
        }

        try {
            // Simulate API call
            this.showLoadingState();
            
            // In production, replace with actual API call
            const userData = {
                fullName,
                email,
                password: this.hashPassword(password),
                signupMethod: 'email',
                createdAt: new Date().toISOString()
            };

            // Store user data (in production, this would be in your database)
            localStorage.setItem('socialSyncUser', JSON.stringify(userData));
            
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.showNotification('Account created successfully!', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            this.showNotification('Signup failed. Please try again.', 'error');
        } finally {
            this.hideLoadingState();
        }
    }

    validateSignupForm(fullName, email, password, confirmPassword, terms) {
        if (!fullName || fullName.length < 2) {
            this.showNotification('Please enter your full name', 'error');
            return false;
        }

        if (!this.validateEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return false;
        }

        if (!this.validatePassword(password)) {
            this.showNotification('Password must be at least 8 characters with numbers and special characters', 'error');
            return false;
        }

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return false;
        }

        if (!terms) {
            this.showNotification('Please accept the terms and conditions', 'error');
            return false;
        }

        return true;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    hashPassword(password) {
        // In production, use proper password hashing (bcrypt, etc.)
        return btoa(password); // Simple base64 encoding for demo
    }

    // Google Signup
    loadGoogleSDK() {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }

    async handleSocialSignup(provider) {
        switch (provider) {
            case 'google':
                this.initGoogleSignup();
                break;
            case 'facebook':
                this.initFacebookSignup();
                break;
        }
    }

    initGoogleSignup() {
        // Google One Tap or redirect flow
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: 'YOUR_GOOGLE_CLIENT_ID',
                callback: this.handleGoogleResponse.bind(this)
            });

            window.google.accounts.id.prompt();
        } else {
            // Fallback redirect flow
            window.location.href = `${window.location.origin}/auth/google`;
        }
    }

    handleGoogleResponse(response) {
        // Decode JWT token
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        
        const userData = {
            fullName: payload.name,
            email: payload.email,
            profilePicture: payload.picture,
            signupMethod: 'google',
            googleId: payload.sub,
            createdAt: new Date().toISOString()
        };

        this.completeSocialSignup(userData);
    }

    // Facebook Signup
    loadFacebookSDK() {
        window.fbAsyncInit = function() {
            FB.init({
                appId: 'YOUR_FACEBOOK_APP_ID',
                cookie: true,
                xfbml: true,
                version: 'v12.0'
            });
        };

        const script = document.createElement('script');
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        document.head.appendChild(script);
    }

    initFacebookSignup() {
        if (window.FB) {
            window.FB.login((response) => {
                if (response.authResponse) {
                    this.getFacebookUserData(response.authResponse.accessToken);
                }
            }, { scope: 'email,public_profile' });
        } else {
            // Fallback redirect flow
            window.location.href = `${window.location.origin}/auth/facebook`;
        }
    }

    async getFacebookUserData(accessToken) {
        try {
            const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
            const data = await response.json();

            const userData = {
                fullName: data.name,
                email: data.email,
                profilePicture: data.picture.data.url,
                signupMethod: 'facebook',
                facebookId: data.id,
                createdAt: new Date().toISOString()
            };

            this.completeSocialSignup(userData);
        } catch (error) {
            this.showNotification('Facebook signup failed', 'error');
        }
    }

    completeSocialSignup(userData) {
        localStorage.setItem('socialSyncUser', JSON.stringify(userData));
        this.showNotification('Account created successfully!', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    // Social Media Integration Methods
    async connectSocialMedia(platform) {
        const authUrls = {
            youtube: '/auth/youtube',
            facebook: '/auth/facebook',
            instagram: '/auth/facebook', // Instagram uses Facebook auth
            tiktok: '/auth/tiktok'
        };

        // Store current user ID for auth callback
        const userData = JSON.parse(localStorage.getItem('socialSyncUser') || '{}');
        const userId = userData.email || 'default';

        // Redirect to platform OAuth
        window.location.href = `${authUrls[platform]}?userId=${userId}`;
    }

    async shareToSocialMedia(platform, content) {
        const shareUrls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(content.text)}&url=${encodeURIComponent(content.url)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(content.url)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(content.url)}`
        };

        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    }

    // Utility Methods
    showLoadingState() {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>';
            submitBtn.disabled = true;
        }
    }

    hideLoadingState() {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = 'Create Account';
            submitBtn.disabled = false;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        } text-white`;
        notification.textContent = message;
        
        document.body.appendChild(notification);

        anime({
            targets: notification,
            translateX: [100, 0],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutQuart'
        });

        setTimeout(() => {
            anime({
                targets: notification,
                translateX: [0, 100],
                opacity: [1, 0],
                duration: 400,
                easing: 'easeOutQuart',
                complete: () => notification.remove()
            });
        }, 3000);
    }
}

// Initialize authentication
document.addEventListener('DOMContentLoaded', () => {
    window.socialSyncAuth = new SocialSyncAuth();
});
