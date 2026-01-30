# API Reference

**SilkPay Payout Platform - Backend API Documentation**

**Base URL:** `http://localhost:3001/api` (development)  
**Production:** `https://api.yourdomain.com/api`

**Authentication:** JWT Bearer Token (except Login & Webhooks)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Merchant Management](#merchant-management)
3. [Beneficiaries](#beneficiaries)
4. [Payouts](#payouts)
5. [Transactions](#transactions)
6. [Dashboard](#dashboard)
7. [Balance](#balance)
8. [Webhooks](#webhooks)
9. [Error Codes](#error-codes)

---

## Authentication

All endpoints except `/auth/login` and `/webhook/*` require JWT authentication.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### POST `/auth/login`

Authenticate merchant and receive JWT token.

**Request:**
```json
{
  "email": "test@silkpay.local",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "merchant": {
      "_id": "65b1234567890abcdef12345",
      "merchant_no": "M2024001",
      "name": "Test Merchant",
      "email": "test@silkpay.local",
      "status": "ACTIVE"
    }
  }
}
```

**Errors:**
- `400` - Invalid credentials
- `401` - Email or password incorrect
- `403` - Account suspended

### POST `/auth/forgot-password`

Request password reset link.

**Request:**
```json
{
  "email": "test@silkpay.local"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset instructions sent to email"
}
```

**Note:** In development mode, the reset token is also returned in the response for testing.

### POST `/auth/reset-password`

Reset password using token from email.

**Request:**
```json
{
  "token": "reset_token_from_email",
  "password": "newPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Errors:**
- `400` - Invalid or expired token
- `422` - Password validation failed

---

## Merchant Management

### GET `/merchant/profile`

Get current merchant profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65b1234567890abcdef12345",
    "merchant_no": "M2024001",
    "name": "Test Merchant",
    "email": "test@silkpay.local",
    "mobile": "+91 9876543210",
    "status": "ACTIVE",
    "balance": {
      "available": 125000.00,
      "pending": 15000.00,
      "total": 140000.00
    },
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### PUT `/merchant/profile`

Update merchant profile (name, mobile only).

**Request:**
```json
{
  "name": "Updated Business Name",
  "mobile": "+91 9988776655"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "merchant_no": "M2024001",
    "name": "Updated Business Name",
    "mobile": "+91 9988776655"
  }
}
```

### GET `/merchant/api-keys`

Get masked API keys.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "merchant_no": "M2024001",
    "secret_key": "sk_live_••••••••••••1234"
  }
}
```

### POST `/merchant/api-keys/rotate`

Rotate secret key (generates new one).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "secret_key": "sk_live_newkey567890abcdef",
    "message": "Secret key rotated successfully. Update your integration."
  }
}
```

### PUT `/merchant/whitelist-ips`

Update IP whitelist.

**Request:**
```json
{
  "whitelist_ips": ["192.168.1.100", "203.0.113.5"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "whitelist_ips": ["192.168.1.100", "203.0.113.5"]
  }
}
```

### POST `/merchant/change-password`

Change password.

**Request:**
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Beneficiaries

### GET `/beneficiaries`

List beneficiaries with filters and pagination.

**Query Parameters:**
- `search` - Search by name, account number
- `status` - Filter by status (ACTIVE, INACTIVE)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Example:** `/beneficiaries?search=Rahul&status=ACTIVE&page=1&limit=20`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "beneficiaries": [
      {
        "_id": "65b9876543210fedcba09876",
        "name": "Rahul Sharma",
        "contact_info": {
          "mobile": "9876543210",
          "email": "rahul@example.com"
        },
        "bank_details": {
          "account_number": "XXXXXXXX1234",
          "ifsc_code": "HDFC0001234",
          "bank_name": "HDFC Bank",
          "upi_id": "rahul@paytm"
        },
        "status": "ACTIVE",
        "stats": {
          "total_payouts": 5,
          "total_amount": 12500.00,
          "last_payout_date": "2024-01-20T14:30:00.000Z"
        },
        "created_at": "2024-01-10T09:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

### GET `/beneficiaries/:id`

Get single beneficiary.

**Response (200):**
```json
{
  "success": true,
  "data": { /* Same structure as list item */ }
}
```

### POST `/beneficiaries`

Create new beneficiary.

**Request:**
```json
{
  "name": "Priya Gupta",
  "contact_info": {
    "mobile": "9988776655",
    "email": "priya@example.com"
  },
  "bank_details": {
    "account_number": "12345678901234",
    "ifsc_code": "SBIN0001234",
    "bank_name": "State Bank of India",
    "upi_id": "priya@oksbi"
  },
  "notes": "Vendor payment"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { /* Created beneficiary */ }
}
```

### PUT `/beneficiaries/:id`

Update beneficiary.

**Request:** Same as create (partial updates allowed)

**Response (200):**
```json
{
  "success": true,
  "data": { /* Updated beneficiary */ }
}
```

### DELETE `/beneficiaries/:id`

Soft delete (mark INACTIVE).

**Response (200):**
```json
{
  "success": true,
  "message": "Beneficiary marked as INACTIVE"
}
```

---

## Payouts

### GET `/payouts`

List payouts with filters.

**Query Parameters:**
- `status` - PENDING, PROCESSING, SUCCESS, FAILED
- `beneficiary_id` - Filter by beneficiary
- `search` - Search order numbers
- `page`, `limit` - Pagination

**Response (200):**
```json
{
  "success": true,
  "data": {
    "payouts": [
      {
        "_id": "65c1234567890abcdef56789",
        "out_trade_no": "OT20240129173000001",
        "silkpay_order_no": null,
        "amount": 5000.00,
        "currency": "INR",
        "status": "PENDING",
        "beneficiary_details": {
          "name": "Rahul Sharma",
          "account_number": "XXXXXXXX1234",
          "ifsc_code": "HDFC0001234"
        },
        "created_at": "2024-01-29T17:30:00.000Z"
      }
    ],
    "pagination": { /* Same as beneficiaries */ }
  }
}
```

### POST `/payouts`

Create payout.

**Request:**
```json
{
  "beneficiary_id": "65b9876543210fedcba09876",
  "amount": 5000.00,
  "purpose": "Vendor payment Jan 2024",
  "notes": "Invoice #12345"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "65c1234567890abcdef56789",
    "out_trade_no": "OT20240129173000001",
    "amount": 5000.00,
    "status": "PENDING",
    "message": "Payout created. SilkPay API called successfully."
  }
}
```

### GET `/payouts/:id/status`

Query payout status from SilkPay.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "SUCCESS",
    "utr": "112233445566",
    "updated_at": "2024-01-29T17:35:00.000Z"
  }
}
```

---

## Transactions

### GET `/transactions`

Get transaction ledger.

**Query Parameters:**
- `type` - PAYOUT, REFUND, FEE, ADJUSTMENT
- `start_date`, `end_date` - Date range (ISO format)
- `search` - Search description/reference
- `page`, `limit`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "_id": "65d1234567890abcdef11111",
        "type": "PAYOUT",
        "amount": -5000.00,
        "balance_before": 125000.00,
        "balance_after": 120000.00,
        "description": "Payout to Rahul Sharma",
        "reference_no": "OT20240129173000001",
        "created_at": "2024-01-29T17:30:00.000Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

### GET `/transactions/export`

Download CSV export (max 10k records).

**Query Parameters:** Same as list

**Response:** CSV file download

### GET `/transactions/stats`

Get transaction statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_transactions": 142,
    "by_type": {
      "PAYOUT": { "count": 120, "total_amount": 450000.00 },
      "REFUND": { "count": 15, "total_amount": 12500.00 },
      "FEE": { "count": 7, "total_amount": 350.00 }
    }
  }
}
```

---

## Dashboard

### GET `/dashboard/overview`

Get dashboard statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "balance": {
      "available": 125000.00,
      "pending": 15000.00,
      "total": 140000.00
    },
    "total_payouts": 142,
    "total_beneficiaries": 45,
    "pending_payouts": 8,
    "payout_breakdown": {
      "SUCCESS": { "count": 120, "total_amount": 450000.00 },
      "FAILED": { "count": 5, "total_amount": 12500.00 },
      "PENDING": { "count": 8, "total_amount": 15000.00 }
    }
  }
}
```

### GET `/dashboard/trends`

Payout trends (last 30 days).

**Query:** `?days=30`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-29",
      "count": 12,
      "amount": 45000.00,
      "successful": 11,
      "failed": 1
    }
  ]
}
```

---

## Balance

### GET `/balance`

Get current balance.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "merchant_no": "M2024001",
    "balance": {
      "available": 125000.00,
      "pending": 15000.00,
      "total": 140000.00
    },
    "last_synced": "2024-01-29T17:00:00.000Z"
  }
}
```

