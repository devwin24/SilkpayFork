# Production Deployment Checklist

**⚠️ CRITICAL: Complete ALL items before deploying to production**

This document lists all development shortcuts, test configurations, and security items that MUST be changed before production deployment.

---

## 🔐 Security & Authentication

### 1. Email Validation (CRITICAL)
**File:** `src/modules/auth/auth.validator.js` (Line 8)

**Current (Development):**
```javascript
email: Joi.string().email({ tlds: { allow: false } }).required()
```

**Change to (Production):**
```javascript
email: Joi.string().email().required()
```

**Reason:** We disabled TLD validation to allow `.local` domains for testing. Production should validate real email domains only.

---

### 2. JWT Secret Key (CRITICAL)
**File:** `.env`

**Current (Development):**
```env
JWT_SECRET=test-secret-key-change-in-production
```

**Change to (Production):**
```env
JWT_SECRET=<GENERATE_STRONG_RANDOM_SECRET_64_CHARS>
```

**Generate:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Reason:** The current secret is a placeholder. Production needs a cryptographically secure random secret.

---

### 3. Encryption Key (CRITICAL)
**File:** `.env`

**Current (Development):**
```env
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

**Change to (Production):**
```env
ENCRYPTION_KEY=<GENERATE_NEW_64_HEX_CHARS>
```

**Generate:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Reason:** This key encrypts sensitive data (account numbers, secret keys). NEVER reuse dev keys in production.

---

### 4. JWT Expiry Time
**File:** `.env`

**Current (Development):**
```env
JWT_EXPIRY=30m
```

**Consider (Production):**
```env
JWT_EXPIRY=15m  # Or implement refresh tokens
```

**Reason:** Shorter token lifetimes reduce security risk. Consider implementing refresh token mechanism.

---

## 🗄️ Database

### 5. MongoDB Connection String (CRITICAL)
**File:** `.env`

**Current (Development):**
```env
MONGODB_URI=mongodb://localhost:27017/silkpay
```

**Change to (Production):**
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/silkpay?retryWrites=true&w=majority
```

**Requirements:**
- ✅ Use MongoDB Atlas production cluster
- ✅ Enable authentication
- ✅ Use strong passwords
- ✅ Configure IP whitelist
- ✅ Enable encryption at rest
- ✅ Set up automated backups

---

### 6. Remove Seed Script (CRITICAL)
**File:** `scripts/seed.js`

**Action:**
- ❌ **NEVER** run seed script in production
- ❌ Do NOT deploy seed.js to production servers
- ✅ Create production merchants via secure admin panel only

**Reason:** Seed script deletes all merchants and creates test data. Running this in production would be catastrophic.

---

## 🌐 CORS & Security

### 7. CORS Origins (CRITICAL)
**File:** `.env`

**Current (Development):**
```env
CORS_ORIGINS=http://localhost:3000
```

**Change to (Production):**
```env
CORS_ORIGINS=https://your-production-domain.com,https://app.your-domain.com
```

**Reason:** Restrict CORS to only your production frontend domains. Never use `*` in production.

---

### 8. Rate Limiting
**File:** `src/app.js` (Lines 28-36)

**Current (Development):**
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,  // 100 requests per 15 minutes
  ...
});
```

**Consider (Production):**
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,  // Stricter: 50 requests per 15 minutes
  ...
});
```

**Also consider:**
- Different limits per endpoint (stricter for login/auth)
- MongoDB-based store for multi-instance deployments

---

## 📧 Email Configuration

### 9. SMTP Settings (REQUIRED)
**File:** `.env`

**Current (Development):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@silkpay.local
```

**Change to (Production):**
```env
SMTP_HOST=<production_smtp_host>
SMTP_PORT=587
SMTP_USER=<production_email>
SMTP_PASS=<production_app_password>
EMAIL_FROM=noreply@yourdomain.com
```

**Reason:** Configure production email service (SendGrid, AWS SES, etc.) for reliable email delivery.

---

## 🎨 Frontend Configuration

### 10. Next.js Environment Variables (CRITICAL)
**File:** `client/.env.local`

**Current (Development):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=SilkPay Payout Platform
```

