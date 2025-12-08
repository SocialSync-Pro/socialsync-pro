# SocialSync Pro - API Integration Guide

## Overview
This guide provides detailed information about the API integrations for YouTube, Facebook, Instagram, and TikTok in SocialSync Pro.

## API Credentials

### YouTube Data API v3
```javascript
Client ID: "751267062472-sjj4nhk7olnip3t62f61cofnesn85v0i.apps.googleusercontent.com"
Client Secret: "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"
API Key: "AIzaSyBabeYCfFunyNEabmOiZK-v8MQLTyc225s"
```

**Required Scopes:**
- `https://www.googleapis.com/auth/youtube.upload` - Upload videos
- `https://www.googleapis.com/auth/youtube` - Manage YouTube account
- `https://www.googleapis.com/auth/youtubepartner` - Channel management

### Facebook/Instagram API
```javascript
SocialSync Pro ID: "3800240566776931"
Instagram App ID: "1946118359672190"
Instagram App Secret: "c0593061cd311db7a8d741dfc3bab856"
Redirect URI: "https://barakahecohomes.com/auth/facebook/callback"
```

**Required Scopes:**
- `pages_manage_posts` - Publish to Pages
- `pages_read_engagement` - Read Page insights
- `instagram_basic` - Basic Instagram access
- `instagram_content_publish` - Publish to Instagram
- `pages_show_list` - List connected Pages

### TikTok API
```javascript
Organization ID: "7581424600731354124"
Client Key: "awc0km4i5x8wchah"
Client Secret: "2KQFixICVMJiazz324a0BlYpPjL8s594"
```

**Required Scopes:**
- `video.upload` - Upload videos
- `user.info.basic` - Basic user information
- `video.list` - List user's videos

## Authentication Flow

### 1. YouTube OAuth 2.0
```javascript
// Step 1: Redirect to Google OAuth
const authUrl = `https://accounts.google.com/o/oauth2/auth?
    client_id=${CLIENT_ID}&
    redirect_uri=${REDIRECT_URI}&
    scope=${SCOPES.join(' ')}&
    response_type=code&
    access_type=offline&
    prompt=consent`;

// Step 2: Exchange code for tokens
const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: AUTH_CODE,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI
    })
});
```

### 2. Facebook OAuth
```javascript
// Step 1: Redirect to Facebook OAuth
const authUrl = `https://www.facebook.com/dialog/oauth?
    client_id=${APP_ID}&
    redirect_uri=${REDIRECT_URI}&
    scope=${SCOPES.join(',')}&
    response_type=code`;

// Step 2: Exchange code for token
const tokenResponse = await fetch(`https://graph.facebook.com/oauth/access_token?
    client_id=${APP_ID}&
    client_secret=${APP_SECRET}&
    code=${AUTH_CODE}&
    redirect_uri=${REDIRECT_URI}`);
```

### 3. TikTok OAuth
```javascript
// Step 1: Redirect to TikTok OAuth
const authUrl = `https://www.tiktok.com/auth/authorize?
    client_key=${CLIENT_KEY}&
    redirect_uri=${REDIRECT_URI}&
    scope=${SCOPES.join(',')}&
    response_type=code`;

// Step 2: Exchange code for tokens
const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET,
        code: AUTH_CODE,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI
    })
});
```

## Video Publishing

### YouTube Upload Process
1. **Initiate Upload**: POST to `/upload/youtube/v3/videos?uploadType=resumable`
2. **Send Metadata**: Include video title, description, tags, and privacy status
3. **Upload Video**: POST video file to the upload URL returned in step 1
4. **Monitor Progress**: Track upload progress and handle completion

### Facebook Video Publishing
1. **Get Page Access Token**: Exchange user token for page token
2. **Upload Video**: POST to `/{page-id}/videos` with video file
3. **Publish Post**: Video is automatically published to the Page

### Instagram Video Publishing
1. **Create Media Container**: POST to `/{ig-user-id}/media` with video URL
2. **Check Container Status**: GET container status until `FINISHED`
3. **Publish Media**: POST to `/{ig-user-id}/media_publish` with container ID

### TikTok Video Upload
1. **Initialize Upload**: POST to `/share/video/upload/` with video metadata
2. **Upload Video File**: Follow TikTok's multipart upload process
3. **Complete Upload**: Finalize the upload and get share ID

## Analytics Integration

### YouTube Analytics
```javascript
// Get video statistics
const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?
    part=statistics&id=${VIDEO_ID}`, {
    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
});

// Get channel analytics
const analyticsResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?
    part=statistics&id=${CHANNEL_ID}`, {
    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
});
```

### Facebook/Instagram Insights
```javascript
// Get post insights
const response = await fetch(`https://graph.facebook.com/v18.0/${POST_ID}/insights?
    metric=post_video_views,post_video_avg_time_watched&
    access_token=${ACCESS_TOKEN}`);

// Get page insights
const pageResponse = await fetch(`https://graph.facebook.com/v18.0/${PAGE_ID}/insights?
    metric=page_video_views,page_video_avg_time_watched&
    access_token=${ACCESS_TOKEN}`);
```

## Security Best Practices

### 1. Token Storage
- Store tokens securely (consider using IndexedDB or secure cookies)
- Implement token refresh mechanisms
- Never expose client secrets in client-side code

### 2. API Rate Limiting
- Implement request queuing to respect rate limits
- Cache responses when appropriate
- Handle rate limit errors gracefully

### 3. Error Handling
```javascript
try {
    const response = await apiCall();
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    return await response.json();
} catch (error) {
    console.error('API Error:', error);
    // Implement retry logic or user notification
}
```

## Implementation Notes

### Frontend Integration
The main.js file includes methods for:
- `connectYouTube()` - Initiates YouTube OAuth flow
- `connectFacebook()` - Handles Facebook authentication
- `connectTikTok()` - Manages TikTok OAuth
- `publishToPlatforms()` - Coordinates multi-platform publishing

### Backend Requirements
For production deployment, you'll need:
- Secure token storage system
- API proxy endpoints to protect credentials
- Webhook handlers for OAuth callbacks
- Background job processing for video uploads

### Testing
- Use sandbox/test environments when available
- Implement comprehensive error logging
- Test with various video formats and sizes
- Verify platform-specific requirements (aspect ratios, durations, etc.)

## Support and Resources

### Platform Documentation
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-graph-api)
- [TikTok for Developers](https://developers.tiktok.com)

### Rate Limits
- YouTube: 10,000 units per day, 3,000 per 100 seconds
- Facebook: 200 calls per hour per user
- TikTok: Varies by endpoint, typically 100-1000 per hour

### Common Issues
1. **Invalid Redirect URI**: Ensure exact match in app settings
2. **Scope Mismatches**: Verify all required scopes are requested
3. **Token Expiration**: Implement automatic refresh logic
4. **Rate Limiting**: Queue requests and implement backoff strategies