// SocialSync Pro - Server Configuration
// API integration and authentication handling

class SocialSyncServer {
    constructor() {
        this.apiConfigs = {
            youtube: {
                clientId: '751267062472-sjj4nhk7olnip3t62f61cofnesn85v0i.apps.googleusercontent.com',
                clientSecret: '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',
                apiKey: 'AIzaSyBabeYCfFunyNEabmOiZK-v8MQLTyc225s',
                scopes: [
                    'https://www.googleapis.com/auth/youtube.upload',
                    'https://www.googleapis.com/auth/youtube',
                    'https://www.googleapis.com/auth/youtubepartner'
                ],
                authUrl: 'https://accounts.google.com/o/oauth2/auth',
                tokenUrl: 'https://oauth2.googleapis.com/token'
            },
            facebook: {
                appId: '3800240566776931',
                clientId: '1946118359672190',
                clientSecret: 'c0593061cd311db7a8d741dfc3bab856',
                redirectUri: 'https://barakahecohomes.com/auth/facebook/callback',
                scopes: [
                    'pages_manage_posts',
                    'pages_read_engagement',
                    'instagram_basic',
                    'instagram_content_publish',
                    'pages_show_list'
                ],
                authUrl: 'https://www.facebook.com/dialog/oauth',
                tokenUrl: 'https://graph.facebook.com/oauth/access_token'
            },
            instagram: {
                appId: '1946118359672190',
                clientSecret: 'c0593061cd311db7a8d741dfc3bab856',
                redirectUri: 'https://barakahecohomes.com/auth/facebook/callback',
                scopes: [
                    'instagram_basic',
                    'instagram_content_publish',
                    'instagram_manage_insights'
                ]
            },
            tiktok: {
                orgId: '7581424600731354124',
                clientKey: 'awc0km4i5x8wchah',
                clientSecret: '2KQFixICVMJiazz324a0BlYpPjL8s594',
                scopes: [
                    'video.upload',
                    'user.info.basic',
                    'video.list'
                ],
                authUrl: 'https://www.tiktok.com/auth/authorize',
                tokenUrl: 'https://open-api.tiktok.com/oauth/access_token'
            }
        };
        
        this.userTokens = new Map();
        this.refreshTokens = new Map();
    }

