// SocialSync Pro - Backend Server Template
// Node.js Express server with API integrations

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['https://yourdomain.com', 'http://localhost:8000'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed'));
        }
    }
});

// In-memory storage for tokens (use database in production)
const userTokens = new Map();

// ==================== AUTHENTICATION ROUTES ====================

// YouTube OAuth
app.get('/auth/youtube', (req, res) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET,
        `${process.env.BASE_URL}/auth/youtube/callback`
    );

    const scopes = [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtubepartner'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: req.query.userId || 'default'
    });

    res.redirect(authUrl);
});

// YouTube OAuth Callback
app.get('/auth/youtube/callback', async (req, res) => {
    const { code, state } = req.query;
    
    if (!code) {
        return res.status(400).json({ error: 'No authorization code provided' });
    }

    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.YOUTUBE_CLIENT_ID,
            process.env.YOUTUBE_CLIENT_SECRET,
            `${process.env.BASE_URL}/auth/youtube/callback`
        );

        const { tokens } = await oauth2Client.getToken(code);
        
        // Store tokens (use database in production)
        userTokens.set(`youtube_${state}`, tokens);
        
        res.redirect(`${process.env.FRONTEND_URL}/platforms.html?connected=youtube`);
    } catch (error) {
        console.error('YouTube OAuth error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/platforms.html?error=youtube_auth_failed`);
    }
});

// Facebook OAuth
app.get('/auth/facebook', (req, res) => {
    const params = new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID,
        redirect_uri: `${process.env.BASE_URL}/auth/facebook/callback`,
        scope: 'pages_manage_posts,instagram_content_publish,pages_read_engagement',
        response_type: 'code',
        state: req.query.userId || 'default'
    });

    res.redirect(`https://www.facebook.com/v12.0/dialog/oauth?${params}`);
});

// Facebook OAuth Callback
app.get('/auth/facebook/callback', async (req, res) => {
    const { code, state } = req.query;
    
    if (!code) {
        return res.status(400).json({ error: 'No authorization code provided' });
    }

    try {
        const tokenParams = new URLSearchParams({
            client_id: process.env.FACEBOOK_APP_ID,
            client_secret: process.env.FACEBOOK_APP_SECRET,
            redirect_uri: `${process.env.BASE_URL}/auth/facebook/callback`,
            code: code
        });

        const tokenResponse = await axios.get(`https://graph.facebook.com/v12.0/oauth/access_token?${tokenParams}`);
        const { access_token } = tokenResponse.data;
        
        // Get pages and Instagram accounts
        const accountsResponse = await axios.get(`https://graph.facebook.com/v12.0/me/accounts`, {
            params: { access_token }
        });

        userTokens.set(`facebook_${state}`, {
            access_token,
            pages: accountsResponse.data.data
        });
        
        res.redirect(`${process.env.FRONTEND_URL}/platforms.html?connected=facebook`);
    } catch (error) {
        console.error('Facebook OAuth error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/platforms.html?error=facebook_auth_failed`);
    }
});

// TikTok OAuth
app.get('/auth/tiktok', (req, res) => {
    const params = new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY,
        redirect_uri: `${process.env.BASE_URL}/auth/tiktok/callback`,
        scope: 'video.upload',
        response_type: 'code',
        state: req.query.userId || 'default'
    });

    res.redirect(`https://www.tiktok.com/v2/auth/authorize?${params}`);
});

