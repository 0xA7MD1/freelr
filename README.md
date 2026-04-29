# Freelr

أدوات المال للمستقل وصاحب المشروع الصغير - Financial tools for freelancers and small business owners.

## Problem & Solution
Freelancers and small business owners often struggle with fragmented financial tracking, manual invoice management, and unpredictable cash flow. **Freelr** provides a centralized, Arabic-first platform to manage income, expenses, and clients while leveraging AI to provide actionable financial insights and cashflow forecasts.

## Key Features
- **Financial Dashboard**: Real-time overview of total income, expenses, net cashflow, and unpaid invoices with interactive charts.
- **Invoice Management**: Create and track invoices through their lifecycle (Draft, Sent, Paid, Overdue) with support for partial payments.
- **Expense Tracking**: Log business expenses, categorize them, and upload receipts for tax and record-keeping.
- **Client Management**: Simplified CRM to manage client details, contact information, and billing history.
- **AI Financial Analysis**: Analyze financial health and receive recommendations using Google Gemini integration.
- **Cashflow Forecasting**: AI-powered predictions of future liquidity and risk alerts for potential shortfalls.
- **Arabic-First UI**: Fully localized RTL interface using IBM Plex Sans Arabic for optimal readability.
- **Demo Mode**: Built-in fallback to mock data when no backend API is configured, allowing for immediate exploration.

## Tech Stack
| Category | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js 15.4.9 (App Router) |
| **UI Library** | React 19.2.1 |
| **Styling** | Tailwind CSS 4.1.11 |
| **State Management** | React Context (Auth) |
| **Charts** | Recharts 3.8.1 |
| **Icons** | Lucide React |
| **Components** | Shadcn UI (Radix UI based) |
| **Forms** | React Hook Form + Zod |
| **Animations** | Framer Motion (motion) |
| **Date Handling** | date-fns |

## Architecture Overview
The project follows a modern Next.js architecture:
- **Client-Side Rendering**: Most interactive features are "use client" components for a responsive SPA feel.
- **API Client**: A centralized `apiRequest` wrapper in `src/lib/api/client.ts` handles JWT authentication, error mapping (Arabic), and automatic "demo mode" fallback.
- **Authentication**: JWT-based auth flow managed via `AuthContext` with persistent storage of tokens and business identifiers.
- **Data Fetching**: Custom `useFetch` hook handles loading states, error handling, and basic caching.
- **AI Integration**: Proxies requests to Google Gemini for financial analysis and forecasting.

## API Endpoints
All endpoints are prefixed with `/api/v1/` by default.

| Method | Path | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/auth/login` | Authenticate user and return JWT | No |
| POST | `/auth/register` | Create a new user account | No |
| GET | `/auth/profile` | Get current user details | Yes |
| GET | `/business` | Fetch business details by owner ID | Yes |
| POST | `/business` | Register a new business | Yes |
| GET | `/clients` | List all clients for a business | Yes |
| POST | `/clients` | Create a new client | Yes |
| GET | `/invoices` | List all invoices for a business | Yes |
| POST | `/invoices` | Create a new invoice | Yes |
| POST | `/invoices/{id}/payment` | Record a payment for an invoice | Yes |
| GET | `/expenses` | List business expenses | Yes |
| POST | `/expenses` | Log a new expense | Yes |
| POST | `/expenses/{id}/receipt` | Upload a receipt image | Yes |
| GET | `/dashboard/overview` | Get financial KPIs and alerts | Yes |
| POST | `/forecast/generate` | Generate AI cashflow forecast | Yes |
| POST | `/ai/analyze` | Run deep financial analysis | Yes |

## Database Schema (Data Models)
The system operates on the following core data entities (inferred from API types):

| Table/Model | Key Columns |
| :--- | :--- |
| **User** | `id`, `firstName`, `lastName`, `email`, `passwordHash`, `role` |
| **Business** | `id`, `ownerId`, `name`, `industry`, `currency`, `logoUrl`, `address` |
| **Client** | `id`, `businessId`, `fullName`, `email`, `phone`, `company` |
| **Invoice** | `id`, `businessId`, `clientId`, `invoiceNumber`, `status`, `total`, `dueDate` |
| **Expense** | `id`, `businessId`, `amount`, `categoryId`, `expenseDate`, `receiptUrl` |
| **Income** | `id`, `businessId`, `amount`, `source`, `incomeDate`, `categoryId` |

## Environment Variables
Create a `.env.local` file with the following variables:

| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API key for AI features (Server-only). |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the backend API (e.g., `https://api.freelr.com`). |
| `APP_URL` | The public URL where the application is hosted. |

## Installation & Setup
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd freelr
   ```
2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```
3. **Configure Environment**:
   Copy `.env.example` to `.env.local` and fill in the required keys.
4. **Run Development Server**:
   ```bash
   npm run dev
   ```
5. **Build for Production**:
   ```bash
   npm run build
   ```

## Folder Structure
```text
src/
├── app/                  # Next.js App Router (pages & layouts)
│   ├── (dashboard)/      # Protected dashboard routes
│   │   ├── ai/           # AI Analysis & Insights
│   │   ├── alerts/       # Liquidity & Financial alerts
│   │   ├── clients/      # Client management
│   │   ├── expenses/     # Expense tracking & receipts
│   │   ├── forecasts/    # Cashflow forecasting
│   │   ├── home/         # Main dashboard overview
│   │   ├── income/       # Income & revenue tracking
│   │   ├── invoices/     # Invoice creation & management
│   │   └── profile/      # User & Business settings
│   ├── components/       # Layout components (Sidebar, Topbar)
│   ├── onboarding/       # Business setup flow
│   ├── login/            # Authentication pages
│   └── globals.css       # Global styles (Tailwind 4.0)
├── components/           # Shared reusable components
│   └── shared/
│       ├── auth/         # Auth-related UI (Login screens)
│       └── ui/           # Base UI kit (Button, Card, Input, etc.)
├── hooks/                # Generic React hooks (useMobile)
├── lib/                  # Core application logic
│   ├── api/              # API services (Axios-like wrapper & endpoints)
│   ├── auth/             # Auth context, JWT handling & storage
│   ├── hooks/            # Data fetching hooks (useFetch)
│   ├── validations/      # Zod schemas for form validation
│   └── utils.ts          # Tailwind merge & helper functions
└── ...
```

## Known Limitations / Stub Features
- **Demo Mode**: If `NEXT_PUBLIC_API_BASE_URL` is not provided, the app uses static mock data.
- **File Storage**: Receipt uploads depend on the backend API's implementation of `/receipt` endpoint.
- **AI Proxy**: The frontend expects a backend implementation for AI analysis; local server-side implementation is currently inferred.
- **Real-time**: Notifications are currently polled/fetched; WebSockets are not implemented in the current client.

## Authors
- **[A7MD](https://github.com/0xA7MD1)**: UI/UX Design, Folder Architecture, Theming, and Logo Branding.
- **[Rivan Jaradat](https://github.com/Rivanjaradat)**: API Integration (Frontend/Backend), UI Refinement, and Full-stack Development.
