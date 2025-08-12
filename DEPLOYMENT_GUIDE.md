# BookVault Deployment Guide

## 🚀 Deployment Overview

BookVault is ready for deployment on Vercel or any other platform that supports Next.js applications. This guide will walk you through the deployment process.

## 📋 Prerequisites

- Node.js 18+ installed locally
- Git repository set up
- Vercel account (for Vercel deployment)
- GitHub account (for GitHub integration)

## 🔧 Build Configuration

### Local Build
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run linting and type checking
npm run lint
npm run type-check
```

### Deployment Build
```bash
# Build with deployment configuration
npm run build:deploy

# Full deployment preparation
npm run deploy:prepare
```

## 🌐 Vercel Deployment

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
# Deploy with automatic configuration
vercel

# Or deploy with specific settings
vercel --prod
```

### Method 2: GitHub Integration

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Configure build settings:
     - **Build Command**: `npm run build:deploy`
     - **Output Directory**: `.next`
     - **Install Command**: `npm install`

### Method 3: Vercel Dashboard

1. **Import Project**
   - Go to Vercel dashboard
   - Click "New Project"
   - Drag and drop your project folder

2. **Configure Environment Variables**
   - Go to project settings
   - Add environment variables from `.env.example`

## ⚙️ Environment Variables

### Required Variables
```env
# Database Configuration
DATABASE_URL="file:./dev.db"

# Application Configuration
NEXT_PUBLIC_APP_NAME="BookVault"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### Optional Variables
```env
# Z.ai Web Dev SDK (if needed)
ZAI_API_KEY="your_api_key_here"

# Analytics (optional)
NEXT_PUBLIC_GA_ID="your_google_analytics_id"
```

## 📁 Project Structure

```
bookvault/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── download/[id]/route.ts    # Download API
│   │   │   └── search-simple/route.ts    # Search API
│   │   ├── download/[id]/page.tsx        # Download page
│   │   └── page.tsx                      # Home page
│   ├── components/
│   │   └── ui/                          # shadcn/ui components
│   └── lib/
├── public/
├── next.config.ts                       # Deployment config
├── next.config.deploy.ts                # Production config
├── vercel.json                          # Vercel configuration
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🔍 Troubleshooting

### Build Issues

#### Problem: Build Timeout
**Solution**: Use deployment configuration
```bash
npm run build:deploy
```

#### Problem: Font Loading Issues
**Solution**: The project uses system fonts now, so Google Fonts are not required.

#### Problem: ZAI SDK Issues
**Solution**: The API has fallback logic if ZAI SDK is not available.

### Runtime Issues

#### Problem: API Routes Not Working
**Solution**: Check environment variables and ensure proper configuration in `vercel.json`.

#### Problem: Images Not Loading
**Solution**: Ensure image domains are configured in `next.config.ts`.

#### Problem: CORS Issues
**Solution**: The `vercel.json` includes proper CORS headers for API routes.

## 📊 Performance Optimization

### Build Optimizations
- **Static Generation**: Home page is statically generated
- **Dynamic Routes**: Download pages are server-rendered on demand
- **Image Optimization**: WebP and AVIF formats supported
- **Code Splitting**: Automatic code splitting for optimal loading

### Caching Strategy
- **Static Assets**: Cached by CDN
- **API Routes**: No-cache headers for fresh data
- **Pages**: Static pages cached, dynamic pages server-rendered

## 🔒 Security Considerations

### Headers
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **Content-Security-Policy**: Basic CSP configured
- **Permissions-Policy**: Restricted permissions

### API Security
- **Input Validation**: All inputs are validated
- **Rate Limiting**: Consider implementing rate limiting for production
- **CORS**: Properly configured for API access

## 📈 Monitoring

### Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor page views and performance metrics
- Set up alerts for errors

### Error Tracking
Consider integrating error tracking services:
- **Sentry**: For error monitoring
- **LogRocket**: For session replay
- **Vercel Logs**: Built-in log viewing

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build:deploy
        
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 🎯 Post-Deployment Checklist

### Immediate Checks
- [ ] Home page loads correctly
- [ ] Search functionality works
- [ ] Download pages render properly
- [ ] API routes respond correctly
- [ ] Images load without errors
- [ ] Mobile responsiveness is maintained

### Performance Checks
- [ ] Page load times are acceptable (< 3s)
- [ ] Lighthouse scores are good (> 90)
- [ ] No console errors
- [ ] All interactive elements work

### Security Checks
- [ ] Security headers are present
- [ ] No sensitive data exposed
- [ ] HTTPS is enforced
- [ ] API routes are properly secured

## 🚀 Rollback Plan

If deployment fails:
1. **Vercel Dashboard**: Rollback to previous deployment
2. **Git**: Revert to previous commit
3. **Emergency**: Use `vercel --prod` with previous working version

```bash
# Rollback to specific deployment
vercel rollback [deployment-url]

# Or rollback to previous commit
git revert HEAD
git push origin main
```

## 📞 Support

If you encounter issues during deployment:
1. Check Vercel logs for specific error messages
2. Review this troubleshooting guide
3. Check the project's GitHub issues
4. Contact the development team

## 🎉 Success Metrics

A successful deployment should have:
- ✅ All pages loading without errors
- ✅ Search functionality working correctly
- ✅ Download pages rendering properly
- ✅ Mobile responsiveness maintained
- ✅ Performance scores above 90
- ✅ No security vulnerabilities
- ✅ Proper error handling in place

---

**Happy Deploying! 🚀**