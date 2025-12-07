# SocialSync Pro - Publishing Setup Guide

## 🎯 Overview
This guide will help you prepare your SocialSync Pro application for production publishing with your custom domain and real platform connections.

## 📋 Prerequisites Checklist
- [ ] Custom domain registered (e.g., yourdomain.com)
- [ ] Domain DNS access (through your registrar)
- [ ] GitHub account
- [ ] Platform developer accounts (YouTube, Facebook, Instagram, TikTok)
- [ ] Server/hosting plan (for backend APIs)

## 🌐 Domain Setup

### Step 1: GitHub Repository Setup
1. Create a new repository on GitHub named `socialsync-pro`
2. Upload all your application files
3. Enable GitHub Pages in repository settings

### Step 2: DNS Configuration
Add these DNS records to your domain registrar:

**For main domain (yourdomain.com):**
```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

**For subdomain (socialsync.yourdomain.com):**
```
Type: CNAME
Name: socialsync
Value: YOUR_USERNAME.github.io
```

### Step 3: Custom Domain in GitHub
1. Create a file named `CNAME` in your repository root
2. Add your domain name: `socialsync.yourdomain.com`
3. Commit and push the file

## 🔗 Platform API Setup

### YouTube API Setup

1. **Create Project**
   - Go to [Google Cloud Console](https://console.developers.google.com/)
   - Create a new project named "SocialSync Pro"
   - Enable YouTube Data API v3

2. **Create OAuth Credentials**
   - Go to APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Set application type to "Web application"
   - Add redirect URI: `https://yourdomain.com/auth/youtube/callback`
   - Copy Client ID and Client Secret

3. **API Key**
   - Create API Key credential
   - Restrict to YouTube Data API v3
   - Copy the API key

### Facebook/Instagram API Setup

1. **Create App**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create new app → Business → "SocialSync Pro"
   - Add Instagram Graph API product

2. **Configure Settings**
   - Add platform: Website
   - Site URL: `https://yourdomain.com`
   - Valid OAuth Redirect URIs: `https://yourdomain.com/auth/facebook/callback`

3. **Permissions**
   - Request these permissions:
     - `pages_manage_posts`
     - `instagram_content_publish`
     - `pages_read_engagement`

### TikTok API Setup

