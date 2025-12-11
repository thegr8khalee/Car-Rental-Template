# Car Rental Transformation Plan

This document outlines the steps to transform the current Car Dealership web application into a fully functional Car Rental platform with multi-payment gateway support (Stripe, Flutterwave, Paystack).

## 1. Backend Architecture Updates

### 1.1. Database Schema Changes
We need to introduce new models to handle rentals and payments.

#### **New Model: `Rental`**
*   **Purpose:** Tracks car rental bookings.
*   **Fields:**
    *   `id` (UUID)
    *   `userId` (Foreign Key -> User)
    *   `carId` (Foreign Key -> Car)
    *   `startDate` (Date)
    *   `endDate` (Date)
    *   `totalCost` (Decimal)
    *   `status` (Enum: 'pending', 'confirmed', 'active', 'completed', 'cancelled')
    *   `paymentStatus` (Enum: 'pending', 'paid', 'failed', 'refunded')
    *   `paymentMethod` (Enum: 'stripe', 'flutterwave', 'paystack')
    *   `transactionReference` (String - ID from the payment gateway)

#### **Update Model: `Car`**
*   **Add Fields:**
    *   `dailyRate` (Decimal) - Cost per day to rent.
    *   `isAvailable` (Boolean) - Global availability switch.
    *   `status` (Enum: 'available', 'rented', 'maintenance') - Current status.

### 1.2. New Dependencies
Install the following packages in `backend/`:
*   `stripe`
*   `flutterwave-node-v3`
*   `paystack-api` (or `axios` for direct API calls)

### 1.3. API Endpoints
Create `RentalController` and `PaymentController`.

*   **Rentals:**
    *   `POST /api/rentals/check-availability` - Check if a car is available for dates.
    *   `POST /api/rentals` - Create a new rental booking (initially 'pending').
    *   `GET /api/rentals/my-rentals` - User's rental history.
    *   `GET /api/admin/rentals` - Admin view of all rentals.

*   **Payments:**
    *   `POST /api/payments/create-intent` (Stripe)
    *   `POST /api/payments/initiate` (Flutterwave/Paystack)
    *   `POST /api/payments/webhook/:provider` - Handle async payment confirmations.

## 2. Frontend Updates

### 2.1. Car Details Page
*   Replace "Buy Now" / "Contact Seller" with **"Rent Now"**.
*   Display `dailyRate`.
*   Add a **Date Range Picker** to select start and end dates.
*   Calculate and display **Total Cost** based on selected dates.

### 2.2. Checkout / Booking Flow
1.  **Review:** Show Car, Dates, Total Price.
2.  **Payment Method:** Allow user to select Stripe, Flutterwave, or Paystack.
3.  **Payment Entry:**
    *   **Stripe:** Embedded Elements form.
    *   **Flutterwave/Paystack:** Redirect or Modal popup.
4.  **Confirmation:** Success page showing Booking ID.

### 2.3. User Dashboard
*   Add "My Rentals" tab to view active and past rentals.

## 3. Implementation Steps

### Phase 1: Backend Foundation
1.  Install dependencies.
2.  Create `Rental` model and update `Car` model.
3.  Run database migrations/sync.
4.  Implement `RentalService` for availability checking and booking creation.

### Phase 2: Payment Integration (Backend)
1.  Set up `PaymentService` with modular strategies for Stripe, Flutterwave, and Paystack.
2.  Implement endpoints to initiate payments.
3.  Implement webhook handlers to update `Rental` status to 'confirmed' upon successful payment.

### Phase 3: Frontend Integration
1.  Update `CarCard` and `CarDetails` components to show rental info.
2.  Build the Booking Wizard (Dates -> Summary -> Payment).
3.  Integrate client-side payment libraries (`@stripe/react-stripe-js`, `react-flutterwave`, `react-paystack`).

### Phase 4: Admin & Testing
1.  Update Admin Dashboard to view/manage rentals.
2.  Test full flow for each payment gateway.

## 4. Environment Variables
You will need to add these to your `.env` file:

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
