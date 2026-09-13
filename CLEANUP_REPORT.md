# Project Cleanup Audit Report

**Project**: `chapter10 airbnb`  
**Date**: September 13, 2026  
**Status**: Phase 1 Audit Complete — Awaiting User Approval before any Deletions.

---

### SAFE TO DELETE

#### 1. Unused npm Dependencies (`package.json`)
* **`supertest`** (`^7.0.0` in `devDependencies`): Not required or imported in any test file or application module. The test suite uses native Jest mocks and `supertest` is omitted.
* **`body-parser`** (`^2.2.0` in `dependencies`): Express 5 natively uses built-in `express.json()` and `express.urlencoded()` in `app.js`. `body-parser` is never imported or used.

#### 2. Unused Imports & Exports
* **`middleware/jwtAuth.js`**: Unused import `const User = require('../models/user');` on Line 2. `jwtAuth.js` authenticates via JWT payload, sessions, or Passport without querying the `User` model.
* **`config/razorpay.js`**: Unused export alias `getInstance: getRazorpayInstance` on Line 21. `controllers/paymentController.js` directly calls `razorpay.getRazorpayInstance()`.

#### 3. Obsolete / Commented-out Code
* **`views/input.css`**: Lines 3–5 contain commented-out legacy Tailwind v3 directives (`/* @tailwind base; */`, etc.) which have been superseded by `@import "tailwindcss";` in Tailwind v4.

---

### PROBABLY UNUSED

* **`data/backup-and-migrate-favourites.js`**: One-time database index migration script used to convert legacy favourites collection schema to compound `{ userId: 1, houseId: 1 }`. If migration is complete, this file is no longer needed at runtime.

---

### KEEP

The following core files are actively used and essential to the application:

#### Application Entry & Configuration
* [app.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/app.js) — Main Express application setup, session, passport, compression, and routes mounting.
* [package.json](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/package.json) & [package-lock.json](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/package-lock.json) — Project manifest and scripts.
* [nodemon.json](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/nodemon.json) — Server reload configuration.
* [tailwind.config.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/tailwind.config.js) — Tailwind CSS build configuration.
* [.env](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/.env) — Environment variables for DB, OAuth, and Razorpay keys.

#### Routes (`routes/`)
* [routes/authRouter.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/routes/authRouter.js) — Authentication & Google OAuth routes.
* [routes/experienceRouter.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/routes/experienceRouter.js) — Experiences routes.
* [routes/hostRouter.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/routes/hostRouter.js) — Host listing management routes.
* [routes/paymentRouter.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/routes/paymentRouter.js) — Razorpay payment creation, verification, and webhook routes.
* [routes/serviceRouter.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/routes/serviceRouter.js) — Services catalog routes.
* [routes/storeRouter.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/routes/storeRouter.js) — Store, wishlist, and booking routes.

#### Controllers (`controllers/`)
* [controllers/authController.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/controllers/authController.js) — Login, signup, logout, and Google callback logic.
* [controllers/errors.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/controllers/errors.js) — 404 Page Not Found handler.
* [controllers/experienceController.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/controllers/experienceController.js) — Experiences rendering and addition handlers.
* [controllers/hostController.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/controllers/hostController.js) — Host listing CRUD logic.
* [controllers/paymentController.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/controllers/paymentController.js) — Order creation, HMAC signature verification, and webhook processing.
* [controllers/serviceController.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/controllers/serviceController.js) — Services catalog grouping and rendering.
* [controllers/storeController.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/controllers/storeController.js) — Store pages, wishlist toggles, and booking management.

#### Middleware (`middleware/`)
* [middleware/is-auth.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/middleware/is-auth.js) — Session-based authentication guard.
* [middleware/jwtAuth.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/middleware/jwtAuth.js) — Multi-channel JWT / Session / OAuth authentication guard for API endpoints.

#### Models (`models/`)
* [models/booking.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/models/booking.js) — Booking schema with Razorpay payment fields.
* [models/experience.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/models/experience.js) — Experiences catalog schema.
* [models/favourite.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/models/favourite.js) — Compound unique wishlist schema.
* [models/home.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/models/home.js) — Homes listing schema with cascade deletion hooks.
* [models/paymentTransaction.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/models/paymentTransaction.js) — Idempotent payment audit transaction schema.
* [models/service.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/models/service.js) — Services catalog schema.
* [models/user.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/models/user.js) — User schema supporting passwords & Google OAuth.