1. **Create App**
   - Go to [TikTok for Developers](https://developers.tiktok.com/)
   - Create new app
   - Set redirect URI: `https://yourdomain.com/auth/tiktok/callback`

2. **Configure Settings**
   - Add domain: `yourdomain.com`
   - Request video.upload permission

## 🛠 Backend Server Setup

### Option 1: Node.js Server
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { google } = require('googleapis');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// File upload configuration
const upload = multer({ dest: 'uploads/' });

// YouTube upload endpoint
app.post('/api/youtube/upload', upload.single('video'), async (req, res) => {
    try {
        const { title, description, tags, privacy } = req.body;
        
        // YouTube API integration
        const youtube = google.youtube({
            version: 'v3',
            auth: req.headers.authorization
        });
        
        // Upload video logic here
        
        res.json({ success: true, videoId: 'video_id' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

### Option 2: Serverless Functions (Vercel/Netlify)
```javascript
// api/youtube.js
export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            // YouTube API logic here
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
```

## 🔐 Security Configuration

### Environment Variables
Create `.env` file for sensitive data:
```
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret

FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
```

### API Security
1. **Never expose API keys in client-side code**
2. **Use environment variables for sensitive data**
3. **Implement rate limiting**
4. **Use HTTPS for all API calls**
5. **Validate all user inputs**

## 📱 Client-Side Integration

### Update API Endpoints
In `main.js`, update API endpoints:
```javascript
const API_CONFIG = {
    baseURL: 'https://yourdomain.com/api',
    endpoints: {
        youtube: '/youtube/upload',
        facebook: '/facebook/upload',
        instagram: '/instagram/upload',
        tiktok: '/tiktok/upload'
    }
};
```

### Authentication Flow
```javascript
// OAuth flow for platform connection
async function connectPlatform(platform) {
    const authUrl = `${API_CONFIG.baseURL}/auth/${platform}`;
    window.location.href = authUrl;
}

// Handle OAuth callback
function handleAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code) {
        // Exchange code for access token
        exchangeCodeForToken(code, state);
    }
}
```

## 🎥 Video Upload Implementation

### Frontend Upload
```javascript
async function uploadVideo(videoFile, metadata) {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('title', metadata.title);
    formData.append('description', metadata.description);
    formData.append('tags', JSON.stringify(metadata.tags));
    formData.append('category', metadata.category);
    formData.append('platforms', JSON.stringify(metadata.platforms));
    
    try {
        const response = await fetch(`${API_CONFIG.baseURL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
}
```

### Backend Video Processing
```javascript
const { createReadStream } = require('fs');
const { google } = require('googleapis');

async function uploadToYouTube(videoPath, metadata, accessToken) {
    const youtube = google.youtube({
        version: 'v3',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    
    const videoResource = {
        snippet: {
            title: metadata.title,
            description: metadata.description,
            tags: metadata.tags
        },
        status: {
            privacyStatus: metadata.privacy || 'public'
        }
    };
    
    const media = {
        mimeType: 'video/*',
        body: createReadStream(videoPath)
    };
    
    const response = await youtube.videos.insert({
        part: 'snippet,status',
        resource: videoResource,
        media: media
    });
    
    return response.data;
}
```

## 📊 Analytics Integration

### Database Schema
```sql
CREATE TABLE videos (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    platforms JSON,
    upload_date TIMESTAMP,
    user_id VARCHAR(255)
);

CREATE TABLE analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    video_id VARCHAR(255),
    platform VARCHAR(50),
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    shares INT DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Analytics API
```javascript
app.get('/api/analytics/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        
        // Fetch analytics from all platforms
        const youtubeStats = await getYouTubeAnalytics(videoId);
        const facebookStats = await getFacebookAnalytics(videoId);
        const instagramStats = await getInstagramAnalytics(videoId);
        const tiktokStats = await getTikTokAnalytics(videoId);
        
        const combinedStats = {
            totalViews: youtubeStats.views + facebookStats.views + 
                       instagramStats.views + tiktokStats.views,
            totalEngagement: youtubeStats.likes + facebookStats.likes + 
                           instagramStats.likes + tiktokStats.likes,
            platformBreakdown: {
                youtube: youtubeStats,
                facebook: facebookStats,
                instagram: instagramStats,
                tiktok: tiktokStats
            }
        };
        
        res.json(combinedStats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

## 🚨 Error Handling

### Frontend Error Handling
```javascript
async function handlePublish() {
    try {
        const result = await uploadVideo(videoFile, metadata);
        showNotification('Video published successfully!', 'success');
    } catch (error) {
        if (error.response) {
            // Server error
            showNotification(`Publishing failed: ${error.response.data.error}`, 'error');
        } else if (error.request) {
            // Network error
            showNotification('Network error. Please check your connection.', 'error');
        } else {
            // Other errors
            showNotification('An unexpected error occurred.', 'error');
        }
    }
}
```

### Backend Error Handling
```javascript
app.use((error, req, res, next) => {
    console.error('Error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
            error: 'File too large. Maximum size is 100MB.' 
        });
    }
    
    if (error.message.includes('OAuth')) {
        return res.status(401).json({ 
            error: 'Authentication failed. Please reconnect your account.' 
        });
    }
    
    res.status(500).json({ 
        error: 'Internal server error. Please try again later.' 
    });
});
```

## 🧪 Testing

### Local Testing
```bash
# Start backend server
npm run dev

# Test API endpoints
curl -X POST http://localhost:3000/api/youtube/upload \
  -H "Content-Type: multipart/form-data" \
  -F "video=@test-video.mp4" \
  -F "title=Test Video" \
  -F "description=Test description"
```

### Production Testing
1. Deploy to staging environment first
2. Test all platform connections
3. Verify video uploads work correctly
4. Check analytics data collection
5. Monitor error logs

## 📋 Production Checklist

### Pre-deployment
- [ ] All API keys configured
- [ ] Domain DNS configured
- [ ] SSL certificate active
- [ ] Environment variables set
- [ ] Error handling implemented
- [ ] Security measures in place

### Post-deployment
- [ ] Test all platform connections
- [ ] Verify video uploads
- [ ] Check analytics tracking
- [ ] Monitor performance
- [ ] Set up monitoring alerts

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Add CORS headers to your backend
   - Configure allowed origins

2. **OAuth Failures**
   - Check redirect URI configuration
   - Verify app permissions
   - Test with different browsers

3. **Upload Failures**
   - Check file size limits
   - Verify video format compatibility
   - Monitor network connectivity

4. **Analytics Not Working**
   - Verify API permissions
   - Check data collection setup
   - Monitor API rate limits

### Debug Commands
```bash
# Check server logs
pm2 logs

# Test API manually
curl -X GET https://yourdomain.com/api/health

# Monitor network requests
# Use browser developer tools
```

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review platform API documentation
3. Test with minimal configuration
4. Contact support with error details

---

Your SocialSync Pro is now ready for production publishing! Follow this guide step by step to connect your domain and enable real platform integrations.