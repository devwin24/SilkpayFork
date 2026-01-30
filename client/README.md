# SilkPay Frontend

Next.js dashboard for the SilkPay Payout Platform.

---

## 🎯 Overview

Modern, responsive dashboard built with **Next.js 14+** using the App Router, Tailwind CSS, and Shadcn UI components.

---

## 📋 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_URL

# Start development server
npm run dev
```

**App runs on:** `http://localhost:3000`

---

## 🏗️ Architecture

- **Framework:** Next.js 14+ (React 18+)
- **Routing:** App Router (file-based)
- **Rendering:** Hybrid (SSR + CSR)
  - SSR for Dashboard, Analytics
  - CSR for Real-time updates, Interactive components
- **Styling:** Tailwind CSS + Shadcn UI
- **State:** React Context + Hooks
- **HTTP Client:** Axios
- **Forms:** React Hook Form (if used)
- **Charts:** Recharts

---

## 📁 Structure

```
client/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.js            # Dashboard (/)
│   │   ├── login/             # Login page
│   │   ├── payouts/           # Payout list & create
│   │   ├── transactions/      # Transaction history
│   │   ├── beneficiaries/     # Beneficiary management
│   │   ├── merchant/          # Merchant center
│   │   ├── settings/          # Settings
│   │   ├── bank-account/      # Bank account (placeholder)
│   │   └── layout.js          # Root layout
│   │
│   ├── components/
│   │   ├── ui/                # Shadcn UI components
│   │   ├── dashboard/         # Dashboard specific
│   │   ├── beneficiaries/     # Beneficiary forms
│   │   └── shared/            # Shared components
│   │
│   ├── services/
│   │   └── api.js             # Axios HTTP client
│   │
│   ├── utils/
│   │   └── helpers.js         # Formatters, utilities
│   │
│   └── lib/
│       └── utils.js           # cn() helper
│
├── public/                     # Static assets
├── .env.local                  # Environment (not committed)
└── package.json
```

---

## 🔌 Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Balance, metrics, recent activity |
| `/login` | Login | Merchant authentication |
| `/payouts` | Payouts List | All payouts with filters |
| `/payouts/new` | Create Payout | One-time/Recurring payout |
| `/transactions` | Transactions | Transaction ledger |
| `/beneficiaries` | Beneficiaries | Manage saved beneficiaries |
| `/merchant` | Merchant Center | Profile, API keys, security |
| `/settings` | Settings | Preferences, notifications |
| `/bank-account` | Bank Account | Wallet balance (placeholder) |

---

## ⚙️ Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# App Configuration
NEXT_PUBLIC_APP_NAME=SilkPay Payout Platform
```

**Production:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

---

## 🚀 Scripts

```bash
# Development
npm run dev          # Start dev server (localhost:3000)

# Production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

---

##📚 Resources

- [Main README](../README.md)
- [Backend README](../server/README.md)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)

---

**Frontend Dashboard - Beautiful, Fast, Responsive** ✨