#### Views & Partials (`views/`)
* [views/404.ejs](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/views/404.ejs) — Error page.
* [views/input.css](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/views/input.css) — Tailwind CSS source stylesheet.
* [views/auth/login.ejs](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/views/auth/login.ejs) — Login view.
* [views/auth/signup.ejs](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/views/auth/signup.ejs) — Signup view.
* [views/host/edit-home.ejs](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/views/host/edit-home.ejs) — Add/Edit home view.
* [views/host/host-home-list.ejs](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/views/host/host-home-list.ejs) — Host listings view.
* [views/partials/head.ejs](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/views/partials/head.ejs) — Shared head section with font & stylesheet links.
* [views/partials/nav.ejs](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/views/partials/nav.ejs) — Shared navbar and search drawer.
* [views/partials/footer.ejs](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/views/partials/footer.ejs) — Shared footer with tabbed destinations.
* [views/partials/favourite.ejs](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/views/partials/favourite.ejs) — Heart toggle form partial.
* [views/store/add-experience.ejs](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/views/store/add-experience.ejs) — Add experience view.
* [views/store/bookings.ejs](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/views/store/bookings.ejs) — My Trips / Bookings view.
* [views/store/experiences.ejs](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/views/store/experiences.ejs) — Experiences catalog view.
* [views/store/favourite-list.ejs](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/views/store/favourite-list.ejs) — Wishlist view.
* [views/store/home-detail.ejs](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/views/store/home-detail.ejs) — Property detail page with Razorpay Checkout integration.
* [views/store/home-list.ejs](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/views/store/home-list.ejs) — Full homes list view.
* [views/store/index.ejs](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/views/store/index.ejs) — Homepage view.
* [views/store/services.ejs](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/views/store/services.ejs) — Services catalog view.

#### Public Assets (`public/`)
* [public/home.css](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/public/home.css) — Primary custom application CSS stylesheet.
* [public/output.css](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/public/output.css) — Compiled Tailwind CSS stylesheet.

#### Utilities & Config (`utils/`, `config/`)
* [config/razorpay.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/config/razorpay.js) — Singleton Razorpay SDK instance initializer.
* [utils/jwtUtil.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/utils/jwtUtil.js) — JWT signing and verification utility.
* [utils/passport-config.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/utils/passport-config.js) — Passport Google OAuth strategy configuration.
* [utils/pathUtil.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/utils/pathUtil.js) — Root directory path helper.

#### Test Suite (`tests/`)
* [tests/favourite.test.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/tests/favourite.test.js) — Unit tests for wishlist isolation & toggle logic.
* [tests/payment.test.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/tests/payment.test.js) — Security test suite for Razorpay HMAC verification, idempotency, date range validation, and JWT authentication.

---

### INDIRECT/DYNAMIC REFERENCES

The following files are CLI utility scripts executed on demand for database initialization and seeding:

* [data/create-admin.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/data/create-admin.js) — CLI script to create/promote admin account (`adityyxx`).
* [data/seed-homes.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/data/seed-homes.js) — CLI script to populate sample properties.
* [data/seed-experiences.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/data/seed-experiences.js) — CLI script to populate sample experiences.
* [data/seed-services.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/data/seed-services.js) — CLI script to populate sample services.
* [data/seed-bookings.js](file:///c:/Users/HP/Desktop/New%20folder/chapter10%20airbnb/data/seed-bookings.js) — CLI script to populate sample bookings.
* **`storeController.postAddBooking`** in `controllers/storeController.js`: POST handler for `/bookings` acting as a fallback redirect.

---

### DUPLICATES

* **No duplicate files, duplicate controllers, duplicate models, or duplicate function definitions exist** in the project.

---

### DEPENDENCY AUDIT TABLE

| Package | Used? | Where? | Action |
|---------|-------|--------|--------|
| `@tailwindcss/cli` | Yes | `package.json` scripts (`tailwind`, `build`) | **Keep** |
| `autoprefixer` | Yes | PostCSS / Tailwind build pipeline | **Keep** |
| `bcryptjs` | Yes | `controllers/authController.js`, `data/create-admin.js` | **Keep** |
| `body-parser` | **No** | Express 5 native body parsers used in `app.js` | **Remove from package.json** |
| `compression` | Yes | `app.js` response compression middleware | **Keep** |
| `connect-mongodb-session` | Yes | `app.js` MongoDB session store | **Keep** |
| `dotenv` | Yes | `app.js`, `config/razorpay.js`, `utils/jwtUtil.js`, `utils/passport-config.js` | **Keep** |
| `ejs` | Yes | Express view engine (`app.js`) | **Keep** |
| `express` | Yes | Core HTTP web framework (`app.js`, `routes/`) | **Keep** |
| `express-session` | Yes | Session management (`app.js`) | **Keep** |
| `jsonwebtoken` | Yes | `utils/jwtUtil.js`, `middleware/jwtAuth.js` | **Keep** |
| `mongodb` | Yes | Mongoose & `connect-mongodb-session` driver | **Keep** |
| `mongoose` | Yes | Database models, controllers, data scripts, tests | **Keep** |
| `passport` | Yes | `app.js`, `routes/authRouter.js`, `utils/passport-config.js` | **Keep** |
| `passport-google-oauth20` | Yes | Google OAuth Strategy in `utils/passport-config.js` | **Keep** |
| `postcss` | Yes | CSS compilation tool | **Keep** |
| `razorpay` | Yes | `config/razorpay.js`, `controllers/paymentController.js` | **Keep** |
| `tailwindcss` | Yes | CSS styling framework | **Keep** |
| `jest` (dev) | Yes | `package.json` test runner script (`npm test`) | **Keep** |
| `nodemon` (dev) | Yes | `nodemon.json` dev server runner | **Keep** |
| `supertest` (dev) | **No** | Test suite uses Jest mocks directly | **Remove from package.json** |
