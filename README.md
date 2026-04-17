# Ecommerce Admin Panel

A production-ready admin panel for managing the ecommerce platform — banners, categories, tags, and products.

## Live Demo

- **Admin Panel**: https://ecommerce-admin-psi-sand.vercel.app/
- **Backend API**: https://ecom-x1j4.onrender.com

## Related Projects

- [Backend API](https://github.com/ragesh-j/Ecommerce)
- [Customer App](https://github.com/ragesh-j/Ecommerce-customer)
- [Seller Dashboard](https://github.com/ragesh-j/Ecommerce-seller)

---

## Features

- 🔐 Admin-only authentication with JWT
- 🖼️ Banner management with image upload to Cloudflare R2
- 🗂️ Category management with subcategories
- 🏷️ Tag management and assignment to products
- ⭐ Toggle featured products
- 📊 Overview of platform content

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| State Management | Redux Toolkit |
| Server State | TanStack React Query |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running (see [Ecommerce Backend](https://github.com/ragesh-j/Ecommerce))

### Installation

```bash
git clone https://github.com/ragesh-j/Ecommerce-admin.git
cd Ecommerce-admin
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

### Development

```bash
npm run dev
```

App runs at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

---

## Default Admin Credentials

```
Email: admin@example.com
Password: admin123
```

> Change the password after first login in production.

---

## Project Structure

```
src/
├── app/              # Redux store and hooks
├── features/
│   └── auth/         # Auth slice (token, user)
├── pages/            # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Banners.tsx
│   ├── Categories.tsx
│   ├── Tags.tsx
│   └── Products.tsx
├── components/
│   ├── Layout.tsx
│   └── ProtectedRoute.tsx
├── services/         # API service functions
└── hooks/            # Custom hooks (useRefreshOnLoad)
```

---

## Authentication

- Email/password login (ADMIN role only)
- Access token stored in memory (Redux)
- Refresh token in httpOnly cookie
- Auto token refresh on page load
- Role check on refresh — non-admin users are logged out automatically

---

## Deployment

Deployed on **Vercel** with automatic deployments from GitHub.

**Environment Variables on Vercel:**
```
VITE_API_URL=https://ecom-x1j4.onrender.com/api/v1
```