**Change to (Production):**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_APP_NAME=SilkPay Payout Platform
```

**Requirements:**
- ✅ Use HTTPS production API URL
- ✅ Ensure CORS is configured on backend for this domain
- ✅ Test API connectivity before deployment

---

### 11. Next.js Build Configuration
**File:** `client/next.config.js`

**Verify:**
- ✅ `output: 'standalone'` for Docker/production deployment
- ✅ Image optimization configured
- ✅ Security headers enabled
- ✅ No development-only features enabled

**Production Build Command:**
```bash
npm run build
```

---

### 12. CSV Export Configuration
**Current Implementation:**
- Backend generates CSV via `/api/transactions/export`
- Uses `json2csv` library
- Max 10,000 records per export

**Production Considerations:**
- ✅ Test large exports (10k records)
- ✅ Implement rate limiting on export endpoint
- ✅ Add export job queue for very large datasets (future)
- ✅ Monitor server memory during exports

---

## 🔌 SilkPay API Integration

### 10. SilkPay API Credentials (CRITICAL)
**File:** `.env`

**Current (Development):**
```env
SILKPAY_API_URL=https://api.dev.silkpay.ai
SILKPAY_MERCHANT_ID=your-merchant-id
SILKPAY_SECRET_KEY=your-secret-key
```

**Change to (Production):**
```env
SILKPAY_API_URL=https://api.silkpay.ai  # Remove 'dev'
SILKPAY_MERCHANT_ID=<PRODUCTION_MERCHANT_ID>
SILKPAY_SECRET_KEY=<PRODUCTION_SECRET_KEY>
```

**Requirements:**
- ✅ Use production SilkPay API endpoint
- ✅ Use production merchant credentials
- ✅ Test on SilkPay sandbox first
- ✅ Request production approval from SilkPay

---

## 📝 Logging

### 11. Log Level
**File:** `.env`

**Current (Development):**
```env
LOG_LEVEL=debug
```

**Change to (Production):**
```env
LOG_LEVEL=info  # or 'warn' for high-traffic
```

**Reason:** Debug logs are verbose and can impact performance. Use `info` or `warn` in production.

---

### 12. Log Storage
**File:** `src/shared/utils/logger.js`

**Current (Development):**
- Console output
- Files: `logs/error.log`, `logs/combined.log`

**Configure (Production):**
- ✅ Implement log rotation (use `winston-daily-rotate-file`)
- ✅ Send logs to external service (CloudWatch, Datadog, etc.)
- ✅ Set up alerts for error logs
- ✅ Configure log retention policy

---

## 🚀 Deployment

### 13. Environment Variables
**File:** `.env`

**Current:**
```env
NODE_ENV=development
```

**Change to:**
```env
NODE_ENV=production
```

**Reason:** This enables production optimizations and changes behavior (e.g., file logging, error messages).

---

### 14. Test Merchant Credentials
**Email:** `test@silkpay.local`
**Password:** `password123`

**Action (Production):**
- ❌ Delete test merchant before production
- ✅ Create real merchants via secure process
- ✅ Enforce strong password policy
- ✅ Enable 2FA (future feature)

---

### 15. PM2 Configuration
**File:** `ecosystem.config.js` (to be created)

**Production PM2 Config:**
```javascript
module.exports = {
  apps: [{
    name: 'silkpay-api',
    script: './server.js',
    instances: 'max',  // Use all CPU cores
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

---

## 🧪 Testing Checklist

### Before Production Deployment:

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Load testing completed (target: 1000 req/min)
- [ ] Security audit completed
- [ ] Penetration testing completed
- [ ] SilkPay sandbox integration verified
- [ ] All webhooks tested
- [ ] Error handling tested (network failures, API errors)
- [ ] Database indexes verified
- [ ] Backup/restore procedures tested

---

## 🔒 Security Hardening

### Additional Production Requirements:

1. **SSL/TLS:**
   - ✅ Enable HTTPS only
   - ✅ Use valid SSL certificate
   - ✅ Redirect HTTP to HTTPS

2. **Headers:**
   - ✅ Content Security Policy
   - ✅ X-Frame-Options
   - ✅ X-Content-Type-Options
   - (Already configured via Helmet middleware)

3. **IP Whitelisting:**
   - ✅ Configure firewall rules
   - ✅ Whitelist SilkPay webhook IPs
   - ✅ Restrict admin access

4. **Secrets Management:**
   - ✅ Never commit `.env` to Git
   - ✅ Use secret management service (AWS Secrets Manager, HashiCorp Vault)
   - ✅ Rotate secrets regularly

5. **Monitoring:**
   - ✅ Set up uptime monitoring
   - ✅ Configure error alerts
   - ✅ Dashboard for key metrics
   - ✅ Database performance monitoring

---

## 📋 Final Pre-Launch Checklist

- [ ] All items in this document completed
- [ ] `.env.production` file created with production values
- [ ] Test data removed from database
- [ ] Production MongoDB cluster configured
- [ ] SilkPay production credentials verified
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] CDN configured (if applicable)
- [ ] Backup strategy implemented
- [ ] Rollback plan documented
- [ ] Support team trained
- [ ] Incident response plan ready

---

## 🆘 Emergency Contacts

**Add before production:**
- MongoDB Support: _______
- SilkPay Support: _______
- DevOps On-Call: _______
- Security Team: _______

---

**Last Updated:** 2026-01-29  
**Review Date:** Before each production deployment  
**Owner:** DevOps Team
