# ShopZone Frontend

Production-ready ecommerce frontend built with React, Vite, Tailwind CSS, Zustand, Axios, Framer Motion, and WebSocket (STOMP).

## Features

- Product browsing with search, filters, pagination, dark mode
- Cart, Wishlist, Checkout with COD & Razorpay
- Auth: Login, Register, JWT refresh, Forgot/Reset password, OTP, Google login
- Profile, Addresses, Order tracking timeline, Invoice download
- Reviews & ratings, Real-time notifications
- Admin dashboard with analytics, order & product management

## Quick Start

```bash
cp .env.example .env
npm install
npm run dev
```

App runs at http://localhost:5173

## Demo Accounts

| Role  | Email               | Password  |
|-------|---------------------|-----------|
| Admin | admin@shopzone.com  | admin123  |
| User  | user@shopzone.com   | user123   |

## Docker

```bash
docker build -t shopzone-frontend .
docker run -p 80:80 shopzone-frontend
```

## Environment Variables

| Variable       | Default                      |
|----------------|------------------------------|
| VITE_API_URL   | http://localhost:8080/api    |
| VITE_WS_URL    | http://localhost:8080/ws     |