// TikTok OAuth Callback
app.get('/auth/tiktok/callback', async (req, res) => {
    const { code, state } = req.query;
    
    if (!code) {
        return res.status(400).json({ error: 'No authorization code provided' });
    }

    try {
        const tokenResponse = await axios.post('https://open-api.tiktok.com/v2/oauth/token/', {
            client_key: process.env.TIKTOK_CLIENT_KEY,
            client_secret: process.env.TIKTOK_CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: `${process.env.BASE_URL}/auth/tiktok/callback`
        });

        const { access_token, open_id } = tokenResponse.data;
        
        userTokens.set(`tiktok_${state}`, {
            access_token,
            open_id
        });
        
        res.redirect(`${process.env.FRONTEND_URL}/platforms.html?connected=tiktok`);
    } catch (error) {
        console.error('TikTok OAuth error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/platforms.html?error=tiktok_auth_failed`);
    }
});

// ==================== VIDEO UPLOAD ROUTES ====================

// Multi-platform upload
app.post('/api/upload', upload.single('video'), async (req, res) => {
    try {
        const { title, description, tags, category, platforms } = req.body;
        const videoFile = req.file;
        const userId = req.headers['x-user-id'] || 'default';
        
        if (!videoFile) {
            return res.status(400).json({ error: 'No video file provided' });
        }

        const platformList = JSON.parse(platforms);
        const results = {};
        
        for (const platform of platformList) {
            try {
                switch (platform) {
                    case 'youtube':
                        results.youtube = await uploadToYouTube(videoFile, {
                            title, description, tags: JSON.parse(tags), category
                        }, userTokens.get(`youtube_${userId}`));
                        break;
                    case 'facebook':
                        results.facebook = await uploadToFacebook(videoFile, {
                            title, description
                        }, userTokens.get(`facebook_${userId}`));
                        break;
                    case 'instagram':
                        results.instagram = await uploadToInstagram(videoFile, {
                            title, description
                        }, userTokens.get(`facebook_${userId}`));
                        break;
                    case 'tiktok':
                        results.tiktok = await uploadToTikTok(videoFile, {
                            title, description
                        }, userTokens.get(`tiktok_${userId}`));
                        break;
                }
            } catch (error) {
                console.error(`${platform} upload error:`, error);
                results[platform] = { error: error.message };
            }
        }
        
        // Clean up uploaded file
        fs.unlinkSync(videoFile.path);
        
        res.json({
            success: true,
            results: results,
            message: 'Upload process completed'
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== PLATFORM UPLOAD FUNCTIONS ====================

async function uploadToYouTube(videoFile, metadata, tokens) {
    if (!tokens || !tokens.access_token) {
        throw new Error('YouTube authentication required');
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client
    });

    const videoResource = {
        snippet: {
            title: metadata.title,
            description: metadata.description,
            tags: metadata.tags || []
        },
        status: {
            privacyStatus: 'public',
            madeForKids: false
        }
    };

    const response = await youtube.videos.insert({
        part: 'snippet,status',
        resource: videoResource,
        media: {
            mimeType: 'video/*',
            body: fs.createReadStream(videoFile.path)
        }
    });

    return {
        videoId: response.data.id,
        url: `https://www.youtube.com/watch?v=${response.data.id}`
    };
}

async function uploadToFacebook(videoFile, metadata, tokens) {
    if (!tokens || !tokens.access_token) {
        throw new Error('Facebook authentication required');
    }

    // Get user's pages
    const pagesResponse = await axios.get(`https://graph.facebook.com/v12.0/me/accounts`, {
        params: { access_token: tokens.access_token }
    });

    const page = pagesResponse.data.data[0]; // Use first page
    if (!page) {
        throw new Error('No Facebook pages found');
    }

    // Upload video to Facebook page
    const formData = new FormData();
    formData.append('source', fs.createReadStream(videoFile.path));
    formData.append('title', metadata.title);
    formData.append('description', metadata.description);

    const uploadResponse = await axios.post(
        `https://graph.facebook.com/v12.0/${page.id}/videos`,
        formData,
        {
            params: { access_token: page.access_token },
            headers: formData.getHeaders()
        }
    );

    return {
        videoId: uploadResponse.data.id,
        url: `https://www.facebook.com/${page.id}/videos/${uploadResponse.data.id}`
    };
}

async function uploadToInstagram(videoFile, metadata, tokens) {
    if (!tokens || !tokens.pages || tokens.pages.length === 0) {
        throw new Error('Instagram authentication required');
    }

    const page = tokens.pages.find(p => p.instagram_business_account);
    if (!page) {
        throw new Error('No Instagram business account found');
    }

    const igAccountId = page.instagram_business_account.id;

    // Step 1: Create media container
    const containerResponse = await axios.post(
        `https://graph.facebook.com/v12.0/${igAccountId}/media`,
        {
            media_type: 'VIDEO',
            video_url: 'https://your-cdn.com/video-url.mp4', // You need to upload to a CDN first
            caption: metadata.description
        },
        {
            params: { access_token: page.access_token }
        }
    );

    const containerId = containerResponse.data.id;

    // Step 2: Publish the container
    const publishResponse = await axios.post(
        `https://graph.facebook.com/v12.0/${igAccountId}/media_publish`,
        {
            creation_id: containerId
        },
        {
            params: { access_token: page.access_token }
        }
    );

    return {
        mediaId: publishResponse.data.id,
        url: `https://www.instagram.com/p/${publishResponse.data.id}`
    };
}

async function uploadToTikTok(videoFile, metadata, tokens) {
    if (!tokens || !tokens.access_token) {
        throw new Error('TikTok authentication required');
    }

    // Step 1: Initialize upload
    const initResponse = await axios.post(
        'https://open-api.tiktok.com/v2/video/upload/',
        {
            open_id: tokens.open_id,
            access_token: tokens.access_token
        }
    );

    const uploadUrl = initResponse.data.upload_url;

    // Step 2: Upload video
    const formData = new FormData();
    formData.append('video', fs.createReadStream(videoFile.path));

    await axios.post(uploadUrl, formData, {
        headers: formData.getHeaders()
    });

    // Step 3: Create video
    const createResponse = await axios.post(
        'https://open-api.tiktok.com/v2/video/create/',
        {
            open_id: tokens.open_id,
            access_token: tokens.access_token,
            video_id: initResponse.data.video_id,
            title: metadata.title
        }
    );

    return {
        videoId: createResponse.data.video_id,
        url: `https://www.tiktok.com/@username/video/${createResponse.data.video_id}`
    };
}

// ==================== ANALYTICS ROUTES ====================

app.get('/api/analytics/:platform', async (req, res) => {
    try {
        const { platform } = req.params;
        const userId = req.headers['x-user-id'] || 'default';
        
        let analytics = {};
        
        switch (platform) {
            case 'youtube':
                analytics = await getYouTubeAnalytics(userTokens.get(`youtube_${userId}`));
                break;
            case 'facebook':
                analytics = await getFacebookAnalytics(userTokens.get(`facebook_${userId}`));
                break;
            case 'instagram':
                analytics = await getInstagramAnalytics(userTokens.get(`facebook_${userId}`));
                break;
            case 'tiktok':
                analytics = await getTikTokAnalytics(userTokens.get(`tiktok_${userId}`));
                break;
        }
        
        res.json(analytics);
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Analytics functions
async function getYouTubeAnalytics(tokens) {
    if (!tokens || !tokens.access_token) {
        return { error: 'Not authenticated' };
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client
    });

    const channelsResponse = await youtube.channels.list({
        part: 'statistics',
        mine: true
    });

    const channel = channelsResponse.data.items[0];
    
    return {
        subscribers: channel.statistics.subscriberCount,
        totalViews: channel.statistics.viewCount,
        totalVideos: channel.statistics.videoCount
    };
}

// ==================== ERROR HANDLING ====================

app.use((error, req, res, next) => {
    console.error('Server error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
            error: 'File too large. Maximum size is 100MB.' 
        });
    }
    
    if (error.message.includes('OAuth') || error.message.includes('authentication')) {
        return res.status(401).json({ 
            error: 'Authentication failed. Please reconnect your account.' 
        });
    }
    
    res.status(500).json({ 
        error: 'Internal server error. Please try again later.' 
    });
});

// ==================== SERVER STARTUP ====================

app.listen(PORT, () => {
    console.log(`SocialSync Pro server running on port ${PORT}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`Base URL: ${process.env.BASE_URL}`);
});

module.exports = app;