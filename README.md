# TerraLink Admin Console

A modern vanilla JavaScript admin dashboard for the TerraLink microfinance platform. Built with HTML, CSS, and vanilla JS, connected to a real ASP.NET Core backend API.

## Screens

- **Dashboard** — Portfolio KPIs, collection progress, action items, activity feed
- **Borrowers** — Client directory with KYC status, search, filters, and registration
- **Loan Officers** — Staff directory with capacity bars, performance ratings, and registration
- **Loans** — Active facilities, status filters, new loan applications
- **Repayments** — Payment ledger, M-Pesa tracking, record payment modal
- **Audit Logs** — Compliance trail with filters and detail inspector
- **Reports** — PAR metrics, regional exposure, sectoral allocation, arrears analysis
- **Settings** — Risk policy configuration and design system color tokens

## Getting Started

1. Start the API:
   ```sh
   cd /home/jon/dev/school/TerraLink.Api/TerraLink.Api
   dotnet run
   ```

2. Open `login.html` in your browser (or serve via HTTP):
   ```sh
   python3 -m http.server 3000
   ```

3. Sign in with an Admin account. The default API base is `http://localhost:5031`.

## Architecture

- `index.html` — App shell (sidebar, header, main content area)
- `login.html` — Authentication entry point
- `css/style.css` — Complete design system (modern warm admin theme)
- `js/config.js` — API base URL and constants
- `js/api.js` — Fetch wrapper with JWT auth and download helpers
- `js/auth.js` — JWT token management
- `js/store.js` — Client-side state
- `js/ui.js` — Modals, toasts, formatters
- `js/router.js` — Hash-based SPA router
- `js/pages/*.js` — Individual page modules with real API integration

## Features

- **Real API integration** for all CRUD operations
- **Working exports** (CSV downloads for borrowers, loans, repayments, audit logs)
- **Admin can register loan officers** via the Officers page
- **New borrower registration** modal
- **New loan application** modal with client and product selectors
- **KYC verification** for borrowers
- **Loan detail view** with repayment progress
- **Audit log detail inspector** with cryptographic payload view
- **Toast notifications** for all actions
- **Responsive layout** with mobile sidebar support

## Configuration

Edit `js/config.js` to change the API base URL:

```js
window.TERRA.config = {
  apiBase: 'http://localhost:5031'
};
```