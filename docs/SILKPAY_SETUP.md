# SilkPay API Integration Guide

**Official Documentation Reference**: Based on SilkPay API v1.0

---

## Environment Setup

### Sandbox (Testing)

```env
SILKPAY_API_URL=https://api.dev.silkpay.ai
SILKPAY_MERCHANT_ID=TEST  # Your sandbox merchant ID
SILKPAY_SECRET_KEY=your-sandbox-secret
```

### Production

```env
SILKPAY_API_URL=https://api.silkpay.ai
SILKPAY_MERCHANT_ID=M202400XX  # Your production merchant ID
SILKPAY_SECRET_KEY=your-production-secret
```

**Backup Domains:**
- API: `https://api.silkpay.help/`
- Merchant Portal: `https://merchant.silkpay.help/`

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|---------|---------|
| `/transaction/payout` | POST | Create payout order |
| `/transaction/payout/query` | POST | Query payout status |
| `/transaction/balance` | POST | Get merchant balance |
| `<your_notify_url>` | POST | Webhook callback (from SilkPay) |

---

## 1. Create Payout Order

**Endpoint:** `POST /transaction/payout`

### Request

```json
{
  "amount": "100.00",
  "mId": "TEST",
  "mOrderId": "o001",
  "timestamp": 1738917430509,
  "notifyUrl": "http://your-domain.com/api/webhook/silkpay",
  "upi": "",
  "bankNo": "2983900989",
  "ifsc": "ICIC0000001",
  "name": "MAND",
  "sign": "d7ab0026e9c3059edabfb9b0a0a51df2"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | string | ✅ | Order amount (e.g., "100.00") |
| `mId` | string | ✅ | Merchant ID from SilkPay |
| `mOrderId` | string | ✅ | Your unique order ID (max 64 chars) |
| `timestamp` | number | ✅ | Millisecond timestamp |
| `notifyUrl` | string | ✅ | Your callback URL |
| `upi` | string | ❌ | UPI ID (optional) |
| `bankNo` | string | ❌ | Beneficiary account number |
| `ifsc` | string | ❌ | IFSC code |
| `name` | string | ✅ | Beneficiary name |
| `sign` | string | ✅ | MD5 signature |

### Signature Generation

```javascript
// Format: md5(mId+mOrderId+amount+timestamp+secret)
const signString = `${mId}${mOrderId}${amount}${timestamp}${secretKey}`;
const sign = md5(signString).toLowerCase(); // Must be lowercase, 32 chars
```

### Response (200)

```json
{
  "status": "200",
  "message": "success",
  "data": {
    "payOrderId": "DF-0207163775560828775345156"
  }
}
```

---

## 2. Query Payout Status

**Endpoint:** `POST /transaction/payout/query`

### Request

```json
{
  "mId": "TEST",
  "mOrderId": "o001",
  "timestamp": 1738917430509,
  "sign": "c4725c96cb90acbf49bdfbf72ce41ed2"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mId` | string | ✅ | Merchant ID |
| `mOrderId` | string | ✅ | Your order ID |
| `timestamp` | number | ✅ | Millisecond timestamp |
| `sign` | string | ✅ | MD5 signature |

### Signature Generation

```javascript
// Format: md5(mId+mOrderId+timestamp+secret)
const signString = `${mId}${mOrderId}${timestamp}${secretKey}`;
const sign = md5(signString).toLowerCase();
```

### Response (200)

```json
{
  "status": "200",
  "message": "success",
  "data": {
    "amount": "100.00",
    "payOrderId": "DF-0207163775560828775345156",
    "utr": "112233445566",
    "sign": "cd0b7a5cca06f7b9456692add9cae6ed",
    "mId": "TEST",
    "mOrderId": "o001",
    "status": 2,
    "timestamp": 1738917709881
  }
}
```

### Status Codes

| Code | Status | Description |
|------|---------|------------|
| 0 | INITIAL | Order created, not processed |
| 1 | PROCESSING | Payment in progress |
| 2 | SUCCESS | Payment successful |
| 3 | FAILED | Payment failed |

---

## 3. Get Merchant Balance

**Endpoint:** `POST /transaction/balance`

### Request

```json
{
  "mId": "TEST",
  "timestamp": 1738917430509,
  "sign": "6fce1b7405dd7d11c0e45d3931c7ecb1"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mId` | string | ✅ | Merchant ID |
| `timestamp` | number | ✅ | Millisecond timestamp |
| `sign` | string | ✅ | MD5 signature |

### Signature Generation

```javascript
// Format: md5(mId+timestamp+secret)
const signString = `${mId}${timestamp}${secretKey}`;
const sign = md5(signString).toLowerCase();
```

### Response (200)

```json
{
  "status": "200",
  "message": "success",
  "data": {
    "availableAmount": 259.5,
    "pendingAmount": 0,
    "totalAmount": 259.5,
    "sign": null
  }
}
```

---

## 4. Webhook Callback

**Your Endpoint:** Set in `notifyUrl` during payout creation

### Incoming Request from SilkPay

```json
{
  "amount": "102.33",
  "payOrderId": "DF-0207173510390431811270665",
  "mId": "TEST",
  "mOrderId": "12345679",
  "utr": "112233",
  "sign": "80f7eb17fec33a6b7963fc113484642a",
  "status": 2,
  "timestamp": 1687244719629
}
```

### Signature Verification

```javascript
// Format: md5(mId+mOrderId+amount+timestamp+secret)
const signString = `${mId}${mOrderId}${amount}${timestamp}${secretKey}`;
const expectedSign = md5(signString).toLowerCase();

if (sign !== expectedSign) {
  return res.status(400).send('Invalid signature');
}
```

### Response Required

**You MUST return:**
```
OK
```

⚠️ **Important:** 
- If "OK" is not returned, SilkPay will retry every 5 minutes, up to 5 times
- Status codes: `2` = Success, `3` = Failed

---

## Data Format Requirements

### Mobile Number
- **Format**: 10 digits only
- ✅ Correct: `9876543210`
- ❌ Wrong: `+91 9876543210` or `+919876543210`

### IFSC Code
- **Length**: 11 characters
- **Format**: Bank code (4) + `0` + Branch code (6)
- ✅ Correct: `SBIN0001234`
- ❌ Wrong: `sbin0001234` (must be uppercase)

### Amount
- **Type**: String with 2 decimal places
- ✅ Correct: `"100.00"`, `"1234.56"`
- ❌ Wrong: `100`, `"100"`

### Timestamp
- **Type**: Number (milliseconds since epoch)
- **Generate**: `Date.now()`
- **Example**: `1738917430509`

### Order ID (mOrderId)
- **Max Length**: 64 characters
- **Must be**: Unique per transaction
- **Example**: `"ORD-1738917430509-ABC123"`

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | Success | Request successful |
| 402 | Error | Invalid merchant ID |
| 403 | Error | Wrong signature |
| 407 | Error | Invalid IFSC code |
| 408 | Error | Invalid account number |
| 412 | Error | Invalid amount |
| 503 | Error | Merchant inactive |
| 513 | Error | Insufficient balance |
| 515 | Error | Duplicate order ID |

---

## Integration Checklist

### Before Testing
- [ ] Get sandbox credentials from SilkPay
- [ ] Configure `.env` with correct `SILKPAY_MERCHANT_ID` and `SILKPAY_SECRET_KEY`
- [ ] Set `SILKPAY_API_URL=https://api.dev.silkpay.ai`
- [ ] Configure webhook URL (use ngrok for local testing)

### Implementation
- [ ] Install crypto library (built-in Node.js)
- [ ] Implement signature generation (see examples above)
- [ ] Handle all 4 status codes (0, 1, 2, 3)
- [ ] Store `payOrderId` from response
- [ ] Implement webhook endpoint
- [ ] Verify webhook signatures
- [ ] Return "OK" from webhook

### Production Checklist
- [ ] Change API URL to `https://api.silkpay.ai`
- [ ] Use production merchant ID and secret
- [ ] Add server IP to SilkPay whitelist
- [ ] Use HTTPS for webhook URL
- [ ] Change merchant console password on first login
- [ ] Test with small amounts first

---

## Testing with Sandbox

```bash
# 1. Set environment
export SILKPAY_API_URL=https://api.dev.silkpay.ai
export SILKPAY_MERCHANT_ID=TEST
export SILKPAY_SECRET_KEY=your-sandbox-secret

# 2. Run automated tests
cd server
npm run test:api

# 3. Test webhook with ngrok
ngrok http 3001
# Update notifyUrl in code to ngrok URL
```

---

## Common Issues

### "param merchantNo invalid"
- ❌ Using `merchantNo` or `merchant_no`
- ✅ Use `mId`

### "sign error"
- Check signature generation order
- Ensure MD5 is **lowercase**
- Verify secret key is correct
- Check parameter order matches documentation

### Webhook not received
- Verify URL is publicly accessible (use ngrok for local dev)
- Check webhook returns "OK"
- Review SilkPay logs in merchant console

---

**Last Updated:** 2026-01-29  
**API Version:** 1.0  
**Documentation Source:** Official SilkPay Integration Guide
