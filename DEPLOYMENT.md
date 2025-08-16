# Deployment Guide

This guide covers deploying the Moroz Art Gallery application to production.

## Prerequisites

- GitHub repository
- Vercel account (for frontend)
- Firebase CLI installed globally
- Stripe account with live keys
- Firebase project configured for production

## Frontend Deployment (Vercel)

### 1. Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the root directory

### 2. Configure Build Settings
- **Framework Preset**: Create React App
- **Root Directory**: `./` (root)
- **Build Command**: `npm run build`
- **Output Directory**: `build`

### 3. Environment Variables
Add these in Vercel dashboard:
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key_here
REACT_APP_FIREBASE_FUNCTIONS_URL=https://us-central1-your-project-id.cloudfunctions.net
```

### 4. Deploy
- Deploy automatically on push to main branch
- Custom domain can be configured in Vercel settings

## Firebase Functions Deployment

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Configure Environment Variables
Set Firebase Functions environment variables:
```bash
firebase functions:config:set stripe.secret_key="sk_live_your_live_key_here"
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret_here"
firebase functions:config:set app.fee_percent="10"
```

### 4. Deploy Functions
```bash
firebase deploy --only functions
```

### 5. Get Function URLs
After deployment, Firebase will provide URLs like:
- `https://us-central1-your-project-id.cloudfunctions.net/createCheckoutSessionV2`
- `https://us-central1-your-project-id.cloudfunctions.net/stripeWebhookV2`

## Post-Deployment Setup

### 1. Stripe Webhooks
1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://us-central1-your-project-id.cloudfunctions.net/stripeWebhookV2`
3. Select events to listen for
4. Copy webhook secret to environment variables

### 2. Firebase Security Rules
Update Firestore and Storage rules for production:

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Add your production security rules
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Add your production security rules
  }
}
```

### 3. Domain Configuration
- Configure custom domain in Vercel
- Update CORS settings in Firebase Functions for new domain
- Update Firebase authorized domains

### 4. SSL/HTTPS
- Vercel provides SSL automatically
- Railway/Heroku provide SSL automatically
- Ensure all API calls use HTTPS

## Monitoring and Maintenance

### 1. Error Tracking
- Monitor Vercel deployment logs
- Monitor Railway/Heroku application logs
- Set up error tracking (Sentry, LogRocket, etc.)

### 2. Performance Monitoring
- Use Vercel Analytics
- Monitor API response times
- Set up uptime monitoring

### 3. Backup Strategy
- Firebase automatic backups
- Regular database exports
- Code repository backups

## Troubleshooting

### Common Issues
1. **CORS Errors**: Check CORS configuration in Firebase Functions
2. **Stripe Webhooks**: Verify webhook URL and secret
3. **Firebase Permissions**: Check security rules
4. **Environment Variables**: Ensure all required vars are set

### Logs
- **Vercel**: Check deployment and function logs
- **Firebase Functions**: Use `firebase functions:log`

## Security Checklist

- [ ] All environment variables are set correctly
- [ ] No sensitive data in repository
- [ ] Firebase security rules are production-ready
- [ ] Stripe webhooks are configured
- [ ] HTTPS is enforced everywhere
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Error messages don't expose sensitive information