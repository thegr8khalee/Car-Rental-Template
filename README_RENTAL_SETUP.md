# Car Rental Setup Instructions

## 1. Environment Variables

### Backend (.env)
Add the following keys to your `backend/.env` file:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Flutterwave
FLW_PUBLIC_KEY=FLWPUBK_...
FLW_SECRET_KEY=FLWSECK_...
FLW_ENCRYPTION_KEY=...

# Paystack
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
```

### Frontend (.env)
Add the following keys to your `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5000
```

## 2. Database Setup
Run the following command in the `backend` directory to update the database schema:

```bash
cd backend
npm run db:setup
```

## 3. Running the App
Start both backend and frontend:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 4. Features
*   **Rent Now:** Go to any car details page to see the "Rent Now" wizard.
*   **My Rentals:** View your booking history at `/my-rentals`.
*   **Payments:** Supports Stripe, Flutterwave, and Paystack.