    // YouTube API Integration
    async getYouTubeAuthUrl(state = '') {
        const config = this.apiConfigs.youtube;
        const params = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: window.location.origin + '/auth/youtube/callback',
            scope: config.scopes.join(' '),
            response_type: 'code',
            access_type: 'offline',
            prompt: 'consent',
            state: state
        });
        
        return `${config.authUrl}?${params.toString()}`;
    }

    async exchangeYouTubeCode(code) {
        const config = this.apiConfigs.youtube;
        const tokenData = {
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: window.location.origin + '/auth/youtube/callback'
        };

        try {
            const response = await fetch(config.tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(tokenData)
            });

            const data = await response.json();
            
            if (data.access_token) {
                this.userTokens.set('youtube', {
                    accessToken: data.access_token,
                    refreshToken: data.refresh_token,
                    expiresIn: data.expires_in,
                    obtainedAt: Date.now()
                });
                
                return {
                    success: true,
                    token: data.access_token,
                    refreshToken: data.refresh_token
                };
            } else {
                throw new Error(data.error || 'Failed to exchange code');
            }
        } catch (error) {
            console.error('YouTube token exchange error:', error);
            return { success: false, error: error.message };
        }
    }

    // Facebook API Integration
    async getFacebookAuthUrl(state = '') {
        const config = this.apiConfigs.facebook;
        const params = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            scope: config.scopes.join(','),
            response_type: 'code',
            state: state
        });
        
        return `${config.authUrl}?${params.toString()}`;
    }

    async exchangeFacebookCode(code) {
        const config = this.apiConfigs.facebook;
        const tokenData = {
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code: code,
            redirect_uri: config.redirectUri
        };

        try {
            const response = await fetch(`${config.tokenUrl}?${new URLSearchParams(tokenData)}`);
            const data = await response.json();
            
            if (data.access_token) {
                this.userTokens.set('facebook', {
                    accessToken: data.access_token,
                    expiresIn: data.expires_in,
                    obtainedAt: Date.now()
                });
                
                // Also get Instagram token (same as Facebook for Business accounts)
                this.userTokens.set('instagram', {
                    accessToken: data.access_token,
                    expiresIn: data.expires_in,
                    obtainedAt: Date.now()
                });
                
                return {
                    success: true,
                    token: data.access_token
                };
            } else {
                throw new Error(data.error || 'Failed to exchange code');
            }
        } catch (error) {
            console.error('Facebook token exchange error:', error);
            return { success: false, error: error.message };
        }
    }

    // TikTok API Integration
    async getTikTokAuthUrl(state = '') {
        const config = this.apiConfigs.tiktok;
        const params = new URLSearchParams({
            client_key: config.clientKey,
            redirect_uri: window.location.origin + '/auth/tiktok/callback',
            scope: config.scopes.join(','),
            response_type: 'code',
            state: state
        });
        
        return `${config.authUrl}?${params.toString()}`;
    }

    async exchangeTikTokCode(code) {
        const config = this.apiConfigs.tiktok;
        const tokenData = {
            client_key: config.clientKey,
            client_secret: config.clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: window.location.origin + '/auth/tiktok/callback'
        };

        try {
            const response = await fetch(config.tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tokenData)
            });

            const data = await response.json();
            
            if (data.access_token) {
                this.userTokens.set('tiktok', {
                    accessToken: data.access_token,
                    expiresIn: data.expires_in,
                    openId: data.open_id,
                    obtainedAt: Date.now()
                });
                
                return {
                    success: true,
                    token: data.access_token,
                    openId: data.open_id
                };
            } else {
                throw new Error(data.error || 'Failed to exchange code');
            }
        } catch (error) {
            console.error('TikTok token exchange error:', error);
            return { success: false, error: error.message };
        }
    }

    // Token Management
    getToken(platform) {
        const tokenData = this.userTokens.get(platform);
        if (!tokenData) return null;

        // Check if token is expired
        const now = Date.now();
        const tokenAge = (now - tokenData.obtainedAt) / 1000;
        
        if (tokenAge >= tokenData.expiresIn) {
            // Token expired, need refresh
            return this.refreshToken(platform);
        }

        return tokenData.accessToken;
    }

    async refreshToken(platform) {
        const tokenData = this.userTokens.get(platform);
        if (!tokenData || !tokenData.refreshToken) {
            return null;
        }

        try {
            let refreshData;
            
            switch (platform) {
                case 'youtube':
                    refreshData = {
                        client_id: this.apiConfigs.youtube.clientId,
                        client_secret: this.apiConfigs.youtube.clientSecret,
                        refresh_token: tokenData.refreshToken,
                        grant_type: 'refresh_token'
                    };
                    
                    const response = await fetch(this.apiConfigs.youtube.tokenUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams(refreshData)
                    });
                    
                    const data = await response.json();
                    
                    if (data.access_token) {
                        this.userTokens.set('youtube', {
                            ...tokenData,
                            accessToken: data.access_token,
                            expiresIn: data.expires_in,
                            obtainedAt: Date.now()
                        });
                        
                        return data.access_token;
                    }
                    break;
                    
                default:
                    console.warn(`Token refresh not implemented for ${platform}`);
                    return null;
            }
        } catch (error) {
            console.error(`Token refresh error for ${platform}:`, error);
            return null;
        }
    }

    // Video Publishing APIs
    async publishToYouTube(videoData, accessToken) {
        const url = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable';
        
        const metadata = {
            snippet: {
                title: videoData.title,
                description: videoData.description,
                tags: videoData.tags || [],
                categoryId: videoData.categoryId || '22' // People & Blogs
            },
            status: {
                privacyStatus: videoData.privacyStatus || 'public',
                madeForKids: false
            }
        };

        try {
            // Step 1: Get upload URL
            const initResponse = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json; charset=UTF-8',
                    'X-Upload-Content-Length': videoData.fileSize,
                    'X-Upload-Content-Type': videoData.contentType || 'video/*'
                },
                body: JSON.stringify(metadata)
            });

            if (initResponse.status === 200) {
                const uploadUrl = initResponse.headers.get('Location');
                return { success: true, uploadUrl: uploadUrl };
            } else {
                throw new Error('Failed to get upload URL');
            }
        } catch (error) {
            console.error('YouTube publish error:', error);
            return { success: false, error: error.message };
        }
    }

    async publishToFacebook(videoData, accessToken, pageId) {
        const url = `https://graph.facebook.com/v18.0/${pageId}/videos`;
        
        const formData = new FormData();
        formData.append('title', videoData.title);
        formData.append('description', videoData.description);
        formData.append('access_token', accessToken);
        // Note: In real implementation, you'd upload the actual file

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.id) {
                return { success: true, videoId: data.id };
            } else {
                throw new Error(data.error?.message || 'Failed to publish video');
            }
        } catch (error) {
            console.error('Facebook publish error:', error);
            return { success: false, error: error.message };
        }
    }

    async publishToInstagram(videoData, accessToken, instagramAccountId) {
        // Instagram requires a 2-step process: upload to container, then publish
        const containerUrl = `https://graph.facebook.com/v18.0/${instagramAccountId}/media`;
        
        const containerData = {
            media_type: 'VIDEO',
            caption: videoData.description,
            access_token: accessToken
        };

        try {
            // Step 1: Create media container
            const containerResponse = await fetch(containerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(containerData)
            });

            const containerDataResponse = await containerResponse.json();
            
            if (containerDataResponse.id) {
                // Step 2: Publish the container
                const publishUrl = `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`;
                const publishData = {
                    creation_id: containerDataResponse.id,
                    access_token: accessToken
                };

                const publishResponse = await fetch(publishUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(publishData)
                });

                const publishResult = await publishResponse.json();
                
                if (publishResult.id) {
                    return { success: true, mediaId: publishResult.id };
                } else {
                    throw new Error(publishResult.error?.message || 'Failed to publish to Instagram');
                }
            } else {
                throw new Error(containerDataResponse.error?.message || 'Failed to create media container');
            }
        } catch (error) {
            console.error('Instagram publish error:', error);
            return { success: false, error: error.message };
        }
    }

    async publishToTikTok(videoData, accessToken, openId) {
        const url = 'https://open-api.tiktok.com/share/video/upload/';
        
        const postData = {
            open_id: openId,
            access_token: accessToken,
            title: videoData.title,
            description: videoData.description
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData)
            });

            const data = await response.json();
            
            if (data.data && data.data.share_id) {
                return { success: true, shareId: data.data.share_id };
            } else {
                throw new Error(data.error?.message || 'Failed to publish to TikTok');
            }
        } catch (error) {
            console.error('TikTok publish error:', error);
            return { success: false, error: error.message };
        }
    }

    // Analytics APIs
    async getYouTubeAnalytics(accessToken, videoId) {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const data = await response.json();
            
            if (data.items && data.items[0]) {
                const stats = data.items[0].statistics;
                return {
                    success: true,
                    views: parseInt(stats.viewCount),
                    likes: parseInt(stats.likeCount),
                    comments: parseInt(stats.commentCount),
                    shares: parseInt(stats.shareCount || 0)
                };
            } else {
                throw new Error('Video not found or no statistics available');
            }
        } catch (error) {
            console.error('YouTube analytics error:', error);
            return { success: false, error: error.message };
        }
    }

    async getFacebookAnalytics(accessToken, postId) {
        const url = `https://graph.facebook.com/v18.0/${postId}/insights?metric=post_video_views,post_video_avg_time_watched`;
        
        try {
            const response = await fetch(`${url}&access_token=${accessToken}`);
            const data = await response.json();
            
            if (data.data) {
                const insights = {};
                data.data.forEach(insight => {
                    insights[insight.name] = insight.values[0]?.value || 0;
                });
                
                return {
                    success: true,
                    views: insights.post_video_views || 0,
                    avgWatchTime: insights.post_video_avg_time_watched || 0
                };
            } else {
                throw new Error('Failed to get Facebook analytics');
            }
        } catch (error) {
            console.error('Facebook analytics error:', error);
            return { success: false, error: error.message };
        }
    }

    // Utility Methods
    isTokenValid(platform) {
        const tokenData = this.userTokens.get(platform);
        if (!tokenData) return false;
        
        const now = Date.now();
        const tokenAge = (now - tokenData.obtainedAt) / 1000;
        
        return tokenAge < tokenData.expiresIn;
    }

    getConnectedPlatforms() {
        const connected = [];
        
        for (const [platform, tokenData] of this.userTokens) {
            if (this.isTokenValid(platform)) {
                connected.push(platform);
            }
        }
        
        return connected;
    }
}

// Initialize server configuration
const socialSyncServer = new SocialSyncServer();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SocialSyncServer;
}