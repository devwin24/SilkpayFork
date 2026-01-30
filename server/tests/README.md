# Backend API Testing Guide

## Quick Start

### Prerequisites
1. Backend server must be running:
```bash
cd server
npm run dev
```

2. MongoDB must be running and seeded with test data

### Run Tests

```bash
# From server directory
npm run test:api

# Or with custom API URL
API_BASE_URL=http://localhost:3001/api node tests/api-test.js
```

## Test Coverage

The automated test suite (`tests/api-test.js`) covers:

### ✅ Auth Module
- [x] Login
- [x] Forgot Password
- [x] Reset Password

### ✅ Merchant Module
- [x] Get Profile
- [x] Update Profile
- [x] Change Password

### ✅ Beneficiary Module
- [x] Create Beneficiary
- [x] List Beneficiaries
- [x] Update Beneficiary
- [x] Delete (Soft) Beneficiary

### ✅ Payout Module
- [x] Create Payout
- [x] List Payouts
- [x] Query Payout Status

### ✅ Balance Module
- [x] Sync Balance

### ✅ Dashboard Module
- [x] Get Overview

### ✅ Transaction Module
- [x] List Transactions

## Test Output

The script provides color-coded output:
- ✅ **Green** - Test passed
- ❌ **Red** - Test failed
- ℹ️  **Cyan** - Informational message

### Example Output

```
══════════════════════════════════════════════════════════
  🚀 SilkPay Backend API Test Suite
══════════════════════════════════════════════════════════

ℹ️  Testing API at: http://localhost:3001/api
ℹ️  Start time: 2026-01-29T15:30:00.000Z

══════════════════════════════════════════════════════════
  🔐 Testing Auth Module - Login
══════════════════════════════════════════════════════════
✅ Login successful
ℹ️  Token: eyJhbGciOiJIUzI1NiIs...
ℹ️  Merchant ID: 507f1f77bcf86cd799439011

...

══════════════════════════════════════════════════════════
  📊 Test Results Summary
══════════════════════════════════════════════════════════

Total Tests: 16
✅ Passed: 16
Success Rate: 100.0%

✨ All tests passed! Backend is ready for frontend integration.
```

## Test Data

### Default Test Credentials
```json
{
  "email": "test@silkpay.local",
  "password": "password123"
}
```

### Test Beneficiary
The script creates test beneficiaries automatically and cleans up after testing.

### Test Payout
- Amount: ₹10
- Purpose: "Test payout"
- Status: PENDING (initially)

## Troubleshooting

### "Login failed: Invalid credentials"
- Ensure MongoDB is seeded with test merchant
- Verify credentials in test script match database

### "Connection refused"
- Check if backend server is running on port 3001
- Verify API_BASE_URL environment variable

### "Authorization token missing"
- Login test must pass first (it's marked as critical)
- Token is automatically stored and reused for subsequent tests

## Advanced Testing

### Test Individual Endpoints
You can modify the test script to run specific tests:

```javascript
// Comment out tests you don't want to run
const tests = [
    { name: 'Auth - Login', fn: testAuthLogin, critical: true },
    // { name: 'Auth - Forgot Password', fn: testAuthForgotPassword },
    ...
];
```

### Custom Test Data
Modify the test functions to use your own data:

```javascript
async function testBeneficiaryCreate() {
    const result = await makeRequest('POST', '/beneficiaries', {
        name: 'Your Beneficiary Name',
        // ... your custom data
    }, true);
}
```

## Manual Testing

For detailed manual testing with curl/Postman, refer to:
- [`backend_testing_checklist.md`](../docs/backend_testing_checklist.md)

## Next Steps

Once all tests pass:
1. ✅ Review test results
2. ✅ Fix any failing tests
3. ✅ Document any issues found
4. ✅ Proceed with frontend integration

---

**Last Updated:** 2026-01-29  
**Test Count:** 16 automated tests  
**Coverage:** All core API endpoints
