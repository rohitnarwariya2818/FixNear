# FixNear

FixNear is a local service booking platform that connects customers with nearby service professionals. Customers can find providers, request and manage bookings, respond to quotations, and leave reviews. Providers can manage their profiles and bookings, submit quotations, and verify UPI payments.

## Project structure

```text
.
├── backend/          Express API, MongoDB models, controllers, and routes
└── FE/m-p/           React + Vite web application
```

## Tech stack

- **Frontend:** React 19, React Router, Vite, Tailwind CSS, Axios, Lucide
- **Backend:** Node.js, Express 5, Mongoose, Passport Local, express-session
- **Database:** MongoDB
- **Profile images:** Cloudinary

## Prerequisites

- Node.js and npm
- MongoDB running locally
- A Cloudinary account for account/provider image uploads

The API currently connects to `mongodb://127.0.0.1:27017/Fixnear`, listens on port `3000`, and allows browser requests from `http://localhost:5173`. These values are set in `backend/server.js`.

## Getting started

Run the backend and frontend in separate terminals from the repository root.

### 1. Configure the backend

Create `backend/.env` with your Cloudinary credentials:

```dotenv
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Cloudinary settings are needed for profile image uploads. The server loads this file on startup.

### 2. Start MongoDB

Start your local MongoDB service and make sure the database server is reachable at `127.0.0.1:27017`. Mongoose creates/uses the `Fixnear` database and its collections.

### 3. Install dependencies and start the API

```powershell
cd backend
npm install
node server.js
```

The API starts at `http://localhost:3000` after it connects to MongoDB. The backend package does not currently define a `start` or development script.

### 4. Install dependencies and start the web app

In a second terminal:

```powershell
cd FE/m-p
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The frontend Axios client calls `http://localhost:3000/api` and sends cookies for session-based authentication.

### Optional: enable UPI checkout

Create `FE/m-p/.env.local` and set the FixNear UPI ID:

```dotenv
VITE_FIXNEAR_UPI_ID=your-upi-id@bank
```

Restart Vite after changing environment variables. Without this setting, customers can still choose Cash on Delivery; UPI payment controls stay unavailable.

## Main application areas

- **Home and services:** browse the service marketplace and nearby professionals.
- **Authentication and profiles:** sign up or log in as a customer or provider, view and update profile details.
- **Bookings:** create bookings, view customer/provider booking lists, update booking status, cancel, and exchange quotations.
- **Payments:** choose Cash on Delivery or configure UPI; UPI transaction references are submitted for provider verification.
- **Reviews:** customers can review completed bookings and view provider reviews.

## API overview

All routes are prefixed with `/api` and return JSON unless an image upload is involved.

| Prefix | Routes | Purpose |
| --- | --- | --- |
| `/api/auth` | `POST /signup`, `POST /login`, `GET /me`, `GET /profile`, `PUT /profile`, `POST /logout` | Account registration, session login/logout, and current account profile. Signup also accepts the legacy misspelling `POST /singup`. |
| `/api/providers` | `POST /register`, `GET /`, `GET /providers`, `GET /profile/:providerId`, `PATCH /profile/:userId`, `GET /profile/:providerId/reviews`, `POST /:providerId/profile-image` | Provider registration, discovery, profile, reviews, and profile image upload. |
| `/api/customers` | `GET /profile/:userId`, `PUT /profile/:userId` | Customer profile read/update. |
| `/api/bookings` | `POST /`, `GET /customer/:customerId`, `GET /provider/:providerId`, `PATCH /:bookingId/status`, `PATCH /:bookingId/quotation`, `PATCH /:bookingId/quotation/respond`, `PATCH /:bookingId/cancel`, `POST /:bookingId/review`, `PATCH /:bookingId/payment/upi-reference`, `PATCH /:bookingId/payment/confirm` | Booking lifecycle, quotations, reviews, and payment status. |

For request body fields and response examples, see the route/controller implementations in `backend/routes/` and `backend/controllers/`. Image upload endpoints expect multipart form data with the field name `profileImage`.

## Useful frontend commands

Run from `FE/m-p/`:

```bash
npm run dev      # Start the Vite development server
npm run build    # Build the frontend into dist/
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint
```

## Notes

- Authentication uses Express sessions and Passport. Keep the browser's credentialed requests enabled when changing the API or frontend origin.
- The session secret is currently hard-coded in `backend/server.js`; configure a strong environment-based secret before deploying.
- API port, MongoDB URL, and CORS origin are also currently hard-coded in `backend/server.js`.
- Do not commit `backend/.env` or `FE/m-p/.env.local`; both may contain credentials or deployment-specific settings.
