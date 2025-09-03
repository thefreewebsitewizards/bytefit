# Vercel Deployment Guide for ByteFit

This guide will help you deploy the ByteFit application to Vercel while ensuring all Firebase backend functions continue to work properly.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Firebase Project**: Ensure your Firebase project `bytefit-v2` is properly configured
3. **Stripe Account**: Ensure Stripe keys are configured in Firebase Functions

## Deployment Steps

### 1. Environment Variables Setup

In your Vercel dashboard, add the following environment variables:

```bash
# Firebase Functions URL (Production)
REACT_APP_FIREBASE_FUNCTIONS_URL=https://us-central1-bytefit-v2.cloudfunctions.net

# Optional: API Base URL (same as above)
REACT_APP_API_BASE_URL=https://us-central1-bytefit-v2.cloudfunctions.net
```

### 2. Firebase Functions Deployment

Before deploying to Vercel, ensure your Firebase Functions are deployed:

```bash
# Deploy Firebase Functions
firebase deploy --only functions

# Verify functions are working
curl https://us-central1-bytefit-v2.cloudfunctions.net/testConnection
```

### 3. Vercel Configuration

The `vercel.json` file is already configured with:
- Static build configuration
- Proper routing for SPA
- Security headers
- Cache optimization

### 4. Deploy to Vercel

#### Option A: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically deploy on every push

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Backend Architecture

### Firebase Functions (Backend)
The following Firebase Functions will continue to work on Vercel:

- `testConnection` - Health check
- `getProducts` - Product catalog
- `getUserProfile` - User management
- `updateUserProfile` - Profile updates
- `createCheckoutSessionV2` - Stripe checkout
- `createOrderFromPaymentId` - Order processing
- `getCheckoutSessionV2` - Payment verification
- `getUserOrdersV2` - User order history
- `getAllOrdersV2` - Admin order management
- `getShippingRates` - Shipping calculations

### Frontend (Vercel)
The React application will be served from Vercel's CDN with:
- Static asset optimization
- Global CDN distribution
- Automatic HTTPS
- Custom domain support

## Post-Deployment Verification

### 1. Test Core Functionality
- [ ] User registration/login
- [ ] Product browsing
- [ ] Shopping cart
- [ ] Checkout process
- [ ] Order management
- [ ] Admin dashboard

### 2. Test API Endpoints
```bash
# Test Firebase Functions
curl https://us-central1-bytefit-v2.cloudfunctions.net/testConnection
curl https://us-central1-bytefit-v2.cloudfunctions.net/getProducts
```

### 3. Monitor Performance
- Check Vercel Analytics
- Monitor Firebase Functions logs
- Verify Stripe webhook delivery

## Security Considerations

### Firebase Security Rules
- Firestore rules are properly configured
- Admin access is restricted
- User data is protected

### Environment Variables
- All sensitive keys are stored in Firebase Functions config
- Frontend only contains public configuration
- No secrets exposed in client-side code

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Firebase Functions already include CORS headers
   - Ensure `REACT_APP_FIREBASE_FUNCTIONS_URL` is correct

2. **Build Failures**
   - Run `npm run build` locally first
   - Check for TypeScript errors
   - Verify all dependencies are in `package.json`

3. **Function Timeouts**
   - Firebase Functions have 60s timeout by default
   - Monitor function execution time
   - Optimize slow queries

4. **Authentication Issues**
   - Verify Firebase Auth domain in console
   - Check authorized domains include your Vercel domain

### Logs and Monitoring

```bash
# View Firebase Functions logs
firebase functions:log

# View Vercel deployment logs
vercel logs [deployment-url]
```

## Performance Optimization

### Already Implemented
- Static asset caching (1 year)
- Gzip compression
- Code splitting
- Image optimization
- Security headers

### Recommendations
- Enable Vercel Analytics
- Monitor Core Web Vitals
- Set up error tracking (Sentry)
- Configure custom domain

## Maintenance

### Regular Tasks
- Monitor Firebase usage
- Update dependencies
- Review security rules
- Backup Firestore data
- Monitor Stripe webhooks

### Scaling Considerations
- Firebase Functions auto-scale
- Vercel handles traffic spikes
- Consider Firebase Firestore limits
- Monitor Stripe rate limits

## Support

For issues:
1. Check Vercel deployment logs
2. Review Firebase Functions logs
3. Verify environment variables
4. Test API endpoints directly

The application architecture separates concerns properly:
- **Vercel**: Serves the React frontend
- **Firebase Functions**: Handles all backend logic
- **Firestore**: Database operations
- **Firebase Auth**: User authentication
- **Stripe**: Payment processing

This ensures reliable operation regardless of the frontend hosting platform.