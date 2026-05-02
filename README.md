# 💸 MoneyFlow

> Know exactly where your money goes.

MoneyFlow is a modern monthly expense tracking application designed to help users monitor spending, manage subscriptions, track income, and gain actionable financial insights through clean visual analytics and rule-based summaries.

---

## ✨ Features

### 💼 Salaried Mode
- Fixed monthly income tracking
- Primary + secondary income sources
- Expense vs salary insights
- Savings percentage tracking

### 💰 Freelancer Mode
- Variable monthly income logging
- Per-month earnings tracking
- Income history and management
- Earnings vs expenses insights

### 📊 Core Features
- **Expense Tracking** — Add, edit, delete expenses with categories
- **Subscription Management** — Auto-generates monthly expenses from subscriptions
- **Monthly Summary** — Charts, insights, and table view
- **CSV Export** — Download monthly expense reports
- **Financial Insights** — Rule-based smart insights per month
- **Multi-Currency** — 30+ currencies supported

### 🔐 Authentication
- Email + Password signup/login
- Google OAuth
- JWT sessions
- Protected routes

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | ShadCN UI + Radix UI |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | Auth.js v5 |
| Charts | Recharts |
| Animations | Framer Motion |
| State | Zustand |
| Toasts | Sonner |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- Google OAuth credentials

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/moneyflow.git
cd moneyflow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root:

```env
# Database
DATABASE_URL="your-neon-postgresql-connection-string"

# Auth
AUTH_SECRET="your-auth-secret"
NEXTAUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST=true

# Google OAuth
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
```

Generate `AUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 4. Set up the database

```bash
npx prisma db push
npx prisma generate
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```txt
moneyflow/
├── app/
│   ├── (auth)/           # Login, Signup pages
│   ├── (protected)/      # Dashboard, Setup, Profile
│   └── api/auth/         # Auth.js route handler
│
├── actions/              # Server Actions
│   ├── auth.ts
│   ├── expenses.ts
│   ├── income.ts
│   ├── profile.ts
│   ├── setup.ts
│   ├── subscriptions.ts
│   └── summary.ts
│
├── components/
│   ├── expenses/         # Expense components
│   ├── income/           # Income components
│   ├── layout/           # Navbar
│   ├── shared/           # Reusable components
│   ├── subscriptions/    # Subscription components
│   └── ui/               # ShadCN components
│
├── lib/
│   ├── auth.ts           # Auth.js config
│   ├── csv.ts            # CSV export utility
│   ├── currency.ts       # Currency list + helper
│   ├── db.ts             # Prisma client
│   └── insights.ts       # Financial insights engine
│
├── prisma/
│   └── schema.prisma     # Database schema
│
├── store/
│   └── monthStore.ts     # Zustand month state
│
└── types/
    └── next-auth.d.ts    # Auth type extensions
```

---

## 🗄 Database Schema

```prisma
User          - Account info, currency, income type
Income        - Primary/secondary income sources
Expense       - Monthly expenses with categories
Subscription  - Recurring subscriptions
Account       - OAuth accounts (Auth.js)
Session       - User sessions (Auth.js)
```

---

## 🌍 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

| Key | Description |
|-----|-------------|
| `DATABASE_URL` | Neon PostgreSQL pooled connection string |
| `AUTH_SECRET` | Random secret for Auth.js |
| `NEXTAUTH_URL` | Your production URL |
| `AUTH_TRUST_HOST` | Set to `true` |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |

---

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/login` | Login page |
| `/signup` | Signup page |
| `/setup` | First-time setup |
| `/setup-username` | Google OAuth username setup |
| `/dashboard` | Expenses dashboard |
| `/dashboard/income` | Income management (Freelancer) |
| `/dashboard/subscriptions` | Subscription management |
| `/dashboard/summary` | Monthly summary + charts |
| `/dashboard/profile` | Profile settings |
| `/dashboard/credentials` | Change password |

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | Deep Indigo (`#4f46e5`) |
| Accent | Emerald Green (`#10b981`) |
| Danger | Soft Red (`#ef4444`) |
| Background | Dark Slate (`#020617`) |
| Style | Glassmorphism + Material Design |

---

## 📄 License

MIT License — feel free to use this project for personal or commercial purposes.

---

## 🙏 Acknowledgements

Built with ❤️ using Next.js, Prisma, Auth.js, ShadCN UI, and Recharts.