### POST `/balance/sync`

Sync with SilkPay API.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "balance": { /* updated balance */ },
    "synced_at": "2024-01-29T17:45:00.000Z"
  }
}
```

---

## Webhooks

## Webhooks

### POST `/webhook/silkpay`

**Public endpoint** - SilkPay callback handler.

**Request (from SilkPay):**
```json
{
  "amount": "100.00",
  "payOrderId": "DF-0207...",
  "mId": "TEST",
  "mOrderId": "12345679",
  "utr": "112233",
  "sign": "80f7eb17fec33a6b7963fc113484642a",
  "status": "1",
  "timestamp": 1687244719629
}
```

**Signature Logic:** `md5(mId+mOrderId+amount+timestamp+secret)`

**Response:**
```
OK
```

---

## Error Codes

### Standard HTTP Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server error |

### SilkPay Specific Status Codes

| Status | Description |
|--------|-------------|
| 200 | Request successful |
| 401 | Wrong password |
| 402 | Merchant no invalid |
| 403 | Merchant order no invalid / Wrong sign |
| 404 | Merchant order no max 64 / Merchant does not exist |
| 405 | Name is empty |
| 406 | Mobile is empty |
| 407 | Invalid IFSC code |
| 408 | Invalid bank account number |
| 409 | Account hold name is empty |
| 410 | Notify url is empty |
| 411 | Sign is empty |
| 412 | Param payAmount invalid |
| 413 | Order no invalid |
| 414 | Return url is empty |
| 415 | Order expired |
| 416 | Order/UTR submitted or Parameter missing |
| 506 | Channel is not available |
| 513 | Insufficient merchant balance |
| 515 | Merchant order exist |

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Account number is required",
    "details": []
  }
}
```

---

**Last Updated:** 2026-01-29  
**Version:** 1.0
