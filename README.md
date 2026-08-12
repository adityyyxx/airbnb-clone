# Airbnb Clone — Property Booking Platform

A full-stack Airbnb-style property booking platform built using **Node.js**, **Express**, **MongoDB**, and **EJS**. Users can browse properties, explore categories and experiences, select booking dates, manage wishlists, and reserve accommodations through a secure, end-to-end checkout flow.

---

## 📌 Project Overview

I built an Airbnb-style property booking platform using Node.js, Express, MongoDB, and EJS. Users can browse properties, select dates, and create bookings.

The major enhancement I implemented was a secure Razorpay payment workflow. The backend calculates the booking amount from database prices instead of trusting the client, creates a Razorpay order, and uses webhooks with HMAC signature verification to confirm payments.

I also implemented idempotency to prevent duplicate payment/order processing during retries, database transactions to maintain consistency when multiple operations are involved, and authentication/authorization to protect booking data.

I wrote tests for important payment scenarios such as signature verification and duplicate webhook handling. I also optimized database queries, indexing, image loading, and responsive mobile performance.

---

## 🚀 Key Features & Enhancements

### 1. 💳 Secure Razorpay Payment Workflow
* **Server-Side Price Calculation**: All pricing, fees, and total amounts are computed server-side directly from verified MongoDB records to eliminate client-side price tampering.
* **HMAC-SHA256 Signature Verification**: Payment callbacks and webhook events authenticate payload integrity using cryptographic HMAC signatures (`crypto.createHmac`).
* **Idempotency Safeguards**: Built-in tracking ensures that duplicate webhook deliveries, payment confirmations, or retry requests do not cause double-charging or duplicate bookings.
* **ACID Transactions**: Critical multi-document operations (booking creation, payment log updates) leverage MongoDB sessions and transactions for data consistency.

### 2. 🔐 Authentication & Access Control
* **Session & Password Security**: Secure session storage with MongoDB store (`connect-mongodb-session`), password hashing via `bcryptjs`, and Google OAuth 2.0 integration via `passport`.
* **Route Protection**: Modular authorization middlewares protect user-specific bookings (Trips), wishlists, and host listing management.

### 3. ⚡ High-Performance Architecture
* **Parallel Query Execution**: Utilizes `Promise.all` for concurrent database fetches across independent collections (e.g., Homes and Favourites), reducing server response latency (TTFB).
* **Database Compound Indexing**: Optimized MongoDB schemas with compound indexes (e.g., `{ userId: 1, createdAt: -1 }` on `Booking`) for instant queries and sorting.
* **Modern Asset Loading**: Offscreen images utilize `loading="lazy"` and `decoding="async"`, with `fetchpriority="high"` on critical hero images to eliminate Cumulative Layout Shift (CLS) and optimize Largest Contentful Paint (LCP).
* **Script Deferral**: Payment SDKs and heavy third-party scripts are asynchronously deferred to keep the main thread responsive.

### 4. 🎨 Responsive UI & Aesthetics
* **Dynamic Navigation**: Sticky, glassmorphic navbar with adaptive transparency on scroll and curved pink pill category buttons (**Homes**, **Experiences**, **Services**).
* **Cross-Device Fluidity**: Dedicated mobile touch snapping, clean horizontal scrollbars, and fluid layout scaling across phones, tablets, and desktops.

### 5. 🧪 Automated Testing
* Automated test coverage with **Jest** and **Supertest** for mission-critical payment workflows:
  * Order creation validation
  * Webhook HMAC signature verification (valid & forged signatures)
  * Duplicate webhook idempotency handling
  * Unauthorized access prevention

---

## 🛠️ Tech Stack

* **Backend**: Node.js, Express.js (v5)
* **Database & ODM**: MongoDB, Mongoose
* **Template Engine**: EJS
* **Styling**: Vanilla CSS (Custom Design System) & Tailwind CSS
* **Authentication**: Passport.js (Google OAuth 2.0), Express Session, Bcrypt.js
* **Payments**: Razorpay Node SDK, Webhooks, Crypto HMAC
* **Testing**: Jest, Supertest

---

## 📂 Project Structure

```
├── config/             # Database & environment configurations
├── controllers/        # Route controllers (store, host, auth, payment)
├── middleware/         # Auth, validation, and session middlewares
├── models/             # Mongoose schemas (Home, User, Booking, Favourite)
├── public/             # Static assets, CSS stylesheets, images, client scripts
├── routes/             # Express route definitions
├── tests/              # Jest/Supertest automated test suites
├── views/              # EJS dynamic templates and reusable partials
├── app.js              # Express application entry point & middleware setup
└── package.json        # Dependencies and project scripts
```

---

## ⚙️ Getting Started

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd chapter10-airbnb
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

### 3. Run the Application
```bash
# Start the application
npm start

# Run tests
npm test
```

Access the application in your browser at `http://localhost:3000`.
