# Stripe Product Checkout Express App

This is a minimal Node.js Express app for Stripe product-based checkout (one-time payment, not recurring). No user data is stored.

## Features

- Create Stripe checkout session for a product (one-time payment)
- Handle Stripe webhook for payment confirmation
- No database or user data storage

## Setup

1. Copy `.env.example` to `.env` and fill in your Stripe keys and product price ID.
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the server:
   ```powershell
   npm start
   ```

## Endpoints

- `POST /api/v1/payment/create-session` — Creates a Stripe checkout session for the product
- `POST /api/v1/payment/webhook` — Stripe webhook endpoint (set this in your Stripe dashboard)

## Environment Variables

- `STRIPE_SECRET_KEY` — Your Stripe secret key
- `STRIPE_PRODUCT_PRICE_ID` — Stripe price ID for your product
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `CLIENT_URL` — Your frontend URL
- `PORT` — Server port (default: 5000)

## Notes

- No user data is stored in this app.
- You must set up your Stripe product and price in the Stripe dashboard and use the price ID here.
