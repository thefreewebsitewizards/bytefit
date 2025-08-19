# Security Guidelines

## Secrets Management

This document outlines how to properly handle sensitive information in the ByteFit project.

### What NOT to Commit

Never commit the following types of files or information:

- Firebase service account keys (`*-service-account-key.json`)
- API keys (Stripe, email service, etc.)
- Database passwords
- Private keys
- Environment files with actual values (`.env`, not `.env.example`)

### Proper Secret Management

#### For Local Development

1. **Firebase Authentication**: Use Firebase CLI
   ```bash
   firebase login
   ```

2. **Environment Variables**: Create `.env` files from examples
   ```bash
   cp .env.example .env
   cp functions/.env.example functions/.env
   ```
   Then fill in your local development values.

#### For Production

1. **Firebase Functions**: Use Firebase config
   ```bash
   firebase functions:config:set stripe.secret_key="sk_live_..."
   firebase functions:config:set stripe.webhook_secret="whsec_..."
   firebase functions:config:set email.user="your_email@domain.com"
   firebase functions:config:set email.pass="your_app_password"
   ```

2. **Frontend**: Set environment variables in your hosting platform (Vercel, Netlify, etc.)

### Files Already Secured

The following files are already in `.gitignore` to prevent accidental commits:

- `.env` and `.env.*` (except `.env.example`)
- `firebase-service-account-key.json`
- `*-service-account-key.json`
- `service-account-key.json`

### If You Accidentally Commit Secrets

1. **Immediately rotate/regenerate** the exposed secrets
2. Remove the secrets from git history:
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch path/to/secret/file' --prune-empty --tag-name-filter cat -- --all
   ```
3. Force push to update remote repository:
   ```bash
   git push origin --force --all
   ```
4. Update `.gitignore` to prevent future commits

### GitHub Secret Scanning

GitHub automatically scans for known secret patterns. If secrets are detected:

1. You'll receive an alert
2. The repository may be flagged
3. Follow the steps above to remediate

### Best Practices

- Always use `.env.example` files to document required environment variables
- Use descriptive placeholder values in example files
- Regularly audit your `.gitignore` file
- Use environment-specific configuration management
- Never log sensitive information in console outputs
- Use secure secret management services for production deployments