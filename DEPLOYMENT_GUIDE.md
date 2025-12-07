# SocialSync Pro - Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying SocialSync Pro to GitHub Pages and your custom domain.

## Prerequisites
- GitHub account
- Git installed on your computer
- Text editor (VS Code recommended)
- Custom domain (optional)

## Step 1: Prepare Your Files

### Enhanced Video Metadata Features
Your application now includes:
- **Video Titles**: Custom titles for each video
- **Descriptions**: Detailed descriptions with character counter (5000 char limit)
- **Tags**: Comma-separated tags for better discoverability
- **Categories**: Content categorization (Education, Entertainment, Gaming, etc.)
- **Platform-specific customization**: Different settings per platform

### File Structure
```
SocialSync-Pro/
├── index.html              # Main dashboard
├── platforms.html          # Platform integration
├── analytics.html          # Analytics dashboard
├── settings.html           # Settings page
├── main.js                 # Core JavaScript functionality
├── resources/              # Images and assets
│   ├── hero-main.png
│   ├── network-bg.png
│   ├── upload-interface.png
│   └── analytics-dashboard.png
├── DEPLOYMENT_GUIDE.md     # This file
└── README.md              # Project documentation
```

## Step 2: Create GitHub Repository

### Method 1: Using GitHub Web Interface
1. Go to [GitHub](https://github.com) and log in
2. Click the "+" icon in the top right and select "New repository"
3. Name your repository (e.g., "socialsync-pro")
4. Set it to "Public" for GitHub Pages
5. Don't initialize with README (we'll add our own)
6. Click "Create repository"

### Method 2: Using Command Line
```bash
# Create a new directory for your project
mkdir socialsync-pro
cd socialsync-pro

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit - SocialSync Pro"

# Add remote repository (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/socialsync-pro.git

# Push to main branch
git push -u origin main
```

## Step 3: Upload Files to Repository

### Option 1: Upload via Web Interface
1. Go to your newly created repository
2. Click "uploading an existing file"
3. Drag and drop all your project files
4. Commit the changes

### Option 2: Upload via Command Line
```bash
# Copy all your project files to the repository directory
# Then run:
git add .
git commit -m "Add SocialSync Pro application files"
git push origin main
```

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" section in the left sidebar
4. Under "Source", select "Deploy from a branch"
5. Select "main" branch and "/ (root)" folder
6. Click "Save"

Your site will be available at: `https://YOUR_USERNAME.github.io/socialsync-pro`

## Step 5: Custom Domain Setup (Optional)

### Method 1: Using GitHub Settings
1. Go to Settings → Pages in your repository
2. Under "Custom domain", enter your domain (e.g., `socialsync.yourdomain.com`)
3. Click "Save"
4. Follow the DNS configuration instructions provided by GitHub

### Method 2: Using CNAME File
1. Create a file named `CNAME` in your repository root
2. Add your custom domain name (e.g., `socialsync.yourdomain.com`)
3. Commit and push the file

### DNS Configuration
Add these DNS records to your domain provider:

**For apex domain (yourdomain.com):**
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

## Step 6: Verify Deployment

1. Wait 5-10 minutes for GitHub Pages to deploy
2. Visit your GitHub Pages URL: `https://YOUR_USERNAME.github.io/socialsync-pro`
3. If using custom domain, visit your custom domain
4. Test all functionality:
   - Video upload interface
   - Platform selection
   - Publishing simulation
   - Analytics charts
   - Settings page

## Step 7: Configure Application Settings

### Update Base URLs
If using a custom domain, update any absolute URLs in your HTML files:

In `index.html`, `platforms.html`, `analytics.html`, `settings.html`:
```html
<!-- Update navigation links if needed -->
<a href="/">Dashboard</a>
<a href="/platforms.html">Platforms</a>
<a href="/analytics.html">Analytics</a>
<a href="/settings.html">Settings</a>
```

### Configure API Endpoints
For production deployment, update API endpoints in `main.js`:

```javascript
// Update API endpoints for production
const API_ENDPOINTS = {
    youtube: 'https://your-api-server.com/api/youtube',
    facebook: 'https://your-api-server.com/api/facebook',
    instagram: 'https://your-api-server.com/api/instagram',
    tiktok: 'https://your-api-server.com/api/tiktok'
};
```

## Step 8: Advanced Configuration

### Environment Variables
For sensitive data, use environment variables:

1. Create `.env` file (for local development only)
2. Add to `.gitignore`
3. Use GitHub Secrets for production API keys

### Performance Optimization
1. **Minify CSS/JS**: Use build tools like Webpack or Parcel
2. **Image Optimization**: Compress images before deployment
3. **CDN Integration**: Use CDN for external libraries

### Security Considerations
1. **HTTPS**: GitHub Pages provides free SSL
2. **API Security**: Never expose API keys in client-side code
3. **Content Security Policy**: Add CSP headers

## Troubleshooting

### Common Issues

1. **404 Error**
   - Check file names and paths
   - Ensure `index.html` exists
   - Verify repository is public

2. **Custom Domain Not Working**
   - Check DNS propagation (may take 24-48 hours)
   - Verify CNAME configuration
   - Check for typos in domain name

3. **Images Not Loading**
   - Check image paths in `resources/` folder
   - Verify image file extensions
   - Check case sensitivity

4. **JavaScript Errors**
   - Open browser developer console
   - Check for CORS issues
   - Verify external library URLs

### Debug Commands
```bash
# Check git status
git status

# View git log
git log --oneline

# Test locally
python -m http.server 8000
# Then visit http://localhost:8000
```

## Next Steps

### 1. API Integration
Connect real social media APIs:
- YouTube Data API v3
- Facebook Graph API
- Instagram Graph API
- TikTok for Business API

### 2. Backend Development
Consider adding:
- User authentication
- Database for storing videos
- File upload handling
- Background job processing

### 3. Advanced Features
- Video transcoding
- Thumbnail generation
- A/B testing
- Advanced analytics
- Mobile app

## Support

If you encounter issues:
1. Check GitHub Pages documentation
2. Review this deployment guide
3. Test locally before deploying
4. Check browser developer console for errors

## Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Custom Domain Configuration](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [GitHub Pages Troubleshooting](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting)

---

Your SocialSync Pro is now ready for deployment! The enhanced video metadata features allow you to add detailed titles, descriptions, tags, and categories to optimize your video content across all platforms.